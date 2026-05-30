#!/usr/bin/env tsx
/**
 * Batch-fetch and cache all state legislator photos.
 *
 * For each legislator with a photo_url:
 *   1. Try to fetch the photo. If valid → cache locally.
 *   2. If dead → try OpenStates API for a fresh photo_url.
 *   3. If still no valid photo → clear photo_url in DB.
 *
 * Rate-limit protection:
 *   - 200 ms delay between requests.
 *   - Stops immediately on 429, resumes after Retry-After.
 */
import { Client } from "pg";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/civic_hub";
const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;
const DELAY_MS = Number(process.env.DELAY_MS ?? "200");

const PHOTO_CACHE_DIR = resolve(
  process.env.PHOTO_CACHE_DIR || "../artifacts/api-server",
  ".member-photo-cache",
);

function safeKey(key: string): string {
  return key.replace(/[/\\]/g, "_");
}

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

async function cachePhoto(key: string, buffer: Buffer, contentType: string) {
  const safe = safeKey(key);
  await mkdir(PHOTO_CACHE_DIR, { recursive: true });
  await writeFile(resolve(PHOTO_CACHE_DIR, `${safe}.bin`), buffer);
  await writeFile(
    resolve(PHOTO_CACHE_DIR, `${safe}.meta.json`),
    JSON.stringify({ url: "cached", contentType }),
  );
}

async function fetchPhoto(url: string): Promise<{ ok: boolean; buffer?: Buffer; contentType?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timeout);
    if (!res.ok) return { ok: false };
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return { ok: false };
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0) return { ok: false };
    return { ok: true, buffer, contentType };
  } catch {
    return { ok: false };
  }
}

async function fetchOpenStatesPerson(personId: string): Promise<any | null> {
  if (!OPENSTATES_API_KEY) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(`https://v3.openstates.org/people/${personId}`, {
      headers: { "X-API-KEY": OPENSTATES_API_KEY },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("retry-after") ?? "60");
      log(`  OpenStates rate limited (429). Sleeping ${retryAfter}s...`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return fetchOpenStatesPerson(personId);
    }
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function main() {
  if (!OPENSTATES_API_KEY) {
    log("OPENSTATES_API_KEY not set. Exiting.");
    process.exit(1);
  }

  log("=== State Legislator Photo Batch Fetch ===");
  log(`Target DB: ${DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, "://***@")}`);
  log(`Cache dir: ${PHOTO_CACHE_DIR}`);
  log(`Delay: ${DELAY_MS}ms between requests`);

  await withClient(DATABASE_URL, async (client) => {
    const { rows } = await client.query(
      `SELECT id, photo_url FROM state_legislators WHERE photo_url IS NOT NULL ORDER BY id`,
    );
    log(`Found ${rows.length} legislators with photo URLs`);

    let cached = 0;
    let refreshed = 0;
    let cleared = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i++) {
      const { id, photo_url } = rows[i];
      const label = `${i + 1}/${rows.length}`;

      // 1. Try existing URL
      const result = await fetchPhoto(photo_url);
      if (result.ok && result.buffer) {
        await cachePhoto(id, result.buffer, result.contentType!);
        cached++;
        if (cached % 100 === 0) log(`  ${label} cached ${cached} photos`);
        await new Promise((r) => setTimeout(r, DELAY_MS));
        continue;
      }

      // 2. URL dead → try OpenStates for fresh URL
      log(`  ${label} photo dead for ${id}, trying OpenStates...`);
      const person = await fetchOpenStatesPerson(id);
      const freshUrl = person?.image ?? null;

      if (freshUrl && freshUrl !== photo_url) {
        const freshResult = await fetchPhoto(freshUrl);
        if (freshResult.ok && freshResult.buffer) {
          await cachePhoto(id, freshResult.buffer, freshResult.contentType!);
          await client.query(
            `UPDATE state_legislators SET photo_url = $1 WHERE id = $2`,
            [freshUrl, id],
          );
          refreshed++;
          log(`  ${label} refreshed photo for ${id}`);
          await new Promise((r) => setTimeout(r, DELAY_MS));
          continue;
        }
      }

      // 3. Still no valid photo → clear DB
      await client.query(
        `UPDATE state_legislators SET photo_url = NULL WHERE id = $1`,
        [id],
      );
      cleared++;
      if (cleared % 100 === 0) log(`  ${label} cleared ${cleared} dead URLs`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }

    log(`=== Done ===`);
    log(`Cached:   ${cached}`);
    log(`Refreshed: ${refreshed}`);
    log(`Cleared:  ${cleared}`);
    log(`Failed:   ${failed}`);
  });
}

main().catch((err) => { console.error(err); process.exit(1); });
