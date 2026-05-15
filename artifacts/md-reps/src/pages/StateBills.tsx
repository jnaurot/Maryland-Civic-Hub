import { useState } from "react";
import { Link } from "wouter";
import {
  useGetStateBills,
  getGetStateBillsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ChevronRight } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { US_STATES, getStateName } from "@/lib/states";
import { PageShell } from "@/components/layout/PageShell";
import { ListViewport } from "@/components/layout/ListViewport";
import { PaginationFooter } from "@/components/layout/PaginationFooter";
import { FilterBar } from "@/components/layout/FilterBar";

type Chamber = "upper" | "lower" | "all";

export function StateBills() {
  const { selectedState, setSelectedState } = useAppState();
  const [chamber, setChamber] = useState<Chamber>("all");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const stateCode = selectedState;
  const stateName = getStateName(stateCode);

  const params = chamber === "all"
    ? { offset, limit, jurisdiction: stateCode?.toLowerCase() ?? "md" }
    : { chamber: chamber as "upper" | "lower", offset, limit, jurisdiction: stateCode?.toLowerCase() ?? "md" };

  const { data, isLoading, error } = useGetStateBills(params, {
    query: { queryKey: getGetStateBillsQueryKey(params), enabled: !!stateCode }
  });

  const handleChamberChange = (v: string) => {
    setChamber(v as Chamber);
    setOffset(0);
  };

  if (!stateCode) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2">State Bills</h1>
            <p className="text-muted-foreground">Bills being considered in state legislatures across the country</p>
          </div>

          <div className="text-center py-20 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-4">Select a state to view state legislation.</p>
            <Select value={selectedState ?? ""} onValueChange={(v) => setSelectedState(v || null)}>
              <SelectTrigger className="w-56 mx-auto">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageShell contentClassName="pb-4">
        <div className="mb-8 shrink-0">
          <h1 className="text-4xl font-black mb-2">{stateName} State Bills</h1>
          <p className="text-muted-foreground">Bills being considered in the {stateName} legislature</p>
        </div>

        <FilterBar className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
          <Select value={chamber} onValueChange={handleChamberChange}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter by chamber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chambers</SelectItem>
              <SelectItem value="upper">Senate</SelectItem>
              <SelectItem value="lower">House of Delegates</SelectItem>
            </SelectContent>
          </Select>
          {data?.totalCount !== undefined && (
            <span className="text-sm text-muted-foreground">{data.totalCount.toLocaleString()} bills</span>
          )}
        </FilterBar>

        <ListViewport className="space-y-3">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          )}

          {!isLoading && (error || data?.bills?.length === 0) && (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{error ? `State legislative data is not available for ${stateName}.` : "No bills found."}</p>
            </div>
          )}

          {!isLoading && data?.bills?.map((bill) => (
            <Link key={bill.id} href={`/bills/state/${encodeURIComponent(bill.id)}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {bill.identifier && <Badge variant="outline" className="font-mono text-xs shrink-0">{bill.identifier}</Badge>}
                        {bill.chamber && (
                          <Badge variant="secondary" className="text-xs">
                            {bill.chamber === "upper" ? "Senate" : bill.chamber === "lower" ? "House of Delegates" : bill.chamber}
                          </Badge>
                        )}
                        {bill.session && <span className="text-xs text-muted-foreground">Session {bill.session}</span>}
                        {bill.introducedDate && <span className="text-xs text-muted-foreground">Introduced {bill.introducedDate}</span>}
                      </div>
                      <p className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{bill.title}</p>
                      {bill.latestAction && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">Latest: {bill.latestAction}</p>
                      )}
                      {bill.sponsors && bill.sponsors.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Sponsor{bill.sponsors.length > 1 ? "s" : ""}: {bill.sponsors.slice(0, 2).join(", ")}
                          {bill.sponsors.length > 2 && ` +${bill.sponsors.length - 2} more`}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
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
    </PageShell>
  );
}
