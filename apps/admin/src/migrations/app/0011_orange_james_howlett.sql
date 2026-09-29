CREATE TABLE "invoice_number_counters" (
	"year" integer PRIMARY KEY NOT NULL,
	"last_value" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_invoice_number_unique";--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "invoice_number" SET DEFAULT generate_invoice_number();--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "invoice_number" DROP NOT NULL;

-- (hand-added) the numbering function, must come before the default below
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
--> statement-breakpoint

-- (drizzle-kit generated) set the column default
ALTER TABLE "invoices" ALTER COLUMN "invoice_number" SET DEFAULT generate_invoice_number();
--> statement-breakpoint

-- (hand-added) seed 2026 from the existing sequence value
INSERT INTO invoice_number_counters (year, last_value)
VALUES (2026, 137)
ON CONFLICT (year) DO UPDATE SET last_value = EXCLUDED.last_value;
--> statement-breakpoint

-- (hand-added) drop the now-unused sequence
DROP SEQUENCE IF EXISTS invoice_number_seq;