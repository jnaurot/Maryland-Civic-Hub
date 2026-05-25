import { Link, useSearch } from "wouter";
import { Bookmark, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { BillBookmark } from "@/lib/bookmarks";

export function Bookmarks() {
  const { bookmarks, remove } = useBookmarks();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const fromPath = params.get("from");
  const fromName = params.get("name");

  const selfUrl = search ? `/bookmarks?${search}` : "/bookmarks";

  function federalBillHref(bookmark: BillBookmark): string {
    const parts = bookmark.id.split("-");
    const congress = parts[0];
    const billType = parts[1];
    const billNumber = parts.slice(2).join("-");
    return `/bills/federal/${congress}/${billType}/${billNumber}?from=${encodeURIComponent(selfUrl)}&name=${encodeURIComponent("Saved Bills")}`;
  }

  function stateBillHref(bookmark: BillBookmark): string {
    return `/bills/state/${encodeURIComponent(bookmark.id)}?from=${encodeURIComponent(selfUrl)}&name=${encodeURIComponent("Saved Bills")}`;
  }

  return (
    <PageShell contentClassName="pb-4">
      {fromPath && (
        <Link href={fromPath} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 shrink-0 transition-colors">
          <ChevronLeft className="h-4 w-4" /> {fromName ? `Back to ${fromName}` : "Back"}
        </Link>
      )}

      <div className="mb-8 shrink-0 max-sm:mb-5">
        <h1 className="text-4xl font-black mb-2 max-sm:text-3xl">Saved Bills</h1>
        <p className="text-muted-foreground max-sm:hidden">Bills you've bookmarked for quick access</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No saved bills yet.</p>
          <p className="text-sm mt-1">Tap the bookmark icon on any bill to save it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b) => {
            const href = b.type === "federal" ? federalBillHref(b) : stateBillHref(b);
            return (
              <div key={b.id} className="flex items-stretch gap-2">
                <Link href={href} className="flex-1 min-w-0">
                  <Card className="hover:border-primary transition-colors cursor-pointer group h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs shrink-0">{b.number}</Badge>
                            <Badge variant="secondary" className="text-xs">{b.type === "federal" ? "Federal" : "State"}</Badge>
                          </div>
                          <p className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{b.title}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 self-center text-muted-foreground hover:text-destructive"
                  aria-label="Remove bookmark"
                  onClick={() => remove(b.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
