import { useParams, Link } from "wouter";
import {
  useGetStateBillDetail,
  getGetStateBillDetailQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { RepNameLink } from "@/components/RepNameLink";

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

function partyColor(party?: string) {
  if (!party) return "bg-gray-100 text-gray-700";
  const p = party.toLowerCase();
  if (p.includes("democrat")) return "bg-blue-600 text-white";
  if (p.includes("republican")) return "bg-red-600 text-white";
  return "bg-gray-200 text-gray-800";
}

export function StateBillDetail() {
  const { billId } = useParams<{ billId: string }>();
  const apiBillId = encodeURIComponent(billId);

  const { data: bill, isLoading } = useGetStateBillDetail(apiBillId, {
    query: {
      enabled: !!apiBillId,
      queryKey: getGetStateBillDetailQueryKey(apiBillId)
    }
  });

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/bills/state" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to State Bills
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
                    {bill.status}
                  </div>
                )}

                {bill.url && (
                  <a href={bill.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3">
                    View on OpenStates <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>

            {bill.summary && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">{bill.summary}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {bill.sponsors && bill.sponsors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sponsors</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {bill.sponsors.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <RepNameLink name={s.name} openstatesId={s.openstatesId} />
                        {s.party && <Badge className={`text-xs ${partyColor(s.party)}`}>{s.party?.charAt(0)}</Badge>}
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
                  {bill.votes.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                      <div>
                        <span className="font-medium">{v.result}</span>
                        {v.chamber && <span className="text-muted-foreground ml-2">({v.chamber})</span>}
                        <span className="text-muted-foreground ml-2">{v.date}</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        {v.yesCount !== undefined && <span className="text-green-600 font-semibold">Yea: {v.yesCount}</span>}
                        {v.noCount !== undefined && <span className="text-red-600 font-semibold">Nay: {v.noCount}</span>}
                        {v.absentCount !== undefined && <span className="text-muted-foreground">Absent: {v.absentCount}</span>}
                      </div>
                    </div>
                  ))}
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
