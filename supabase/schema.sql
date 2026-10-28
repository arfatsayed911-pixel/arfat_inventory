-- ==============================================================================
-- ARFAT INVENTORY & STOCK MANAGEMENT SYSTEM - DATABASE SCHEMA (SUPABASE)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'pcs',
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_threshold INTEGER NOT NULL DEFAULT 5,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Stock Movements (Stock In / Stock Out / Adjustments)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('purchase', 'sale', 'damaged', 'return', 'audit', 'initial', 'transfer')),
  reference TEXT,
  notes TEXT,
  created_by TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. System Settings (for notification email, company info)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'general',
  company_name TEXT DEFAULT 'Acme Inventory Co.',
  alert_email TEXT,
  low_stock_auto_alert BOOLEAN DEFAULT TRUE,
  currency TEXT DEFAULT 'USD',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_current_stock ON products(current_stock);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- 7. Trigger to keep updated_at refreshed
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 8. Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public/authenticated read & write (adjust as needed for multi-tenant or role-based auth)
CREATE POLICY "Allow read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow insert/update/delete to categories" ON categories FOR ALL USING (true);

CREATE POLICY "Allow read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow insert/update/delete to products" ON products FOR ALL USING (true);

CREATE POLICY "Allow read access to stock_movements" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow insert/update/delete to stock_movements" ON stock_movements FOR ALL USING (true);

CREATE POLICY "Allow read access to settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow insert/update/delete to settings" ON settings FOR ALL USING (true);

-- ==============================================================================
-- SEED DATA (INITIAL SAMPLE INVENTORY)
-- ==============================================================================

INSERT INTO categories (id, name, slug, description) VALUES
('b0000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', 'Audio, compute, and accessories'),
('b0000000-0000-0000-0000-000000000002', 'Office Supplies', 'office-supplies', 'Stationery, paper, and desk essentials'),
('b0000000-0000-0000-0000-000000000003', 'Packaging', 'packaging', 'Boxes, tape, bubble wrap, and mailing supplies'),
('b0000000-0000-0000-0000-000000000004', 'Furniture', 'furniture', 'Ergonomic chairs, desks, and storage')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, sku, barcode, category_id, description, unit, cost_price, selling_price, current_stock, min_threshold, location) VALUES
('c0000000-0000-0000-0000-000000000001', 'Wireless Noise-Canceling Headphones', 'ELEC-WNC-001', '8901234567890', 'b0000000-0000-0000-0000-000000000001', 'Premium over-ear wireless headphones with ANC', 'pcs', 110.00, 199.99, 18, 5, 'Warehouse A - Bay 1'),
('c0000000-0000-0000-0000-000000000002', 'Mechanical RGB Keyboard', 'ELEC-KB-002', '8901234567891', 'b0000000-0000-0000-0000-000000000001', 'Tenkeyless hot-swappable mechanical keyboard', 'pcs', 45.00, 89.99, 4, 8, 'Warehouse A - Bay 2'),
('c0000000-0000-0000-0000-000000000003', 'USB-C Fast Charging Cable (2m)', 'ELEC-CB-003', '8901234567892', 'b0000000-0000-0000-0000-000000000001', 'Braided 100W PD charging cable', 'pcs', 3.50, 14.99, 0, 10, 'Warehouse A - Bay 3'),
('c0000000-0000-0000-0000-000000000004', 'Gel Ink Rollerball Pens (Pack of 10)', 'OFF-PEN-001', '8901234567893', 'b0000000-0000-0000-0000-000000000002', 'Smooth flow 0.5mm black gel pens', 'box', 4.20, 9.99, 42, 12, 'Warehouse B - Shelf 1'),
('c0000000-0000-0000-0000-000000000005', 'A4 Premium Copy Paper (500 Sheets)', 'OFF-PPR-002', '8901234567894', 'b0000000-0000-0000-0000-000000000002', '80 GSM bright white multi-purpose paper', 'ream', 3.80, 7.49, 3, 15, 'Warehouse B - Shelf 2'),
('c0000000-0000-0000-0000-000000000006', 'Corrugated Shipping Box (Medium)', 'PKG-BOX-001', '8901234567895', 'b0000000-0000-0000-0000-000000000003', 'Durable double-wall shipping carton 12x9x6 inch', 'pcs', 0.85, 2.20, 120, 30, 'Warehouse C - Pallet 4'),
('c0000000-0000-0000-0000-000000000007', 'Heavy-Duty Packaging Tape (6-Pack)', 'PKG-TPE-002', '8901234567896', 'b0000000-0000-0000-0000-000000000003', 'Strong acrylic adhesive clear packing tape', 'pack', 6.00, 13.50, 2, 8, 'Warehouse C - Shelf 1'),
('c0000000-0000-0000-0000-000000000008', 'Ergonomic Mesh Office Chair', 'FURN-CHR-001', '8901234567897', 'b0000000-0000-0000-0000-000000000004', 'Breathable mesh back with lumbar support', 'pcs', 125.00, 249.00, 9, 3, 'Warehouse D - Row 1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stock_movements (id, product_id, type, quantity, previous_stock, new_stock, reason, reference, notes, created_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'IN', 20, 0, 20, 'purchase', 'PO-9821', 'Initial supplier shipment received', NOW() - INTERVAL '3 days'),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'OUT', 2, 20, 18, 'sale', 'ORD-4412', 'Fulfilled online customer order', NOW() - INTERVAL '1 day'),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'OUT', 6, 10, 4, 'sale', 'ORD-4430', 'Corporate bundle sale dispatched', NOW() - INTERVAL '5 hours'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'OUT', 15, 15, 0, 'sale', 'ORD-4401', 'Stock cleared by flash promotion', NOW() - INTERVAL '2 days'),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000007', 'OUT', 6, 8, 2, 'damaged', 'AUD-1002', 'Water damage in warehouse shelf inspection', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (id, company_name, alert_email, low_stock_auto_alert)
VALUES ('general', 'Arfat Inventory', 'inventory-alerts@example.com', true)
ON CONFLICT (id) DO NOTHING;

