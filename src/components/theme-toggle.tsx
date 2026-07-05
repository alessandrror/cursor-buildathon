import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Cambiar a modo noche"
      aria-pressed="false"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-hero-foreground/25 bg-hero-foreground text-hero shadow-sm transition-all hover:bg-hero-foreground/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px"
      data-theme-toggle
    >
      <Moon className="size-4 dark:hidden" data-theme-icon="moon" />
      <Sun className="hidden size-4 dark:block" data-theme-icon="sun" />
    </button>
  );
}

export { ThemeToggle };
