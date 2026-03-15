import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import twilio from "twilio";


dotenv.config();

/* TWILIO CLIENT */

const twilioClient = twilio(
 process.env.TWILIO_ACCOUNT_SID,
 process.env.TWILIO_AUTH_TOKEN
);

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

/* ================= TEST MODE ================= */

const TEST_MODE = true;

/* ================= PACKAGE HELPER ================= */

function getPackageDetails(boxes, packType) {

  const boxCount = boxes.length;

  const priceRegular = TEST_MODE ? boxCount * 1 : boxCount * 600;
  const priceHalf = TEST_MODE ? boxCount * 1: boxCount * 900;
  const priceAnnual = TEST_MODE ? boxCount * 1: boxCount * 1188;

  if (packType === "HALF_YEAR") {
    return {
      label: "Half-Yearly Pack",
      soaps: boxCount * 6,
      price: priceHalf
    };
  }

  if (packType === "ANNUAL") {
    return {
      label: "Annual Pack",
      soaps: boxCount * 12,
      price: priceAnnual
    };
  }

  return {
    label: "Regular Box",
    soaps: boxCount * 3,
    price: priceRegular
  };
}

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend running"
  });
});

/* ================= ADMIN MEMBERS TABLE ================= */

app.get("/members", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "Failed to fetch members"
      });
    }

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: "Members API failed"
    });

  }

});

/* ================= CONTACT FORM API ================= */

app.post("/send-contact-mail", async (req, res) => {

  try {

    const { name, email, phone, message } = req.body;

    await supabase.from("contact_messages").insert({
      name,
      email,
      phone,
      message,
      created_at: new Date().toISOString()
    });

    await resend.emails.send({

      from: "Diya Soaps <support@diyasoaps.com>",
      to: "diyasoapbusiness@gmail.com",
      subject: "📩 New Contact Message",

      html: `
      <div style="font-family:Arial;padding:20px">
      <h2 style="color:#f97316">New Contact Message</h2>

      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>

      <p><b>Message:</b></p>

      <div style="background:#fff7ed;padding:10px;border-radius:6px">
      ${message}
      </div>

      </div>
      `
    });

    res.json({ success: true });

  } catch (err) {

    res.status(500).json({
      error: "Contact form failed"
    });

  }

});

/* ================= MEMBER COUNT ================= */

app.get("/api/slots", async (req, res) => {

  const { count } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true });

  res.json({
    booked: count || 0
  });

});

/* ================= CREATE ORDER ================= */

app.post("/create-order", async (req, res) => {

  try {

    const { boxes, packType } = req.body;

    if (!boxes || boxes.length === 0) {
      return res.status(400).json({
        error: "No boxes selected"
      });
    }

    const pkg = getPackageDetails(boxes, packType);

    const order = await razorpay.orders.create({
      amount: pkg.price * 100,
      currency: "INR",
      receipt: "order_" + Date.now()
    });

    res.json(order);

  } catch (err) {

    res.status(500).json({
      error: "Order creation failed"
    });

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

    const name = fullName || "Customer";

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        error: "Invalid payment signature"
      });
    }

    const pkg = getPackageDetails(boxes, packType);

    for (const box of boxes) {

      await supabase
        .from("grid_boxes")
        .update({
          status: "booked",
          booked_at: new Date().toISOString()
        })
        .eq("box_number", box);

    }

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

from:"Diya Soaps <support@diyasoaps.com>",
to:email,
subject:`🎉 Your Diya Soaps Order Confirmed | ${orderId}`,

html:`
<div style="background:#f4f6f8;padding:40px;font-family:Arial">

<div style="
max-width:650px;
margin:auto;
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 5px 25px rgba(0,0,0,0.1)
">

<div style="
background:linear-gradient(90deg,#f97316,#16a34a);
padding:25px;
text-align:center;
color:white
">

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

${boxes.map(b=>`
<span style="
background:#fde047;
padding:8px 14px;
margin:4px;
border-radius:6px;
font-weight:bold;
display:inline-block">
${String(b).padStart(3,"0")}
</span>
`).join("")}

</div>

<br>

<p><b>Total Boxes:</b> ${boxes.length}</p>
<p><b>Total Soaps:</b> ${pkg.soaps}</p>

<p style="font-size:18px">

<b>Amount Paid:</b>

<span style="color:#16a34a;font-weight:bold">
₹${pkg.price}
</span>

</p>

<hr>

<div style="
background:#f0fdf4;
padding:15px;
border-left:4px solid #16a34a;
border-radius:8px
">

🎁 Your lucky draw boxes are successfully booked.
<br>
Best of luck for the <b>Gold Lucky Draw</b>.

</div>

<br>

<p>
Warm Regards,<br>
<b>Diya Soaps Team</b>
</p>

</div>

<div style="
background:#111827;
color:white;
text-align:center;
padding:15px;
font-size:13px
">

© 2026 Diya Soaps  
support@diyasoaps.com

</div>

</div>

</div>
`
});

