// // GridSection.tsx — Clean grid with clear selection UX
// import LiveSeatCounter from "./LiveSeatCounter";
// import CountdownTimer from "./CountdownTimer";
// import { useEffect, useState, useCallback } from "react";
// import { supabase, type GridBox } from "../lib/supabase";
// import { Loader2, Sparkles } from "lucide-react";

// interface GridSectionProps {
//   onBoxesSelected: (boxes: number[]) => void;
//   instruction?: string;
//   maxSelectable?: number;
// }

// const PAGE_SIZE       = 125;
// const PHASE_ONE_LIMIT = 250;

// type BoxStatus = "available" | "reserved" | "booked" | "payment_failed";

// export default function GridSection({ onBoxesSelected, instruction, maxSelectable }: GridSectionProps) {
//   const [boxes, setBoxes]             = useState<GridBox[]>([]);
//   const [loading, setLoading]         = useState(true);
//   const [errorMsg, setErrorMsg]       = useState("");
//   const [page, setPage]               = useState(1);
//   const [selected, setSelected]       = useState<number[]>([]);
//   const [submitError, setSubmitError] = useState("");

//   const fetchBoxes = useCallback(async () => {
//     try {
//       const { data, error } = await supabase
//         .from("grid_boxes").select("*")
//         .lte("box_number", PHASE_ONE_LIMIT)
//         .order("box_number", { ascending: true });
//       if (error) throw error;
//       setBoxes((data ?? []) as GridBox[]);
//       setErrorMsg("");
//     } catch (err) {
//       console.error(err);
//       setErrorMsg("Failed to load grid. Please refresh.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchBoxes(); }, [fetchBoxes]);
//   useEffect(() => {
//     const onFocus = () => fetchBoxes();
//     window.addEventListener("focus", onFocus);
//     return () => window.removeEventListener("focus", onFocus);
//   }, [fetchBoxes]);

//   useEffect(() => {
//     setSelected([]); setSubmitError(""); setPage(1);
//   }, [maxSelectable]);

//   useEffect(() => {
//     const channel = supabase
//       .channel("grid-live")
//       .on("postgres_changes", { event: "*", schema: "public", table: "grid_boxes" }, (payload: any) => {
//         if (!payload?.new) return;
//         const updated = payload.new as GridBox;
//         if (updated.box_number > PHASE_ONE_LIMIT) return;
//         setBoxes(prev => prev.map(b => b.box_number === updated.box_number ? updated : b));
//         if (updated.status !== "available") {
//           setSelected(prev => prev.filter(b => b !== updated.box_number));
//         }
//         if (updated.status === "payment_failed" || updated.status === "reserved") {
//           setTimeout(() => {
//             setBoxes(prev => prev.map(b =>
//               b.box_number === updated.box_number && b.status === updated.status
//                 ? { ...b, status: "available" as BoxStatus } : b
//             ));
//           }, 5 * 60 * 1000);
//         }
//       })
//       .subscribe();
//     return () => { supabase.removeChannel(channel); };
//   }, []);

//   const totalPages = Math.max(1, Math.ceil(boxes.length / PAGE_SIZE));
//   const pageData   = boxes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const handleBoxClick = (boxNumber: number) => {
//     const box = boxes.find(b => b.box_number === boxNumber);
//     if (!box || box.status !== "available") return;
//     setSelected(prev => {
//       if (prev.includes(boxNumber)) return prev.filter(n => n !== boxNumber);
//       if (maxSelectable && prev.length >= maxSelectable) return prev;
//       return [...prev, boxNumber];
//     });
//     setSubmitError("");
//   };

//   const handleProceed = () => {
//     if (selected.length === 0) { setSubmitError("Please select at least one box"); return; }
//     if (maxSelectable && selected.length !== maxSelectable) {
//       setSubmitError(`Please select exactly ${maxSelectable} box${maxSelectable > 1 ? "es" : ""}`);
//       return;
//     }
//     setSubmitError("");
//     onBoxesSelected(selected);
//   };

