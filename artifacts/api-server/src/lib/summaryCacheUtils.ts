export function shouldFetchSummary({
  summaryFetchedAt,
  billUpdateDate,
}: {
  summaryFetchedAt: Date | null | undefined;
  billUpdateDate: string | null | undefined;
}): boolean {
  if (!summaryFetchedAt) return true;
  if (!billUpdateDate) return false;
  return new Date(billUpdateDate) > summaryFetchedAt;
}
