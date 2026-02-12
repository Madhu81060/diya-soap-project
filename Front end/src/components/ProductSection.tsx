
import { Leaf, Droplet, Sun, Heart, Sparkles, BadgeCheck } from "lucide-react";
import keyIngredientsImg from "../assets/key-ingredients.png";

type ProductSectionProps = {
  onProofClick?: () => void;
  onBuyClick?: () => void;
};

export default function ProductSection({
  onProofClick,
  onBuyClick,
}: ProductSectionProps) {
  const benefits = [
    {
      icon: Leaf,
      title: "Pure Red Sandalwood",
      description:
        "Authentic red sandalwood powder sourced from certified suppliers",
    },
    {
      icon: Droplet,
      title: "Deep Moisturizing",
      description:
        "Natural oils that keep your skin hydrated and soft all day",
    },
    {
      icon: Sun,
      title: "Skin Brightening",
      description:
        "Reduces tan, dark spots, and evens out skin tone naturally",
    },
    {
      icon: Heart,
      title: "Anti-Aging",
      description: "Rich in antioxidants that fight signs of aging",
    },
  ];

  const ingredients = [
    {
      title: "Red Sandalwood Powder",
      desc: "Natural skin brightening and cooling properties",
    },
    { title: "Coconut Oil", desc: "Deep moisturization and nourishment" },
    {
      title: "Turmeric Extract",
      desc: "Anti-bacterial and anti-inflammatory",
    },
    { title: "Glycerin", desc: "Keeps skin soft and supple" },
    {
      title: "Natural Fragrance",
      desc: "No artificial chemicals or perfumes",
    },
  ];

  return (
    <section className="relative py-14 sm:py-20 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-yellow-50 via-amber-100 to-yellow-200" />
      <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-yellow-300/40 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-amber-300/40 rounded-full blur-3xl animate-pulse -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow text-amber-900 font-bold text-xs sm:text-sm">
            <Sparkles size={14} className="text-yellow-600 animate-pulse" />
            Ayurvedic • Natural • Premium Care
          </div>

          <h2 className="mt-5 text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              Red Sandal Soap
            </span>
            ?
          </h2>

          <p className="mt-3 text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
            Experience the power of ancient Ayurvedic ingredients combined
            with modern soap-making techniques — for glowing, healthy skin.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl sm:rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-yellow-200 hover:-translate-y-2"
              >
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-yellow-200/20 to-amber-300/20 opacity-0 group-hover:opacity-100 transition" />

                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-4 text-base sm:text-lg font-extrabold text-gray-900">
                    {b.title}
                  </h3>

                  <p className="mt-2 text-gray-600 text-sm">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ingredients Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-yellow-200 p-6 sm:p-10 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

            {/* Left */}
            <div>
              <div className="flex items-center gap-2 text-yellow-800 font-bold text-sm">
                <BadgeCheck size={16} className="text-yellow-600" />
                Certified ingredients • Skin-friendly
              </div>

              <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900">
                Key Ingredients
              </h3>

              <ul className="mt-6 space-y-4 sm:space-y-5">
                {ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center shadow">
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-600 animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">
                        {ing.title}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {ing.desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onBuyClick}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-extrabold shadow-xl hover:scale-105 transition"
                >
                  Buy Now – ₹600
                </button>

                <button
                  onClick={onProofClick}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-yellow-300 text-yellow-900 font-bold hover:bg-yellow-50 transition"
                >
                  View Proof
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative group">
              <div className="absolute -inset-4 sm:-inset-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-yellow-300/40 to-amber-400/40 blur-2xl group-hover:blur-3xl transition -z-10" />

              <img
                src={keyIngredientsImg}
                alt="Key Ingredients - Diya Soap"
                className="
                  rounded-2xl sm:rounded-3xl shadow-xl
                  w-full h-auto
                  max-h-[320px] sm:max-h-[420px]
                  object-cover border border-yellow-200
                  group-hover:scale-105 transition
                "
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