//   const getBoxStyle = (box: GridBox): React.CSSProperties => {
//     const isSelected = selected.includes(box.box_number);
//     const status = box.status as BoxStatus;
//     if (isSelected) return {
//       background: "linear-gradient(135deg, #f59e0b, #d97706)",
//       border: "2.5px solid #b45309", color: "#fff",
//       transform: "scale(1.07)", boxShadow: "0 4px 16px rgba(217,119,6,0.45)",
//       cursor: "pointer", fontWeight: 900,
//     };
//     switch (status) {
//       case "available":    return { background: "#fef9c3", border: "1.5px solid #fbbf24", color: "#78350f", cursor: "pointer", fontWeight: 700 };
//       case "booked":       return { background: "linear-gradient(135deg, #dc2626, #b91c1c)", border: "1.5px solid #991b1b", color: "#fff", cursor: "not-allowed", fontWeight: 800, opacity: 0.92 };
//       case "payment_failed": return { background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "2px solid #b91c1c", color: "#fff", cursor: "not-allowed", fontWeight: 800, animation: "pulse-red 1.5s ease-in-out 3" };
//       case "reserved":     return { background: "#fed7aa", border: "1.5px solid #fb923c", color: "#9a3412", cursor: "not-allowed", fontWeight: 700, opacity: 0.75 };
//       default:             return { background: "#fef9c3", border: "1px solid #fde68a", color: "#d97706", cursor: "default" };
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "linear-gradient(160deg, #fffbeb 0%, #fef9c3 50%, #fefce8 100%)", minHeight: "60vh", padding: "64px 20px" }}>
//         <Loader2 style={{ animation: "spin 1s linear infinite", color: "#f59e0b" }} size={44} />
//         <p style={{ color: "#d97706", fontWeight: 600, fontSize: 14, letterSpacing: "0.05em", fontFamily: "'Nunito', sans-serif" }}>Loading boxes…</p>
//       </div>
//     );
//   }

//   if (errorMsg) {
//     return <div style={{ textAlign: "center", padding: "48px 20px", color: "#dc2626", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>{errorMsg}</div>;
//   }

//   const isComplete    = maxSelectable ? selected.length === maxSelectable : selected.length > 0;
//   const bookedCount   = boxes.filter(b => b.status === "booked").length;
//   const availCount    = boxes.filter(b => b.status === "available").length;
//   const reservedCount = boxes.filter(b => b.status === "reserved").length;
//   const remaining     = maxSelectable ? maxSelectable - selected.length : 0;

//   return (
//     <>
//       <style>{`
//         @keyframes pulse-red { 0%,100%{opacity:1} 50%{opacity:0.6} }
//         @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
//         .grid-box:hover { filter: brightness(1.06); }
//       `}</style>

//       <section id="grid" style={{ background: "linear-gradient(160deg, #fffbeb 0%, #fef9c3 50%, #fefce8 100%)", fontFamily: "'Nunito', 'Segoe UI', sans-serif", paddingTop: 40, paddingBottom: 80 }}>
//         <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px" }}>

//           {/* Instruction banner */}
//           {instruction && (
//             <div style={{ background: "linear-gradient(90deg, #fef9c3, #fef3c7)", border: "1.5px solid #fbbf24", borderRadius: 16, padding: "13px 22px", textAlign: "center", fontWeight: 700, color: "#92400e", marginBottom: 20, fontSize: 14, boxShadow: "0 4px 16px rgba(251,191,36,0.15)" }}>
//               ✦ {instruction} ✦
//             </div>
//           )}

//           {/* Header card */}
//           <div style={{ background: "linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)", borderRadius: 24, padding: "28px 28px 24px", textAlign: "center", marginBottom: 24, boxShadow: "0 16px 48px rgba(217,119,6,0.35)", position: "relative", overflow: "hidden" }}>
//             <div style={{ position: "relative", zIndex: 1 }}>
//               <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 8 }}>
//                 <Sparkles color="#fff" size={20} />
//                 <h3 style={{ margin: 0, fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: 900, color: "#fff" }}>Select Your Lucky Box{maxSelectable && maxSelectable > 1 ? "es" : ""}</h3>
//                 <Sparkles color="#fff" size={20} />
//               </div>

