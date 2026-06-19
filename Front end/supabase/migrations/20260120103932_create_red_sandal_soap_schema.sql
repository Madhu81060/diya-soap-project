/*
  ✅ SECURE SCHEMA — FINAL PRODUCTION MIGRATION
  Removed Lucky Draw, Gold Coin, and Grid Box features.
  Only Members and Admins tables are maintained.
*/

-- ================= MEMBERS =================

CREATE TABLE IF NOT EXISTS members (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  box_number text,
  full_name text NOT NULL,
  email text,
  mobile text NOT NULL,
  house_no text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  pincode text NOT NULL,
  payment_id text,
  payment_status text DEFAULT 'pending',
  amount_paid integer,
  order_id text,
  package_type text,
  no_of_soaps integer,
  is_kit boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ================= ADMINS =================

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- ================= INDEXES =================

CREATE INDEX IF NOT EXISTS idx_members_payment_status
  ON members(payment_status);

CREATE INDEX IF NOT EXISTS idx_members_mobile
  ON members(mobile);

CREATE INDEX IF NOT EXISTS idx_members_order_id
  ON members(order_id);
