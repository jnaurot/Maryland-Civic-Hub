import { describe, expect, it } from "vitest";
import { STALE_THRESHOLD_MS, OPENSTATES_RATE_LIMIT_BLOCK_MS, STATE_MEMBER_BILLS_CACHE_TTL_MS, CONGRESS_GOV_PAGE_SIZE, MAX_BILL_INGESTION_PAGES, VOTE_INGESTION_CHUNK_SIZE, DEFAULT_RETRY_ATTEMPTS, DEFAULT_RETRY_BASE_DELAY_MS } from "./constants";

describe("shared constants", () => {
  it("STALE_THRESHOLD_MS equals 7 days in ms", () => {
    expect(STALE_THRESHOLD_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("OPENSTATES_RATE_LIMIT_BLOCK_MS is 1 minute", () => {
    expect(OPENSTATES_RATE_LIMIT_BLOCK_MS).toBe(60_000);
  });

  it("STATE_MEMBER_BILLS_CACHE_TTL_MS is 5 minutes", () => {
    expect(STATE_MEMBER_BILLS_CACHE_TTL_MS).toBe(5 * 60 * 1000);
  });

  it("CONGRESS_GOV_PAGE_SIZE is 250", () => {
    expect(CONGRESS_GOV_PAGE_SIZE).toBe(250);
  });

  it("MAX_BILL_INGESTION_PAGES is 200", () => {
    expect(MAX_BILL_INGESTION_PAGES).toBe(200);
  });

  it("VOTE_INGESTION_CHUNK_SIZE is 5", () => {
    expect(VOTE_INGESTION_CHUNK_SIZE).toBe(5);
  });

  it("DEFAULT_RETRY_ATTEMPTS is 3", () => {
    expect(DEFAULT_RETRY_ATTEMPTS).toBe(3);
  });

  it("DEFAULT_RETRY_BASE_DELAY_MS is 2000", () => {
    expect(DEFAULT_RETRY_BASE_DELAY_MS).toBe(2000);
  });

  it("STALE_THRESHOLD_MS is greater than cache TTL", () => {
    expect(STALE_THRESHOLD_MS).toBeGreaterThan(STATE_MEMBER_BILLS_CACHE_TTL_MS);
  });
});
