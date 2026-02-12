/*
  ✅ SECURE SCHEMA — FINAL PRODUCTION MIGRATION
*/

-- ================= GRID BOXES =================

CREATE TABLE IF NOT EXISTS grid_boxes (
  box_number integer PRIMARY KEY
    CHECK (box_number >= 1 AND box_number <= 500),

  status text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'booked')),

  reserved_at timestamptz,
  booked_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ================= MEMBERS =================

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ✅ UNIQUE REMOVED
  box_number integer REFERENCES grid_boxes(box_number),

  full_name text NOT NULL,
  mobile text NOT NULL,
  house_no text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  pincode text NOT NULL,

  -- ✅ STATUS FIXED
  payment_status text DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed')),

  payment_id text,

  -- ✅ NO DEFAULT AMOUNT
  payment_amount integer,

  order_id text UNIQUE,

  shipment_status text DEFAULT 'pending'
    CHECK (shipment_status IN
      ('pending', 'processing', 'shipped', 'delivered')),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ================= LUCKY DRAW =================

CREATE TABLE IF NOT EXISTS lucky_draw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_date timestamptz NOT NULL,
  winner_member_id uuid REFERENCES members(id),
  prize_description text DEFAULT '5 grams gold',
  is_announced boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ================= ENABLE RLS =================

ALTER TABLE grid_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lucky_draw ENABLE ROW LEVEL SECURITY;

-- ================= CLEAN OLD POLICIES =================

DROP POLICY IF EXISTS "Public can view grid boxes" ON grid_boxes;
DROP POLICY IF EXISTS "Public can insert registration" ON members;
DROP POLICY IF EXISTS "Public can view announced draw" ON lucky_draw;

-- ================= SAFE POLICIES =================

CREATE POLICY "Public can view grid boxes"
  ON grid_boxes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert registration"
  ON members FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view announced draw"
  ON lucky_draw FOR SELECT
  TO public
  USING (is_announced = true);

-- ================= INDEXES =================

CREATE INDEX IF NOT EXISTS idx_grid_boxes_status
  ON grid_boxes(status);

CREATE INDEX IF NOT EXISTS idx_members_box_number
  ON members(box_number);

CREATE INDEX IF NOT EXISTS idx_members_payment_status
  ON members(payment_status);

CREATE INDEX IF NOT EXISTS idx_members_mobile
  ON members(mobile);

CREATE INDEX IF NOT EXISTS idx_members_order_id
  ON members(order_id);

-- ================= UPDATED_AT FUNCTION =================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================= TRIGGERS =================

DROP TRIGGER IF EXISTS update_grid_boxes_updated_at
  ON grid_boxes;

CREATE TRIGGER update_grid_boxes_updated_at
  BEFORE UPDATE ON grid_boxes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at
  ON members;

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================= POPULATE BOXES =================

INSERT INTO grid_boxes (box_number)
SELECT generate_series(1, 500)
ON CONFLICT (box_number) DO NOTHING;
