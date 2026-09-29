-- 1. Counter table (one row per year)
CREATE TABLE IF NOT EXISTS invoice_number_counters (
  year integer PRIMARY KEY,
  last_value integer NOT NULL DEFAULT 0
);

-- 2. Atomic "get next number for this year" function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  current_year integer := extract(year from now());
  next_val integer;
BEGIN
  INSERT INTO invoice_number_counters (year, last_value)
  VALUES (current_year, 1)
  ON CONFLICT (year)
  DO UPDATE SET last_value = invoice_number_counters.last_value + 1
  RETURNING last_value INTO next_val;

  RETURN 'INV-' || current_year || '-' || lpad(next_val::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. Wire the function as the column default
ALTER TABLE invoices ALTER COLUMN invoice_number SET DEFAULT generate_invoice_number();

-- 4. Seed 2026's counter from your existing sequence value (137),
--    so the next invoice continues at 138 instead of restarting at 1
INSERT INTO invoice_number_counters (year, last_value)
VALUES (2026, 137)
ON CONFLICT (year) DO UPDATE SET last_value = EXCLUDED.last_value;

-- 5. Clean up the old sequence
DROP SEQUENCE IF EXISTS invoice_number_seq;