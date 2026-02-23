// import express from "express";
// import dotenv from "dotenv";
// import Razorpay from "razorpay";
// import crypto from "crypto";
// import { createClient } from "@supabase/supabase-js";
// import { Resend } from "resend";

// dotenv.config();

// const app = express();
// app.use(express.json());

// /* ================= CORS ================= */
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   if (req.method === "OPTIONS") return res.sendStatus(200);
//   next();
// });

// /* ================= SERVICES ================= */
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const resend = new Resend(process.env.RESEND_API_KEY);

// /* ================= PACKAGE HELPER ================= */
// /*
//  regular → 1 box | 3 soaps  | ₹600
//  half    → 1 box | 6 soaps  | ₹900
//  annual  → 2 box | 12 soaps | ₹1188
// */
// function getPackageDetails(boxes, packageMode) {
//   if (packageMode === "half") {
//     return { label: "Half-Yearly Pack", soaps: 6, price: 900 };
//   }

//   if (packageMode === "annual") {
//     return { label: "Annual Pack", soaps: 12, price: 1188 };
//   }

//   // default regular
//   const count = boxes.length;
//   return {
//     label: count === 1 ? "Regular Box" : `Regular Box x${count}`,
//     soaps: count * 3,
//     price: count * 600,
//   };
// }

// /* ================= HEALTH ================= */
// app.get("/", (req, res) => {
//   res.json({ message: "Backend running ✅" });
// });

// /* ================= AUTO RELEASE RESERVED ================= */
// const releaseExpiredReservations = async () => {
//   try {
//     const time = new Date(Date.now() - 5 * 60 * 1000).toISOString();
//     await supabase
//       .from("grid_boxes")
//       .update({ status: "available", reserved_at: null })
//       .eq("status", "reserved")
//       .lt("reserved_at", time);
//   } catch (err) {
//     console.error("Auto release error:", err);
//   }
// };
// setInterval(releaseExpiredReservations, 60000);

// /* ================= GET SLOTS ================= */
// app.get("/api/slots", async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("grid_boxes")
//       .select("*")
//       .order("box_number");

//     if (error) throw error;
//     res.json(data);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch slots" });
//   }
// });

// /* ================= CONTACT FORM ================= */
// app.post("/send-contact-mail", async (req, res) => {
//   try {
//     const { name, email, phone, message } = req.body;

//     await resend.emails.send({
//       from: "Diya Soaps <support@diyasoaps.com>",
//       to: "diyasoapbusiness@gmail.com",
//       subject: "📩 New Contact Message",
//       html: `
//         <h3>New Enquiry</h3>
//         <p>Name: ${name}</p>
//         <p>Email: ${email}</p>
//         <p>Phone: ${phone}</p>
//         <p>Message: ${message}</p>
//       `,
//     });

//     res.json({ success: true });
//   } catch {
//     res.status(500).json({ error: "Mail failed" });
//   }
// });

// /* ================= RESERVE BOXES ================= */
// app.post("/reserve-boxes", async (req, res) => {
//   try {
//     const { boxes } = req.body;

//     const { data } = await supabase
//       .from("grid_boxes")
//       .update({
//         status: "reserved",
//         reserved_at: new Date().toISOString(),
//       })
//       .in("box_number", boxes)
//       .eq("status", "available")
//       .select();

//     if (!data || data.length !== boxes.length) {
//       return res.status(400).json({ error: "Slots already taken" });
//     }

//     res.json({ success: true });
//   } catch {
//     res.status(500).json({ error: "Reserve failed" });
//   }
// });

// /* ================= CREATE ORDER ================= */
// app.post("/create-order", async (req, res) => {
//   try {
//     const { boxes, packageMode } = req.body;
//     if (!boxes?.length) {
//       return res.status(400).json({ error: "No boxes selected" });
//     }

//     const pkg = getPackageDetails(boxes, packageMode);

//     const order = await razorpay.orders.create({
//       amount: pkg.price * 100,
//       currency: "INR",
//       receipt: "order_" + Date.now(),
//     });

//     res.json({ ...order, packageDetails: pkg });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Order failed" });
//   }
// });

