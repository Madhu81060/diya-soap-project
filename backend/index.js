import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import twilio from "twilio";

dotenv.config();

const app = express();

// Use express.json with rawBody verification support for Razorpay webhooks
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

/* ================= CORS ================= */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-razorpay-signature");
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

/* ================= TWILIO SAFETY CHECK ================= */
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

if (!twilioClient) {
  console.log("⚠️ Twilio credentials missing in .env. SMS/WhatsApp alerts will be skipped.");
}

/* ================= TEST MODE ================= */
const TEST_MODE = false;

/* ═══════════════════════════════════════════════════════════════════════
   PACK CONFIG
   ═══════════════════════════════════════════════════════════════════════ */
const PACK_CONFIG = {
  NORMAL:     { label: "Starter Pack",           soapsPerBox: 1,  pricePerBox: TEST_MODE ? 1 : 300,   mrpPerBox: null,  isKit: false },
  HALF_YEAR:  { label: "Value Pack",             soapsPerBox: 3,  pricePerBox: TEST_MODE ? 1 : 600,   mrpPerBox: 900,   isKit: false },
  ANNUAL:     { label: "Bumper Pack",            soapsPerBox: 6,  pricePerBox: TEST_MODE ? 1 : 900,   mrpPerBox: 1800,  isKit: false },
  RED_SANDAL: { label: "Red Sandal Premium Kit", soapsPerBox: 14, pricePerBox: TEST_MODE ? 1 : 50000, mrpPerBox: null,  isKit: true  },
};

