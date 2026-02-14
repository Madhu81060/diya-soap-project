import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

/* ================= CORS ================= */

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

/* ================= INIT SERVICES ================= */

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

/* ================= RESERVE BOXES ================= */

app.post("/reserve-boxes", async (req, res) => {
  try {
    const { boxes } = req.body;

    if (!boxes?.length) {
      return res.status(400).json({ error: "No boxes selected" });
    }

    const { data, error } = await supabase
      .from("grid_boxes")
      .update({
        status: "reserved",
        reserved_at: new Date().toISOString(),
      })
      .in("box_number", boxes)
      .eq("status", "available")
      .select();

    if (error) throw error;

    if (!data || data.length !== boxes.length) {
      return res.status(400).json({
        error: "Slots already taken. Try another.",
      });
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
      boxes = [],
      name,
      email,
      phone,
      orderId,
    } = req.body;

    /* 1️⃣ Verify Razorpay Signature */
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment" });
    }

    /* 2️⃣ Confirm Reserved */
    for (const box of boxes) {
      const { data } = await supabase
        .from("grid_boxes")
        .select("status")
        .eq("box_number", box)
        .limit(1);

      if (!data || data[0].status !== "reserved") {
        return res.status(400).json({
          error: "Slot lost during payment",
        });
      }
    }

    /* 3️⃣ Book Slots */
    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({
          status: "booked",
          booked_at: new Date().toISOString(),
        })
        .eq("box_number", box);
    }

    /* 4️⃣ Save Member */
    await supabase.from("members").insert(
      boxes.map((box) => ({
        box_number: box,
        full_name: name,
        mobile: phone,
        email: email,
        payment_id: razorpay_payment_id,
        order_id: orderId,
        payment_status: "success",
      }))
    );

    /* ================= EMAILS ================= */

    // ✅ CUSTOMER EMAIL
    try {
      await resend.emails.send({
        from: "Diya Soaps <onboarding@resend.dev>",
        to: email,
        subject: "Your Booking is Confirmed | Diya Soaps 🌿",
        html: `
        <div style="font-family:Arial;padding:25px;background:#f9fafb">
          <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:10px">
            <h2 style="color:#16a34a;">Booking Confirmed 🎉</h2>
            <p>Dear <b>${name}</b>,</p>
            <p>Your booking has been successfully confirmed.</p>

            <div style="background:#f0fdf4;padding:15px;border-radius:8px;margin:20px 0;">
              <p><b>Order ID:</b> ${orderId}</p>
              <p><b>Slot(s):</b> ${boxes.join(", ")}</p>
              <p><b>Payment ID:</b> ${razorpay_payment_id}</p>
            </div>

            <h3 style="color:#ea580c;">Exclusive Benefits 🎁</h3>
            <ul>
              <li>Lucky Draw Entry</li>
              <li>Festival Special Offers</li>
              <li>Priority Access to New Products</li>
            </ul>

            <p>Thank you for trusting Diya Soaps.</p>
            <p><b>Team Diya Soaps</b><br/>Hyderabad, India</p>
          </div>
        </div>
        `,
      });

      console.log("✅ Customer email sent");
    } catch (mailErr) {
      console.error("Customer email error:", mailErr);
    }

    // ✅ OWNER EMAIL
    try {
      await resend.emails.send({
        from: "Diya Soaps <onboarding@resend.dev>",
        to: "diyasoapbusiness@gmail.com",
        subject: "🔥 New Slot Booking Alert",
        html: `
          <h2>New Booking Received</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Order ID:</b> ${orderId}</p>
          <p><b>Slot(s):</b> ${boxes.join(", ")}</p>
        `,
      });

      console.log("✅ Owner email sent");
    } catch (mailErr) {
      console.error("Owner email error:", mailErr);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= START ================= */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on ${PORT}`);
});
