import LiveSeatCounter from "./LiveSeatCounter";
import CountdownTimer from "./CountdownTimer";
import { useEffect, useState, useCallback } from "react";
import { supabase, type GridBox } from "../lib/supabase";
import { Loader2, Sparkles } from "lucide-react";

interface GridSectionProps {
  onBoxesSelected: (boxes: number[]) => void;
  instruction?: string;
  maxSelectable?: number; // ✅ NEW
}

const PAGE_SIZE = 125;
const PHASE_ONE_LIMIT = 250;

export default function GridSection({
  onBoxesSelected,
  instruction,
  maxSelectable,
}: GridSectionProps) {
  const [boxes, setBoxes] = useState<GridBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [submitError, setSubmitError] = useState("");

  /* ================= FETCH GRID ================= */

  const fetchBoxes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("grid_boxes")
        .select("*")
        .lte("box_number", PHASE_ONE_LIMIT)
        .order("box_number", { ascending: true });

      if (error) throw error;

      setBoxes((data ?? []) as GridBox[]);
      setErrorMsg("");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load grid");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoxes();
  }, [fetchBoxes]);

  /* ================= 🔥 RESET SELECTION ON OFFER CHANGE ================= */

  useEffect(() => {
    setSelected([]);
    setSubmitError("");
  }, [maxSelectable]);

  /* ================= REALTIME ================= */

  useEffect(() => {
    const channel = supabase
      .channel("grid-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "grid_boxes" },
        (payload: any) => {
          if (!payload?.new) return;
          const updated = payload.new as GridBox;

          if (updated.box_number > PHASE_ONE_LIMIT) return;

          setBoxes((prev) =>
            prev.map((b) =>
              b.box_number === updated.box_number ? updated : b
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= PAGINATION ================= */

  const totalPages = Math.max(1, Math.ceil(boxes.length / PAGE_SIZE));
  const pageData = boxes.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ================= BOX CLICK ================= */

  const handleBoxClick = (boxNumber: number) => {
    setSelected((prev) => {
      if (prev.includes(boxNumber)) {
        return prev.filter((n) => n !== boxNumber);
      }

      // 🔒 enforce max selectable
      if (maxSelectable && prev.length >= maxSelectable) {
        return prev;
      }

      return [...prev, boxNumber];
    });
  };

  /* ================= PROCEED ================= */

  const handleProceed = () => {
    if (selected.length === 0) {
      setSubmitError("Please select at least one box");
      return;
    }

    if (maxSelectable && selected.length !== maxSelectable) {
      setSubmitError(
        `Please select exactly ${maxSelectable} box${
          maxSelectable > 1 ? "es" : ""
        }`
      );
      return;
    }

    setSubmitError("");
    onBoxesSelected(selected);
  };

  /* ================= COLORS ================= */

  const getBoxColor = (box: GridBox) => {
    if (selected.includes(box.box_number))
      return "bg-yellow-500 text-white border-yellow-600 scale-105 shadow-md";

    if (box.status === "available")
      return "bg-yellow-100 hover:bg-yellow-300 border-yellow-400 text-yellow-900";

    if (box.status === "reserved")
      return "bg-red-200 border-red-400 text-red-900 cursor-not-allowed";

    if (box.status === "booked")
      return "bg-green-500 text-white border-green-600 cursor-not-allowed";

    return "bg-gray-100 border-gray-300";
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-yellow-600" size={40} />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-12 text-red-600 font-bold">
        {errorMsg}
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <section id="grid" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* OFFER INSTRUCTION */}
        {instruction && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-100 border border-yellow-300 text-center font-semibold">
            {instruction}
          </div>
        )}

        {/* HEADER */}
        <div className="mb-8 rounded-3xl p-8 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-center shadow-xl">
          <div className="flex justify-center gap-2 mb-2">
            <Sparkles />
            <h3 className="text-2xl font-extrabold">
              Select Your Lucky Boxes
            </h3>
            <Sparkles />
          </div>
          <p className="font-semibold">
            Selected Boxes: {selected.length}
            {maxSelectable && ` / ${maxSelectable}`}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <LiveSeatCounter />
          <CountdownTimer />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
          {pageData.map((box) => {
            const disabled = box.status !== "available";

            return (
              <button
                key={box.box_number}
                disabled={disabled}
                onClick={() =>
                  !disabled && handleBoxClick(box.box_number)
                }
                className={`h-11 rounded-lg border font-bold transition ${getBoxColor(box)}`}
              >
                {String(box.box_number).padStart(3, "0")}
              </button>
            );
          })}
        </div>

        {/* ERROR */}
        {submitError && (
          <p className="text-center text-red-600 font-semibold mt-4">
            {submitError}
          </p>
        )}

        {/* PROCEED */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleProceed}
            className="px-10 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-lg"
          >
            Proceed to Registration
          </button>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-6 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-5 py-2 bg-yellow-100 rounded-xl font-bold disabled:opacity-40"
          >
            Prev
          </button>

          <span className="font-extrabold text-yellow-800">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-5 py-2 bg-yellow-100 rounded-xl font-bold disabled:opacity-40"
          >
            Next
          </button>
        </div>

      </div>
    </section>
  );
}