// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import GridSection from "./GridSection";
// import RegistrationModal from "./RegistrationModal";

// const TOTAL_MEMBERS = 250;
// const TEST_MODE = false;

// // ─── Prices (per-box) ────────────────────────────────────────────────────────
// const PRICE_SINGLE = TEST_MODE ? 1     : 300;    // 1 soap  per box
// const PRICE_THREE  = TEST_MODE ? 1     : 600;    // 3 soaps per box
// const PRICE_SIX    = TEST_MODE ? 1     : 900;    // 6 soaps per box
// const MRP_THREE    = TEST_MODE ? 3     : 900;    // MRP per box (Value)
// const MRP_SIX      = TEST_MODE ? 6     : 1800;   // MRP per box (Bumper)
// const PRICE_KIT    = TEST_MODE ? 1     : 50000;  // flat, 14 products

// const BACKEND_URL =
//   import.meta.env.VITE_API_URL ||
//   "https://diya-backenddiya-backend.onrender.com";

// const kitItems = [
//   { icon: "🍵", label: "Red Sandal Tea Powder" },
//   { icon: "🪵", label: "Red Sandal Stick" },
//   { icon: "🧼", label: "12 Red Sandal Soaps" },
//   { icon: "✨", label: "Face Powder" },
//   { icon: "💧", label: "Face Wash" },
//   { icon: "🚿", label: "Shampoo" },
//   { icon: "🧴", label: "Cream" },
//   { icon: "🌿", label: "White Sandal Stick" },
//   { icon: "🌾", label: "White Sandal Powder" },
//   { icon: "📿", label: "Mala" },
//   { icon: "💎", label: "Bracelet" },
//   { icon: "🦷", label: "Toothpaste" },
//   { icon: "💆", label: "Hair Oil" },
//   { icon: "🌟", label: "Face Serum" },
// ];

// type Offer = "SINGLE" | "THREE" | "SIX";
// type Step  = "SHOP" | "GRID" | "REGISTER";

// type ActivePlan = {
//   packType:    "NORMAL" | "HALF_YEAR" | "ANNUAL" | "RED_SANDAL";
//   maxBoxes:    number;     // total boxes to select in grid
//   instruction: string;
//   planTitle:   string;
//   totalPrice:  number;     // qty × pricePerBox
//   qty:         number;
//   soapsPerBox: number;
//   pricePerBox: number;
//   mrpPerBox:   number | null;
// };

// const plans = [
//   {
//     title: "Starter", subtitle: "Pack",
//     soapsLabel: "1 Soap per Box — ₹300/box",
//     pricePerBox: PRICE_SINGLE, mrpPerBox: null as number | null,
//     offer: "SINGLE" as Offer, packType: "NORMAL" as const,
//     emoji: "📦", soapsPerBox: 1,
//     features: [
//       "1 Premium Handmade Soap per box",
//       "₹300 per box",
//       "Natural Ingredients · Skin Friendly",
//     ],
//     isBest: false, badgeText: undefined as string | undefined,
//   },
//   {
//     title: "Value", subtitle: "Pack",
//     soapsLabel: "3 Soaps per Box — ₹600/box",
//     pricePerBox: PRICE_THREE, mrpPerBox: MRP_THREE,
//     offer: "THREE" as Offer, packType: "HALF_YEAR" as const,
//     badgeText: "SAVE 33%", emoji: "⭐", soapsPerBox: 3,
//     features: [
//       "3 Premium Handmade Soaps per box",
//       "MRP ₹900/box → Offer ₹600/box",
//       "Save ₹300 per box instantly",
//     ],
//     isBest: false,
//   },
//   {
//     title: "Bumper", subtitle: "Pack",
//     soapsLabel: "6 Soaps per Box — ₹900/box",
//     pricePerBox: PRICE_SIX, mrpPerBox: MRP_SIX,
//     offer: "SIX" as Offer, packType: "ANNUAL" as const,
//     badgeText: "BEST OFFER", emoji: "🎉", isBest: true, soapsPerBox: 6,
//     features: [
//       "6 Premium Handmade Soaps per box",
//       "MRP ₹1800/box → Offer ₹900/box",
//       "Save ₹900 per box instantly",
//     ],
//   },
// ];

// /* ══════════════════════════════════════════════════════════ */

// const ShopSection: React.FC = () => {
//   const topRef = useRef<HTMLDivElement>(null);

//   const [members,    setMembers]    = useState(0);
//   const [loading,    setLoading]    = useState(true);
//   const [quantities, setQuantities] = useState<Record<Offer, number>>({ SINGLE: 1, THREE: 1, SIX: 1 });
//   const [kitAdded,   setKitAdded]   = useState(false);
//   const [boughtOffer,setBoughtOffer]= useState<Offer | null>(null);
//   const [step,       setStep]       = useState<Step>("SHOP");
//   const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
//   const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);

//   const scrollToSectionTop = () => {
//     if (topRef.current) {
//       const y = topRef.current.getBoundingClientRect().top + window.scrollY - 72;
//       window.scrollTo({ top: y, behavior: "smooth" });
//     }
//   };

//   /* ── Fetch member count ── */
//   const fetchMembers = async () => {
//     try {
//       const res  = await fetch(`${BACKEND_URL}/members`);
//       const data = await res.json();
//       setMembers(data.total || 0);
//     } catch { setMembers(0); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => {
//     fetchMembers();
//     const id = setInterval(fetchMembers, 10_000);
//     return () => clearInterval(id);
//   }, []);

//   const updateQty = (offer: Offer, delta: number) =>
//     setQuantities(prev => ({ ...prev, [offer]: Math.max(1, prev[offer] + delta) }));

//   /* ── Buy a pack ── */
//   const handleBuy = (plan: (typeof plans)[0]) => {
//     setBoughtOffer(plan.offer);
//     const qty        = quantities[plan.offer];
//     const totalBoxes = qty;            // 1 box per qty unit
//     const totalPrice = plan.pricePerBox * qty;
//     const totalMRP   = plan.mrpPerBox  ? plan.mrpPerBox * qty : null;

//     setTimeout(() => {
//       setBoughtOffer(null);
//       setActivePlan({
//         packType:    plan.packType,
//         maxBoxes:    totalBoxes,
//         instruction: `Select ${totalBoxes} lucky box${totalBoxes > 1 ? "es" : ""} for your ${plan.title} ${plan.subtitle} (${plan.soapsPerBox} soap${plan.soapsPerBox > 1 ? "s" : ""} per box)`,
//         planTitle:   `${plan.title} ${plan.subtitle}`,
//         totalPrice,
//         qty,
//         soapsPerBox: plan.soapsPerBox,
//         pricePerBox: plan.pricePerBox,
//         mrpPerBox:   plan.mrpPerBox,
//       });
//       setSelectedBoxes([]);
//       setStep("GRID");
//       setTimeout(scrollToSectionTop, 80);
//     }, 400);
//   };

