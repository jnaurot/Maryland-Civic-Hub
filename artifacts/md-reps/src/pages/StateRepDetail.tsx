import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import {
  useGetStateMember,
  useGetStateMemberBills,
  useGetStateMemberVotes,
  useSearchCandidateFinance,
  useGetCandidateFinance,
  useRefreshStateMember,
  getGetStateMemberQueryKey,
  getGetStateMemberBillsQueryKey,
  getGetStateMemberVotesQueryKey,
  getSearchCandidateFinanceQueryKey,
  getGetCandidateFinanceQueryKey,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  Users,
  FileText,
  Vote,
  DollarSign,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { partyColor, voteColor, formatMoney } from "@/lib/rep-utils";
import { PageShell } from "@/components/layout/PageShell";
import { ListViewport } from "@/components/layout/ListViewport";
import { PaginationFooter } from "@/components/layout/PaginationFooter";
import { FilterBar } from "@/components/layout/FilterBar";

function StateBillsList({ memberId, jurisdiction, memberName }: { memberId: string; jurisdiction?: string; memberName?: string }) {
  const [type, setType] = useState<"sponsored" | "cosponsored">("sponsored");
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 20;

  const queryParams = { type, jurisdiction, offset, limit, q: searchQuery || undefined };
  const { data, isLoading } = useGetStateMemberBills(memberId, queryParams, {
    query: { enabled: !!memberId, queryKey: getGetStateMemberBillsQueryKey(memberId, queryParams) }
  });

  const fromParam = memberName ? `?from=${encodeURIComponent(`/rep/state/${memberId}`)}&name=${encodeURIComponent(memberName)}` : "";

  return (
    <div className="flex flex-col h-full pb-4">
      <FilterBar className="flex justify-between items-center gap-2 flex-wrap">
        <div className="flex gap-2">
          <Button size="sm" variant={type === "sponsored" ? "default" : "outline"} onClick={() => { setType("sponsored"); setOffset(0); }}>Sponsored</Button>
          <Button size="sm" variant={type === "cosponsored" ? "default" : "outline"} onClick={() => { setType("cosponsored"); setOffset(0); }}>Cosponsored</Button>
        </div>
      </FilterBar>
      <FilterBar className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bills..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setOffset(0); }}
          className="pl-9"
        />
      </FilterBar>

      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 shrink-0">
        {type === "cosponsored" ? "Cosponsored Bills" : "Sponsored Bills"}
      </p>
      <ListViewport className="space-y-3">
        {isLoading && <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>}

        {!isLoading && data?.bills?.length === 0 && (
          <p className="text-muted-foreground text-center py-10">No bills found.</p>
        )}

        {!isLoading && data?.bills?.map((bill) => (
          <Link key={bill.id} href={`/bills/state/${encodeURIComponent(bill.id)}${fromParam}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {bill.identifier && <Badge variant="outline" className="text-xs font-mono shrink-0">{bill.identifier}</Badge>}
                      {bill.chamber && <Badge variant="secondary" className="text-xs">{bill.chamber}</Badge>}
                    </div>
                    <p className="font-medium text-sm line-clamp-2">{bill.title}</p>
                    {bill.latestAction && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{bill.latestAction}</p>}
                  </div>
                  {bill.introducedDate && <span className="text-xs text-muted-foreground shrink-0">{bill.introducedDate}</span>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </ListViewport>

      <PaginationFooter
        offset={offset}
        limit={limit}
        totalCount={data?.totalCount ?? 0}
        onPrevious={() => setOffset(Math.max(0, offset - limit))}
        onNext={() => setOffset(offset + limit)}
      />
    </div>
  );
}

function StateVotesList({ memberId, jurisdiction }: { memberId: string; jurisdiction?: string }) {
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<"all" | "yea" | "nay" | "present" | "not-voting">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 20;

  const queryParams = { jurisdiction, offset, limit, filter, q: searchQuery || undefined };
  const { data, isLoading } = useGetStateMemberVotes(memberId, queryParams, {
    query: { enabled: !!memberId, queryKey: getGetStateMemberVotesQueryKey(memberId, queryParams) }
  });

  const voteFilters: { value: typeof filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "yea", label: "Yea" },
    { value: "nay", label: "Nay" },
    { value: "present", label: "Present" },
    { value: "not-voting", label: "Not Voting" },
  ];

  return (
    <div className="flex flex-col h-full">
      <FilterBar className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search votes..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setOffset(0); }}
          className="pl-9"
        />
      </FilterBar>
      <FilterBar className="flex flex-wrap gap-2">
        {voteFilters.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => { setFilter(f.value); setOffset(0); }}
          >
            {f.label}
          </Button>
        ))}
      </FilterBar>

      <ListViewport className="space-y-3">
        {isLoading && <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>}

        {!isLoading && !data?.votes?.length && (
          <p className="text-muted-foreground text-center py-10">No voting records found.</p>
        )}

        {!isLoading && data?.votes?.map((vote, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {vote.billIdentifier && <Badge variant="outline" className="text-xs font-mono mb-1">{vote.billIdentifier}</Badge>}
                  <p className="font-medium text-sm line-clamp-2">{vote.billTitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${voteColor(vote.position)}`}>{vote.position}</p>
                  <p className="text-xs text-muted-foreground">{vote.date}</p>
                </div>
              </div>
              {vote.result && <p className="text-xs text-muted-foreground mt-2 border-t pt-2">Result: {vote.result}</p>}
            </CardContent>
          </Card>
        ))}
      </ListViewport>

      <PaginationFooter
        offset={offset}
        limit={limit}
        totalCount={data?.totalCount ?? 0}
        onPrevious={() => setOffset(Math.max(0, offset - limit))}
        onNext={() => setOffset(offset + limit)}
      />
    </div>
  );
}

