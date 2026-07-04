# SPEC: Dashboard web de llamadas

- user_story: US-006
- autor: @noe
- fecha: 2026-07-04
- estado: borrador

## Descripción
Pantalla principal de la aplicación donde el usuario ve el historial de llamadas a su número
alternativo: atendidas por el agente (con resumen expandible), rechazadas por reglas y cortadas
por silencio. Incluye filtros, detalle de transcripción y actualización en tiempo real.

## Comportamiento esperado
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
- Llamada `pending_summary` → se muestra con badge "Generando resumen…" y se actualiza al llegar.
- Llamada de número anónimo → la acción "Bloquear este número" se deshabilita (no hay número que bloquear); el switch de anónimos se sugiere en su lugar.
- Transcripción muy larga → panel con scroll virtualizado; nunca romper el layout.
- Pérdida de conexión Realtime → reconexión automática de supabase-js; botón manual "Actualizar" siempre disponible.

## Criterios de aceptación
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
- Vue 3 + TypeScript + PrimeVue Unstyled + Tailwind (stack estándar del equipo).
- Estado con Pinia; queries a Supabase con paginación por cursor (`started_at`, `id`).
