import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ListViewport({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 min-h-0 overflow-y-auto pr-1 max-sm:pr-0", className)}>
      {children}
    </div>
  );
}
