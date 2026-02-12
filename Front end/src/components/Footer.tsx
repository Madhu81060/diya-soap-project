import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const scrollTo = (section: string) => {
    const el = document.getElementById(section);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">

        <div className="grid md:grid-cols-4 gap-8 mb-8">

          <div>
            <h3 className="text-2xl font-bold mb-4 text-amber-400">
              Diya Soap
            </h3>
            <p className="text-gray-400">
              Pure red sandalwood soap for naturally glowing skin.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">

              <li>
                <button onClick={() => scrollTo("home")} className="hover:text-amber-400">
                  Home
                </button>
              </li>

              <li>
                <button onClick={() => scrollTo("grid")} className="hover:text-amber-400">
                  Every 250
                </button>
              </li>

              <li>
                <button onClick={() => scrollTo("shop")} className="hover:text-amber-400">
                  Shop
                </button>
              </li>

              <li>
                <button onClick={() => scrollTo("luckyDraw")} className="hover:text-amber-400">
                  Lucky Draw
                </button>
              </li>

            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">

              <li>
                <Link to="/contact-page" className="hover:text-amber-400">
                  Contact Us
                </Link>
              </li>

              <li>
                <Link to="/shipping" className="hover:text-amber-400">
                  Shipping Policy
                </Link>
              </li>

              <li>
                <Link to="/refund" className="hover:text-amber-400">
                  Refund Policy
                </Link>
              </li>

            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">

              <li>
                <Link to="/privacy" className="hover:text-amber-400">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/terms" className="hover:text-amber-400">
                  Terms & Conditions
                </Link>
              </li>

            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 flex justify-between items-center">

          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Diya Soap
          </p>

          <p className="text-gray-400 text-sm flex items-center gap-2">
            Made with <Heart size={16} className="text-red-500" /> in India
          </p>

        </div>

      </div>
    </footer>
  );
}