function StateFinanceTab({ name, state }: { name: string; state?: string }) {
  const { data: searchData, isLoading: searchLoading } = useSearchCandidateFinance({ name, state }, {
    query: { enabled: !!name, queryKey: getSearchCandidateFinanceQueryKey({ name, state }) }
  });

  const candidateId = searchData?.candidates?.[0]?.id;
  const { data: financeData, isLoading: financeLoading } = useGetCandidateFinance(candidateId ?? "", {}, {
    query: { enabled: !!candidateId, queryKey: getGetCandidateFinanceQueryKey(candidateId ?? "", {}) }
  });

  return (
    <div className="flex flex-col h-full">
      <ListViewport className="space-y-6">
        {(searchLoading || financeLoading) && <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>}

        {!searchLoading && !financeLoading && !candidateId && (
          <div className="text-center py-10 text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No FEC campaign finance records found for this member.</p>
            <p className="text-sm mt-2">State legislators may not have federal FEC filings.</p>
          </div>
        )}

        {!searchLoading && !financeLoading && candidateId && financeData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Raised", value: formatMoney(financeData.totalRaised) },
                { label: "Total Spent", value: formatMoney(financeData.totalSpent) },
                { label: "Cash on Hand", value: formatMoney(financeData.cashOnHand) },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-black">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {financeData?.topDonors && financeData.topDonors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Donors</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {financeData.topDonors.map((d, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{d.name}</p>
                          {d.type && <p className="text-xs text-muted-foreground capitalize">{d.type}</p>}
                        </div>
                        <span className="text-sm font-bold text-green-700">{formatMoney(d.total)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {financeData?.topIndustries && financeData.topIndustries.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Industries</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {financeData.topIndustries.map((d, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <p className="text-sm font-medium">{d.name}</p>
                        <span className="text-sm font-bold text-green-700">{formatMoney(d.total)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </ListViewport>
    </div>
  );
}

function CommitteesFromBills() {
  return (
    <div className="flex flex-col h-full">
      <ListViewport>
        <div className="text-center py-10 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Committee memberships for state legislators are available through the state legislature website.</p>
        </div>
      </ListViewport>
    </div>
  );
}

export function StateRepDetail() {
  const { memberId } = useParams<{ memberId: string }>();
  const apiMemberId = encodeURIComponent(memberId);

  const { data: memberData, isLoading } = useGetStateMember(apiMemberId, {
    query: { enabled: !!apiMemberId, queryKey: getGetStateMemberQueryKey(apiMemberId) }
  });

  const member = memberData?.legislator;
  const cache = memberData?.cache;

  const [menuOpen, setMenuOpen] = useState(false);

  const refreshMutation = useRefreshStateMember({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Refreshed",
          description: "Legislator data has been updated.",
          duration: 5000,
        });
      },
      onError: (err: Error) => {
        toast({
          title: "Refresh failed",
          description: err.message || "Could not refresh from OpenStates.",
          variant: "destructive",
          duration: 5000,
        });
      },
    },
  });

  useEffect(() => {
    if (cache?.refreshFailed) {
      toast({
        title: "Data may be outdated",
        description: "Could not refresh from OpenStates. Showing cached data.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [cache?.refreshFailed]);

  const handleRefresh = (e?: React.MouseEvent | React.SyntheticEvent) => {
    if (!apiMemberId) return;
    e?.preventDefault?.();
    refreshMutation.mutate({ memberId: apiMemberId });
  };

  return (
    <PageShell>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors shrink-0">
          <ChevronLeft className="h-4 w-4" /> Back to search
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        ) : member ? (
          <>
            {cache?.stale && (
              <div className="mb-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="flex-1">Data may be outdated.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                  onClick={handleRefresh}
                  disabled={refreshMutation.isPending}
                >
                  {refreshMutation.isPending ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            )}

            <Card className="mb-6 shrink-0">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <Avatar className="h-24 w-24 border-2 border-muted shrink-0">
                    <AvatarImage src={member.photoUrl} alt={member.name} className="object-cover object-top" />
                    <AvatarFallback className="text-2xl">{member.name?.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-black mb-2">{member.name}</h1>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {member.party && <Badge className={partyColor(member.party)}>{member.party}</Badge>}
                          {member.chamber && <Badge variant="outline">{member.chamber}</Badge>}
                          {member.district && <Badge variant="secondary">District {member.district}</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {member.email && <a href={`mailto:${member.email}`} className="hover:text-foreground transition-colors">{member.email}</a>}
                          {member.phone && <span>{member.phone}</span>}
                        </div>
                        {member.openstatesUrl && (
                          <a href={member.openstatesUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                            OpenStates Profile <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setMenuOpen(false); handleRefresh(); }} disabled={refreshMutation.isPending}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
                            Refresh data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="bills" className="flex flex-col flex-1 min-h-0">
              <TabsList className="w-full mb-6 shrink-0">
                <TabsTrigger value="bills" className="flex-1 gap-1.5"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Bills</span></TabsTrigger>
                <TabsTrigger value="votes" className="flex-1 gap-1.5"><Vote className="h-4 w-4" /><span className="hidden sm:inline">Votes</span></TabsTrigger>
                <TabsTrigger value="committees" className="flex-1 gap-1.5"><Users className="h-4 w-4" /><span className="hidden sm:inline">Committees</span></TabsTrigger>
                <TabsTrigger value="finance" className="flex-1 gap-1.5"><DollarSign className="h-4 w-4" /><span className="hidden sm:inline">Finance</span></TabsTrigger>
              </TabsList>

              <TabsContent value="bills" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col"><StateBillsList memberId={apiMemberId} jurisdiction={member.jurisdiction} memberName={member.name} /></TabsContent>
              <TabsContent value="votes" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col"><StateVotesList memberId={apiMemberId} jurisdiction={member.jurisdiction} /></TabsContent>
              <TabsContent value="committees" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col"><CommitteesFromBills /></TabsContent>
              <TabsContent value="finance" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col"><StateFinanceTab name={member.name ?? ""} state={member.state} /></TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">Member not found.</div>
        )}
    </PageShell>
  );
}
