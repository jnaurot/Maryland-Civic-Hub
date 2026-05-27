export function getApiErrorStatus(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status?: unknown }).status)
    : undefined;
}

export function getApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null && "error" in data) {
      const message = (data as { error?: unknown }).error;
      if (typeof message === "string" && message.trim()) return message;
    }
  }
  return error instanceof Error ? error.message : "Request failed. Please try again later.";
}
