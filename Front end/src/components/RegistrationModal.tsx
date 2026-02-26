// import { useState, useEffect, useMemo } from "react";
// import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";

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
//     boxesPerPack: 1,
//     soapsPerPack: 3,
//     pricePerPack: 600,
//   },
//   HALF_YEAR: {
//     label: "Half-Yearly Pack",
//     boxesPerPack: 1,
//     soapsPerPack: 6,
//     pricePerPack: 900,
//   },
//   ANNUAL: {
//     label: "Annual Pack",
//     boxesPerPack: 1,        // ✅ FIXED (1 box = 12 soaps)
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

//   /* ================= DERIVED VALUES ================= */
//   const pack = PACK_CONFIG[packType];

//   const noOfPacks = useMemo(() => {
//     if (!selectedBoxes.length) return 0;
//     return selectedBoxes.length / pack.boxesPerPack;
//   }, [selectedBoxes, pack.boxesPerPack]);

//   const totalSoaps = noOfPacks * pack.soapsPerPack;
//   const totalPrice = noOfPacks * pack.pricePerPack;

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

//   /* ================= LOCK SCROLL ================= */
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, []);

//   /* ================= LOAD RAZORPAY ================= */
//   useEffect(() => {
//     if ((window as any).Razorpay) return;
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     document.body.appendChild(script);
//   }, []);

//   /* ================= VALIDATION ================= */
//   const validateForm = () => {
//     if (!selectedBoxes.length) {
//       setErrorMsg("No boxes selected");
//       return false;
//     }

//     if (selectedBoxes.length % pack.boxesPerPack !== 0) {
//       setErrorMsg(
//         `${pack.label} requires ${pack.boxesPerPack} box(es) per pack`
//       );
//       return false;
//     }

//     if (!/^[0-9]{10}$/.test(formData.mobile)) {
//       setErrorMsg("Invalid mobile number");
//       return false;
//     }

//     for (const key in formData) {
//       if (!(formData as any)[key].trim()) {
//         setErrorMsg("Please fill all fields");
//         return false;
//       }
//     }

//     return true;
//   };

//   /* ================= SUBMIT ================= */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorMsg("");
//     if (!validateForm()) return;

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
//           setTimeout(onClose, 5000);
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
//         <div className="bg-white max-w-lg w-full mx-4 p-8 rounded-2xl text-center">
//           <CheckCircle size={70} className="mx-auto text-green-500 mb-3" />
//           <h2 className="text-2xl font-bold">Booking Successful</h2>
//           <p><b>Order ID:</b> {orderId}</p>
//           <p><b>Package:</b> {pack.label}</p>
//           <p><b>No. of Packs:</b> {noOfPacks}</p>
//           <p><b>Total Boxes:</b> {selectedBoxes.length}</p>
//           <p><b>Total Soaps:</b> {totalSoaps}</p>
//           <p className="font-bold text-green-600">₹{totalPrice}</p>
//         </div>
//       </div>
//     );
//   }

//   /* ================= FORM ================= */
//   return (
//     <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
//       <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">

//         <div className="flex items-center gap-3 mb-4">
//           <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
//             <ArrowLeft />
//           </button>
//           <h3 className="text-lg font-bold">Registration</h3>
//         </div>

//         <div className="p-3 rounded bg-yellow-100 border text-sm font-semibold mb-2">
//           {pack.label} | Packs: {noOfPacks} | Boxes: {selectedBoxes.length}
//         </div>

//         <div className="p-2 rounded bg-blue-100 text-blue-800 text-sm font-bold mb-4">
//           Total Soaps: {totalSoaps} | Amount: ₹{totalPrice}
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-3">
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
//             <p className="text-red-600 text-sm font-semibold text-center">
//               {errorMsg}
//             </p>
//           )}

//           <button
//             disabled={loading}
//             className="bg-amber-600 text-white py-2 w-full rounded-xl font-bold flex justify-center"
//           >
//             {loading ? <Loader2 className="animate-spin" /> : "Register & Pay"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useMemo } from "react";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";

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
    boxesPerPack: 1,
    soapsPerPack: 3,
    pricePerPack: 1, // ✅ testing
  },
  HALF_YEAR: {
    label: "Half-Yearly Pack",
    boxesPerPack: 1,
    soapsPerPack: 6,
    pricePerPack: 900,
  },
  ANNUAL: {
    label: "Annual Pack",
    boxesPerPack: 1,
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

  /* ================= DERIVED VALUES ================= */
  const pack = PACK_CONFIG[packType];

  const noOfPacks = useMemo(() => {
    if (!selectedBoxes.length) return 0;
    return selectedBoxes.length / pack.boxesPerPack;
  }, [selectedBoxes, pack.boxesPerPack]);

  const totalSoaps = noOfPacks * pack.soapsPerPack;
  const totalPrice = noOfPacks * pack.pricePerPack;

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
          console.log("RAZORPAY RESPONSE:", response); // ✅ DEBUG

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
            const err = await verify.json();
            console.error("VERIFY FAILED:", err); // ✅ DEBUG
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
          <p><b>Package:</b> {pack.label}</p>
          <p><b>Total Boxes:</b> {selectedBoxes.length}</p>
          <p><b>Total Soaps:</b> {totalSoaps}</p>
          <p className="font-bold text-green-600">₹{totalPrice}</p>
        </div>
      </div>
    );
  }

  /* ================= FORM ================= */
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-6">
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
            className="bg-amber-600 text-white py-2 w-full rounded-xl font-bold"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Register & Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}