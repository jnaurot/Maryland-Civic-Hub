import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("shrink-0 pb-4 max-sm:pb-3", className)}>{children}</div>;
}