//   /* ── Buy Red Sandal Kit ── */
//   const handleBuyKit = () => {
//     setKitAdded(true);
//     setTimeout(() => {
//       setKitAdded(false);
//       setActivePlan({
//         packType:    "RED_SANDAL",
//         maxBoxes:    1,
//         instruction: "Select 1 lucky box for your Red Sandal Premium Kit",
//         planTitle:   "Red Sandal Premium Kit",
//         totalPrice:  PRICE_KIT,
//         qty:         1,
//         soapsPerBox: 14,
//         pricePerBox: PRICE_KIT,
//         mrpPerBox:   null,
//       });
//       setSelectedBoxes([]);
//       setStep("GRID");
//       setTimeout(scrollToSectionTop, 80);
//     }, 400);
//   };

//   const handleBoxesSelected = (boxes: number[]) => {
//     setSelectedBoxes(boxes);
//     setStep("REGISTER");
//     setTimeout(scrollToSectionTop, 80);
//   };

//   const handleBackToGrid  = () => { setSelectedBoxes([]); setStep("GRID");  setTimeout(scrollToSectionTop, 80); };
//   const handleBackToShop  = () => { setStep("SHOP"); setActivePlan(null); setSelectedBoxes([]); setTimeout(scrollToSectionTop, 80); };
//   const handleSuccess = (_orderId: string) => handleBackToShop();

//   const remainder = members % TOTAL_MEMBERS;
//   const nextDraw  = remainder === 0 ? TOTAL_MEMBERS : TOTAL_MEMBERS - remainder;
//   const progress  = Math.round(((members % TOTAL_MEMBERS) / TOTAL_MEMBERS) * 100);

//   /* ── Step bar ── */
//   const StepBar = () => (
//     <div style={{
//       background: "linear-gradient(135deg,#78350f,#d97706,#fbbf24)",
//       padding: "10px 20px", display: "flex", alignItems: "center",
//       justifyContent: "space-between", flexWrap: "wrap", gap: 10,
//       position: "sticky", top: 0, zIndex: 200,
//       boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
//     }}>
//       <button onClick={step === "GRID" ? handleBackToShop : handleBackToGrid}
//         style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Nunito', sans-serif", flexShrink: 0 }}>
//         ← {step === "GRID" ? "Back to Shop" : "Change Box"}
//       </button>

//       <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
//         {(["1. Shop", "2. Select Box", "3. Register & Pay"] as const).map((label, i) => {
//           const active = (step === "GRID" && i === 1) || (step === "REGISTER" && i === 2);
//           const done   = (step === "GRID" && i === 0) || (step === "REGISTER" && i <= 1);
//           return (
//             <React.Fragment key={label}>
//               <div style={{
//                 background: active ? "#fff" : done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)",
//                 color: active ? "#d97706" : done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)",
//                 borderRadius: 99, padding: "5px 13px", fontSize: 12, fontWeight: 800, fontFamily: "'Nunito', sans-serif",
//               }}>
//                 {done && !active ? "✓ " + label.slice(3) : label}
//               </div>
//               {i < 2 && <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>›</span>}
//             </React.Fragment>
//           );
//         })}
//       </div>

//       {activePlan && (
//         <div style={{ flexShrink: 0 }}>
//           <p style={{ margin: 0, color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "'Nunito',sans-serif" }}>
//             📦 {activePlan.planTitle}
//           </p>
//           <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "'Nunito',sans-serif" }}>
//             {activePlan.qty} box{activePlan.qty > 1 ? "es" : ""} × {activePlan.soapsPerBox} soap{activePlan.soapsPerBox > 1 ? "s" : ""} = {activePlan.qty * activePlan.soapsPerBox} soaps · ₹{activePlan.totalPrice.toLocaleString()}
//             {activePlan.mrpPerBox && <span style={{ textDecoration: "line-through", marginLeft: 6, opacity: 0.55 }}>MRP ₹{(activePlan.mrpPerBox * activePlan.qty).toLocaleString()}</span>}
//           </p>
//         </div>
//       )}
//     </div>
//   );

//   /* ══════════════════════════════════════════════════════════
//      RENDER
//   ══════════════════════════════════════════════════════════ */
//   return (
//     <div ref={topRef} id="shop" style={{ fontFamily: "'Nunito','Segoe UI',sans-serif" }}>

//       {step === "GRID" && activePlan && (
//         <>
//           <StepBar />
//           <GridSection onBoxesSelected={handleBoxesSelected} instruction={activePlan.instruction} maxSelectable={activePlan.maxBoxes} />
//         </>
//       )}

//       {step === "REGISTER" && activePlan && (
//         <>
//           <StepBar />
//           <GridSection onBoxesSelected={handleBoxesSelected} instruction={activePlan.instruction} maxSelectable={activePlan.maxBoxes} />
//           <RegistrationModal
//             selectedBoxes={selectedBoxes}
//             offerPack={activePlan.packType === "NORMAL" ? null : activePlan.packType}
//             qty={activePlan.qty}
//             onClose={handleBackToGrid}
//             onSuccess={handleSuccess}
//           />
//         </>
//       )}

//       {step === "SHOP" && (
//         <section style={{ background: "linear-gradient(160deg,#fffbeb 0%,#fef9c3 50%,#fefce8 100%)", minHeight: "100vh" }}>

//           {/* HERO */}
//           <div style={{ background: "linear-gradient(135deg,#78350f 0%,#d97706 50%,#fbbf24 100%)", padding: "72px 20px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
//             <div style={{ position: "absolute", top: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.2),transparent 70%)", pointerEvents: "none" }} />
//             <div style={{ position: "absolute", bottom: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(120,53,15,0.3),transparent 70%)", pointerEvents: "none" }} />
//             <div style={{ position: "relative", zIndex: 1 }}>
//               <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
//                 style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
//                 ✦ Diya Natural Products ✦
//               </motion.p>
//               <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
//                 style={{ fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15, margin: "0 auto 12px", maxWidth: 680 }}>
//                 Shop &amp; Win Rewards
//               </motion.h1>
//               <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
//                 style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, marginBottom: 0 }}>
//                 Premium Natural Soaps + Gold Lucky Draw Every 250 Members
//               </motion.p>
//             </div>
//           </div>

