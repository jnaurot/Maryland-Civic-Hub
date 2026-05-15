import { useEffect, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import {
  useGetStateBills,
  getGetStateBillsQueryKey,
  useSearchStateBills,
  getSearchStateBillsQueryKey,
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
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";
import { BILL_STAGE_OPTIONS, type BillStage, getBillStageMatches } from "@/lib/rep-utils";
import { StatusFilterControls, StatusStagePills } from "@/components/layout/StatusFilterControls";
import { useStatusFilteredList } from "@/hooks/useStatusFilteredList";

type Chamber = "upper" | "lower" | "all";

export function StateBills() {
  const pageSearch = useSearch();
  const initialParams = new URLSearchParams(pageSearch);
  const { selectedState, setSelectedState } = useAppState();
  const [chamber, setChamber] = useState<Chamber>(() => {
    const v = initialParams.get("chamber");
    return v === "upper" || v === "lower" ? v : "all";
  });
  const [offset, setOffset] = useState(() => {
    const raw = Number(initialParams.get("offset") ?? "0");
    return Number.isFinite(raw) && raw >= 0 ? raw : 0;
  });
  const [searchQuery, setSearchQuery] = useState(initialParams.get("q") ?? "");
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

  const stateCode = selectedState;
  const stateName = getStateName(stateCode);

  const params = chamber === "all"
    ? { offset, limit, jurisdiction: stateCode?.toLowerCase() ?? "md" }
    : { chamber: chamber as "upper" | "lower", offset, limit, jurisdiction: stateCode?.toLowerCase() ?? "md" };

  const { data, isLoading, error } = useGetStateBills(params, {
    query: {
      queryKey: getGetStateBillsQueryKey(params),
      enabled: !!stateCode,
      placeholderData: (previous) => previous,
    }
  });
  const searchParams = { q: searchQuery, jurisdiction: stateCode?.toLowerCase() ?? "md", offset, limit };
  const { data: searchData, isLoading: isSearchLoading } = useSearchStateBills(searchParams, {
    query: {
      enabled: !!stateCode && searchQuery.length > 0,
      queryKey: getSearchStateBillsQueryKey(searchParams),
      placeholderData: (previous) => previous,
    },
  });

  const handleChamberChange = (v: string) => {
    setChamber(v as Chamber);
    setOffset(0);
  };
  const baseBills = searchQuery.length > 0 ? (searchData?.bills ?? []) : (data?.bills ?? []);
  const totalCountBase = searchQuery.length > 0 ? (searchData?.totalCount ?? 0) : (data?.totalCount ?? 0);
  const loadingBase = searchQuery.length > 0 ? isSearchLoading : isLoading;
  const {
    visibleItems: visibleBills,
    pagedItems: pagedVisibleBills,
    effectiveTotalCount,
    refining: statusFilteringLoading,
  } = useStatusFilteredList<any>({
    statusEnabled,
    selectedStages,
    baseItems: baseBills,
    matchItem: (bill, stages) => {
      const matches = getBillStageMatches({
        latestAction: bill.latestAction,
        status: bill.status,
        introducedDate: bill.introducedDate,
      });
      return stages.some((stage) => matches[stage]);
    },
    offset,
    limit,
    totalCountBase,
    onResetOffset: () => setOffset(0),
    fetchAllItems: stateCode
      ? async () => {
          const pageSize = 100;
          const chamberParam = chamber !== "all" ? `&chamber=${chamber}` : "";
          const jurisdictionParam = `&jurisdiction=${encodeURIComponent(
            stateCode.toLowerCase(),
          )}`;
          const queryParam = searchQuery
            ? `&q=${encodeURIComponent(searchQuery)}`
            : "";
          const endpoint = searchQuery.length > 0
            ? "/api/state/bills/search"
            : "/api/state/bills";
          const base = `${endpoint}?limit=${pageSize}${jurisdictionParam}${chamberParam}${queryParam}`;
          const firstRes = await fetch(`${base}&offset=0`);
          if (!firstRes.ok) throw new Error("Failed to load filtered bills");
          const firstJson = await firstRes.json();
          const total = Number(firstJson.totalCount ?? 0);
          let all = [...(firstJson.bills ?? [])];
          for (
            let nextOffset = pageSize;
            nextOffset < total;
            nextOffset += pageSize
          ) {
            const res = await fetch(`${base}&offset=${nextOffset}`);
            if (!res.ok) break;
            const json = await res.json();
            all = all.concat(json.bills ?? []);
          }
          return all;
        }
      : undefined,
    immediateWhileRefining: true,
    isBaseLoading: loadingBase,
    deps: [stateCode, chamber, searchQuery],
  });
  const backPathParams = new URLSearchParams();
  backPathParams.set("chamber", chamber);
  backPathParams.set("offset", String(offset));
  if (searchQuery) backPathParams.set("q", searchQuery);
  if (statusEnabled) backPathParams.set("status", "on");
  if (selectedStages.length > 0)
    backPathParams.set("stages", selectedStages.join(","));
  const backPath = `/bills/state?${backPathParams.toString()}`;
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

  if (!stateCode) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2 max-sm:text-3xl">State Bills</h1>
            <p className="text-muted-foreground">Bills being considered in state legislatures across the country</p>
          </div>

          <div className="text-center py-20 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-4">Select a state to view state legislation.</p>
            <Select value={selectedState ?? ""} onValueChange={(v) => setSelectedState(v || null)}>
              <SelectTrigger className="w-full max-w-56 mx-auto">
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
        <div className="mb-8 shrink-0 max-sm:mb-5">
          <h1 className="text-4xl font-black mb-2 max-sm:text-3xl">{stateName} State Bills</h1>
          <p className="text-muted-foreground max-sm:hidden">Bills being considered in the {stateName} legislature</p>
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
              setSelectedStages((prev) =>
                prev.includes(stage)
                  ? prev.filter((s) => s !== stage)
                  : [...prev, stage],
              );
              setOffset(0);
            }}
          />
        )}

        <FilterBar className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
          <Select value={chamber} onValueChange={handleChamberChange}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filter by chamber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chambers</SelectItem>
              <SelectItem value="upper">Senate</SelectItem>
              <SelectItem value="lower">House of Delegates</SelectItem>
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

          {!loadingBase && !statusFilteringLoading && (error || visibleBills.length === 0) && (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{error ? `State legislative data is not available for ${stateName}.` : `No bills found${statusEnabled && selectedStages.length > 0 ? " for selected status filters" : ""}.`}</p>
            </div>
          )}

          {!loadingBase && !statusFilteringLoading && pagedVisibleBills.map((bill) => (
            <Link
              key={bill.id}
              href={`/bills/state/${encodeURIComponent(bill.id)}?from=${encodeURIComponent(backPath)}&name=${encodeURIComponent(`${stateName} State Bills`)}`}
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
          totalCount={effectiveTotalCount}
          onPrevious={() => setOffset(Math.max(0, offset - limit))}
          onNext={() => setOffset(offset + limit)}
        />
    </PageShell>
  );
}
