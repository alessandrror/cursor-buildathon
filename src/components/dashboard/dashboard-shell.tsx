"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  { href: routes.dashboard, label: "Panel", id: "calls" as const },
  { href: routes.dashboardRules, label: "Reglas", id: "settings" as const },
];

export function DashboardShell({
  children,
  activeNav = "calls",
}: DashboardShellProps) {
  const pathname = usePathname();
  const currentNav = pathname.startsWith(routes.dashboardRules)
    ? "settings"
    : activeNav;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center">
            <Link href={routes.dashboard} className="shrink-0">
              <GhostLineLogo markClassName="size-5" wordmarkClassName="text-base" />
            </Link>
          </div>
          <nav
            aria-label="Secciones del dashboard"
            className="hidden items-center gap-1 rounded-full bg-secondary p-1 shadow-sm sm:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-bold transition-colors",
                    currentNav === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={currentNav === item.id ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <ThemeToggle />
            <AuthControls />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
