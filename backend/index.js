import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import twilio from "twilio";

dotenv.config();

/* TWILIO */
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const app = express();
app.use(express.json());

/* CORS */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

/* SERVICES */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY);

const TEST_MODE = true;

/* PACKAGE */
function getPackageDetails(boxes, packType) {
  const count = boxes.length;

  return {
    label:
      packType === "ANNUAL"
        ? "Annual Pack"
        : packType === "HALF_YEAR"
        ? "Half-Yearly Pack"
        : "Regular Box",
    soaps:
      packType === "ANNUAL"
        ? count * 12
        : packType === "HALF_YEAR"
        ? count * 6
        : count * 3,
    price: TEST_MODE ? count * 1 : count * 600,
  };
}

/* HEALTH */
app.get("/", (req, res) => {
  res.json({ status: "OK" });
});

/* MEMBERS */
app.get("/members", async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from("members")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch members",
      });
    }

    return res.status(200).json({
      success: true,
      total: count || data.length,
      data,
    });

  } catch (err) {
    console.error("Server Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
/* CONTACT */
app.post("/send-contact-mail", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    /* ===== VALIDATION ===== */
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, and Message are required",
      });
    }

    /* ===== SAVE TO DATABASE ===== */
    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        phone,
        message,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("DB Error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to save message",
      });
    }

    /* ===== SEND EMAIL ===== */
    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: "diyasoapbusiness@gmail.com",
      subject: "New Contact Message",
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    });

    /* ===== RESPONSE ===== */
    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (err) {
    console.error("Server Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

/* CREATE ORDER */
app.post("/create-order", async (req, res) => {
  const { boxes, packType } = req.body;

  const pkg = getPackageDetails(boxes, packType);

  const order = await razorpay.orders.create({
    amount: pkg.price * 100,
    currency: "INR",
    receipt: "order_" + Date.now(),
  });

  res.json(order);
});

/* VERIFY PAYMENT */
/* ================= VERIFY PAYMENT ================= */

app.post("/verify-payment", async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      boxes,
      packType,
      fullName,
      email,
      mobile,
      houseNo,
      street,
      city,
      pincode,
      orderId
    } = req.body;

    /* ===== VALIDATION ===== */
    if (!boxes || boxes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Boxes data missing"
      });
    }

    const name = fullName || "Customer";

    /* ===== VERIFY SIGNATURE ===== */
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    const pkg = getPackageDetails(boxes, packType);

    /* ================= UPDATE GRID BOXES ================= */
    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({
          status: "booked",
          booked_at: new Date().toISOString()
        })
        .eq("box_number", box);
    }

    /* ================= SAVE MEMBER ================= */
    await supabase.from("members").insert({
      order_id: orderId,
      box_number: boxes.join(", "),
      full_name: name,
      email,
      mobile,
      house_no: houseNo,
      street,
      city,
      pincode,
      package_type: pkg.label,
      no_of_soaps: pkg.soaps,
      amount_paid: pkg.price,
      payment_id: razorpay_payment_id,
      payment_status: "success",
      created_at: new Date().toISOString()
    });

    /* ================= CUSTOMER EMAIL ================= */

    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: email,
      subject: `🎉 Your Diya Soaps Order Confirmed | ${orderId}`,

      html: `
<div style="background:#f4f6f8;padding:40px;font-family:Arial">
<div style="max-width:650px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 5px 25px rgba(0,0,0,0.1)">

<div style="background:linear-gradient(90deg,#f97316,#16a34a);padding:25px;text-align:center;color:white">
<h1>🌿 Diya Soaps</h1>
<p>Order Confirmation</p>
</div>

<div style="padding:30px">

<p>Hello <b>${name}</b>,</p>
<p>Your order has been successfully confirmed.</p>

<hr>

<h3 style="color:#f97316">Order Details</h3>
<p><b>Order ID:</b> ${orderId}</p>
<p><b>Package:</b> ${pkg.label}</p>

<h3 style="color:#f97316">Lucky Boxes</h3>

<div>
${boxes?.map(b => `
<span style="background:#fde047;padding:8px 14px;margin:4px;border-radius:6px;font-weight:bold;display:inline-block">
${String(b).padStart(3,"0")}
</span>
`).join("")}
</div>

<br>

<p><b>Total Boxes:</b> ${boxes?.length || 0}</p>
<p><b>Total Soaps:</b> ${pkg.soaps}</p>

<p style="font-size:18px">
<b>Amount Paid:</b>
<span style="color:#16a34a;font-weight:bold">₹${pkg.price}</span>
</p>

<hr>

<div style="background:#f0fdf4;padding:15px;border-left:4px solid #16a34a;border-radius:8px">
🎁 Your lucky draw boxes are successfully booked.<br>
Best of luck for the <b>Gold Lucky Draw</b>.
</div>

<br>

<p>Warm Regards,<br><b>Diya Soaps Team</b></p>

</div>

<div style="background:#111827;color:white;text-align:center;padding:15px;font-size:13px">
© 2026 Diya Soaps<br>support@diyasoaps.com
</div>

</div>
</div>
`
    });

    /* ================= OWNER EMAIL ================= */

    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: "diyasoapbusiness@gmail.com",
      subject: `🧾 New Order Received | ${orderId}`,

      html: `
<div style="background:#f4f6f8;padding:40px;font-family:Arial">

<div style="max-width:600px;margin:auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1)">

<div style="background:#16a34a;padding:20px;color:white;text-align:center">
<h2>📦 New Order Received</h2>
</div>

<div style="padding:25px">

<h3>Customer Details</h3>
<p><b>Name:</b> ${name}</p>
<p><b>Email:</b> ${email}</p>
<p><b>Mobile:</b> ${mobile}</p>

<hr>

<h3>Order Details</h3>
<p><b>Order ID:</b> ${orderId}</p>
<p><b>Package:</b> ${pkg.label}</p>
<p><b>Boxes:</b> ${boxes.join(", ")}</p>
<p><b>Total Soaps:</b> ${pkg.soaps}</p>

<p style="font-size:18px">
<b>Amount:</b>
<span style="color:#16a34a;font-weight:bold">₹${pkg.price}</span>
</p>

</div>

<div style="background:#111827;color:white;text-align:center;padding:15px;font-size:13px">
Diya Soaps Admin Notification
</div>

</div>

</div>
`
    });

    /* ================= WHATSAPP TEMPLATE ================= */
   try {
  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: "whatsapp:+91" + mobile,
    contentSid: process.env.TWILIO_TEMPLATE_SID,
    contentVariables: JSON.stringify({
      "1": name,
      "2": orderId,
      "3": pkg.label,
      "4": boxes.length,
      "5": pkg.soaps,
      "6": pkg.price
    })
  });

  console.log("✅ WhatsApp sent");

} catch (err) {
  console.log("❌ WhatsApp ERROR:", err.message);
}

    /* ===== FINAL RESPONSE ===== */
    res.json({ success: true });

  } catch (err) {
    console.error("Verification Error:", err);

    res.status(500).json({
      success: false,
      message: "Verification failed"
    });
  }
});
/* ================= START SERVER ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
console.log("🚀 Server running on port " + PORT);
});