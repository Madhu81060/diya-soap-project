// import {
//   Play,
//   Pause,
//   Image as ImageIcon,
//   Video,
//   X,
//   Maximize2,
// } from "lucide-react";
// import { useRef, useState, useEffect } from "react";

// import modelWithBox from "../assets/model-with-box.jpg";
// import soapInHand from "../assets/soap-hand.png";
// import promoVideo from "../assets/promo.mp4";

// export default function VideosSection() {
//   const videoRef = useRef<HTMLVideoElement>(null);

//   const [modalImage, setModalImage] = useState<string | null>(null);
//   const [videoModal, setVideoModal] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const images = [modelWithBox, soapInHand];

//   /* ---------------- ESC KEY SUPPORT ---------------- */
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         setModalImage(null);
//         setVideoModal(false);
//       }
//     };

//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, []);

//   /* ---------------- LOCK BODY SCROLL WHEN MODAL OPEN ---------------- */
//   useEffect(() => {
//     if (modalImage || videoModal) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "auto";
//     }
//   }, [modalImage, videoModal]);

//   /* ---------------- SYNC VIDEO PLAY STATE ---------------- */
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const onPlay = () => setIsPlaying(true);
//     const onPause = () => setIsPlaying(false);

//     video.addEventListener("play", onPlay);
//     video.addEventListener("pause", onPause);

//     return () => {
//       video.removeEventListener("play", onPlay);
//       video.removeEventListener("pause", onPause);
//     };
//   }, []);

//   /* ---------------- PLAY / PAUSE ---------------- */
//   const toggleVideo = () => {
//     if (!videoRef.current) return;

//     if (videoRef.current.paused) {
//       videoRef.current.play().catch(() => {});
//     } else {
//       videoRef.current.pause();
//     }
//   };

//   return (
//     <section
//       id="videos"
//       className="relative overflow-hidden scroll-mt-24 py-16 sm:py-24
//       bg-gradient-to-br from-[#fff7ef] via-[#ffe9d9] to-[#fffaf5]"
//     >
//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

//         {/* ---------------- HEADING ---------------- */}
//         <div className="text-center mb-12">
//           <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-[#8b4513] font-semibold text-sm border">
//             <Video size={16} />
//             Videos & Photos
//           </span>

//           <h2 className="mt-4 text-3xl font-extrabold text-[#7a2e12]">
//             See Diya Soap in Action
//           </h2>
//         </div>

//         {/* ---------------- GRID ---------------- */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

//           {/* ================= VIDEO CARD ================= */}
//           <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

//             <div className="p-5 border-b flex justify-between items-center">
//               <div className="flex items-center gap-2 font-extrabold text-[#7a2e12]">
//                 <Video size={18} />
//                 Product Video
//               </div>

//               <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100">
//                 HD
//               </span>
//             </div>

//             <div className="p-5">
//               <div className="relative rounded-2xl overflow-hidden bg-black">

//                 <video
//                   ref={videoRef}
//                   muted
//                   loop
//                   playsInline
//                   poster={modelWithBox}
//                   className="w-full aspect-video object-contain bg-black"
//                 >
//                   <source src={promoVideo} type="video/mp4" />
//                 </video>

//                 {/* PLAY BUTTON */}
//                 <button
//                   onClick={toggleVideo}
//                   className="absolute inset-0 flex items-center justify-center"
//                 >
//                   <div className="bg-black/60 text-white p-5 rounded-full hover:scale-110 transition">
//                     {isPlaying ? <Pause size={30} /> : <Play size={30} />}
//                   </div>
//                 </button>

//                 {/* FULLSCREEN */}
//                 <button
//                   onClick={() => setVideoModal(true)}
//                   className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow"
//                 >
//                   <Maximize2 size={18} />
//                 </button>

//               </div>
//             </div>
//           </div>

//           {/* ================= IMAGE CARD ================= */}
//           <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

//             <div className="p-5 border-b flex items-center gap-2 font-extrabold text-[#7a2e12]">
//               <ImageIcon size={18} />
//               Product Photos
//             </div>

//             <div className="p-5 grid grid-cols-2 gap-4">

