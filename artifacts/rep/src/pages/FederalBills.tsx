import { useEffect, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import {
  useGetFederalBills,
  getGetFederalBillsQueryKey,
  useSearchFederalBills,
  getSearchFederalBillsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ChevronRight, X } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ListViewport } from "@/components/layout/ListViewport";
import { PaginationFooter } from "@/components/layout/PaginationFooter";
import { FilterBar } from "@/components/layout/FilterBar";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";
import { BILL_STAGE_OPTIONS, BILL_STAGE_QUERY_KEYS, billNumberClass, type BillStage } from "@/lib/rep-utils";
import { StatusFilterControls, StatusStagePills } from "@/components/layout/StatusFilterControls";

type Chamber = "both" | "house" | "senate";

export function FederalBills() {
  const pageSearch = useSearch();
  const initialParams = new URLSearchParams(pageSearch);
  const [chamber, setChamber] = useState<Chamber>(() => {
    const v = initialParams.get("chamber");
    return v === "house" || v === "senate" ? v : "both";
  });
  const [offset, setOffset] = useState(() => {
    const raw = Number(initialParams.get("offset") ?? "0");
    return Number.isFinite(raw) && raw >= 0 ? raw : 0;
  });
  const [searchQuery, setSearchQuery] = useState(initialParams.get("q") ?? "");
  const [policyArea, setPolicyArea] = useState(initialParams.get("policyArea") ?? "");
  const [statusEnabled, setStatusEnabled] = useState(
    initialParams.get("status") === "on",
  );
  const [selectedStages, setSelectedStages] = useState<BillStage[]>(() => {
    const raw = initialParams.get("stages");
    if (!raw) return [];
    const parsed = raw.split(",").filter((s): s is BillStage =>
      BILL_STAGE_OPTIONS.includes(s as BillStage),
    );
    return parsed;
  });
  const limit = 20;
  const listViewportRef = useRef<HTMLDivElement | null>(null);
  const restoredScrollRef = useRef(false);

  const stageQuery =
    statusEnabled && selectedStages.length > 0
      ? selectedStages.map((s) => BILL_STAGE_QUERY_KEYS[s]).join(",")
      : undefined;

  const { data, isLoading } = useGetFederalBills(
    { chamber, policyArea, offset, limit, ...(stageQuery ? { stages: stageQuery } : {}) },
    {
      query: {
        queryKey: getGetFederalBillsQueryKey({ chamber, policyArea, offset, limit, stages: stageQuery }),
        placeholderData: (previous) => previous,
      },
    },
  );
  const searchParams = { q: searchQuery, policyArea, offset, limit };
  const { data: searchData, isLoading: isSearchLoading } = useSearchFederalBills(searchParams, {
    query: {
      enabled: searchQuery.length > 0 || !!policyArea,
      queryKey: getSearchFederalBillsQueryKey(searchParams),
      placeholderData: (previous) => previous,
    },
  });

  const handleChamberChange = (v: string) => {
    setChamber(v as Chamber);
    setOffset(0);
  };
  const useSearchResults = searchQuery.length > 0 || !!policyArea;
  const visibleBills = useSearchResults ? (searchData?.bills ?? []) : (data?.bills ?? []);
  const pagedVisibleBills = visibleBills;
  const effectiveTotalCount = useSearchResults ? (searchData?.totalCount ?? 0) : (data?.totalCount ?? 0);
  const loadingBase = useSearchResults ? isSearchLoading : isLoading;
  const statusFilteringLoading = false;
  const backPathParams = new URLSearchParams();
  backPathParams.set("chamber", chamber);
  backPathParams.set("offset", String(offset));
  if (searchQuery) backPathParams.set("q", searchQuery);
  if (policyArea) backPathParams.set("policyArea", policyArea);
  if (statusEnabled) backPathParams.set("status", "on");
  if (selectedStages.length > 0)
    backPathParams.set("stages", selectedStages.join(","));
  const backPath = `/bills/federal?${backPathParams.toString()}`;
  const scrollStorageKey = `scroll:${backPath}:bills`;

  useEffect(() => {
    restoredScrollRef.current = false;
  }, [scrollStorageKey]);

  useEffect(() => {
    if (loadingBase) return;
    if (restoredScrollRef.current) return;
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(scrollStorageKey);
    if (!raw) {
      restoredScrollRef.current = true;
      return;
    }
    const scrollTop = Number(raw);
    if (!Number.isFinite(scrollTop)) {
      restoredScrollRef.current = true;
      return;
    }
    const id = window.requestAnimationFrame(() => {
      if (listViewportRef.current) {
        listViewportRef.current.scrollTop = scrollTop;
      }
      restoredScrollRef.current = true;
    });
    return () => window.cancelAnimationFrame(id);
  }, [loadingBase, scrollStorageKey]);

  return (
    <PageShell contentClassName="pb-4">
        <div className="mb-8 shrink-0 max-sm:mb-5">
          <h1 className="text-4xl font-black mb-2 max-sm:text-3xl">Federal Bills</h1>
          <p className="text-muted-foreground max-sm:hidden">Bills currently being considered in the U.S. Congress</p>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1">
            <GlobalSearchBar
              value={searchQuery}
              onValueChange={(q) => {
                setSearchQuery(q);
                setOffset(0);
              }}
              showResults={false}
            />
          </div>
          <StatusFilterControls
            statusEnabled={statusEnabled}
            onToggleStatus={() => {
              setStatusEnabled((prev) => {
                const next = !prev;
                if (!next) setSelectedStages([]);
                return next;
              });
              setOffset(0);
            }}
          />
        </div>
        {statusEnabled && (
          <StatusStagePills
            selectedStages={selectedStages}
            onToggleStage={(stage) => {
              setSelectedStages((prev) => (prev.includes(stage) ? [] : [stage]));
              setOffset(0);
            }}
          />
        )}

        {policyArea && (
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="flex items-center gap-1.5">
              Policy: {policyArea}
              <button
                type="button"
                onClick={() => {
                  setPolicyArea("");
                  setOffset(0);
                }}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
                aria-label="Clear policy area filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

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
          {effectiveTotalCount !== undefined && (
            <span className="text-sm text-muted-foreground">{effectiveTotalCount.toLocaleString()} bills</span>
          )}
        </FilterBar>

        <ListViewport ref={listViewportRef} className="space-y-3">
          {(loadingBase || statusFilteringLoading) && (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          )}

          {!loadingBase && !statusFilteringLoading && visibleBills.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No bills found{statusEnabled && selectedStages.length > 0 ? " for selected status filters" : policyArea ? ` in policy area "${policyArea}"` : ""}.</p>
            </div>
          )}

          {!loadingBase && !statusFilteringLoading && pagedVisibleBills.map((bill) => {
            const parts = bill.number?.split(" ") ?? [];
            const billType = parts[0]?.toLowerCase() ?? "";
            const billNum = parts[1] ?? "";
            const detailHref = bill.congress && billType && billNum
              ? `/bills/federal/${bill.congress}/${billType}/${billNum}?from=${encodeURIComponent(backPath)}&name=${encodeURIComponent("Federal Bills")}`
              : "#";

            return (
              <Link
                key={bill.id}
                href={detailHref}
                onClick={() => {
                  if (typeof window === "undefined") return;
                  const top = listViewportRef.current?.scrollTop ?? 0;
                  window.sessionStorage.setItem(scrollStorageKey, String(top));
                }}
              >
                <Card className="hover:border-primary transition-colors cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {bill.number && <Badge variant="outline" className={`font-mono text-xs shrink-0 ${billNumberClass(bill.stageDead)}`}>{bill.number}</Badge>}
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
          totalCount={effectiveTotalCount}
          onPrevious={() => setOffset(Math.max(0, offset - limit))}
          onNext={() => setOffset(offset + limit)}
        />
    </PageShell>
  );
}
