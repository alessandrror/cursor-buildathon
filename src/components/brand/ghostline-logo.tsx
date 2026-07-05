import { cn } from "@/lib/utils";

type GhostLineLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  inverted?: boolean;
};

function GhostLineMark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="GhostLine"
      className={cn("size-10 shrink-0", className)}
    >
      <path
        d="M28 58 a32 32 0 0 1 64 0 V90 c0 4 -4 6 -7 3 l-6 -5 c-2 -2 -5 -2 -7 0 l-5 5 c-2 2 -5 2 -7 0 l-5 -5 c-2 -2 -5 -2 -7 0 l-6 5 c-3 3 -7 1 -7 -3 Z"
        fill={inverted ? "var(--hero-foreground)" : "var(--primary)"}
      />
      <circle
        cx="50"
        cy="56"
        r="5"
        fill={inverted ? "var(--hero)" : "var(--primary-foreground)"}
      />
      <circle
        cx="70"
        cy="56"
        r="5"
        fill={inverted ? "var(--hero)" : "var(--primary-foreground)"}
      />
    </svg>
  );
}

function GhostLineLogo({
  className,
  markClassName,
  wordmarkClassName,
  inverted = false,
}: GhostLineLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <GhostLineMark className={markClassName} inverted={inverted} />
      <span
        className={cn(
          "font-display text-xl font-black tracking-tight",
          inverted ? "text-hero-foreground" : "text-foreground",
          wordmarkClassName
        )}
      >
        Ghost
        <span
          className={cn(
            "font-normal",
            inverted ? "text-hero-foreground/75" : "text-primary/70"
          )}
        >
          Line
        </span>
      </span>
    </div>
  );
}

export { GhostLineLogo, GhostLineMark };
