import React, { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

import Navbar from "./components/Navbar";
import TopTrustBar from "./components/TopTrustBar";
import FloatingActions from "./components/FloatingActions";

import Hero from "./components/Hero";
import GridSection from "./components/GridSection";
import ProductSection from "./components/ProductSection";
import ProofSection from "./components/ProofSection";
import VideosSection from "./components/VideosSection";
import LuckyDrawSection from "./components/LuckyDrawSection";
import ShopSection from "./components/ShopSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import RegistrationModal from "./components/RegistrationModal";

import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./auth/ProtectedRoute";

import useScrollReveal from "./hooks/useScrollReveal";

/* CONTEXT */
import { SlotProvider } from "./context/SlotContext";

/* POLICY PAGES */
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import ContactPage from "./pages/ContactPage";

/* 🔥 PACK CONFIG – SINGLE SOURCE OF TRUTH */
const PACK_CONFIG = {
  NORMAL: { boxesPerPack: 1, price: 600 },
  HALF_YEAR: { boxesPerPack: 1, price: 900 },
  ANNUAL: { boxesPerPack: 2, price: 1188 },
};

function LandingPage() {
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
  const [offerPack, setOfferPack] =
    useState<"HALF_YEAR" | "ANNUAL" | null>(null);

  // 🔥 NEW: quantity from ShopSection
  const [quantity, setQuantity] = useState(1);

  useScrollReveal();

  const gridRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);
  const luckyDrawRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const handleNavigate = (section: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      grid: gridRef,
      product: productRef,
      shop: shopRef,
      proof: proofRef,
      videos: videosRef,
      luckyDraw: luckyDrawRef,
      contact: contactRef,
    };

    if (section === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const ref = refs[section];
    if (ref?.current) {
      const y =
        ref.current.getBoundingClientRect().top +
        window.scrollY - 100;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  /* 🔥 SHOP → OFFER + QUANTITY HANDLER */
  const handleBuyFromShop = (
    offer: "HALF_YEAR" | "ANNUAL" | null,
    qty: number
  ) => {
    setSelectedBoxes([]);        // reset previous selection
    setOfferPack(offer);         // set offer
    setQuantity(qty);            // 🔥 store quantity
    handleNavigate("grid");
  };

  /* 🔥 DERIVED GRID RULES */
  const packKey = offerPack ?? "NORMAL";
  const boxesPerPack = PACK_CONFIG[packKey].boxesPerPack;
  const maxSelectable = boxesPerPack * quantity;

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar onNavigate={handleNavigate} />
      <TopTrustBar />

      <section id="home" className="reveal">
        <Hero onJoinClick={() => handleNavigate("grid")} />
      </section>

      <div id="product" ref={productRef} className="reveal">
        <ProductSection
          onProofClick={() => handleNavigate("proof")}
          onBuyClick={() => handleNavigate("grid")}
        />
      </div>

      {/* 🔥 SHOP SECTION */}
      <div id="shop" ref={shopRef} className="reveal">
        <ShopSection onBuy={handleBuyFromShop} />
      </div>

      {/* 🔥 GRID SECTION */}
      <div id="grid" ref={gridRef} className="reveal">
        <GridSection
          onBoxesSelected={(boxes) => setSelectedBoxes(boxes)}
          maxSelectable={maxSelectable}
          instruction={
            offerPack
              ? `${offerPack.replace("_", " ")} Pack selected – Please select exactly ${maxSelectable} box${
                  maxSelectable > 1 ? "es" : ""
                }`
              : `Select ${maxSelectable} box${
                  maxSelectable > 1 ? "es" : ""
                }`
          }
        />
      </div>

      <div id="luckyDraw" ref={luckyDrawRef} className="reveal">
        <LuckyDrawSection />
      </div>

      <div id="proof" ref={proofRef} className="reveal">
        <ProofSection />
      </div>

      <div id="videos" ref={videosRef} className="reveal">
        <VideosSection />
      </div>

      <div id="contact" ref={contactRef} className="reveal">
        <ContactSection />
      </div>

      <Footer />

      {/* 🔥 REGISTRATION MODAL */}
      {selectedBoxes.length > 0 && (
        <RegistrationModal
          selectedBoxes={selectedBoxes}
          offerPack={offerPack}
          onClose={() => {
            setSelectedBoxes([]);
            setOfferPack(null);
            setQuantity(1);
          }}
          onSuccess={() => {}}
        />
      )}

      <FloatingActions
        phoneNumber="+918125134699"
        whatsappNumber="918125134699"
        onJoin={() => handleNavigate("grid")}
      />

      <button
        onClick={() => navigate("/admin")}
        className="fixed right-3 bottom-4 bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg hover:bg-black flex items-center justify-center z-50"
      >
        <Shield size={20} />
      </button>
    </div>
  );
}

export default function App() {
  return (
    <SlotProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/contact-page" element={<ContactPage />} />
        </Routes>
      </BrowserRouter>
    </SlotProvider>
  );
}