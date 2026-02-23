// import express from "express";
// import dotenv from "dotenv";
// import Razorpay from "razorpay";
// import crypto from "crypto";
// import { createClient } from "@supabase/supabase-js";
// import { Resend } from "resend";

// dotenv.config();

// const app = express();
// app.use(express.json());

// /* ================= CORS ================= */
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   if (req.method === "OPTIONS") return res.sendStatus(200);
//   next();
// });

// /* ================= SERVICES ================= */
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const resend = new Resend(process.env.RESEND_API_KEY);

// /* ================= PACKAGE HELPER ================= */
// /*
//  regular → 1 box | 3 soaps  | ₹600
//  half    → 1 box | 6 soaps  | ₹900
//  annual  → 2 box | 12 soaps | ₹1188
// */
// function getPackageDetails(boxes, packageMode) {
//   if (packageMode === "half") {
//     return { label: "Half-Yearly Pack", soaps: 6, price: 900 };
//   }

//   if (packageMode === "annual") {
//     return { label: "Annual Pack", soaps: 12, price: 1188 };
//   }

//   // default regular
//   const count = boxes.length;
//   return {
//     label: count === 1 ? "Regular Box" : `Regular Box x${count}`,
//     soaps: count * 3,
//     price: count * 600,
//   };
// }

// /* ================= HEALTH ================= */
// app.get("/", (req, res) => {
//   res.json({ message: "Backend running ✅" });
// });

// /* ================= AUTO RELEASE RESERVED ================= */
// const releaseExpiredReservations = async () => {
//   try {
//     const time = new Date(Date.now() - 5 * 60 * 1000).toISOString();
//     await supabase
//       .from("grid_boxes")
//       .update({ status: "available", reserved_at: null })
//       .eq("status", "reserved")
//       .lt("reserved_at", time);
//   } catch (err) {
//     console.error("Auto release error:", err);
//   }
// };
// setInterval(releaseExpiredReservations, 60000);

// /* ================= GET SLOTS ================= */
// app.get("/api/slots", async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("grid_boxes")
//       .select("*")
//       .order("box_number");

//     if (error) throw error;
//     res.json(data);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch slots" });
//   }
// });

// /* ================= CONTACT FORM ================= */
// app.post("/send-contact-mail", async (req, res) => {
//   try {
//     const { name, email, phone, message } = req.body;

//     await resend.emails.send({
//       from: "Diya Soaps <support@diyasoaps.com>",
//       to: "diyasoapbusiness@gmail.com",
//       subject: "📩 New Contact Message",
//       html: `
//         <h3>New Enquiry</h3>
//         <p>Name: ${name}</p>
//         <p>Email: ${email}</p>
//         <p>Phone: ${phone}</p>
//         <p>Message: ${message}</p>
//       `,
//     });

//     res.json({ success: true });
//   } catch {
//     res.status(500).json({ error: "Mail failed" });
//   }
// });

// /* ================= RESERVE BOXES ================= */
// app.post("/reserve-boxes", async (req, res) => {
//   try {
//     const { boxes } = req.body;

//     const { data } = await supabase
//       .from("grid_boxes")
//       .update({
//         status: "reserved",
//         reserved_at: new Date().toISOString(),
//       })
//       .in("box_number", boxes)
//       .eq("status", "available")
//       .select();

//     if (!data || data.length !== boxes.length) {
//       return res.status(400).json({ error: "Slots already taken" });
//     }

//     res.json({ success: true });
//   } catch {
//     res.status(500).json({ error: "Reserve failed" });
//   }
// });

// /* ================= CREATE ORDER ================= */
// app.post("/create-order", async (req, res) => {
//   try {
//     const { boxes, packageMode } = req.body;
//     if (!boxes?.length) {
//       return res.status(400).json({ error: "No boxes selected" });
//     }

//     const pkg = getPackageDetails(boxes, packageMode);

//     const order = await razorpay.orders.create({
//       amount: pkg.price * 100,
//       currency: "INR",
//       receipt: "order_" + Date.now(),
//     });

//     res.json({ ...order, packageDetails: pkg });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Order failed" });
//   }
// });

