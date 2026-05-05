export function normalizeVoteCast(vote: string | null | undefined): string {
  const v = (vote ?? "").trim();
  const lower = v.toLowerCase();

  if (lower === "yes" || lower === "aye" || lower === "yea") return "Yea";
  if (lower === "no" || lower === "nay") return "Nay";
  if (lower === "present") return "Present";
  if (
    lower === "not voting" ||
    lower === "not_voting" ||
    lower === "absent" ||
    lower === "other"
  ) {
    return "Not Voting";
  }

  // Existing federal variants
  if (
    v === "Not Voting" ||
    v === "Absent" ||
    v === "No Vote" ||
    v === "Not Recorded"
  ) {
    return "Not Voting";
  }

  return v;
}
