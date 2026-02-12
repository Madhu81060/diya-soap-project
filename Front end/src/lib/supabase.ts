import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ================= ENV CHECK =================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase ENV missing");
  throw new Error("Missing Supabase environment variables");
}

// ================= CLIENT =================
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// ================= TYPES =================

// Grid box table
export interface GridBox {
  box_number: number;
  status: "available" | "reserved" | "booked";
  reserved_at: string | null;
  booked_at: string | null;
  created_at: string;
  updated_at: string;
}

// Members table
export interface Member {
  id: string;
  box_number: number;
  full_name: string;
  mobile: string;
  house_no: string;
  street: string;
  city: string;
  pincode: string;
  payment_status: "pending" | "success" | "failed";
  payment_id: string | null;
  payment_amount: number;
  order_id: string | null;
  shipment_status: "pending" | "processing" | "shipped" | "delivered";
  created_at: string;
  updated_at: string;
}

// Lucky draw table
export interface LuckyDraw {
  id: string;
  draw_date: string;
  winner_member_id: string | null;
  prize_description: string;
  is_announced: boolean;
  created_at: string;
}
