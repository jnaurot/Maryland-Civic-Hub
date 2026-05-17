import type { ReactNode } from "react";
import { useParams, Link, useSearch } from "wouter";
import {
  useGetStateBillDetail,
  getGetStateBillDetailQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { RepNameLink } from "@/components/RepNameLink";
import { partyColor, SummarySearch } from "@/lib/rep-utils";

type BillActionSummary = {
  date: string;
  text: string;
  type?: string;
  organizationName?: string;
  organizationClassification?: string;
};

type StateBillVoteSummary = {
  date: string;
  startDate?: string;
  chamber?: string;
  organizationName?: string;
  organizationClassification?: string;
  motionText?: string;
  motionClassification?: string[];
  sourceUrl?: string;
  result: string;
  yesCount?: number;
  noCount?: number;
  absentCount?: number;
};

function getActionStage(action: BillActionSummary) {
  const text = `${action.text} ${action.type ?? ""}`.toLowerCase();

  if (text.includes("approved by the governor") || text.includes("signed by governor") || text.includes("became law")) {
    return "Signed/Enacted";
  }
  if (text.includes("passed enrolled") || text.includes("third reading passed") || text.includes("returned passed") || text.includes("final passage")) {
    return "Passed";
  }
  if (/\b(vote|floor|yea|nay|roll)\b/.test(text) || text.includes("third reading")) {
    return "Floor Vote";
  }
  if (text.includes("committee") || text.includes("hearing") || text.includes("referral") || text.includes("referred")) {
    return "Committee";
  }
  if (text.includes("first reading") || text.includes("introduced")) {
    return "Introduced";
  }

  return undefined;
}

function getGovernorApproval(actions?: BillActionSummary[]) {
  const action = (actions ?? []).find((item) => /approved by the governor|signed by governor|became law/i.test(item.text));
  if (!action) return undefined;

  const chapter = action.text.match(/chapter\s+\d+/i)?.[0];
  return {
    date: action.date,
    chapter,
    text: action.text,
  };
}

function formatChamberName(value?: string) {
  if (value === "upper") return "Senate";
  if (value === "lower") return "House";
  return value;
}

function getVoteMotionLabel(vote: StateBillVoteSummary) {
  return vote.motionText?.replace(/^on\s+/i, "").trim();
}

function getReadingOrdinal(text?: string) {
  const match = text?.match(/\b(first|second|third)\s+reading\b/i);
  return match?.[1]?.toLowerCase();
}

function getVoteBodyClassification(vote: StateBillVoteSummary) {
  if (vote.organizationClassification) return vote.organizationClassification;
  if (vote.chamber === "upper" || vote.chamber === "lower") return vote.chamber;

  const sourceUrl = vote.sourceUrl?.toLowerCase();
  if (sourceUrl?.includes("/votes/senate/")) return "upper";
  if (sourceUrl?.includes("/votes/house/")) return "lower";

  const voteTotal = (vote.yesCount ?? 0) + (vote.noCount ?? 0) + (vote.absentCount ?? 0);
  if (voteTotal > 80) return "lower";
  if (voteTotal > 0 && voteTotal <= 60) return "upper";

  return undefined;
}

function findVoteAction(vote: StateBillVoteSummary, actions?: BillActionSummary[]) {
  const motionLabel = getVoteMotionLabel(vote)?.toLowerCase();
  const motionReading = getReadingOrdinal(motionLabel);
  const voteBody = getVoteBodyClassification(vote);
  const candidates = (actions ?? []).filter((action) => {
    const actionBody = action.organizationClassification;
    return !voteBody || !actionBody || actionBody === voteBody;
  });

  if (motionReading) {
    const readingMatch = candidates.find((action) => {
      const text = action.text.toLowerCase();
      return getReadingOrdinal(text) === motionReading && /pass|adopt|fail/i.test(action.text);
    });
    if (readingMatch) return readingMatch;
  }

  if (motionLabel) {
    const motionTerms = motionLabel.split(/\s+/).filter(Boolean);
    const motionMatch = candidates.find((action) => {
      const text = action.text.toLowerCase();
      return motionTerms.every((term) => text.includes(term)) && /pass|adopt|fail/i.test(action.text);
    });
    if (motionMatch) return motionMatch;
  }

  const sameDateMatch = vote.date
    ? candidates.find((action) => action.date === vote.date && getActionStage(action))
    : undefined;
  if (sameDateMatch) return sameDateMatch;

  return undefined;
}

function getVoteDisplay(vote: StateBillVoteSummary, actions?: BillActionSummary[]) {
  const action = findVoteAction(vote, actions);
  const body = vote.organizationName ?? formatChamberName(getVoteBodyClassification(vote) ?? vote.chamber);
  const motion = getVoteMotionLabel(vote);
  const stage = action?.text ?? motion ?? getActionStage(action ?? { date: vote.date, text: "", type: vote.motionClassification?.[0] }) ?? "Vote";
  const date = action?.date ?? vote.date;

  return {
    body,
    stage,
    date,
    actionText: action?.text,
  };
}

function StateBillProgressBar({ actions }: { actions?: { date: string; text: string; type?: string }[] }) {
  const stages = ["Introduced", "Committee", "Floor Vote", "Passed"];
  const actionTexts = (actions ?? []).map((a) => (a.text + " " + (a.type ?? "")).toLowerCase());

  const isReached = (stage: string) => {
    switch (stage) {
      case "Introduced": return true;
      case "Committee": return actionTexts.some((t) => t.includes("committee") || t.includes("referral") || t.includes("hearing"));
      case "Floor Vote": return actionTexts.some((t) => t.includes("vote") || t.includes("passed") || t.includes("reading"));
      case "Passed": return actionTexts.some((t) => t.includes("passed") || t.includes("approved") || t.includes("enacted"));
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

function ResizableDetailCard({
  title,
  children,
  className = "h-56",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`flex min-h-40 max-h-[min(70vh,32rem)] resize-y flex-col overflow-hidden ${className}`}>
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0 pr-3">
        {children}
      </CardContent>
    </Card>
  );
}

export function StateBillDetail() {
  const { billId } = useParams<{ billId: string }>();
  const apiBillId = encodeURIComponent(billId);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const fromPath = params.get("from") ?? "/bills/state";
  const fromName = params.get("name");

  const { data: bill, isLoading } = useGetStateBillDetail(apiBillId, {
    query: {
      enabled: !!apiBillId,
      queryKey: getGetStateBillDetailQueryKey(apiBillId)
    }
  });
  const governorApproval = getGovernorApproval(bill?.actions);

  return (
    <div className="h-full overflow-y-auto bg-muted/20">
      <div className="container mx-auto max-w-4xl px-4 pt-8 pb-[calc(8rem+env(safe-area-inset-bottom))]">
        <Link href={fromPath} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" /> {fromName ? `Back to ${fromName}` : "Back to State Bills"}
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
                  {bill.identifier && <Badge variant="outline" className="font-mono">{bill.identifier}</Badge>}
                  {bill.chamber && (
                    <Badge variant="secondary">
                      {bill.chamber === "upper" ? "Senate" : bill.chamber === "lower" ? "House of Delegates" : bill.chamber}
                    </Badge>
                  )}
                  {bill.session && <Badge variant="secondary">Session {bill.session}</Badge>}
                  {bill.introducedDate && <span className="text-sm text-muted-foreground">Introduced {bill.introducedDate}</span>}
                </div>
                <h1 className="text-2xl font-black leading-tight mb-4">{bill.title}</h1>

                <StateBillProgressBar actions={bill.actions} />

                {bill.status && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <span className="text-muted-foreground font-medium">Status: </span>
                    {governorApproval ? (
                      <>
                        <span>Approved by the Governor</span>
                        <span className="text-muted-foreground"> on {governorApproval.date}</span>
                        {governorApproval.chapter && (
                          <Badge variant="secondary" className="ml-2">{governorApproval.chapter}</Badge>
                        )}
                      </>
                    ) : (
                      bill.status
                    )}
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
                      View on OpenStates <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {bill.summary && <SummarySearch summary={bill.summary} />}

            <div className="grid md:grid-cols-2 gap-6">
              {bill.sponsors && bill.sponsors.length > 0 && (
                <ResizableDetailCard title="Sponsors">
                  <div className="space-y-2">
                    {bill.sponsors.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <RepNameLink name={s.name} openstatesId={s.openstatesId} />
                        {s.party && <Badge className={`text-xs ${partyColor(s.party)}`}>{s.party?.charAt(0)}</Badge>}
                      </div>
                    ))}
                  </div>
                </ResizableDetailCard>
              )}

              {bill.committees && bill.committees.length > 0 && (
                <ResizableDetailCard title="Committees">
                  <div className="space-y-2">
                    {bill.committees.map((c, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium">{c.name}</p>
                        {c.chamber && <p className="text-xs text-muted-foreground">{c.chamber}</p>}
                      </div>
                    ))}
                  </div>
                </ResizableDetailCard>
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
                        <RepNameLink name={s.name} openstatesId={s.openstatesId} />
                        {s.party && <Badge className={`text-xs ${partyColor(s.party)}`}>{s.party?.charAt(0)}</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {bill.votes && bill.votes.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Votes</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {[...bill.votes].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")).map((v, i) => {
                    const voteDisplay = getVoteDisplay(v, bill.actions);

                    return (
                      <div key={i} className="flex flex-col gap-2 border-b pb-3 text-sm last:border-0 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{v.result}</span>
                            {voteDisplay.body && <Badge variant="secondary">{voteDisplay.body}</Badge>}
                            <Badge variant="outline">{voteDisplay.stage}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {voteDisplay.date ? `Legislative history date: ${voteDisplay.date}` : "Vote date: See roll-call source"}
                          </p>
                          {voteDisplay.actionText && voteDisplay.actionText !== voteDisplay.stage && (
                            <p className="text-xs text-muted-foreground">Legislative action: {voteDisplay.actionText}</p>
                          )}
                          {v.sourceUrl && (
                            <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                              Roll-call source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-3 text-xs sm:justify-end">
                          {v.yesCount !== undefined && <span className="text-green-600 font-semibold">Yea: {v.yesCount}</span>}
                          {v.noCount !== undefined && <span className="text-red-600 font-semibold">Nay: {v.noCount}</span>}
                          {v.absentCount !== undefined && <span className="text-muted-foreground">Absent: {v.absentCount}</span>}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {bill.actions && bill.actions.length > 0 && (
              <ResizableDetailCard title="Legislative History" className="h-72 min-h-56">
                <div className="space-y-3">
                  {[...bill.actions].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")).map((a, i) => (
                    <div key={i} className="grid grid-cols-[6rem_1fr] gap-4 text-sm">
                      <span className="text-muted-foreground">{a.date}</span>
                      <span className="min-w-0 leading-snug">{a.text}</span>
                    </div>
                  ))}
                </div>
              </ResizableDetailCard>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">Bill not found.</div>
        )}
      </div>
    </div>
  );
}
