#!/usr/bin/env tsx
/**
 * Backfill missing summaries + bill text into state_bills.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run backfill:state-bill-text
 */
import { Client } from "pg";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/civic_hub";
const OPENSTATES_DB_URL = process.env.OPENSTATES_DB_URL ?? "postgresql://postgres:postgres@localhost:5432/openstates";
const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? "5000");

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

async function backfillSummaries(source: Client, target: Client) {
  log("=== Backfilling bill summaries ===");

  const { rows: countRow } = await source.query(
    `SELECT COUNT(*) AS cnt FROM opencivicdata_billabstract WHERE abstract IS NOT NULL AND abstract != ''`
  );
  const total = Number(countRow[0]?.cnt ?? 0);
  log(`Found ${total.toLocaleString()} abstracts in source`);

  // Create temp table
  const tmpTable = "tmp_bill_summaries";
  await target.query(`DROP TABLE IF EXISTS ${tmpTable}`);
  await target.query(
    `CREATE TABLE ${tmpTable} (
      bill_id text NOT NULL PRIMARY KEY,
      summary text
    )`
  );

  // Stream abstracts in batches
  let offset = 0;
  let inserted = 0;
  while (offset < total) {
    const { rows } = await source.query(
      `SELECT DISTINCT ON (bill_id) bill_id, abstract FROM opencivicdata_billabstract
       WHERE abstract IS NOT NULL AND abstract != ''
       ORDER BY bill_id, id DESC
       LIMIT $1 OFFSET $2`,
      [BATCH_SIZE, offset]
    );
    if (rows.length === 0) break;

    const values: unknown[] = [];
    const placeholders: string[] = [];
    let paramIdx = 1;

    for (const row of rows) {
      placeholders.push(`($${paramIdx++}, $${paramIdx++})`);
      values.push(row.bill_id, row.abstract);
    }

    await target.query(
      `INSERT INTO ${tmpTable} (bill_id, summary) VALUES ${placeholders.join(",")}
       ON CONFLICT (bill_id) DO UPDATE SET summary = EXCLUDED.summary`,
      values
    );
    inserted += rows.length;
    offset += rows.length;
    if (inserted % 50000 === 0) log(`  ...${inserted.toLocaleString()} summaries staged`);
  }
  log(`Staged ${inserted.toLocaleString()} summaries`);

  // Apply to state_bills
  const updateRes = await target.query(
    `UPDATE state_bills b
     SET summary = bf.summary
     FROM ${tmpTable} bf
     WHERE b.id = bf.bill_id`
  );
  const updated = Number(updateRes?.rowCount ?? 0);
  log(`Updated ${updated.toLocaleString()} bills with summaries`);

  await target.query(`DROP TABLE IF EXISTS ${tmpTable}`);
}

async function backfillText(source: Client, target: Client) {
  log("=== Backfilling bill text ===");

  const { rows: countRow } = await source.query(
    `SELECT COUNT(*) AS cnt FROM opencivicdata_searchablebill WHERE raw_text IS NOT NULL AND raw_text != ''`
  );
  const total = Number(countRow[0]?.cnt ?? 0);
  log(`Found ${total.toLocaleString()} texts in source`);

  // Create temp table
  const tmpTable = "tmp_bill_texts";
  await target.query(`DROP TABLE IF EXISTS ${tmpTable}`);
  await target.query(
    `CREATE TABLE ${tmpTable} (
      bill_id text NOT NULL PRIMARY KEY,
      bill_text text
    )`
  );

  // Stream texts in batches
  let offset = 0;
  let inserted = 0;
  while (offset < total) {
    const { rows } = await source.query(
      `SELECT DISTINCT ON (bill_id) bill_id, raw_text FROM opencivicdata_searchablebill
       WHERE raw_text IS NOT NULL AND raw_text != ''
       ORDER BY bill_id, id DESC
       LIMIT $1 OFFSET $2`,
      [BATCH_SIZE, offset]
    );
    if (rows.length === 0) break;

    const values: unknown[] = [];
    const placeholders: string[] = [];
    let paramIdx = 1;

    for (const row of rows) {
      placeholders.push(`($${paramIdx++}, $${paramIdx++})`);
      values.push(row.bill_id, row.raw_text);
    }

    await target.query(
      `INSERT INTO ${tmpTable} (bill_id, bill_text) VALUES ${placeholders.join(",")}
       ON CONFLICT (bill_id) DO UPDATE SET bill_text = EXCLUDED.bill_text`,
      values
    );
    inserted += rows.length;
    offset += rows.length;
    if (inserted % 50000 === 0) log(`  ...${inserted.toLocaleString()} texts staged`);
  }
  log(`Staged ${inserted.toLocaleString()} texts`);

  // Apply to state_bills
  const updateRes = await target.query(
    `UPDATE state_bills b
     SET text = bf.bill_text
     FROM ${tmpTable} bf
     WHERE b.id = bf.bill_id`
  );
  const updated = Number(updateRes?.rowCount ?? 0);
  log(`Updated ${updated.toLocaleString()} bills with text`);

  await target.query(`DROP TABLE IF EXISTS ${tmpTable}`);
}

async function main() {
  log("=== State Bill Summary + Text Backfill ===");
  log(`Target DB: ${DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, "://***@")}`);
  log(`Source DB: ${OPENSTATES_DB_URL.replace(/:\/\/[^:]+:[^@]+@/, "://***@")}`);

  await withClient(OPENSTATES_DB_URL, async (source) => {
    await withClient(DATABASE_URL, async (target) => {
      await backfillSummaries(source, target);
      log("");
      await backfillText(source, target);
    });
  });

  log("=== Backfill complete ===");
}

main().catch((err) => { console.error(err); process.exit(1); });
