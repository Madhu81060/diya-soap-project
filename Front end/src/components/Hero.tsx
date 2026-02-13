import { useEffect, useState } from "react";
import heroSoap from "../assets/diya-soap.png";
import cowImg from "../assets/cow.png";

export default function HeroSection() {
  const TOTAL_SLOTS = 250;

  // ✅ Correct backend URL
  const BACKEND_URL =
    "https://diya-backenddiya-backend.onrender.com";

  const [booked, setBooked] = useState<number>(0);
  const [loading, setLoading] =
    useState<boolean>(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/slots`
        );

        if (!res.ok) {
          throw new Error(
            `HTTP error! ${res.status}`
          );
        }

        const data = await res.json();

        console.log(
          "Backend response:",
          data
        );

        // ✅ Safe fallback
        setBooked(
          typeof data?.booked === "number"
            ? data.booked
            : 0
        );
      } catch (err) {
        console.error(
          "Backend error:",
          err
        );
        setBooked(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  const available =
    TOTAL_SLOTS - booked;

  const progress =
    (booked / TOTAL_SLOTS) * 100;

  return (
    <section
      id="home"
      className="bg-[#fffaf3]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">

          {/* LEFT SIDE */}
          <div className="space-y-4">

            <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#fde6c8] to-[#f8d39c] text-[#8b4513] font-semibold text-xs sm:text-sm border border-[#f3c98b]">
              🌿 Ayurvedic • Natural • Premium Care
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#7a2e12] leading-tight">
              Red Sandal Soap for
              <span className="block text-[#9a3412]">
                Naturally Glowing Skin
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-700 max-w-xl">
              Crafted with ancient Ayurvedic red sandalwood —
              gentle on skin, powerful in results.
            </p>

            {/* SLOT STATUS BOX */}
            <div className="bg-white rounded-xl p-4 border border-[#f3c98b] shadow-sm max-w-xl">

              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                Live Slots Status ({TOTAL_SLOTS})
              </p>

              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Available:{" "}
                <b>
                  {loading
                    ? "..."
                    : available}
                </b>{" "}
                · Booked:{" "}
                <b>
                  {loading
                    ? "..."
                    : booked}
                </b>
              </p>

              <div className="mt-3 h-2 w-full bg-[#fde6c8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e6a756] to-[#d97706]"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p className="text-xs text-[#a16207] mt-2">
                ⏳ Limited slots. Booking closes once full.
              </p>

            </div>

            {/* BUTTON */}
            <a
              href="#grid"
              className="inline-block px-7 py-3 rounded-full bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-bold shadow-lg hover:scale-105 transition text-sm sm:text-base"
            >
              Book Your Soaps Box ₹600
            </a>

          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="flex justify-center lg:justify-end">

            <div className="relative w-full max-w-md lg:max-w-xl">

              <img
                src={heroSoap}
                alt="Diya Red Sandal Soap"
                className="w-full h-auto rounded-2xl shadow-xl border border-[#f1c27d] object-cover"
              />

              <div className="absolute top-2 right-2 bg-white border border-green-300 rounded-lg shadow-md px-2 py-1.5 flex items-center gap-2">

                <img
                  src={cowImg}
                  alt="Goshala Cow"
                  className="w-7 h-7 object-contain"
                />

                <div className="leading-tight">
                  <p className="text-[11px] font-bold text-green-900">
                    10% to Goshala
                  </p>

                  <p className="text-[10px] text-green-700">
                    Cow Support
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