//           {/* HOW IT WORKS */}
//           <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px 0" }}>
//             <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #fde68a", padding: "18px 22px", boxShadow: "0 4px 20px rgba(217,119,6,0.07)", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
//               {[
//                 { n: "1", icon: "🛒", label: "Choose a Pack",  desc: "Pick pack, adjust quantity with +/−" },
//                 { n: "2", icon: "🎯", label: "Pick Lucky Box", desc: "Select your box number from the grid" },
//                 { n: "3", icon: "📋", label: "Register & Pay", desc: "Fill details and pay securely" },
//                 { n: "4", icon: "🏆", label: "Win Gold Prize", desc: "Lucky draw every 250 members!" },
//               ].map(s => (
//                 <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 165 }}>
//                   <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#fbbf24,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{s.icon}</div>
//                   <div>
//                     <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#78350f" }}>{s.n}. {s.label}</p>
//                     <p style={{ margin: 0, fontSize: 10, color: "#aaa" }}>{s.desc}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ── PLAN CARDS ── */}
//           <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 20px 0" }}>
//             <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.3rem,3vw,1.9rem)", color: "#78350f", marginBottom: 24 }}>
//               Choose Your Pack
//             </h2>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 22, alignItems: "stretch" }}>
//               {plans.map((plan, i) => {
//                 const qty        = quantities[plan.offer];
//                 const offerTotal = plan.pricePerBox * qty;           // qty boxes × price/box
//                 const mrpTotal   = plan.mrpPerBox ? plan.mrpPerBox * qty : null;
//                 const savings    = mrpTotal ? mrpTotal - offerTotal : 0;
//                 const totalSoaps = plan.soapsPerBox * qty;

//                 return (
//                   <motion.div key={plan.offer}
//                     initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
//                     viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
//                     style={{
//                       background:   plan.isBest ? "linear-gradient(145deg,#fbbf24,#f59e0b)" : "#fff",
//                       borderRadius: 22, border: plan.isBest ? "none" : "1.5px solid #fde68a",
//                       overflow: "hidden", display: "flex", flexDirection: "column",
//                       boxShadow: plan.isBest ? "0 18px 52px rgba(217,119,6,0.45)" : "0 4px 22px rgba(217,119,6,0.09)",
//                       position: "relative",
//                     }}
//                   >
//                     {plan.badgeText && (
//                       <div style={{ position: "absolute", top: 16, right: 16, background: plan.isBest ? "#fff" : "#d97706", color: plan.isBest ? "#92400e" : "#fff", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 99 }}>
//                         {plan.badgeText}
//                       </div>
//                     )}
//                     <div style={{ padding: "24px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 13 }}>

//                       {/* Title */}
//                       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                         <div style={{ width: 48, height: 48, borderRadius: 13, background: plan.isBest ? "rgba(255,255,255,0.3)" : "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: plan.isBest ? "1px solid rgba(255,255,255,0.4)" : "1.5px solid #fde68a" }}>
//                           {plan.emoji}
//                         </div>
//                         <div>
//                           <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: plan.isBest ? "#fff" : "#1a1a1a" }}>
//                             {plan.title} <span style={{ color: plan.isBest ? "rgba(255,255,255,0.8)" : "#d97706" }}>{plan.subtitle}</span>
//                           </h3>
//                           <p style={{ margin: "3px 0 0", fontSize: 12, fontWeight: 800, color: plan.isBest ? "rgba(255,255,255,0.85)" : "#92400e" }}>
//                             🧼 {plan.soapsLabel}
//                           </p>
//                         </div>
//                       </div>

//                       <div style={{ height: 1, background: plan.isBest ? "rgba(255,255,255,0.3)" : "#fde68a" }} />

//                       {/* Features */}
//                       <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
//                         {plan.features.map((f, fi) => (
//                           <p key={fi} style={{ margin: 0, fontSize: 12, color: plan.isBest ? "rgba(255,255,255,0.75)" : "#777" }}>✓ {f}</p>
//                         ))}
//                       </div>

//                       <div style={{ height: 1, background: plan.isBest ? "rgba(255,255,255,0.2)" : "#fde68a" }} />

//                       {/* Live calculation summary */}
//                       <div style={{ background: plan.isBest ? "rgba(255,255,255,0.15)" : "#fffbeb", borderRadius: 10, padding: "10px 12px", border: plan.isBest ? "1px solid rgba(255,255,255,0.25)" : "1px solid #fde68a" }}>
//                         <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: plan.isBest ? "rgba(255,255,255,0.65)" : "#78350f", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Order Summary</p>
//                         <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px" }}>
//                           <p style={{ margin: 0, fontSize: 12, color: plan.isBest ? "rgba(255,255,255,0.85)" : "#555" }}>📦 {qty} box{qty > 1 ? "es" : ""}</p>
//                           <p style={{ margin: 0, fontSize: 12, color: plan.isBest ? "rgba(255,255,255,0.85)" : "#555" }}>🧼 {totalSoaps} soap{totalSoaps > 1 ? "s" : ""}</p>
//                           {mrpTotal && <p style={{ margin: 0, fontSize: 12, color: plan.isBest ? "rgba(255,255,255,0.5)" : "#bbb", textDecoration: "line-through" }}>MRP ₹{mrpTotal.toLocaleString()}</p>}
//                         </div>
//                       </div>

//                       {/* Price */}
//                       <div>
//                         <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
//                           {mrpTotal && <span style={{ fontSize: 11, fontWeight: 700, color: plan.isBest ? "rgba(255,255,255,0.6)" : "#999" }}>Offer</span>}
//                           <span style={{ fontSize: 34, fontWeight: 900, color: plan.isBest ? "#fff" : "#d97706", lineHeight: 1 }}>₹{offerTotal.toLocaleString()}</span>
//                           {qty > 1 && <span style={{ fontSize: 11, color: plan.isBest ? "rgba(255,255,255,0.5)" : "#aaa" }}>(₹{plan.pricePerBox}/box × {qty})</span>}
//                         </div>
//                         {savings > 0 && (
//                           <div style={{ display: "inline-flex", background: plan.isBest ? "rgba(255,255,255,0.2)" : "#dcfce7", border: plan.isBest ? "1px solid rgba(255,255,255,0.3)" : "1px solid #86efac", borderRadius: 99, padding: "2px 9px", marginTop: 5 }}>
//                             <span style={{ fontSize: 10, fontWeight: 800, color: plan.isBest ? "#fff" : "#16a34a" }}>💰 Save ₹{savings.toLocaleString()}</span>
//                           </div>
//                         )}
//                       </div>

