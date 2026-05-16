import type { Response } from "express";

export class ProviderRateLimitError extends Error {
  readonly provider: string;
  readonly retryAfterSeconds: number;
  readonly detail?: string;

  constructor({
    provider,
    detail,
    retryAfterSeconds = 60,
  }: {
    provider: string;
    detail?: string;
    retryAfterSeconds?: number;
  }) {
    super(
      detail
        ? `${provider} rate limit reached: ${detail}`
        : `${provider} rate limit reached. Please try again later.`,
    );
    this.name = "ProviderRateLimitError";
    this.provider = provider;
    this.detail = detail;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function isProviderRateLimitError(err: unknown): err is ProviderRateLimitError {
  return err instanceof ProviderRateLimitError;
}

export function sendInternalError(
  res: Response,
  message = "Request failed. Please try again later.",
) {
  return res.status(500).json({ error: message });
}

export function sendProviderRateLimitError(
  res: Response,
  err: ProviderRateLimitError,
) {
  res.setHeader("Retry-After", String(err.retryAfterSeconds));
  return res.status(429).json({
    error: err.message,
    provider: err.provider,
    detail: err.detail,
    retryAfterSeconds: err.retryAfterSeconds,
  });
}
