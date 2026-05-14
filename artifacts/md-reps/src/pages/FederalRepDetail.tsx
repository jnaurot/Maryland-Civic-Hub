import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetFederalMember,
  useGetFederalMemberBills,
  useGetFederalMemberHouseVotes,
  useGetFederalMemberSenateVotes,
  useGetFederalMemberCommittees,
  useSearchCandidateFinance,
  useGetCandidateFinance,
  useRefreshFederalMember,
  useRefreshFederalMemberBills,
  getGetFederalMemberQueryKey,
  getGetFederalMemberBillsQueryKey,
  getGetFederalMemberHouseVotesQueryKey,
  getGetFederalMemberSenateVotesQueryKey,
  getGetFederalMemberCommitteesQueryKey,
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
  ExternalLink,
  ChevronLeft,
  Users,
  FileText,
  Vote,
  DollarSign,
  MoreHorizontal,
  RefreshCw,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { RepNameLink } from "@/components/RepNameLink";

function partyColor(party?: string) {
  if (!party) return "bg-gray-100 text-gray-700";
  const p = party.toLowerCase();
  if (p.includes("democrat")) return "bg-blue-600 text-white";
  if (p.includes("republican")) return "bg-red-600 text-white";
  return "bg-gray-200 text-gray-800";
}

function voteColor(voteCast?: string) {
  if (!voteCast) return "text-muted-foreground";
  const v = voteCast.toLowerCase();
  if (v === "yea") return "text-green-600 font-semibold";
  if (v === "nay") return "text-red-600 font-semibold";
  if (v === "present") return "text-yellow-600 font-semibold";
  return "text-muted-foreground"; // Not Voting
}

function voteBadgeClass(voteCast?: string) {
  if (!voteCast) return "bg-gray-100 text-gray-700";
  const v = voteCast.toLowerCase();
  if (v === "yea") return "bg-green-100 text-green-700 border-green-200";
  if (v === "nay") return "bg-red-100 text-red-700 border-red-200";
  if (v === "present") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-muted text-muted-foreground border-muted-foreground/20"; // Not Voting
}