//                       {/* Qty stepper */}
//                       <div>
//                         <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: plan.isBest ? "rgba(255,255,255,0.65)" : "#92400e", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quantity (Boxes)</p>
//                         <div style={{ display: "inline-flex", alignItems: "center", background: plan.isBest ? "rgba(255,255,255,0.22)" : "#fef9c3", border: plan.isBest ? "1.5px solid rgba(255,255,255,0.4)" : "1.5px solid #fde68a", borderRadius: 10, overflow: "hidden" }}>
//                           <button onClick={() => updateQty(plan.offer, -1)} style={{ width: 40, height: 40, border: "none", background: "transparent", fontSize: 20, color: plan.isBest ? "#fff" : "#d97706", cursor: "pointer", fontWeight: 900 }}>−</button>
//                           <span style={{ minWidth: 40, textAlign: "center", fontSize: 16, fontWeight: 900, color: plan.isBest ? "#fff" : "#111", borderLeft: plan.isBest ? "1px solid rgba(255,255,255,0.3)" : "1px solid #fde68a", borderRight: plan.isBest ? "1px solid rgba(255,255,255,0.3)" : "1px solid #fde68a", height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>{qty}</span>
//                           <button onClick={() => updateQty(plan.offer, 1)} style={{ width: 40, height: 40, border: "none", background: "transparent", fontSize: 20, color: plan.isBest ? "#fff" : "#d97706", cursor: "pointer", fontWeight: 900 }}>+</button>
//                         </div>
//                         <p style={{ margin: "4px 0 0", fontSize: 10, color: plan.isBest ? "rgba(255,255,255,0.55)" : "#aaa" }}>
//                           → Select {qty} lucky box{qty > 1 ? "es" : ""} ({totalSoaps} soap{totalSoaps > 1 ? "s" : ""} total)
//                         </p>
//                       </div>

//                       {/* CTA */}
//                       <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleBuy(plan)}
//                         style={{
//                           marginTop: "auto", width: "100%", padding: "14px 0", borderRadius: 13,
//                           border: plan.isBest ? "2px solid rgba(255,255,255,0.5)" : "none",
//                           background: boughtOffer === plan.offer ? "#16a34a" : plan.isBest ? "rgba(255,255,255,0.18)" : "linear-gradient(135deg,#f59e0b,#d97706)",
//                           color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer",
//                           letterSpacing: "0.03em", transition: "background 0.3s",
//                           boxShadow: plan.isBest ? "none" : "0 6px 20px rgba(217,119,6,0.3)",
//                           fontFamily: "'Nunito',sans-serif",
//                         }}
//                       >
//                         <AnimatePresence mode="wait">
//                           {boughtOffer === plan.offer
//                             ? <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "block" }}>⏳ Loading…</motion.span>
//                             : <motion.span key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "block" }}>🎯 Select {qty} Lucky Box{qty > 1 ? "es" : ""} — ₹{offerTotal.toLocaleString()} →</motion.span>
//                           }
//                         </AnimatePresence>
//                       </motion.button>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* RED SANDAL KIT */}
//           <div style={{ maxWidth: 1080, margin: "56px auto 0", padding: "0 20px 80px" }}>
//             <motion.div initial={{ opacity: 0, y: 48 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
//               style={{ borderRadius: 30, overflow: "hidden", boxShadow: "0 32px 80px rgba(120,53,15,0.3)", position: "relative" }}>
//               <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#78350f 0%,#b45309 40%,#d97706 100%)" }} />
//               <div style={{ position: "relative", zIndex: 1, padding: "44px 36px" }}>
//                 <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 16, marginBottom: 8 }}>
//                   <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0, border: "1px solid rgba(255,255,255,0.25)" }}>🔴</div>
//                   <div>
//                     <p style={{ margin: 0, color: "#fbbf24", fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase" }}>✦ Ayurvedic Luxury Collection ✦</p>
//                     <h2 style={{ margin: "5px 0 0", color: "#fff", fontSize: "clamp(1.5rem,4vw,2.3rem)", fontWeight: 900, lineHeight: 1.15 }}>Red Sandal Premium Kit</h2>
//                     <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Complete Ayurvedic Beauty + Skin + Hair Care Combo · 14 Products</p>
//                   </div>
//                 </div>
//                 <div style={{ height: 1, marginBottom: 28, background: "linear-gradient(90deg,rgba(251,191,36,0.7),transparent)" }} />
//                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 9, marginBottom: 36 }}>
//                   {kitItems.map((item, i) => (
//                     <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
//                       style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 11, padding: "9px 12px" }}>
//                       <span style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(251,191,36,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
//                       <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{item.label}</span>
//                     </motion.div>
//                   ))}
//                 </div>
//                 <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 22, background: "rgba(0,0,0,0.25)", borderRadius: 20, padding: "22px 28px", border: "1px solid rgba(255,255,255,0.12)" }}>
//                   <div>
//                     <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Complete Kit Price (1 lucky box included)</p>
//                     <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "6px 0 7px" }}>
//                       <span style={{ fontSize: 18, color: "#fbbf24", fontWeight: 700 }}>₹</span>
//                       <span style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{PRICE_KIT.toLocaleString()}</span>
//                     </div>
//                     <span style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 99, letterSpacing: "0.1em" }}>14 PRODUCTS INCLUDED</span>
//                   </div>
//                   <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} onClick={handleBuyKit}
//                     style={{ minWidth: 210, padding: "16px 32px", borderRadius: 16, border: "none", background: kitAdded ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#fbbf24,#d97706)", color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer", letterSpacing: "0.03em", boxShadow: "0 12px 36px rgba(217,119,6,0.45)", transition: "background 0.4s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Nunito',sans-serif" }}>
//                     <AnimatePresence mode="wait">
//                       {kitAdded
//                         ? <motion.span key="a" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>✅ Loading Grid…</motion.span>
//                         : <motion.span key="b" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>🛒 Buy Premium Kit — ₹{PRICE_KIT.toLocaleString()}</motion.span>
//                       }
//                     </AnimatePresence>
//                   </motion.button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>

