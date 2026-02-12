
// GoldDropSection.tsx
// ==================================================
// Lucky Draw Section — Every 250 Members
// Winner gets 1 Gram Gold
// Colorful Premium UI + Smooth Scroll
// ==================================================

import { Gift, Sparkles, Users, Crown } from "lucide-react";

export default function GoldDropSection() {
  return (
    <section
      id="gold-drop"
      className="py-20 bg-gradient-to-b from-yellow-50 via-white to-amber-100 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4">

        {/* ================= HERO BANNER ================= */}
        <div className="mb-14 rounded-3xl p-10 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white text-center shadow-2xl relative overflow-hidden">

          {/* glow effect */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)]"></div>

          <div className="relative flex justify-center items-center gap-3 mb-3">
            <Sparkles className="animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Every 250 Members Lucky Draw
            </h2>
            <Sparkles className="animate-pulse" />
          </div>

          <p className="text-xl font-semibold">
            🎁 One Lucky Winner gets <b>1 Gram Gold</b>
          </p>

          <p className="mt-3 text-sm opacity-95">
            Exclusive reward for every batch of 250 supporters ✨
          </p>
        </div>

        {/* ================= MAIN CARDS ================= */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ===== PRIZE CARD ===== */}
          <div className="bg-gradient-to-br from-amber-100 to-yellow-200 rounded-3xl border border-amber-300 shadow-xl p-7 backdrop-blur">

            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-amber-200">
                <Crown className="text-amber-700" />
              </div>

              <span className="px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-900 font-bold text-sm">
                Gold Reward
              </span>
            </div>

            <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
              Grand Prize
            </h3>

            <p className="mt-2 text-gray-700">
              For <b>every 250 confirmed bookings</b>, one lucky winner
              receives <span className="font-extrabold">1 Gram Gold</span>.
            </p>

            <div className="mt-5 bg-white rounded-2xl border border-amber-200 p-4 shadow-sm">
              <div className="flex justify-between">
                <div>
                  <div className="text-xs text-gray-600">Eligible Members</div>
                  <div className="font-extrabold text-lg">
                    Every 250 Bookings
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-600">Lucky Draw Entry</div>
                  <div className="font-extrabold text-green-700">FREE</div>
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-600">
                Book a slot → automatic lucky entry ✨
              </p>
            </div>
          </div>

          {/* ===== HOW IT WORKS ===== */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-7">

            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-200">
              <Users className="text-purple-700" />
            </div>

            <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
              How it works
            </h3>

            <div className="mt-4 space-y-4 text-sm">
              <Step
                num="1"
                title="Choose a box"
                text="Select an available slot from the booking grid."
              />

              <Step
                num="2"
                title="Complete booking"
                text="Submit your details and confirm ₹600 payment."
              />

              <Step
                num="3"
                title="Auto lucky entry"
                text="Your booking is added to the gold draw."
              />

              <Step
                num="4"
                title="Winner announcement"
                text="Winner revealed after each 250 batch closes."
              />
            </div>
          </div>

          {/* ===== CTA CARD ===== */}
          <div className="bg-gradient-to-br from-pink-50 to-amber-50 rounded-3xl border border-pink-200 shadow-lg p-7">

            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center border border-pink-200">
              <Gift className="text-pink-700" />
            </div>

            <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
              Join Now
            </h3>

            <p className="mt-2 text-gray-600">
              Book your slot and enter the gold lucky draw.
            </p>

            <button
              onClick={() => {
                const el = document.getElementById("first250");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-amber-500 text-white py-4 rounded-2xl hover:scale-105 font-extrabold text-lg shadow-xl transition-all duration-300"
            >
              Go to Booking Grid
            </button>

            <p className="mt-4 text-xs text-gray-500">
              Campaign terms apply
            </p>
          </div>
        </div>

        {/* ================= TERMS ================= */}
        <div className="mt-12 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-2xl p-6 text-center shadow-sm">

          <h4 className="text-lg font-extrabold text-amber-900">
            Important Note
          </h4>

          <p className="mt-2 text-gray-700">
            Every completed batch of 250 bookings qualifies for a lucky draw.
          </p>

          <p className="mt-1 font-semibold text-amber-800">
            TDS/Tax applicable as per government rules
          </p>
        </div>

      </div>
    </section>
  );
}

// ================= STEP COMPONENT =================
function Step({
  num,
  title,
  text,
}: {
  num: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 font-bold flex items-center justify-center">
        {num}
      </div>
      <div>
        <div className="font-bold text-gray-900">{title}</div>
        <div className="text-gray-600">{text}</div>
      </div>
    </div>
  );
}
