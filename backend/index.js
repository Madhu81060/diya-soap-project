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
    console.error(err);
    res.status(500).json({ booked: 0 });
  }
});

/* ================= CONTACT ================= */

app.post("/send-contact-mail", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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

    res.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err);
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
    console.error(err);
    res.status(500).json({ error: "Reserve failed" });
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
    console.error(err);
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

    /* ================= CUSTOMER EMAIL ================= */

    await resend.emails.send({
      from: "Diya Soaps <onboarding@resend.dev>",
      to: email,
      subject: `🌿 Payment Successful | Order ${orderId}`,
      html: `
      <div style="font-family:Arial;background:#f4f6f8;padding:40px;">
        <div style="max-width:650px;margin:auto;background:#ffffff;padding:35px;border-radius:12px;">
          
          <h2 style="color:#16a34a;">Thank You for Visiting DiyaSoap.com 🌿</h2>

          <p>Dear <strong>${name}</strong>,</p>

          <p>Your payment has been successfully received. We are happy to confirm your booking.</p>

          <hr/>

          <h3>Payment Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          <p><strong>Amount Paid:</strong> ₹${amountPaid}</p>
          <p><strong>Booked Slot(s):</strong> ${boxes.join(", ")}</p>
          <p><strong>Date:</strong> ${now}</p>

          <hr/>

          <h3>🎁 Exclusive Benefits</h3>
          <ul>
            <li>Lucky Draw Entry</li>
            <li>Festival Special Offers</li>
            <li>Member Only Discounts</li>
          </ul>

          <p style="margin-top:25px;">
            We truly appreciate your trust in Diya Soaps.
          </p>

          <p style="margin-top:30px;">
            Regards,<br/>
            <strong>Team Diya Soaps</strong><br/>
            Hyderabad, India
          </p>
        </div>
      </div>
      `,
    });

    /* ================= OWNER EMAIL ================= */

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

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= START ================= */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on ${PORT}`);
});