//               {/* Selection progress pill */}
//               <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: isComplete ? "rgba(22,163,74,0.35)" : "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", border: isComplete ? "1px solid rgba(22,163,74,0.6)" : "1px solid rgba(255,255,255,0.3)", borderRadius: 99, padding: "8px 22px", transition: "all 0.3s" }}>
//                 <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
//                   {isComplete ? "✅ Done!" : "🎯"} {selected.length}{maxSelectable ? ` / ${maxSelectable}` : ""} selected
//                   {maxSelectable && !isComplete && remaining > 0 && (
//                     <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}> — pick {remaining} more</span>
//                   )}
//                 </span>
//               </div>

//               {selected.length > 0 && (
//                 <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8 }}>
//                   📦 {selected.map(b => String(b).padStart(3, "0")).join(", ")}
//                 </p>
//               )}

//               {/* Stats */}
//               <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
//                 {[
//                   { label: "Available", count: availCount },
//                   { label: "Booked",    count: bookedCount },
//                   { label: "Reserved",  count: reservedCount },
//                 ].map(s => (
//                   <div key={s.label} style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12, padding: "7px 18px", textAlign: "center" }}>
//                     <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff" }}>{s.count}</p>
//                     <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Live counter + countdown */}
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 20 }}>
//             <LiveSeatCounter />
//             <CountdownTimer />
//           </div>

//           {/* Legend */}
//           <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 }}>
//             {[
//               { bg: "#fef9c3",  border: "#fbbf24", label: "Available" },
//               { bg: "linear-gradient(135deg,#f59e0b,#d97706)", border: "#b45309", label: "Selected" },
//               { bg: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "#991b1b", label: "Booked" },
//               { bg: "#fed7aa",  border: "#fb923c", label: "Reserved (5 min)" },
//             ].map(item => (
//               <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1px solid #fde68a", borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 700, boxShadow: "0 2px 8px rgba(251,191,36,0.1)" }}>
//                 <span style={{ width: 12, height: 12, borderRadius: 3, background: item.bg, border: `1.5px solid ${item.border}`, display: "inline-block", flexShrink: 0 }} />
//                 <span style={{ color: "#78350f" }}>{item.label}</span>
//               </div>
//             ))}
//           </div>

//           {/* Grid */}
//           <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #fde68a", padding: "20px", boxShadow: "0 8px 32px rgba(251,191,36,0.12)" }}>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 9 }}>
//               {pageData.map(box => (
//                 <button
//                   key={box.box_number}
//                   disabled={box.status !== "available"}
//                   onClick={() => handleBoxClick(box.box_number)}
//                   className="grid-box"
//                   style={{ height: 42, borderRadius: 11, fontSize: 12, transition: "all 0.16s ease", fontFamily: "'Nunito', 'Segoe UI', sans-serif", ...getBoxStyle(box) }}
//                 >
//                   {String(box.box_number).padStart(3, "0")}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Pagination */}
//           <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 20 }}>
//             {[
//               { label: "← Prev", disabled: page === 1,          onClick: () => setPage(p => p - 1) },
//               { label: "Next →", disabled: page === totalPages,  onClick: () => setPage(p => p + 1) },
//             ].map((btn, i) => (
//               <button key={i} disabled={btn.disabled} onClick={btn.onClick}
//                 style={{ padding: "10px 22px", background: btn.disabled ? "#fef9c3" : "linear-gradient(135deg, #fbbf24, #d97706)", color: btn.disabled ? "#d97706" : "#fff", border: "1.5px solid #fbbf24", borderRadius: 11, fontWeight: 800, fontSize: 13, cursor: btn.disabled ? "not-allowed" : "pointer", opacity: btn.disabled ? 0.5 : 1, transition: "all 0.2s", fontFamily: "'Nunito', sans-serif" }}>
//                 {btn.label}
//               </button>
//             ))}
//             <span style={{ fontWeight: 900, color: "#92400e", fontSize: 14, background: "#fef9c3", border: "1.5px solid #fbbf24", borderRadius: 11, padding: "10px 18px", fontFamily: "'Nunito', sans-serif" }}>
//               {page} / {totalPages}
//             </span>
//           </div>

//           {/* Error */}
//           {submitError && (
//             <div style={{ textAlign: "center", marginTop: 14, background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 12, padding: "10px 20px", color: "#dc2626", fontWeight: 700, fontSize: 13 }}>
//               ⚠️ {submitError}
//             </div>
//           )}

