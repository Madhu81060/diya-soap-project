import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

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
  offerPack:     OfferPack;
  qty?:          number;
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

export default function RegistrationModal({ offerPack, qty = 1, onClose, onSuccess }: Props) {
  const packKey = offerPack ?? "NORMAL";
  const info    = PACK_INFO[packKey];

  // ─── Derived values ────────────────────────────────────────────────────────
  const boxCount   = qty;
  const totalSoaps = info.soapsPerBox * boxCount;
  const totalPrice = info.pricePerBox * boxCount;
  const totalMRP   = info.mrpPerBox ? info.mrpPerBox * boxCount : null;
  const savings    = totalMRP ? totalMRP - totalPrice : 0;

  const [form,    setForm]    = useState<FormState>(INIT);
  const [errors,  setErrors]  = useState<Partial<FormState>>({});
  const [paying,  setPaying]  = useState(false);
  const [payStep, setPayStep] = useState<"FORM" | "PROCESSING" | "VERIFYING" | "SUCCESS">("FORM");
  const [paidId,  setPaidId]  = useState("");

  React.useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);


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
      const fullAddress = `${form.houseNo}, ${form.street}, ${form.city} - ${form.pincode}`;
      /* 1. Create Razorpay order */
      const or = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qty:      boxCount,
          packType: packKey,
          amount:   totalPrice * 100,
          customer: {
            name:    form.fullName,
            phone:   form.mobile,
            email:   form.email,
            houseNo: form.houseNo,
            street:  form.street,
            city:    form.city,
            pincode: form.pincode,
            address: fullAddress,
          }
        }),
      });
      if (!or.ok) throw new Error("Failed to create payment order.");
      const { id: rzpOrderId } = await or.json();

      /* 2. Load Razorpay SDK */
      if (!await loadRzp()) throw new Error("Payment gateway failed to load.");

      /* 3. Open checkout */
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:      totalPrice * 100,
          currency:    "INR",
          name:        "Diya Natural Products",
          description: `${info.label} — ${totalSoaps} ${packKey === "RED_SANDAL" ? "products" : "soaps"} · ₹${totalPrice.toLocaleString()}`,
          order_id:    rzpOrderId,
          prefill:     { name: form.fullName, contact: form.mobile, email: form.email || undefined },
          notes:       { pack: packKey, address: fullAddress },
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
                  qty:     boxCount,
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

              setPaidId(response.razorpay_payment_id || rzpOrderId);
              setPayStep("SUCCESS");
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },

          modal: {
            ondismiss: async () => {
              reject(new Error("Payment cancelled"));
            },
          },
        });

        rzp.on("payment.failed", async (r: any) => {
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
  if (payStep === "SUCCESS") return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 8px 32px", overflowY: "auto", fontFamily: "'Nunito',sans-serif" }}>
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="bg-white rounded-[24px] sm:rounded-[30px] overflow-hidden max-w-[440px] w-full max-h-[92vh] flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.35)]"
      >
        <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }} className="p-6 sm:p-8 text-center flex-shrink-0">
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5, delay: 0.1 }} className="text-[48px] sm:text-[60px] mb-2 leading-none">✅</motion.div>
          <h2 className="m-0 text-white text-xl sm:text-2xl font-black">Payment Successful!</h2>
          <p className="m-0 mt-1 text-white/80 text-xs sm:text-sm">Order confirmed</p>
        </div>
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 flex flex-col gap-3">
          <div className="bg-[#f0fdf4] border-[1.5px] border-[#86efac] rounded-xl p-3 text-center">
            <p className="m-0 text-[10px] text-[#15803d] font-bold uppercase tracking-wider">Payment ID</p>
            <p className="m-0 mt-0.5 text-sm sm:text-[15px] font-black text-[#166534] break-all">{paidId}</p>
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="bg-[#fffbeb] border-[1.5px] border-[#fde68a] rounded-xl p-3.5 sm:p-4 text-left">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div>
                <p className="m-0 text-xs sm:text-sm font-black text-[#92400e]">📦 {info.label}</p>
                <p className="m-0 mt-0.5 text-[11px] sm:text-xs text-[#a16207]">
                  {packKey === "RED_SANDAL"
                    ? `🔴 ${boxCount} kit${boxCount > 1 ? "s" : ""} · ${totalSoaps} Ayurvedic Products`
                    : `🧼 ${boxCount} box${boxCount > 1 ? "es" : ""} × ${info.soapsPerBox} soap${info.soapsPerBox > 1 ? "s" : ""} = ${totalSoaps} soaps total`
                  }
                </p>
              </div>
              <div className="text-right shrink-0">
                {totalMRP && <p className="m-0 text-[10px] sm:text-xs text-[#bbb] line-through font-bold">MRP ₹{totalMRP.toLocaleString()}</p>}
                <p className="m-0 text-base sm:text-lg font-black text-[#16a34a]">₹{totalPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Per-box breakdown */}
            {packKey !== "RED_SANDAL" && (
              <div className="bg-white/60 rounded-lg p-2 mb-2 text-[10px] sm:text-xs text-[#78350f]">
                <p className="m-0">
                  ₹{info.pricePerBox.toLocaleString()}/box × {boxCount} box{boxCount > 1 ? "es" : ""}
                  {totalMRP ? ` (MRP ₹${info.mrpPerBox!.toLocaleString()}/box)` : ""}
                  {" = "}<strong>₹{totalPrice.toLocaleString()}</strong>
                </p>
              </div>
            )}

            {packKey === "RED_SANDAL" && boxCount > 1 && (
              <div className="bg-white/60 rounded-lg p-2 mb-2 text-[10px] sm:text-xs text-[#78350f]">
                <p className="m-0">
                  ₹{info.pricePerBox.toLocaleString()}/kit × {boxCount} kits = <strong>₹{totalPrice.toLocaleString()}</strong>
                </p>
              </div>
            )}

            {savings > 0 && (
              <div className="inline-flex items-center bg-[#dcfce7] border border-[#86efac] rounded-full px-2.5 py-0.5 mb-2">
                <span className="text-[10px] sm:text-xs font-extrabold text-[#16a34a]">💰 You saved ₹{savings.toLocaleString()}</span>
              </div>
            )}

            <p className="m-0 mt-1 text-[11px] text-[#78350f]">👤 {form.fullName} · 📱 {form.mobile}</p>
            <p className="m-0 mt-0.5 text-[11px] text-[#78350f]">🏠 {form.houseNo}, {form.street}, {form.city} - {form.pincode}</p>
          </div>

          <div className="bg-[#f8fafc] rounded-xl p-3 sm:p-4 text-left flex flex-col gap-1">
            {[
              "📱 WhatsApp confirmation coming shortly",
              "🚚 Dispatched within 2–3 business days",
              "🐄 10% of purchase goes to Goshala",
            ].map((t, i) => (
              <p key={i} className="m-0 text-[10px] sm:text-xs text-[#64748b]">{t}</p>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => onSuccess(paidId)}
            className="w-full py-3 rounded-xl border-none bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs sm:text-[14px] font-black cursor-pointer shadow-[0_8px_24px_rgba(180,83,9,0.3)] font-nunito transition-all duration-200">
            🛒 Back to Shop
          </motion.button>
        </div>
      </motion.div>
    </div>,
    document.body
  );

  /* ══════════════ PROCESSING / VERIFYING ══════════════ */
  if (payStep === "PROCESSING" || payStep === "VERIFYING") return createPortal(
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
    </div>,
    document.body
  );

  /* ══════════════ FORM ══════════════ */
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px 8px 32px", fontFamily: "'Nunito',sans-serif" }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="bg-white rounded-[20px] sm:rounded-[26px] w-full max-w-[480px] max-h-[92vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          {/* ── HEADER ── */}
          <div className="p-3.5 sm:p-[20px_24px_16px] flex-shrink-0" style={{ background: "linear-gradient(135deg,#78350f,#d97706,#fbbf24)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <p className="text-[9px] sm:text-xs font-bold tracking-widest text-white/70 m-0 uppercase">Step 3 of 3</p>
                <h2 className="text-base sm:text-lg font-black text-white mt-0.5 mb-0">Register &amp; Pay</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full bg-white/20 border-[1.5px] border-white/40 text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-white/35 shrink-0">
                <X size={16} />
              </button>
            </div>

            {/* ── ORDER SUMMARY CARD ── */}
            <div className="bg-black/20 rounded-xl p-3 sm:p-4 border border-white/10 mt-1">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <p className="m-0 text-xs sm:text-sm font-black text-white">📦 {info.label}</p>
                  <p className="m-0 mt-0.5 text-[11px] sm:text-xs text-white/75">
                    {packKey === "RED_SANDAL"
                      ? `🔴 ${boxCount} kit${boxCount > 1 ? "s" : ""} · ${totalSoaps} Ayurvedic Products`
                      : `🧼 ${boxCount} box${boxCount > 1 ? "es" : ""} × ${info.soapsPerBox} soap${info.soapsPerBox > 1 ? "s" : ""} = ${totalSoaps} soaps`
                    }
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  {totalMRP && <p className="m-0 text-[10px] sm:text-xs text-white/40 line-through font-bold">MRP ₹{totalMRP.toLocaleString()}</p>}
                  <p className="m-0 text-base sm:text-lg font-black text-amber-300">₹{totalPrice.toLocaleString()}</p>
                  {savings > 0 && <p className="m-0 mt-0.5 text-[9px] sm:text-[10px] text-green-300 font-bold">Save ₹{savings.toLocaleString()}</p>}
                </div>
              </div>

              {/* Price breakdown row */}
              {packKey !== "RED_SANDAL" && (
                <div className="bg-white/5 rounded-lg p-1.5 sm:p-2 mb-1.5">
                  <p className="m-0 text-[10px] sm:text-xs text-white/75">
                    ₹{info.pricePerBox.toLocaleString()}/box × {boxCount} box{boxCount > 1 ? "es" : ""}
                    {totalMRP ? ` (MRP ₹${info.mrpPerBox!.toLocaleString()}/box)` : ""}
                    {" = "}<strong className="text-amber-300">₹{totalPrice.toLocaleString()}</strong>
                  </p>
                </div>
              )}

              {packKey === "RED_SANDAL" && boxCount > 1 && (
                <div className="bg-white/5 rounded-lg p-1.5 sm:p-2 mb-1.5">
                  <p className="m-0 text-[10px] sm:text-xs text-white/75">
                    ₹{info.pricePerBox.toLocaleString()}/kit × {boxCount} kits
                    {" = "}<strong className="text-amber-300">₹{totalPrice.toLocaleString()}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── FORM BODY ── */}
          <div className="p-3.5 sm:p-[20px_24px_24px] overflow-y-auto flex-1">
            <p className="m-0 mb-3 text-[11px] sm:text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              📋 Delivery &amp; Contact Details
            </p>

            <div className="flex flex-col gap-2.5 sm:gap-3.5">
              <Field label="Full Name *"                   name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name"                 icon="👤" error={errors.fullName} />
              <Field label="Mobile Number *"               name="mobile"   value={form.mobile}   onChange={handleChange} placeholder="10-digit mobile number"         icon="📱" error={errors.mobile}   type="tel" maxLength={10} />
              <Field label="Email Address (optional)"      name="email"    value={form.email}    onChange={handleChange} placeholder="your@email.com"                  icon="✉️" error={errors.email}    type="email" />
              <Field label="House No. *"                   name="houseNo"  value={form.houseNo}  onChange={handleChange} placeholder="Door / House / Flat No."        icon="🏠" error={errors.houseNo} />
              <Field label="Street / Area *"               name="street"   value={form.street}   onChange={handleChange} placeholder="Street, Area, Landmark"          icon="🛣️" error={errors.street} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <Field label="City *"    name="city"    value={form.city}    onChange={handleChange} placeholder="City"      icon="🏙️" error={errors.city} />
                <Field label="Pincode *" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit"   icon="📮" error={errors.pincode} type="tel" maxLength={6} />
              </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handlePay} disabled={paying}
              className={`w-full mt-4 sm:mt-5 py-2.5 sm:py-3.5 rounded-xl border-none text-sm sm:text-base font-black transition-all duration-200 flex items-center justify-center gap-2 font-nunito tracking-wide ${
                paying
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-amber-600 to-amber-700 text-white cursor-pointer hover:from-amber-500 hover:to-amber-600 shadow-[0_8px_24px_rgba(180,83,9,0.3)] hover:shadow-[0_12px_28px_rgba(180,83,9,0.4)]"
              }`}
            >
              {paying
                ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
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
    </AnimatePresence>,
    document.body
  );

}

interface FP {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; maxLength?: number; icon?: string; error?: string;
}

function Field({ label, name, value, onChange, placeholder, type = "text", maxLength, icon, error }: FP) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col text-left">
      <label className="block mb-1 text-[11px] sm:text-xs font-bold text-[#78350f]">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] sm:text-[15px] pointer-events-none select-none">
            {icon}
          </span>
        )}
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ fontFamily: "'Nunito', sans-serif" }}
          className={`w-full box-border py-1.5 sm:py-2.5 pr-3 rounded-lg border-[1.5px] text-xs sm:text-[13px] outline-none bg-[#fffbeb] text-zinc-900 transition-all duration-200 ${
            icon ? "pl-9" : "pl-3"
          } ${
            error
              ? "border-red-500 focus:border-red-500"
              : focused
              ? "border-amber-600 ring-2 ring-amber-600/10"
              : "border-amber-200 hover:border-amber-300"
          }`}
        />
      </div>
      {error && <p className="mt-1 text-[10px] text-red-500 font-semibold">⚠ {error}</p>}
    </div>
  );
}