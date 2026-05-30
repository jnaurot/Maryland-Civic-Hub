#!/usr/bin/env tsx
/**
 * Fix all state legislators whose chamber/district are NULL because the
 * OpenStates dump ingestion used `current_role` (a PostgreSQL reserved
 * keyword) unquoted.
 *
 * This script reads from the OpenStates source DB and updates the app's
 * state_legislators table in-place — it does NOT delete bills or votes.
 */
import { Client } from "pg";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/civic_hub";
const OPENSTATES_DB_URL = process.env.OPENSTATES_DB_URL ?? "postgresql://postgres:postgres@localhost:5432/openstates";

function log(...args: unknown[]) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function withClient(url: string, fn: (client: Client) => Promise<void>) {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await fn(client);
  } finally {
    await client.end();
  }
}

async function main() {
  log("=== Fixing all state legislator chambers/districts ===");

  await withClient(OPENSTATES_DB_URL, async (source) => {
    await withClient(DATABASE_URL, async (target) => {
      const { rows: jurisdictions } = await source.query(
        `SELECT id, name FROM opencivicdata_jurisdiction
         WHERE id ~ '^ocd-jurisdiction/country:us/state:[a-z]{2}/government$'
         ORDER BY id`,
      );

      for (const j of jurisdictions) {
        const stateCode = j.id.match(/state:([a-z]{2})/i)?.[1]?.toLowerCase() ?? "";
        if (!stateCode) continue;

        const { rows: people } = await source.query(
          `SELECT id, name, primary_party, image, email, "current_role", extras
           FROM opencivicdata_person
           WHERE current_jurisdiction_id = $1`,
          [j.id],
        );

        let updated = 0;
        for (const row of people) {
          const role = row.current_role ?? {};
          const chamber = role.org_classification === "upper"
            ? "Senate"
            : role.org_classification === "lower"
              ? "House of Delegates"
              : null;
          const district = role.district ? String(role.district) : null;

          await target.query(
            `UPDATE state_legislators
             SET chamber = $1,
                 district = $2,
                 raw = $3,
                 fetched_at = NOW()
             WHERE id = $4`,
            [
              chamber,
              district,
              JSON.stringify({ ...row.extras, current_role: row.current_role }),
              row.id,
            ],
          );
          updated++;
        }

        log(`${j.name} (${stateCode}): updated ${updated} legislators`);
      }
    });
  });

  log("=== Done ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
