export function shouldRefetchField({
  fetchedAt,
  billUpdateDate,
}: {
  fetchedAt: Date | null | undefined;
  billUpdateDate: string | null | undefined;
}): boolean {
  if (!fetchedAt) return true;
  if (!billUpdateDate) return false;
  return new Date(billUpdateDate) > fetchedAt;
}
