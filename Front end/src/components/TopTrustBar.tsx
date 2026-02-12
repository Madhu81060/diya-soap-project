import {
  Trophy,
  Sparkles,
  Instagram,
  Facebook,
  Youtube,
  Medal,
} from "lucide-react";

export default function TopTrustBar() {
  return (
    <div className="w-full shadow-sm">

      {/* 🔥 LAYER 1 — SOCIAL MEDIA */}
      <div className="bg-gray-900 text-gray-200">

        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-xs">

          <div className="font-semibold tracking-wide">
            Follow Diya Cosmetics
          </div>

          <div className="flex items-center gap-5">

            <a
              href="https://www.instagram.com/diyacosmeticss/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-pink-400 transition"
            >
              <Instagram size={14} />
              Instagram
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-red-400 transition"
            >
              <Youtube size={14} />
              YouTube
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61587682028133"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-400 transition"
            >
              <Facebook size={14} />
              Facebook
            </a>

          </div>

        </div>

      </div>

      {/* 🔥 LAYER 2 — PACK OFFERS */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white">

        <div className="max-w-7xl mx-auto px-4 py-3">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center font-semibold text-sm">

            <div className="bg-white/15 backdrop-blur-sm rounded-lg py-2">
              📦 <b>Single Pack</b> — 3 Soaps ₹600
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-lg py-2">
              ⭐ <b>Half Pack</b> — 6 Soaps ₹900
            </div>

            <div className="bg-yellow-300 text-red-700 rounded-lg py-2 font-extrabold shadow">

              <Sparkles size={14} className="inline mr-1 animate-pulse" />

              <b>Annual Pack</b> — 12 Soaps ₹1188

            </div>

          </div>

        </div>

      </div>

      {/* 🔥 LAYER 3 — 250 MEMBERS DRAW */}
      <div className="bg-yellow-100 border-t border-yellow-300">

        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold text-amber-900 text-center">

          <Trophy size={16} className="text-yellow-700" />

          Every 250 Members →
          <span className="text-orange-700">
            1 Lucky Winner Gets 1 Gram Gold Coin
          </span>

        </div>

      </div>

      {/* 🔥 LAYER 4 — GRAND DRAW SCROLLING */}
      <div className="bg-black text-yellow-300 overflow-hidden">

        <div className="whitespace-nowrap animate-marquee flex items-center gap-6 py-2 text-sm font-bold">

          <Medal size={16} className="text-yellow-400 ml-4" />

          🎉 GRAND 15,000 MEMBERS DRAW 🎉

          🥇 1st Winner → 10 Grams Gold Coin

          🥈 2nd Winner → 5 Grams Gold Coin

          🎥 Live Lucky Draw on YouTube

          ⭐ Transparent Selection Process

        </div>

      </div>

      {/* 🔥 MARQUEE ANIMATION */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }

          .animate-marquee {
            animation: marquee 22s linear infinite;
          }
        `}
      </style>

    </div>
  );
}
