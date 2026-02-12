import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// ================= RAZORPAY SETUP =================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= APP SETUP =================
const app = express();

// ✅🔥 UPDATED CORS FIX (IMPORTANT)
app.use(
  cors({
    origin: true, // automatically allows correct origin
    credentials: true,
  })
);

app.use(express.json());

// ================= SUPABASE CLIENT =================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================= MAIL =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// =====================================================
// 🔥 SLOTS API
// =====================================================
app.get("/api/slots", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("grid_boxes")
      .select("*")
      .order("box_number", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================================================
// 💳 CREATE ORDER
// =====================================================
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
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// =====================================================
// 📩 CONTACT
// =====================================================
app.post("/send-contact-mail", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const { error } = await supabase
      .from("contact_messages")
      .insert([{ name, email, phone, message }]);

    if (error) return res.status(500).json({ error: error.message });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Contact Message",
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================================================
// 📦 RESERVE BOX
// =====================================================
app.post("/reserve-box", async (req, res) => {
  try {
    const boxNumber = parseInt(req.body.box_number, 10);

    const { data: box, error } = await supabase
      .from("grid_boxes")
      .select("*")
      .eq("box_number", boxNumber)
      .single();

    if (error || !box || box.status !== "available") {
      return res.status(400).json({ error: "Box unavailable" });
    }

    await supabase
      .from("grid_boxes")
      .update({
        status: "reserved",
        reserved_at: new Date().toISOString(),
      })
      .eq("box_number", boxNumber);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================================================
// 🔒 ADMIN MEMBERS
// =====================================================
app.get("/admin/members", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on ${PORT}`);
});
