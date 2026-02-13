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

  // ✅ PRICE (🔥 single box = ₹1)
  const totalPrice =
    selectedBoxes.length === 1
      ? 1
      : selectedBoxes.length === 2
      ? 900
      : 1188;

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

  // ✅ Load Razorpay script
  useEffect(() => {
    if ((window as any).Razorpay) return;

    const script = document.createElement("script");
    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // ================= REGISTER =================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      setErrorMsg("Please accept terms");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Reserve slots
      const reserve = await fetch(
        `${API_BASE}/reserve-boxes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            boxes: selectedBoxes,
          }),
        }
      );

      if (!reserve.ok) {
        setErrorMsg(
          "Slots already taken. Try another."
        );
        setLoading(false);
        return;
      }

      const newOrderId =
        "DSP" +
        Date.now().toString().slice(-8);

      setOrderId(newOrderId);
      onSuccess(newOrderId);

      await startPayment();

    } catch (err) {
      console.error(err);
      setErrorMsg("Registration failed");
      setLoading(false);
    }
  };

  // ================= PAYMENT =================

  const startPayment = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice,
          }),
        }
      );

      if (!res.ok)
        throw new Error("Order failed");

      const order = await res.json();

      const options = {
        key: "rzp_live_SEoqwulgqrAXys", // ✅ LIVE key
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Diya Soaps",

        handler: async (response: any) => {
          try {
            const verify =
              await fetch(
                `${API_BASE}/verify-payment`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    ...response,
                    boxes: selectedBoxes,
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.mobile,
                  }),
                }
              );

            if (!verify.ok) {
              setErrorMsg(
                "Payment verification failed"
              );
              setLoading(false);
              return;
            }

            setPaymentSuccess(true);
            setLoading(false);

            setTimeout(() => {
              onClose();
            }, 4000);

          } catch (err) {
            console.error(err);
            setErrorMsg(
              "Verification failed"
            );
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setErrorMsg(
              "Payment cancelled"
            );
            setLoading(false);
          },
        },
      };

      const rzp =
        new (window as any)
          .Razorpay(options);

      rzp.open();

    } catch (err) {
      console.error(err);
      setErrorMsg("Payment failed");
      setLoading(false);
    }
  };

  // ================= SUCCESS SCREEN =================

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[99999]">
        <div className="bg-white p-10 rounded-3xl text-center max-w-md shadow-2xl">
          <CheckCircle
            size={70}
            className="mx-auto text-green-500 mb-4 animate-bounce"
          />

          <h2 className="text-3xl font-bold mb-3 text-green-700">
            Registration Successful 🎉
          </h2>

          <p>Your booking is confirmed!</p>

          <p className="font-semibold">
            Order ID: {orderId}
          </p>
        </div>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 z-[99999]">

      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">

        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Complete Registration
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >

          <div className="bg-blue-50 border p-3 rounded-lg text-center">
            <p className="font-semibold">
              Selected Boxes:
            </p>

            <p>
              {selectedBoxes.join(", ")}
            </p>

            <p className="mt-2 font-bold text-lg">
              Total: ₹{totalPrice}
            </p>
          </div>

          {[
            "fullName",
            "email",
            "mobile",
            "houseNo",
            "street",
            "city",
            "pincode",
          ].map((field) => (
            <input
              key={field}
              required
              type={
                field === "email"
                  ? "email"
                  : "text"
              }
              placeholder={field}
              value={
                formData[
                  field as keyof typeof formData
                ] as string
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [field]:
                    e.target.value,
                })
              }
              className="w-full px-4 py-3 border rounded-lg"
            />
          ))}

          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={
                formData.agreeTerms
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  agreeTerms:
                    e.target.checked,
                })
              }
            />
            I agree to Lucky Draw terms
          </label>

          {errorMsg && (
            <p className="text-red-600 text-sm">
              {errorMsg}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold flex justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Processing…
              </>
            ) : (
              "Register & Pay"
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
