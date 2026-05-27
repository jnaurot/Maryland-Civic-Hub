/**
 * Tests for withRetry — written before implementation (should fail until withRetry is exported).
 *
 * Behaviour spec:
 *   - Resolves on first attempt when fn succeeds
 *   - Retries on error, up to maxAttempts
 *   - Throws the last error after all attempts are exhausted
 *   - Skips retry when shouldRetry(err) returns false
 *   - Stops retrying immediately when shouldRetry returns false mid-sequence
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { withRetry } from "./http";

describe("withRetry", () => {
  afterEach(() => vi.restoreAllMocks());

  // ── Should PASS after implementation ─────────────────────────────────────────

  it("resolves immediately when fn succeeds on the first attempt", async () => {
    const fn = vi.fn().mockResolvedValue("success");
    await expect(withRetry(fn, 3, 0)).resolves.toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries after a transient failure and resolves on the second attempt", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValue("ok");
    await expect(withRetry(fn, 3, 0)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries maxAttempts times then throws the last error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("persistent"));
    await expect(withRetry(fn, 3, 0)).rejects.toThrow("persistent");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry at all when shouldRetry always returns false", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("no-retry"));
    await expect(withRetry(fn, 3, 0, () => false)).rejects.toThrow("no-retry");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("stops retrying when shouldRetry returns false for a specific error type", async () => {
    class FatalError extends Error {}
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockRejectedValueOnce(new FatalError("fatal"));

    await expect(
      withRetry(fn, 5, 0, (err) => !(err instanceof FatalError)),
    ).rejects.toBeInstanceOf(FatalError);

    // Retried once after the transient error, then stopped at FatalError
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("defaults to always retrying when no shouldRetry is provided", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("a"))
      .mockRejectedValueOnce(new Error("b"))
      .mockResolvedValue("done");
    await expect(withRetry(fn, 3, 0)).resolves.toBe("done");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("with maxAttempts=1 never retries — throws immediately on first failure", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("immediate"));
    await expect(withRetry(fn, 1, 0)).rejects.toThrow("immediate");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
