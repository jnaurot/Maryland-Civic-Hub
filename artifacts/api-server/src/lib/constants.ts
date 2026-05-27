/** Stale threshold: data older than this should be refreshed from upstream APIs. */
export const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

/** How long an OpenStates rate-limit block lasts (1 minute). */
export const OPENSTATES_RATE_LIMIT_BLOCK_MS = 60_000;

/** TTL for in-memory state member bills cache. */
export const STATE_MEMBER_BILLS_CACHE_TTL_MS = 5 * 60 * 1000;

/** Congress.gov API page size. */
export const CONGRESS_GOV_PAGE_SIZE = 250;

/** Safety cap for bill ingestion pagination. */
export const MAX_BILL_INGESTION_PAGES = 200;

/** Number of concurrent vote fetches per batch. */
export const VOTE_INGESTION_CHUNK_SIZE = 5;

/** Default retry count for API calls. */
export const DEFAULT_RETRY_ATTEMPTS = 3;

/** Base delay in ms between retry attempts. */
export const DEFAULT_RETRY_BASE_DELAY_MS = 2000;
