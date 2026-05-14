const DEFAULT_TIMEOUT_MS = 12_000;

export class UpstreamTimeoutError extends Error {
  constructor(url: string, timeoutMs: number) {
    super(`Upstream request timed out after ${timeoutMs}ms: ${url}`);
    this.name = "UpstreamTimeoutError";
  }
}

export async function fetchWithTimeout(
  input: string | URL | Request,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  let didTimeout = false;
  const timeout = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);
  const url = input instanceof Request ? input.url : String(input);
  const signal = init.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal;

  try {
    return await globalThis.fetch(input, {
      ...init,
      signal,
    });
  } catch (err) {
    if (
      didTimeout &&
      err instanceof DOMException &&
      err.name === "AbortError"
    ) {
      throw new UpstreamTimeoutError(url, timeoutMs);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
