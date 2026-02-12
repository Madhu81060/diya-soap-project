import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const API_BASE = "https://diyasoap-backend.onrender.com";

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

  const totalPrice =
    selectedBoxes.length === 4 ? 1188 : selectedBoxes.length * 600;

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    houseNo: "",
    street: "",
    city: "",
    pincode: "",
    agreeTerms: false,
  });

  // ================= REGISTER =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const newOrderId = "DSP" + Date.now().toString().slice(-8);

      // Save registration in Supabase
      for (const box of selectedBoxes) {
        const { error } = await supabase.from("members").insert({
          box_number: box,
          full_name: formData.fullName,
          mobile: formData.mobile,
          house_no: formData.houseNo,
          street: formData.street,
          city: formData.city,
          pincode: formData.pincode,
          order_id: newOrderId,
          payment_status: "pending",
        });

        if (error) throw error;
      }

      onSuccess(newOrderId);

      // Start payment
      await startPayment(newOrderId);
    } catch (err) {
      console.error(err);
      setErrorMsg("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= PAYMENT =================
  const startPayment = async (newOrderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: totalPrice }),
      });

      if (!res.ok) throw new Error("Order creation failed");

      const order = await res.json();

      const options = {
        key: "rzp_live_SEoqwulgqrAXys",
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Diya Soaps",

        handler: async () => {
          await supabase
            .from("members")
            .update({ payment_status: "paid" })
            .eq("order_id", newOrderId);

          alert("✅ Payment successful!");
          onClose();
        },

        modal: {
          ondismiss: () => {
            alert("Payment cancelled");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 z-[99999]">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Complete Registration</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div className="bg-blue-50 border p-3 rounded-lg text-center">
            <p className="font-semibold">Selected Boxes:</p>
            <p>{selectedBoxes.join(", ")}</p>
            <p className="mt-2 font-bold text-lg">Total: ₹{totalPrice}</p>
          </div>

          <input
            required
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-lg"
          />

          <input
            required
            pattern="[0-9]{10}"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({ ...formData, mobile: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-lg"
          />

          <input
            required
            placeholder="House / Flat No"
            value={formData.houseNo}
            onChange={(e) =>
              setFormData({ ...formData, houseNo: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-lg"
          />

          <input
            required
            placeholder="Street"
            value={formData.street}
            onChange={(e) =>
              setFormData({ ...formData, street: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-lg"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              required
              pattern="[0-9]{6}"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={(e) =>
                setFormData({ ...formData, pincode: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              required
              checked={formData.agreeTerms}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  agreeTerms: e.target.checked,
                })
              }
            />
            I agree to Lucky Draw terms
          </label>

          {errorMsg && (
            <p className="text-red-600 text-sm">{errorMsg}</p>
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
