const DEFAULT_TIMEOUT_MS = 12_000;

/**
 * Retry a Promise-returning function up to `maxAttempts` times.
 * Between attempts, waits `baseDelayMs * attemptNumber` ms (exponential-ish back-off).
 * The optional `shouldRetry` predicate lets callers skip retries for specific error
 * types (e.g. ProviderRateLimitError should not be retried).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 2000,
  shouldRetry: (err: unknown) => boolean = () => true,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts && shouldRetry(err)) {
        await new Promise((r) => setTimeout(r, baseDelayMs * attempt));
      } else {
        break;
      }
    }
  }
  throw lastErr;
}

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
