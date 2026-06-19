import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { useRef } from "react";
import heroSoap from "../assets/diya-soap.png";
import cowImg from "../assets/cow.png";

interface HeroSectionProps {
  onJoinClick: () => void;
}

export default function HeroSection({ onJoinClick }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const imageY  = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY   = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={containerRef}
      id="home"
      style={{
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        background: "#fffbeb",
        overflow: "hidden",
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ══════════════════════════════════
          AMBIENT BACKGROUND
      ══════════════════════════════════ */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {/* Warm gradient wash */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 45%, #fefce8 100%)",
        }} />
        {/* Top-right amber glow */}
        <div style={{
          position: "absolute", top: -180, right: -180,
          width: 680, height: 680, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 65%)",
          filter: "blur(8px)",
        }} />
        {/* Bottom-left brown glow */}
        <div style={{
          position: "absolute", bottom: -120, left: -120,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(120,53,15,0.1) 0%, transparent 65%)",
          filter: "blur(12px)",
        }} />
        {/* Center accent */}
        <div style={{
          position: "absolute", top: "30%", left: "50%",
          transform: "translateX(-50%)",
          width: 900, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(251,191,36,0.07) 0%, transparent 70%)",
        }} />
        {/* Dot grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.055 }}>
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#92400e" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        {/* Grain */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035 }}>
          <filter id="hero-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-grain)" />
        </svg>
      </div>

      {/* ══════════════════════════════════
          MAIN HERO GRID
      ══════════════════════════════════ */}
      <div
        className="hero-grid"
        style={{
          flex: 1,
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          padding: "18px 32px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: 48,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >

        {/* ════════════════
            LEFT — COPY
        ════════════════ */}
        <motion.div
          style={{ y: textY, opacity: fadeOut }}
          className="hero-left"
        >

          {/* Live indicator pill */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid rgba(217,119,6,0.25)",
              borderRadius: 99, padding: "7px 16px 7px 12px",
              marginBottom: 22,
              boxShadow: "0 2px 12px rgba(217,119,6,0.1)",
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#16a34a",
              boxShadow: "0 0 0 3px rgba(22,163,74,0.25)",
              display: "inline-block",
              animation: "pulse-green 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 11.5, fontWeight: 800, color: "#78350f", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Diya Natural Products
            </span>
          </motion.div>

          {/* Main headline - SEO focus: Diyasoaps */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 style={{
              margin: "0 0 10px",
              fontSize: "clamp(2.6rem, 4.5vw, 4.2rem)",
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: "-0.025em",
              color: "#1a0800",
            }}>
              Diya Red Sandal
              <br />
              <span style={{
                background: "linear-gradient(125deg, #d97706 20%, #92400e 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Premium Soap
              </span>
            </h1>

            {/* Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 18 }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={15} fill="#fbbf24" color="#fbbf24" strokeWidth={0} />
              ))}
              <span style={{ fontSize: 13, color: "#92400e", fontWeight: 700, marginLeft: 6 }}>
                4.9 &nbsp;·&nbsp; 200+ Happy Customers of Diyasoaps
              </span>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            style={{
              margin: "0 0 22px",
              fontSize: 15.5,
              color: "#6b4c2a",
              lineHeight: 1.8,
              maxWidth: 420,
            }}
          >
            Experience the ancient Ayurvedic power of red sandalwood with Diyasoaps, specially crafted for modern skin.
          </motion.p>



          {/* ── PRICING TRIO ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.34 }}
            style={{ display: "flex", gap: 10, marginBottom: 20 }}
          >
            {[
              { soaps: "1 Soap",  price: "₹300", mrp: null,    tag: null,       best: false },
              { soaps: "3 Soaps", price: "₹600", mrp: "₹900",  tag: "Save 33%", best: false },
              { soaps: "6 Soaps", price: "₹900", mrp: "₹1800", tag: "Best Deal", best: true },
            ].map((p) => (
              <div
                key={p.soaps}
                style={{
                  flex: 1,
                  position: "relative",
                  background: p.best
                    ? "linear-gradient(145deg, #d97706, #92400e)"
                    : "rgba(255,255,255,0.9)",
                  border: p.best
                    ? "1.5px solid rgba(251,191,36,0.4)"
                    : "1.5px solid rgba(217,119,6,0.2)",
                  borderRadius: 16,
                  padding: "14px 14px 12px",
                  backdropFilter: "blur(8px)",
                  boxShadow: p.best
                    ? "0 10px 32px rgba(146,64,14,0.35)"
                    : "0 2px 14px rgba(217,119,6,0.1)",
                  transition: "transform 0.2s",
                }}
              >
                {p.tag && (
                  <div style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    background: p.best ? "#16a34a" : "#d97706",
                    color: "#fff", fontSize: 9, fontWeight: 900,
                    letterSpacing: "0.06em", padding: "3px 10px",
                    borderRadius: 99, whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}>
                    {p.tag}
                  </div>
                )}
                <p style={{
                  margin: "0 0 2px", fontSize: 10.5, fontWeight: 700,
                  color: p.best ? "rgba(255,255,255,0.65)" : "#a16207",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  {p.soaps}
                </p>
                {p.mrp && (
                  <p style={{
                    margin: "0", fontSize: 11.5, fontWeight: 700,
                    color: p.best ? "rgba(255,255,255,0.4)" : "#d1d5db",
                    textDecoration: "line-through",
                  }}>
                    {p.mrp}
                  </p>
                )}
                <p style={{
                  margin: "1px 0 0", fontSize: 22, fontWeight: 900,
                  color: p.best ? "#fff" : "#b45309",
                  letterSpacing: "-0.02em",
                }}>
                  {p.price}
                </p>
              </div>
            ))}
          </motion.div>



          {/* ── CTA ROW ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.46 }}
            style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2, boxShadow: "0 20px 56px rgba(146,64,14,0.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onJoinClick}
              style={{
                padding: "15px 34px",
                borderRadius: 14, border: "none",
                background: "linear-gradient(130deg, #d97706 0%, #b45309 60%, #92400e 100%)",
                color: "#fff", fontSize: 16, fontWeight: 900,
                cursor: "pointer", letterSpacing: "0.03em",
                boxShadow: "0 12px 40px rgba(146,64,14,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 9,
                transition: "box-shadow 0.25s",
              }}
            >
              🎯 Buy Now — ₹300
              <ArrowRight size={17} strokeWidth={2.5} />
            </motion.button>

            {/* Goshala note */}
            <div style={{
              display: "flex", alignItems: "center", gap: 9,
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(6px)",
              border: "1px solid #86efac",
              borderRadius: 99, padding: "8px 14px",
            }}>
              <img src={cowImg} style={{ width: 24, height: 24 }} alt="cow" />
              <span style={{ fontSize: 12, color: "#15803d", fontWeight: 800 }}>10% to Goshala</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ════════════════════════════
            RIGHT — SOAP IMAGE
        ════════════════════════════ */}
        <motion.div
          style={{ y: imageY, position: "relative", zIndex: 1 }}
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Outer glow ── */}
          <div style={{
            position: "absolute", inset: -32,
            background: "radial-gradient(ellipse at 52% 52%, rgba(251,191,36,0.38) 0%, rgba(217,119,6,0.18) 40%, transparent 68%)",
            filter: "blur(28px)", zIndex: 0, borderRadius: "50%",
            pointerEvents: "none",
          }} />

          {/* ── Rotating dashed border ── */}
          <div style={{
            position: "absolute", inset: -20,
            border: "1.5px dashed rgba(217,119,6,0.22)",
            borderRadius: 40, zIndex: 0,
            animation: "slowspin 35s linear infinite",
            pointerEvents: "none",
          }} />

          {/* ── Second counter-rotating ring ── */}
          <div style={{
            position: "absolute", inset: -8,
            border: "1px solid rgba(251,191,36,0.15)",
            borderRadius: 36, zIndex: 0,
            animation: "slowspin 20s linear infinite reverse",
            pointerEvents: "none",
          }} />

          {/* ── MAIN IMAGE CARD ── */}
          <div style={{
            position: "relative", zIndex: 1,
            borderRadius: 32,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            lineHeight: 0,
            boxShadow: [
              "0 4px 6px rgba(0,0,0,0.04)",
              "0 12px 24px rgba(120,53,15,0.12)",
              "0 32px 64px rgba(120,53,15,0.18)",
              "0 64px 120px rgba(120,53,15,0.12)",
            ].join(", "),
            border: "2px solid rgba(251,191,36,0.45)",
            background: "linear-gradient(160deg, #fffbeb 0%, #fef9c3 100%)",
          }}>
            {/* Top gloss */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "42%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.52) 0%, transparent 100%)",
              zIndex: 2, pointerEvents: "none",
              borderRadius: "32px 32px 0 0",
            }} />
            {/* Side vignettes */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              background: "radial-gradient(ellipse at 50% 100%, rgba(120,53,15,0.08) 0%, transparent 70%)",
            }} />

            <motion.img
              src={heroSoap}
              alt="Diyasoaps Red Sandal Soap — Premium Ayurvedic Skincare"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
                borderRadius: 30,
                position: "relative",
                zIndex: 1,
              }}
            />
          </div>

          {/* ── BADGE: Goshala (top-right) ── */}
          <motion.div
            initial={{ opacity: 0, x: 16, y: -16 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", top: 16, right: -16, zIndex: 10,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid #86efac",
              borderRadius: 18,
              boxShadow: "0 8px 28px rgba(22,163,74,0.18), 0 2px 8px rgba(0,0,0,0.06)",
              padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <img src={cowImg} style={{ width: 32, height: 32 }} alt="cow" />
            <div>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 900, color: "#15803d", lineHeight: 1.3 }}>10% to Goshala</p>
              <p style={{ margin: 0, fontSize: 10, color: "#16a34a", fontWeight: 600 }}>Supporting Cows 🐄</p>
            </div>
          </motion.div>


          {/* ── Ambient sparkle dots ── */}
          {[
            { top: "12%",  left: "-7%",   size: 11, delay: 0,   dur: 2.8 },
            { top: "78%",  left: "108%",  size: 8,  delay: 0.7, dur: 3.2 },
            { top: "3%",   left: "52%",   size: 7,  delay: 1.3, dur: 2.5 },
            { top: "88%",  left: "22%",   size: 6,  delay: 0.4, dur: 3.6 },
          ].map((dot, i) => (
            <motion.div
              key={i}
              animate={{ scale: [0.8, 1.6, 0.8], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: dot.dur, repeat: Infinity, delay: dot.delay, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: dot.top, left: dot.left,
                width: dot.size, height: dot.size,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                boxShadow: `0 0 ${dot.size * 2.5}px rgba(251,191,36,0.75)`,
                zIndex: 5, pointerEvents: "none",
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════
          TRUST BAR
      ══════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.55 }}
        style={{
          borderTop: "1px solid rgba(217,119,6,0.18)",
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(12px)",
          padding: "14px 32px",
          position: "relative", zIndex: 2,
        }}
      >
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: "clamp(18px, 4vw, 56px)",
          flexWrap: "wrap",
        }}>
          {[
            { icon: "🌿", text: "100% Natural"       },
            { icon: "🐄", text: "Goshala Support"    },
            { icon: "🔒", text: "Secure Payment"     },
            { icon: "🚚", text: "Fast Delivery"      },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.06 }}
              style={{ display: "flex", alignItems: "center", gap: 7 }}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#78350f", whiteSpace: "nowrap" }}>
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style>{`
        @keyframes slowspin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 3px rgba(22,163,74,0.25); }
          50%       { box-shadow: 0 0 0 5px rgba(22,163,74,0.12); }
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            padding: 20px 20px 44px !important;
            gap: 32px !important;
          }
          .hero-left { order: 2; }
        }
      `}</style>
    </section>
  );
}