//               {images.map((img, i) => (
//                 <div
//                   key={i}
//                   onClick={() => setModalImage(img)}
//                   className="cursor-pointer rounded-2xl overflow-hidden aspect-square"
//                 >
//                   <img
//                     src={img}
//                     alt={`Product ${i + 1}`}
//                     className="w-full h-full object-cover hover:scale-110 transition"
//                   />
//                 </div>
//               ))}

//             </div>
//           </div>

//         </div>
//       </div>

//       {/* ================= IMAGE MODAL ================= */}
//       {modalImage && (
//         <div
//           className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
//           onClick={() => setModalImage(null)}
//         >
//           <img
//             src={modalImage}
//             alt="Preview"
//             onClick={(e) => e.stopPropagation()}
//             className="max-w-[92%] max-h-[92%] rounded-xl"
//           />

//           <button
//             onClick={() => setModalImage(null)}
//             className="absolute top-6 right-6 bg-white text-black p-3 rounded-full shadow-xl"
//           >
//             <X size={28} />
//           </button>
//         </div>
//       )}

//       {/* ================= VIDEO MODAL ================= */}
//       {videoModal && (
//         <div
//           className="fixed inset-0 bg-black z-50 flex items-center justify-center"
//           onClick={() => setVideoModal(false)}
//         >

//           <video
//             src={promoVideo}
//             controls
//             autoPlay
//             onClick={(e) => e.stopPropagation()}
//             className="w-full h-full object-contain"
//           />

//           <button
//             onClick={() => setVideoModal(false)}
//             className="absolute top-6 right-6 bg-white text-black p-3 rounded-full shadow-xl"
//           >
//             <X size={32} />
//           </button>