function getPackageDetails(qty, packType) {
  const cfg = PACK_CONFIG[packType] || PACK_CONFIG.NORMAL;
  const count = qty || 1;

  if (cfg.isKit) {
    return {
      label:   cfg.label,
      soaps:   cfg.soapsPerBox * count,
      price:   cfg.pricePerBox * count,
      mrp:     null,
      savings: 0,
      isKit:   true,
    };
  }

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
   ROUTES
   ══════════════════════════════════════════════════════════════════════ */

app.get("/", (req, res) => {
  res.json({ status: "OK", service: "Diya Soaps Backend", version: "3.0" });
});

/* ─── Fetch Members (Admin Panel) ─── */
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

/* ─── Send Contact Mail ─── */
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

/* ─── Create Razorpay Order ─── */
app.post("/create-order", async (req, res) => {
  try {
    const { qty, packType, customer } = req.body;

    if (!packType) return res.status(400).json({ success: false, message: "packType is required" });
    if (!PACK_CONFIG[packType]) return res.status(400).json({ success: false, message: `Unknown packType: ${packType}` });

    const pkg = getPackageDetails(qty, packType);
    const normalizedCust = normaliseCustomer(req.body);

    const order = await razorpay.orders.create({
      amount:   pkg.price * 100,
      currency: "INR",
      receipt:  "order_" + Date.now(),
      notes: {
        packType,
        totalSoaps: String(pkg.soaps),
        totalPrice: String(pkg.price),
        qty: String(qty || 1),
        fullName: normalizedCust.fullName,
        mobile: normalizedCust.mobile,
        email: normalizedCust.email,
        houseNo: normalizedCust.houseNo,
        street: normalizedCust.street,
        city: normalizedCust.city,
        pincode: normalizedCust.pincode,
        address: normalizedCust.address,
      },
    });

    console.log(`📦 Order created | packType=${packType} | qty=${qty} | soaps=${pkg.soaps} | amount=₹${pkg.price} | orderId=${order.id}`);

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
      qty,
      packType,
      pack,
      orderId,
    } = req.body;

    const resolvedPackType = packType || pack || "NORMAL";
    const resolvedPackCfg  = PACK_CONFIG[resolvedPackType] || PACK_CONFIG.NORMAL;

    /* ── Validate ── */
    if (!razorpay_payment_id) return res.status(400).json({ success: false, message: "Payment ID missing" });
    if (!razorpay_signature)  return res.status(400).json({ success: false, message: "Signature missing" });

    /* ── Normalise customer ── */
    const customer = normaliseCustomer(req.body);
    const pkg      = getPackageDetails(qty, resolvedPackType);

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

    /* ── Save member ── */
    const memberPayload = {
      order_id:       orderId || razorpay_order_id || razorpay_payment_id,
      payment_id:     razorpay_payment_id,
      payment_status: "success",

      full_name:  customer.fullName,
      email:      customer.email,
      mobile:     customer.mobile,
      house_no:   customer.houseNo,
      street:     customer.street,
      city:       customer.city,
      pincode:    customer.pincode,

      box_number:   resolvedPackCfg.isKit ? "KIT" : "N/A",
      package_type: pkg.label,
      no_of_soaps:  pkg.soaps,
      amount_paid:  pkg.price,
      is_kit:       resolvedPackCfg.isKit,

      created_at: new Date().toISOString(),
    };

    const { error: memberErr } = await supabase.from("members").insert(memberPayload);
    if (memberErr) {
      console.error("❌ Member insert error:", memberErr.message);
    } else {
      console.log(`✅ Member saved: ${customer.fullName}`);
    }

    console.log(`✅ Payment verified | orderId=${razorpay_payment_id} | pack=${resolvedPackType} | qty=${qty} | soaps=${pkg.soaps} | amount=₹${pkg.price} | customer=${customer.fullName}`);

    /* ── Customer email ── */
    const count = qty || 1;

    const priceBreakdownHtml = resolvedPackCfg.isKit
      ? `<p style="margin:4px 0"><b>${count} Kit${count > 1 ? "s" : ""}:</b> ₹${resolvedPackCfg.pricePerBox.toLocaleString("en-IN")}/kit × ${count} = <span style="color:#16a34a;font-size:18px;font-weight:900">₹${pkg.price.toLocaleString("en-IN")}</span></p>`
      : `
        <p style="margin:4px 0"><b>Quantity:</b> ${count} × ${resolvedPackCfg.soapsPerBox} soaps = ${pkg.soaps} soaps total</p>
        <p style="margin:4px 0"><b>Price/box:</b> ₹${resolvedPackCfg.pricePerBox.toLocaleString("en-IN")} ${resolvedPackCfg.mrpPerBox ? `(MRP ₹${resolvedPackCfg.mrpPerBox.toLocaleString("en-IN")})` : ""}</p>
        <p style="margin:4px 0"><b>Amount Paid:</b> <span style="color:#16a34a;font-size:18px;font-weight:900">₹${pkg.price.toLocaleString("en-IN")}</span></p>
        ${pkg.savings > 0 ? `<p style="margin:4px 0;color:#16a34a;font-weight:700">💰 You saved ₹${pkg.savings.toLocaleString("en-IN")}</p>` : ""}
      `;

    if (customer.email) {
      try {
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
      <div style="background:#f0fdf4;padding:16px 20px;border-left:4px solid #16a34a;border-radius:10px;font-size:14px">
        ${resolvedPackCfg.isKit
          ? `🎁 Your <b>Red Sandal Premium Kit${count > 1 ? "s" : ""}</b> ${count > 1 ? "are" : "is"} confirmed. We will dispatch soon!`
          : "🎁 Your order is successfully booked. We will dispatch it soon!"
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
      } catch (emailErr) {
        console.error("❌ Customer email send error:", emailErr.message || emailErr);
      }
    }

    /* ── Owner email ── */
    try {
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
      <p style="margin:4px 0"><b>Quantity / Kit Count:</b> ${count}</p>
      <p style="margin:4px 0"><b>Soaps/Products:</b> ${pkg.soaps}</p>
      <p style="margin:4px 0"><b>Price/Unit:</b> ₹${resolvedPackCfg.pricePerBox.toLocaleString("en-IN")} ${resolvedPackCfg.isKit ? "per kit" : "per box"}</p>
      ${resolvedPackCfg.mrpPerBox ? `<p style="margin:4px 0"><b>MRP/Box:</b> ₹${resolvedPackCfg.mrpPerBox.toLocaleString("en-IN")}</p>` : ""}
      <p style="margin:4px 0;font-size:18px"><b>Amount Paid:</b> <span style="color:#16a34a;font-weight:900">₹${pkg.price.toLocaleString("en-IN")}</span></p>
      ${pkg.savings > 0 ? `<p style="margin:4px 0;color:#16a34a"><b>Customer Saved:</b> ₹${pkg.savings.toLocaleString("en-IN")}</p>` : ""}
    </div>
    <div style="background:#111827;color:#9ca3af;text-align:center;padding:14px;font-size:12px">Diya Soaps Admin Notification</div>
  </div>
  </div>`,
      });
    } catch (ownerEmailErr) {
      console.error("❌ Owner email send error:", ownerEmailErr.message || ownerEmailErr);
    }

    /* ── WhatsApp ── */
    if (twilioClient) {
      try {
        await twilioClient.messages.create({
          from:             process.env.TWILIO_WHATSAPP_NUMBER,
          to:               "whatsapp:+91" + customer.mobile,
          contentSid:       process.env.TWILIO_TEMPLATE_SID,
          contentVariables: JSON.stringify({
            "1": String(customer.fullName || "Customer"),
            "2": String(razorpay_payment_id || ""),
            "3": String(pkg.label          || ""),
            "4": String(count              || 1),
            "5": String(pkg.soaps          || 0),
            "6": String(pkg.price          || 0),
          }),
        });
        console.log("✅ WhatsApp sent to +91" + customer.mobile);
      } catch (err) {
        console.error("❌ WhatsApp Error:", err.message || err);
      }
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

/* ─── Razorpay Webhook Endpoint ─── */
app.post("/razorpay-webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac("sha256", webhookSecret);
      const bodyString = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
      shasum.update(bodyString);
      const digest = shasum.digest("hex");

      if (digest !== signature) {
        console.error("❌ Webhook Signature mismatch");
        return res.status(400).json({ success: false, message: "Invalid signature" });
      }
      console.log("✅ Webhook Signature verified");
    } else {
      console.log("⚠️ Webhook secret or signature missing, skipping verification check.");
    }

    const event = req.body.event;
    console.log(`🔔 Webhook event received: ${event}`);

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount / 100; // in INR
      const notes = payment.notes || {};

      console.log(`💳 Webhook payment.captured | orderId=${orderId} | paymentId=${paymentId} | amount=₹${amount}`);

      // Check if member already exists
      const { data: existingMember, error: fetchErr } = await supabase
        .from("members")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (fetchErr) {
        console.error("❌ Error fetching existing member in webhook:", fetchErr.message);
      }

      if (existingMember) {
        console.log(`🔄 Webhook updating order ${orderId} to success`);
        const { error: updateErr } = await supabase
          .from("members")
          .update({
            payment_status: "success",
            payment_id: paymentId
          })
          .eq("order_id", orderId);
        
        if (updateErr) {
          console.error("❌ Webhook update error:", updateErr.message);
        } else {
          console.log(`✅ Webhook updated order ${orderId} successfully.`);
        }
      } else {
        // Recover and store order details
        console.log(`📥 Webhook recovering order: ${orderId} (inserting member from order notes)`);
        const packType = notes.packType || "NORMAL";
        const soaps = parseInt(notes.totalSoaps || 1, 10);
        
        const memberPayload = {
          order_id:       orderId,
          payment_id:     paymentId,
          payment_status: "success",

          full_name:  notes.fullName || "Customer",
          email:      notes.email || "",
          mobile:     notes.mobile || "",
          house_no:   notes.houseNo || "",
          street:     notes.street || "",
          city:       notes.city || "",
          pincode:    notes.pincode || "",

          box_number:   packType === "RED_SANDAL" ? "KIT" : "N/A",
          package_type: packType === "RED_SANDAL" ? "Red Sandal Premium Kit" : (packType === "ANNUAL" ? "Bumper Pack" : (packType === "HALF_YEAR" ? "Value Pack" : "Starter Pack")),
          no_of_soaps:  soaps,
          amount_paid:  amount,
          is_kit:       packType === "RED_SANDAL",

          created_at: new Date().toISOString(),
        };

        const { error: insertErr } = await supabase.from("members").insert(memberPayload);
        if (insertErr) {
          console.error("❌ Webhook insert error:", insertErr.message);
        } else {
          console.log(`✅ Webhook saved recovered member: ${memberPayload.full_name}`);
        }
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("❌ Webhook processing error:", err.message || err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Start ─── */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Diya Soaps backend running on port ${PORT}`);
  console.log(`📦 Pack config loaded: ${Object.keys(PACK_CONFIG).join(", ")}`);
});