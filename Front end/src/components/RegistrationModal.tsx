import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://diya-backenddiya-backend.onrender.com";

declare global { interface Window { Razorpay: any; } }

type OfferPack = "HALF_YEAR" | "ANNUAL" | "RED_SANDAL" | null;

// ─── Pack config — mirrors backend exactly ────────────────────────────────────
const PACK_INFO: Record<NonNullable<OfferPack> | "NORMAL", {
  label:       string;
  soapsPerBox: number;
  pricePerBox: number;
  mrpPerBox:   number | null;
}> = {
  NORMAL:     { label: "Starter Pack",           soapsPerBox: 1,  pricePerBox: 300,   mrpPerBox: null },
  HALF_YEAR:  { label: "Value Pack",             soapsPerBox: 3,  pricePerBox: 600,   mrpPerBox: 900  },
  ANNUAL:     { label: "Bumper Pack",            soapsPerBox: 6,  pricePerBox: 900,   mrpPerBox: 1800 },
  RED_SANDAL: { label: "Red Sandal Premium Kit", soapsPerBox: 14, pricePerBox: 50000, mrpPerBox: null },
};

interface Props {
  selectedBoxes: number[];
  offerPack:     OfferPack;
  qty?:          number;           // number of boxes (from ShopSection)
  onClose:       () => void;
  onSuccess:     (orderId: string) => void;
}

type FormState = {
  fullName: string;
  mobile:   string;
  email:    string;
  houseNo:  string;
  street:   string;
  city:     string;
  pincode:  string;
};

const INIT: FormState = {
  fullName: "", mobile: "", email: "",
  houseNo: "", street: "", city: "", pincode: "",
};

