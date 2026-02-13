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

/* ================= EMAIL ================= */

const resend = new Resend(process.env.RESEND_API_KEY);

/* ================= AUTO CLEAN RESERVED ================= */

setInterval(async () => {
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
}, 60000);

/* ================= HEALTH ================= */

app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

/* ================= SLOT COUNT ================= */

app.get("/api/slots", async (req, res) => {
  const { count } = await supabase
    .from("grid_boxes")
    .select("*", { count: "exact", head: true })
    .eq("status", "booked");

  res.json({ booked: count || 0 });
});

/* ================= RESERVE BOXES (FIXED ATOMIC) ================= */

app.post("/reserve-boxes", async (req, res) => {
  try {
    const { boxes } = req.body;

    if (!boxes || boxes.length === 0) {
      return res.status(400).json({ error: "No boxes selected" });
    }

    // 🔥 atomic reserve
    const { data, error } = await supabase
      .from("grid_boxes")
      .update({
        status: "reserved",
        reserved_at: new Date().toISOString(),
      })
      .in("box_number", boxes)
      .eq("status", "available")
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Reserve failed" });
    }

    if (!data || data.length !== boxes.length) {
      return res.status(400).json({
        error: "Slots already taken. Try another.",
      });
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
      boxes = [],
      name = "Customer",
      email = "test@example.com",
      phone = "",
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment" });
    }

    // confirm reserved
    for (const box of boxes) {
      const { data } = await supabase
        .from("grid_boxes")
        .select("status")
        .eq("box_number", box)
        .limit(1);

      if (!data || data.length === 0 || data[0].status !== "reserved") {
        return res
          .status(400)
          .json({ error: "Slot lost during payment" });
      }
    }

    // book permanently
    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({
          status: "booked",
          booked_at: new Date().toISOString(),
        })
        .eq("box_number", box);
    }

    // save member
    await supabase.from("members").insert(
      boxes.map((box) => ({
        box_number: box,
        full_name: name,
        mobile: phone,
        email: email,
        payment_id: razorpay_payment_id,
        payment_status: "success",
      }))
    );

    // email
    try {
      await resend.emails.send({
        from: "Diya Soaps <onboarding@resend.dev>",
        to: email,
        subject: "Payment Successful 🎉",
        html: `<h2>Thank you ${name}</h2><p>Your booking is confirmed.</p>`,
      });
    } catch {
      console.log("Email skipped");
    }

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
