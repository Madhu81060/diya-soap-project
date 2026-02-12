import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// ================= CORS =================
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// ================= SUPABASE =================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================= RAZORPAY =================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
// 🔥 SLOTS API (FINAL FIX)
// =====================================================
app.get("/api/slots", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("grid_boxes")
      .select("status");

    if (error) throw error;

    // ✅ count both reserved + booked
    const booked = data.filter(
      (b) =>
        b.status === "reserved" ||
        b.status === "booked"
    ).length;

    res.json({ booked });

  } catch (err) {
    console.error("Slots error:", err);
    res.status(500).json({ error: "Slots fetch failed" });
  }
});

// =====================================================
// 💳 CREATE ORDER
// =====================================================
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
    res.status(500).json({ error: "Order creation failed" });
  }
});

// =====================================================
// 📩 CONTACT MAIL (FINAL FIX)
// =====================================================
app.post("/send-contact-mail", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Name, email and message required",
      });
    }

    // Save to Supabase
    const { error } = await supabase
      .from("contact_messages")
      .insert([{ name, email, phone, message }]);

    if (error) throw error;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Contact Message",
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Contact error:", err);
    res.status(500).json({ error: "Contact failed" });
  }
});

// =====================================================
// 📦 RESERVE BOX
// =====================================================
app.post("/reserve-box", async (req, res) => {
  try {
    const boxNumber = parseInt(req.body.box_number, 10);

    if (!boxNumber) {
      return res.status(400).json({ error: "Invalid box number" });
    }

    const { data: box, error } = await supabase
      .from("grid_boxes")
      .select("*")
      .eq("box_number", boxNumber)
      .single();

    if (error || !box || box.status !== "available") {
      return res.status(400).json({ error: "Box unavailable" });
    }

    const { error: updateError } = await supabase
      .from("grid_boxes")
      .update({
        status: "reserved",
        reserved_at: new Date().toISOString(),
      })
      .eq("box_number", boxNumber);

    if (updateError) throw updateError;

    res.json({ success: true });

  } catch (err) {
    console.error("Reserve error:", err);
    res.status(500).json({ error: "Reserve failed" });
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

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error("Admin error:", err);
    res.status(500).json({ error: "Admin fetch failed" });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on ${PORT}`);
});
