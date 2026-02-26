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
 * ORIGINAL BUSINESS LOGIC (UNCHANGED)
 * NORMAL    : 1 box → 3 soaps  → ₹600
 * HALF_YEAR : 1 box → 6 soaps  → ₹900
 * ANNUAL    : 1 box → 12 soaps → ₹1188
 */
function getPackageDetails(boxes, packType) {
  const boxCount = boxes.length;

  if (packType === "HALF_YEAR") {
    return {
      label: "Half-Yearly Pack",
      soaps: boxCount * 6,
      price: boxCount * 900,
    };
  }

  if (packType === "ANNUAL") {
    return {
      label: "Annual Pack",
      soaps: boxCount * 12,
      price: boxCount * 1188,
    };
  }

  return {
    label: "Regular Box",
    soaps: boxCount * 3,
    price: boxCount * 600,
  };
}

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* ================= CREATE ORDER ================= */
app.post("/create-order", async (req, res) => {
  try {
    const { boxes, packType } = req.body;

    if (!boxes || !boxes.length) {
      return res.status(400).json({ error: "No boxes selected" });
    }

    const pkg = getPackageDetails(boxes, packType);

    const order = await razorpay.orders.create({
      amount: pkg.price * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json(order);
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
      packType,
      fullName,
      email,
      mobile,
      houseNo,
      street,
      city,
      pincode,
      orderId,
    } = req.body;

    /* VERIFY SIGNATURE */
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const pkg = getPackageDetails(boxes, packType);

    /* UPDATE GRID */
    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({ status: "booked", booked_at: new Date().toISOString() })
        .eq("box_number", box);
    }

    /* INSERT MEMBER */
    await supabase.from("members").insert({
      order_id: orderId,
      box_number: boxes.join(", "),
      full_name: fullName,
      email,
      mobile,
      house_no: houseNo,
      street,
      city,
      pincode,
      package_type: pkg.label,
      no_of_soaps: pkg.soaps,
      amount_paid: pkg.price,
      payment_id: razorpay_payment_id,
      payment_status: "success",
      created_at: new Date().toISOString(),
    });

    /* ================= CUSTOMER EMAIL (UPDATED & PROFESSIONAL) ================= */
    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: email,
      subject: `🎉 Order Confirmed | ${orderId}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Thank You for Choosing Diya Soaps, ${fullName}!</h2>

          <p>
            We are delighted to inform you that your payment was successful
            and your order has been confirmed.
          </p>

          <h3>🧾 Order Details</h3>
          <table cellpadding="6">
            <tr><td><b>Order ID</b></td><td>${orderId}</td></tr>
            <tr><td><b>Package</b></td><td>${pkg.label}</td></tr>
            <tr><td><b>Boxes</b></td><td>${boxes.join(", ")}</td></tr>
            <tr><td><b>Total Soaps</b></td><td>${pkg.soaps}</td></tr>
            <tr><td><b>Amount Paid</b></td><td>₹${pkg.price}</td></tr>
          </table>

          <p>
            Thank you for trusting <b>Diya Soaps</b>.
            We truly appreciate your support and hope you enjoy our
            natural handmade soaps 🌿
          </p>

          <p>
            Warm regards,<br/>
            <b>Diya Soaps Team</b><br/>
            Natural Care for Your Skin
          </p>
        </div>
      `,
    });

    /* ================= OWNER EMAIL (UPDATED & CLEAR) ================= */
    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: "diyasoapbusiness@gmail.com",
      subject: `🛒 New Order Received | ${orderId}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>New Order Received</h2>

          <h3>👤 Customer Details</h3>
          <p>
            <b>Name:</b> ${fullName}<br/>
            <b>Email:</b> ${email}<br/>
            <b>Mobile:</b> ${mobile}
          </p>

          <h3>📦 Order Summary</h3>
          <ul>
            <li><b>Order ID:</b> ${orderId}</li>
            <li><b>Package:</b> ${pkg.label}</li>
            <li><b>Boxes:</b> ${boxes.join(", ")}</li>
            <li><b>Total Soaps:</b> ${pkg.soaps}</li>
            <li><b>Amount Paid:</b> ₹${pkg.price}</li>
          </ul>

          <h3>🏠 Delivery Address</h3>
          <p>${houseNo}, ${street}, ${city} - ${pincode}</p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= START ================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});