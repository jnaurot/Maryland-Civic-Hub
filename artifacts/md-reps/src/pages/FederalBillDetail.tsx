import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useParams, Link, useSearch } from "wouter";
import {
  useGetFederalBillDetail,
  getGetFederalBillDetailQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink, CheckCircle2, Circle, Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { RepNameLink } from "@/components/RepNameLink";

function HighlightedSummary({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  // split with a capturing group produces: [before, match, between, match, after]
  // odd indices are always the matched query segments
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

function SummarySearch({ summary }: { summary: string }) {
  const [query, setQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const markRefs = useRef<HTMLSpanElement[]>([]);

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

function BillProgressBar({ actions }: { actions?: { date: string; text: string; type?: string }[] }) {
  const stages = ["Introduced", "Committee", "Floor Vote", "Passed", "Signed"];
  const actionTexts = (actions ?? []).map((a) => a.text.toLowerCase());

  const isReached = (stage: string) => {
    switch (stage) {
      case "Introduced": return true;
      case "Committee": return actionTexts.some((t) => t.includes("committee") || t.includes("referred"));
      case "Floor Vote": return actionTexts.some((t) => t.includes("vote") || t.includes("passed") || t.includes("agreed"));
      case "Passed": return actionTexts.some((t) => t.includes("passed") || t.includes("agreed to"));
      case "Signed": return actionTexts.some((t) => t.includes("signed") || t.includes("became law"));
      default: return false;
    }
  };

  return (
    <div className="flex items-center gap-0 mt-4 mb-6">
      {stages.map((stage, i) => {
        const reached = isReached(stage);
        return (
          <div key={stage} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {reached
                ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                : <Circle className="h-5 w-5 text-muted-foreground/30" />}
              <span className={`text-[10px] mt-1 text-center leading-tight ${reached ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {stage}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 -mt-4 ${isReached(stages[i + 1]) ? "bg-green-600" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function partyColor(party?: string) {
  if (!party) return "bg-gray-100 text-gray-700";
  const p = party.toLowerCase();
  if (p.includes("democrat")) return "bg-blue-600 text-white";
  if (p.includes("republican")) return "bg-red-600 text-white";
  return "bg-gray-200 text-gray-800";
}

export function FederalBillDetail() {
  const { congress, billType, billNumber } = useParams<{ congress: string; billType: string; billNumber: string }>();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const fromPath = params.get("from") ?? "/bills/federal";
  const fromName = params.get("name");

  const { data: bill, isLoading } = useGetFederalBillDetail(congress, billType, billNumber, {
    query: {
      enabled: !!congress && !!billType && !!billNumber,
      queryKey: getGetFederalBillDetailQueryKey(congress, billType, billNumber)
    }
  });

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href={fromPath} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" /> {fromName ? `Back to ${fromName}` : "Back to Federal Bills"}
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : bill ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {bill.number && <Badge variant="outline" className="font-mono">{bill.number}</Badge>}
                  {bill.congress && <Badge variant="secondary">{bill.congress}th Congress</Badge>}
                  {bill.introducedDate && <span className="text-sm text-muted-foreground">Introduced {bill.introducedDate}</span>}
                </div>
                <h1 className="text-2xl font-black leading-tight mb-4">{bill.title}</h1>

                <BillProgressBar actions={bill.actions} />

                {bill.latestAction && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <span className="text-muted-foreground font-medium">Latest action: </span>
                    {bill.latestAction}
                    {bill.latestActionDate && <span className="text-muted-foreground"> ({bill.latestActionDate})</span>}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mt-3">
                  {bill.textUrl && (
                    <a href={bill.textUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      Read full text <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {bill.url && (
                    <a href={bill.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      View on Congress.gov <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {bill.summary && <SummarySearch summary={bill.summary} />}

            <div className="grid md:grid-cols-2 gap-6">
              {bill.sponsors && bill.sponsors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Sponsor{bill.sponsors.length > 1 ? "s" : ""}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {bill.sponsors.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <RepNameLink name={s.name} bioguideId={s.bioguideId} />
                        <div className="flex gap-1">
                          {s.party && <Badge className={`text-xs ${partyColor(s.party)}`}>{s.party?.charAt(0)}</Badge>}
                          {s.state && <span className="text-xs text-muted-foreground">{s.state}</span>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {bill.committees && bill.committees.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Committees</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {bill.committees.map((c, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium">{c.name}</p>
                        {c.chamber && <p className="text-xs text-muted-foreground">{c.chamber}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {bill.cosponsors && bill.cosponsors.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Cosponsors ({bill.cosponsors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {bill.cosponsors.map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <RepNameLink name={s.name} bioguideId={s.bioguideId} />
                        <div className="flex gap-1 items-center">
                          {s.party && <Badge className={`text-xs ${partyColor(s.party)}`}>{s.party?.charAt(0)}</Badge>}
                          {s.state && <span className="text-xs text-muted-foreground">{s.state}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {bill.actions && bill.actions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Legislative History</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {bill.actions.map((a, i) => (
                      <div key={i} className="flex gap-4 text-sm">
                        <span className="text-muted-foreground shrink-0 w-24">{a.date}</span>
                        <span className="leading-snug">{a.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">Bill not found.</div>
        )}
      </div>
    </div>
  );
}
