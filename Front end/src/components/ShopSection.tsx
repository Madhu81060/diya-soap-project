import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ShopProps {
  setInstruction: (msg: string) => void;
  setMode: (mode: "single" | "half" | "monthly") => void;
}

const TOTAL_MEMBERS = 250;

const ShopSection: React.FC<ShopProps> = ({
  setInstruction,
  setMode,
}) => {
  const [members, setMembers] = useState<number | null>(null);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(
          "https://diyasoap-backend.vercel.app/api/slots"
        );
        const data = await res.json();
        setMembers(data.booked);
      } catch {
        setMembers(0);
      }
    };

    fetchMembers();
  }, []);

  const safeMembers = members ?? 0;
  const remainder = safeMembers % TOTAL_MEMBERS;
  const nextDraw =
    remainder === 0 ? TOTAL_MEMBERS : TOTAL_MEMBERS - remainder;

  // Grid navigation
  const goToGrid = (boxes: number) => {
    let mode: "single" | "half" | "monthly";

    if (boxes === 1) mode = "single";
    else if (boxes === 2) mode = "half";
    else mode = "monthly";

    setMode(mode);

    setInstruction(
      boxes === 4
        ? "Select any 4 boxes below. One registration covers all 4 boxes."
        : boxes === 2
        ? "Select any 2 boxes below to continue purchase."
        : "Select 1 box below to continue purchase."
    );

    const target = document.getElementById("first250");
    target?.scrollIntoView({ behavior: "smooth" });
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-yellow-50 via-amber-50 to-white">

      {/* Title */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        viewport={{ once: true }}
        className="text-center mb-12 px-4"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-amber-700">
          Shop & Rewards
        </h2>
        <p className="text-gray-600 mt-2">
          Premium Natural Soaps + Gold Lucky Draw Offers
        </p>
      </motion.div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">

        {/* Single Box */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          whileHover={{ y: -6 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-lg border border-yellow-100 p-8 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-2xl font-bold mb-4 text-amber-700">
              📦 Single Box
            </h3>

            <ul className="space-y-2 mb-4 text-gray-700">
              <li>✔ 3 Premium Handmade Soaps</li>
              <li>✔ Natural Ingredients</li>
              <li>✔ Skin Friendly Formula</li>
            </ul>

            <p className="text-4xl font-bold mb-6 text-amber-700">
              ₹600
            </p>
          </div>

          <button
            onClick={() => goToGrid(1)}
            className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition"
          >
            Buy 1 Box
          </button>
        </motion.div>

        {/* Half Yearly Pack */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          whileHover={{ y: -6 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-lg border border-yellow-100 p-8 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-2xl font-bold mb-4 text-amber-700">
              ⭐ Half Yearly Pack
            </h3>

            <ul className="space-y-2 mb-4 text-gray-700">
              <li>✔ 6 Soaps (2 Boxes)</li>
              <li>✔ Family Saver Pack</li>
              <li>✔ Extra Lucky Draw Entry</li>
            </ul>

            <p className="text-4xl font-bold mb-6 text-amber-700">
              ₹900
            </p>
          </div>

          <button
            onClick={() => goToGrid(2)}
            className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition"
          >
            Buy Half Yearly
          </button>
        </motion.div>

        {/* Annual Offer Pack */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          whileHover={{ y: -6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white rounded-3xl shadow-xl p-8 relative flex flex-col justify-between"
        >
          <span className="absolute top-4 right-4 bg-white text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
            BEST OFFER
          </span>

          <div>
            <h3 className="text-2xl font-bold mb-4">
              🎉 Annual Offer Pack
            </h3>

            <ul className="space-y-2 mb-4">
              <li>✔ 12 Soaps (4 Boxes)</li>
              <li>✔ Maximum Savings Pack</li>
              <li>✔ Free Lucky Draw Entry</li>
            </ul>

            <div className="mb-6">
              <span className="line-through mr-2 opacity-80">
                ₹2400
              </span>
              <span className="text-4xl font-bold">
                ₹1188
              </span>
            </div>
          </div>

          <button
            onClick={() => goToGrid(4)}
            className="w-full bg-white text-amber-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Buy Annual Pack
          </button>
        </motion.div>

      </div>

      {/* Lucky Draw Section */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto mt-14 bg-white border border-yellow-200 rounded-3xl p-8 text-center shadow-lg mx-4"
      >
        <h3 className="text-2xl font-bold mb-4 text-amber-700">
          🎁 Gold Lucky Draw Offer
        </h3>

        <p className="text-lg mb-2 text-gray-700">
          Every <b>250 members</b> → 1 Winner gets <b>1g Gold Coin</b>
        </p>

        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-yellow-50 p-5 rounded-xl shadow-inner"
        >
          <p className="text-xl font-bold text-amber-700">
            👥 Members Joined: {safeMembers}
          </p>

          <p className="mt-2 text-lg text-gray-700">
            ⏳ Next Draw in <b>{nextDraw}</b> members
          </p>
        </motion.div>
      </motion.div>

    </section>
  );
};

export default ShopSection;
