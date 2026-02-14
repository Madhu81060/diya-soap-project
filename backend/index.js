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

/* ================= SLOT COUNT ================= */

app.get("/api/slots", async (req, res) => {
  try {
    const { count } = await supabase
      .from("grid_boxes")
      .select("*", { count: "exact", head: true })
      .eq("status", "booked");

    res.json({ booked: count || 0 });
  } catch (err) {
    console.error("Slots error:", err);
    res.status(500).json({ booked: 0 });
  }
});

/* ================= CONTACT FORM ================= */

app.post("/send-contact-mail", async (req, res) => {
  try {
    console.log("📩 Contact form hit");

    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    /* OWNER MAIL */
    await resend.emails.send({
      from: "Diya Soaps <onboarding@resend.dev>",
      to: "diyasoapbusiness@gmail.com",
      reply_to: email,
      subject: "New Contact Message | Diya Soaps",
      html: `
        <h2>New Website Contact</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    });

    /* CUSTOMER AUTO REPLY */
    await resend.emails.send({
      from: "Diya Soaps <onboarding@resend.dev>",
      to: email,
      subject: "Thank You for Contacting Diya Soaps 🌿",
      html: `
        <h2>Hello ${name} 👋</h2>
        <p>We have received your message.</p>
        <p>Our team will contact you shortly.</p>
        <br/>
        <p>Regards,<br/>Team Diya Soaps</p>
      `,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Contact error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/* ================= CREATE ORDER ================= */

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount required" });
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
    console.log("✅ Verify payment route hit");

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

    console.log("📧 Customer Email:", email);

    if (!boxes || boxes.length === 0) {
      return res.status(400).json({ error: "No boxes provided" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      console.log("❌ Invalid signature");
      return res.status(400).json({ error: "Invalid payment" });
    }

    /* Book slots */
    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({
          status: "booked",
          booked_at: new Date().toISOString(),
        })
        .eq("box_number", box);
    }

    /* Calculate amount */
    const amountPaid =
      boxes.length === 1
        ? 1
        : boxes.length === 2
        ? 900
        : 1188;

    /* Save member */
    await supabase.from("members").insert({
      box_number: boxes.join(", "),
      full_name: name,
      mobile: phone,
      email: email,
      payment_id: razorpay_payment_id,
      order_id: orderId,
      payment_status: "success",
    });

    const now = new Date().toLocaleString("en-IN");

    /* CUSTOMER EMAIL */
    try {
      await resend.emails.send({
        from: "Diya Soaps <onboarding@resend.dev>",
        to: email,
        subject: `🌿 Payment Successful | Order ${orderId}`,
        html: `
          <h2>Payment Successful 🌿</h2>
          <p>Dear ${name},</p>
          <p>Thank you for booking with Diya Soaps.</p>
          <p><b>Order ID:</b> ${orderId}</p>
          <p><b>Amount Paid:</b> ₹${amountPaid}</p>
          <p><b>Slots:</b> ${boxes.join(", ")}</p>
          <p><b>Date:</b> ${now}</p>
          <br/>
          <p>Regards,<br/>Team Diya Soaps</p>
        `,
      });

      console.log("✅ Customer email sent");
    } catch (mailErr) {
      console.log("❌ Customer email failed:", mailErr);
    }

    /* OWNER EMAIL */
    try {
      await resend.emails.send({
        from: "Diya Soaps <onboarding@resend.dev>",
        to: "diyasoapbusiness@gmail.com",
        subject: `🔔 New Booking Received | Order ${orderId}`,
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

      console.log("✅ Owner email sent");
    } catch (ownerErr) {
      console.log("❌ Owner email failed:", ownerErr);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("🔥 VERIFY ERROR:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on ${PORT}`);
});
