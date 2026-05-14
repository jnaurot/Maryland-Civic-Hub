import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout, UpstreamTimeoutError } from "./http";

describe("fetchWithTimeout", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("delegates to global fetch and returns the response", async () => {
    const response = new Response("ok", { status: 200 });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    await expect(fetchWithTimeout("https://example.test")).resolves.toBe(
      response,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.test",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("turns aborts into upstream timeout errors", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
    );

    const assertion = expect(
      fetchWithTimeout("https://slow.example.test", {}, 50),
    ).rejects.toBeInstanceOf(UpstreamTimeoutError);
    await vi.advanceTimersByTimeAsync(50);

    await assertion;
  });
});
