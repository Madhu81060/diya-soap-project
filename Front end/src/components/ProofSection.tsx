import { Shield, CheckCircle, Award, Package } from "lucide-react";

import soapHand from "../assets/soap-hand.png";
import soapBox from "../assets/soap-with-box.png";
import soapGanesha from "../assets/soap-ganesha.png";
import soapSingle from "../assets/soap-single.png";

export default function ProofSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-[#fffaf0] to-[#fef3c7] overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Shield className="text-amber-700" size={64} />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            100% Authentic Product Guarantee
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Every Diya Red Sandal Soap is crafted with purity, tradition, and
            verified quality you can trust.
          </p>
        </div>

        {/* Proof cards */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Packaging */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-amber-200 hover:shadow-2xl transition">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-600 rounded-full p-3">
                <Package className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Sealed Packaging
              </h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <CheckCircle className="text-green-600" size={20} />
                Tamper-proof sealed box
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-green-600" size={20} />
                Original Diya branding & print
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-green-600" size={20} />
                Batch & manufacturing details
              </li>
            </ul>
          </div>

          {/* Quality */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-amber-200 hover:shadow-2xl transition">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-600 rounded-full p-3">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Certified Quality
              </h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <CheckCircle className="text-green-600" size={20} />
                Pure red sandal powder used
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-green-600" size={20} />
                100% natural & paraben-free
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-green-600" size={20} />
                Safe for daily skin care
              </li>
            </ul>
          </div>
        </div>

        {/* How to identify */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-amber-200 mb-16">
          <h3 className="text-2xl font-bold text-center mb-10">
            How to Identify Original Diya Soap
          </h3>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              "Check Seal",
              "Original Branding",
              "Natural Color",
              "Pure Aroma",
            ].map((step, i) => (
              <div key={i}>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <p className="font-semibold text-gray-800">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Real product images */}
        <div className="grid md:grid-cols-4 gap-6">
          {[soapHand, soapBox, soapGanesha, soapSingle].map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition group"
            >
              <img
                src={img}
                alt="Diya Red Sandal Soap"
                className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
