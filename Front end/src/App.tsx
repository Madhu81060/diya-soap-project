import React, { useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { Helmet } from "react-helmet-async";

import Navbar from "./components/Navbar";
import TopTrustBar from "./components/TopTrustBar";
import FloatingActions from "./components/FloatingActions";

import Hero from "./components/Hero";
import ProductSection from "./components/ProductSection";
import ProofSection from "./components/ProofSection";
import VideosSection from "./components/VideosSection";
import LuckyDrawSection from "./components/LuckyDrawSection";
import ShopSection from "./components/ShopSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./auth/ProtectedRoute";

import useScrollReveal from "./hooks/useScrollReveal";

import { SlotProvider } from "./context/SlotContext";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import ContactPage from "./pages/ContactPage";

function LandingPage() {
  useScrollReveal();

  const productRef   = useRef<HTMLDivElement>(null);
  const shopRef      = useRef<HTMLDivElement>(null);
  const proofRef     = useRef<HTMLDivElement>(null);
  const videosRef    = useRef<HTMLDivElement>(null);
  const luckyDrawRef = useRef<HTMLDivElement>(null);
  const contactRef   = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const handleNavigate = (section: string) => {
    if (section === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // "grid" and "shop" both go to ShopSection (grid is inside ShopSection)
    if (section === "grid" || section === "shop") {
      if (shopRef.current) {
        const y = shopRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      return;
    }

    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      product:   productRef,
      proof:     proofRef,
      videos:    videosRef,
      luckyDraw: luckyDrawRef,
      contact:   contactRef,
    };

    const ref = refs[section];
    if (ref?.current) {
      const y = ref.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Helmet>
        <title>Diya Soap - Premium Red Sandal Soap | Natural Ayurvedic Skincare</title>
        <meta name="description" content="Pure Red Sandalwood Soap for naturally glowing skin. Ayurvedic, natural, and premium skincare by Diya Natural Products. Buy now and enter our gold lucky draw!" />
      </Helmet>
      <Navbar onNavigate={handleNavigate} />
      <TopTrustBar />

      <section id="home" className="reveal">
        <Hero onJoinClick={() => handleNavigate("shop")} />
      </section>

      <div id="product" ref={productRef} className="reveal">
        <ProductSection
          onProofClick={() => handleNavigate("proof")}
          onBuyClick={() => handleNavigate("shop")}
        />
      </div>

      {/* ShopSection is FULLY self-contained:
          SHOP → GRID → REGISTER → SUCCESS
          No separate GridSection or RegistrationModal needed */}
      <div id="shop" ref={shopRef} className="reveal">
        <ShopSection />
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

      <FloatingActions
        phoneNumber="+918125134699"
        whatsappNumber="918125134699"
        onJoin={() => handleNavigate("shop")}
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
          <Route path="/"             element={<LandingPage />} />
          <Route path="/admin-login"  element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/privacy"      element={<PrivacyPolicy />} />
          <Route path="/terms"        element={<Terms />} />
          <Route path="/refund"       element={<RefundPolicy />} />
          <Route path="/shipping"     element={<ShippingPolicy />} />
          <Route path="/contact-page" element={<ContactPage />} />
        </Routes>
      </BrowserRouter>
    </SlotProvider>
  );
}