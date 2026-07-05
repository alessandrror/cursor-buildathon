import Link from "next/link";

import { GhostLineLogo } from "@/components/brand/ghostline-logo";
import { AuthControls } from "@/components/layout/auth-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  activeNav?: "calls" | "settings";
};

const navItems = [
  { href: routes.dashboard, label: "Llamadas", id: "calls" as const },
  { href: routes.settings, label: "Configuración", id: "settings" as const },
];

export function DashboardShell({
  children,
  activeNav = "calls",
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-6">
            <Link href={routes.dashboard} className="shrink-0">
              <GhostLineLogo markClassName="size-9" />
            </Link>
            <nav
              aria-label="Secciones del dashboard"
              className="hidden items-center gap-1 sm:flex"
            >
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    activeNav === item.id
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                  aria-current={activeNav === item.id ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <AuthControls />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
