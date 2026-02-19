import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface SlotContextType {
  booked: number;
  total: number;
}

const SlotContext = createContext<SlotContextType>({
  booked: 0,
  total: 250,
});

export const SlotProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const TOTAL = 250;
  const [booked, setBooked] = useState(0);

  // 🔥 initial load
  useEffect(() => {
    const loadInitial = async () => {
      const { data } = await supabase
        .from("grid_boxes")
        .select("status")
        .eq("status", "booked");

      setBooked(data?.length ?? 0);
    };

    loadInitial();
  }, []);

  // 🔥 realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("slots-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grid_boxes",
        },
        async () => {
          const { data } = await supabase
            .from("grid_boxes")
            .select("status")
            .eq("status", "booked");

          setBooked(data?.length ?? 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SlotContext.Provider
      value={{ booked, total: TOTAL }}
    >
      {children}
    </SlotContext.Provider>
  );
};

export const useSlots = () => useContext(SlotContext);
