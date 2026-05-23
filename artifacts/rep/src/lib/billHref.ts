export function buildFederalBillHref(
  bill: { number?: string; congress?: string; itemCategory?: string },
  fromParam = "",
): string | null {
  if (!bill.number || !bill.congress) return null;
  if (bill.itemCategory === "amendment") return null;
  const parts = bill.number.split(" ");
  if (parts.length < 2) return null;
  return `/bills/federal/${bill.congress}/${parts[0].toLowerCase()}/${parts[1]}${fromParam}`;
}
