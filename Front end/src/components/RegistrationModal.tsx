import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";

const API_BASE =
  "https://diya-backenddiya-backend.onrender.com";

interface RegistrationModalProps {
  selectedBoxes: number[];
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export default function RegistrationModal({
  selectedBoxes,
  onClose,
  onSuccess,
}: RegistrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // ✅ FINAL ANNUAL OFFER PRICING
  const totalPrice =
    selectedBoxes.length === 1
      ? 600
      : selectedBoxes.length === 2
      ? 900
      : selectedBoxes.length === 4
      ? 1188 // 🎉 Annual Offer
      : selectedBoxes.length * 600;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    houseNo: "",
    street: "",
    city: "",
    pincode: "",
    agreeTerms: false,
  });

  /* ================= LOAD RAZORPAY ================= */

  useEffect(() => {
    if ((window as any).Razorpay) return;

    const script = document.createElement("script");
    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.mobile
    ) {
      setErrorMsg("Please fill all required fields");
      return false;
    }

    if (!formData.agreeTerms) {
      setErrorMsg("Please accept terms & conditions");
      return false;
    }

    return true;
  };

  /* ================= REGISTER ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Reserve
      const reserve = await fetch(
        `${API_BASE}/reserve-boxes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boxes: selectedBoxes,
          }),
        }
      );

      if (!reserve.ok) {
        setErrorMsg("Selected slots already booked");
        setLoading(false);
        return;
      }

      const newOrderId =
        "DSP" + Date.now().toString().slice(-8);

      setOrderId(newOrderId);
      onSuccess(newOrderId);

      await startPayment(newOrderId);
    } catch (err) {
      console.error(err);
      setErrorMsg("Registration failed");
      setLoading(false);
    }
  };

  /* ================= PAYMENT ================= */

  const startPayment = async (
    newOrderId: string
  ) => {
    try {
      // ✅ IMPORTANT: SEND BOXES NOT AMOUNT
      const res = await fetch(
        `${API_BASE}/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boxes: selectedBoxes,
          }),
        }
      );

      if (!res.ok)
        throw new Error("Order creation failed");

      const order = await res.json();

      const options = {
        key: "rzp_live_SEoqwulgqrAXys", // use test key if testing
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Diya Soaps",
        description: "Lucky Draw Booking",

        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.mobile,
        },

        theme: { color: "#d97706" },

        handler: async (response: any) => {
          try {
            const verify = await fetch(
              `${API_BASE}/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...response,
                  boxes: selectedBoxes,
                  name: formData.fullName,
                  email: formData.email,
                  phone: formData.mobile,
                  orderId: newOrderId,
                }),
              }
            );

            if (!verify.ok)
              throw new Error(
                "Verification failed"
              );

            setPaymentSuccess(true);
            setLoading(false);

            setTimeout(() => {
              onClose();
            }, 5000);
          } catch (err) {
            console.error(err);
            setErrorMsg(
              "Payment verification failed"
            );
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setErrorMsg("Payment cancelled");
            setLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(
        options
      );
      rzp.open();
    } catch (err) {
      console.error(err);
      setErrorMsg("Payment failed. Try again.");
      setLoading(false);
    }
  };

  /* ================= SUCCESS ================= */

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[99999]">
        <div className="bg-white p-10 rounded-3xl text-center max-w-md shadow-2xl">
          <CheckCircle
            size={70}
            className="mx-auto text-green-500 mb-4"
          />
          <h2 className="text-2xl font-bold">
            Registration Successful 🎉
          </h2>
          <p className="mt-2">
            Order ID: {orderId}
          </p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 z-[99999]">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          <div className="text-center">
            <p>
              Selected Boxes:{" "}
              {selectedBoxes.join(", ")}
            </p>
            <p className="font-bold">
              Total: ₹{totalPrice}
            </p>
          </div>

          <input
            required
            placeholder="Full Name"
            onChange={(e) =>
              setFormData({
                ...formData,
                fullName: e.target.value,
              })
            }
          />

          <input
            required
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />

          <input
            required
            placeholder="Mobile"
            onChange={(e) =>
              setFormData({
                ...formData,
                mobile: e.target.value,
              })
            }
          />

          {errorMsg && (
            <p className="text-red-500">
              {errorMsg}
            </p>
          )}

          <button
            disabled={loading}
            className="bg-amber-600 text-white px-4 py-2 rounded"
          >
            {loading
              ? "Processing..."
              : "Register & Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}
