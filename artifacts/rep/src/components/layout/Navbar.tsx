import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAppState } from "@/lib/app-state";
import { getStateName } from "@/lib/states";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Bookmark } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";

export function Navbar() {
  const [location] = useLocation();
  const { selectedState } = useAppState();
  const stateName = getStateName(selectedState);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { bookmarks } = useBookmarks();

  function getPageName(loc: string): string {
    if (loc === "/") return "Home";
    if (loc.startsWith("/bills/federal/")) return "Federal Bill";
    if (loc === "/bills/federal") return "Federal Bills";
    if (loc.startsWith("/bills/state/")) return "State Bill";
    if (loc === "/bills/state") return "State Bills";
    if (loc.startsWith("/rep/federal/")) return "Representative";
    if (loc.startsWith("/rep/state/")) return "Representative";
    return "Previous page";
  }

  const bookmarksHref = `/bookmarks?from=${encodeURIComponent(location)}&name=${encodeURIComponent(getPageName(location))}`;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/bills/federal", label: "Federal Bills" },
    { href: "/bills/state", label: "State Bills" },
  ];

  const activeClass = "text-foreground font-bold border-b-2 border-accent pb-1 -mb-1";
  const inactiveClass = "text-muted-foreground hover:text-foreground";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center text-accent-foreground font-bold text-xl">
            {selectedState ?? "US"}
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">
            {stateName ? `${stateName} Representatives` : "US Representatives"}
          </span>
        </Link>

        {isMobile ? (
          <div className="flex items-center gap-1">
            <Link href={bookmarksHref} aria-label="Saved Bills">
              <Button variant="ghost" size="icon">
                <Bookmark className={`h-5 w-5 ${location === "/bookmarks" ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </Button>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-3/4 sm:max-w-sm">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`text-lg font-medium transition-colors ${
                        location === link.href || (link.href !== "/" && location.startsWith(link.href))
                          ? "text-foreground font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href={bookmarksHref}
                    onClick={() => setOpen(false)}
                    className={`text-lg font-medium transition-colors ${location === "/bookmarks" ? "text-foreground font-bold" : "text-muted-foreground"}`}
                  >
                    Saved Bills {bookmarks.length > 0 && `(${bookmarks.length})`}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  location === link.href || (link.href !== "/" && location.startsWith(link.href))
                    ? activeClass
                    : inactiveClass
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href={bookmarksHref} aria-label="Saved Bills">
              <Button variant="ghost" size="icon">
                <Bookmark className={`h-5 w-5 ${location === "/bookmarks" ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
