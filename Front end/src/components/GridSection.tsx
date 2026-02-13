import LiveSeatCounter from "./LiveSeatCounter";
import CountdownTimer from "./CountdownTimer";
import { useEffect, useState, useCallback } from "react";
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

  const REQUIRED_BOXES =
    mode === "monthly" ? 4 :
    mode === "half" ? 2 : 1;

  const [boxes, setBoxes] = useState<GridBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  // ================= FETCH GRID =================

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
      console.error("Grid fetch error:", err);
      setErrorMsg("Failed to load grid.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoxes();
  }, [fetchBoxes]);

  // ================= REALTIME FIXED =================

  useEffect(() => {
    const channel = supabase
      .channel("grid-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grid_boxes",
        },
        (payload: any) => {

          if (!payload?.new) return;

          const updatedBox = payload.new as GridBox;

          if (
            updatedBox.box_number >
            PHASE_ONE_LIMIT
          ) return;

          setBoxes((prev) =>
            prev.map((box) =>
              box.box_number === updatedBox.box_number
                ? updatedBox
                : box
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ================= RESET =================

  useEffect(() => {
    setSelected([]);
  }, [mode]);

  // ================= PAGINATION =================

  const totalPages = Math.max(
    1,
    Math.ceil(boxes.length / PAGE_SIZE)
  );

  const pageData = boxes.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // ================= CLICK =================

  const handleBoxClick = (boxNumber: number) => {

    if (selected.includes(boxNumber)) return;

    const updated = [...selected, boxNumber];
    setSelected(updated);

    if (updated.length === REQUIRED_BOXES) {
      onBoxesSelected(updated);
      setSelected([]);
    }
  };

  // ================= COLORS =================

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
      <div className="flex justify-center py-16">
        <Loader2
          className="animate-spin text-yellow-600"
          size={40}
        />
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

  // ================= UI =================

  return (
    <section id="grid" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">

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
              Select {REQUIRED_BOXES} Box{REQUIRED_BOXES > 1 && "es"}
            </h3>
            <Sparkles />
          </div>

          <p className="font-semibold">
            Selected: {selected.length} / {REQUIRED_BOXES}
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

            const disabled =
              box.status !== "available";

            return (
              <button
                key={box.box_number}
                disabled={disabled}
                onClick={() =>
                  !disabled &&
                  handleBoxClick(box.box_number)
                }
                className={`h-11 rounded-lg border font-bold transition ${getBoxColor(box)}`}
              >
                {String(box.box_number).padStart(3, "0")}
              </button>
            );
          })}

        </div>

        {/* PAGINATION */}

        <div className="flex justify-center gap-6 mt-8">

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
