import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/layout/FilterBar";
import { BILL_STAGE_OPTIONS, type BillStage } from "@/lib/rep-utils";

export function StatusFilterControls({
  statusEnabled,
  onToggleStatus,
  className,
}: {
  statusEnabled: boolean;
  onToggleStatus: () => void;
  className?: string;
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={`mt-0.5 shrink-0 ${statusEnabled ? "border-green-600 text-green-700" : "border-red-500 text-red-600"} ${className ?? ""}`}
      onClick={onToggleStatus}
    >
      <span className="sm:hidden">Status</span>
      <span className="hidden sm:inline">Status {statusEnabled ? "On" : "Off"}</span>
    </Button>
  );
}

export function StatusStagePills({
  selectedStages,
  onToggleStage,
}: {
  selectedStages: BillStage[];
  onToggleStage: (stage: BillStage) => void;
}) {
  return (
    <FilterBar className="flex flex-wrap gap-2">
      {BILL_STAGE_OPTIONS.map((stage) => {
        const selected = selectedStages.includes(stage);
        return (
          <Button
            key={stage}
            size="sm"
            variant="outline"
            className={selected ? "border-green-600 text-green-700 bg-green-50" : "border-gray-300 text-foreground"}
            onClick={() => onToggleStage(stage)}
          >
            {stage}
          </Button>
        );
      })}
    </FilterBar>
  );
}
