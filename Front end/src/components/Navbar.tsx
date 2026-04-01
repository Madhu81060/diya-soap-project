import logo from "../assets/logo.png";
import { Menu, X, PhoneCall, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface NavbarProps {
  onNavigate: (section: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive]         = useState("home");
  const [scrolled, setScrolled]     = useState(false);

  const phoneNumber = "+918125134699";
  const phoneLabel  = "+91 81251 34699";

  const menuItems = [
    { label: "Home",      section: "home" },
    { label: "Every 250", section: "shop" },   // scrolls to ShopSection (grid is inside)
    { label: "Product",   section: "product" },
    { label: "Shop",      section: "shop" },
    { label: "Gold Drop", section: "luckyDraw", premium: true },
    { label: "Proof",     section: "proof" },
    { label: "Videos",    section: "videos" },
    { label: "Contact",   section: "contact" },
  ];

  const go = (section: string) => {
    onNavigate(section);
    setActive(section);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      for (const item of menuItems) {
        const el = document.getElementById(item.section);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(item.section);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 999,
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        transition: "all 0.3s ease",
        background: scrolled ? "rgba(255,251,235,0.97)" : "rgba(255,251,235,0.93)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1.5px solid #fde68a" : "1.5px solid #fef3c7",
        boxShadow: scrolled ? "0 4px 32px rgba(217,119,6,0.13)" : "0 2px 12px rgba(217,119,6,0.07)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 68 }}>

          {/* BRAND */}
          <button
            onClick={() => go("home")}
            style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(217,119,6,0.25)", border: "2px solid #fde68a", flexShrink: 0, transition: "transform 0.2s" }}>
              <img src={logo} alt="Diya Soap Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{
              fontSize: 22, fontWeight: 900,
              background: "linear-gradient(135deg, #78350f 0%, #d97706 60%, #fbbf24 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              letterSpacing: "0.02em", fontFamily: "Cinzel, serif",
            }}>
              Diya Soap
            </span>
          </button>

          {/* DESKTOP MENU */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
            {menuItems.map((item) => {
              const isActive = active === item.section;
              return (
                <button
                  key={item.label}
                  onClick={() => go(item.section)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "8px 14px", borderRadius: 10, border: "none",
                    background: isActive ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "transparent",
                    color: isActive ? "#92400e" : "#78350f",
                    fontWeight: isActive ? 800 : 600, fontSize: 13.5,
                    cursor: "pointer", letterSpacing: "0.01em",
                    transition: "all 0.18s ease",
                    boxShadow: isActive ? "0 2px 10px rgba(217,119,6,0.15)" : "none",
                    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "#fef9c3";
                      (e.currentTarget as HTMLElement).style.color = "#b45309";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#78350f";
                    }
                  }}
                >
                  {item.premium && <Sparkles size={13} color="#f59e0b" style={{ flexShrink: 0 }} />}
                  {item.label}
                  {isActive && (
                    <span style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#d97706" }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="hidden md:flex">
            <a
              href={`tel:${phoneNumber}`}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
                borderRadius: 12, border: "1.5px solid #fde68a", background: "#fff",
                color: "#92400e", fontWeight: 700, fontSize: 13, textDecoration: "none",
                transition: "all 0.2s", boxShadow: "0 2px 8px rgba(217,119,6,0.08)",
                fontFamily: "'Nunito', 'Segoe UI', sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fef9c3";
                (e.currentTarget as HTMLElement).style.borderColor = "#f59e0b";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fff";
                (e.currentTarget as HTMLElement).style.borderColor = "#fde68a";
              }}
            >
              <PhoneCall size={15} color="#d97706" />
              {phoneLabel}
            </a>

            <button
              onClick={() => go("shop")}
              style={{
                padding: "10px 22px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
                color: "#fff", fontWeight: 900, fontSize: 14,
                cursor: "pointer", letterSpacing: "0.03em",
                boxShadow: "0 6px 20px rgba(217,119,6,0.4)", transition: "all 0.2s",
                fontFamily: "'Nunito', 'Segoe UI', sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(217,119,6,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(217,119,6,0.4)";
              }}
            >
              ✦ Buy Now
            </button>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              width: 44, height: 44, borderRadius: 12,
              border: "1.5px solid #fde68a", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(217,119,6,0.1)",
            }}
            className="md:hidden"
          >
            {isMenuOpen ? <X size={20} color="#92400e" /> : <Menu size={20} color="#92400e" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        style={{
          overflow: "hidden", maxHeight: isMenuOpen ? 520 : 0,
          transition: "max-height 0.32s ease",
          borderTop: isMenuOpen ? "1.5px solid #fde68a" : "none",
          background: "linear-gradient(160deg, #fffbeb 0%, #fef9c3 100%)",
        }}
        className="md:hidden"
      >
        <div style={{ padding: "12px 16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          {menuItems.map((item) => {
            const isActive = active === item.section;
            return (
              <button
                key={item.label}
                onClick={() => go(item.section)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 12,
                  border: isActive ? "1.5px solid #fde68a" : "1.5px solid transparent",
                  background: isActive ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "transparent",
                  color: isActive ? "#92400e" : "#78350f",
                  fontWeight: isActive ? 800 : 600, fontSize: 15,
                  cursor: "pointer", fontFamily: "'Nunito', 'Segoe UI', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {item.premium && <Sparkles size={14} color="#f59e0b" />}
                {item.label}
              </button>
            );
          })}

          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
            <a
              href={`tel:${phoneNumber}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px 0", borderRadius: 12, border: "1.5px solid #fde68a",
                background: "#fff", color: "#92400e",
                fontWeight: 700, fontSize: 14, textDecoration: "none",
                fontFamily: "'Nunito', 'Segoe UI', sans-serif",
              }}
            >
              <PhoneCall size={16} color="#d97706" />
              {phoneLabel}
            </a>
            <button
              onClick={() => go("shop")}
              style={{
                padding: "13px 0", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
                color: "#fff", fontWeight: 900, fontSize: 15,
                cursor: "pointer", boxShadow: "0 6px 20px rgba(217,119,6,0.35)",
                fontFamily: "'Nunito', 'Segoe UI', sans-serif",
              }}
            >
              ✦ Buy Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}