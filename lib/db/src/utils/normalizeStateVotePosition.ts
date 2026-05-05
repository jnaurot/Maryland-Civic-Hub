export function normalizeStateVotePosition(value: unknown): string {
  const v = String(value ?? "").trim().toLowerCase();

  if (["yes", "yea", "aye", "for"].includes(v)) return "Yea";
  if (["no", "nay", "against"].includes(v)) return "Nay";
  if (["present"].includes(v)) return "Present";

  if (
    ["not voting", "absent", "excused", "no vote", "not recorded"].includes(v)
  ) {
    return "Not Voting";
  }

  return "Other";
}
