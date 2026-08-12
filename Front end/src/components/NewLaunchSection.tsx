import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Maximize2,
  X,
  MessageCircle,
  ShoppingBag,
  Clock,
  ChevronRight,
  ShieldCheck,
  Award,
  Layers,
  Grid,
} from "lucide-react";

// Product Image imports
import bathPowderImg from "../assets/new_launches/bath-powder.jpg";
import herbalShampooImg from "../assets/new_launches/herbal-shampoo.jpg";
import bodyLotionImg from "../assets/new_launches/body-lotion.jpg";
import essentialOilImg from "../assets/new_launches/essential-oil.jpg";
import herbalPowderImg from "../assets/new_launches/herbal-powder.jpg";
import faceCreamImg from "../assets/new_launches/face-cream.jpg";
import hairOilImg from "../assets/new_launches/hair-oil.jpg";
import faceWashImg from "../assets/new_launches/face-wash.jpg";

// Custom Product Icons matching official poster bottom navigation bar
const FaceWashIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 2h8v3H8z" />
    <path d="M7 5l1.5 16a1 1 0 0 0 1 .9h5a1 1 0 0 0 1-.9L17 5" />
    <path d="M10 11h4" />
    <path d="M10 15h4" />
  </svg>
);

const FaceCreamIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="16" height="4" rx="1" />
    <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M9 13h6" />
  </svg>
);

const BodyLotionIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 2h4v2h-2v2h-2z" />
    <path d="M9 6h6v3H9z" />
    <path d="M6 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" />
    <circle cx="12" cy="15" r="2" />
  </svg>
);

const HerbalShampooIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 2h6v3H9z" />
    <path d="M7 8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z" />
    <path d="M12 10v6" />
    <path d="M10 13l2-2 2 2" />
  </svg>
);

const HairOilIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 2h2v3h-2z" />
    <path d="M10 5h4v3h-4z" />
    <path d="M7 9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9z" />
    <path d="M12 12c1.5 2 2 3.5 2 4.5a2 2 0 0 1-4 0c0-1 0.5-2.5 2-4.5z" />
  </svg>
);

const HerbalPowderIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 11c0 5 3.5 9 8 9s8-4 8-9H4z" />
    <path d="M16 4l-4 7" />
    <circle cx="15" cy="4" r="1.5" />
    <path d="M8 8c1-2 3-3 5-3" />
  </svg>
);

const BathPowderIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12c0 4.5 3.5 8 8 8s8-3.5 8-8H4z" />
    <path d="M7 12c1-2.5 3.5-4 5-4s4 1.5 5 4" />
    <path d="M12 5v3" />
  </svg>
);

const EssentialOilIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 2h4v3h-4z" />
    <path d="M11 5h2v3h-2z" />
    <path d="M8 9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9z" />
    <path d="M12 11v5" />
    <circle cx="12" cy="18" r="1" />
  </svg>
);

export interface NewLaunchProduct {
  id: string;
  name: string;
  categoryName: string;
  icon: React.ReactNode;
  image?: string;
  size?: string;
  tagline: string;
  description: string;
  keyIngredients: string[];
  badges: string[];
  isAvailable: boolean;
  mrp?: number;
  offerPrice?: number;
}

