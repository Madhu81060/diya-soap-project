import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ShopProps {
  // number of boxes + offer pack
  onBuy: (
    boxes: number[],
    offer: "HALF_YEAR" | "ANNUAL" | null
  ) => void;
}

const TOTAL_MEMBERS = 250;

// ✅ BACKEND
const BACKEND_URL =
  "https://diya-backenddiya-backend.onrender.com";

const ShopSection: React.FC<ShopProps> = ({ onBuy }) => {
  const [members, setMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH MEMBERS ================= */

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/slots`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setMembers(data.booked || 0);
      } catch (err) {
        console.error("Members fetch error:", err);
        setMembers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  /* ================= BUY CLICK (UPDATED) ================= */

  const handleBuyClick = (
    boxCount: number,
    offer: "HALF_YEAR" | "ANNUAL" | null
  ) => {
    // 🔥 auto select boxes (dummy placeholders – grid handles real numbers)
    const autoBoxes = Array.from(
      { length: boxCount },
      (_, i) => i + 1
    );

    // send to parent → Grid + Registration
    onBuy(autoBoxes, offer);

    // scroll to grid
    const grid = document.getElementById("grid");
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const remainder = members % TOTAL_MEMBERS;
  const nextDraw =
    remainder === 0 ? TOTAL_MEMBERS : TOTAL_MEMBERS - remainder;

  return (
    <section className="py-20 bg-gradient-to-b from-yellow-50 to-white">

      {/* TITLE */}
      <div className="text-center mb-12 px-4">
        <h2 className="text-4xl font-bold text-amber-700">
          Shop & Rewards
        </h2>
        <p className="text-gray-600 mt-2">
          Premium Natural Soaps + Gold Lucky Draw Offers
        </p>
      </div>

      {/* PACK GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">

        {/* SINGLE */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          <h3 className="text-2xl font-bold text-amber-700 mb-4">
            📦 Single Box
          </h3>

          <ul className="space-y-2 text-gray-700">
            <li>✔ 3 Premium Handmade Soaps</li>
            <li>✔ Natural Ingredients</li>
            <li>✔ Skin Friendly Formula</li>
          </ul>

          <p className="text-3xl font-bold text-amber-800 mt-6">
            ₹600
          </p>

          <button
            onClick={() => handleBuyClick(1, null)}
            className="w-full mt-4 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700"
          >
            Buy 1 Box
          </button>
        </div>

        {/* HALF YEAR – 1 BOX */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          <h3 className="text-2xl font-bold text-amber-700 mb-4">
            ⭐ Half Yearly Pack
          </h3>

          <ul className="space-y-2 text-gray-700">
            <li>✔ 6 Soaps (1 Box)</li>
            <li>✔ Offer Price</li>
          </ul>

          <p className="text-3xl font-bold text-amber-800 mt-6">
            ₹900
          </p>

          <button
            onClick={() => handleBuyClick(1, "HALF_YEAR")}
            className="w-full mt-4 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700"
          >
            Buy Half Yearly
          </button>
        </div>

        {/* ANNUAL – 2 BOXES */}
        <div className="bg-yellow-400 p-8 rounded-2xl shadow-xl border relative">

          <span className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-bold">
            BEST OFFER
          </span>

          <h3 className="text-2xl font-bold mb-4">
            🎉 Annual Offer Pack
          </h3>

          <ul className="space-y-2">
            <li>✔ 12 Soaps (2 Boxes)</li>
            <li>✔ Maximum Savings</li>
          </ul>

          <p className="mt-6">
            <span className="line-through mr-2">
              ₹2400
            </span>
            <span className="text-3xl font-bold">
              ₹1188
            </span>
          </p>

          <button
            onClick={() => handleBuyClick(2, "ANNUAL")}
            className="w-full mt-4 bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-100"
          >
            Buy Annual Pack
          </button>
        </div>

      </div>

      {/* LUCKY DRAW */}
      <div className="max-w-4xl mx-auto mt-16 bg-white p-8 rounded-3xl shadow-lg text-center">
        <h3 className="text-2xl font-bold text-amber-700 mb-4">
          🎁 Gold Lucky Draw Offer
        </h3>

        <p className="text-lg mb-4">
          Every <b>250 members</b> → 1 Winner gets
          <b> 1g Gold Coin</b>
        </p>

        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-yellow-50 p-5 rounded-xl"
        >
          <p className="text-xl font-bold">
            👥 Members Joined:{" "}
            {loading ? "Loading..." : members}
          </p>

          <p className="mt-2 text-lg">
            ⏳ Next Draw in <b>{nextDraw}</b> members
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopSection;
