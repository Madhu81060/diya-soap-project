// import logo from "../assets/logo.png";
// import { Menu, X, PhoneCall, Sparkles } from "lucide-react";
// import { useEffect, useState } from "react";

// interface NavbarProps {
//   onNavigate: (section: string) => void;
// }

// export default function Navbar({ onNavigate }: NavbarProps) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [active, setActive]         = useState("home");
//   const [scrolled, setScrolled]     = useState(false);

//   const phoneNumber = "+918125134699";
//   const phoneLabel  = "+91 81251 34699";

//   const menuItems = [
//     { label: "Home",      section: "home" },
//     { label: "Every 250", section: "shop" },   // scrolls to ShopSection (grid is inside)
//     { label: "Product",   section: "product" },
//     { label: "Shop",      section: "shop" },
//     { label: "Gold Drop", section: "luckyDraw", premium: true },
//     { label: "Proof",     section: "proof" },
//     { label: "Videos",    section: "videos" },
//     { label: "Contact",   section: "contact" },
//   ];

//   const go = (section: string) => {
//     onNavigate(section);
//     setActive(section);
//     setIsMenuOpen(false);
//   };

//   useEffect(() => {
//     const onScroll = () => {
//       setScrolled(window.scrollY > 10);
//       for (const item of menuItems) {
//         const el = document.getElementById(item.section);
//         if (!el) continue;
//         const rect = el.getBoundingClientRect();
//         if (rect.top <= 120 && rect.bottom >= 120) {
//           setActive(item.section);
//           break;
//         }
//       }
//     };
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   return (
//     <nav
//       style={{
//         position: "sticky",
//         top: 0,
//         zIndex: 999,
//         fontFamily: "'Nunito', 'Segoe UI', sans-serif",
//         transition: "all 0.3s ease",
//         background: scrolled ? "rgba(255,251,235,0.97)" : "rgba(255,251,235,0.93)",
//         backdropFilter: "blur(20px)",
//         WebkitBackdropFilter: "blur(20px)",
//         borderBottom: scrolled ? "1.5px solid #fde68a" : "1.5px solid #fef3c7",
//         boxShadow: scrolled ? "0 4px 32px rgba(217,119,6,0.13)" : "0 2px 12px rgba(217,119,6,0.07)",
//       }}
//     >
//       <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 68 }}>

//           {/* BRAND */}
//           <button
//             onClick={() => go("home")}
//             style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}
//           >
//             <div style={{ width: 44, height: 44, borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(217,119,6,0.25)", border: "2px solid #fde68a", flexShrink: 0, transition: "transform 0.2s" }}>
//               <img src={logo} alt="Diya Soap Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//             </div>
//             <span style={{
//               fontSize: 22, fontWeight: 900,
//               background: "linear-gradient(135deg, #78350f 0%, #d97706 60%, #fbbf24 100%)",
//               WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
//               letterSpacing: "0.02em", fontFamily: "Cinzel, serif",
//             }}>
//               Diya Soap
//             </span>
//           </button>

//           {/* DESKTOP MENU */}
//           <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
//             {menuItems.map((item) => {
//               const isActive = active === item.section;
//               return (
//                 <button
//                   key={item.label}
//                   onClick={() => go(item.section)}
//                   style={{
//                     display: "flex", alignItems: "center", gap: 4,
//                     padding: "8px 14px", borderRadius: 10, border: "none",
//                     background: isActive ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "transparent",
//                     color: isActive ? "#92400e" : "#78350f",
//                     fontWeight: isActive ? 800 : 600, fontSize: 13.5,
//                     cursor: "pointer", letterSpacing: "0.01em",
//                     transition: "all 0.18s ease",
//                     boxShadow: isActive ? "0 2px 10px rgba(217,119,6,0.15)" : "none",
//                     fontFamily: "'Nunito', 'Segoe UI', sans-serif",
//                     position: "relative",
//                   }}
//                   onMouseEnter={(e) => {
//                     if (!isActive) {
//                       (e.currentTarget as HTMLElement).style.background = "#fef9c3";
//                       (e.currentTarget as HTMLElement).style.color = "#b45309";
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (!isActive) {
//                       (e.currentTarget as HTMLElement).style.background = "transparent";
//                       (e.currentTarget as HTMLElement).style.color = "#78350f";
//                     }
//                   }}
//                 >
//                   {item.premium && <Sparkles size={13} color="#f59e0b" style={{ flexShrink: 0 }} />}
//                   {item.label}
//                   {isActive && (
//                     <span style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#d97706" }} />
//                   )}
//                 </button>
//               );
//             })}
//           </div>

//           {/* CTA */}
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="hidden md:flex">
//             <a
//               href={`tel:${phoneNumber}`}
//               style={{
//                 display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
//                 borderRadius: 12, border: "1.5px solid #fde68a", background: "#fff",
//                 color: "#92400e", fontWeight: 700, fontSize: 13, textDecoration: "none",
//                 transition: "all 0.2s", boxShadow: "0 2px 8px rgba(217,119,6,0.08)",
//                 fontFamily: "'Nunito', 'Segoe UI', sans-serif",
//               }}
//               onMouseEnter={(e) => {
//                 (e.currentTarget as HTMLElement).style.background = "#fef9c3";
//                 (e.currentTarget as HTMLElement).style.borderColor = "#f59e0b";
//               }}
//               onMouseLeave={(e) => {
//                 (e.currentTarget as HTMLElement).style.background = "#fff";
//                 (e.currentTarget as HTMLElement).style.borderColor = "#fde68a";
//               }}
//             >
//               <PhoneCall size={15} color="#d97706" />
//               {phoneLabel}
//             </a>

//             <button
//               onClick={() => go("shop")}
//               style={{
//                 padding: "10px 22px", borderRadius: 12, border: "none",
//                 background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
//                 color: "#fff", fontWeight: 900, fontSize: 14,
//                 cursor: "pointer", letterSpacing: "0.03em",
//                 boxShadow: "0 6px 20px rgba(217,119,6,0.4)", transition: "all 0.2s",
//                 fontFamily: "'Nunito', 'Segoe UI', sans-serif",
//               }}
//               onMouseEnter={(e) => {
//                 (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
//                 (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(217,119,6,0.5)";
//               }}
//               onMouseLeave={(e) => {
//                 (e.currentTarget as HTMLElement).style.transform = "scale(1)";
//                 (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(217,119,6,0.4)";
//               }}
//             >
//               ✦ Buy Now
//             </button>
//           </div>

//           {/* MOBILE TOGGLE */}
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             style={{
//               width: 44, height: 44, borderRadius: 12,
//               border: "1.5px solid #fde68a", background: "#fff",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               cursor: "pointer", boxShadow: "0 2px 8px rgba(217,119,6,0.1)",
//             }}
//             className="md:hidden"
//           >
//             {isMenuOpen ? <X size={20} color="#92400e" /> : <Menu size={20} color="#92400e" />}
//           </button>
//         </div>
//       </div>

//       {/* MOBILE MENU */}
//       <div
//         style={{
//           overflow: "hidden", maxHeight: isMenuOpen ? 520 : 0,
//           transition: "max-height 0.32s ease",
//           borderTop: isMenuOpen ? "1.5px solid #fde68a" : "none",
//           background: "linear-gradient(160deg, #fffbeb 0%, #fef9c3 100%)",
//         }}
//         className="md:hidden"
//       >
//         <div style={{ padding: "12px 16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
//           {menuItems.map((item) => {
//             const isActive = active === item.section;
//             return (
//               <button
//                 key={item.label}
//                 onClick={() => go(item.section)}
//                 style={{
//                   display: "flex", alignItems: "center", gap: 8,
//                   width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 12,
//                   border: isActive ? "1.5px solid #fde68a" : "1.5px solid transparent",
//                   background: isActive ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "transparent",
//                   color: isActive ? "#92400e" : "#78350f",
//                   fontWeight: isActive ? 800 : 600, fontSize: 15,
//                   cursor: "pointer", fontFamily: "'Nunito', 'Segoe UI', sans-serif",
//                   transition: "all 0.15s",
//                 }}
//               >
//                 {item.premium && <Sparkles size={14} color="#f59e0b" />}
//                 {item.label}
//               </button>
//             );
//           })}

//           <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
//             <a
//               href={`tel:${phoneNumber}`}
//               style={{
//                 display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
//                 padding: "12px 0", borderRadius: 12, border: "1.5px solid #fde68a",
//                 background: "#fff", color: "#92400e",
//                 fontWeight: 700, fontSize: 14, textDecoration: "none",
//                 fontFamily: "'Nunito', 'Segoe UI', sans-serif",
//               }}
//             >
//               <PhoneCall size={16} color="#d97706" />
//               {phoneLabel}
//             </a>
//             <button
//               onClick={() => go("shop")}
//               style={{
//                 padding: "13px 0", borderRadius: 12, border: "none",
//                 background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
//                 color: "#fff", fontWeight: 900, fontSize: 15,
//                 cursor: "pointer", boxShadow: "0 6px 20px rgba(217,119,6,0.35)",
//                 fontFamily: "'Nunito', 'Segoe UI', sans-serif",
//               }}
//             >
//               ✦ Buy Now
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }
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
    { label: "Every 250", section: "shop" },
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

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <style>{`
        .ds-nav {
          position: sticky;
          top: 0;
          z-index: 999;
          font-family: 'Nunito', 'Segoe UI', sans-serif;
          transition: all 0.3s ease;
          background: rgba(255,251,235,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1.5px solid #fde68a;
        }
        .ds-nav.scrolled {
          box-shadow: 0 4px 32px rgba(217,119,6,0.13);
          border-bottom-color: #fde68a;
        }
        .ds-nav:not(.scrolled) {
          box-shadow: 0 2px 12px rgba(217,119,6,0.07);
          border-bottom-color: #fef3c7;
        }

        /* ── Inner wrapper ── */
        .ds-nav__inner {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 8px;
        }

        /* ── Brand ── */
        .ds-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          text-decoration: none;
        }
        .ds-brand__logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(217,119,6,0.25);
          border: 2px solid #fde68a;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .ds-brand:hover .ds-brand__logo { transform: scale(1.06); }
        .ds-brand__logo img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .ds-brand__name {
          font-size: 20px;
          font-weight: 900;
          background: linear-gradient(135deg, #78350f 0%, #d97706 60%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.02em;
          font-family: 'Cinzel', serif;
          white-space: nowrap;
        }

        /* ── Desktop menu ── */
        .ds-desktop-menu {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: center;
        }
        .ds-menu-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 7px 11px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #78350f;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: all 0.18s ease;
          position: relative;
          font-family: 'Nunito', 'Segoe UI', sans-serif;
          white-space: nowrap;
        }
        .ds-menu-btn:hover {
          background: #fef9c3;
          color: #b45309;
        }
        .ds-menu-btn.active {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
          font-weight: 800;
          box-shadow: 0 2px 10px rgba(217,119,6,0.15);
        }
        .ds-menu-btn__dot {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #d97706;
        }

        /* ── Desktop CTA ── */
        .ds-cta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .ds-phone-link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 11px;
          border: 1.5px solid #fde68a;
          background: #fff;
          color: #92400e;
          font-weight: 700;
          font-size: 12.5px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(217,119,6,0.08);
          font-family: 'Nunito', 'Segoe UI', sans-serif;
          white-space: nowrap;
        }
        .ds-phone-link:hover {
          background: #fef9c3;
          border-color: #f59e0b;
        }
        .ds-buy-btn {
          padding: 9px 20px;
          border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
          color: #fff;
          font-weight: 900;
          font-size: 13.5px;
          cursor: pointer;
          letter-spacing: 0.03em;
          box-shadow: 0 6px 20px rgba(217,119,6,0.4);
          transition: all 0.2s;
          font-family: 'Nunito', 'Segoe UI', sans-serif;
          white-space: nowrap;
        }
        .ds-buy-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 28px rgba(217,119,6,0.5);
        }

        /* ── Mobile toggle ── */
        .ds-mobile-toggle {
          display: none;
          width: 42px;
          height: 42px;
          border-radius: 11px;
          border: 1.5px solid #fde68a;
          background: #fff;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(217,119,6,0.1);
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .ds-mobile-toggle:hover { background: #fef9c3; }

        /* ── Mobile drawer ── */
        .ds-mobile-drawer {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
          border-top: none;
          background: linear-gradient(160deg, #fffbeb 0%, #fef9c3 100%);
        }
        .ds-mobile-drawer.open {
          max-height: 600px;
          border-top: 1.5px solid #fde68a;
        }
        .ds-mobile-drawer__inner {
          padding: 14px 16px 22px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        /* Mobile menu items */
        .ds-mobile-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          text-align: left;
          padding: 11px 15px;
          border-radius: 12px;
          border: 1.5px solid transparent;
          background: transparent;
          color: #78350f;
          font-weight: 600;
          font-size: 14.5px;
          cursor: pointer;
          font-family: 'Nunito', 'Segoe UI', sans-serif;
          transition: all 0.15s;
        }
        .ds-mobile-item:hover {
          background: #fef9c3;
          color: #b45309;
        }
        .ds-mobile-item.active {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
          font-weight: 800;
          border-color: #fde68a;
        }

        /* Mobile CTA block */
        .ds-mobile-cta {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ds-mobile-phone {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 0;
          border-radius: 12px;
          border: 1.5px solid #fde68a;
          background: #fff;
          color: #92400e;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          font-family: 'Nunito', 'Segoe UI', sans-serif;
        }
        .ds-mobile-buy {
          padding: 14px 0;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
          color: #fff;
          font-weight: 900;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(217,119,6,0.35);
          font-family: 'Nunito', 'Segoe UI', sans-serif;
          transition: opacity 0.2s;
        }
        .ds-mobile-buy:hover { opacity: 0.92; }

        /* ═══════════════════════════════
           BREAKPOINTS
        ═══════════════════════════════ */

        /* Tablet landscape + small desktop: shrink menu items */
        @media (max-width: 1180px) {
          .ds-menu-btn { font-size: 12px; padding: 7px 9px; }
          .ds-brand__name { font-size: 18px; }
        }

        /* Tablet portrait: hide desktop menu items, show icon toggle */
        @media (max-width: 900px) {
          .ds-desktop-menu { display: none; }
          .ds-cta { display: none; }
          .ds-mobile-toggle { display: flex; }
          .ds-nav__inner { height: 60px; padding: 0 18px; }
          .ds-brand__name { font-size: 19px; }
        }

        /* Small phone */
        @media (max-width: 380px) {
          .ds-nav__inner { padding: 0 14px; height: 56px; }
          .ds-brand__name { font-size: 17px; }
          .ds-brand__logo { width: 36px; height: 36px; border-radius: 10px; }
          .ds-mobile-toggle { width: 38px; height: 38px; }
          .ds-mobile-item { font-size: 13.5px; padding: 10px 13px; }
          .ds-mobile-phone, .ds-mobile-buy { font-size: 13px; }
        }
      `}</style>

      <nav className={`ds-nav${scrolled ? " scrolled" : ""}`}>
        <div className="ds-nav__inner">

          {/* ── BRAND ── */}
          <button className="ds-brand" onClick={() => go("home")} aria-label="Go to home">
            <div className="ds-brand__logo">
              <img src={logo} alt="Diya Soap Logo" />
            </div>
            <span className="ds-brand__name">Diya Soap</span>
          </button>

          {/* ── DESKTOP MENU ── */}
          <div className="ds-desktop-menu" role="navigation" aria-label="Main navigation">
            {menuItems.map((item) => {
              const isActive = active === item.section;
              return (
                <button
                  key={item.label}
                  onClick={() => go(item.section)}
                  className={`ds-menu-btn${isActive ? " active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.premium && <Sparkles size={12} color="#f59e0b" style={{ flexShrink: 0 }} />}
                  {item.label}
                  {isActive && <span className="ds-menu-btn__dot" aria-hidden />}
                </button>
              );
            })}
          </div>

          {/* ── DESKTOP CTA ── */}
          <div className="ds-cta">
            <a href={`tel:${phoneNumber}`} className="ds-phone-link" aria-label={`Call us at ${phoneLabel}`}>
              <PhoneCall size={14} color="#d97706" />
              {phoneLabel}
            </a>
            <button className="ds-buy-btn" onClick={() => go("shop")}>
              ✦ Buy Now
            </button>
          </div>

          {/* ── MOBILE TOGGLE ── */}
          <button
            className="ds-mobile-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen
              ? <X size={19} color="#92400e" />
              : <Menu size={19} color="#92400e" />
            }
          </button>
        </div>

        {/* ── MOBILE DRAWER ── */}
        <div className={`ds-mobile-drawer${isMenuOpen ? " open" : ""}`} aria-hidden={!isMenuOpen}>
          <div className="ds-mobile-drawer__inner">

            {/* Menu items */}
            {menuItems.map((item) => {
              const isActive = active === item.section;
              return (
                <button
                  key={item.label}
                  onClick={() => go(item.section)}
                  className={`ds-mobile-item${isActive ? " active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  {item.premium && <Sparkles size={14} color="#f59e0b" />}
                  {item.label}
                </button>
              );
            })}

            {/* CTA block */}
            <div className="ds-mobile-cta">
              <a
                href={`tel:${phoneNumber}`}
                className="ds-mobile-phone"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label={`Call us at ${phoneLabel}`}
              >
                <PhoneCall size={15} color="#d97706" />
                {phoneLabel}
              </a>
              <button
                className="ds-mobile-buy"
                onClick={() => go("shop")}
                tabIndex={isMenuOpen ? 0 : -1}
              >
                ✦ Buy Now
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}