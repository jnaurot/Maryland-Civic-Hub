#!/usr/bin/env tsx
/**
 * Fix Maryland legislators whose chamber/district are NULL because the
 * OpenStates dump ingestion used `current_role` (a PostgreSQL reserved
 * keyword) unquoted, yielding `{"current_role": "postgres"}`.
 *
 * This script fetches all MD legislators from the OpenStates API and
 * upserts them into the app's state_legislators table.
 */
import { Client } from "pg";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/civic_hub";
const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;
const OPENSTATES_BASE = "https://v3.openstates.org";

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

async function fetchMdLegislatorsFromApi(): Promise<any[]> {
  if (!OPENSTATES_API_KEY) throw new Error("OPENSTATES_API_KEY not set");
  const results: any[] = [];
  let page = 1;
  while (true) {
    const url = `${OPENSTATES_BASE}/people?jurisdiction=md&per_page=50&page=${page}`;
    const res = await fetch(url, { headers: { "X-API-KEY": OPENSTATES_API_KEY } });
    if (!res.ok) throw new Error(`OpenStates API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const pageResults = data.results ?? [];
    if (pageResults.length === 0) break;
    results.push(...pageResults);
    if (pageResults.length < 50) break;
    page++;
  }
  return results;
}

async function main() {
  log("Fetching MD legislators from OpenStates API...");
  const people = await fetchMdLegislatorsFromApi();
  log(`Got ${people.length} legislators`);

  await withClient(DATABASE_URL, async (client) => {
    let updated = 0;
    for (const person of people) {
      const role = person.current_role ?? {};
      const chamber = role.org_classification === "upper" ? "Senate" : role.org_classification === "lower" ? "House of Delegates" : null;
      const district = role.district ? String(role.district) : null;

      await client.query(
        `UPDATE state_legislators
         SET name = $1,
             party = $2,
             chamber = $3,
             district = $4,
             photo_url = $5,
             email = $6,
             raw = $7,
             fetched_at = NOW()
         WHERE id = $8`,
        [
          person.name,
          person.party || null,
          chamber,
          district,
          person.image || null,
          person.email || null,
          JSON.stringify(person),
          person.id,
        ],
      );
      updated++;
    }
    log(`Updated ${updated} legislators`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
