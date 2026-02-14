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
      return res.status(400).json({ error: "Missing fields" });
    }

    await resend.emails.send({
      from: "Diya Soaps <onboarding@resend.dev>",
      to: "diyasoapbusiness@gmail.com",
      reply_to: email,
      subject: "New Contact Message",
      html: `
        <h2>New Website Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
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
      return res.status(400).json({ error: "Slots taken" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Reserve failed" });
  }
});

/* ================= CREATE ORDER ================= */

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
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

    // Customer email
    await resend.emails.send({
      from: "Diya Soaps <onboarding@resend.dev>",
      to: email,
      subject: "Booking Confirmed 🎉",
      html: `
        <h2>Thank you ${name}</h2>
        <p>Your booking is confirmed.</p>
        <p><b>Order ID:</b> ${orderId}</p>
        <p><b>Slots:</b> ${boxes.join(", ")}</p>
      `,
    });

    // Owner email
    await resend.emails.send({
      from: "Diya Soaps <onboarding@resend.dev>",
      to: "diyasoapbusiness@gmail.com",
      subject: "New Booking Alert",
      html: `
        <p>${name} booked slots ${boxes.join(", ")}</p>
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
