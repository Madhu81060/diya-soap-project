/// import express from "express";
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

// function getPackageDetails(boxes, packType) {

//   const boxCount = boxes.length;

//   if (packType === "HALF_YEAR") {
//     return {
//       label: "Half-Yearly Pack",
//       soaps: boxCount * 6,
//       price: boxCount * 900
//     };
//   }

//   if (packType === "ANNUAL") {
//     return {
//       label: "Annual Pack",
//       soaps: boxCount * 12,
//       price: boxCount * 1188
//     };
//   }

//   return {
//     label: "Regular Box",
//     soaps: boxCount * 3,
//     price: boxCount * 600
//   };

// }

// /* ================= HEALTH CHECK ================= */

// app.get("/", (req, res) => {
//   res.json({
//     status: "OK",
//     message: "Backend running ✅"
//   });
// });

// /* ================= MEMBERS API (ADMIN PANEL) ================= */

// app.get("/members", async (req, res) => {

//   try {

//     const { data, error } = await supabase
//       .from("members")
//       .select("*");

//     if (error) {

//       console.error("Supabase fetch error:", error);

//       return res.status(500).json({
//         error: "Failed to fetch members"
//       });

//     }

//     return res.json(data);

//   } catch (err) {

//     console.error("Server error:", err);

//     return res.status(500).json({
//       error: "Server error"
//     });

//   }

// });

// /* ================= CREATE ORDER ================= */

// app.post("/create-order", async (req, res) => {

//   try {

//     const { boxes, packType } = req.body;

//     if (!boxes || !boxes.length) {
//       return res.status(400).json({
//         error: "No boxes selected"
//       });
//     }

//     const pkg = getPackageDetails(boxes, packType);

//     const order = await razorpay.orders.create({
//       amount: pkg.price * 100,
//       currency: "INR",
//       receipt: "order_" + Date.now()
//     });

//     res.json(order);

//   } catch (err) {

//     console.error("Create order error:", err);

//     res.status(500).json({
//       error: "Order creation failed"
//     });

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
//       packType,
//       fullName,
//       email,
//       mobile,
//       houseNo,
//       street,
//       city,
//       pincode,
//       orderId
//     } = req.body;

//     /* VERIFY SIGNATURE */

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expected = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expected !== razorpay_signature) {
//       return res.status(400).json({
//         error: "Invalid payment signature"
//       });
//     }

//     const pkg = getPackageDetails(boxes, packType);

//     /* UPDATE GRID BOXES */

//     for (const box of boxes) {

//       await supabase
//         .from("grid_boxes")
//         .update({
//           status: "booked",
//           booked_at: new Date().toISOString()
//         })
//         .eq("box_number", box);

//     }

//     /* INSERT MEMBER */

//     const { error: insertError } = await supabase
//       .from("members")
//       .insert({
//         order_id: orderId,
//         box_number: boxes.join(", "),
//         full_name: fullName,
//         email,
//         mobile,
//         house_no: houseNo,
//         street,
//         city,
//         pincode,
//         package_type: pkg.label,
//         no_of_soaps: pkg.soaps,
//         amount_paid: pkg.price,
//         payment_id: razorpay_payment_id,
//         payment_status: "success",
//         created_at: new Date().toISOString()
//       });

//     if (insertError) {
//       console.error("Insert member error:", insertError);
//     }

//     /* SEND EMAIL */

//     await resend.emails.send({
//       from: "Diya Soaps <support@diyasoaps.com>",
//       to: email,
//       subject: `🎉 Order Confirmed | ${orderId}`,
//       html: `
//       <h2>Thank You ${fullName}</h2>
//       <p>Your order is confirmed.</p>
//       <p>Order ID: ${orderId}</p>
//       <p>Package: ${pkg.label}</p>
//       <p>Boxes: ${boxes.join(", ")}</p>
//       <p>Total Soaps: ${pkg.soaps}</p>
//       <p>Amount Paid: ₹${pkg.price}</p>
//       `
//     });

//     res.json({
//       success: true
//     });

//   } catch (err) {

//     console.error("Verify payment error:", err);

//     res.status(500).json({
//       error: "Verification failed"
//     });

//   }

// });

// /* ================= START SERVER ================= */

// const PORT = process.env.PORT || 10000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
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
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const resend = new Resend(process.env.RESEND_API_KEY);

/* ================= PACKAGE HELPER ================= */

function getPackageDetails(boxes, packType) {

  const boxCount = boxes.length;
  let price = 0;
  let soaps = 0;
  let label = "";

  if (packType === "HALF_YEAR") {
    label = "Half-Yearly Pack";
    soaps = boxCount * 6;
    price = boxCount * 900;
  }
  else if (packType === "ANNUAL") {
    label = "Annual Pack";
    soaps = boxCount * 12;
    price = boxCount * 1188;
  }
  else {
    label = "Regular Box";
    soaps = boxCount * 3;
    price = boxCount * 600;
  }

  /* TEST MODE (₹1 payment) */

  if (process.env.TEST_MODE === "true") {
    price = 1;
    console.log("⚠ TEST MODE ENABLED → ₹1 payment");
  }

  return { label, soaps, price };

}

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend running ✅"
  });
});

/* ================= MEMBERS API ================= */

app.get("/members", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch members" });
    }

    res.json(data);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Server error" });

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
      receipt: "order_" + Date.now()
    });

    res.json(order);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Order creation failed" });

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
      orderId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const pkg = getPackageDetails(boxes, packType);

    /* UPDATE GRID */

    for (const box of boxes) {

      await supabase
        .from("grid_boxes")
        .update({
          status: "booked",
          booked_at: new Date().toISOString()
        })
        .eq("box_number", box);

    }

    /* INSERT MEMBER */

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
      created_at: new Date().toISOString()
    });

    /* ================= CUSTOMER EMAIL ================= */

    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: email,
      subject: `🎉 Order Confirmed | ${orderId}`,
      html: `
      <h2>Thank You ${fullName}</h2>
      <p>Your order is confirmed.</p>

      <p><b>Order ID:</b> ${orderId}</p>
      <p><b>Package:</b> ${pkg.label}</p>
      <p><b>Boxes:</b> ${boxes.join(", ")}</p>
      <p><b>Total Soaps:</b> ${pkg.soaps}</p>
      <p><b>Amount Paid:</b> ₹${pkg.price}</p>
      `
    });

    /* ================= OWNER EMAIL ================= */

    await resend.emails.send({
      from: "Diya Soaps <support@diyasoaps.com>",
      to: "diyasoapbusiness@gmail.com",
      subject: `🛒 New Order Received | ${orderId}`,
      html: `
      <h2>New Order Received</h2>

      <p><b>Name:</b> ${fullName}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Mobile:</b> ${mobile}</p>

      <p><b>Boxes:</b> ${boxes.join(", ")}</p>
      <p><b>Total Soaps:</b> ${pkg.soaps}</p>
      <p><b>Amount:</b> ₹${pkg.price}</p>

      <p><b>Address:</b> ${houseNo}, ${street}, ${city} - ${pincode}</p>
      `
    });

    res.json({ success: true });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Verification failed" });

  }

});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});