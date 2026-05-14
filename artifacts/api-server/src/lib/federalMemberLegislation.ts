export type FederalLegislationCategory =
  | "all"
  | "bill"
  | "resolution"
  | "amendment"
  | "other";

export type FederalLegislationRole = "sponsor" | "cosponsor";

export interface CongressMemberLegislationItem {
  amendmentNumber?: string | number | null;
  congress?: string | number | null;
  introducedDate?: string | null;
  latestAction?: { actionDate?: string | null; text?: string | null } | null;
  number?: string | number | null;
  policyArea?: { name?: string | null } | null;
  title?: string | null;
  type?: string | null;
  url?: string | null;
}

function parseAmendmentType(url: string | null | undefined): string | null {
  const match = url?.match(/\/amendment\/\d+\/([^/?]+)\//i);
  return match?.[1]?.toUpperCase() ?? null;
}

export function classifyFederalLegislationItem(
  item: CongressMemberLegislationItem,
): Exclude<FederalLegislationCategory, "all"> {
  const type = item.type?.toUpperCase() ?? "";
  if (item.amendmentNumber || item.url?.includes("/amendment/")) {
    return "amendment";
  }
  if (type === "HR" || type === "S") return "bill";
  if (type.includes("RES")) return "resolution";
  return "other";
}

export function getFederalLegislationItemId(
  item: CongressMemberLegislationItem,
): string {
  const url = item.url?.replace(/\?format=json$/i, "");
  if (url) return url;

  const congress = item.congress != null ? String(item.congress) : "unknown";
  if (item.type && item.number) {
    return `${congress}-${String(item.type).toLowerCase()}-${item.number}`;
  }
  if (item.amendmentNumber) {
    return `${congress}-amendment-${item.amendmentNumber}`;
  }
  return `${congress}-unknown-${JSON.stringify(item)}`;
}

export function getFederalLegislationDisplayNumber(
  item: CongressMemberLegislationItem,
): string | undefined {
  if (item.type && item.number) return `${item.type} ${item.number}`;

  if (item.amendmentNumber) {
    const amendmentType = parseAmendmentType(item.url);
    return amendmentType
      ? `${amendmentType} ${item.amendmentNumber}`
      : `Amendment ${item.amendmentNumber}`;
  }

  return undefined;
}

export function getFederalLegislationTitle(
  item: CongressMemberLegislationItem,
): string {
  if (item.title) return item.title;
  const displayNumber = getFederalLegislationDisplayNumber(item);
  if (displayNumber) return displayNumber;
  return "Untitled sponsored legislation";
}

export function mapFederalLegislationForResponse(row: {
  itemId: string;
  title: string;
  number: string | null;
  congress: string | null;
  introducedDate: string | null;
  latestAction: string | null;
  latestActionDate: string | null;
  policyArea: string | null;
  url: string | null;
  category: string;
  type: string | null;
}) {
  return {
    id: row.itemId,
    title: row.title,
    number: row.number ?? undefined,
    congress: row.congress ?? undefined,
    introducedDate: row.introducedDate ?? undefined,
    latestAction: row.latestAction ?? undefined,
    latestActionDate: row.latestActionDate ?? undefined,
    policyArea: row.policyArea ?? undefined,
    url: row.url ?? undefined,
    itemCategory: row.category,
    legislationType: row.type ?? undefined,
    chamber: row.type?.startsWith("H")
      ? "House"
      : row.type?.startsWith("S")
        ? "Senate"
        : undefined,
  };
}

export function shouldResumeMemberLegislationIngestion({
  cachedCount,
  cacheStatus,
  active,
}: {
  cachedCount: number;
  cacheStatus?: { fullyIngested: boolean } | null;
  active: boolean;
}): boolean {
  if (active) return false;
  if (cachedCount === 0) return false;
  return !cacheStatus || !cacheStatus.fullyIngested;
}
