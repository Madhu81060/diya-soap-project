
// import { useState, useEffect } from "react";
// import { CheckCircle, Loader2, X } from "lucide-react";

// const API_BASE = "https://diya-backenddiya-backend.onrender.com";

// interface RegistrationModalProps {
//   selectedBoxes: number[];
//   offerPack?: "HALF_YEAR" | "ANNUAL" | null;
//   onClose: () => void;
//   onSuccess: (orderId: string) => void;
// }

// type PackType = "NORMAL" | "HALF_YEAR" | "ANNUAL";

// /* ================= PACK CONFIG ================= */
// const PACK_CONFIG = {
//   NORMAL: {
//     label: "Regular Box",
//     soapsPerPack: 3,
//     pricePerPack: 1, // testing
//   },
//   HALF_YEAR: {
//     label: "Half-Yearly Pack",
//     soapsPerPack: 6,
//     pricePerPack: 900,
//   },
//   ANNUAL: {
//     label: "Annual Pack",
//     soapsPerPack: 12,
//     pricePerPack: 1188,
//   },
// };

// export default function RegistrationModal({
//   selectedBoxes,
//   offerPack = null,
//   onClose,
//   onSuccess,
// }: RegistrationModalProps) {
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [orderId, setOrderId] = useState("");
//   const [packType, setPackType] = useState<PackType>("NORMAL");

//   /* ================= PACK TYPE ================= */
//   useEffect(() => {
//     if (offerPack === "HALF_YEAR") setPackType("HALF_YEAR");
//     else if (offerPack === "ANNUAL") setPackType("ANNUAL");
//     else setPackType("NORMAL");
//   }, [offerPack]);

//   const pack = PACK_CONFIG[packType];

//   const totalBoxes = selectedBoxes.length;
//   const totalSoaps = totalBoxes * pack.soapsPerPack;
//   const totalPrice = totalBoxes * pack.pricePerPack;

//   /* ================= FORM DATA ================= */
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     mobile: "",
//     houseNo: "",
//     street: "",
//     city: "",
//     pincode: "",
//   });

//   /* ================= LOAD RAZORPAY ================= */
//   useEffect(() => {
//     if ((window as any).Razorpay) return;
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     document.body.appendChild(script);
//   }, []);

//   /* ================= SUBMIT ================= */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const newOrderId = "DSP" + Date.now().toString().slice(-8);
//       setOrderId(newOrderId);
//       onSuccess(newOrderId);
//       await startPayment(newOrderId);
//     } catch {
//       setErrorMsg("Something went wrong");
//       setLoading(false);
//     }
//   };

//   /* ================= PAYMENT ================= */
//   const startPayment = async (newOrderId: string) => {
//     try {
//       const res = await fetch(`${API_BASE}/create-order`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           boxes: selectedBoxes,
//           packType,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Order failed");

//       const rzp = new (window as any).Razorpay({
//         key: "rzp_live_SEoqwulgqrAXys",
//         amount: data.amount,
//         currency: "INR",
//         order_id: data.id,
//         name: "Diya Soaps",
//         description: "Lucky Draw Booking",
//         prefill: {
//           name: formData.fullName,
//           email: formData.email,
//           contact: formData.mobile,
//         },
//         theme: { color: "#d97706" },
//         handler: async (response: any) => {
//           const verify = await fetch(`${API_BASE}/verify-payment`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//               boxes: selectedBoxes,
//               packType,
//               ...formData,
//               orderId: newOrderId,
//             }),
//           });

//           if (!verify.ok) {
//             setErrorMsg("Payment verification failed");
//             setLoading(false);
//             return;
//           }

//           setPaymentSuccess(true);
//           setLoading(false);
//           setTimeout(onClose, 4000);
//         },
//       });

//       rzp.open();
//     } catch (err: any) {
//       setErrorMsg(err.message || "Payment failed");
//       setLoading(false);
//     }
//   };

