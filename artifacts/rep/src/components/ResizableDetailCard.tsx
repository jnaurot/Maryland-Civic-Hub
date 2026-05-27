import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ResizableDetailCard({
  title,
  children,
  className = "",
  contentClassName = "max-h-[min(65vh,28rem)]",
}: {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className={`overflow-y-auto ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}