//           {/* DRAW COUNTER */}
//           <div style={{ maxWidth: 660, margin: "0 auto 80px", padding: "0 20px" }}>
//             <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
//               style={{ background: "#fff", borderRadius: 24, padding: "34px 32px 28px", boxShadow: "0 8px 40px rgba(217,119,6,0.12)", border: "1.5px solid #fde68a", textAlign: "center" }}>
//               <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#d97706", letterSpacing: "0.25em", textTransform: "uppercase" }}>✦ Live Draw Counter ✦</p>
//               <motion.p animate={{ scale: [1, 1.01, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
//                 style={{ fontSize: 44, fontWeight: 900, color: "#111", margin: "12px 0 2px", lineHeight: 1 }}>
//                 {loading ? <span style={{ color: "#ddd" }}>—</span> : <>👥 {members.toLocaleString()}</>}
//               </motion.p>
//               <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 22px" }}>Total Members Joined</p>
//               <div style={{ marginBottom: 14 }}>
//                 <div style={{ height: 9, background: "#fef9c3", borderRadius: 99, overflow: "hidden" }}>
//                   <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
//                     style={{ height: "100%", background: "linear-gradient(90deg,#fbbf24,#d97706)", borderRadius: 99 }} />
//                 </div>
//                 <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10, color: "#bbb" }}>
//                   <span>0</span><span>{TOTAL_MEMBERS}</span>
//                 </div>
//               </div>
//               <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 11, padding: "8px 18px" }}>
//                 <span style={{ fontSize: 16 }}>🎯</span>
//                 <p style={{ margin: 0, fontSize: 13, color: "#92400e", fontWeight: 700 }}>
//                   Next draw in <span style={{ color: "#d97706", fontSize: 18, fontWeight: 900 }}>{nextDraw}</span> more members
//                 </p>
//               </div>
//             </motion.div>
//           </div>

//         </section>
//       )}
//     </div>
//   );
// };

// export default ShopSection;
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GridSection from "./GridSection";
import RegistrationModal from "./RegistrationModal";

const TOTAL_MEMBERS = 250;
const TEST_MODE = false;

// ─── Prices (per-box) ────────────────────────────────────────────────────────
const PRICE_SINGLE = TEST_MODE ? 1     : 300;    // 1 soap  per box
const PRICE_THREE  = TEST_MODE ? 1     : 600;    // 3 soaps per box
const PRICE_SIX    = TEST_MODE ? 1     : 900;    // 6 soaps per box
const MRP_THREE    = TEST_MODE ? 3     : 900;    // MRP per box (Value)
const MRP_SIX      = TEST_MODE ? 6     : 1800;   // MRP per box (Bumper)
const PRICE_KIT    = TEST_MODE ? 1     : 50000;  // flat per kit

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://diya-backenddiya-backend.onrender.com";

const kitItems = [
  { icon: "🍵", label: "Red Sandal Tea Powder" },
  { icon: "🪵", label: "Red Sandal Stick" },
  { icon: "🧼", label: "12 Red Sandal Soaps" },
  { icon: "✨", label: "Face Powder" },
  { icon: "💧", label: "Face Wash" },
  { icon: "🚿", label: "Shampoo" },
  { icon: "🧴", label: "Cream" },
  { icon: "🌿", label: "White Sandal Stick" },
  { icon: "🌾", label: "White Sandal Powder" },
  { icon: "📿", label: "Mala" },
  { icon: "💎", label: "Bracelet" },
  { icon: "🦷", label: "Toothpaste" },
  { icon: "💆", label: "Hair Oil" },
  { icon: "🌟", label: "Face Serum" },
];

type Offer = "SINGLE" | "THREE" | "SIX";
type Step  = "SHOP" | "GRID" | "REGISTER";

type ActivePlan = {
  packType:    "NORMAL" | "HALF_YEAR" | "ANNUAL" | "RED_SANDAL";
  maxBoxes:    number;
  instruction: string;
  planTitle:   string;
  totalPrice:  number;
  qty:         number;
  soapsPerBox: number;
  pricePerBox: number;
  mrpPerBox:   number | null;
};

const plans = [
  {
    title: "Starter", subtitle: "Pack",
    soapsLabel: "1 Soap per Box — ₹300/box",
    pricePerBox: PRICE_SINGLE, mrpPerBox: null as number | null,
    offer: "SINGLE" as Offer, packType: "NORMAL" as const,
    emoji: "📦", soapsPerBox: 1,
    features: [
      "1 Premium Handmade Soap per box",
      "₹300 per box",
      "Natural Ingredients · Skin Friendly",
    ],
    isBest: false, badgeText: undefined as string | undefined,
  },
  {
    title: "Value", subtitle: "Pack",
    soapsLabel: "3 Soaps per Box — ₹600/box",
    pricePerBox: PRICE_THREE, mrpPerBox: MRP_THREE,
    offer: "THREE" as Offer, packType: "HALF_YEAR" as const,
    badgeText: "SAVE 33%", emoji: "⭐", soapsPerBox: 3,
    features: [
      "3 Premium Handmade Soaps per box",
      "MRP ₹900/box → Offer ₹600/box",
      "Save ₹300 per box instantly",
    ],
    isBest: false,
  },
  {
    title: "Bumper", subtitle: "Pack",
    soapsLabel: "6 Soaps per Box — ₹900/box",
    pricePerBox: PRICE_SIX, mrpPerBox: MRP_SIX,
    offer: "SIX" as Offer, packType: "ANNUAL" as const,
    badgeText: "BEST OFFER", emoji: "🎉", isBest: true, soapsPerBox: 6,
    features: [
      "6 Premium Handmade Soaps per box",
      "MRP ₹1800/box → Offer ₹900/box",
      "Save ₹900 per box instantly",
    ],
  },
];

/* ══════════════════════════════════════════════════════════ */

