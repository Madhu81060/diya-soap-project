import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill Name, Email and Message");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/send-contact-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send message");
      }

      toast.success("Message sent successfully! 📩");

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-white to-amber-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Get in Touch
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We're here to help you anytime 🌿
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Contact Info */}
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 border border-amber-300 shadow-lg">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">
              Contact Information
            </h3>

            <div className="space-y-5">

              {[
                {
                  icon: <MapPin size={22} />,
                  title: "Address",
                  text: `Sai Rasik Residency, Flat No 401, Block A,
Vittal Rao Nagar, Near Durgam Cheruvu Metro Station,
Madhapur, Hyderabad – 500081`,
                },
                {
                  icon: <Phone size={22} />,
                  title: "Phone",
                  text: "+91 81251 34699",
                },
                {
                  icon: <Mail size={22} />,
                  title: "Email",
                  text: "diyasoapbusiness@gmail.com",
                },
                {
                  icon: <Clock size={22} />,
                  title: "Business Hours",
                  text: "Mon–Sat: 9AM–7PM | Sun: 10AM–5PM",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-full p-3 text-white">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {item.title}
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">
              Send us a Message 💬
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">

              {[
                { type: "text", key: "name", placeholder: "Your Name" },
                { type: "email", key: "email", placeholder: "Email Address" },
                { type: "tel", key: "phone", placeholder: "Phone Number (optional)" },
              ].map((field) => (
                <input
                  key={field.key}
                  type={field.type}
                  value={(form as any)[field.key]}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              ))}

              <textarea
                rows={4}
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
                placeholder="How can we help you?"
                className="w-full px-4 py-3 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-lg font-bold shadow-lg disabled:opacity-60 hover:scale-[1.02] transition"
              >
                {loading ? "Sending..." : "Send Message 🚀"}
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
