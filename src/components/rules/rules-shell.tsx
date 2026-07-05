import Link from "next/link";

import { GhostLineLogo } from "@/components/brand/ghostline-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function RulesShell({
  title,
  description,
  active,
  children,
}: {
  title: string;
  description: string;
  active: "config" | "simulator";
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href={routes.dashboard} aria-label="Ir al dashboard">
            <GhostLineLogo markClassName="size-8" />
          </Link>

          <nav className="flex items-center gap-1 rounded-full border border-border bg-muted p-1">
            <TabLink href={routes.rules} isActive={active === "config"}>
              Configuración
            </TabLink>
            <TabLink href={routes.rulesSimulator} isActive={active === "simulator"}>
              Simulador
            </TabLink>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-black leading-tight md:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </main>
  );
}

function TabLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