const ShopSection: React.FC = () => {
  const topRef = useRef<HTMLDivElement>(null);

  const [members,    setMembers]    = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [quantities, setQuantities] = useState<Record<Offer, number>>({ SINGLE: 1, THREE: 1, SIX: 1 });
  const [kitAdded,   setKitAdded]   = useState(false);
  const [kitQty,     setKitQty]     = useState(1);
  const [boughtOffer,setBoughtOffer]= useState<Offer | null>(null);
  const [step,       setStep]       = useState<Step>("SHOP");
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);

  const scrollToSectionTop = () => {
    if (topRef.current) {
      const y = topRef.current.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  /* ── Fetch member count ── */
  const fetchMembers = async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/members`);
      const data = await res.json();
      setMembers(data.total || 0);
    } catch { setMembers(0); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMembers();
    const id = setInterval(fetchMembers, 10_000);
    return () => clearInterval(id);
  }, []);

  const updateQty = (offer: Offer, delta: number) =>
    setQuantities(prev => ({ ...prev, [offer]: Math.max(1, prev[offer] + delta) }));

  /* ── Buy a pack ── */
  const handleBuy = (plan: (typeof plans)[0]) => {
    setBoughtOffer(plan.offer);
    const qty        = quantities[plan.offer];
    const totalBoxes = qty;
    const totalPrice = plan.pricePerBox * qty;
    const totalMRP   = plan.mrpPerBox  ? plan.mrpPerBox * qty : null;

    setTimeout(() => {
      setBoughtOffer(null);
      setActivePlan({
        packType:    plan.packType,
        maxBoxes:    totalBoxes,
        instruction: `Select ${totalBoxes} lucky box${totalBoxes > 1 ? "es" : ""} for your ${plan.title} ${plan.subtitle} (${plan.soapsPerBox} soap${plan.soapsPerBox > 1 ? "s" : ""} per box)`,
        planTitle:   `${plan.title} ${plan.subtitle}`,
        totalPrice,
        qty,
        soapsPerBox: plan.soapsPerBox,
        pricePerBox: plan.pricePerBox,
        mrpPerBox:   plan.mrpPerBox,
      });
      setSelectedBoxes([]);
      setStep("GRID");
      setTimeout(scrollToSectionTop, 80);
    }, 400);
  };

  /* ── Buy Red Sandal Kit ── */
  const handleBuyKit = () => {
    setKitAdded(true);
    setTimeout(() => {
      setKitAdded(false);
      setActivePlan({
        packType:    "RED_SANDAL",
        maxBoxes:    kitQty,
        instruction: `Select ${kitQty} lucky box${kitQty > 1 ? "es" : ""} for your Red Sandal Premium Kit`,
        planTitle:   "Red Sandal Premium Kit",
        totalPrice:  PRICE_KIT * kitQty,
        qty:         kitQty,
        soapsPerBox: 14,
        pricePerBox: PRICE_KIT,
        mrpPerBox:   null,
      });
      setSelectedBoxes([]);
      setStep("GRID");
      setTimeout(scrollToSectionTop, 80);
    }, 400);
  };

  const handleBoxesSelected = (boxes: number[]) => {
    setSelectedBoxes(boxes);
    setStep("REGISTER");
    setTimeout(scrollToSectionTop, 80);
  };

  const handleBackToGrid  = () => { setSelectedBoxes([]); setStep("GRID");  setTimeout(scrollToSectionTop, 80); };
  const handleBackToShop  = () => { setStep("SHOP"); setActivePlan(null); setSelectedBoxes([]); setTimeout(scrollToSectionTop, 80); };
  const handleSuccess = (_orderId: string) => handleBackToShop();

  const remainder = members % TOTAL_MEMBERS;
  const nextDraw  = remainder === 0 ? TOTAL_MEMBERS : TOTAL_MEMBERS - remainder;
  const progress  = Math.round(((members % TOTAL_MEMBERS) / TOTAL_MEMBERS) * 100);

  /* ── Step bar ── */
  const StepBar = () => (
    <div style={{
      background: "linear-gradient(135deg,#78350f,#d97706,#fbbf24)",
      padding: "10px 20px", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      position: "sticky", top: 0, zIndex: 200,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    }}>
      <button onClick={step === "GRID" ? handleBackToShop : handleBackToGrid}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Nunito', sans-serif", flexShrink: 0 }}>
        ← {step === "GRID" ? "Back to Shop" : "Change Box"}
      </button>

      <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
        {(["1. Shop", "2. Select Box", "3. Register & Pay"] as const).map((label, i) => {
          const active = (step === "GRID" && i === 1) || (step === "REGISTER" && i === 2);
          const done   = (step === "GRID" && i === 0) || (step === "REGISTER" && i <= 1);
          return (
            <React.Fragment key={label}>
              <div style={{
                background: active ? "#fff" : done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)",
                color: active ? "#d97706" : done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)",
                borderRadius: 99, padding: "5px 13px", fontSize: 12, fontWeight: 800, fontFamily: "'Nunito', sans-serif",
              }}>
                {done && !active ? "✓ " + label.slice(3) : label}
              </div>
              {i < 2 && <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>›</span>}
            </React.Fragment>
          );
        })}
      </div>

      {activePlan && (
        <div style={{ flexShrink: 0 }}>
          <p style={{ margin: 0, color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "'Nunito',sans-serif" }}>
            📦 {activePlan.planTitle}
          </p>
          <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "'Nunito',sans-serif" }}>
            {activePlan.qty} box{activePlan.qty > 1 ? "es" : ""} × {activePlan.soapsPerBox} soap{activePlan.soapsPerBox > 1 ? "s" : ""} = {activePlan.qty * activePlan.soapsPerBox} soaps · ₹{activePlan.totalPrice.toLocaleString()}
            {activePlan.mrpPerBox && <span style={{ textDecoration: "line-through", marginLeft: 6, opacity: 0.55 }}>MRP ₹{(activePlan.mrpPerBox * activePlan.qty).toLocaleString()}</span>}
          </p>
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div ref={topRef} id="shop" style={{ fontFamily: "'Nunito','Segoe UI',sans-serif" }}>

      {step === "GRID" && activePlan && (
        <>
          <StepBar />
          <GridSection onBoxesSelected={handleBoxesSelected} instruction={activePlan.instruction} maxSelectable={activePlan.maxBoxes} />
        </>
      )}

      {step === "REGISTER" && activePlan && (
        <>
          <StepBar />
          <GridSection onBoxesSelected={handleBoxesSelected} instruction={activePlan.instruction} maxSelectable={activePlan.maxBoxes} />
          <RegistrationModal
            selectedBoxes={selectedBoxes}
            offerPack={activePlan.packType === "NORMAL" ? null : activePlan.packType}
            qty={activePlan.qty}
            onClose={handleBackToGrid}
            onSuccess={handleSuccess}
          />
        </>
      )}

      {step === "SHOP" && (
        <section style={{ background: "linear-gradient(160deg,#fffbeb 0%,#fef9c3 50%,#fefce8 100%)", minHeight: "100vh" }}>

          {/* HERO */}
          <div style={{ background: "linear-gradient(135deg,#78350f 0%,#d97706 50%,#fbbf24 100%)", padding: "72px 20px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.2),transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(120,53,15,0.3),transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
                ✦ Diya Natural Products ✦
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15, margin: "0 auto 12px", maxWidth: 680 }}>
                Shop &amp; Win Rewards
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, marginBottom: 0 }}>
                Premium Natural Soaps + Gold Lucky Draw Every 250 Members
              </motion.p>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px 0" }}>
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #fde68a", padding: "18px 22px", boxShadow: "0 4px 20px rgba(217,119,6,0.07)", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
              {[
                { n: "1", icon: "🛒", label: "Choose a Pack",  desc: "Pick pack, adjust quantity with +/−" },
                { n: "2", icon: "🎯", label: "Pick Lucky Box", desc: "Select your box number from the grid" },
                { n: "3", icon: "📋", label: "Register & Pay", desc: "Fill details and pay securely" },
                { n: "4", icon: "🏆", label: "Win Gold Prize", desc: "Lucky draw every 250 members!" },
              ].map(s => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 165 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#fbbf24,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#78350f" }}>{s.n}. {s.label}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#aaa" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PLAN CARDS ── */}
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 20px 0" }}>
            <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.3rem,3vw,1.9rem)", color: "#78350f", marginBottom: 24 }}>
              Choose Your Pack
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 22, alignItems: "stretch" }}>
              {plans.map((plan, i) => {
                const qty        = quantities[plan.offer];
                const offerTotal = plan.pricePerBox * qty;
                const mrpTotal   = plan.mrpPerBox ? plan.mrpPerBox * qty : null;
                const savings    = mrpTotal ? mrpTotal - offerTotal : 0;
                const totalSoaps = plan.soapsPerBox * qty;

                return (
                  <motion.div key={plan.offer}
                    initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
                    style={{
                      background:   plan.isBest ? "linear-gradient(145deg,#fbbf24,#f59e0b)" : "#fff",
                      borderRadius: 22, border: plan.isBest ? "none" : "1.5px solid #fde68a",
                      overflow: "hidden", display: "flex", flexDirection: "column",
                      boxShadow: plan.isBest ? "0 18px 52px rgba(217,119,6,0.45)" : "0 4px 22px rgba(217,119,6,0.09)",
                      position: "relative",
                    }}
                  >
                    {plan.badgeText && (
                      <div style={{ position: "absolute", top: 16, right: 16, background: plan.isBest ? "#fff" : "#d97706", color: plan.isBest ? "#92400e" : "#fff", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 99 }}>
                        {plan.badgeText}
                      </div>
                    )}
                    <div style={{ padding: "24px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 13 }}>

                      {/* Title */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 13, background: plan.isBest ? "rgba(255,255,255,0.3)" : "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: plan.isBest ? "1px solid rgba(255,255,255,0.4)" : "1.5px solid #fde68a" }}>
                          {plan.emoji}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: plan.isBest ? "#fff" : "#1a1a1a" }}>
                            {plan.title} <span style={{ color: plan.isBest ? "rgba(255,255,255,0.8)" : "#d97706" }}>{plan.subtitle}</span>
                          </h3>
                          <p style={{ margin: "3px 0 0", fontSize: 12, fontWeight: 800, color: plan.isBest ? "rgba(255,255,255,0.85)" : "#92400e" }}>
                            🧼 {plan.soapsLabel}
                          </p>
                        </div>
                      </div>

                      <div style={{ height: 1, background: plan.isBest ? "rgba(255,255,255,0.3)" : "#fde68a" }} />

                      {/* Features */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {plan.features.map((f, fi) => (
                          <p key={fi} style={{ margin: 0, fontSize: 12, color: plan.isBest ? "rgba(255,255,255,0.75)" : "#777" }}>✓ {f}</p>
                        ))}
                      </div>

                      <div style={{ height: 1, background: plan.isBest ? "rgba(255,255,255,0.2)" : "#fde68a" }} />

                      {/* Live calculation summary */}
                      <div style={{ background: plan.isBest ? "rgba(255,255,255,0.15)" : "#fffbeb", borderRadius: 10, padding: "10px 12px", border: plan.isBest ? "1px solid rgba(255,255,255,0.25)" : "1px solid #fde68a" }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: plan.isBest ? "rgba(255,255,255,0.65)" : "#78350f", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Order Summary</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px" }}>
                          <p style={{ margin: 0, fontSize: 12, color: plan.isBest ? "rgba(255,255,255,0.85)" : "#555" }}>📦 {qty} box{qty > 1 ? "es" : ""}</p>
                          <p style={{ margin: 0, fontSize: 12, color: plan.isBest ? "rgba(255,255,255,0.85)" : "#555" }}>🧼 {totalSoaps} soap{totalSoaps > 1 ? "s" : ""}</p>
                          {mrpTotal && <p style={{ margin: 0, fontSize: 12, color: plan.isBest ? "rgba(255,255,255,0.5)" : "#bbb", textDecoration: "line-through" }}>MRP ₹{mrpTotal.toLocaleString()}</p>}
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          {mrpTotal && <span style={{ fontSize: 11, fontWeight: 700, color: plan.isBest ? "rgba(255,255,255,0.6)" : "#999" }}>Offer</span>}
                          <span style={{ fontSize: 34, fontWeight: 900, color: plan.isBest ? "#fff" : "#d97706", lineHeight: 1 }}>₹{offerTotal.toLocaleString()}</span>
                          {qty > 1 && <span style={{ fontSize: 11, color: plan.isBest ? "rgba(255,255,255,0.5)" : "#aaa" }}>(₹{plan.pricePerBox}/box × {qty})</span>}
                        </div>
                        {savings > 0 && (
                          <div style={{ display: "inline-flex", background: plan.isBest ? "rgba(255,255,255,0.2)" : "#dcfce7", border: plan.isBest ? "1px solid rgba(255,255,255,0.3)" : "1px solid #86efac", borderRadius: 99, padding: "2px 9px", marginTop: 5 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: plan.isBest ? "#fff" : "#16a34a" }}>💰 Save ₹{savings.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Qty stepper */}
                      <div>
                        <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: plan.isBest ? "rgba(255,255,255,0.65)" : "#92400e", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quantity (Boxes)</p>
                        <div style={{ display: "inline-flex", alignItems: "center", background: plan.isBest ? "rgba(255,255,255,0.22)" : "#fef9c3", border: plan.isBest ? "1.5px solid rgba(255,255,255,0.4)" : "1.5px solid #fde68a", borderRadius: 10, overflow: "hidden" }}>
                          <button onClick={() => updateQty(plan.offer, -1)} style={{ width: 40, height: 40, border: "none", background: "transparent", fontSize: 20, color: plan.isBest ? "#fff" : "#d97706", cursor: "pointer", fontWeight: 900 }}>−</button>
                          <span style={{ minWidth: 40, textAlign: "center", fontSize: 16, fontWeight: 900, color: plan.isBest ? "#fff" : "#111", borderLeft: plan.isBest ? "1px solid rgba(255,255,255,0.3)" : "1px solid #fde68a", borderRight: plan.isBest ? "1px solid rgba(255,255,255,0.3)" : "1px solid #fde68a", height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>{qty}</span>
                          <button onClick={() => updateQty(plan.offer, 1)} style={{ width: 40, height: 40, border: "none", background: "transparent", fontSize: 20, color: plan.isBest ? "#fff" : "#d97706", cursor: "pointer", fontWeight: 900 }}>+</button>
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 10, color: plan.isBest ? "rgba(255,255,255,0.55)" : "#aaa" }}>
                          → Select {qty} lucky box{qty > 1 ? "es" : ""} ({totalSoaps} soap{totalSoaps > 1 ? "s" : ""} total)
                        </p>
                      </div>

                      {/* CTA */}
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleBuy(plan)}
                        style={{
                          marginTop: "auto", width: "100%", padding: "14px 0", borderRadius: 13,
                          border: plan.isBest ? "2px solid rgba(255,255,255,0.5)" : "none",
                          background: boughtOffer === plan.offer ? "#16a34a" : plan.isBest ? "rgba(255,255,255,0.18)" : "linear-gradient(135deg,#f59e0b,#d97706)",
                          color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer",
                          letterSpacing: "0.03em", transition: "background 0.3s",
                          boxShadow: plan.isBest ? "none" : "0 6px 20px rgba(217,119,6,0.3)",
                          fontFamily: "'Nunito',sans-serif",
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {boughtOffer === plan.offer
                            ? <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "block" }}>⏳ Loading…</motion.span>
                            : <motion.span key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "block" }}>🎯 Select {qty} Lucky Box{qty > 1 ? "es" : ""} — ₹{offerTotal.toLocaleString()} →</motion.span>
                          }
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RED SANDAL KIT */}
          <div style={{ maxWidth: 1080, margin: "56px auto 0", padding: "0 20px 80px" }}>
            <motion.div initial={{ opacity: 0, y: 48 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ borderRadius: 30, overflow: "hidden", boxShadow: "0 32px 80px rgba(120,53,15,0.3)", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#78350f 0%,#b45309 40%,#d97706 100%)" }} />
              <div style={{ position: "relative", zIndex: 1, padding: "44px 36px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 16, marginBottom: 8 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0, border: "1px solid rgba(255,255,255,0.25)" }}>🔴</div>
                  <div>
                    <p style={{ margin: 0, color: "#fbbf24", fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase" }}>✦ Ayurvedic Luxury Collection ✦</p>
                    <h2 style={{ margin: "5px 0 0", color: "#fff", fontSize: "clamp(1.5rem,4vw,2.3rem)", fontWeight: 900, lineHeight: 1.15 }}>Red Sandal Premium Kit</h2>
                    <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Complete Ayurvedic Beauty + Skin + Hair Care Combo · 14 Products</p>
                  </div>
                </div>
                <div style={{ height: 1, marginBottom: 28, background: "linear-gradient(90deg,rgba(251,191,36,0.7),transparent)" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 9, marginBottom: 36 }}>
                  {kitItems.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                      style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 11, padding: "9px 12px" }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(251,191,36,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{item.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* ── KIT PRICE + STEPPER + BUTTON ── */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 22, background: "rgba(0,0,0,0.25)", borderRadius: 20, padding: "22px 28px", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                      Complete Kit Price · {kitQty} kit{kitQty > 1 ? "s" : ""} · {kitQty} lucky box{kitQty > 1 ? "es" : ""} included
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "6px 0 7px" }}>
                      <span style={{ fontSize: 18, color: "#fbbf24", fontWeight: 700 }}>₹</span>
                      <span style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                        {(PRICE_KIT * kitQty).toLocaleString()}
                      </span>
                      {kitQty > 1 && (
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: 6 }}>
                          (₹{PRICE_KIT.toLocaleString()} × {kitQty})
                        </span>
                      )}
                    </div>
                    <span style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 99, letterSpacing: "0.1em" }}>
                      {kitQty * 14} PRODUCTS INCLUDED
                    </span>

                    {/* ── Qty Stepper ── */}
                    <div style={{ marginTop: 18 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Quantity (Kits)
                      </p>
                      <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 12, overflow: "hidden" }}>
                        <button
                          onClick={() => setKitQty(q => Math.max(1, q - 1))}
                          style={{ width: 44, height: 44, border: "none", background: "transparent", fontSize: 22, color: "#fbbf24", cursor: "pointer", fontWeight: 900, fontFamily: "'Nunito',sans-serif" }}
                        >−</button>
                        <span style={{ minWidth: 44, textAlign: "center", fontSize: 18, fontWeight: 900, color: "#fff", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)", height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif" }}>
                          {kitQty}
                        </span>
                        <button
                          onClick={() => setKitQty(q => q + 1)}
                          style={{ width: 44, height: 44, border: "none", background: "transparent", fontSize: 22, color: "#fbbf24", cursor: "pointer", fontWeight: 900, fontFamily: "'Nunito',sans-serif" }}
                        >+</button>
                      </div>
                      <p style={{ margin: "5px 0 0", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                        → {kitQty * 14} products · {kitQty} lucky box{kitQty > 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} onClick={handleBuyKit}
                    style={{ minWidth: 210, padding: "16px 32px", borderRadius: 16, border: "none", background: kitAdded ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#fbbf24,#d97706)", color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer", letterSpacing: "0.03em", boxShadow: "0 12px 36px rgba(217,119,6,0.45)", transition: "background 0.4s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Nunito',sans-serif" }}>
                    <AnimatePresence mode="wait">
                      {kitAdded
                        ? <motion.span key="a" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>✅ Loading Grid…</motion.span>
                        : <motion.span key="b" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>🛒 Buy {kitQty} Kit{kitQty > 1 ? "s" : ""} — ₹{(PRICE_KIT * kitQty).toLocaleString()}</motion.span>
                      }
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* DRAW COUNTER */}
          <div style={{ maxWidth: 660, margin: "0 auto 80px", padding: "0 20px" }}>
            <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ background: "#fff", borderRadius: 24, padding: "34px 32px 28px", boxShadow: "0 8px 40px rgba(217,119,6,0.12)", border: "1.5px solid #fde68a", textAlign: "center" }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#d97706", letterSpacing: "0.25em", textTransform: "uppercase" }}>✦ Live Draw Counter ✦</p>
              <motion.p animate={{ scale: [1, 1.01, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
                style={{ fontSize: 44, fontWeight: 900, color: "#111", margin: "12px 0 2px", lineHeight: 1 }}>
                {loading ? <span style={{ color: "#ddd" }}>—</span> : <>👥 {members.toLocaleString()}</>}
              </motion.p>
              <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 22px" }}>Total Members Joined</p>
              <div style={{ marginBottom: 14 }}>
                <div style={{ height: 9, background: "#fef9c3", borderRadius: 99, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ height: "100%", background: "linear-gradient(90deg,#fbbf24,#d97706)", borderRadius: 99 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10, color: "#bbb" }}>
                  <span>0</span><span>{TOTAL_MEMBERS}</span>
                </div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 11, padding: "8px 18px" }}>
                <span style={{ fontSize: 16 }}>🎯</span>
                <p style={{ margin: 0, fontSize: 13, color: "#92400e", fontWeight: 700 }}>
                  Next draw in <span style={{ color: "#d97706", fontSize: 18, fontWeight: 900 }}>{nextDraw}</span> more members
                </p>
              </div>
            </motion.div>
          </div>

        </section>
      )}
    </div>
  );
};

export default ShopSection;