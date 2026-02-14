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

/* ================= HEALTH ================= */

app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* ================= CONTACT MAIL ================= */

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
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Contact mail error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/* ================= RESERVE ================= */

app.post("/reserve-boxes", async (req, res) => {
  try {
    const { boxes } = req.body;

    if (!boxes || boxes.length === 0) {
      return res.status(400).json({ error: "No boxes selected" });
    }

    const { data } = await supabase
      .from("grid_boxes")
      .update({
        status: "reserved",
        reserved_at: new Date().toISOString(),
      })
      .in("box_number", boxes)
      .eq("status", "available")
      .select();

    if (!data || data.length !== boxes.length) {
      return res.status(400).json({ error: "Slots already taken" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Reserve error:", err);
    res.status(500).json({ error: "Reserve failed" });
  }
});

/* ================= CREATE ORDER ================= */

app.post("/create-order", async (req, res) => {
  try {
    const { boxes } = req.body;

    if (!boxes || boxes.length === 0) {
      return res.status(400).json({ error: "No boxes selected" });
    }

    let amount;

    if (boxes.length === 1) {
      amount = 600;
    } else if (boxes.length === 2) {
      amount = 900;
    } else {
      amount = 1188;
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    console.error("Order error:", err);
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
      name,
      email,
      phone,
      orderId,
    } = req.body;

    if (!boxes || boxes.length === 0) {
      return res.status(400).json({ error: "No boxes provided" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment" });
    }

    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({
          status: "booked",
          booked_at: new Date().toISOString(),
        })
        .eq("box_number", box);
    }

    await supabase.from("members").insert({
      box_number: boxes.join(", "),
      full_name: name,
      mobile: phone,
      email: email,
      payment_id: razorpay_payment_id,
      order_id: orderId,
      payment_status: "success",
    });

    const amountPaid =
      boxes.length === 1
        ? 600
        : boxes.length === 2
        ? 900
        : 1188;

    const now = new Date().toLocaleString("en-IN");

    try {
      await resend.emails.send({
        from: "Diya Soaps <support@diyasoaps.com>",
        to: email,
        subject: `🌿 Payment Successful | Order ${orderId}`,
        html: `
          <h2 style="color:#16a34a;">Payment Confirmed 🌿</h2>
          <p>Dear ${name},</p>
          <p><b>Order ID:</b> ${orderId}</p>
          <p><b>Payment ID:</b> ${razorpay_payment_id}</p>
          <p><b>Amount Paid:</b> ₹${amountPaid}</p>
          <p><b>Slots:</b> ${boxes.join(", ")}</p>
          <p><b>Date:</b> ${now}</p>
        `,
      });
    } catch (err) {
      console.error("Customer email error:", err);
    }

    try {
      await resend.emails.send({
        from: "Diya Soaps <support@diyasoaps.com>",
        to: "diyasoapbusiness@gmail.com",
        subject: `🔔 New Booking | Order ${orderId}`,
        html: `
          <h2>New Booking Alert</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Order ID:</b> ${orderId}</p>
          <p><b>Payment ID:</b> ${razorpay_payment_id}</p>
          <p><b>Amount:</b> ₹${amountPaid}</p>
          <p><b>Slots:</b> ${boxes.join(", ")}</p>
          <p><b>Time:</b> ${now}</p>
        `,
      });
    } catch (err) {
      console.error("Owner email error:", err);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= START ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on ${PORT}`);
});
