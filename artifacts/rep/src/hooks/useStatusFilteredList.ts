import { useEffect, useMemo, useState } from "react";
import type { BillStage } from "@/lib/rep-utils";

export function useStatusFilteredList<T>({
  statusEnabled,
  selectedStages,
  baseItems,
  matchItem,
  offset,
  limit,
  totalCountBase,
  fetchAllItems,
  immediateWhileRefining = false,
  onResetOffset,
  deps = [],
  isBaseLoading = false,
}: {
  statusEnabled: boolean;
  selectedStages: BillStage[];
  baseItems: T[];
  matchItem: (item: T, stages: BillStage[]) => boolean;
  offset: number;
  limit: number;
  totalCountBase: number;
  fetchAllItems?: () => Promise<T[]>;
  immediateWhileRefining?: boolean;
  onResetOffset: () => void;
  deps?: Array<string | number | boolean | null | undefined>;
  isBaseLoading?: boolean;
}) {
  const [refinedItems, setRefinedItems] = useState<T[] | null>(null);
  const [refining, setRefining] = useState(false);
  const statusFilterActive = statusEnabled && selectedStages.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function refine() {
      if (!statusFilterActive || !fetchAllItems) {
        setRefinedItems(null);
        setRefining(false);
        return;
      }
      setRefining(true);
      try {
        const all = await fetchAllItems();
        const filtered = all.filter((item) => matchItem(item, selectedStages));
        if (!cancelled) setRefinedItems(filtered);
      } catch {
        if (!cancelled) setRefinedItems([]);
      } finally {
        if (!cancelled) setRefining(false);
      }
    }
    refine();
    return () => {
      cancelled = true;
    };
  }, [statusFilterActive, fetchAllItems, matchItem, selectedStages, ...deps]);

  const immediateFiltered = useMemo(
    () =>
      baseItems.filter((item) =>
        !statusFilterActive ? true : matchItem(item, selectedStages),
      ),
    [baseItems, statusFilterActive, matchItem, selectedStages],
  );

  const visibleItems = statusFilterActive
    ? refinedItems ?? (immediateWhileRefining ? immediateFiltered : [])
    : immediateFiltered;

  const pagedItems =
    statusFilterActive && (refinedItems || !immediateWhileRefining)
      ? visibleItems.slice(offset, offset + limit)
      : visibleItems;

  const effectiveTotalCount = statusFilterActive
    ? refinedItems
      ? visibleItems.length
      : immediateWhileRefining
        ? visibleItems.length
        : 0
    : totalCountBase;

  useEffect(() => {
    const canResetOffset =
      !isBaseLoading &&
      (!statusFilterActive || refinedItems !== null || !immediateWhileRefining);
    if (!canResetOffset) return;
    if (offset >= effectiveTotalCount && offset !== 0) onResetOffset();
  }, [
    offset,
    effectiveTotalCount,
    onResetOffset,
    isBaseLoading,
    statusFilterActive,
    refinedItems,
    immediateWhileRefining,
  ]);

  return {
    statusFilterActive,
    visibleItems,
    pagedItems,
    effectiveTotalCount,
    refining,
    refinedItems,
  };
}