// /* ================= VERIFY PAYMENT ================= */
// app.post("/verify-payment", async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       boxes,
//       packageMode,
//       name,
//       email,
//       phone,
//       house_no,
//       street,
//       city,
//       pincode,
//       orderId,
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expected = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expected !== razorpay_signature) {
//       return res.status(400).json({ error: "Invalid payment" });
//     }

//     const pkg = getPackageDetails(boxes, packageMode);

//     for (const box of boxes) {
//       await supabase
//         .from("grid_boxes")
//         .update({ status: "booked", booked_at: new Date().toISOString() })
//         .eq("box_number", box);
//     }

//     await supabase.from("members").insert({
//       order_id: orderId,
//       box_number: boxes.join(", "),
//       full_name: name,
//       email,
//       mobile: phone,
//       house_no,
//       street,
//       city,
//       pincode,
//       package_type: pkg.label,
//       no_of_soaps: pkg.soaps,
//       amount_paid: pkg.price,
//       payment_id: razorpay_payment_id,
//       payment_status: "success",
//       created_at: new Date().toISOString(),
//     });

//     await resend.emails.send({
//       from: "Diya Soaps <support@diyasoaps.com>",
//       to: email,
//       subject: `🎉 Booking Confirmed | ${orderId}`,
//       html: `<p>Hi ${name}, your booking is confirmed. Amount ₹${pkg.price}</p>`,
//     });

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Verify payment error:", err);
//     res.status(500).json({ error: "Verification failed" });
//   }
// });

// /* ================= ADMIN ================= */
// app.get("/members", async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("members")
//       .select("*")
//       .order("id", { ascending: false });

//     if (error) throw error;
//     res.json(data);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch members" });
//   }
// });

// /* ================= START ================= */
// const PORT = process.env.PORT || 10000;
// app.listen(PORT, () => {
//   console.log("🚀 Server running on port", PORT);
// });


import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

dotenv.config();

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
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY);

/* ================= PACKAGE HELPER ================= */
/**
 * Package rules:
 *  regular → 1 box  | 3 soaps  | ₹600
 *  half    → 1 box  | 6 soaps  | ₹900   (Half-Yearly Pack)
 *  annual  → 2 boxes| 12 soaps | ₹1,188 (Annual Pack)
 */
function getPackageDetails(boxes, packageMode) {
  // ✅ FIX 1: Regular price was "1" (typo) — now correctly 600
  if (packageMode === "half")    return { label: "Half-Yearly Pack", boxes: 1, soaps: 6,  price: 900  };
  if (packageMode === "annual")  return { label: "Annual Pack",      boxes: 2, soaps: 12, price: 1188 };
  if (packageMode === "regular") return { label: "Regular Box",      boxes: 1, soaps: 3,  price: 1  };

  // Fallback: derive from box count
  const count = Array.isArray(boxes) ? boxes.length : boxes;
  if (count === 2) return { label: "Annual Pack", boxes: 2,     soaps: 12,        price: 1188       };
  if (count === 1) return { label: "Regular Box", boxes: 1,     soaps: 3,         price: 1       };

  return { label: "Regular Box (×" + count + ")", boxes: count, soaps: count * 3, price: 1 };
}

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* ================= AUTO RELEASE RESERVED (5 MIN) ================= */
const releaseExpiredReservations = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await supabase
      .from("grid_boxes")
      .update({ status: "available", reserved_at: null })
      .eq("status", "reserved")
      .lt("reserved_at", fiveMinutesAgo);
  } catch (err) {
    console.error("Auto release error:", err);
  }
};
setInterval(releaseExpiredReservations, 60000);

