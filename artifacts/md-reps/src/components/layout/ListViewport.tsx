import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const ListViewport = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
  }
>(function ListViewport({ children, className }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex-1 min-h-0 overflow-y-auto pr-1 max-sm:pr-0", className)}
    >
      {children}
    </div>
  );
});
