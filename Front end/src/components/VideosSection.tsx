import {
  Play,
  Pause,
  Image as ImageIcon,
  Video,
  X,
  Maximize2,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

import modelWithBox from "../assets/model-with-box.jpg";
import soapInHand from "../assets/soap-hand.png";
import promoVideo from "../assets/promo.mp4";

export default function VideosSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [modalImage, setModalImage] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const images = [modelWithBox, soapInHand];

  // ESC key close support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalImage(null);
        setVideoModal(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Play / pause
  const toggleVideo = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <section
      id="videos"
      className="relative overflow-hidden scroll-mt-24 py-16 sm:py-24
      bg-gradient-to-br from-[#fff7ef] via-[#ffe9d9] to-[#fffaf5]"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-[#8b4513] font-semibold text-sm border">
            <Video size={16} />
            Videos & Photos
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-[#7a2e12]">
            See Diya Soap in Action
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* VIDEO CARD */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

            <div className="p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-2 font-extrabold text-[#7a2e12]">
                <Video size={18} />
                Product Video
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100">
                HD
              </span>
            </div>

            <div className="p-5">
              <div className="relative rounded-2xl overflow-hidden bg-black">

                {/* ✅ FIXED poster cropping */}
                <video
                  ref={videoRef}
                  muted
                  loop
                  playsInline
                  poster={modelWithBox}
                  className="w-full aspect-video object-contain bg-black"
                >
                  <source src={promoVideo} type="video/mp4" />
                </video>

                {/* Play button */}
                <button
                  onClick={toggleVideo}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-black/60 text-white p-5 rounded-full hover:scale-110 transition">
                    {isPlaying ? <Pause size={30} /> : <Play size={30} />}
                  </div>
                </button>

                {/* Fullscreen */}
                <button
                  onClick={() => setVideoModal(true)}
                  className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow"
                >
                  <Maximize2 size={18} />
                </button>

              </div>
            </div>
          </div>

          {/* IMAGE CARD */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

            <div className="p-5 border-b flex items-center gap-2 font-extrabold text-[#7a2e12]">
              <ImageIcon size={18} />
              Product Photos
            </div>

            <div className="p-5 grid grid-cols-2 gap-4">

              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setModalImage(img)}
                  className="cursor-pointer rounded-2xl overflow-hidden aspect-square"
                >
                  <img
                    src={img}
                    alt={`Product ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition"
                  />
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>

      {/* IMAGE MODAL */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            className="max-w-[92%] max-h-[92%] rounded-xl"
          />

          {/* BIG CLOSE BUTTON */}
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-6 right-6 bg-white text-black p-3 rounded-full shadow-xl"
          >
            <X size={28} />
          </button>
        </div>
      )}

      {/* VIDEO FULLSCREEN MODAL */}
      {videoModal && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">

          <video
            src={promoVideo}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />

          {/* ✅ BIG BACK BUTTON */}
          <button
            onClick={() => setVideoModal(false)}
            className="absolute top-6 right-6 bg-white text-black p-3 rounded-full shadow-xl"
          >
            <X size={32} />
          </button>

        </div>
      )}
    </section>
  );
}