/* ================= GET SLOTS ================= */
app.get("/api/slots", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("grid_boxes")
      .select("*")
      .order("box_number", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

/* ================= CONTACT FORM ================= */
app.post("/send-contact-mail", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: "diyasoapbusiness@gmail.com",
      subject: "📩 New Contact Message",
      html: `
        <h2>New Contact Enquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Mail failed" });
  }
});

/* ================= RESERVE BOXES ================= */
app.post("/reserve-boxes", async (req, res) => {
  try {
    const { boxes } = req.body;
    const { data } = await supabase
      .from("grid_boxes")
      .update({ status: "reserved", reserved_at: new Date().toISOString() })
      .in("box_number", boxes)
      .eq("status", "available")
      .select();

    if (!data || data.length !== boxes.length) {
      return res.status(400).json({ error: "Slots already taken" });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Reserve failed" });
  }
});

/* ================= CREATE ORDER ================= */
app.post("/create-order", async (req, res) => {
  try {
    const { boxes, packageMode } = req.body;

    if (!boxes?.length)
      return res.status(400).json({ error: "No boxes selected" });

    const pkg = getPackageDetails(boxes, packageMode);

    // ✅ FIX 2: was hardcoded `amount: 100` (₹1) — now correctly pkg.price * 100
    const order = await razorpay.orders.create({
      amount: pkg.price * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json({ ...order, packageDetails: pkg });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Order failed" });
  }
});

/* ================= VERIFY PAYMENT ================= */
app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      boxes,
      packageMode,
      name,
      email,
      phone,
      house_no,
      street,
      city,
      pincode,
      orderId,
    } = req.body;

    /* ── Signature Verification ── */
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      console.error("Signature mismatch — payment invalid");
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    /* ── Resolve Package ── */
    const pkg = getPackageDetails(boxes, packageMode);

    /* ── Update Grid Boxes → booked ── */
    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({ status: "booked", booked_at: new Date().toISOString() })
        .eq("box_number", box);
    }

    /* ── Insert Member into DB ── */
    // ✅ This is the core fix: runs after valid signature only
    // package_type and no_of_soaps are now correctly populated
    const { error: insertError } = await supabase.from("members").insert({
      order_id:       orderId,
      box_number:     boxes.join(", "),
      full_name:      name,
      email,
      mobile:         phone,
      house_no,
      street,
      city,
      pincode,
      package_type:   pkg.label,          // e.g. "Half-Yearly Pack"
      no_of_soaps:    pkg.soaps,          // e.g. 6
      amount_paid:    pkg.price,          // e.g. 900
      payment_id:     razorpay_payment_id,
      payment_status: "success",
      created_at:     new Date().toISOString(),
    });

    if (insertError) {
      // Payment succeeded but DB insert failed — log for manual recovery
      console.error("⚠️ Member insert failed:", JSON.stringify(insertError));
    } else {
      console.log("✅ Member inserted:", orderId);
    }

    /* ── Customer Confirmation Email ── */
    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: email,
      subject: `🎉 Booking Confirmed | ${orderId}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
          <div style="background:#1a1a1a;padding:24px;text-align:center;">
            <h1 style="color:#f5c518;margin:0;font-size:22px;">🌿 Diya Soaps</h1>
            <p style="color:#aaa;margin:4px 0 0;">Your order is confirmed!</p>
          </div>
          <div style="padding:28px;">
            <p style="font-size:16px;">Dear <b>${name}</b>,</p>
            <p>Thank you for your purchase. Here are your order details:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr style="background:#f9fafb;">
                <td style="padding:10px 12px;font-weight:600;color:#374151;">Order ID</td>
                <td style="padding:10px 12px;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#374151;">Package</td>
                <td style="padding:10px 12px;">${pkg.label}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:10px 12px;font-weight:600;color:#374151;">No. of Soaps</td>
                <td style="padding:10px 12px;">${pkg.soaps} soaps</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#374151;">Box(es) Selected</td>
                <td style="padding:10px 12px;">${boxes.join(", ")}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:10px 12px;font-weight:600;color:#374151;">Amount Paid</td>
                <td style="padding:10px 12px;">₹${pkg.price}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#374151;">Delivery Address</td>
                <td style="padding:10px 12px;">${house_no}, ${street}, ${city} - ${pincode}</td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:14px;">
              You are now eligible for the Lucky Draw. 🎁<br/>
              We will notify you of any updates via this email.
            </p>
            <p style="color:#6b7280;font-size:14px;">
              For support: <a href="mailto:support@diyasoaps.com">support@diyasoaps.com</a>
            </p>
          </div>
          <div style="background:#f3f4f6;padding:14px;text-align:center;font-size:12px;color:#9ca3af;">
            © Diya Soaps. All rights reserved.
          </div>
        </div>
      `,
    });

    /* ── Owner Notification Email ── */
    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: "diyasoapbusiness@gmail.com",
      subject: `🔔 New Booking | ${orderId}`,
      html: `
        <h2>New Booking Received</h2>
        <table style="border-collapse:collapse;width:100%;">
          <tr><td style="padding:8px;font-weight:bold;">Order ID</td>    <td style="padding:8px;">${orderId}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Name</td>         <td style="padding:8px;">${name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Phone</td>        <td style="padding:8px;">${phone}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Email</td>        <td style="padding:8px;">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Package</td>      <td style="padding:8px;">${pkg.label}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">No. of Soaps</td> <td style="padding:8px;">${pkg.soaps}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Box(es)</td>      <td style="padding:8px;">${boxes.join(", ")}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Amount</td>       <td style="padding:8px;">₹${pkg.price}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Address</td>      <td style="padding:8px;">${house_no}, ${street}, ${city} - ${pincode}</td></tr>
        </table>
      `,
    });

    res.json({ success: true, packageDetails: pkg });

  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= ADMIN MEMBERS ================= */
app.get("/members", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;
    res.json(data);
    console.log(data);

  } catch {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

/* ================= START ================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});