//         </div>
//       )}
//     </section>
//   );
// }
import {
  Play,
  Pause,
  Image as ImageIcon,
  Video,
  X,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import modelWithBox from "../assets/model-with-box.jpg";
import soapInHand from "../assets/soap-hand.png";
import promoVideo from "../assets/promo.mp4";

export default function VideosSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inlineVideoRef = useRef<HTMLVideoElement>(null);

  const [modalImage, setModalImage] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);

  const images = [
    { src: modelWithBox, label: "Unboxing Experience" },
    { src: soapInHand,   label: "Natural Texture"     },
  ];

  /* ── ESC key ── */
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

  /* ── Body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = modalImage || videoModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalImage, videoModal]);

  /* ── Sync play state ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime  = () => setProgress((video.currentTime / (video.duration || 1)) * 100);
    video.addEventListener("play",  onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    return () => {
      video.removeEventListener("play",  onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const toggleVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play().catch(() => {}) : v.pause();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const seekVideo = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  return (
    <section
      id="videos"
      style={{
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "96px 0 80px",
        background: "#fffbeb",
      }}
    >
      {/* ── AMBIENT BACKGROUND ── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, #fffbeb 0%, #fef3c7 50%, #fefce8 100%)",
        }} />
        <div style={{
          position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 900, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(251,191,36,0.13) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: -100, right: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,119,6,0.09) 0%, transparent 65%)",
          filter: "blur(20px)",
        }} />
        {/* Dot grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
          <defs>
            <pattern id="vids-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#92400e" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vids-dots)" />
        </svg>
        {/* Diagonal accent line */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} preserveAspectRatio="none">
          <line x1="0" y1="100%" x2="100%" y2="0" stroke="#b45309" strokeWidth="1.5" />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>

        {/* ── SECTION HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: 60 }}
        >
          {/* Eyebrow pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(217,119,6,0.25)",
            borderRadius: 99, padding: "8px 20px",
            marginBottom: 20,
            boxShadow: "0 4px 16px rgba(217,119,6,0.1)",
          }}>
            <Video size={14} color="#b45309" strokeWidth={2.5} />
            <span style={{ fontSize: 11.5, fontWeight: 900, color: "#78350f", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Gallery & Videos
            </span>
          </div>

          <h2 style={{
            margin: "0 0 14px",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: "#1a0800",
          }}>
            See Diya Soap{" "}
            <span style={{
              background: "linear-gradient(125deg, #d97706 20%, #92400e 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              in Action
            </span>
          </h2>

          <p style={{
            margin: 0, maxWidth: 480,
            marginLeft: "auto", marginRight: "auto",
            fontSize: 15, color: "#92400e",
            fontWeight: 600, lineHeight: 1.7,
            opacity: 0.8,
          }}>
            Watch how our premium Red Sandal soap is made &amp; used — pure Ayurvedic goodness.
          </p>
        </motion.div>

        {/* ── MAIN GRID ── */}
        <div
          className="vids-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: 28,
            alignItems: "start",
          }}
        >

          {/* ════════════════════════════
              VIDEO CARD
          ════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(16px)",
              border: "1.5px solid rgba(217,119,6,0.2)",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(120,53,15,0.1), 0 2px 8px rgba(120,53,15,0.06)",
            }}
          >
            {/* Card header */}
            <div style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(217,119,6,0.12)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(90deg, rgba(255,251,235,0.8), rgba(254,243,199,0.4))",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "linear-gradient(135deg, #d97706, #92400e)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(146,64,14,0.3)",
                }}>
                  <Video size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#1a0800" }}>Product Video</p>
                  <p style={{ margin: 0, fontSize: 10.5, color: "#a16207", fontWeight: 600 }}>Official Promo</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{
                  background: "linear-gradient(135deg, #d97706, #b45309)",
                  color: "#fff", fontSize: 9.5, fontWeight: 900,
                  letterSpacing: "0.08em",
                  padding: "4px 10px", borderRadius: 99,
                }}>HD</span>
                <span style={{
                  background: "#fef9c3", border: "1px solid #fde68a",
                  color: "#78350f", fontSize: 9.5, fontWeight: 900,
                  letterSpacing: "0.06em",
                  padding: "4px 10px", borderRadius: 99,
                }}>Diya Natural</span>
              </div>
            </div>

            {/* Video player */}
            <div style={{ padding: "18px 18px 0" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#0f0400",
                  cursor: "pointer",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
                }}
                onClick={toggleVideo}
              >
                <video
                  ref={videoRef}
                  muted={isMuted}
                  loop
                  playsInline
                  poster={modelWithBox}
                  style={{ width: "100%", aspectRatio: "16/9", objectFit: "contain", display: "block", background: "#0f0400" }}
                >
                  <source src={promoVideo} type="video/mp4" />
                </video>

                {/* Dark gradient overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: isPlaying
                    ? "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 100%)",
                  pointerEvents: "none",
                  transition: "background 0.4s",
                }} />

                {/* Centre play button */}
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <div style={{
                        width: 72, height: 72, borderRadius: "50%",
                        background: "linear-gradient(135deg, #d97706, #92400e)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 0 12px rgba(217,119,6,0.2), 0 12px 40px rgba(146,64,14,0.5)",
                      }}>
                        <Play size={28} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Controls bar */}
                <div
                  style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "10px 14px 12px",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Play/Pause */}
                  <button
                    onClick={toggleVideo}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    {isPlaying ? <Pause size={15} /> : <Play size={15} fill="#fff" />}
                  </button>

                  {/* Progress bar */}
                  <div
                    onClick={seekVideo}
                    style={{
                      flex: 1, height: 4, background: "rgba(255,255,255,0.25)",
                      borderRadius: 99, cursor: "pointer", overflow: "hidden",
                    }}
                  >
                    <div style={{
                      height: "100%", width: `${progress}%`,
                      background: "linear-gradient(90deg, #fbbf24, #d97706)",
                      borderRadius: 99, transition: "width 0.1s linear",
                    }} />
                  </div>

                  {/* Mute */}
                  <button
                    onClick={toggleMute}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={() => setVideoModal(true)}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Video footer note */}
            <div style={{ padding: "14px 20px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#16a34a",
                boxShadow: "0 0 0 3px rgba(22,163,74,0.2)",
                animation: "pulse-g 2s ease-in-out infinite",
                flexShrink: 0,
              }} />
              <p style={{ margin: 0, fontSize: 12, color: "#78350f", fontWeight: 700 }}>
                Official Diya Natural Products Promo · Ayurvedic Red Sandal Formula
              </p>
            </div>
          </motion.div>

          {/* ════════════════════════════
              PHOTOS CARD
          ════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(16px)",
              border: "1.5px solid rgba(217,119,6,0.2)",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(120,53,15,0.1), 0 2px 8px rgba(120,53,15,0.06)",
            }}
          >
            {/* Card header */}
            <div style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(217,119,6,0.12)",
              display: "flex", alignItems: "center", gap: 10,
              background: "linear-gradient(90deg, rgba(255,251,235,0.8), rgba(254,243,199,0.4))",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg, #d97706, #92400e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(146,64,14,0.3)",
              }}>
                <ImageIcon size={16} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#1a0800" }}>Product Gallery</p>
                <p style={{ margin: 0, fontSize: 10.5, color: "#a16207", fontWeight: 600 }}>{images.length} Photos</p>
              </div>
            </div>

            {/* Photos grid */}
            <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  onMouseEnter={() => setHoveredImg(i)}
                  onMouseLeave={() => setHoveredImg(null)}
                  onClick={() => setModalImage(img.src)}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    borderRadius: 18,
                    overflow: "hidden",
                    aspectRatio: "1",
                    border: "1.5px solid rgba(217,119,6,0.18)",
                    boxShadow: hoveredImg === i
                      ? "0 16px 48px rgba(120,53,15,0.25)"
                      : "0 4px 16px rgba(120,53,15,0.1)",
                    transition: "box-shadow 0.3s",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.45s ease",
                      transform: hoveredImg === i ? "scale(1.08)" : "scale(1)",
                    }}
                  />

                  {/* Hover overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(67,20,7,0.7) 0%, transparent 55%)",
                    opacity: hoveredImg === i ? 1 : 0,
                    transition: "opacity 0.3s",
                    display: "flex", flexDirection: "column",
                    justifyContent: "flex-end", padding: "14px 12px",
                  }}>
                    <p style={{ margin: 0, fontSize: 11.5, fontWeight: 900, color: "#fff", letterSpacing: "0.02em" }}>
                      {img.label}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                      Tap to enlarge
                    </p>
                  </div>

                  {/* Corner expand icon */}
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    width: 30, height: 30, borderRadius: 8,
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(6px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: hoveredImg === i ? 1 : 0,
                    transform: hoveredImg === i ? "scale(1)" : "scale(0.7)",
                    transition: "opacity 0.25s, transform 0.25s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}>
                    <Maximize2 size={14} color="#78350f" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Gallery footer */}
            <div style={{
              margin: "0 18px 18px",
              padding: "14px 18px",
              borderRadius: 16,
              background: "linear-gradient(130deg, rgba(254,243,199,0.7), rgba(255,251,235,0.5))",
              border: "1px solid rgba(217,119,6,0.15)",
            }}>
              <p style={{ margin: 0, fontSize: 12, color: "#78350f", fontWeight: 700, lineHeight: 1.6 }}>
                🌿 <strong>100% Natural</strong> · Handcrafted Ayurvedic Red Sandal Soap · No Chemicals
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════
          IMAGE MODAL
      ════════════════════════════ */}
      <AnimatePresence>
        {modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModalImage(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(10,4,0,0.93)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(12px)",
            }}
          >
            <motion.img
              src={modalImage}
              alt="Preview"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "88%", maxHeight: "88vh",
                borderRadius: 20,
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,191,36,0.15)",
                objectFit: "contain",
              }}
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={() => setModalImage(null)}
              style={{
                position: "absolute", top: 24, right: 24,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%",
                width: 48, height: 48,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <X size={22} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════
          VIDEO MODAL
      ════════════════════════════ */}
      <AnimatePresence>
        {videoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setVideoModal(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "#000",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <motion.video
              src={promoVideo}
              ref={inlineVideoRef}
              controls
              autoPlay
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVideoModal(false)}
              style={{
                position: "absolute", top: 24, right: 24,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%",
                width: 52, height: 52,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              <X size={24} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse-g {
          0%, 100% { box-shadow: 0 0 0 3px rgba(22,163,74,0.25); }
          50%       { box-shadow: 0 0 0 5px rgba(22,163,74,0.12); }
        }
        @media (max-width: 860px) {
          .vids-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}