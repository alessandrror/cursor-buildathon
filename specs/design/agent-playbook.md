# Playbook — adaptar una vista de Figma al código

Guía para un agente (p. ej. `figma-to-code` o `sdd-frontend`) que implementa o adapta
una vista a partir del diseño de Figma. Seguir en orden.

## 0. Prerrequisitos (no requiere Figma)

- **Referencia principal:** la imagen de la vista en `frames/` (ver `frames/README.md`).
- Tokens de diseño: ya en `src/app/globals.css`. Componentes: `src/components/ui/*`.
- **No hace falta acceso a Figma.** El MCP de Figma es un camino **opcional** solo para
  quien tenga acceso (ver §1b).

## 1. Reproducir el diseño desde la imagen (camino por defecto)

1. Abrí la imagen de la vista en `specs/design/frames/` y su ficha en `frames/README.md`
   (ruta/componente + criterios de aceptación).
2. Reconstruí el layout con Tailwind + shadcn/ui, mapeando los colores/spacings a los
   **tokens** de `globals.css` (no adivinar hex; usar `bg-primary`, `rounded-lg`, etc.).
3. Íconos: `lucide-react` (los frames usan los íconos oficiales de Lucide).
4. Comparar el resultado (`bun run dev`) contra la imagen, en light y dark.

## 1b. Extraer el diseño con el MCP de Figma (opcional, solo con acceso)

- fileKey `jPSxrx2T9RGogjNQRUEOAe`; node-id en `figma-frames-map.md`.
- `get_metadata` / `get_design_context` / `get_screenshot` por nodo. Code Connect no está
  disponible en este plan, por eso el mapeo vive en `figma-frames-map.md`.

## 2. Reglas de implementación (vinculantes)

- **Tokens:** usar utilidades Tailwind que leen tokens (`bg-primary`, `text-muted-foreground`,
  `border-border`, `bg-card`, `ring-ring`, `rounded-lg`, `font-display`). Cero hex/rgb/oklch
  fuera de `globals.css`.
- **Reutilizar:** primitivos de `src/components/ui/*`; marca en `brand/ghostline-logo.tsx`;
  íconos `lucide-react` (los frames ya usan los íconos oficiales de Lucide por nombre).
- **Responsive:** los anchos del frame son de escritorio (1280) con contenedor `max-w-6xl`;
  adaptar a móvil con las utilidades del proyecto.
- **Light + dark:** verificar ambos temas.
- **No cambiar el design system** sin PR dedicado y aprobación de CODEOWNER.

## 3. Flujo SDD

- Vista **ya implementada** (✅): adaptar el componente existente al diseño; actualizar la
  spec si cambia comportamiento observable.
- Vista **nueva** (🆕): primero spec de Feature (`sdd-pm`) en `specs/<módulo>/`, luego
  implementación (`sdd-frontend`), luego tests (`sdd-qa`). Para clonación de voz, además
  threat model (`sdd-secaudit`).
- Trazabilidad: comentario `// spec: §<sección>` en funciones que satisfacen criterios;
  al menos un test por criterio de aceptación.

## 4. Criterios de aceptación por vista

**05 · Panel** (`dashboard/page.tsx`)
- Tarjeta del número GhostLine con acción copiar.
- Fila de 4 métricas con ícono (total, bloqueadas por reglas, filtradas por silencio, atendidas con resumen).
- Lista de llamadas como **grid de tarjetas** (no filas largas): estado, número, categoría, urgencia, hora, acciones Confiar/Bloquear.
- Filtros pegados a la grid (sin hueco) y **paginación**.

**06 · Detalle de llamada** (`call-detail-view.tsx`)
- Una sola columna: cabecera (número, nombre, estado), tiles (estado/duración/categoría/urgencia), motivo, "Ver resumen completo", acciones.

**07 · Resumen de llamada** (`summaries/[id]` + `call-transcript.tsx`)
- **Conclusión** destacada (legítima/estafa) que aporte valor.
- Resumen (motivo + texto) y tiles de datos.
- **Transcripción tipo chat**: burbujas del Llamante a la izquierda, GhostLine a la derecha.
- Acciones Confiar/Bloquear/Reportar.

**08 · Reglas** / **09 · Ensaya una llamada** (rama `feat/reglas-contestacion`)
- Reglas: sin "Acción de rechazo"; Comportamiento equilibrado; listas compactas.
- Simulador: **lenguaje no técnico**, selector de escenarios, resultados que expliquen el comportamiento (frames 10/11).

**03 · Onboarding** / **12 · Ajustes** / **Voz 1–5** (nuevas)
- Requieren spec previa. Ver `figma-frames-map.md` para node-ids y notas.

## 5. Verificación

- `bun run dev` y comparar contra `get_screenshot` del frame.
- Revisar light y dark.
- `bun run lint`. Tests trazados a la spec (`bun test`).
- Checklist de UI de `CLAUDE.md`: cero colores hard-codeados, reutiliza tokens/componentes,
  no se tocó marca/favicon/tipografías.

## 6. Prompt sugerido para el agente

> Implementa/adapta la vista **`<nombre>`** al código usando como referencia la imagen
> `specs/design/frames/<archivo>.png` y su ficha en `specs/design/frames/README.md`.
> Reutiliza `src/components/ui/*` y los tokens de `globals.css` (nada hard-codeado), íconos
> `lucide-react`. Respeta los criterios de aceptación del playbook. Si la vista es nueva,
> primero propone la spec. Verifica en light y dark. No incluyas marcadores de generación
> por IA en commits/PR. (Opcional, si tienes acceso a Figma: node-id en `figma-frames-map.md`.)
