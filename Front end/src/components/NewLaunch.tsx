import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Sparkles, 
  ShoppingBag, 
  ArrowRight,
  Percent,
  Gift,
  Home,
  Coins,
  Bike,
  Palmtree
} from "lucide-react";

// Image Imports (User uploaded descriptive assets)
import soapImg from "../assets/NewLaunch/soap.png";
import shampooImg from "../assets/NewLaunch/shampoo.png";
import faceWashImg from "../assets/NewLaunch/face wash.png";
import facePackImg from "../assets/NewLaunch/facepack.png";
import redSandalStickImg from "../assets/NewLaunch/red stick.png";
import redSandalPowderImg from "../assets/NewLaunch/red powder.png";
import whiteSandalStickImg from "../assets/NewLaunch/white stick.png";
import whiteSandalPowderImg from "../assets/NewLaunch/white powder.png";
import teaImg from "../assets/NewLaunch/tea.png";
import hairOilImg from "../assets/NewLaunch/hail oil.png";
import malaImg from "../assets/NewLaunch/mala.png";
import braceletImg from "../assets/NewLaunch/Bracelet.png";

// Product Type Definition
export interface LaunchProduct {
  id: string;
  name: string;
  category: "skincare" | "wellness";
  description: string;
  image: string;
}

// 12 Products Data Definition in the exact order of the brochure panels
const launchProducts: LaunchProduct[] = [
  // OUR PREMIUM SKINCARE COLLECTION
  {
    id: "red-sandal-soap",
    name: "Diya Red Sandalwood Soap",
    category: "skincare",
    description: "Enriched with pure Red Sandalwood for radiant, healthy and glowing skin.",
    image: soapImg,
  },
  {
    id: "shampoo",
    name: "Diya Shampoo",
    category: "skincare",
    description: "Strengthens hair, reduces hair fall & nourishes from root to tip.",
    image: shampooImg,
  },
  {
    id: "face-wash",
    name: "Diya Face Wash",
    category: "skincare",
    description: "Deep cleanses, refreshes and enhances natural glow.",
    image: faceWashImg,
  },
  {
    id: "face-pack",
    name: "Diya Red Sandalwood Face Pack",
    category: "skincare",
    description: "Purifies skin, brightens complexion & imparts a natural glow.",
    image: facePackImg,
  },
  {
    id: "red-sandal-stick",
    name: "Diya Red Sandalwood Stick",
    category: "skincare",
    description: "Premium quality sandalwood sticks for fragrance, rituals and well-being.",
    image: redSandalStickImg,
  },
  {
    id: "red-sandal-powder",
    name: "Diya Red Sandalwood Powder",
    category: "skincare",
    description: "100% pure & natural. Ideal for skin, hair & rituals.",
    image: redSandalPowderImg,
  },
  // SANDALWOOD & WELLNESS COLLECTION
  {
    id: "white-sandal-stick",
    name: "Diya White Sandalwood Stick",
    category: "wellness",
    description: "Soothing aroma for pooja, meditation & aromatherapy.",
    image: whiteSandalStickImg,
  },
  {
    id: "white-sandal-powder",
    name: "Diya White Sandalwood Powder",
    category: "wellness",
    description: "Cooling, calming & perfect for skin care & spiritual rituals.",
    image: whiteSandalPowderImg,
  },
  {
    id: "red-sandal-tea",
    name: "Vishista Red Sandalwood Tea",
    category: "wellness",
    description: "A royal blend of Red Sandalwood for a refreshing & rejuvenating experience.",
    image: teaImg,
  },
  {
    id: "hair-oil",
    name: "Diya Hair Oil",
    category: "wellness",
    description: "Nourishes scalp, promotes growth & gives natural shine.",
    image: hairOilImg,
  },
  {
    id: "red-sandal-mala",
    name: "Diya Red Sandalwood Mala",
    category: "wellness",
    description: "Handcrafted for peace, positivity & spiritual well-being.",
    image: malaImg,
  },
  {
    id: "red-sandal-bracelet",
    name: "Diya Red Sandalwood Bracelet",
    category: "wellness",
    description: "Elegant & natural. A symbol of protection & balance.",
    image: braceletImg,
  },
];

interface NewLaunchProps {
  onBuyKitClick?: () => void;
}