//   /* ================= SUCCESS ================= */
//   if (paymentSuccess) {
//     return (
//       <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
//         <div className="bg-white max-w-md w-full p-6 rounded-2xl text-center">
//           <CheckCircle size={64} className="mx-auto text-green-500 mb-3" />
//           <h2 className="text-xl font-bold">Booking Successful</h2>
//           <p className="mt-2">Order ID: <b>{orderId}</b></p>
//           <p>{pack.label}</p>
//           <p>Total Boxes: {totalBoxes}</p>
//           <p>Total Soaps: {totalSoaps}</p>
//           <p className="font-bold text-green-600">₹{totalPrice}</p>
//         </div>
//       </div>
//     );
//   }

//   /* ================= FORM ================= */
//   return (
//     <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-3">
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto relative">

//         {/* CLOSE BUTTON */}
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-500 hover:text-black"
//         >
//           <X />
//         </button>

//         {/* SELECTED DETAILS */}
//         <div className="p-4 border-b bg-amber-50 text-sm">
//           <h3 className="font-bold text-lg mb-2">Selected Details</h3>

//           <p><b>Package:</b> {pack.label}</p>
//           <p><b>No. of Boxes:</b> {totalBoxes}</p>
//           <p><b>Selected Box Numbers:</b></p>

//           <div className="flex flex-wrap gap-2 mt-1">
//             {selectedBoxes.map((box) => (
//               <span
//                 key={box}
//                 className="px-2 py-1 bg-yellow-200 rounded text-xs font-bold"
//               >
//                 {String(box).padStart(3, "0")}
//               </span>
//             ))}
//           </div>

//           <p className="mt-2"><b>Total Soaps:</b> {totalSoaps}</p>
//           <p className="font-bold text-green-700">Amount: ₹{totalPrice}</p>
//         </div>

//         {/* FORM */}
//         <form onSubmit={handleSubmit} className="p-4 space-y-3">
//           {Object.keys(formData).map((field) => (
//             <input
//               key={field}
//               placeholder={field}
//               className="border p-2 w-full rounded"
//               onChange={(e) =>
//                 setFormData({ ...formData, [field]: e.target.value })
//               }
//             />
//           ))}

//           {errorMsg && (
//             <p className="text-red-600 text-sm text-center">{errorMsg}</p>
//           )}

//           <button
//             disabled={loading}
//             className="bg-amber-600 text-white py-2 w-full rounded-xl font-bold"
//           >
//             {loading ? (
//               <Loader2 className="animate-spin mx-auto" />
//             ) : (
//               "Register & Pay"
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { CheckCircle, Loader2, X, ArrowLeft } from "lucide-react";

const API_BASE = "https://diya-backenddiya-backend.onrender.com";

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
    pricePerPack: 600,
  },
  HALF_YEAR: {
    label: "Half-Yearly Pack",
    soapsPerPack: 6,
    pricePerPack: 900,
  },
  ANNUAL: {
    label: "Annual Pack",
    soapsPerPack: 12,
    pricePerPack: 1188,
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
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
        headers: { "Content-Type": "application/json" },
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
          <p className="font-bold text-green-600">₹{totalPrice}</p>
        </div>
      </div>
    );
  }

  /* ================= FORM ================= */
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto relative">

        {/* ⬅️ BACK BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-[100] bg-white p-1 rounded-full shadow text-black"
        >
          <ArrowLeft size={20} />
        </button>

        {/* ❌ CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-[100] bg-white p-1 rounded-full shadow text-black"
        >
          <X size={20} />
        </button>

        {/* SELECTED DETAILS */}
        <div className="p-4 pt-12 border-b bg-amber-50 text-sm">
          <h3 className="font-bold text-lg mb-2">Selected Details</h3>

          <p><b>Package:</b> {pack.label}</p>
          <p><b>No. of Boxes:</b> {totalBoxes}</p>

          <p className="mt-1 font-semibold">Selected Box Numbers:</p>
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
          <p className="font-bold text-green-700">Amount: ₹{totalPrice}</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {Object.keys(formData).map((field) => (
            <input
              key={field}
              placeholder={field}
              className="border p-2 w-full rounded"
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              required
            />
          ))}

          {errorMsg && (
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
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