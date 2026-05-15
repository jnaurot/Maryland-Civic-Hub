import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStatusFilteredList } from "./useStatusFilteredList";

describe("useStatusFilteredList", () => {
  const baseItems = [
    { id: "1", status: "introduced" },
    { id: "2", status: "introduced" },
    { id: "3", status: "committee" },
  ];

  it("uses present-context count while refining when immediate mode is enabled", () => {
    const { result } = renderHook(() =>
      useStatusFilteredList({
        statusEnabled: true,
        selectedStages: ["Passed"],
        baseItems,
        matchItem: (item, stages) => stages.includes(item.status as any),
        offset: 0,
        limit: 20,
        totalCountBase: 667,
        immediateWhileRefining: true,
        onResetOffset: () => {},
      }),
    );

    expect(result.current.visibleItems).toHaveLength(0);
    expect(result.current.effectiveTotalCount).toBe(0);
  });

  it("keeps base count when status filtering is disabled", () => {
    const { result } = renderHook(() =>
      useStatusFilteredList({
        statusEnabled: false,
        selectedStages: [],
        baseItems,
        matchItem: () => true,
        offset: 0,
        limit: 20,
        totalCountBase: 667,
        onResetOffset: () => {},
      }),
    );

    expect(result.current.effectiveTotalCount).toBe(667);
  });
});
