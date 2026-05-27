/** Shared route path builders — use these instead of hand-building URL strings. */

export function federalRepPath(bioguideId: string): string {
  return `/rep/federal/${bioguideId}`;
}

export function stateRepPath(memberId: string): string {
  return `/rep/state/${encodeURIComponent(memberId)}`;
}

export function federalBillPath(congress: string | number, billType: string, billNumber: string): string {
  return `/bills/federal/${congress}/${billType.toLowerCase()}/${billNumber}`;
}

export function stateBillPath(billId: string): string {
  return `/bills/state/${encodeURIComponent(billId)}`;
}

/** Build the `?from=...&name=...` query string for back-navigation on bill cards. */
export function billFromParam(backPath: string, name: string): string {
  return `?from=${encodeURIComponent(backPath)}&name=${encodeURIComponent(name)}`;
}
