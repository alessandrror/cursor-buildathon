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
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <Link href={routes.dashboard} aria-label="Ir al dashboard">
            <GhostLineLogo markClassName="size-8" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-black leading-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <nav className="flex gap-2">
          <TabLink href={routes.rules} isActive={active === "config"}>
            Configuración
          </TabLink>
          <TabLink href={routes.rulesSimulator} isActive={active === "simulator"}>
            Simulador
          </TabLink>
        </nav>

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
        "rounded-md px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