// /* ================= VERIFY PAYMENT ================= */
// app.post("/verify-payment", async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       boxes,
//       packageMode,
//       name,
//       email,
//       phone,
//       house_no,
//       street,
//       city,
//       pincode,
//       orderId,
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expected = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expected !== razorpay_signature) {
//       return res.status(400).json({ error: "Invalid payment" });
//     }

//     const pkg = getPackageDetails(boxes, packageMode);

//     for (const box of boxes) {
//       await supabase
//         .from("grid_boxes")
//         .update({ status: "booked", booked_at: new Date().toISOString() })
//         .eq("box_number", box);
//     }

//     await supabase.from("members").insert({
//       order_id: orderId,
//       box_number: boxes.join(", "),
//       full_name: name,
//       email,
//       mobile: phone,
//       house_no,
//       street,
//       city,
//       pincode,
//       package_type: pkg.label,
//       no_of_soaps: pkg.soaps,
//       amount_paid: pkg.price,
//       payment_id: razorpay_payment_id,
//       payment_status: "success",
//       created_at: new Date().toISOString(),
//     });

//     await resend.emails.send({
//       from: "Diya Soaps <support@diyasoaps.com>",
//       to: email,
//       subject: `🎉 Booking Confirmed | ${orderId}`,
//       html: `<p>Hi ${name}, your booking is confirmed. Amount ₹${pkg.price}</p>`,
//     });

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Verify payment error:", err);
//     res.status(500).json({ error: "Verification failed" });
//   }
// });

// /* ================= ADMIN ================= */
// app.get("/members", async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("members")
//       .select("*")
//       .order("id", { ascending: false });

//     if (error) throw error;
//     res.json(data);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch members" });
//   }
// });

// /* ================= START ================= */
// const PORT = process.env.PORT || 10000;
// app.listen(PORT, () => {
//   console.log("🚀 Server running on port", PORT);
// });
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

/* ================= PACKAGE HELPER (🔥 CORE LOGIC) ================= */
/**
 * PRICING RULES
 * REGULAR  : 1 box  → 3 soaps  → ₹600
 * HALF     : 1 box  → 6 soaps  → ₹900   (per pack)
 * ANNUAL   : 2 box  → 12 soaps → ₹1188  (per pack)
 */
function getPackageDetails(boxes, packageMode) {
  const boxCount = Array.isArray(boxes) ? boxes.length : boxes;

  if (packageMode === "HALF_YEAR") {
    return {
      label: "Half-Yearly Pack",
      boxes: boxCount,
      soaps: boxCount * 6,
      price: boxCount * 900,
    };
  }

  if (packageMode === "ANNUAL") {
    return {
      label: "Annual Pack",
      boxes: boxCount,
      soaps: boxCount * 6, // 2 boxes = 12 soaps
      price: (boxCount / 2) * 1188,
    };
  }

  // NORMAL
  return {
    label: `Regular Box (×${boxCount})`,
    boxes: boxCount,
    soaps: boxCount * 3,
    price: boxCount * 600,
  };
}

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* ================= AUTO RELEASE RESERVED (5 MIN) ================= */
const releaseExpiredReservations = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await supabase
      .from("grid_boxes")
      .update({ status: "available", reserved_at: null })
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

/* ================= CREATE ORDER ================= */
app.post("/create-order", async (req, res) => {
  try {
    const { boxes, packType } = req.body;

    if (!boxes || !boxes.length) {
      return res.status(400).json({ error: "No boxes selected" });
    }

    const pkg = getPackageDetails(boxes, packType);

    const order = await razorpay.orders.create({
      amount: pkg.price * 100,
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
      boxes,
      packType,
      fullName,
      email,
      mobile,
      houseNo,
      street,
      city,
      pincode,
      orderId,
    } = req.body;

    /* ── Verify Signature ── */
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    /* ── Resolve Package ── */
    const pkg = getPackageDetails(boxes, packType);

    /* ── Mark Boxes as Booked ── */
    for (const box of boxes) {
      await supabase
        .from("grid_boxes")
        .update({ status: "booked", booked_at: new Date().toISOString() })
        .eq("box_number", box);
    }

    /* ── Insert Member ── */
    await supabase.from("members").insert({
      order_id: orderId,
      box_number: boxes.join(", "),
      full_name: fullName,
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
      created_at: new Date().toISOString(),
    });

    /* ── Customer Email ── */
    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: email,
      subject: `🎉 Booking Confirmed | ${orderId}`,
      html: `
        <h2>Booking Confirmed</h2>
        <p><b>Order:</b> ${orderId}</p>
        <p><b>Package:</b> ${pkg.label}</p>
        <p><b>Boxes:</b> ${boxes.join(", ")}</p>
        <p><b>Soaps:</b> ${pkg.soaps}</p>
        <p><b>Amount:</b> ₹${pkg.price}</p>
      `,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Verify payment error:", err);
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

