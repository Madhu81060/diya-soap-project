
import { PhoneCall, MessageCircle } from "lucide-react";

type Props = {
  phoneNumber: string;
  whatsappNumber: string;
  onJoin: () => void;
};

export default function FloatingActions({
  phoneNumber,
  whatsappNumber,
  onJoin,
}: Props) {
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi Diya Soap, I want to book my box. Please help."
  )}`;

  return (
    <>
      {/* ✅ WhatsApp Floating Button (Mobile Only) */}
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="
          md:hidden
          fixed bottom-[90px] right-4
          z-50
          inline-flex items-center gap-2
          rounded-full
          bg-green-600 text-white
          px-4 py-3
          shadow-xl
          hover:bg-green-700
          active:scale-95
          transition
        "
        title="Chat on WhatsApp"
      >
        <MessageCircle size={20} />
        <span className="font-bold text-sm">WhatsApp</span>
      </a>

      {/* ✅ Mobile Sticky Bottom Bar */}
      <div
        className="
          md:hidden
          fixed bottom-0 left-0 right-0
          z-40
          bg-white/95 backdrop-blur
          border-t border-black/10
          shadow-lg
        "
      >
        <div className="max-w-7xl mx-auto px-3 py-2 grid grid-cols-3 gap-2">

          {/* Call */}
          <a
            href={`tel:${phoneNumber}`}
            className="
              flex items-center justify-center gap-1
              rounded-xl
              bg-white
              border border-amber-200
              text-amber-800
              py-3
              font-bold text-sm
              active:scale-95
              transition
            "
          >
            <PhoneCall size={18} />
            Call
          </a>

          {/* WhatsApp */}
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="
              flex items-center justify-center gap-1
              rounded-xl
              bg-green-600 text-white
              py-3
              font-bold text-sm
              active:scale-95
              transition
            "
          >
            <MessageCircle size={18} />
            Chat
          </a>

          {/* Join */}
          <button
            onClick={onJoin}
            className="
              flex items-center justify-center
              rounded-xl
              bg-gradient-to-r from-amber-600 to-orange-600
              text-white
              py-3
              font-extrabold text-sm
              active:scale-95
              transition
            "
          >
            Join
          </button>
        </div>
      </div>

      {/* ✅ Spacer to prevent content hiding */}
      <div className="md:hidden h-20" />
    </>
  );
}

