import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ShopProps {
  onBuy: (boxes: number) => void;
}

const TOTAL_MEMBERS = 250;
const BACKEND_URL = "https://diya-backend.onrender.com";

const ShopSection: React.FC<ShopProps> = ({ onBuy }) => {
  const [members, setMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/slots`);
        if (!res.ok) throw new Error("Backend failed");

        const data = await res.json();
        setMembers(data.booked || 0);
      } catch (err) {
        console.error("Backend error:", err);
        setMembers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const remainder = members % TOTAL_MEMBERS;
  const nextDraw =
    remainder === 0 ? TOTAL_MEMBERS : TOTAL_MEMBERS - remainder;

  return (
    <section className="py-28 bg-gradient-to-b from-yellow-50 to-white">

      {/* TITLE */}
      <div className="text-center mb-16 px-4">
        <h2 className="text-4xl font-bold text-amber-700">
          Shop & Rewards
        </h2>
        <p className="text-gray-600 mt-2">
          Premium Natural Soaps + Gold Lucky Draw Offers
        </p>
      </div>

      {/* ✅ 3 OFFER CARDS */}
      <div className="max-w-7xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* SINGLE */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border text-center">
            <h3 className="text-2xl font-bold text-amber-700 mb-4">
              📦 Single Box
            </h3>

            <ul className="space-y-2 text-gray-700 mb-6">
              <li>✔ 3 Premium Handmade Soaps</li>
              <li>✔ Natural Ingredients</li>
              <li>✔ Skin Friendly Formula</li>
            </ul>

            <p className="text-3xl font-bold text-amber-800 mb-6">
              ₹600
            </p>

            <button
              onClick={() => onBuy(1)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition"
            >
              Buy 1 Box
            </button>
          </div>

          {/* HALF */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border text-center">
            <h3 className="text-2xl font-bold text-amber-700 mb-4">
              ⭐ Half Yearly Pack
            </h3>

            <ul className="space-y-2 text-gray-700 mb-6">
              <li>✔ 6 Soaps (2 Boxes)</li>
              <li>✔ Extra Lucky Draw Entry</li>
            </ul>

            <p className="text-3xl font-bold text-amber-800 mb-6">
              ₹900
            </p>

            <button
              onClick={() => onBuy(2)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition"
            >
              Buy Half Pack
            </button>
          </div>

          {/* ANNUAL */}
          <div className="bg-yellow-400 p-8 rounded-2xl shadow-xl text-center relative">
            <span className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-bold">
              BEST OFFER
            </span>

            <h3 className="text-2xl font-bold mb-4">
              🎉 Annual Pack
            </h3>

            <ul className="space-y-2 mb-6">
              <li>✔ 12 Soaps (4 Boxes)</li>
              <li>✔ Maximum Savings</li>
            </ul>

            <p className="line-through mb-1">₹2400</p>
            <p className="text-3xl font-bold mb-6">₹1188</p>

            <button
              onClick={() => onBuy(4)}
              className="w-full bg-white hover:bg-gray-100 py-3 rounded-xl font-bold transition"
            >
              Buy Annual Pack
            </button>
          </div>

        </div>
      </div>

      {/* LUCKY DRAW */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg text-center">

        <h3 className="text-2xl font-bold text-amber-700 mb-4">
          🎁 Gold Lucky Draw Offer
        </h3>

        <p className="text-lg mb-4">
          Every <b>250 members</b> → 1 Winner gets <b>1g Gold Coin</b>
        </p>

        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-yellow-50 p-5 rounded-xl"
        >
          <p className="text-xl font-bold">
            👥 Members Joined: {loading ? "Loading..." : members}
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