export default function NewLaunch({ onBuyKitClick }: NewLaunchProps) {
  const [activeTab, setActiveTab] = useState<"all" | "skincare" | "wellness">("all");

  const filteredProducts = launchProducts.filter(
    (product) => activeTab === "all" || product.category === activeTab
  );

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40">
      {/* Background flourishes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-yellow-100/40 to-amber-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-100/30 to-yellow-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/60 text-amber-900 font-bold text-xs sm:text-sm border border-amber-200/50 mb-4"
          >
            <Sparkles size={14} className="text-amber-600 animate-pulse" />
            Just Launched • New Collection
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
          >
            Sandalwood Luxury{" "}
            <span className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-600 bg-clip-text text-transparent">
              New Launches
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Explore our newly expanded range of pure, premium Red and White Sandalwood products. Sourced carefully, crafted traditionally.
          </motion.p>
        </div>

        {/* Tab Controls (Restored previous layout) */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 bg-amber-100/50 backdrop-blur rounded-xl border border-amber-200/30">
            {(["all", "skincare", "wellness"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 capitalize
                  ${
                    activeTab === tab
                      ? "bg-white text-amber-900 shadow-md font-black"
                      : "text-amber-800/80 hover:text-amber-900 hover:bg-white/40"
                  }
                `}
              >
                {tab === "all" ? "All Products" : tab + " Collection"}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid (Tabbed arrangement) */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-20"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => {
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={product.id}
                  className="group flex flex-col bg-white rounded-2xl border border-amber-100 hover:border-amber-300 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative"
                >
                  {/* Image container: object-contain with full aspect ratio so no text/imagery inside the image gets cropped */}
                  <div className="w-full bg-[#fcf9f2] flex items-center justify-center p-3 border-b border-amber-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-auto object-contain rounded-lg transition-transform duration-300 hover:scale-[1.01]"
                      style={{ maxHeight: "280px" }}
                    />
                  </div>

                  {/* Card Body - placed neatly below the full image */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <span className="text-[10px] font-black tracking-wider text-amber-700/80 uppercase">
                        {product.category === "skincare" ? "✨ Skincare Collection" : "🌿 Wellness Collection"}
                      </span>
                      <h3 className="mt-1 text-base font-extrabold text-gray-900 leading-tight min-h-[40px] flex items-center">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-amber-50 flex items-center justify-end">
                      <button
                        
                        className="w-full px-4 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/40 text-amber-900 text-xs font-black transition-all hover:scale-[1.02]"
                      >
                        Comming Soon!
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* ── EXCLUSIVE OFFERS & BUMPER DRAWS SECTION ── */}
        <div className="mt-16 border-t border-amber-200/60 pt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              Exclusive Launch{" "}
              <span className="bg-gradient-to-r from-red-800 to-amber-700 bg-clip-text text-transparent">
                Offers & Bumper Draws
              </span>
            </h3>
            <p className="text-sm text-gray-600 mt-2 max-w-xl mx-auto">
              Participate in our launch celebration by claiming the introductory combo offer or entering the bumper draw pool!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Panel 5: EXCLUSIVE INTRODUCTORY OFFER */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border-2 border-red-800/20 bg-gradient-to-br from-amber-950 via-red-950 to-amber-950 p-6 sm:p-8 shadow-xl text-white flex flex-col justify-between relative overflow-hidden"
            >
              {/* Gold decorative elements */}
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-yellow-300/10 to-transparent rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="bg-red-800/80 text-yellow-300 border border-yellow-500/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    🌟 Special Launch Deal
                  </span>
                  <span className="text-red-300 text-xs font-bold flex items-center gap-1">
                    <Percent size={12} />
                    Limited Period Offer
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-black mt-4 uppercase tracking-tight text-yellow-55">
                  Exclusive Introductory Offer
                </h4>
                <p className="text-red-200/80 text-xs sm:text-sm mt-1">
                  Own the complete 14-product luxury collection at massive savings!
                </p>

                <div className="my-8 p-6 bg-black/35 rounded-2xl border border-red-500/10 flex flex-col sm:flex-row items-center justify-around gap-6">
                  {/* MRP */}
                  <div className="text-center">
                    <p className="text-[10px] text-red-300 font-bold uppercase tracking-wider">Retail MRP</p>
                    <p className="text-xl font-bold text-red-300/70 line-through mt-1">₹31,500/-</p>
                  </div>
                  {/* OFFER PRICE */}
                  <div className="text-center relative py-2 px-6 bg-red-950/35 border border-yellow-500/30 rounded-xl">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                      BEST PRICE
                    </div>
                    <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider mt-1">Offer Price</p>
                    <p className="text-3xl font-black text-yellow-300 mt-1">₹16,000/-</p>
                  </div>
                  {/* SAVINGS */}
                  <div className="text-center">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">You Save</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">₹15,500/-</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2.5 text-xs text-red-100">
                    <span className="text-yellow-400 mt-0.5">✔</span>
                    <p><strong>A Premium Kit Worth ₹31,500</strong> – Now yours for just ₹16,000/- only!</p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-red-100">
                    <span className="text-yellow-400 mt-0.5">✔</span>
                    <p>Includes all 12 launch products plus additional premium ayurvedic skin & hair care essentials.</p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-red-100">
                    <span className="text-yellow-400 mt-0.5">✔</span>
                    <p>Guarantees free entry into the <strong>Lucky Bumper Draw pool</strong>.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onBuyKitClick}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 font-black shadow-lg hover:shadow-yellow-500/10 hover:scale-[1.02] transition-all"
              >
                <ShoppingBag size={18} />
                <span>Grab Yours Today – ₹16,000</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>

            {/* Panel 6: LUCKY BUMPER DRAWS */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-100/30 p-6 sm:p-8 shadow-xl text-gray-900 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Festive background graphics */}
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%) pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="bg-amber-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    🎉 Grand Giveaway
                  </span>
                  <span className="text-amber-800 text-xs font-bold flex items-center gap-1">
                    <Gift size={12} />
                    Free For All Buyers!
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-black mt-4 uppercase tracking-tight text-amber-950">
                  Lucky Bumper Draws
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Your premium chance to win life-changing prizes. Winners drawn live!
                </p>

                {/* Bumper Prizes Grid */}
                <div className="grid grid-cols-2 gap-3 my-6">
                  {/* 1st prize */}
                  <div className="p-3 bg-gradient-to-br from-amber-900 to-amber-950 text-white rounded-xl border border-amber-700/30 flex items-start gap-2.5 col-span-2 shadow-md">
                    <div className="p-2 bg-yellow-500 text-amber-950 rounded-lg shrink-0">
                      <Home size={18} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-[9px] text-yellow-300 font-extrabold uppercase tracking-wider">1st Lucky Winner Gets</p>
                      <p className="text-sm font-black mt-0.5">₹65 LAKHS WORTH 100 SQ YARDS PLOT</p>
                      <p className="text-[10px] text-amber-200/80">Fully registered & absolute ownership free!</p>
                    </div>
                  </div>

                  {/* Gold Coins */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-start gap-2.5 shadow-sm">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                      <Coins size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] text-amber-800 font-black uppercase tracking-wider">100 Customers</p>
                      <p className="text-xs font-extrabold text-gray-900 mt-0.5">1 Gram Gold Coin</p>
                      <p className="text-[9px] text-gray-500">Pure 24K gold</p>
                    </div>
                  </div>

                  {/* Bikes */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-start gap-2.5 shadow-sm">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                      <Bike size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] text-amber-800 font-black uppercase tracking-wider">20 Winners</p>
                      <p className="text-xs font-extrabold text-gray-900 mt-0.5">Electric Bikes</p>
                      <p className="text-[9px] text-gray-500">Premium eco-scooter</p>
                    </div>
                  </div>

                  {/* Dream Trips */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-start gap-2.5 shadow-sm col-span-2">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                      <Palmtree size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] text-amber-800 font-black uppercase tracking-wider">30 Lucky Customers</p>
                      <p className="text-xs font-extrabold text-gray-900 mt-0.5">Goa or Bangkok Vacation Trips</p>
                      <p className="text-[9px] text-gray-500">Fully sponsored 3D/4N holiday package</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-100/70 border border-amber-200 rounded-lg p-2.5 text-center text-xs font-bold text-amber-950 mb-4">
                  📢 Note: More you purchase, more your chances to win!
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-500 italic">
                *Terms & Conditions Apply. All draws verified by official authority.
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
