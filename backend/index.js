import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import twilio from "twilio";

dotenv.config();

/* ================= TWILIO ================= */
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const app = express();
app.use(express.json());

/* ================= CORS ================= */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

/* ================= SERVICES ================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY);

/* ================= TEST MODE ================= */
const TEST_MODE = false;

/* ═══════════════════════════════════════════════════════════════════════
   PACK CONFIG
   ─────────────────────────────────────────────────────────────────────
   packType      | label                  | soaps/box | price/box | MRP/box
   ─────────────────────────────────────────────────────────────────────
   NORMAL        | Starter Pack           | 1         | ₹300      | —
   HALF_YEAR     | Value Pack             | 3         | ₹600      | ₹900
   ANNUAL        | Bumper Pack            | 6         | ₹900      | ₹1800
   RED_SANDAL    | Red Sandal Premium Kit | 14 items  | ₹50000    | —  (flat, 1 kit)
   ═══════════════════════════════════════════════════════════════════════ */

const PACK_CONFIG = {
  NORMAL:     { label: "Starter Pack",           soapsPerBox: 1,  pricePerBox: TEST_MODE ? 1 : 300,   mrpPerBox: null,  isKit: false },
  HALF_YEAR:  { label: "Value Pack",             soapsPerBox: 3,  pricePerBox: TEST_MODE ? 1 : 600,   mrpPerBox: 900,   isKit: false },
  ANNUAL:     { label: "Bumper Pack",            soapsPerBox: 6,  pricePerBox: TEST_MODE ? 1 : 900,   mrpPerBox: 1800,  isKit: false },
  RED_SANDAL: { label: "Red Sandal Premium Kit", soapsPerBox: 14, pricePerBox: TEST_MODE ? 1 : 50000, mrpPerBox: null,  isKit: true  },
};

function getPackageDetails(boxes, packType) {
  const cfg = PACK_CONFIG[packType] || PACK_CONFIG.NORMAL;

  if (cfg.isKit) {
    return {
      label:   cfg.label,
      soaps:   cfg.soapsPerBox,
      price:   cfg.pricePerBox,
      mrp:     null,
      savings: 0,
      isKit:   true,
    };
  }

  const count   = Array.isArray(boxes) ? boxes.length : 1;
  const price   = cfg.pricePerBox * count;
  const mrp     = cfg.mrpPerBox   ? cfg.mrpPerBox * count : null;
  const savings = mrp             ? mrp - price            : 0;

  return {
    label:   cfg.label,
    soaps:   cfg.soapsPerBox * count,
    price,
    mrp,
    savings,
    isKit:   false,
  };
}

/* ================= CUSTOMER NORMALISER ================= */
function normaliseCustomer(body) {
  if (body.customer && typeof body.customer === "object") {
    const c = body.customer;
    return {
      fullName: c.name    || c.fullName || "Customer",
      mobile:   c.phone   || c.mobile   || "",
      email:    c.email   || "",
      houseNo:  c.houseNo || "",
      street:   c.street  || "",
      city:     c.city    || "",
      pincode:  c.pincode || "",
      address:  c.address || [c.houseNo, c.street, c.city, c.pincode].filter(Boolean).join(", "),
    };
  }
  return {
    fullName: body.fullName || "Customer",
    mobile:   body.mobile   || "",
    email:    body.email    || "",
    houseNo:  body.houseNo  || "",
    street:   body.street   || "",
    city:     body.city     || "",
    pincode:  body.pincode  || "",
    address:  [body.houseNo, body.street, body.city, body.pincode].filter(Boolean).join(", "),
  };
}

/* ══════════════════════════════════════════════════════════════════════
   AUTO-RELEASE RESERVED BOXES
══════════════════════════════════════════════════════════════════════ */
async function releaseExpiredReservations() {
  try {
    const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // FIX: Also release boxes where reserved_at IS NULL (stuck reservations)
    // These are legacy rows that were reserved without a timestamp
    const { data: expiredBoxes, error: fetchErr } = await supabase
      .from("grid_boxes")
      .select("box_number, reserved_at")
      .eq("status", "reserved")
      .or(`reserved_at.is.null,reserved_at.lt.${cutoff}`);

    if (fetchErr) {
      console.error("Auto-release fetch error:", fetchErr.message);
      return;
    }

    if (!expiredBoxes || expiredBoxes.length === 0) return;

    const boxNumbers = expiredBoxes.map(b => b.box_number);

    const { error: updateErr } = await supabase
      .from("grid_boxes")
      .update({ status: "available", reserved_at: null })
      .in("box_number", boxNumbers);

    if (updateErr) {
      console.error("Auto-release update error:", updateErr.message);
    } else {
      console.log(`⏳ Auto-released ${boxNumbers.length} expired/stuck reserved box(es): [${boxNumbers.join(", ")}]`);
    }
  } catch (err) {
    console.error("Auto-release error:", err.message);
  }
}

