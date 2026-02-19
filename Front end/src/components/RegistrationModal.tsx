import { useState, useEffect } from "react";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";

const API_BASE = "https://diya-backenddiya-backend.onrender.com";

interface RegistrationModalProps {
  selectedBoxes: number[];
  offerPack?: "HALF_YEAR" | "ANNUAL" | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

type PackType = "NORMAL" | "HALF_YEAR" | "ANNUAL";

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
    if (offerPack === "HALF_YEAR") {
      setPackType("HALF_YEAR");
    } else if (offerPack === "ANNUAL") {
      setPackType("ANNUAL");
    } else {
      setPackType("NORMAL");
    }
  }, [offerPack]);

  /* ================= PRICING ================= */
  const totalPrice =
    packType === "HALF_YEAR"
      ? 900
      : packType === "ANNUAL"
      ? 1188
      : selectedBoxes.length * 600;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    houseNo: "",
    street: "",
    city: "",
    pincode: "",
  });

  /* ================= LOCK SCROLL ================= */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  /* ================= LOAD RAZORPAY ================= */
  useEffect(() => {
    if ((window as any).Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ================= VALIDATION (UPDATED) ================= */
  const validateForm = () => {
    if (!selectedBoxes.length) {
      setErrorMsg("No boxes selected");
      return false;
    }

    // 🔒 OFFER RULE ENFORCEMENT
    if (packType === "HALF_YEAR" && selectedBoxes.length !== 1) {
      setErrorMsg("Half Year Pack requires exactly 1 box");
      return false;
    }

    if (packType === "ANNUAL" && selectedBoxes.length !== 2) {
      setErrorMsg("Annual Pack requires exactly 2 boxes");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setErrorMsg("Invalid mobile number");
      return false;
    }

    for (const key in formData) {
      if (!(formData as any)[key].trim()) {
        setErrorMsg("Please fill all fields");
        return false;
      }
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
      const reserve = await fetch(`${API_BASE}/reserve-boxes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boxes: selectedBoxes }),
      });

      if (!reserve.ok) {
        setErrorMsg("Selected boxes already booked");
        setLoading(false);
        return;
      }

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boxes: selectedBoxes,
          packType,
          amount: totalPrice,
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
        theme: { color: "#d97706" },
        handler: async (response: any) => {
          const verify = await fetch(`${API_BASE}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              boxes: selectedBoxes,
              packType,
              amount: totalPrice,
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
          setTimeout(onClose, 5000);
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
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
        <div className="bg-white max-w-lg w-full mx-4 p-8 rounded-2xl text-center">
          <CheckCircle size={70} className="mx-auto text-green-500 mb-3" />
          <h2 className="text-2xl font-bold">Booking Successful</h2>
          <p><b>Order ID:</b> {orderId}</p>
          <p><b>Selected Boxes:</b> {selectedBoxes.join(", ")}</p>
          <p><b>Pack:</b> {packType}</p>
          <p className="font-bold text-green-600">₹{totalPrice}</p>
        </div>
      </div>
    );
  }

  /* ================= FORM ================= */
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft />
          </button>
          <h3 className="text-lg font-bold">Registration</h3>
        </div>

        {/* SUMMARY */}
        <div className="p-3 rounded bg-yellow-100 border text-sm font-semibold mb-2">
          Selected Boxes: {selectedBoxes.join(", ")}
        </div>

        <div className="p-2 rounded bg-blue-100 text-blue-800 text-sm font-bold mb-4">
          Purchase Type: {packType} | Amount: ₹{totalPrice}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {Object.keys(formData).map((field) => (
            <input
              key={field}
              placeholder={field}
              className="border p-2 w-full rounded"
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
            />
          ))}

          {errorMsg && (
            <p className="text-red-600 text-sm font-semibold text-center">
              {errorMsg}
            </p>
          )}

          <button
            disabled={loading}
            className="bg-amber-600 text-white py-2 w-full rounded-xl font-bold flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Register & Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}
