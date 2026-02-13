import logo from "../assets/logo.png";
import { Menu, X, PhoneCall, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface NavbarProps {
  onNavigate: (section: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  const phoneNumber = "+918125134699";
  const phoneLabel = "+91 81251 34699";

  const menuItems = [
    { label: "Home", section: "home" },
    { label: "Every 250", section: "grid" },
    { label: "Product", section: "product" },
    { label: "Shop", section: "shop" },
    { label: "Gold Drop", section: "luckyDraw", premium: true },
    { label: "Proof", section: "proof" },
    { label: "Videos", section: "videos" },
    { label: "Contact", section: "contact" },
  ];

  const go = (section: string) => {
    onNavigate(section); // ✅ USE APP NAVIGATION
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
      className={`sticky top-0 z-[999] transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-xl"
          : "bg-white/90 backdrop-blur-lg"
      } border-b`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Brand */}
          <button
            onClick={() => go("home")}
            className="flex items-center gap-3 group"
          >
            <img
              src={logo}
              alt="Diya Soap Logo"
              className="h-10 w-10 rounded-xl shadow group-hover:scale-110 transition"
            />

            <span
              className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Diya Soap
            </span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => {
              const isActive = active === item.section;

              return (
                <button
                  key={item.section}
                  onClick={() => go(item.section)}
                  className={`px-4 py-2 font-semibold text-sm ${
                    isActive
                      ? "text-orange-600"
                      : "text-gray-700 hover:text-orange-600"
                  }`}
                >
                  {item.premium && (
                    <Sparkles
                      size={14}
                      className="inline mr-1 text-amber-500"
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">

            <a
              href={`tel:${phoneNumber}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-orange-700 hover:bg-orange-50"
            >
              <PhoneCall size={16} />
              {phoneLabel}
            </a>

            <button
              onClick={() => go("grid")}
              className="px-6 py-2 rounded-full font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg hover:scale-105 transition"
            >
              Join Now
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden h-10 w-10 rounded-xl border bg-white shadow flex items-center justify-center"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-[500px]" : "max-h-0"
        } bg-white border-t`}
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.section}
              onClick={() => go(item.section)}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold ${
                active === item.section
                  ? "bg-orange-100 text-orange-700"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
