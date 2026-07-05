# Integración de vistas y flujos desde Figma

Estrategia para llevar el diseño de GhostLine (Figma) al código de este proyecto,
reutilizando el design system ya centralizado y los componentes existentes, sin
reescribir lo que ya está implementado.

## Fuente de diseño

- **Archivo Figma:** `GhostLine — Design System`
  - fileKey: `jPSxrx2T9RGogjNQRUEOAe`
  - URL: https://www.figma.com/design/jPSxrx2T9RGogjNQRUEOAe
- Los frames están **agrupados por flujo** (Público y acceso · Llamadas · Reglas y
  simulador · Ajustes · Clonación de voz) y ordenados de izquierda a derecha.
- Las **Variables de Figma son espejo** de `src/app/globals.css` (mismo color/spacing/
  radio, con code syntax `var(--…)`). En Dev Mode cada valor muestra su token exacto.

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

- [`figma-frames-map.md`](./figma-frames-map.md) — tabla frame ↔ node-id ↔ ruta ↔
  componentes ↔ estado (implementado / en rama / nuevo).
- [`agent-playbook.md`](./agent-playbook.md) — pasos para que un agente adapte cada
  vista con el MCP de Figma, reutilizando tokens y shadcn/ui, con criterios de
  aceptación por vista.

## Cómo empezar (resumen)

1. Abrí el frame en Figma y tomá su `node-id` desde `figma-frames-map.md`.
2. Pasáselo a un agente (`figma-to-code` o `sdd-frontend`) junto con el `agent-playbook.md`.
3. El agente extrae el diseño con el MCP de Figma (`get_design_context` / `get_screenshot`),
   adapta el componente/ruta existente o crea el nuevo reutilizando tokens y shadcn/ui,
   y deja tests trazados a la spec.
4. Revisión humana + verificación en light/dark antes de mergear.
