import type { Pool } from "pg";

const statements = [
  `CREATE EXTENSION IF NOT EXISTS pg_trgm`,

  `CREATE OR REPLACE FUNCTION update_federal_bills_search_vector()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.search_vector :=
       setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
       setweight(to_tsvector('english', coalesce(NEW.number, '')), 'B') ||
       setweight(to_tsvector('english', coalesce(array_to_string(NEW.subjects, ' '), '')), 'C') ||
       setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'C');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  `CREATE OR REPLACE FUNCTION update_state_bills_search_vector()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.search_vector :=
       setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
       setweight(to_tsvector('english', coalesce(NEW.identifier, '')), 'B') ||
       setweight(to_tsvector('english', coalesce(array_to_string(NEW.subjects, ' '), '')), 'C') ||
       setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'C');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_trigger t
       JOIN pg_class c ON t.tgrelid = c.oid
       WHERE t.tgname = 'federal_bills_search_vector_update' AND c.relname = 'federal_bills'
     ) THEN
       CREATE TRIGGER federal_bills_search_vector_update
       BEFORE INSERT OR UPDATE ON federal_bills
       FOR EACH ROW EXECUTE FUNCTION update_federal_bills_search_vector();
     END IF;
   END $$`,

  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_trigger t
       JOIN pg_class c ON t.tgrelid = c.oid
       WHERE t.tgname = 'state_bills_search_vector_update' AND c.relname = 'state_bills'
     ) THEN
       CREATE TRIGGER state_bills_search_vector_update
       BEFORE INSERT OR UPDATE ON state_bills
       FOR EACH ROW EXECUTE FUNCTION update_state_bills_search_vector();
     END IF;
   END $$`,

  `CREATE INDEX IF NOT EXISTS idx_federal_bills_title_trgm
   ON federal_bills USING gin (title gin_trgm_ops)`,

  `CREATE INDEX IF NOT EXISTS idx_state_bills_title_trgm
   ON state_bills USING gin (title gin_trgm_ops)`,

  `CREATE INDEX IF NOT EXISTS idx_federal_member_legislation_title_trgm
   ON federal_member_legislation_items USING gin (title gin_trgm_ops)`,
];

export async function initTriggers(pool: Pool): Promise<void> {
  for (const stmt of statements) {
    await pool.query(stmt);
  }
}