export default function RegistrationModal({ selectedBoxes, offerPack, qty = 1, onClose, onSuccess }: Props) {
  const packKey = offerPack ?? "NORMAL";
  const info    = PACK_INFO[packKey];

  // ─── Derived values ────────────────────────────────────────────────────────
  const boxCount   = packKey === "RED_SANDAL" ? 1 : selectedBoxes.length;
  const totalSoaps = info.soapsPerBox * (packKey === "RED_SANDAL" ? 1 : boxCount);
  const totalPrice = packKey === "RED_SANDAL" ? info.pricePerBox : info.pricePerBox * boxCount;
  const totalMRP   = info.mrpPerBox ? info.mrpPerBox * boxCount : null;
  const savings    = totalMRP ? totalMRP - totalPrice : 0;

  const [form,    setForm]    = useState<FormState>(INIT);
  const [errors,  setErrors]  = useState<Partial<FormState>>({});
  const [paying,  setPaying]  = useState(false);
  const [payStep, setPayStep] = useState<"FORM" | "PROCESSING" | "VERIFYING" | "SUCCESS">("FORM");
  const [paidId,  setPaidId]  = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name as keyof FormState]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.fullName.trim())              e.fullName = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile   = "Enter valid 10-digit mobile number";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    if (!form.houseNo.trim())               e.houseNo  = "House No. is required";
    if (!form.street.trim())                e.street   = "Street is required";
    if (!form.city.trim())                  e.city     = "City is required";
    if (!/^\d{6}$/.test(form.pincode))      e.pincode  = "Enter valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const loadRzp = () => new Promise<boolean>(res => {
    if (window.Razorpay) return res(true);
    const s   = document.createElement("script");
    s.src     = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });

  const handlePay = async () => {
    if (!validate() || paying) return;
    setPaying(true);
    setPayStep("PROCESSING");

    try {
      /* 1. Reserve boxes */
      if (packKey !== "RED_SANDAL") {
        const { error: re } = await supabase
          .from("grid_boxes")
          .update({ status: "reserved", reserved_at: new Date().toISOString() })
          .in("box_number", selectedBoxes);
        if (re) throw new Error("Failed to reserve boxes.");
      }

      /* 2. Create Razorpay order */
      const or = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boxes:    selectedBoxes,
          packType: packKey,
          amount:   totalPrice * 100,
        }),
      });
      if (!or.ok) throw new Error("Failed to create payment order.");
      const { id: rzpOrderId } = await or.json();

      /* 3. Load Razorpay SDK */
      if (!await loadRzp()) throw new Error("Payment gateway failed to load.");

      /* 4. Open checkout */
      await new Promise<void>((resolve, reject) => {
        const fullAddress = `${form.houseNo}, ${form.street}, ${form.city} - ${form.pincode}`;
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:      totalPrice * 100,
          currency:    "INR",
          name:        "Diya Natural Products",
          description: `${info.label} — ${totalSoaps} ${packKey === "RED_SANDAL" ? "products" : "soaps"} · ₹${totalPrice.toLocaleString()}`,
          order_id:    rzpOrderId,
          prefill:     { name: form.fullName, contact: form.mobile, email: form.email || undefined },
          notes:       { boxes: selectedBoxes.join(","), pack: packKey, address: fullAddress },
          theme:       { color: "#d97706" },

          handler: async (response: any) => {
            setPayStep("VERIFYING");
            try {
              const vr = await fetch(`${BACKEND_URL}/verify-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  boxes:   selectedBoxes,
                  pack:    packKey,
                  orderId: response.razorpay_payment_id,
                  customer: {
                    name:    form.fullName,
                    phone:   form.mobile,
                    email:   form.email,
                    houseNo: form.houseNo,
                    street:  form.street,
                    city:    form.city,
                    pincode: form.pincode,
                    address: fullAddress,
                  },
                }),
              });
              if (!vr.ok) throw new Error("Payment verification failed.");

              /* Mark boxes as booked */
              if (packKey !== "RED_SANDAL") {
                await supabase
                  .from("grid_boxes")
                  .update({
                    status:         "booked",
                    customer_name:  form.fullName,
                    customer_phone: form.mobile,
                    order_id:       response.razorpay_payment_id,
                    booked_at:      new Date().toISOString(),
                  })
                  .in("box_number", selectedBoxes);
              }

              setPaidId(response.razorpay_payment_id || rzpOrderId);
              setPayStep("SUCCESS");
              resolve();
            } catch (err: any) {
              if (packKey !== "RED_SANDAL") {
                await supabase.from("grid_boxes").update({ status: "available", reserved_at: null }).in("box_number", selectedBoxes);
              }
              reject(err);
            }
          },

          modal: {
            ondismiss: async () => {
              if (packKey !== "RED_SANDAL") {
                await supabase.from("grid_boxes").update({ status: "available", reserved_at: null }).in("box_number", selectedBoxes);
              }
              reject(new Error("Payment cancelled"));
            },
          },
        });

        rzp.on("payment.failed", async (r: any) => {
          if (packKey !== "RED_SANDAL") {
            await supabase.from("grid_boxes").update({ status: "payment_failed" }).in("box_number", selectedBoxes);
          }
          reject(new Error(r.error?.description || "Payment failed"));
        });

        rzp.open();
      });

    } catch (err: any) {
      alert(err?.message || "Payment failed. Please try again.");
      setPayStep("FORM");
      setPaying(false);
    }
  };

  /* ══════════════ SUCCESS SCREEN ══════════════ */
  if (payStep === "SUCCESS") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Nunito',sans-serif" }}>
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}
        style={{ background: "#fff", borderRadius: 30, overflow: "hidden", maxWidth: 460, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>
        <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", padding: "32px 28px 24px", textAlign: "center" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5, delay: 0.1 }} style={{ fontSize: 60, marginBottom: 10 }}>✅</motion.div>
          <h2 style={{ margin: 0, color: "#fff", fontSize: 24, fontWeight: 900 }}>Payment Successful!</h2>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Order confirmed · Boxes are booked</p>
        </div>
        <div style={{ padding: "24px 28px 28px" }}>
          <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "12px 16px", marginBottom: 14, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 10, color: "#15803d", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Payment ID</p>
            <p style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 900, color: "#166534", wordBreak: "break-all" }}>{paidId}</p>
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#92400e" }}>📦 {info.label}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#a16207" }}>
                  {packKey === "RED_SANDAL"
                    ? "🔴 14 Ayurvedic Products"
                    : `🧼 ${boxCount} box${boxCount > 1 ? "es" : ""} × ${info.soapsPerBox} soap${info.soapsPerBox > 1 ? "s" : ""} = ${totalSoaps} soaps total`
                  }
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                {totalMRP && <p style={{ margin: 0, fontSize: 12, color: "#bbb", textDecoration: "line-through", fontWeight: 700 }}>MRP ₹{totalMRP.toLocaleString()}</p>}
                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#16a34a" }}>₹{totalPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Per-box breakdown */}
            {packKey !== "RED_SANDAL" && (
              <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "8px 10px", marginBottom: 8, fontSize: 11, color: "#78350f" }}>
                <p style={{ margin: 0 }}>
                  ₹{info.pricePerBox.toLocaleString()}/box × {boxCount} box{boxCount > 1 ? "es" : ""}
                  {totalMRP ? ` (MRP ₹${info.mrpPerBox!.toLocaleString()}/box)` : ""}
                  {" = "}<strong>₹{totalPrice.toLocaleString()}</strong>
                </p>
              </div>
            )}

            {savings > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", background: "#dcfce7", border: "1px solid #86efac", borderRadius: 99, padding: "2px 10px", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#16a34a" }}>💰 You saved ₹{savings.toLocaleString()}</span>
              </div>
            )}

            {packKey !== "RED_SANDAL" && (
              <p style={{ margin: "5px 0 2px", fontSize: 11, color: "#78350f" }}>
                🎯 Box{boxCount > 1 ? "es" : ""}: <strong>{selectedBoxes.map(b => String(b).padStart(3, "0")).join(", ")}</strong>
              </p>
            )}
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#78350f" }}>👤 {form.fullName} · 📱 {form.mobile}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#78350f" }}>🏠 {form.houseNo}, {form.street}, {form.city} - {form.pincode}</p>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
            {[
              "📱 WhatsApp confirmation coming shortly",
              "🚚 Dispatched within 2–3 business days",
              "🏆 Lucky draw entry confirmed!",
              "🐄 10% of purchase goes to Goshala",
            ].map((t, i, a) => (
              <p key={i} style={{ margin: i < a.length - 1 ? "0 0 5px" : 0, fontSize: 11, color: "#64748b" }}>{t}</p>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onSuccess(paidId)}
            style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#d97706,#b45309)", color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 24px rgba(180,83,9,0.35)", fontFamily: "'Nunito',sans-serif" }}>
            🛒 Back to Shop
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  /* ══════════════ PROCESSING / VERIFYING ══════════════ */
  if (payStep === "PROCESSING" || payStep === "VERIFYING") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: "#fff", borderRadius: 26, padding: "44px 36px", textAlign: "center", maxWidth: 320, width: "90%", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
        <Loader2 size={48} color="#d97706" style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px", display: "block" }} />
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900, color: "#111" }}>
          {payStep === "VERIFYING" ? "Verifying Payment…" : "Opening Payment…"}
        </h3>
        <p style={{ margin: 0, color: "#888", fontSize: 12, lineHeight: 1.6 }}>
          {payStep === "VERIFYING" ? "Please do not close or refresh the page." : "Connecting to secure payment gateway…"}
        </p>
      </motion.div>
    </div>
  );

  /* ══════════════ FORM ══════════════ */
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 14px 48px", fontFamily: "'Nunito',sans-serif" }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 500, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", overflow: "hidden" }}
        >
          {/* ── STICKY HEADER ── */}
          <div style={{ background: "linear-gradient(135deg,#78350f,#d97706,#fbbf24)", padding: "20px 24px 16px", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Step 3 of 3</p>
                <h2 style={{ margin: "2px 0 0", color: "#fff", fontSize: 19, fontWeight: 900 }}>Register &amp; Pay</h2>
              </div>
              <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>

            {/* ── ORDER SUMMARY CARD ── */}
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#fff" }}>📦 {info.label}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                    {packKey === "RED_SANDAL"
                      ? "🔴 14 Ayurvedic Products"
                      : `🧼 ${boxCount} box${boxCount > 1 ? "es" : ""} × ${info.soapsPerBox} soap${info.soapsPerBox > 1 ? "s" : ""} = ${totalSoaps} soaps`
                    }
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  {totalMRP && <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", textDecoration: "line-through", fontWeight: 700 }}>MRP ₹{totalMRP.toLocaleString()}</p>}
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>₹{totalPrice.toLocaleString()}</p>
                  {savings > 0 && <p style={{ margin: "2px 0 0", fontSize: 10, color: "#86efac", fontWeight: 700 }}>Save ₹{savings.toLocaleString()}</p>}
                </div>
              </div>

              {/* Price breakdown row */}
              {packKey !== "RED_SANDAL" && (
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                    ₹{info.pricePerBox.toLocaleString()}/box × {boxCount} box{boxCount > 1 ? "es" : ""}
                    {totalMRP ? ` (MRP ₹${info.mrpPerBox!.toLocaleString()}/box)` : ""}
                    {" = "}<strong style={{ color: "#fbbf24" }}>₹{totalPrice.toLocaleString()}</strong>
                  </p>
                </div>
              )}

              {packKey !== "RED_SANDAL" && (
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                  🎯 Box{boxCount > 1 ? "es" : ""}:{" "}
                  <strong style={{ color: "#fbbf24" }}>
                    {selectedBoxes.map(b => String(b).padStart(3, "0")).join(", ")}
                  </strong>
                </p>
              )}
            </div>
          </div>

          {/* ── FORM BODY ── */}
          <div style={{ padding: "22px 24px 28px" }}>
            <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 800, color: "#78350f", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              📋 Delivery &amp; Contact Details
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <Field label="Full Name *"                   name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name"                 icon="👤" error={errors.fullName} />
              <Field label="Mobile Number *"               name="mobile"   value={form.mobile}   onChange={handleChange} placeholder="10-digit mobile number"         icon="📱" error={errors.mobile}   type="tel" maxLength={10} />
              <Field label="Email Address (optional)"      name="email"    value={form.email}    onChange={handleChange} placeholder="your@email.com"                  icon="✉️" error={errors.email}    type="email" />
              <Field label="House No. *"                   name="houseNo"  value={form.houseNo}  onChange={handleChange} placeholder="Door / House / Flat No."        icon="🏠" error={errors.houseNo} />
              <Field label="Street / Area *"               name="street"   value={form.street}   onChange={handleChange} placeholder="Street, Area, Landmark"          icon="🛣️" error={errors.street} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="City *"    name="city"    value={form.city}    onChange={handleChange} placeholder="City"      icon="🏙️" error={errors.city} />
                <Field label="Pincode *" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit"   icon="📮" error={errors.pincode} type="tel" maxLength={6} />
              </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handlePay} disabled={paying}
              style={{
                width: "100%", marginTop: 22, padding: "17px 0", borderRadius: 15, border: "none",
                background: paying ? "#e5e7eb" : "linear-gradient(135deg,#d97706,#b45309)",
                color: paying ? "#aaa" : "#fff", fontSize: 16, fontWeight: 900,
                cursor: paying ? "not-allowed" : "pointer",
                boxShadow: paying ? "none" : "0 10px 32px rgba(180,83,9,0.4)",
                letterSpacing: "0.04em", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              {paying
                ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Processing…</>
                : <>🔒 Pay ₹{totalPrice.toLocaleString()} &amp; Confirm Order</>
              }
            </motion.button>

            <p style={{ margin: "9px 0 0", textAlign: "center", fontSize: 10, color: "#94a3b8" }}>
              🔒 Secure via Razorpay ·{" "}
              <a href="/terms"  target="_blank" style={{ color: "#d97706" }}>Terms</a> &amp;{" "}
              <a href="/refund" target="_blank" style={{ color: "#d97706" }}>Refund Policy</a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Field styles ── */
const LS: React.CSSProperties = { display: "block", marginBottom: 5, fontSize: 11, fontWeight: 700, color: "#78350f" };
const IS: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 12px 11px 40px", borderRadius: 10, border: "1.5px solid #fde68a", fontSize: 13, fontFamily: "'Nunito',sans-serif", outline: "none", background: "#fffbeb", color: "#111", transition: "border-color 0.2s" };
const ES: React.CSSProperties = { margin: "3px 0 0", fontSize: 10, color: "#ef4444", fontWeight: 600 };

interface FP {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; maxLength?: number; icon?: string; error?: string;
}

function Field({ label, name, value, onChange, placeholder, type = "text", maxLength, icon, error }: FP) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={LS}>{label}</label>
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none", lineHeight: 1 }}>{icon}</span>}
        <input
          name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...IS, paddingLeft: icon ? 40 : 12, borderColor: error ? "#ef4444" : focused ? "#d97706" : "#fde68a", boxShadow: focused ? "0 0 0 3px rgba(217,119,6,0.12)" : "none" }}
        />
      </div>
      {error && <p style={ES}>⚠ {error}</p>}
    </div>
  );
}