import type { Response } from "express";

export function sendInternalError(
  res: Response,
  message = "Request failed. Please try again later.",
) {
  return res.status(500).json({ error: message });
}
