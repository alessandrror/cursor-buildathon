# GhostLine × shadcn/ui (Tailwind v4)

Drop-in theme + components for a shadcn/ui project running **Tailwind v4**.

## 1. Theme
Replace your app's `globals.css` (usually `app/globals.css`) with **`globals.css`** from this folder — or paste its `:root`, `.dark`, and `@theme inline` blocks into yours. It defines the full GhostLine palette in shadcn variable format, plus light + dark modes. Toggle dark by adding `class="dark"` to `<html>`.

No `tailwind.config.js` is needed in v4 — the theme lives in `@theme inline` inside `globals.css`.

## 2. Utils
Copy `lib/utils.ts` to `@/lib/utils` (or keep your existing `cn`).

## 3. Components
Copy the files in `components/ui/` into your project's `components/ui/`. They are standard shadcn components, re-styled through the theme variables (no hard-coded colors), so `npx shadcn@latest add …` stays compatible.

Peer deps used:
```
npm i class-variance-authority clsx tailwind-merge \
  @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-switch
```

Included: `button`, `badge`, `card`, `input`, `label`, `switch`.
Any other shadcn component you add will automatically pick up the GhostLine look because it reads the same CSS variables.

## Brand tokens → shadcn mapping
| Brand | shadcn var | Light |
|---|---|---|
| Pino | `--primary` | `#1E4D3B` |
| Salvia | `--ring` / dark `--primary` | `#8FB09B` |
| Arena | `--accent` | `#E8C98E` |
| Hueso | `--primary-foreground` | `#F5F3EC` |
| Paper | `--background` | `#FBFAF5` |
| Bloqueado | `--destructive` | `#C0503B` |

Extra semantic tokens beyond stock shadcn: `--success`, `--warning` (+ `-foreground`), mapped in `@theme` so `bg-success`, `text-warning-foreground`, etc. work.

## Fonts
`globals.css` imports Schibsted Grotesk (display), Hanken Grotesk (sans), Newsreader (serif) from Google Fonts. Swap for self-hosted `@font-face` when you license them.
