import { describe, expect, it, vi, afterAll, beforeEach } from "vitest";

const ORIGINAL_KEY = process.env.OPENSTATES_API_KEY;
const ORIGINAL_DB_URL = process.env.DATABASE_URL;

vi.hoisted(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
  process.env.OPENSTATES_API_KEY = "test-key";
});

const cacheModule = await import("./stateLegislatorCache");

afterAll(() => {
  process.env.OPENSTATES_API_KEY = ORIGINAL_KEY;
  process.env.DATABASE_URL = ORIGINAL_DB_URL;
});

// Zero-delay withRetry so tests run fast.
vi.mock("./http", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./http")>();
  return {
    ...mod,
    withRetry: async (
      fn: () => Promise<any>,
      maxAttempts: number,
      _baseDelayMs: number,
      shouldRetry?: (err: unknown) => boolean,
    ) => {
      let lastErr: unknown;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (err) {
          lastErr = err;
          if (attempt < maxAttempts && (!shouldRetry || shouldRetry(err))) {
            continue;
          }
          break;
        }
      }
      throw lastErr;
    },
  };
});

describe("openStatesFetch", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await cacheModule.resetRateLimit();
  });

  it("calls fetch with correct URL, headers, and query params", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      } as Response);

    await cacheModule.openStatesFetch("/bills", { jurisdiction: "md", page: 1 });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://v3.openstates.org/bills?jurisdiction=md&page=1");
    expect(init).toMatchObject({
      headers: { "X-API-KEY": "test-key" },
    });
  });

  it("retries on transient 500 errors and then succeeds", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      } as Response);

    await cacheModule.openStatesFetch("/test");
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry on rate limit errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve("rate limit"),
    } as Response);

    await expect(cacheModule.openStatesFetch("/test")).rejects.toThrow(
      "rate limit",
    );
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("records rate limit on 429 and blocks subsequent calls", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve("rate limit exceeded"),
    } as Response);

    // First call should throw with the upstream message
    await expect(cacheModule.openStatesFetch("/test")).rejects.toThrow(
      "rate limit exceeded",
    );

    // The in-memory gate should now be active, blocking further calls
    await expect(cacheModule.openStatesFetch("/test2")).rejects.toThrow(
      "Temporary API request limit is active.",
    );
  });

  it("records rate limit on 403 with rate text and extracts JSON detail", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve('{"detail":"Rate limit hit"}'),
    } as Response);

    await expect(cacheModule.openStatesFetch("/test")).rejects.toThrow(
      "Rate limit hit",
    );
    expect(await cacheModule.isRateLimited()).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("clears the rate-limit gate when resetRateLimit is called", async () => {
    // Block the gate
    await cacheModule.recordRateLimit(429, "blocked");
    expect(await cacheModule.isRateLimited()).toBe(true);

    // Clear it
    await cacheModule.resetRateLimit();
    expect(await cacheModule.isRateLimited()).toBe(false);

    // Calls should proceed again
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    } as Response);

    await expect(cacheModule.openStatesFetch("/test")).resolves.toEqual({
      ok: true,
    });
  });
});
