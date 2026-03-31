import { useState, useEffect } from "react";
import { CheckCircle, Loader2, X, ArrowLeft } from "lucide-react";

/* ================= API ================= */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://diya-backenddiya-backend.onrender.com";

/* ================= TEST MODE ================= */
const TEST_MODE = true;

/* ================= PROPS ================= */
interface RegistrationModalProps {
  selectedBoxes: number[];
  offerPack?: "HALF_YEAR" | "ANNUAL" | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

type PackType = "NORMAL" | "HALF_YEAR" | "ANNUAL";

/* ================= PACK CONFIG ================= */

const PACK_CONFIG = {
  NORMAL: {
    label: "Regular Box",
    soapsPerPack: 3,
    pricePerPack: TEST_MODE ? 1 : 600,
  },

  HALF_YEAR: {
    label: "Half-Yearly Pack",
    soapsPerPack: 6,
    pricePerPack: TEST_MODE ? 1 : 900,
  },

  ANNUAL: {
    label: "Annual Pack",
    soapsPerPack: 12,
    pricePerPack: TEST_MODE ? 1 : 1188,
  },
};

export default function RegistrationModal({
  selectedBoxes,
  offerPack = null,
  onClose,
  onSuccess,
}: RegistrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [packType, setPackType] = useState<PackType>("NORMAL");

  /* ================= PACK TYPE ================= */

  useEffect(() => {
    if (offerPack === "HALF_YEAR") setPackType("HALF_YEAR");
    else if (offerPack === "ANNUAL") setPackType("ANNUAL");
    else setPackType("NORMAL");
  }, [offerPack]);

  const pack = PACK_CONFIG[packType];

  const totalBoxes = selectedBoxes.length;
  const totalSoaps = totalBoxes * pack.soapsPerPack;
  const totalPrice = totalBoxes * pack.pricePerPack;

  /* ================= FORM DATA ================= */

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    houseNo: "",
    street: "",
    city: "",
    pincode: "",
  });

  /* ================= LOAD RAZORPAY ================= */

  useEffect(() => {
    if ((window as any).Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.mobile) {
      setErrorMsg("Please fill all required fields");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setErrorMsg("Enter valid 10 digit mobile number");
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const newOrderId = "DSP" + Date.now().toString().slice(-8);

      setOrderId(newOrderId);

      onSuccess(newOrderId);

      await startPayment(newOrderId);
    } catch {
      setErrorMsg("Something went wrong");
      setLoading(false);
    }
  };

  /* ================= PAYMENT ================= */

  const startPayment = async (newOrderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boxes: selectedBoxes,
          packType,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Order failed");

      const rzp = new (window as any).Razorpay({
      key: "rzp_live_SEoqwulgqrAXys",
        amount: data.amount,
        currency: "INR",
        order_id: data.id,
        name: "Diya Soaps",
        description: "Lucky Draw Booking",

        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.mobile,
        },

        theme: {
          color: "#d97706",
        },

        handler: async (response: any) => {
          console.log("RAZORPAY RESPONSE:", response);
          const verify = await fetch(`${API_BASE}/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              boxes: selectedBoxes,
              packType,
              ...formData,
              orderId: newOrderId,
            }),
          });

          if (!verify.ok) {
            setErrorMsg("Payment verification failed");
            setLoading(false);
            return;
          }

          setPaymentSuccess(true);
          setLoading(false);

          setTimeout(onClose, 4000);
        },
      });

      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || "Payment failed");
      setLoading(false);
    }
  };

  /* ================= SUCCESS ================= */

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-3">
        <div className="bg-white max-w-md w-full p-6 rounded-2xl text-center">

          <CheckCircle size={64} className="mx-auto text-green-500 mb-3" />

          <h2 className="text-xl font-bold">Booking Successful</h2>

          <p className="mt-2">
            Order ID: <b>{orderId}</b>
          </p>

          <p>{pack.label}</p>

          <p>Total Boxes: {totalBoxes}</p>

          <p>Total Soaps: {totalSoaps}</p>

          <p className="font-bold text-green-600">
            ₹{totalPrice}
          </p>

        </div>
      </div>
    );
  }

  /* ================= FORM ================= */

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-3 left-3 bg-white p-1 rounded-full shadow"
        >
          <ArrowLeft size={20} />
        </button>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white p-1 rounded-full shadow"
        >
          <X size={20} />
        </button>

        {/* DETAILS */}

        <div className="p-4 pt-12 border-b bg-amber-50 text-sm">

          <h3 className="font-bold text-lg mb-2">
            Selected Details
          </h3>

          <p><b>Package:</b> {pack.label}</p>

          <p><b>No. of Boxes:</b> {totalBoxes}</p>

          <p className="mt-1 font-semibold">
            Selected Box Numbers:
          </p>

          <div className="flex flex-wrap gap-2 mt-1">
            {selectedBoxes.map((box) => (
              <span
                key={box}
                className="px-2 py-1 bg-yellow-200 rounded text-xs font-bold"
              >
                {String(box).padStart(3, "0")}
              </span>
            ))}
          </div>

          <p className="mt-2"><b>Total Soaps:</b> {totalSoaps}</p>

          <p className="font-bold text-green-700">
            Amount: ₹{totalPrice}
          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="p-4 space-y-3">

          <input
            placeholder="Full Name"
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
          />

          <input
            placeholder="Email"
            type="email"
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            placeholder="Mobile Number"
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setFormData({ ...formData, mobile: e.target.value })
            }
            required
          />

          <input
            placeholder="House No"
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setFormData({ ...formData, houseNo: e.target.value })
            }
          />

          <input
            placeholder="Street"
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setFormData({ ...formData, street: e.target.value })
            }
          />

          <input
            placeholder="City"
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
          />

          <input
            placeholder="Pincode"
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setFormData({ ...formData, pincode: e.target.value })
            }
          />

          {errorMsg && (
            <p className="text-red-600 text-sm text-center">
              {errorMsg}
            </p>
          )}

          <button
            disabled={loading}
            className="bg-amber-600 text-white py-2 w-full rounded-xl font-bold"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Register & Pay"
            )}
          </button>

        </form>

      </div>
    </div>
  );
}