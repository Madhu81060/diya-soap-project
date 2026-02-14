import { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

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

  /* ================= PRICING ================= */

  const totalPrice =
    selectedBoxes.length === 1
      ? 600
      : selectedBoxes.length === 2
      ? 900
      : selectedBoxes.length === 4
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
    if (!selectedBoxes.length) {
      setErrorMsg("Please select at least one box");
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

  /* ================= REGISTER ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) return;

    setLoading(true);

    try {
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
        setErrorMsg("Selected slots already booked.");
        setLoading(false);
        return;
      }

      const newOrderId =
        "DSP" + Date.now().toString().slice(-8);

      setOrderId(newOrderId);
      onSuccess(newOrderId);

      await startPayment(newOrderId);

    } catch (err) {
      setErrorMsg("Something went wrong.");
      setLoading(false);
    }
  };

  /* ================= PAYMENT ================= */

  const startPayment = async (newOrderId: string) => {
    try {
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order failed");
      }

      const options = {
        key: "rzp_live_SEoqwulgqrAXys",
        amount: data.amount,
        currency: "INR",
        order_id: data.id,
        name: "Diya Soaps",
        description: "Lucky Draw Slot Booking",

        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.mobile,
        },

        theme: { color: "#d97706" },

        handler: async (response: any) => {

          const verify = await fetch(
            `${API_BASE}/verify-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                boxes: selectedBoxes,
                name: formData.fullName,
                email: formData.email,
                phone: formData.mobile,
                house_no: formData.houseNo,
                street: formData.street,
                city: formData.city,
                pincode: formData.pincode,
                orderId: newOrderId,
              }),
            }
          );

          if (!verify.ok) {
            setErrorMsg("Payment verification failed");
            setLoading(false);
            return;
          }

          setPaymentSuccess(true);
          setLoading(false);

          setTimeout(() => {
            onClose();
          }, 5000);
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      setErrorMsg(err.message || "Payment failed");
      setLoading(false);
    }
  };

  /* ================= SUCCESS SCREEN ================= */

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center">

          <CheckCircle
            size={80}
            className="mx-auto text-green-500 mb-6 animate-bounce"
          />

          <h2 className="text-3xl font-extrabold text-green-700">
            🎉 Booking Successful!
          </h2>

          <p className="mt-3 text-gray-600">
            Your order has been confirmed successfully.
          </p>

          <div className="mt-6 bg-green-50 p-6 rounded-2xl text-left space-y-2">

            <p><b>Order ID:</b> {orderId}</p>
            <p><b>Boxes:</b> {selectedBoxes.join(", ")}</p>
            <p><b>Total Paid:</b> ₹{totalPrice}</p>

            <hr />

            <p className="font-semibold text-sm">
              Delivery Address:
            </p>

            <p className="text-sm">
              {formData.houseNo}, {formData.street}
            </p>
            <p className="text-sm">
              {formData.city} - {formData.pincode}
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Confirmation email sent.
          </p>

          <p className="text-xs text-gray-400 mt-2">
            This window will close automatically.
          </p>
        </div>
      </div>
    );
  }

  /* ================= FORM UI ================= */

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl space-y-3 w-96 shadow-xl"
      >

        <p className="font-semibold">
          Selected: {selectedBoxes.join(", ")}
        </p>

        <p className="font-bold text-amber-600">
          Total: ₹{totalPrice}
        </p>

        {Object.keys(formData).map((field) => (
          <input
            key={field}
            required
            placeholder={field.replace("_", " ")}
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setFormData({
                ...formData,
                [field]: e.target.value,
              })
            }
          />
        ))}

        {errorMsg && (
          <p className="text-red-500 text-sm">
            {errorMsg}
          </p>
        )}

        <button
          disabled={loading}
          className="bg-amber-600 text-white px-4 py-2 rounded w-full hover:bg-amber-700 transition flex justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Register & Pay"}
        </button>
      </form>
    </div>
  );
}
