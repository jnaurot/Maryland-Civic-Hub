import { Link, useLocation } from "wouter";

export function Navbar() {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/bills/federal", label: "Federal Bills" },
    { href: "/bills/state", label: "State Bills" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center text-accent-foreground font-bold text-xl">
            MD
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">Maryland Representatives</span>
        </Link>

        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                location === link.href || (link.href !== "/" && location.startsWith(link.href))
                  ? "text-foreground font-bold border-b-2 border-accent pb-1 -mb-1"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