const products: NewLaunchProduct[] = [
  {
    id: "face-wash",
    name: "Red Sandalwood Face Wash",
    categoryName: "FACE WASH",
    icon: <FaceWashIcon />,
    image: faceWashImg,
    size: "100 ml e 3.38 fl.oz",
    tagline: "Natural & Gentle Cleansing",
    description:
      "Enriched with Red Sandalwood Extract for clear, refreshing & glowing skin. Designed with nature's finest ingredients to gently cleanse and revitalize daily.",
    keyIngredients: ["Red Sandalwood Extract", "Turmeric Extract", "Gentle Cleansing Base"],
    badges: ["For All Skin Types", "Natural & Gentle", "Clear & Radiant"],
    isAvailable: false,
  },
  {
    id: "face-cream",
    name: "Red Sandalwood Face Cream",
    categoryName: "FACE CREAM",
    icon: <FaceCreamIcon />,
    image: faceCreamImg,
    size: "50 g e 1.76 oz",
    tagline: "Nourish & Glow",
    description:
      "Enriched with Red Sandalwood Extract for nourished, radiant & healthy skin. Crafted to moisturize deeply, reduce dullness, and leave a natural sandalwood glow.",
    keyIngredients: ["Red Sandalwood Extract", "Saffron Extract", "Aloe Vera", "Natural Oils"],
    badges: ["100% Pure Sandalwood", "Nourish & Glow", "Radiant & Healthy"],
    isAvailable: false,
  },
  {
    id: "body-lotion",
    name: "Red Sandalwood Body Lotion",
    categoryName: "BODY LOTION",
    icon: <BodyLotionIcon />,
    image: bodyLotionImg,
    size: "200 ml e 6.76 fl.oz",
    tagline: "Nourish & Hydrate",
    description:
      "Formulated with rich red sandalwood extract, aloe vera, and natural oils for soft, smooth & deeply glowing skin all day long.",
    keyIngredients: ["Red Sandalwood Extract", "Aloe Vera", "Shea Butter", "Natural Oils"],
    badges: ["For All Skin Types", "Non-Greasy", "Fast Absorbing"],
    isAvailable: false,
  },
  {
    id: "herbal-shampoo",
    name: "Red Sandalwood Herbal Shampoo",
    categoryName: "HERBAL SHAMPOO",
    icon: <HerbalShampooIcon />,
    image: herbalShampooImg,
    size: "200 ml e 6.76 fl.oz",
    tagline: "Nourish & Strengthen",
    description:
      "Crafted with nature's finest ingredients to nourish, strengthen & bring out your natural hair shine. Free from harsh chemicals for everyday hair wellness.",
    keyIngredients: ["Red Sandalwood Extract", "Hibiscus", "Amla", "Bhringraj"],
    badges: ["Sulphate Free", "Paraben Free", "Botanical Goodness"],
    isAvailable: false,
  },
  {
    id: "hair-oil",
    name: "Red Sandalwood Hair Oil",
    categoryName: "HAIR OIL",
    icon: <HairOilIcon />,
    image: hairOilImg,
    size: "200 ml e 6.76 fl.oz",
    tagline: "Nourish & Grow",
    description:
      "Enriched with Red Sandalwood Extract, Bhringraj, Hibiscus, Amla & Coconut Oil for strong, thick & shiny hair. Nourishes your hair from root to tip.",
    keyIngredients: ["Red Sandalwood Extract", "Bhringraj", "Hibiscus", "Amla", "Coconut Oil"],
    badges: ["Suitable for All Hair Types", "Strong & Thick Hair", "Naturally Nurturing"],
    isAvailable: false,
  },
  {
    id: "herbal-powder",
    name: "Red Sandalwood Herbal Powder",
    categoryName: "HERBAL POWDER",
    icon: <HerbalPowderIcon />,
    image: herbalPowderImg,
    size: "100 g e 3.52 oz",
    tagline: "Natural & Pure Skin Radiance",
    description:
      "Made with a potent blend of finest herbs to refresh, rejuvenate & bring natural radiance to your skin & overall wellness.",
    keyIngredients: ["Red Sandalwood Powder", "Neem Leaves", "Amla", "Herbal Extract"],
    badges: ["100% Natural", "Chemical Free", "Radiance Booster"],
    isAvailable: false,
  },
  {
    id: "bath-powder",
    name: "Red Sandalwood Bath Powder",
    categoryName: "BATH POWDER",
    icon: <BathPowderIcon />,
    image: bathPowderImg,
    size: "200 g e 7.05 oz",
    tagline: "Refresh • Cleanse • Rejuvenate",
    description:
      "Crafted with nature's finest ingredients to cleanse, refresh & nourish your skin naturally. Provides a pure, refreshing & rejuvenating bath experience.",
    keyIngredients: ["Red Sandalwood", "Rose Petals", "Vetiver", "Ayurvedic Herbs"],
    badges: ["100% Pure Sandalwood", "Traditional Wisdom", "Luxury Wellness"],
    isAvailable: false,
  },
  {
    id: "essential-oil",
    name: "Red Sandalwood Essential Oil",
    categoryName: "ESSENTIAL OIL",
    icon: <EssentialOilIcon />,
    image: essentialOilImg,
    size: "15 ml e 0.51 fl.oz",
    tagline: "Pure & Natural Aromatherapy",
    description:
      "Steam distilled from the finest Red Sandalwood to bring you unmatched purity, deep relaxation & holistic wellness.",
    keyIngredients: ["100% Steam Distilled Red Sandalwood Extract"],
    badges: ["Steam Distilled", "Aromatherapy Grade", "Calming & Rejuvenating"],
    isAvailable: false,
  },
];

interface NewLaunchSectionProps {
  onBuyClick?: () => void;
}

