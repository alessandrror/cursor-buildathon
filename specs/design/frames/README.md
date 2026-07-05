# Handoff visual — vistas y flujos (sin necesidad de Figma)

Referencia visual **autocontenida**: no requiere acceso a Figma. Cada vista incluye su
imagen, la ruta/componente donde va y los criterios clave. Los valores de diseño (color,
spacing, radios, tipografía) ya viven en `src/app/globals.css`; usar utilidades que leen
tokens (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `font-display`). Íconos:
`lucide-react`. Reutilizar `src/components/ui/*` y `src/components/brand/ghostline-logo.tsx`.

> Estado: ✅ implementado en `dev` · 🌿 en rama `feat/reglas-contestacion` · 🆕 nuevo · 🎨 solo tematizar.

---

## Público y acceso

### 01 · Landing — ✅ `src/app/page.tsx`
![Landing](./01-landing.png)
El código ya es la fuente; la imagen lo refleja. Solo ajustes visuales menores.

### 02 · Registro — 🎨 `src/app/sign-up/[[...sign-up]]` + `src/lib/clerk-appearance.ts`
![Registro](./02-registro.png)
Card de Clerk tematizada con tokens (primary, radios, fuentes).

### 04 · Iniciar sesión — 🎨 `src/app/sign-in/[[...sign-in]]`
![Iniciar sesión](./04-iniciar-sesion.png)

### 03 · Onboarding — Activa tu número — 🆕 `src/app/onboarding/page.tsx`
![Onboarding](./03-onboarding.png)
Post-registro: conectar número + nota de cifrado → dashboard. Requiere spec.

---

## Llamadas

### 05 · Panel — ✅ `src/app/dashboard/page.tsx` (+ `dashboard-shell`, `call-metrics`, `call-list-item`, `calls-empty-state`)
![Panel](./05-panel.png)
Tarjeta del número GhostLine (copiar) · 4 métricas con ícono · lista como **grid de tarjetas**
(estado, número, categoría, urgencia, hora, acciones Confiar/Bloquear) · filtros pegados a la
grid (sin hueco) · **paginación**.

### 06 · Detalle de llamada — ✅ `src/components/dashboard/call-detail-view.tsx`
![Detalle](./06-detalle-llamada.png)
Una sola columna: cabecera, tiles (estado/duración/categoría/urgencia), motivo +
"Ver resumen completo", acciones (Confiar/Bloquear/Reportar).

### 07 · Resumen de llamada — ✅ `src/app/dashboard/summaries/[id]/page.tsx` (+ `call-transcript`)
![Resumen](./07-resumen-llamada.png)
Una sola columna: **Conclusión** destacada · Resumen (motivo + texto) · tiles ·
**transcripción tipo chat** (Llamante a la izquierda, GhostLine a la derecha) · acciones.

---

## Reglas y simulador

### 08 · Reglas — 🌿 `feat/reglas-contestacion` · `src/app/dashboard/rules/page.tsx`
![Reglas](./08-reglas.png)
Sin "Acción de rechazo" · Comportamiento en 2 columnas · listas Blanca/Negra/Prefijos
compactas · banner del simulador.

### 09 · Ensaya una llamada — 🌿 `src/app/dashboard/rules/simulator/page.tsx`
![Ensaya](./09-ensaya-llamada.png)
Lenguaje **no técnico** · selector de escenarios + "Probar llamada" (una sola columna).

### 10 · Resultado: Rechazada — 🆕 estado del simulador
![Rechazada](./10-resultado-rechazada.png)
"Qué pasó" paso a paso.

### 11 · Resultado: Atendida con tu voz — 🆕 estado del simulador
![Atendida](./11-resultado-atendida.png)
"Qué pasó" + "Lo que descubrió" (conecta con clonación de voz).

---

## Ajustes

### 12 · Ajustes — 🆕 `src/app/settings/page.tsx` (hoy `return null`)
![Ajustes](./12-ajustes.png)
Notificaciones (email/push por evento) + cuenta + tema. Ver `specs/notifications`. Requiere spec.

---

## Clonación de voz (feature nueva — requiere spec + threat model)

El agente contesta con la voz clonada del usuario para sonsacar al estafador. Voz = dato
biométrico sensible (consentimiento, cifrado, borrado). Ruta sugerida: `src/app/onboarding/voz/`.

### Voz · 1 · Permiso (consentimiento)
![Voz 1](./voz-1-permiso.png)
### Voz · 2 · Grabar
![Voz 2](./voz-2-grabar.png)
### Voz · 3 · Generar
![Voz 3](./voz-3-generar.png)
### Voz · 4 · Escuchar
![Voz 4](./voz-4-escuchar.png)
### Voz · 5 · Listo / Activar
![Voz 5](./voz-5-listo.png)
