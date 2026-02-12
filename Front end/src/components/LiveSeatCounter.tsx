import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const PHASE_ONE_LIMIT = 250;

export default function LiveSeatCounter() {
  const [available, setAvailable] = useState(250);

  const fetchSeats = async () => {
    const { data } = await supabase
      .from("grid_boxes")
      .select("status")
      .lte("box_number", PHASE_ONE_LIMIT);

    if (!data) return;

    const count = data.filter(
      (b) => b.status === "available"
    ).length;

    setAvailable(count);
  };

  useEffect(() => {
    fetchSeats();

    const channel = supabase
      .channel("seat-counter")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "grid_boxes" },
        fetchSeats
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center font-extrabold text-green-800 shadow">
      🔥 Live Available Seats: {available} / 250
    </div>
  );
}
