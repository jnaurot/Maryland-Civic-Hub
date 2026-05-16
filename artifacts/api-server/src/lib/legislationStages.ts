export const LEGISLATION_STAGE_KEYS = [
  "introduced",
  "committee",
  "floor_vote",
  "passed",
  "signed_enacted",
  "dead",
] as const;

export type LegislationStageKey = (typeof LEGISLATION_STAGE_KEYS)[number];

export type LegislationStageFlags = Record<LegislationStageKey, boolean>;

export const EMPTY_STAGE_FLAGS: LegislationStageFlags = {
  introduced: false,
  committee: false,
  floor_vote: false,
  passed: false,
  signed_enacted: false,
  dead: false,
};

export function computeLegislationStageFlags({
  latestAction,
  status,
  introducedDate,
}: {
  latestAction?: string | null;
  status?: string | null;
  introducedDate?: string | null;
}): LegislationStageFlags {
  const text = `${latestAction ?? ""} ${status ?? ""}`.toLowerCase();
  const introduced = !!introducedDate || text.length >= 0;
  const committee = /(committee|referred|reported)/i.test(text);
  const floorVote = /\b(roll|yea|nay|vote|floor)\b|agreed to/i.test(text);
  const signedOrEnacted =
    /(signed|became public law|became law|public law|enacted|approved by the governor)/i.test(text);
  const passed =
    signedOrEnacted ||
    /(passed house|passed senate|passed\/agreed|agreed to in house|agreed to in senate|passed by|passed enrolled|returned passed|third reading passed|adopted|adopted by)/i.test(
      text,
    );
  const dead =
    /(died|dead|failed|vetoed|tabled indefinitely|indefinitely postponed|withdrawn)/i.test(
      text,
    );

  return {
    introduced,
    committee,
    floor_vote: floorVote,
    passed,
    signed_enacted: signedOrEnacted,
    dead,
  };
}

export function parseStageQuery(raw?: string | null): LegislationStageKey[] {
  if (!raw) return [];
  const allowed = new Set<string>(LEGISLATION_STAGE_KEYS);
  return raw
    .split(",")
    .map((stage) => stage.trim())
    .filter((stage): stage is LegislationStageKey => allowed.has(stage));
}
