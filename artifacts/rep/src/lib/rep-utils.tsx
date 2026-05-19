import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, X, Search } from "lucide-react";

export const BILL_STAGE_OPTIONS = [
  "Introduced",
  "Committee",
  "Floor Vote",
  "Passed",
  "Signed/Enacted",
  "Dead",
] as const;

export type BillStage = (typeof BILL_STAGE_OPTIONS)[number];

export const BILL_STAGE_QUERY_KEYS: Record<BillStage, string> = {
  Introduced: "introduced",
  Committee: "committee",
  "Floor Vote": "floor_vote",
  Passed: "passed",
  "Signed/Enacted": "signed_enacted",
  Dead: "dead",
};

export function getBillStageMatches({
  latestAction,
  status,
  introducedDate,
}: {
  latestAction?: string | null;
  status?: string | null;
  introducedDate?: string | null;
}): Record<BillStage, boolean> {
  const text = `${latestAction ?? ""} ${status ?? ""}`.toLowerCase();
  const introduced = !!introducedDate || text.length >= 0;
  const committee = /(committee|referred|reported)/i.test(text);
  const floorVote = /(roll|yea|nay|vote|agreed to|floor)/i.test(text);
  const signedOrEnacted =
    /(signed|became public law|became law|public law|enacted)/i.test(text);
  const passed =
    signedOrEnacted ||
    /(passed house|passed senate|passed\/agreed|agreed to in house|agreed to in senate|passed by|adopted|adopted by)/i.test(
      text,
    );
  const dead =
    /(died|dead|failed|vetoed|tabled indefinitely|indefinitely postponed|withdrawn)/i.test(
      text,
    );

  return {
    Introduced: introduced,
    Committee: committee,
    "Floor Vote": floorVote,
    Passed: passed,
    "Signed/Enacted": signedOrEnacted,
    Dead: dead,
  };
}

export function partyColor(party?: string) {
  if (!party) return "bg-gray-100 text-gray-700";
  const p = party.toLowerCase();
  if (p.includes("democrat")) return "bg-blue-600 text-white";
  if (p.includes("republican")) return "bg-red-600 text-white";
  return "bg-gray-200 text-gray-800";
}

export function voteColor(voteCast?: string) {
  if (!voteCast) return "text-muted-foreground";
  const v = voteCast.toLowerCase();
  if (v === "yea") return "text-green-600 font-semibold";
  if (v === "nay") return "text-red-600 font-semibold";
  if (v === "present") return "text-yellow-600 font-semibold";
  return "text-muted-foreground";
}

export function voteBadgeClass(voteCast?: string) {
  if (!voteCast) return "bg-gray-100 text-gray-700";
  const v = voteCast.toLowerCase();
  if (v === "yea") return "bg-green-100 text-green-700 border-green-200";
  if (v === "nay") return "bg-red-100 text-red-700 border-red-200";
  if (v === "present") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-muted text-muted-foreground border-muted-foreground/20";
}

export function formatMoney(n?: number) {
  if (!n) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function HighlightedSummary({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <span className="text-sm leading-relaxed text-muted-foreground">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-yellow-200 text-foreground rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export function SummarySearch({ summary }: { summary: string }) {
  const [query, setQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    if (!query.trim()) return 0;
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return (summary.match(regex) || []).length;
  }, [summary, query]);

  const scrollToMatch = useCallback((index: number) => {
    const marks = containerRef.current?.querySelectorAll("mark");
    if (!marks || marks.length === 0) return;
    const clamped = ((index % marks.length) + marks.length) % marks.length;
    setCurrentMatch(clamped);
    (marks[clamped] as HTMLElement)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handlePrev = () => scrollToMatch(currentMatch - 1);
  const handleNext = () => scrollToMatch(currentMatch + 1);

  useEffect(() => {
    if (matches > 0) scrollToMatch(0);
  }, [matches, query, scrollToMatch]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">Summary</CardTitle>
          <div className="flex items-center gap-2">
            {query && (
              <>
                <span className="text-xs text-muted-foreground">
                  {matches > 0 ? `${currentMatch + 1} of ${matches}` : "0 matches"}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={matches === 0} onClick={handlePrev}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={matches === 0} onClick={handleNext}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setQuery(""); setCurrentMatch(0); }}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Find in summary..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCurrentMatch(0); }}
                className="pl-8 h-8 text-sm w-48"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0" ref={containerRef}>
        <HighlightedSummary text={summary} query={query} />
      </CardContent>
    </Card>
  );
}
