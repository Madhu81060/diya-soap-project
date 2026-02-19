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

/* ================= AUTO RELEASE RESERVED (5 MIN) ================= */

const releaseExpiredReservations = async () => {
  try {
    const fiveMinutesAgo = new Date(
      Date.now() - 5 * 60 * 1000
    ).toISOString();

    await supabase
      .from("grid_boxes")
      .update({
        status: "available",
        reserved_at: null,
      })
      .eq("status", "reserved")
      .lt("reserved_at", fiveMinutesAgo);
  } catch (err) {
    console.error("Auto release error:", err);
  }
};

setInterval(releaseExpiredReservations, 60000);

/* ================= GET SLOTS ================= */

app.get("/api/slots", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("grid_boxes")
      .select("*")
      .order("box_number", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

/* ================= CONTACT FORM ================= */

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
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Mail failed" });
  }
});

/* ================= RESERVE BOXES ================= */

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
      return res.status(400).json({ error: "Slots already taken" });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Reserve failed" });
  }
});

/* ================= CREATE ORDER (✅ ONLY CHANGE) ================= */

app.post("/create-order", async (req, res) => {
  try {
    const { boxes, packType } = req.body;

    if (!boxes?.length)
      return res.status(400).json({ error: "No boxes selected" });

    let amount = 0;

    if (packType === "HALF_YEAR") {
      if (boxes.length !== 1)
        return res.status(400).json({ error: "Half Year requires 1 box" });
      amount = 900;
    } else if (packType === "ANNUAL") {
      if (boxes.length !== 2)
        return res.status(400).json({ error: "Annual requires 2 boxes" });
      amount = 1188;
    } else {
      amount = boxes.length * 600;
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json(order);
  } catch {
    res.status(500).json({ error: "Order failed" });
  }
});

/* ================= VERIFY PAYMENT (✅ ONLY CHANGE) ================= */

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      boxes,
      packType,
      name,
      email,
      phone,
      house_no,
      street,
      city,
      pincode,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ error: "Invalid payment" });

    let amountPaid = 0;

    if (packType === "HALF_YEAR") {
      if (boxes.length !== 1)
        return res.status(400).json({ error: "Invalid Half Year pack" });
      amountPaid = 900;
    } else if (packType === "ANNUAL") {
      if (boxes.length !== 2)
        return res.status(400).json({ error: "Invalid Annual pack" });
      amountPaid = 1188;
    } else {
      amountPaid = boxes.length * 600;
    }

    /* Update Slots */
    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({
          status: "booked",
          booked_at: new Date().toISOString(),
        })
        .eq("box_number", box);
    }

    /* Save Member */
    await supabase.from("members").insert({
      order_id: orderId,
      box_number: boxes.join(", "),
      full_name: name,
      email,
      mobile: phone,
      house_no,
      street,
      city,
      pincode,
      amount_paid: amountPaid,
      payment_id: razorpay_payment_id,
      payment_status: "success",
      created_at: new Date().toISOString(),
    });

    /* Customer Email */
    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: email,
      subject: `🎉 Booking Confirmed | ${orderId}`,
      html: `
        <h2>Booking Confirmed 🌿</h2>
        <p>Dear ${name},</p>
        <p><b>Order ID:</b> ${orderId}</p>
        <p><b>Amount:</b> ₹${amountPaid}</p>
        <p><b>Slots:</b> ${boxes.join(", ")}</p>
        <p><b>Address:</b> ${house_no}, ${street}, ${city} - ${pincode}</p>
      `,
    });

    /* Owner Email */
    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: "diyasoapbusiness@gmail.com",
      subject: `🔔 New Booking | ${orderId}`,
      html: `
        <h2>New Booking</h2>
        <p>Name: ${name}</p>
        <p>Phone: ${phone}</p>
        <p>Slots: ${boxes.join(", ")}</p>
      `,
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= ADMIN MEMBERS ================= */

app.get("/members", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

/* ================= START ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
