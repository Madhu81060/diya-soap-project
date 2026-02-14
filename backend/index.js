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

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ================= RAZORPAY ================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= RESEND ================= */

const resend = new Resend(process.env.RESEND_API_KEY);

/* ================= AUTO CLEAN RESERVED ================= */

setInterval(async () => {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    await supabase
      .from("grid_boxes")
      .update({
        status: "available",
        reserved_at: null,
      })
      .eq("status", "reserved")
      .lt("reserved_at", fiveMinAgo.toISOString());

    console.log("🧹 Cleaned old reserved slots");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}, 60000);

/* ================= HEALTH ================= */

app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* ================= RESERVE BOXES ================= */

app.post("/reserve-boxes", async (req, res) => {
  try {
    const { boxes } = req.body;

    if (!boxes || boxes.length === 0) {
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
      orderId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment" });
    }

    /* Confirm reserved */
    for (const box of boxes) {
      const { data } = await supabase
        .from("grid_boxes")
        .select("status")
        .eq("box_number", box)
        .limit(1);

      if (!data || data[0].status !== "reserved") {
        return res.status(400).json({ error: "Slot lost during payment" });
      }
    }

    /* Book permanently */
    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({
          status: "booked",
          booked_at: new Date().toISOString(),
        })
        .eq("box_number", box);
    }

    /* Save member */
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

    /* ================= PROFESSIONAL CUSTOMER EMAIL ================= */

    await resend.emails.send({
      from: "Diya Soaps <onboarding@resend.dev>",
      to: email,
      subject: "Your Booking is Confirmed | Diya Soaps 🌿",
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f9fafb;padding:30px;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:12px;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
          
          <h2 style="color:#16a34a;margin-bottom:10px;">Booking Confirmation 🎉</h2>

          <p>Dear <strong>${name}</strong>,</p>

          <p>Thank you for choosing <strong>Diya Soaps</strong>. 
          We are delighted to confirm your booking.</p>

          <div style="background:#f0fdf4;padding:15px;border-radius:8px;margin:20px 0;">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Booked Slot(s):</strong> ${boxes.join(", ")}</p>
            <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          </div>

          <h3 style="margin-top:20px;color:#ea580c;">🎁 Exclusive Benefits</h3>
          <ul>
            <li>Lucky Draw Entry</li>
            <li>Festival Special Offers</li>
            <li>Priority Access to Upcoming Products</li>
          </ul>

          <p style="margin-top:25px;">
            If you have any questions, feel free to reply to this email.
          </p>

          <hr style="margin:25px 0;" />

          <p style="font-size:14px;color:#555;">
            Warm Regards,<br/>
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
      subject: "🔥 New Slot Booking Alert",
      html: `
        <h2>New Customer Booking</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Order ID:</b> ${orderId}</p>
        <p><b>Booked Slot(s):</b> ${boxes.join(", ")}</p>
      `,
    });

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