export default function NewLaunchSection({ onBuyClick }: NewLaunchSectionProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("face-wash");
  const [activeTab, setActiveTab] = useState<"spotlight" | "grid">("spotlight");
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleWhatsAppOrder = (product: NewLaunchProduct) => {
    const text = encodeURIComponent(
      `Hello Diya Soaps team! I am interested in the NEW LAUNCH product: *${product.name}* (${product.size || ''}). Please let me know how to order!`
    );
    window.open(`https://wa.me/918125134699?text=${text}`, "_blank");
  };

  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-b from-[#fffdf8] via-[#fef7e7] to-[#fef0d0] text-amber-950 overflow-hidden font-sans border-y border-amber-200/60">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-yellow-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 font-bold text-xs sm:text-sm tracking-widest uppercase shadow-sm"
          >
            <Sparkles size={16} className="text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
            NEW LAUNCH 2026 • PURE AYURVEDIC WELLNESS
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-serif text-amber-950"
          >
            Expanding Our Promise of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-700 via-yellow-700 to-amber-800 bg-clip-text text-transparent">
              Natural Skincare & Wellness
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-amber-900/80 leading-relaxed"
          >
            Discover our brand new collection of natural bath, body & hair care essentials,
            infused with pure Red Sandalwood & traditional botanical extracts for healthy, glowing skin.
          </motion.p>

          {/* View Toggle */}
          <div className="mt-8 flex justify-center items-center gap-3">
            <button
              onClick={() => setActiveTab("spotlight")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                activeTab === "spotlight"
                  ? "bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white shadow-md shadow-amber-600/20 scale-105"
                  : "bg-white text-amber-900 border border-amber-200/80 hover:bg-amber-100/60 shadow-sm"
              }`}
            >
              <Layers size={16} />
              Featured Showcase
            </button>

            <button
              onClick={() => setActiveTab("grid")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                activeTab === "grid"
                  ? "bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white shadow-md shadow-amber-600/20 scale-105"
                  : "bg-white text-amber-900 border border-amber-200/80 hover:bg-amber-100/60 shadow-sm"
              }`}
            >
              <Grid size={16} />
              All Products Grid
            </button>
          </div>
        </div>

        {/* ── Product Navigation Bar (Matching official line icons) ── */}
        <div className="mb-12">
          <div className="text-center mb-4">
            <span className="text-xs uppercase tracking-widest text-amber-900 font-bold bg-amber-200/60 px-3.5 py-1 rounded-full border border-amber-300/70">
              EXPLORE THE NEW LAUNCH RANGE
            </span>
          </div>

          <div className="flex items-center justify-start md:justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-amber-400">
            {products.map((p) => {
              const isSelected = selectedProductId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProductId(p.id);
                    if (activeTab !== "spotlight") setActiveTab("spotlight");
                  }}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl min-w-[95px] sm:min-w-[115px] border transition-all duration-300 group flex-shrink-0 ${
                    isSelected
                      ? "bg-gradient-to-b from-amber-600 to-amber-700 text-white border-amber-500 shadow-md shadow-amber-600/20 scale-105"
                      : p.isAvailable
                      ? "bg-white text-amber-950 border-amber-200/80 hover:border-amber-400 hover:bg-amber-50/80 shadow-sm"
                      : "bg-amber-50/50 text-amber-800/60 border-amber-100 hover:opacity-100"
                  }`}
                >
                  <div className={`mb-1.5 transition-transform group-hover:scale-110 ${isSelected ? "text-white" : "text-amber-800"}`}>
                    {p.icon}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-bold tracking-tight text-center whitespace-nowrap ${
                      isSelected ? "text-white" : "text-amber-900 group-hover:text-amber-950"
                    }`}
                  >
                    {p.categoryName}
                  </span>
                  {!p.isAvailable && (
                    <span className="mt-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-medium">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN CONTENT VIEW ── */}
        <AnimatePresence mode="wait">
          {activeTab === "spotlight" ? (
            <motion.div
              key={selectedProduct.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl border border-amber-200/90 p-6 sm:p-8 lg:p-10 shadow-xl shadow-amber-900/5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* Left Side: Product Showcase Image */}
                <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
                  {selectedProduct.image ? (
                    <div className="relative group cursor-pointer w-full max-w-md">
                      {/* Soft Warm Glow */}
                      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-amber-300/30 to-yellow-400/20 blur-xl group-hover:opacity-100 transition-opacity opacity-70" />
                      
                      <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200 shadow-lg bg-amber-50/50">
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Quick View Trigger Overlay */}
                        <div
                          onClick={() => setLightboxImage({ src: selectedProduct.image!, title: selectedProduct.name })}
                          className="absolute inset-0 bg-amber-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm"
                        >
                          <div className="px-4 py-2 rounded-full bg-amber-950/80 border border-amber-300/50 backdrop-blur-sm flex items-center gap-2 shadow-lg">
                            <Maximize2 size={16} />
                            Click to Enlarge Image
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Placeholder for items with pending images */
                    <div className="w-full max-w-md aspect-[3/4] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-inner">
                      <div className="w-24 h-24 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-5xl mb-4 animate-bounce shadow-sm">
                        {selectedProduct.icon}
                      </div>
                      <span className="px-3.5 py-1 rounded-full bg-amber-200 text-amber-900 font-bold text-xs uppercase tracking-widest mb-2 border border-amber-300">
                        LAUNCHING SOON
                      </span>
                      <h4 className="text-xl font-bold text-amber-950 font-serif">
                        {selectedProduct.name}
                      </h4>
                      <p className="text-xs text-amber-800/80 mt-2 max-w-xs">
                        Product formulation ready. Official launch & availability coming very soon!
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Product Information */}
                <div className="lg:col-span-6 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      {selectedProduct.categoryName}
                    </span>
                    {selectedProduct.size && (
                      <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 font-medium text-xs">
                        {selectedProduct.size}
                      </span>
                    )}
                    {selectedProduct.isAvailable ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 size={12} /> Available Now
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 font-bold text-xs flex items-center gap-1">
                        <Clock size={12} /> Launching Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-950 font-serif tracking-tight leading-tight">
                    {selectedProduct.name}
                  </h3>

                  <p className="mt-2 text-lg font-medium text-amber-700 italic">
                    "{selectedProduct.tagline}"
                  </p>

                  <p className="mt-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Key Ingredients */}
                  <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                    <h5 className="text-xs uppercase tracking-widest text-amber-900 font-bold mb-2 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-amber-700" />
                      Key Ingredients & Extracts
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.keyIngredients.map((ing, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white text-amber-900 text-xs border border-amber-200 shadow-sm"
                        >
                          ✦ {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedProduct.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-amber-100/70 text-amber-900 text-xs font-semibold border border-amber-300/70 flex items-center gap-1"
                      >
                        <Award size={12} className="text-amber-700" />
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Pricing & Call to Action */}
                  <div className="mt-8 pt-6 border-t border-amber-200/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-amber-800/80 font-semibold uppercase tracking-wider">Status</div>
                      <div className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-950 font-extrabold text-base border border-amber-300/80 shadow-sm">
                        <Clock size={18} className="text-amber-700 animate-pulse" />
                        Coming Soon
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleWhatsAppOrder(selectedProduct)}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md hover:scale-105 transition-all"
                      >
                        <MessageCircle size={18} />
                        Pre-Book via WhatsApp
                      </button>

                      {onBuyClick && (
                        <button
                          onClick={onBuyClick}
                          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white font-extrabold text-sm shadow-md hover:scale-105 transition-all"
                        >
                          <ShoppingBag size={18} />
                          Shop All Offers
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          ) : (
            /* ── ALL 8 PRODUCTS GRID VIEW ── */
            <motion.div
              key="grid-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setActiveTab("spotlight");
                  }}
                  className="group bg-white rounded-2xl border border-amber-200/90 hover:border-amber-400 p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top Image / Placeholder */}
                    <div className="relative rounded-xl overflow-hidden mb-4 bg-amber-50/60 aspect-[4/5] flex items-center justify-center border border-amber-200/80">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <div className="mb-2 text-amber-800">{p.icon}</div>
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                            Coming Soon
                          </span>
                        </div>
                      )}

                      <div className="absolute top-2 right-2">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300 flex items-center gap-1 shadow-sm">
                          <Clock size={10} className="text-amber-700" />
                          Coming Soon
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-bold text-amber-700 tracking-wider uppercase mb-1">
                      {p.categoryName}
                    </div>

                    <h4 className="text-lg font-extrabold text-amber-950 font-serif group-hover:text-amber-700 transition-colors line-clamp-1">
                      {p.name}
                    </h4>

                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {p.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-950 font-extrabold text-xs border border-amber-300/80 shadow-sm">
                        <Clock size={13} className="text-amber-700" />
                        Coming Soon
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Banner Feature Bar */}
        <div className="mt-16 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-50 border border-amber-700/60 rounded-2xl p-6 text-center shadow-lg">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-amber-200 uppercase mb-2">
            100% PURE RED SANDALWOOD • ROOTED IN TRADITION • MADE FOR YOU
          </p>
          <p className="text-xs text-amber-100/80 max-w-2xl mx-auto">
            All our new launch formulations are crafted with genuine red sandalwood, botanical extracts & essential oils. Experiencing pure luxury skincare has never been easier.
          </p>
        </div>

      </div>

      {/* ── LIGHTBOX MODAL FOR IMAGE ZOOM ── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center cursor-pointer"
          >
            <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-amber-300 shadow-2xl bg-white">
              <div className="flex justify-between items-center px-4 py-3 bg-amber-900 text-white font-serif font-bold text-sm">
                <span>{lightboxImage.title}</span>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1 rounded-full hover:bg-amber-800 transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-2 bg-amber-50/30">
                <img
                  src={lightboxImage.src}
                  alt={lightboxImage.title}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
