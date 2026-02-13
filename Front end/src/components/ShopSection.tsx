import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ShopProps {
  onBuy: (boxes: number) => void;
}

const TOTAL_MEMBERS = 250;
const BACKEND_URL = "https://diya-backenddiya-backend.onrender.com";

const ShopSection: React.FC<ShopProps> = ({ onBuy }) => {
  const [members, setMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/slots`);
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
    <section id="grid" className="py-16 bg-gradient-to-b from-yellow-50 to-white">

      {/* TITLE */}
      <div className="text-center mb-12 px-4">
        <h2 className="text-4xl font-bold text-amber-700">
          Shop & Rewards
        </h2>
        <p className="text-gray-600 mt-2">
          Premium Natural Soaps + Gold Lucky Draw Offers
        </p>
      </div>

      {/* 3 BOX GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-4">

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

          <p className="text-3xl font-bold text-amber-800 mt-6">₹600</p>

          <button
            onClick={() => onBuy(1)}
            className="w-full mt-4 bg-orange-600 text-white py-3 rounded-xl font-bold"
          >
            Buy 1 Box
          </button>
        </div>

        {/* HALF */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          <h3 className="text-2xl font-bold text-amber-700 mb-4">
            ⭐ Half Yearly Pack
          </h3>

          <ul className="space-y-2 text-gray-700">
            <li>✔ 6 Soaps (2 Boxes)</li>
            <li>✔ Extra Lucky Draw Entry</li>
          </ul>

          <p className="text-3xl font-bold text-amber-800 mt-6">₹900</p>

          <button
            onClick={() => onBuy(2)}
            className="w-full mt-4 bg-orange-600 text-white py-3 rounded-xl font-bold"
          >
            Buy Half Yearly
          </button>
        </div>

        {/* ANNUAL */}
        <div className="bg-yellow-400 p-8 rounded-2xl shadow-xl border relative">

          <span className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-bold">
            BEST OFFER
          </span>

          <h3 className="text-2xl font-bold mb-4">
            🎉 Annual Offer Pack
          </h3>

          <ul className="space-y-2">
            <li>✔ 12 Soaps (4 Boxes)</li>
            <li>✔ Maximum Savings</li>
          </ul>

          <p className="mt-6">
            <span className="line-through mr-2">₹2400</span>
            <span className="text-3xl font-bold">₹1188</span>
          </p>

          <button
            onClick={() => onBuy(4)}
            className="w-full mt-4 bg-white text-black py-3 rounded-xl font-bold"
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