function formatMoney(n?: number) {
  if (!n) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function PolicyAreaChart({
  policyAreas,
  type,
  fullyIngested,
  category,
  categoryTotal,
}: {
  policyAreas?: Array<{ name?: string; count?: number; pct?: number }>;
  type?: "sponsored" | "cosponsored";
  fullyIngested?: boolean;
  category: "all" | "bill" | "resolution" | "amendment" | "other";
  categoryTotal?: number;
}) {
  if (!policyAreas || policyAreas.length === 0) return null;

  const total = policyAreas.reduce((sum, item) => sum + (item.count ?? 0), 0);
  const totalForCategory = categoryTotal ?? total;
  const categoryLabel =
    category === "all"
      ? "legislation records"
      : category === "bill"
        ? "bills"
        : category === "resolution"
          ? "resolutions"
          : category === "amendment"
            ? "amendments"
            : "other items";
  const label =
    type === "cosponsored"
      ? "Cosponsored Legislation Support"
      : "Sponsored Legislation Focus";

  return (
    <div className="shrink-0 mb-4">
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
        {label}
      </p>
      {type === "cosponsored" && (
        <p className="text-[10px] text-muted-foreground mb-2">
          Cosponsored bills may reflect party support patterns more than
          personal legislative priorities.
        </p>
      )}
      <div className="space-y-1.5">
        {policyAreas.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="text-xs w-24 truncate shrink-0" title={item.name}>
              {item.name}
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${item.pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right">
              {item.pct}%
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        Based on {total} of {totalForCategory} {categoryLabel} with policy
        areas.
      </p>
    </div>
  );
}

function BillsList({
  bioguideId,
  memberName,
  billRole,
  onBillRoleChange,
}: {
  bioguideId: string;
  memberName?: string;
  billRole: "sponsored" | "cosponsored";
  onBillRoleChange: (role: "sponsored" | "cosponsored") => void;
}) {
  const queryClient = useQueryClient();
  const [billView, setBillView] = useState<"list" | "breakdown">("list");
  const [category, setCategory] = useState<
    "all" | "bill" | "resolution" | "amendment" | "other"
  >("all");
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 20;

  const queryParams = {
    type: billRole,
    offset,
    limit,
    q: searchQuery || undefined,
    category,
  };
  const { data, isLoading } = useGetFederalMemberBills(
    bioguideId,
    queryParams,
    {
      query: {
        enabled: !!bioguideId,
        queryKey: getGetFederalMemberBillsQueryKey(bioguideId, queryParams),
        refetchInterval: (query) =>
          query.state.data?.fullyIngested === false ? 3000 : false,
      },
    },
  );
  const refreshBillsMutation = useRefreshFederalMemberBills({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [`/api/federal/members/${bioguideId}/bills`],
        });
        toast({
          title: "Legislation refreshed",
          description: "Sponsored legislation is being indexed.",
          duration: 5000,
        });
      },
      onError: (err: any) => {
        toast({
          title: "Refresh failed",
          description: err?.message || "Could not refresh legislation.",
          variant: "destructive",
          duration: 5000,
        });
      },
    },
  });

  const fromParam = memberName
    ? `?from=${encodeURIComponent(`/rep/federal/${bioguideId}`)}&name=${encodeURIComponent(memberName)}`
    : "";
  const categoryOptions: Array<{
    value: typeof category;
    label: string;
    hideWhenZero?: boolean;
  }> = [
    { value: "all", label: "All" },
    { value: "bill", label: "Bills" },
    { value: "resolution", label: "Resolutions" },
    { value: "amendment", label: "Amendments" },
    { value: "other", label: "Other", hideWhenZero: true },
  ];
  const roleLabel =
    billRole === "cosponsored"
      ? "Cosponsored Legislation"
      : "Sponsored Legislation";

  function internalBillHref(bill: {
    number?: string;
    congress?: string;
    itemCategory?: string;
  }) {
    if (
      !bill.number ||
      !bill.congress ||
      !["bill", "resolution"].includes(bill.itemCategory ?? "")
    )
      return null;
    const parts = bill.number.split(" ");
    if (parts.length < 2) return null;
    return `/bills/federal/${bill.congress}/${parts[0].toLowerCase()}/${parts[1]}${fromParam}`;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center shrink-0 pb-4 gap-2 flex-wrap">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={billRole === "sponsored" ? "default" : "outline"}
            onClick={() => {
              onBillRoleChange("sponsored");
              setOffset(0);
            }}
          >
            Sponsored
          </Button>
          <Button
            size="sm"
            variant={billRole === "cosponsored" ? "default" : "outline"}
            onClick={() => {
              onBillRoleChange("cosponsored");
              setOffset(0);
            }}
          >
            Cosponsored
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={billView === "list" ? "default" : "outline"}
            onClick={() => setBillView("list")}
          >
            List
          </Button>
          <Button
            size="sm"
            variant={billView === "breakdown" ? "default" : "outline"}
            onClick={() => setBillView("breakdown")}
          >
            Breakdown
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              refreshBillsMutation.mutate({
                bioguideId,
                data: { type: billRole },
              })
            }
            disabled={refreshBillsMutation.isPending}
            title="Refresh legislation"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshBillsMutation.isPending ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0 pb-4">
        {categoryOptions.map((option) => {
          const count = data?.categoryCounts?.[option.value] ?? 0;
          if (option.hideWhenZero && count === 0) return null;
          return (
            <Button
              key={option.value}
              size="sm"
              variant={category === option.value ? "default" : "outline"}
              onClick={() => {
                setCategory(option.value);
                setOffset(0);
              }}
            >
              {option.label} ({count})
            </Button>
          );
        })}
      </div>
      <div className="relative shrink-0 pb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bills..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOffset(0);
          }}
          className="pl-9"
        />
      </div>

      {billView === "list" ? (
        <>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 shrink-0">
            {roleLabel}
          </p>
          {data?.fullyIngested === false && (
            <p className="text-xs text-amber-600 mb-2 shrink-0">
              Indexing sponsored legislation. Counts may update.
            </p>
          )}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
            {isLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            )}

            {!isLoading && data?.bills?.length === 0 && (
              <p className="text-muted-foreground text-center py-10">
                No bills found.
              </p>
            )}

            {!isLoading &&
              data?.bills?.map((bill) => {
                const href = internalBillHref(bill);
                const card = (
                  <Card
                    className={
                      href
                        ? "hover:border-primary transition-colors cursor-pointer"
                        : "transition-colors"
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {bill.number && (
                              <Badge
                                variant="outline"
                                className="text-xs font-mono shrink-0"
                              >
                                {bill.number}
                              </Badge>
                            )}
                            {bill.itemCategory && (
                              <Badge
                                variant="secondary"
                                className="text-xs capitalize"
                              >
                                {bill.itemCategory}
                              </Badge>
                            )}
                            {bill.chamber && (
                              <Badge variant="secondary" className="text-xs">
                                {bill.chamber}
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-sm line-clamp-2">
                            {bill.title}
                          </p>
                          {bill.latestAction && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {bill.latestAction}
                            </p>
                          )}
                          {!href && bill.url && (
                            <a
                              className="text-xs text-primary mt-2 inline-flex items-center gap-1"
                              href={bill.url.replace(
                                "api.congress.gov/v3",
                                "www.congress.gov",
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {bill.introducedDate && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {bill.introducedDate}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
                return href ? (
                  <Link key={bill.id} href={href}>
                    {card}
                  </Link>
                ) : (
                  <div key={bill.id}>{card}</div>
                );
              })}
          </div>

          {data && (data.totalCount ?? 0) > limit && (
            <div className="flex justify-between items-center pt-6 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {offset + 1}–{Math.min(offset + limit, data.totalCount ?? 0)} of{" "}
                {data.totalCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + limit >= (data.totalCount ?? 0)}
                onClick={() => setOffset(offset + limit)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          )}
          {!isLoading && data?.policyAreas && data.policyAreas.length > 0 && (
            <>
              <PolicyAreaChart
                policyAreas={data.policyAreas}
                type={billRole}
                fullyIngested={data?.fullyIngested}
                category={category}
                categoryTotal={
                  category === "all"
                    ? data.categoryCounts?.all
                    : data.categoryCounts?.[category]
                }
              />
              {data?.fullyIngested === false && (
                <p className="text-xs text-amber-600 mt-2">
                  Breakdown is based on cached legislation so far.
                </p>
              )}
            </>
          )}
          {!isLoading &&
            (!data?.policyAreas || data.policyAreas.length === 0) && (
              <p className="text-muted-foreground text-center py-10">
                No policy area data available.
              </p>
            )}
        </div>
      )}
    </div>
  );
}

function VotesList({
  bioguideId,
  memberChamber,
}: {
  bioguideId: string;
  memberChamber?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<
    "all" | "yea" | "nay" | "present" | "not-voting"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 20;

  const normalizedChamber = memberChamber?.toLowerCase().trim() ?? "";
  const isSenator = normalizedChamber === "senate";
  const isHouse =
    normalizedChamber === "" || normalizedChamber.includes("house");

  const houseParams = { offset, limit, filter, q: searchQuery || undefined };
  const senateParams = { offset, limit, filter, q: searchQuery || undefined };

  const houseQuery = useGetFederalMemberHouseVotes(bioguideId, houseParams, {
    query: {
      enabled: !!bioguideId && isHouse,
      queryKey: getGetFederalMemberHouseVotesQueryKey(bioguideId, houseParams),
    },
  });

  const senateQuery = useGetFederalMemberSenateVotes(bioguideId, senateParams, {
    query: {
      enabled: !!bioguideId && isSenator,
      queryKey: getGetFederalMemberSenateVotesQueryKey(
        bioguideId,
        senateParams,
      ),
    },
  });

  const data = isSenator ? senateQuery.data : houseQuery.data;
  const isLoading = isSenator ? senateQuery.isLoading : houseQuery.isLoading;
  const totalCount = data?.totalCount ?? 0;
  const votes = data?.votes ?? [];

  const voteFilters: { value: typeof filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "yea", label: "Yea" },
    { value: "nay", label: "Nay" },
    { value: "present", label: "Present" },
    { value: "not-voting", label: "Not Voting" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="relative shrink-0 pb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search votes..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOffset(0);
          }}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2 shrink-0 pb-4">
        {voteFilters.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => {
              setFilter(f.value);
              setOffset(0);
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {!isLoading && votes.length === 0 && (
          <p className="text-muted-foreground text-center py-10">
            No voting records found.
          </p>
        )}

        {!isLoading &&
          votes.map((vote: any) => (
            <Card key={vote.rollCallNumber} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {memberChamber ?? "Congress"}
                      </Badge>
                      {(vote.legislationType || vote.documentType) && (
                        <Badge variant="secondary" className="text-xs">
                          {vote.legislationType || vote.documentType}{" "}
                          {vote.legislationNumber || vote.documentNumber}
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm line-clamp-2">
                      {vote.voteTitle ??
                        vote.voteDescription ??
                        "Untitled Vote"}
                    </p>
                    {vote.voteQuestion && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {vote.voteQuestion}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {vote.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs ${voteBadgeClass(vote.voteCast)}`}
                    >
                      {vote.voteCast}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vote.voteResult}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {totalCount > limit && (
        <div className="flex justify-between items-center pt-6 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {offset + 1}–{Math.min(offset + limit, totalCount)} of {totalCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + limit >= totalCount}
            onClick={() => setOffset(offset + limit)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function CommitteesList({ bioguideId }: { bioguideId: string }) {
  const { data, isLoading } = useGetFederalMemberCommittees(bioguideId, {
    query: {
      enabled: !!bioguideId,
      queryKey: getGetFederalMemberCommitteesQueryKey(bioguideId),
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {!isLoading && !data?.committees?.length && (
          <p className="text-muted-foreground text-center py-10">
            No committee memberships found.
          </p>
        )}

        {!isLoading &&
          data?.committees?.map((c, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <div className="flex gap-2">
                  {c.chamber && (
                    <Badge variant="outline" className="text-xs">
                      {c.chamber}
                    </Badge>
                  )}
                  {c.rank && (
                    <Badge variant="secondary" className="text-xs">
                      {c.rank}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              {c.members && c.members.length > 0 && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                    Members
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {c.members.map((m, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                      >
                        <RepNameLink name={m.name} bioguideId={m.bioguideId} />
                        <div className="flex gap-1">
                          {m.party && (
                            <Badge className={`text-xs ${partyColor(m.party)}`}>
                              {m.party?.charAt(0)}
                            </Badge>
                          )}
                          {m.state && (
                            <span className="text-muted-foreground text-xs">
                              {m.state}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
}

function FinanceTab({ name, state }: { name: string; state?: string }) {
  const searchName = name.split(",")[0].trim();
  const { data: searchData, isLoading: searchLoading } =
    useSearchCandidateFinance(
      { name: searchName, state },
      {
        query: {
          enabled: !!name,
          queryKey: getSearchCandidateFinanceQueryKey({
            name: searchName,
            state,
          }),
        },
      },
    );

  const candidateId = searchData?.candidates?.[0]?.id;
  const { data: financeData, isLoading: financeLoading } =
    useGetCandidateFinance(
      candidateId ?? "",
      {},
      {
        query: {
          enabled: !!candidateId,
          queryKey: getGetCandidateFinanceQueryKey(candidateId ?? "", {}),
        },
      },
    );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-1">
        {(searchLoading || financeLoading) && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}

        {!searchLoading && !financeLoading && !candidateId && (
          <div className="text-center py-10 text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No FEC campaign finance records found for this member.</p>
          </div>
        )}

        {!searchLoading && !financeLoading && candidateId && financeData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Total Raised",
                  value: formatMoney(financeData.totalRaised),
                },
                {
                  label: "Total Spent",
                  value: formatMoney(financeData.totalSpent),
                },
                {
                  label: "Cash on Hand",
                  value: formatMoney(financeData.cashOnHand),
                },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-black">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {financeData?.topDonors && financeData.topDonors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Top Donors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {financeData.topDonors.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium">{d.name}</p>
                          {d.type && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {d.type}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-green-700">
                          {formatMoney(d.total)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {financeData?.topIndustries &&
                financeData.topIndustries.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Top Industries
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {financeData.topIndustries.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-1.5 border-b last:border-0"
                        >
                          <p className="text-sm font-medium">{d.name}</p>
                          <span className="text-sm font-bold text-green-700">
                            {formatMoney(d.total)}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function FederalRepDetail() {
  const { bioguideId } = useParams<{ bioguideId: string }>();
  const queryClient = useQueryClient();

  const memberQueryKey = [...getGetFederalMemberQueryKey(bioguideId), "v2"];

  const { data: memberData, isLoading } = useGetFederalMember(bioguideId, {
    query: { enabled: !!bioguideId, queryKey: memberQueryKey },
  });

  const member = memberData?.member;
  const cache = memberData?.cache;

  const [billRole, setBillRole] = useState<"sponsored" | "cosponsored">(
    "sponsored",
  );
  const { data: billSummaryData } = useGetFederalMemberBills(
    bioguideId,
    { type: billRole, offset: 0, limit: 1 },
    {
      query: {
        enabled: !!bioguideId,
        queryKey: getGetFederalMemberBillsQueryKey(bioguideId, {
          type: billRole,
          offset: 0,
          limit: 1,
        }),
      },
    },
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const refreshMutation = useRefreshFederalMember({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Refreshed",
          description: "Member data has been updated.",
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: memberQueryKey });
      },
      onError: (err: any) => {
        toast({
          title: "Refresh failed",
          description: err?.message || "Could not refresh from Congress.gov.",
          variant: "destructive",
          duration: 5000,
        });
      },
    },
  });
  const refreshBillsMutation = useRefreshFederalMemberBills({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [`/api/federal/members/${bioguideId}/bills`],
        });
      },
      onError: (err: any) => {
        toast({
          title: "Legislation refresh failed",
          description: err?.message || "Could not refresh legislation.",
          variant: "destructive",
          duration: 5000,
        });
      },
    },
  });

  const handleRefresh = (e?: React.MouseEvent | React.SyntheticEvent) => {
    if (!bioguideId) return;
    e?.preventDefault?.();
    refreshMutation.mutate({ bioguideId });
    refreshBillsMutation.mutate({ bioguideId, data: { type: billRole } });
  };

  return (
    <div className="h-[calc(100dvh-4rem)] flex flex-col bg-muted/20">
      <div className="container mx-auto px-4 pt-8 max-w-4xl flex flex-col h-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors shrink-0"
        >
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
                  disabled={
                    refreshMutation.isPending || refreshBillsMutation.isPending
                  }
                >
                  {refreshMutation.isPending ||
                  refreshBillsMutation.isPending ? (
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
                    <AvatarImage
                      src={member.photoUrl}
                      alt={member.name}
                      className="object-cover object-top"
                    />
                    <AvatarFallback className="text-2xl">
                      {member.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-black mb-2">
                          {member.name}
                        </h1>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {member.party && (
                            <Badge className={partyColor(member.party)}>
                              {member.party}
                            </Badge>
                          )}
                          {member.chamber && (
                            <Badge variant="outline">{member.chamber}</Badge>
                          )}
                          {member.state && (
                            <Badge variant="secondary">{member.state}</Badge>
                          )}
                          {member.district && (
                            <Badge variant="secondary">
                              District {member.district}
                            </Badge>
                          )}
                        </div>
                        {billSummaryData?.policyAreas &&
                          billSummaryData.policyAreas.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="text-xs text-muted-foreground font-medium">
                                {billRole === "cosponsored"
                                  ? "Top Support Areas"
                                  : "Top Sponsored Issues"}
                                :
                              </span>
                              {billSummaryData.policyAreas
                                .slice(0, 5)
                                .filter((p) => p.name && p.name !== "Other")
                                .map((area) => (
                                  <Badge
                                    key={area.name}
                                    variant="outline"
                                    className="text-xs bg-primary/5 border-primary/20"
                                  >
                                    {area.name}
                                  </Badge>
                                ))}
                            </div>
                          )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {member.phone && <span>{member.phone}</span>}
                          {member.nextElection && (
                            <span>Next election: {member.nextElection}</span>
                          )}
                        </div>
                        {member.website && (
                          <a
                            href={member.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                          >
                            Official Website{" "}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setMenuOpen(false);
                              handleRefresh();
                            }}
                            disabled={
                              refreshMutation.isPending ||
                              refreshBillsMutation.isPending
                            }
                          >
                            <RefreshCw
                              className={`h-4 w-4 mr-2 ${refreshMutation.isPending || refreshBillsMutation.isPending ? "animate-spin" : ""}`}
                            />
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
                <TabsTrigger value="bills" className="flex-1 gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Bills</span>
                </TabsTrigger>
                <TabsTrigger value="votes" className="flex-1 gap-1.5">
                  <Vote className="h-4 w-4" />
                  <span className="hidden sm:inline">Votes</span>
                </TabsTrigger>
                <TabsTrigger value="committees" className="flex-1 gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Committees</span>
                </TabsTrigger>
                <TabsTrigger value="finance" className="flex-1 gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Finance</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="bills"
                className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <BillsList
                  bioguideId={bioguideId}
                  memberName={member.name}
                  billRole={billRole}
                  onBillRoleChange={setBillRole}
                />
              </TabsContent>
              <TabsContent
                value="votes"
                className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <VotesList
                  bioguideId={bioguideId}
                  memberChamber={member.chamber}
                />
              </TabsContent>
              <TabsContent
                value="committees"
                className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <CommitteesList bioguideId={bioguideId} />
              </TabsContent>
              <TabsContent
                value="finance"
                className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <FinanceTab name={member.name ?? ""} state={member.state} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            Member not found.
          </div>
        )}
      </div>
    </div>
  );
}
