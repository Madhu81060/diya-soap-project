import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSlots } from "../context/SlotContext";
import heroSoap from "../assets/diya-soap.png";
import cowImg from "../assets/cow.png";

interface HeroSectionProps {
  onJoinClick: () => void;
}

export default function HeroSection({ onJoinClick }: HeroSectionProps) {
  const { booked, total } = useSlots();

  const available = total - booked;
  const progress  = Math.min(100, Math.round((booked / total) * 100));

  return (
    <section
      id="home"
      style={{
        background: "linear-gradient(160deg, #fffbeb 0%, #fef9c3 50%, #fefce8 100%)",
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── HERO BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)",
        padding: "72px 20px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, left: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(120,53,15,0.3), transparent 70%)", pointerEvents: "none" }} />

        <motion.p
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 11, fontWeight: 700, marginBottom: 12 }}
        >
          ✦ Diya Natural Products ✦
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 12 }}
        >
          <Sparkles color="#fff" size={24} />
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 6vw, 3.6rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>
            Red Sandal Soap
          </h1>
          <Sparkles color="#fff" size={24} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, margin: "0 0 28px" }}
        >
          Premium Natural Soaps + Gold Lucky Draw Offers
        </motion.p>

        {/* Pricing pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 28 }}
        >
          {[
            { label: "1 Soap", price: "₹300" },
            { label: "3 Soaps", price: "₹600" },
            { label: "6 Soaps", price: "₹900" },
          ].map((p) => (
            <div key={p.label} style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 99, padding: "6px 18px", display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 600 }}>{p.label}</span>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>{p.price}</span>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          onClick={onJoinClick}
          style={{
            padding: "16px 44px", borderRadius: 99,
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
            border: "2px solid rgba(255,255,255,0.5)",
            color: "#fff", fontSize: 16, fontWeight: 900,
            cursor: "pointer", letterSpacing: "0.05em",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            fontFamily: "inherit",
          }}
        >
          🎯 Buy Now — Starting ₹300
        </motion.button>
      </div>

      {/* ── BODY CARD ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 20px 72px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 32, alignItems: "center",
        }}>

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(90deg, #fde6c8, #f8d39c)",
              border: "1.5px solid #f3c98b", borderRadius: 99, padding: "8px 20px",
              width: "fit-content",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#8b4513" }}>🌿 Ayurvedic • Natural • Premium Care</span>
            </div>

            <div>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 900, color: "#78350f", lineHeight: 1.2 }}>
                Naturally Glowing Skin
              </h2>
              <p style={{ margin: 0, fontSize: 16, color: "#555", lineHeight: 1.7 }}>
                Crafted with ancient Ayurvedic red sandalwood — gentle on skin, powerful in results. Buy &amp; enter our exclusive lucky draw.
              </p>
            </div>

            {/* PRICING TABLE */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #fde68a", padding: "20px 24px", boxShadow: "0 8px 32px rgba(251,191,36,0.12)" }}>
              <p style={{ margin: "0 0 12px", fontWeight: 800, color: "#111", fontSize: 15 }}>Pack Prices</p>
              {[
                { label: "Starter Pack — 1 Soap",  price: "₹300",  badge: null },
                { label: "Value Pack — 3 Soaps",   price: "₹600",  badge: "Save ₹300" },
                { label: "Bumper Pack — 6 Soaps",  price: "₹900",  badge: "Best Deal" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed #fde68a" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>{row.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {row.badge && (
                      <span style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#16a34a", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>{row.badge}</span>
                    )}
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#d97706" }}>{row.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* LIVE SLOTS */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #fde68a", padding: "20px 24px", boxShadow: "0 8px 32px rgba(251,191,36,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ margin: 0, fontWeight: 800, color: "#111", fontSize: 15 }}>Live Slots Status</p>
                <span style={{ background: "#fef9c3", border: "1.5px solid #fbbf24", borderRadius: 99, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "#92400e" }}>
                  Total: {total}
                </span>
              </div>

              <div style={{ height: 10, background: "#fef9c3", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #fbbf24, #d97706)", borderRadius: 99 }}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#16a34a" }}>{available}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#999", textTransform: "uppercase" }}>Available</p>
                </div>
                <div style={{ flex: 1, background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#d97706" }}>{booked}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#999", textTransform: "uppercase" }}>Booked</p>
                </div>
              </div>

              <p style={{ margin: "12px 0 0", fontSize: 12, color: "#a16207", fontWeight: 600, textAlign: "center" }}>
                ⏳ Limited slots. Booking closes once full.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={onJoinClick}
              style={{
                padding: "16px 36px", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #d97706, #b45309)",
                color: "#fff", fontSize: 16, fontWeight: 900,
                cursor: "pointer", letterSpacing: "0.04em",
                boxShadow: "0 12px 36px rgba(180,83,9,0.4)",
                fontFamily: "inherit", width: "fit-content",
              }}
            >
              🎯 Buy Now — Starting ₹300
            </motion.button>
          </motion.div>

          {/* RIGHT — IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
              <img
                src={heroSoap}
                alt="Diya Red Sandal Soap"
                style={{
                  width: "100%", height: "auto",
                  borderRadius: 24,
                  boxShadow: "0 20px 60px rgba(217,119,6,0.25)",
                  border: "1.5px solid #fde68a",
                  display: "block",
                }}
              />

              {/* GOSHALA BADGE */}
              <div style={{
                position: "absolute", top: 14, right: 14,
                background: "#fff", border: "1.5px solid #86efac",
                borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
              }}>
                <img src={cowImg} style={{ width: 32, height: 32 }} alt="cow" />
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#166534" }}>10% to Goshala</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#16a34a" }}>Cow Support</p>
                </div>
              </div>

              {/* PRICE BADGE — updated to ₹300 */}
              <div style={{
                position: "absolute", bottom: 14, left: 14,
                background: "linear-gradient(135deg, #d97706, #b45309)",
                borderRadius: 14, boxShadow: "0 8px 24px rgba(180,83,9,0.4)",
                padding: "10px 18px", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>🧼</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#fff" }}>From ₹300</p>
                  <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.75)" }}>Per Soap Box</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}