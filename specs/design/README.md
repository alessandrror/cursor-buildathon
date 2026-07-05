# Integración de vistas y flujos desde Figma

Estrategia para llevar el diseño de GhostLine al código de este proyecto,
reutilizando el design system ya centralizado y los componentes existentes, sin
reescribir lo que ya está implementado.

## No se necesita acceso a Figma

El handoff es **autocontenido en el repo**: quien implemente trabaja con las **imágenes
de cada vista** en [`frames/`](./frames/README.md) + los tokens de `src/app/globals.css`
+ los componentes de `src/components/ui/*`. **No hace falta abrir Figma.**

- **Referencia visual (principal):** [`frames/README.md`](./frames/README.md) — galería con
  la imagen de cada vista, su ruta/componente y los criterios de aceptación.
- **Figma (opcional, solo si tienes acceso):** archivo `GhostLine — Design System`,
  fileKey `jPSxrx2T9RGogjNQRUEOAe`. Las Variables de Figma son **espejo** de
  `src/app/globals.css`, así que el diseño ya está representado por los tokens del repo.

## Principios de integración

1. **No tocar el design system.** Los tokens viven solo en `src/app/globals.css`
   (ver `CLAUDE.md`). Nada de colores hard-codeados; usar utilidades que leen tokens
   (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `font-display`, …).
2. **Reutilizar antes que crear.** Primitivos en `src/components/ui/*` (shadcn) y la
   marca en `src/components/brand/ghostline-logo.tsx`. Íconos: `lucide-react`.
3. **El Figma es referencia de UI**, no la fuente de verdad del comportamiento. La
   lógica/datos siguen las specs de `specs/` (SDD).
4. **SDD primero para lo nuevo.** Vistas que no existen (Onboarding, Ajustes,
   Clonación de voz) requieren spec de Feature antes de implementar (`sdd-pm`).
5. **Verificar en light y dark.** Todo debe resolver por token en ambos temas.

## Documentos de esta carpeta

- [`frames/README.md`](./frames/README.md) — **galería visual** (imagen por vista + ruta +
  criterios). Es el documento principal para implementar; no requiere Figma.
- [`frames/`](./frames/) — imágenes PNG de cada vista.
- [`figma-frames-map.md`](./figma-frames-map.md) — tabla frame ↔ imagen ↔ ruta ↔
  componentes ↔ estado (+ node-id opcional para quien tenga Figma).
- [`agent-playbook.md`](./agent-playbook.md) — pasos + criterios de aceptación para que
  un agente adapte cada vista reutilizando tokens y shadcn/ui.

## Cómo empezar (resumen)

1. Abrí [`frames/README.md`](./frames/README.md) y ubicá la vista (imagen + ruta + criterios).
2. Pasásela a un agente (`figma-to-code` o `sdd-frontend`) junto con el `agent-playbook.md`,
   o impleméntala a mano.
3. Reproducí el diseño reutilizando `src/components/ui/*` y los tokens de `globals.css`
   (nada hard-codeado); íconos `lucide-react`. Dejá tests trazados a la spec.
4. Revisión humana + verificación en light/dark antes de mergear.