releaseExpiredReservations();
setInterval(releaseExpiredReservations, 60_000);

/* ══════════════════════════════════════════════════════════════════════
   ROUTES
══════════════════════════════════════════════════════════════════════ */

app.get("/", (req, res) => {
  res.json({ status: "OK", service: "Diya Soaps Backend", version: "2.1" });
});

app.get("/members", async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from("members")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error.message);
      return res.status(500).json({ success: false, message: "Unable to fetch members" });
    }

    return res.status(200).json({ success: true, total: count || data.length, data });
  } catch (err) {
    console.error("Server Error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/grid-status", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("grid_boxes")
      .select("box_number, status, reserved_at, booked_at")  // ✅ only existing columns
      .order("box_number", { ascending: true });

    if (error) return res.status(500).json({ success: false, message: error.message });

    const booked    = data.filter(d => d.status === "booked").length;
    const reserved  = data.filter(d => d.status === "reserved").length;
    const available = data.filter(d => d.status === "available").length;

    return res.json({ success: true, boxes: data, stats: { booked, reserved, available, total: data.length } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/send-contact-mail", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success: false, message: "Name, Email, and Message are required" });

    const { error } = await supabase.from("contact_messages").insert({
      name, email, phone, message, created_at: new Date().toISOString(),
    });
    if (error) return res.status(500).json({ success: false, message: "Failed to save message" });

    await resend.emails.send({
      from:    "Diya Soaps <support@diyasoaps.com>",
      to:      "diyasoapbusiness@gmail.com",
      subject: "New Contact Message",
      html: `<h2>New Contact Message</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone || "N/A"}</p><p><b>Message:</b></p><p>${message}</p>`,
    });

    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

app.post("/create-order", async (req, res) => {
  try {
    const { boxes, packType } = req.body;

    if (!packType) return res.status(400).json({ success: false, message: "packType is required" });
    if (!PACK_CONFIG[packType]) return res.status(400).json({ success: false, message: `Unknown packType: ${packType}` });

    const pkg = getPackageDetails(boxes, packType);

    const order = await razorpay.orders.create({
      amount:   pkg.price * 100,
      currency: "INR",
      receipt:  "order_" + Date.now(),
      notes: {
        packType,
        boxes:      Array.isArray(boxes) ? boxes.join(",") : "",
        totalSoaps: pkg.soaps,
        totalPrice: pkg.price,
      },
    });

    console.log(`📦 Order created | packType=${packType} | boxes=${JSON.stringify(boxes)} | soaps=${pkg.soaps} | amount=₹${pkg.price} | orderId=${order.id}`);

    res.json({
      ...order,
      packDetails: {
        label:   pkg.label,
        soaps:   pkg.soaps,
        price:   pkg.price,
        mrp:     pkg.mrp,
        savings: pkg.savings,
      },
    });
  } catch (err) {
    console.error("Create Order Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

/* ─── Verify Payment ─── */
app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      boxes,
      packType,
      pack,
      orderId,
    } = req.body;

    const resolvedPackType = packType || pack || "NORMAL";
    const resolvedPackCfg  = PACK_CONFIG[resolvedPackType] || PACK_CONFIG.NORMAL;

    /* ── Validate ── */
    if (!razorpay_payment_id) return res.status(400).json({ success: false, message: "Payment ID missing" });
    if (!razorpay_signature)  return res.status(400).json({ success: false, message: "Signature missing" });
    if (!resolvedPackCfg.isKit && (!boxes || boxes.length === 0)) {
      return res.status(400).json({ success: false, message: "Boxes data missing" });
    }

    /* ── Normalise customer ── */
    const customer = normaliseCustomer(req.body);
    const pkg      = getPackageDetails(boxes, resolvedPackType);

    /* ── Verify Razorpay signature ── */
    const sigBody  = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sigBody)
      .digest("hex");

    if (expected !== razorpay_signature) {
      console.error("❌ Signature mismatch");
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    /* ── Mark grid boxes as booked ──
         FIX: Only update columns that actually exist in grid_boxes schema:
         id, box_number, reserved_at, booked_at, created_at, status
    ── */
    if (!resolvedPackCfg.isKit && Array.isArray(boxes) && boxes.length > 0) {
      // FIX: box_number is INTEGER in DB — always parse to int to avoid type mismatch
      const boxIntegers = boxes.map(b => parseInt(b, 10)).filter(n => !isNaN(n));
      console.log(`🔄 Marking boxes as booked: [${boxIntegers.join(", ")}]`);

      const { data: updatedBoxes, error: boxErr } = await supabase
        .from("grid_boxes")
        .update({
          status:      "booked",
          booked_at:   new Date().toISOString(),
          reserved_at: null,
        })
        .in("box_number", boxIntegers)
        .select("box_number");

      if (boxErr) {
        console.error("❌ Box update error:", boxErr.message);
      } else {
        console.log(`✅ Grid boxes marked booked: [${updatedBoxes?.map(b => b.box_number).join(", ") || "none"}]`);
        if (!updatedBoxes || updatedBoxes.length === 0) {
          console.warn("⚠️ No grid boxes updated — check box numbers match DB records");
        }
      }
    }

    /* ── Save member ──
         FIX: Only insert columns that exist in members schema:
         id, created_at, amount_paid, no_of_soaps, is_kit,
         house_no, street, city, pincode,
         payment_id, payment_status, order_id, package_type,
         box_number, full_name, email, mobile
    ── */
    const memberPayload = {
      // ✅ Core identity
      order_id:       orderId || razorpay_order_id || razorpay_payment_id,
      payment_id:     razorpay_payment_id,
      payment_status: "success",

      // ✅ Customer info
      full_name:  customer.fullName,
      email:      customer.email,
      mobile:     customer.mobile,
      house_no:   customer.houseNo,
      street:     customer.street,
      city:       customer.city,
      pincode:    customer.pincode,

      // ✅ Box / pack info
      box_number:   resolvedPackCfg.isKit ? "KIT" : (Array.isArray(boxes) ? boxes.join(", ") : ""),
      package_type: pkg.label,          // "Starter Pack" / "Value Pack" etc.
      no_of_soaps:  pkg.soaps,
      amount_paid:  pkg.price,
      is_kit:       resolvedPackCfg.isKit,

      // ✅ Timestamps
      created_at: new Date().toISOString(),

      // ❌ REMOVED fields not in schema:
      //    no_of_boxes, price_per_box, mrp_per_box, mrp_total, savings, pack_type
    };

    const { error: memberErr } = await supabase.from("members").insert(memberPayload);
    if (memberErr) {
      console.error("❌ Member insert error:", memberErr.message);
      // Still continue — payment already verified, don't fail the response
    } else {
      console.log(`✅ Member saved: ${customer.fullName}`);
    }

    console.log(`✅ Payment verified | orderId=${razorpay_payment_id} | pack=${resolvedPackType} | boxes=${JSON.stringify(boxes)} | soaps=${pkg.soaps} | amount=₹${pkg.price} | customer=${customer.fullName}`);

    /* ── Customer email ── */
    const boxesHtml = resolvedPackCfg.isKit
      ? `<p style="color:#dc2626;font-weight:bold;">Red Sandal Premium Kit — 14 Ayurvedic Products</p>`
      : (Array.isArray(boxes) ? boxes : [])
          .map(b => `<span style="background:#fde047;padding:8px 14px;margin:4px;border-radius:6px;font-weight:bold;display:inline-block">${String(b).padStart(3, "0")}</span>`)
          .join("");

    const priceBreakdownHtml = resolvedPackCfg.isKit
      ? `<p style="margin:4px 0"><b>Total:</b> <span style="color:#16a34a;font-size:18px;font-weight:900">₹${pkg.price.toLocaleString("en-IN")}</span></p>`
      : `
        <p style="margin:4px 0"><b>Boxes:</b> ${Array.isArray(boxes) ? boxes.length : 1} × ${resolvedPackCfg.soapsPerBox} soaps = ${pkg.soaps} soaps total</p>
        <p style="margin:4px 0"><b>Price/box:</b> ₹${resolvedPackCfg.pricePerBox.toLocaleString("en-IN")} ${resolvedPackCfg.mrpPerBox ? `(MRP ₹${resolvedPackCfg.mrpPerBox.toLocaleString("en-IN")})` : ""}</p>
        <p style="margin:4px 0"><b>Amount Paid:</b> <span style="color:#16a34a;font-size:18px;font-weight:900">₹${pkg.price.toLocaleString("en-IN")}</span></p>
        ${pkg.savings > 0 ? `<p style="margin:4px 0;color:#16a34a;font-weight:700">💰 You saved ₹${pkg.savings.toLocaleString("en-IN")}</p>` : ""}
      `;

    if (customer.email) {
      await resend.emails.send({
        from:    "Diya Soaps <support@diyasoaps.com>",
        to:      customer.email,
        subject: `🎉 Your Diya Soaps Order Confirmed | ${razorpay_payment_id}`,
        html: `
<div style="background:#f4f6f8;padding:40px;font-family:Arial,sans-serif">
<div style="max-width:650px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 5px 25px rgba(0,0,0,0.1)">
  <div style="background:linear-gradient(135deg,#f97316,#dc2626);padding:30px;text-align:center;color:#fff">
    <h1 style="margin:0;font-size:28px">🌿 Diya Soaps</h1>
    <p style="margin:8px 0 0;opacity:0.85">Order Confirmation</p>
  </div>
  <div style="padding:32px">
    <p style="font-size:16px">Hello <b>${customer.fullName}</b>,</p>
    <p>Your order has been <b style="color:#16a34a">successfully confirmed</b>. Thank you for choosing Diya Soaps!</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
    <h3 style="color:#f97316;margin:0 0 12px">📦 Order Details</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr style="background:#fff7ed"><td style="padding:10px 14px;font-weight:600;color:#555">Order ID</td><td style="padding:10px 14px;font-weight:700;color:#111">${razorpay_payment_id}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:600;color:#555">Package</td><td style="padding:10px 14px;font-weight:700;color:#111">${pkg.label}</td></tr>
      <tr style="background:#fff7ed"><td style="padding:10px 14px;font-weight:600;color:#555">Delivery Address</td><td style="padding:10px 14px;font-weight:600;color:#333">${customer.address || "N/A"}</td></tr>
    </table>
    <div style="margin:16px 0;background:#fff7ed;border-radius:10px;padding:14px 18px">
      ${priceBreakdownHtml}
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
    <h3 style="color:#f97316;margin:0 0 12px">${resolvedPackCfg.isKit ? "🔴 Your Kit" : "🎯 Lucky Box Numbers"}</h3>
    <div style="margin-bottom:16px">${boxesHtml}</div>
    <div style="background:#f0fdf4;padding:16px 20px;border-left:4px solid #16a34a;border-radius:10px;font-size:14px">
      ${resolvedPackCfg.isKit
        ? "🎁 Your <b>Red Sandal Premium Kit</b> is confirmed. We will dispatch it soon!"
        : "🎁 Your lucky draw boxes are successfully booked. Best of luck for the <b>Gold Lucky Draw</b>!"
      }
    </div>
    <br>
    <p style="font-size:14px">Warm Regards,<br><b>Diya Soaps Team</b></p>
  </div>
  <div style="background:#111827;color:#9ca3af;text-align:center;padding:16px;font-size:12px">
    © 2026 Diya Soaps &nbsp;|&nbsp; support@diyasoaps.com
  </div>
</div>
</div>`,
      });
    }

    /* ── Owner email ── */
    await resend.emails.send({
      from:    "Diya Soaps <support@diyasoaps.com>",
      to:      "diyasoapbusiness@gmail.com",
      subject: `🧾 New Order Received | ${razorpay_payment_id}`,
      html: `
<div style="background:#f4f6f8;padding:40px;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1)">
  <div style="background:#16a34a;padding:22px;color:#fff;text-align:center"><h2 style="margin:0">📦 New Order Received</h2></div>
  <div style="padding:28px">
    <h3 style="color:#16a34a;margin:0 0 10px">Customer</h3>
    <p style="margin:4px 0"><b>Name:</b> ${customer.fullName}</p>
    <p style="margin:4px 0"><b>Email:</b> ${customer.email || "N/A"}</p>
    <p style="margin:4px 0"><b>Mobile:</b> ${customer.mobile}</p>
    <p style="margin:4px 0"><b>Address:</b> ${customer.address || "N/A"}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0">
    <h3 style="color:#16a34a;margin:0 0 10px">Order</h3>
    <p style="margin:4px 0"><b>Payment ID:</b> ${razorpay_payment_id}</p>
    <p style="margin:4px 0"><b>Pack:</b> ${pkg.label} (${resolvedPackType})</p>
    <p style="margin:4px 0"><b>Boxes:</b> ${resolvedPackCfg.isKit ? "N/A (Kit)" : (Array.isArray(boxes) ? boxes.join(", ") : "—")}</p>
    <p style="margin:4px 0"><b>Box Count:</b> ${resolvedPackCfg.isKit ? 1 : (Array.isArray(boxes) ? boxes.length : 1)}</p>
    <p style="margin:4px 0"><b>Soaps/Products:</b> ${pkg.soaps}</p>
    <p style="margin:4px 0"><b>Price/Box:</b> ₹${resolvedPackCfg.pricePerBox.toLocaleString("en-IN")}</p>
    ${resolvedPackCfg.mrpPerBox ? `<p style="margin:4px 0"><b>MRP/Box:</b> ₹${resolvedPackCfg.mrpPerBox.toLocaleString("en-IN")}</p>` : ""}
    <p style="margin:4px 0;font-size:18px"><b>Amount Paid:</b> <span style="color:#16a34a;font-weight:900">₹${pkg.price.toLocaleString("en-IN")}</span></p>
    ${pkg.savings > 0 ? `<p style="margin:4px 0;color:#16a34a"><b>Customer Saved:</b> ₹${pkg.savings.toLocaleString("en-IN")}</p>` : ""}
  </div>
  <div style="background:#111827;color:#9ca3af;text-align:center;padding:14px;font-size:12px">Diya Soaps Admin Notification</div>
</div>
</div>`,
    });

    /* ── WhatsApp ── */
    try {
      await twilioClient.messages.create({
        from:             process.env.TWILIO_WHATSAPP_NUMBER,
        to:               "whatsapp:+91" + customer.mobile,
        contentSid:       process.env.TWILIO_TEMPLATE_SID,
        contentVariables: JSON.stringify({
          "1": String(customer.fullName || "Customer"),
          "2": String(razorpay_payment_id || ""),
          "3": String(pkg.label          || ""),
          "4": String(resolvedPackCfg.isKit ? "1 Kit" : (Array.isArray(boxes) ? boxes.length : 0)),
          "5": String(pkg.soaps          || 0),
          "6": String(pkg.price          || 0),
        }),
      });
      console.log("✅ WhatsApp sent to +91" + customer.mobile);
    } catch (err) {
      console.error("❌ WhatsApp Error:", err.message || err);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

/* ─── Reserve boxes endpoint (optional, for frontend reservation) ─── */
app.post("/reserve-boxes", async (req, res) => {
  try {
    const { boxes } = req.body;
    if (!Array.isArray(boxes) || boxes.length === 0) {
      return res.status(400).json({ success: false, message: "boxes array required" });
    }

    // FIX: parse to integers to match DB integer type
    const boxIntegers = boxes.map(b => parseInt(b, 10)).filter(n => !isNaN(n));

    const { data, error } = await supabase
      .from("grid_boxes")
      .update({ status: "reserved", reserved_at: new Date().toISOString() })
      .in("box_number", boxIntegers)
      .eq("status", "available")
      .select("box_number");

    if (error) return res.status(500).json({ success: false, message: error.message });

    const reservedNums = data?.map(d => d.box_number) || [];
    console.log(`🔒 Reserved boxes: [${reservedNums.join(", ")}]`);
    res.json({ success: true, reserved: reservedNums });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Manual reserve release (admin utility) ─── */
app.post("/admin/release-reserved", async (req, res) => {
  try {
    const { box_numbers } = req.body;

    let query = supabase.from("grid_boxes").update({ status: "available", reserved_at: null });

    if (Array.isArray(box_numbers) && box_numbers.length > 0) {
      query = query.in("box_number", box_numbers).eq("status", "reserved");
    } else {
      const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      query = query.eq("status", "reserved").lt("reserved_at", cutoff);
    }

    const { data, error } = await query.select("box_number");
    if (error) return res.status(500).json({ success: false, message: error.message });

    res.json({ success: true, released: data?.map(d => d.box_number) || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Start ─── */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Diya Soaps backend running on port ${PORT}`);
  console.log(`📦 Pack config loaded: ${Object.keys(PACK_CONFIG).join(", ")}`);
  console.log(`⏳ Reserved box auto-release: every 60s (5-min TTL)`);
});