//           {/* Proceed button */}
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 28, gap: 8 }}>
//             {maxSelectable && (
//               <p style={{ margin: 0, fontSize: 13, color: isComplete ? "#16a34a" : "#92400e", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
//                 {isComplete ? "✅ All boxes selected! Ready to register." : `${remaining} more box${remaining > 1 ? "es" : ""} to select`}
//               </p>
//             )}
//             <button
//               onClick={handleProceed} disabled={!isComplete}
//               style={{ padding: "16px 56px", background: isComplete ? "linear-gradient(135deg, #d97706, #b45309)" : "#e5e7eb", color: isComplete ? "#fff" : "#aaa", fontWeight: 900, fontSize: 16, border: "none", borderRadius: 16, cursor: isComplete ? "pointer" : "not-allowed", boxShadow: isComplete ? "0 12px 36px rgba(180,83,9,0.45)" : "none", letterSpacing: "0.05em", transition: "all 0.3s", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Nunito', sans-serif" }}
//             >
//               {isComplete ? "➡️ Next — Register & Pay" : `🎯 Select ${maxSelectable ?? 1} Box${(maxSelectable ?? 1) > 1 ? "es" : ""} to Continue`}
//             </button>
//           </div>

//         </div>
//       </section>
//     </>
//   );
// }
// GridSection.tsx — No changes to logic, small polish only
import LiveSeatCounter from "./LiveSeatCounter";
import CountdownTimer from "./CountdownTimer";
import { useEffect, useState, useCallback } from "react";
import { supabase, type GridBox } from "../lib/supabase";
import { Loader2, Sparkles } from "lucide-react";

interface GridSectionProps {
  onBoxesSelected: (boxes: number[]) => void;
  instruction?: string;
  maxSelectable?: number;
}

const PAGE_SIZE       = 125;
const PHASE_ONE_LIMIT = 250;
type BoxStatus = "available" | "reserved" | "booked" | "payment_failed";

