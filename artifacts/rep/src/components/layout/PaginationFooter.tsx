import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PaginationFooter({
  offset,
  limit,
  totalCount,
  onPrevious,
  onNext,
  className,
  size = "sm",
  formatCount = (value: number) => value.toLocaleString(),
}: {
  offset: number;
  limit: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  formatCount?: (value: number) => string;
}) {
  const safeTotal = Math.max(0, totalCount);
  const safeOffset = Math.max(0, offset);
  const start = safeTotal === 0 ? 0 : safeOffset + 1;
  const end = safeTotal === 0 ? 0 : Math.min(safeOffset + limit, safeTotal);
  const canGoPrevious = safeOffset > 0;
  const canGoNext = safeOffset + limit < safeTotal;

  return (
    <div
      className={cn(
        "flex justify-between items-center gap-2 pt-3 pb-3 mt-2 shrink-0 border-t bg-muted/20 rounded-md px-2 max-sm:rounded-none max-sm:border-x-0 max-sm:px-1.5 max-sm:pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <Button
        variant="outline"
        size={size}
        disabled={!canGoPrevious}
        onClick={onPrevious}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground text-center max-sm:text-xs">
        {formatCount(start)}–{formatCount(end)} of {formatCount(safeTotal)}
      </span>
      <Button
        variant="outline"
        size={size}
        disabled={!canGoNext}
        onClick={onNext}
      >
        Next
      </Button>
    </div>
  );
}
