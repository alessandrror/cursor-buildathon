# CLAUDE.md — Guía del proyecto

GhostLine — app anti-estafas telefónicas. Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui · Clerk · Supabase · bun.

---

## Design System — Reglas de gobernanza (NO MODIFICAR sin aprobación)

El sistema de diseño **GhostLine** ya está establecido y centralizado. Estas reglas son
**vinculantes** para cualquier agente de IA o desarrollador. No cambiar los estilos ni el
design system salvo que un **owner del design system** (ver `.github/CODEOWNERS`) lo apruebe
explícitamente en un PR dedicado.

### Fuente única de verdad
- **Todos** los tokens (color, radios, sombras, tipografía, dark mode) viven en
  **`src/app/globals.css`** dentro de `@theme inline`, `:root` y `.dark`. Es el único lugar
  donde se definen valores de diseño.
- No existe `tailwind.config.js` — en Tailwind v4 el tema vive en `globals.css`.

### Prohibido (rompe la centralización)
- ❌ Hard-codear colores en cualquier forma (`#hex`, `rgb()`, `hsl()`, `oklch()`) en
  componentes, JSX, `className`, estilos inline o CSS que no sea `globals.css`.
- ❌ Editar la paleta, radios, sombras, tipografía o el mapping `@theme inline` de
  `globals.css` sin aprobación de un CODEOWNER.
- ❌ Añadir familias tipográficas nuevas. Las únicas son: **Schibsted Grotesk** (display),
  **Hanken Grotesk** (sans/UI) y **Newsreader** itálica (acentos), cargadas con `next/font`
  en `src/app/layout.tsx`.
- ❌ Redibujar, recolorear o duplicar la marca a mano. La marca es
  `src/components/brand/ghostline-logo.tsx` + los SVG en `public/brand/`.
- ❌ Modificar el favicon / app icons (`src/app/icon.svg`, `src/app/apple-icon.png`).
- ❌ Meter colores hard-codeados en los primitivos shadcn de `src/components/ui/*`.
- ❌ Usar hex en `src/lib/clerk-appearance.ts` — debe referenciar tokens (`var(--primary)`, …).

### Obligatorio (cómo trabajar la UI)
- ✅ Usar siempre utilidades que leen tokens: `bg-primary`, `text-muted-foreground`,
  `border-border`, `bg-card`, `ring-ring`, `rounded-lg`, `font-display`, etc.
- ✅ Todo color debe resolverse vía token para funcionar en **light y dark** (dark se activa
  con la clase `.dark` en `<html>`).
- ✅ Extender componentes mediante variantes CVA que consuman tokens, no colores literales.
- ✅ Iconografía: `lucide-react`. No emojis como íconos.
- ✅ Componentes nuevos de shadcn (`bunx shadcn@latest add …`) heredan el tema automáticamente
  porque leen las mismas variables CSS — no hay que retocarlos.

### Proceso para cambiar el design system
1. Abrir un PR **dedicado** que toque solo los archivos de diseño.
2. El PR requiere review y aprobación de un CODEOWNER (`.github/CODEOWNERS`).
3. Cambiar el valor **en `globals.css`** (punto único); nunca parchear en el sitio de uso.
4. Verificar en light y dark antes de mergear.

### Checklist para cualquier PR que toque UI
- [ ] Cero colores hard-codeados fuera de `globals.css`.
- [ ] Se ve correcto en light y dark.
- [ ] Reutiliza componentes/tokens existentes en vez de crear variantes ad-hoc.
- [ ] No se tocó la marca, favicon ni tipografías sin aprobación.

---

## Convenciones generales

- Gestor de paquetes: **bun** (`bun run dev`, `bun install`).
- Specs bajo `specs/` siguen el Framework SDD de la empresa (ver `specs/`).
- No incluir marcadores de generación por IA ni co-autoría en commits/PR.
