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

/* POLICY PAGES */
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import ContactPage from "./pages/ContactPage";

function LandingPage() {

  // ✅ Selected boxes for registration
  const [selectedBoxes, setSelectedBoxes] =
    useState<number[] | null>(null);

  // ✅ NEW: Mode state (important fix)
  const [mode, setMode] =
    useState<"single" | "half" | "monthly">("single");

  useScrollReveal();

  const gridRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);
  const luckyDrawRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // ✅ Smooth scroll navigation
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

  return (
    <div className="min-h-screen bg-transparent">

      <Navbar onNavigate={handleNavigate} />
      <TopTrustBar />

      {/* HERO */}
      <section id="home" className="reveal">
        <Hero onJoinClick={() => handleNavigate("grid")} />
      </section>

      {/* PRODUCT */}
      <div id="product" ref={productRef} className="reveal">
        <ProductSection
          onProofClick={() => handleNavigate("proof")}
          onBuyClick={() => handleNavigate("grid")}
        />
      </div>

      {/* ✅ SHOP (IMPORTANT FIX) */}
      <div id="shop" ref={shopRef} className="reveal">
        <ShopSection
          onBuy={(boxes) => {

            // set mode based on selection
            if (boxes === 1) setMode("single");
            if (boxes === 2) setMode("half");
            if (boxes === 4) setMode("monthly");

            handleNavigate("grid");
          }}
        />
      </div>

      {/* ✅ GRID (IMPORTANT FIX) */}
      <div id="grid" ref={gridRef} className="reveal">
        <GridSection
          mode={mode}
          instruction={`Select ${
            mode === "monthly" ? 4 :
            mode === "half" ? 2 : 1
          } boxes`}
          onBoxesSelected={(boxes) =>
            setSelectedBoxes(boxes)
          }
        />
      </div>

      {/* LUCKY DRAW */}
      <div id="luckyDraw" ref={luckyDrawRef} className="reveal">
        <LuckyDrawSection />
      </div>

      {/* PROOF */}
      <div id="proof" ref={proofRef} className="reveal">
        <ProofSection />
      </div>

      {/* VIDEOS */}
      <div id="videos" ref={videosRef} className="reveal">
        <VideosSection />
      </div>

      {/* CONTACT */}
      <div id="contact" ref={contactRef} className="reveal">
        <ContactSection />
      </div>

      <Footer />

      {/* Registration modal */}
      {selectedBoxes && (
        <RegistrationModal
          selectedBoxes={selectedBoxes}
          onClose={() => setSelectedBoxes(null)}
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
  );
}
