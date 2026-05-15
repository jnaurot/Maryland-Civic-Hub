import { useState } from "react";
import { Link } from "wouter";
import {
  useGetFederalBills,
  getGetFederalBillsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ListViewport } from "@/components/layout/ListViewport";
import { PaginationFooter } from "@/components/layout/PaginationFooter";
import { FilterBar } from "@/components/layout/FilterBar";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";

type Chamber = "both" | "house" | "senate";

export function FederalBills() {
  const [chamber, setChamber] = useState<Chamber>("both");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, isLoading } = useGetFederalBills({ chamber, offset, limit }, {
    query: { queryKey: getGetFederalBillsQueryKey({ chamber, offset, limit }) }
  });

  const handleChamberChange = (v: string) => {
    setChamber(v as Chamber);
    setOffset(0);
  };

  return (
    <PageShell contentClassName="pb-4">
        <div className="mb-8 shrink-0 max-sm:mb-5">
          <h1 className="text-4xl font-black mb-2 max-sm:text-3xl">Federal Bills</h1>
          <p className="text-muted-foreground max-sm:hidden">Bills currently being considered in the U.S. Congress</p>
        </div>

        <GlobalSearchBar />

        <FilterBar className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
          <Select value={chamber} onValueChange={handleChamberChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by chamber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Both Chambers</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="senate">Senate</SelectItem>
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

          {!isLoading && data?.bills?.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No bills found.</p>
            </div>
          )}

          {!isLoading && data?.bills?.map((bill) => {
            const parts = bill.number?.split(" ") ?? [];
            const billType = parts[0]?.toLowerCase() ?? "";
            const billNum = parts[1] ?? "";
            const detailHref = bill.congress && billType && billNum
              ? `/bills/federal/${bill.congress}/${billType}/${billNum}`
              : "#";

            return (
              <Link key={bill.id} href={detailHref}>
                <Card className="hover:border-primary transition-colors cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {bill.number && <Badge variant="outline" className="font-mono text-xs shrink-0">{bill.number}</Badge>}
                          {bill.chamber && <Badge variant="secondary" className="text-xs">{bill.chamber}</Badge>}
                          {bill.introducedDate && <span className="text-xs text-muted-foreground">Introduced {bill.introducedDate}</span>}
                        </div>
                        <p className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{bill.title}</p>
                        {bill.latestAction && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                            Latest: {bill.latestAction}
                            {bill.latestActionDate && ` (${bill.latestActionDate})`}
                          </p>
                        )}
                        {bill.sponsors && bill.sponsors.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">Sponsor: {bill.sponsors[0]}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
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
