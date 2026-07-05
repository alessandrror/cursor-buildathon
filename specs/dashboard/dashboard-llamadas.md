# SPEC: Dashboard web de llamadas

- user_story: US-006
- autor: @noe
- fecha: 2026-07-04
- estado: en progreso (MVP UI implementado)

## Descripción

Pantalla principal de la aplicación donde el usuario ve el historial de llamadas a su número
alternativo: atendidas por el agente (con resumen expandible), rechazadas por reglas y cortadas
por silencio. El objetivo de la interfaz es **dar contexto accionable en segundos**: qué pasó,
qué tan urgente es y si debe hacer algo.

## Interfaz de usuario (MVP — implementado)

### Shell del dashboard

- Cabecera persistente con marca GhostLine, navegación (`Llamadas`, `Configuración`), toggle de
  tema y menú de usuario (Clerk).
- Contenedor ancho máximo `6xl`, tipografía display para títulos y acento Newsreader itálica en
  subtítulos (coherente con landing).

### Listado `/dashboard`

| Bloque | Contenido |
|--------|-----------|
| Encabezado | Título “Llamadas filtradas” + subtítulo orientado al valor (“qué pasó mientras GhostLine protegía tu línea”). |
| Banner mock | Visible solo si `USE_MOCK_CALLS=true`. |
| Métricas | 4 tarjetas: total, bloqueadas, por silencio, atendidas (calculadas del listado actual). |
| Historial | Cards clicables con: icono por `outcome`, nombre/número, tiempo relativo, duración, badges de estado/categoría/urgencia, resumen en 2 líneas o descripción del outcome. |
| Vacío | Ilustración con marca, copy orientado a la acción y referencia a `simulate-call` en dev. |

### Detalle `/dashboard/summaries/[id]`

| Bloque | Contenido |
|--------|-----------|
| Navegación | Volver al listado. |
| Hero | **Tarjeta tipo agenda**: nombre del emisor, motivo en itálica, badges, y filas compactas (teléfono/empresa, fecha/duración, decisión/regla). |
| Resumen | Card destacada con el texto generado por OpenAI (pipeline n8n). |
| Transcripción | Burbujas estilo chat (agente vs emisor) con scroll interno si es larga. |
| Acciones | Botones “Bloquear” / “Confiar” deshabilitados (placeholder hasta reglas). |

### Presentación de datos

- Etiquetas en español centralizadas en `src/lib/calls/presentation.ts`.
- Badges con variantes del design system (`success`, `destructive`, `warning`, `accent`, etc.).
- Iconografía Lucide por tipo de outcome.

### Modo demostración

- Variable `USE_MOCK_CALLS=true` en `.env` → datos de `src/lib/mock-data.ts`.
- `USE_MOCK_CALLS=false` → Supabase vía `src/lib/calls/data-source.ts`.
- Permite diseñar y probar UX antes de integrar n8n.

## Comportamiento esperado (completo — roadmap)

- Al entrar a `/dashboard`, el usuario ve:
  - Tarjetas de métricas del período: total de llamadas, bloqueadas por reglas, filtradas por silencio, atendidas con resumen.
  - Lista de llamadas ordenada por fecha desc, paginada (20 por página), con: fecha/hora local, número emisor (o "Anónimo"), estado (`outcome` con etiqueta e ícono), categoría y urgencia si hay resumen.
- Filtros combinables: rango de fechas, estado, categoría, búsqueda por número.
- Clic en una llamada atendida → panel de detalle con resumen completo (quién, empresa, motivo) y transcripción turno a turno.
- Nueva llamada procesada mientras el dashboard está abierto → aparece en la lista sin recargar (Supabase Realtime sobre `calls` y `call_summaries`).
- Acción rápida en cada llamada: "Bloquear este número" (agrega a lista negra) y "Confiar en este número" (lista blanca).
- Responsive: usable en móvil (lista en cards, detalle a pantalla completa).

## Casos borde

- Usuario sin llamadas aún → estado vacío con explicación y su número alternativo visible para compartirlo.
- Llamada `pending_summary` → badge “Generando resumen” con icono animado; se actualiza al llegar (Realtime).
- Llamada de número anónimo → la acción "Bloquear este número" se deshabilita (no hay número que bloquear); el switch de anónimos se sugiere en su lugar.
- Transcripción muy larga → panel con scroll interno (`max-height`); nunca romper el layout.
- Pérdida de conexión Realtime → reconexión automática de supabase-js; botón manual "Actualizar" siempre disponible.

## Criterios de aceptación

### MVP UI (hecho)

- [x] Listado muestra outcome, categoría, urgencia y resumen con jerarquía visual clara.
- [x] Detalle muestra resumen, metadatos y transcripción en formato legible.
- [x] Métricas agregadas visibles cuando hay llamadas.
- [x] Estado vacío útil (no solo “sin datos”).
- [x] Modo mock con bandera de entorno.
- [x] Shell de app con marca, nav y auth.

### Pipeline y datos (pendiente)

- [ ] El historial solo muestra llamadas del usuario autenticado (test RLS).
- [ ] Una llamada nueva aparece en la lista en < 5 s sin recargar la página.
- [ ] "Bloquear este número" crea la regla de lista negra y la siguiente llamada de ese número es rechazada.
- [ ] Los filtros combinados devuelven resultados consistentes con la DB (test E2E).
- [ ] Las horas se muestran en la zona horaria del perfil del usuario.

## Dependencias

- Tablas `calls`, `call_summaries`, `call_transcripts` con RLS.
- Supabase Realtime habilitado en `calls` y `call_summaries`.
- Feature `reglas/configuracion-reglas-contestacion.md` (acciones rápidas).

## Fuera de alcance

- Exportación a CSV/PDF del historial.
- Gráficas de tendencias históricas.
- Reproducción de audio (no se graba audio en MVP).

## Notas técnicas

- **Stack app:** Next.js 16 (App Router) + React 19 + TypeScript + shadcn/ui + Tailwind v4 + Clerk + Supabase.
- **Componentes:** `src/components/dashboard/*` (shell, métricas, cards, detalle, transcripción).
- **Capa de datos:** `src/lib/calls/data-source.ts` (mock vs Supabase).
- **Presentación:** `src/lib/calls/presentation.ts` (labels, badges, métricas, formato).
- Paginación futura: cursor (`started_at`, `id`) en Supabase.
- Realtime futuro: suscripción cliente en listado con invalidación o merge optimista.