/* ================= OWNER EMAIL ================= */

await resend.emails.send({

from:"Diya Soaps <support@diyasoaps.com>",
to:"diyasoapbusiness@gmail.com",
subject:`🧾 New Order Received | ${orderId}`,

html:`

<div style="background:#f4f6f8;padding:40px;font-family:Arial">

<div style="
max-width:600px;
margin:auto;
background:white;
border-radius:10px;
overflow:hidden;
box-shadow:0 5px 20px rgba(0,0,0,0.1)
">

<div style="
background:#16a34a;
padding:20px;
color:white;
text-align:center
">

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
<span style="color:#16a34a;font-weight:bold">
₹${pkg.price}
</span>
</p>

</div>

<div style="
background:#111827;
color:white;
text-align:center;
padding:15px;
font-size:13px
">

Diya Soaps Admin Notification

</div>

</div>

</div>

`
});
/* ================= WHATSAPP + SMS NOTIFICATIONS ================= */

try {

/* ================= CUSTOMER WHATSAPP ================= */

await twilioClient.messages.create({

from: "whatsapp:" + process.env.TWILIO_PHONE_NUMBER,


to: "whatsapp:+91" + mobile,

body: `
🌿 *DIYA RED SANDAL SOAP*

✨ *Order Confirmation*

Hello *${name}* 👋

Your order has been successfully confirmed.

━━━━━━━━━━━━━━━━

📦 *Order Summary*

🧾 Order ID : ${orderId}

🧼 Package : ${pkg.label}

🎁 Lucky Box : ${boxes.join(", ")}

🧴 Total Soaps : ${pkg.soaps}

💰 Amount Paid : ₹${pkg.price}

━━━━━━━━━━━━━━━━

🏆 *Gold Lucky Draw*

For every *250 members*,  
one lucky participant wins a  
🥇 *1 Gram Gold Coin*

Your lucky box entry has been successfully registered.

Best of luck for the draw! 🍀

━━━━━━━━━━━━━━━━

📦 Delivery Time  
5-7 business days

📞 Support  
+91 81251 34699

Thank you for choosing  
🌿 *Diya Soaps*

Natural Ayurvedic Skin Care
`

});


/* ================= CUSTOMER SMS ================= */

await twilioClient.messages.create({

from: process.env.TWILIO_PHONE_NUMBER,

to: "+91" + mobile,

body: `Diya Soaps Order Confirmed

Order ID: ${orderId}
Package: ${pkg.label}
Boxes: ${boxes.length}

Total Soaps: ${pkg.soaps}

Amount Paid: ₹${pkg.price}

Delivery: 5-7 days

Support: 8125134699`

});


/* ================= OWNER WHATSAPP ================= */

await twilioClient.messages.create({

from: "whatsapp:" + process.env.TWILIO_PHONE_NUMBER,


to: "whatsapp:+918125134699",

body: `
📦 *NEW ORDER RECEIVED*

━━━━━━━━━━━━━━━━

👤 Customer : ${name}

📱 Mobile : ${mobile}

🧾 Order ID : ${orderId}

🧼 Package : ${pkg.label}

🎁 Lucky Boxes : ${boxes.join(", ")}

🧴 Total Soaps : ${pkg.soaps}

💰 Amount : ₹${pkg.price}

━━━━━━━━━━━━━━━━

Diya Soaps Admin Notification
`

});


/* ================= OWNER SMS ================= */

await twilioClient.messages.create({

from: process.env.TWILIO_PHONE_NUMBER,

to: "+918125134699",

body: `New Order Received

Customer: ${name}

Order ID: ${orderId}

Package: ${pkg.label}
Boxes: ${boxes.length}


Amount: ₹${pkg.price}`
 
});

} catch (err) {

console.log("Notification error:", err);

}


res.json({success:true});    

} catch(err){

res.status(500).json({error:"Verification failed"});

}

});
/* ================= START SERVER ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
console.log("🚀 Server running on port " + PORT);
});
