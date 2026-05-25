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
import { FileText, ChevronRight, AlertTriangle } from "lucide-react";

function getApiErrorStatus(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status?: unknown }).status)
    : undefined;
}

function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null && "error" in data) {
      return String((data as { error?: unknown }).error);
    }
  }
  return "Search is temporarily unavailable. Please try again later.";
}
import { useAppState } from "@/lib/app-state";
import { US_STATES, getStateName } from "@/lib/states";
import { PageShell } from "@/components/layout/PageShell";
import { ListViewport } from "@/components/layout/ListViewport";
import { PaginationFooter } from "@/components/layout/PaginationFooter";
import { FilterBar } from "@/components/layout/FilterBar";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";
import { BILL_STAGE_OPTIONS, BILL_STAGE_QUERY_KEYS, billNumberClass, type BillStage } from "@/lib/rep-utils";
import { StatusFilterControls, StatusStagePills } from "@/components/layout/StatusFilterControls";

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
  const statusFilterActive = statusEnabled && selectedStages.length > 0;
  const stageQuery = statusFilterActive
    ? selectedStages.map((stage) => BILL_STAGE_QUERY_KEYS[stage]).join(",")
    : undefined;

  const params = chamber === "all"
    ? { offset, limit, jurisdiction: stateCode?.toLowerCase(), stages: stageQuery }
    : { chamber: chamber as "upper" | "lower", offset, limit, jurisdiction: stateCode?.toLowerCase(), stages: stageQuery };

  const { data, isLoading, error } = useGetStateBills(params, {
    query: {
      queryKey: getGetStateBillsQueryKey(params),
      enabled: !!stateCode && searchQuery.length === 0,
      placeholderData: (previous) => previous,
    }
  });
  const searchParams = chamber === "all"
    ? { q: searchQuery, jurisdiction: stateCode?.toLowerCase(), offset, limit, stages: stageQuery }
    : { q: searchQuery, jurisdiction: stateCode?.toLowerCase(), chamber: chamber as "upper" | "lower", offset, limit, stages: stageQuery };
  const { data: searchData, isLoading: isSearchLoading, error: searchError } = useSearchStateBills(searchParams, {
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
  const activeError = searchQuery.length > 0 ? searchError : error;
  const isRateLimited = getApiErrorStatus(activeError) === 429;
  const baseBills = searchQuery.length > 0 ? (searchData?.bills ?? []) : (data?.bills ?? []);
  const totalCountBase = searchQuery.length > 0 ? (searchData?.totalCount ?? 0) : (data?.totalCount ?? 0);
  const loadingBase = searchQuery.length > 0 ? isSearchLoading : isLoading;
  const visibleBills = baseBills;
  const pagedVisibleBills = baseBills;
  const effectiveTotalCount = totalCountBase;
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
    if (offset >= effectiveTotalCount && offset !== 0) setOffset(0);
  }, [loadingBase, offset, effectiveTotalCount]);

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
              setSelectedStages((prev) => (prev.includes(stage) ? [] : [stage]));
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
          {loadingBase && (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          )}

          {!loadingBase && activeError && (
            <Card className={isRateLimited ? "border-amber-300 bg-amber-50" : "border-destructive/40"}>
              <CardContent className="flex gap-3 p-4 text-sm">
                <AlertTriangle className={isRateLimited ? "mt-0.5 h-4 w-4 shrink-0 text-amber-600" : "mt-0.5 h-4 w-4 shrink-0 text-destructive"} />
                <div>
                  <p className="font-semibold">
                    {isRateLimited ? "OpenStates rate limit reached" : `State legislative data is not available for ${stateName}`}
                  </p>
                  <p className="mt-1 text-muted-foreground">{getApiErrorMessage(activeError)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loadingBase && !activeError && visibleBills.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{`No bills found${statusEnabled && selectedStages.length > 0 ? " for selected status filters" : ""}.`}</p>
            </div>
          )}

          {!loadingBase && pagedVisibleBills.map((bill) => (
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
                        {bill.identifier && <Badge variant="outline" className={`font-mono text-xs shrink-0 ${billNumberClass(bill.stageDead)}`}>{bill.identifier}</Badge>}
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