export default function GridSection({ onBoxesSelected, instruction, maxSelectable }: GridSectionProps) {
  const [boxes, setBoxes]             = useState<GridBox[]>([]);
  const [loading, setLoading]         = useState(true);
  const [errorMsg, setErrorMsg]       = useState("");
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState<number[]>([]);
  const [submitError, setSubmitError] = useState("");

  const fetchBoxes = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("grid_boxes").select("*").lte("box_number", PHASE_ONE_LIMIT).order("box_number", { ascending: true });
      if (error) throw error;
      setBoxes((data ?? []) as GridBox[]);
      setErrorMsg("");
    } catch (err) { console.error(err); setErrorMsg("Failed to load grid. Please refresh."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBoxes(); }, [fetchBoxes]);
  useEffect(() => { const h = () => fetchBoxes(); window.addEventListener("focus", h); return () => window.removeEventListener("focus", h); }, [fetchBoxes]);
  useEffect(() => { setSelected([]); setSubmitError(""); setPage(1); }, [maxSelectable]);

  useEffect(() => {
    const ch = supabase.channel("grid-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "grid_boxes" }, (payload: any) => {
        if (!payload?.new) return;
        const u = payload.new as GridBox;
        if (u.box_number > PHASE_ONE_LIMIT) return;
        setBoxes(prev => prev.map(b => b.box_number === u.box_number ? u : b));
        if (u.status !== "available") setSelected(prev => prev.filter(b => b !== u.box_number));
        if (u.status === "payment_failed" || u.status === "reserved") {
          setTimeout(() => setBoxes(prev => prev.map(b => b.box_number === u.box_number && b.status === u.status ? { ...b, status: "available" as BoxStatus } : b)), 5 * 60 * 1000);
        }
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const totalPages = Math.max(1, Math.ceil(boxes.length / PAGE_SIZE));
  const pageData   = boxes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBoxClick = (n: number) => {
    const box = boxes.find(b => b.box_number === n);
    if (!box || box.status !== "available") return;
    setSelected(prev => {
      if (prev.includes(n)) return prev.filter(x => x !== n);
      if (maxSelectable && prev.length >= maxSelectable) return prev;
      return [...prev, n];
    });
    setSubmitError("");
  };

  const handleProceed = () => {
    if (selected.length === 0) { setSubmitError("Please select at least one box"); return; }
    if (maxSelectable && selected.length !== maxSelectable) { setSubmitError(`Please select exactly ${maxSelectable} box${maxSelectable > 1 ? "es" : ""}`); return; }
    setSubmitError("");
    onBoxesSelected(selected);
  };

  const getBoxStyle = (box: GridBox): React.CSSProperties => {
    const sel = selected.includes(box.box_number);
    if (sel) return { background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "2.5px solid #b45309", color: "#fff", transform: "scale(1.07)", boxShadow: "0 4px 16px rgba(217,119,6,0.45)", cursor: "pointer", fontWeight: 900 };
    switch (box.status as BoxStatus) {
      case "available":      return { background: "#fef9c3", border: "1.5px solid #fbbf24", color: "#78350f", cursor: "pointer", fontWeight: 700 };
      case "booked":         return { background: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "1.5px solid #991b1b", color: "#fff", cursor: "not-allowed", fontWeight: 800, opacity: 0.92 };
      case "payment_failed": return { background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "2px solid #b91c1c", color: "#fff", cursor: "not-allowed", fontWeight: 800, animation: "pulse-red 1.5s ease-in-out 3" };
      case "reserved":       return { background: "#fed7aa", border: "1.5px solid #fb923c", color: "#9a3412", cursor: "not-allowed", fontWeight: 700, opacity: 0.75 };
      default:               return { background: "#fef9c3", border: "1px solid #fde68a", color: "#d97706", cursor: "default" };
    }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "linear-gradient(160deg,#fffbeb,#fef9c3,#fefce8)", minHeight: "60vh", padding: "64px 20px" }}>
      <Loader2 style={{ animation: "spin 1s linear infinite", color: "#f59e0b" }} size={44} />
      <p style={{ color: "#d97706", fontWeight: 600, fontSize: 14, fontFamily: "'Nunito',sans-serif" }}>Loading boxes…</p>
    </div>
  );

  if (errorMsg) return <div style={{ textAlign: "center", padding: "48px 20px", color: "#dc2626", fontWeight: 700, fontFamily: "'Nunito',sans-serif" }}>{errorMsg}</div>;

  const isComplete    = maxSelectable ? selected.length === maxSelectable : selected.length > 0;
  const bookedCount   = boxes.filter(b => b.status === "booked").length;
  const availCount    = boxes.filter(b => b.status === "available").length;
  const reservedCount = boxes.filter(b => b.status === "reserved").length;
  const remaining     = maxSelectable ? maxSelectable - selected.length : 0;

  return (
    <>
      <style>{`@keyframes pulse-red{0%,100%{opacity:1}50%{opacity:0.6}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <section style={{ background: "linear-gradient(160deg,#fffbeb,#fef9c3,#fefce8)", fontFamily: "'Nunito','Segoe UI',sans-serif", paddingTop: 36, paddingBottom: 72 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 14px" }}>

          {instruction && (
            <div style={{ background: "linear-gradient(90deg,#fef9c3,#fef3c7)", border: "1.5px solid #fbbf24", borderRadius: 14, padding: "12px 20px", textAlign: "center", fontWeight: 700, color: "#92400e", marginBottom: 18, fontSize: 13 }}>
              ✦ {instruction} ✦
            </div>
          )}

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#78350f,#d97706,#fbbf24)", borderRadius: 22, padding: "24px 24px 20px", textAlign: "center", marginBottom: 20, boxShadow: "0 16px 48px rgba(217,119,6,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Sparkles color="#fff" size={18} />
                <h3 style={{ margin: 0, fontSize: "clamp(1.2rem,4vw,1.7rem)", fontWeight: 900, color: "#fff" }}>Select Your Lucky Box{maxSelectable && maxSelectable > 1 ? "es" : ""}</h3>
                <Sparkles color="#fff" size={18} />
              </div>

              {/* Progress pill */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: isComplete ? "rgba(22,163,74,0.35)" : "rgba(255,255,255,0.18)", border: isComplete ? "1px solid rgba(22,163,74,0.6)" : "1px solid rgba(255,255,255,0.3)", borderRadius: 99, padding: "7px 20px", transition: "all 0.3s" }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>
                  {isComplete ? "✅ Done!" : "🎯"} {selected.length}{maxSelectable ? ` / ${maxSelectable}` : ""} selected
                  {maxSelectable && !isComplete && remaining > 0 && <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}> — pick {remaining} more</span>}
                </span>
              </div>

              {selected.length > 0 && (
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 6 }}>
                  📦 {selected.map(b => String(b).padStart(3, "0")).join(", ")}
                </p>
              )}

              {/* Stats */}
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                {[["Available", availCount], ["Booked", bookedCount], ["Reserved", reservedCount]].map(([l, c]) => (
                  <div key={l as string} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 11, padding: "6px 16px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#fff" }}>{c}</p>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live widgets */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14, marginBottom: 18 }}>
            <LiveSeatCounter />
            <CountdownTimer />
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: 14 }}>
            {[
              { bg: "#fef9c3",  border: "#fbbf24", label: "Available" },
              { bg: "linear-gradient(135deg,#f59e0b,#d97706)", border: "#b45309", label: "Selected" },
              { bg: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "#991b1b", label: "Booked" },
              { bg: "#fed7aa",  border: "#fb923c", label: "Reserved (5 min)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #fde68a", borderRadius: 99, padding: "4px 11px", fontSize: 10, fontWeight: 700 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: item.bg, border: `1.5px solid ${item.border}`, display: "inline-block", flexShrink: 0 }} />
                <span style={{ color: "#78350f" }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #fde68a", padding: "18px", boxShadow: "0 8px 32px rgba(251,191,36,0.1)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(68px,1fr))", gap: 8 }}>
              {pageData.map(box => (
                <button key={box.box_number} disabled={box.status !== "available"} onClick={() => handleBoxClick(box.box_number)}
                  style={{ height: 40, borderRadius: 10, fontSize: 12, transition: "all 0.15s ease", fontFamily: "'Nunito','Segoe UI',sans-serif", ...getBoxStyle(box) }}>
                  {String(box.box_number).padStart(3, "0")}
                </button>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 18 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              style={{ padding: "9px 20px", background: page === 1 ? "#fef9c3" : "linear-gradient(135deg,#fbbf24,#d97706)", color: page === 1 ? "#d97706" : "#fff", border: "1.5px solid #fbbf24", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1, fontFamily: "'Nunito',sans-serif" }}>← Prev</button>
            <span style={{ fontWeight: 900, color: "#92400e", fontSize: 13, background: "#fef9c3", border: "1.5px solid #fbbf24", borderRadius: 10, padding: "9px 16px", fontFamily: "'Nunito',sans-serif" }}>{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              style={{ padding: "9px 20px", background: page === totalPages ? "#fef9c3" : "linear-gradient(135deg,#fbbf24,#d97706)", color: page === totalPages ? "#d97706" : "#fff", border: "1.5px solid #fbbf24", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1, fontFamily: "'Nunito',sans-serif" }}>Next →</button>
          </div>

          {submitError && (
            <div style={{ textAlign: "center", marginTop: 12, background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 11, padding: "9px 18px", color: "#dc2626", fontWeight: 700, fontSize: 12 }}>
              ⚠️ {submitError}
            </div>
          )}

          {/* Proceed */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24, gap: 7 }}>
            {maxSelectable && (
              <p style={{ margin: 0, fontSize: 12, color: isComplete ? "#16a34a" : "#92400e", fontWeight: 700, fontFamily: "'Nunito',sans-serif" }}>
                {isComplete ? "✅ All boxes selected! Ready to register." : `${remaining} more box${remaining !== 1 ? "es" : ""} to select`}
              </p>
            )}
            <button onClick={handleProceed} disabled={!isComplete}
              style={{ padding: "15px 52px", background: isComplete ? "linear-gradient(135deg,#d97706,#b45309)" : "#e5e7eb", color: isComplete ? "#fff" : "#aaa", fontWeight: 900, fontSize: 15, border: "none", borderRadius: 15, cursor: isComplete ? "pointer" : "not-allowed", boxShadow: isComplete ? "0 12px 36px rgba(180,83,9,0.4)" : "none", letterSpacing: "0.04em", transition: "all 0.3s", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Nunito',sans-serif" }}>
              {isComplete ? "➡️ Next — Register & Pay" : `🎯 Select ${maxSelectable ?? 1} Box${(maxSelectable ?? 1) > 1 ? "es" : ""} to Continue`}
            </button>
          </div>

        </div>
      </section>
    </>
  );
}