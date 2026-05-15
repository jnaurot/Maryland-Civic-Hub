import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "h-[calc(100dvh-4rem)] flex flex-col overflow-hidden bg-muted/20",
        className,
      )}
    >
      <div
        className={cn(
          "container mx-auto px-4 pt-8 max-w-4xl flex flex-col h-full",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
