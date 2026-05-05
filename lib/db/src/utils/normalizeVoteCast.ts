export function normalizeVoteCast(vote: string | null | undefined): string {
  const v = (vote ?? "").trim();

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
