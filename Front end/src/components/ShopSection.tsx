import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ShopProps {
setInstruction: (msg: string) => void;
setMode: (mode: "single" | "half" | "monthly") => void;
}

const TOTAL_MEMBERS = 250;

// ✅ REAL backend
const BACKEND_URL = "https://diya-backenddiya-backend.onrender.com";

const ShopSection: React.FC<ShopProps> = ({
setInstruction,
setMode,
}) => {
const [members, setMembers] = useState<number>(0);

// ✅ Fetch slots correctly
useEffect(() => {
const fetchMembers = async () => {
try {
const res = await fetch(`${BACKEND_URL}/api/slots`);


    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();

    // ✅ count booked members from array
    const bookedCount = Array.isArray(data)
      ? data.filter(
          (box: any) =>
            box.status === "reserved" || box.status === "booked"
        ).length
      : 0;

    setMembers(bookedCount);
  } catch (err) {
    console.error("Backend error:", err);
    setMembers(0);
  }
};

fetchMembers();


}, []);

const remainder = members % TOTAL_MEMBERS;
const nextDraw =
remainder === 0 ? TOTAL_MEMBERS : TOTAL_MEMBERS - remainder;

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

return ( <section className="py-12 sm:py-16 bg-gradient-to-b from-yellow-50 via-amber-50 to-white">


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

  <div className="max-w-5xl mx-auto mt-14 bg-white border border-yellow-200 rounded-3xl p-8 text-center shadow-lg mx-4">
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
        👥 Members Joined: {members}
      </p>

      <p className="mt-2 text-lg text-gray-700">
        ⏳ Next Draw in <b>{nextDraw}</b> members
      </p>
    </motion.div>
  </div>

</section>


);
};

export default ShopSection;
