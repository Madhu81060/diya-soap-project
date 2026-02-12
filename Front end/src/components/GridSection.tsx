import LiveSeatCounter from "./LiveSeatCounter";
import CountdownTimer from "./CountdownTimer";
import { useEffect, useMemo, useState } from "react";
import { supabase, type GridBox } from "../lib/supabase";
import { Loader2, Sparkles } from "lucide-react";

interface GridSectionProps {
  onBoxesSelected: (boxes: number[]) => void;
  instruction?: string;
  mode?: "single" | "half" | "monthly";
}

const PAGE_SIZE = 125;
const PHASE_ONE_LIMIT = 250;

export default function GridSection({
  onBoxesSelected,
  instruction,
  mode = "single",
}: GridSectionProps) {

  // Required boxes based on mode
  const REQUIRED_BOXES =
    mode === "monthly" ? 4 :
    mode === "half" ? 2 :
    1;

  const [boxes, setBoxes] = useState<GridBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  // ================= FETCH GRID =================
  const fetchBoxes = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("grid_boxes")
        .select("*")
        .order("box_number", { ascending: true });

      if (error) throw error;

      setBoxes((data ?? []) as GridBox[]);
    } catch (err: any) {
      console.error("Grid fetch error:", err);
      setErrorMsg("Failed to load grid. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  // Reset selection when mode changes
  useEffect(() => {
    setSelected([]);
  }, [mode]);

  const phaseOneBoxes = useMemo(
    () => boxes.filter((b) => b.box_number <= PHASE_ONE_LIMIT),
    [boxes]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(phaseOneBoxes.length / PAGE_SIZE)
  );

  const pageData = phaseOneBoxes.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // ================= BOX CLICK =================
  const handleBoxClick = (boxNumber: number) => {
    if (selected.includes(boxNumber)) return;

    const updated = [...selected, boxNumber];
    setSelected(updated);

    if (updated.length === REQUIRED_BOXES) {
      onBoxesSelected(updated);
      setSelected([]);
    }
  };

  // ================= BOX COLORS =================
  const getBoxColor = (box: GridBox) => {
    if (selected.includes(box.box_number))
      return "bg-yellow-500 text-white border-yellow-600 scale-105 shadow-md";

    if (box.status === "available")
      return "bg-yellow-100 hover:bg-yellow-300 border-yellow-400 text-yellow-900 hover:scale-105";

    if (box.status === "reserved")
      return "bg-red-200 border-red-400 text-red-900 cursor-not-allowed";

    if (box.status === "booked")
      return "bg-green-500 text-white border-green-600 cursor-not-allowed";

    return "bg-gray-100 border-gray-300";
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex justify-center py-16 sm:py-20">
        <Loader2 className="animate-spin text-yellow-600" size={40} />
      </div>
    );
  }

  // ================= ERROR =================
  if (errorMsg) {
    return (
      <div className="text-center py-12 text-red-600 font-bold">
        {errorMsg}
      </div>
    );
  }

  // ================= UI =================
  return (
    <section
      id="first250"
      className="relative py-12 sm:py-20 bg-white overflow-hidden"
    >

      {/* Background glow */}
      <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-yellow-300/40 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-amber-300/40 rounded-full blur-3xl animate-pulse -z-10" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4">

        {/* Instruction */}
        {instruction && (
          <div className="mb-6 p-3 sm:p-4 rounded-xl bg-yellow-100 border border-yellow-300 text-center font-semibold shadow text-sm sm:text-base">
            {instruction}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 sm:mb-10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-center shadow-2xl">
          <div className="flex justify-center gap-2 mb-2">
            <Sparkles className="animate-pulse" />
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold">
              Select {REQUIRED_BOXES} Box{REQUIRED_BOXES > 1 && "es"}
            </h3>
            <Sparkles className="animate-pulse" />
          </div>

          <p className="font-semibold text-sm sm:text-base">
            Selected: {selected.length} / {REQUIRED_BOXES}
          </p>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <LiveSeatCounter />
          <CountdownTimer />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-3">
          {pageData.map((box) => {
            const disabled = box.status !== "available";

            return (
              <button
                key={box.box_number}
                disabled={disabled}
                onClick={() => !disabled && handleBoxClick(box.box_number)}
                className={`h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl border font-bold text-xs sm:text-sm transition-all duration-200 ${getBoxColor(box)}`}
              >
                {String(box.box_number).padStart(3, "0")}
              </button>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-8 sm:mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 sm:px-5 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-xl font-bold disabled:opacity-40"
          >
            Prev
          </button>

          <span className="font-extrabold text-yellow-800">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 sm:px-5 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-xl font-bold disabled:opacity-40"
          >
            Next
          </button>
        </div>

      </div>
    </section>
  );
}
