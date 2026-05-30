#!/usr/bin/env tsx
/**
 * Backfill missing votes + real committee names into state_bills.raw.
 *
 * Votes come from opencivicdata_voteevent + votecount + votesource.
 * Committees come from opencivicdata_billactionrelatedentity.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run backfill:state-bill-votes
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

async function backfillVotes(source: Client, target: Client) {
  log("=== Backfilling bill votes ===");

  const { rows: countRow } = await source.query(
    `SELECT COUNT(*) AS cnt FROM opencivicdata_voteevent WHERE bill_id IS NOT NULL`
  );
  const total = Number(countRow[0]?.cnt ?? 0);
  log(`Found ${total.toLocaleString()} vote events in source`);

  // Create temp table for votes grouped by bill
  const tmpTable = "tmp_bill_votes";
  await target.query(`DROP TABLE IF EXISTS ${tmpTable}`);
  await target.query(
    `CREATE TABLE ${tmpTable} (
      bill_id text NOT NULL PRIMARY KEY,
      votes jsonb
    )`
  );

  // Stream vote events in batches
  let offset = 0;
  let processed = 0;
  while (offset < total) {
    const { rows } = await source.query(
      `SELECT ve.id, ve.bill_id, ve.motion_text, ve.result, ve.start_date,
              ve.motion_classification, ve.order,
              o.name AS org_name, o.classification AS org_classification,
              vc.option, vc.value,
              vs.url AS source_url, vs.note AS source_note
       FROM opencivicdata_voteevent ve
       LEFT JOIN opencivicdata_organization o ON ve.organization_id = o.id
       LEFT JOIN opencivicdata_votecount vc ON vc.vote_event_id = ve.id
       LEFT JOIN opencivicdata_votesource vs ON vs.vote_event_id = ve.id
       ORDER BY ve.bill_id, ve.id
       LIMIT $1 OFFSET $2`,
      [BATCH_SIZE, offset]
    );
    if (rows.length === 0) break;

    // Group rows by bill_id
    const votesByBill = new Map<string, Map<string, any>>();
    for (const row of rows) {
      let billMap = votesByBill.get(row.bill_id);
      if (!billMap) {
        billMap = new Map();
        votesByBill.set(row.bill_id, billMap);
      }

      let vote = billMap.get(row.id);
      if (!vote) {
        vote = {
          id: row.id,
          motion_text: row.motion_text,
          result: row.result,
          start_date: row.start_date,
          date: row.start_date,
          motion_classification: row.motion_classification,
          order: row.order,
          organization: row.org_name ? { name: row.org_name, classification: row.org_classification } : null,
          chamber: row.org_classification,
          counts: [],
          sources: [],
        };
        billMap.set(row.id, vote);
      }

      if (row.option != null && row.value != null) {
        vote.counts.push({ option: row.option, value: row.value });
      }
      if (row.source_url) {
        const already = vote.sources.find((s: any) => s.url === row.source_url);
        if (!already) vote.sources.push({ url: row.source_url, note: row.source_note });
      }
    }

    // Insert into temp table
    const values: unknown[] = [];
    const placeholders: string[] = [];
    let paramIdx = 1;

    for (const [billId, billMap] of votesByBill) {
      const votes = Array.from(billMap.values());
      placeholders.push(`($${paramIdx++}, $${paramIdx++})`);
      values.push(billId, JSON.stringify(votes));
    }

    if (placeholders.length > 0) {
      await target.query(
        `INSERT INTO ${tmpTable} (bill_id, votes) VALUES ${placeholders.join(",")}
         ON CONFLICT (bill_id) DO UPDATE SET votes = EXCLUDED.votes`,
        values
      );
    }

    processed += rows.length;
    offset += rows.length;
    if (processed % 50000 === 0) log(`  ...${processed.toLocaleString()} vote rows staged (${votesByBill.size} bills)`);
  }

  // Count staged bills
  const { rows: stagedRow } = await target.query(`SELECT COUNT(*) AS cnt FROM ${tmpTable}`);
  const staged = Number(stagedRow[0]?.cnt ?? 0);
  log(`Staged ${staged.toLocaleString()} bills with votes`);

  // Apply to state_bills — merge votes into raw
  const updateRes = await target.query(
    `UPDATE state_bills b
     SET raw = b.raw || jsonb_build_object('votes', bf.votes)
     FROM ${tmpTable} bf
     WHERE b.id = bf.bill_id`
  );
  const updated = Number(updateRes?.rowCount ?? 0);
  log(`Updated ${updated.toLocaleString()} bills with votes`);

  await target.query(`DROP TABLE IF EXISTS ${tmpTable}`);
}

async function backfillCommittees(source: Client, target: Client) {
  log("=== Backfilling real committee names ===");

  // Fetch committee names from bill action related entities
  const { rows: countRow } = await source.query(
    `SELECT COUNT(DISTINCT bill_id) AS cnt
     FROM opencivicdata_billaction a
     JOIN opencivicdata_billactionrelatedentity re ON re.action_id = a.id
     WHERE re.entity_type = 'organization' AND re.name IS NOT NULL AND re.name != ''`
  );
  const total = Number(countRow[0]?.cnt ?? 0);
  log(`Found ${total.toLocaleString()} bills with committee entities`);

  const tmpTable = "tmp_bill_committees";
  await target.query(`DROP TABLE IF EXISTS ${tmpTable}`);
  await target.query(
    `CREATE TABLE ${tmpTable} (
      bill_id text NOT NULL PRIMARY KEY,
      committees jsonb
    )`
  );

  let offset = 0;
  let processed = 0;
  while (offset < total) {
    const { rows } = await source.query(
      `SELECT DISTINCT a.bill_id, re.name, o.classification
       FROM opencivicdata_billaction a
       JOIN opencivicdata_billactionrelatedentity re ON re.action_id = a.id
       LEFT JOIN opencivicdata_organization o ON re.organization_id = o.id
       WHERE re.entity_type = 'organization' AND re.name IS NOT NULL AND re.name != ''
       ORDER BY a.bill_id
       LIMIT $1 OFFSET $2`,
      [BATCH_SIZE, offset]
    );
    if (rows.length === 0) break;

    // Group by bill
    const committeesByBill = new Map<string, Set<string>>();
    for (const row of rows) {
      let set = committeesByBill.get(row.bill_id);
      if (!set) {
        set = new Set();
        committeesByBill.set(row.bill_id, set);
      }
      const key = JSON.stringify({ name: row.name, chamber: row.classification });
      set.add(key);
    }

    // Insert into temp table
    const values: unknown[] = [];
    const placeholders: string[] = [];
    let paramIdx = 1;

    for (const [billId, set] of committeesByBill) {
      const committees = Array.from(set).map((s) => JSON.parse(s));
      placeholders.push(`($${paramIdx++}, $${paramIdx++})`);
      values.push(billId, JSON.stringify(committees));
    }

    if (placeholders.length > 0) {
      await target.query(
        `INSERT INTO ${tmpTable} (bill_id, committees) VALUES ${placeholders.join(",")}
         ON CONFLICT (bill_id) DO UPDATE SET committees = EXCLUDED.committees`,
        values
      );
    }

    processed += rows.length;
    offset += rows.length;
    if (processed % 50000 === 0) log(`  ...${processed.toLocaleString()} committee rows staged`);
  }

  const { rows: stagedRow } = await target.query(`SELECT COUNT(*) AS cnt FROM ${tmpTable}`);
  const staged = Number(stagedRow[0]?.cnt ?? 0);
  log(`Staged ${staged.toLocaleString()} bills with committees`);

  // Apply to state_bills — merge committees into raw
  const updateRes = await target.query(
    `UPDATE state_bills b
     SET raw = b.raw || jsonb_build_object('committees', bf.committees)
     FROM ${tmpTable} bf
     WHERE b.id = bf.bill_id`
  );
  const updated = Number(updateRes?.rowCount ?? 0);
  log(`Updated ${updated.toLocaleString()} bills with committees`);

  await target.query(`DROP TABLE IF EXISTS ${tmpTable}`);
}

async function main() {
  log("=== State Bill Votes + Committees Backfill ===");
  log(`Target DB: ${DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, "://***@")}`);
  log(`Source DB: ${OPENSTATES_DB_URL.replace(/:\/\/[^:]+:[^@]+@/, "://***@")}`);

  await withClient(OPENSTATES_DB_URL, async (source) => {
    await withClient(DATABASE_URL, async (target) => {
      await backfillVotes(source, target);
      log("");
      await backfillCommittees(source, target);
    });
  });

  log("=== Backfill complete ===");
}

main().catch((err) => { console.error(err); process.exit(1); });
