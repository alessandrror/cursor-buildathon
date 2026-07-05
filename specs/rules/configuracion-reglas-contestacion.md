# SPEC: Configuración de reglas de contestación

- user_story: US-003
- autor: @noecortez
- fecha: 2026-07-04
- estado: borrador

## Descripción
Permite al usuario definir, desde el dashboard, las reglas que determinan qué llamadas entrantes
serán atendidas por el agente de IA y cuáles serán rechazadas. Las reglas se guardan en Supabase
y son evaluadas en tiempo real por n8n en cada llamada (ver
`rules/evaluacion-reglas-llamada-entrante.md`).

## Comportamiento esperado
- El usuario ve una pantalla "Reglas de contestación" con:
  - **Lista blanca**: números que siempre se atienden (o se le indica al llamante el número real, configuración futura).
  - **Lista negra**: números que siempre se rechazan.
  - **Horario de atención**: rango horario (con zona horaria del perfil) fuera del cual las llamadas se rechazan. Default: 24/7.
  - **Números ocultos/anónimos**: switch atender / rechazar. Default: rechazar.
  - **Prefijos bloqueados**: lista de prefijos (país o área) a rechazar.
  - **Acción de rechazo**: `rechazar` (busy) | `colgar` | `mensaje` (locución breve "Este número no acepta llamadas" y colgar). Default: `rechazar`.
- Al guardar, los cambios aplican a la siguiente llamada entrante (sin redeploy ni delay > 5 s).
- Cada regla puede activarse/desactivarse individualmente sin borrarla.
- Al crear la cuenta se genera un set de reglas por defecto (documentado arriba como defaults).

## Casos borde
- El usuario agrega el mismo número en lista blanca y negra → validación en frontend y constraint en DB lo impiden; mensaje "Este número ya está en la lista negra".
- Número en formato local (ej. `7777-7777`) → normalizar a E.164 con el país del perfil antes de guardar; si no es normalizable, rechazar el input con mensaje claro.
- Horario que cruza medianoche (22:00–06:00) → debe interpretarse correctamente como rango nocturno válido.
- Usuario borra todas sus reglas → se restauran los defaults (el sistema nunca opera sin configuración de reglas).
- Cambio de reglas mientras hay una llamada en curso → la llamada en curso no se ve afectada; aplica a la siguiente.

## Criterios de aceptación
- [ ] Un número agregado a lista negra es rechazado en la siguiente llamada de prueba.
- [ ] Un cambio de horario se refleja en la evaluación sin reiniciar ningún servicio.
- [ ] Todos los números persisten en formato E.164 (verificable por constraint/check en DB).
- [ ] Un usuario no puede ver ni modificar reglas de otro usuario (test de RLS).
- [ ] Desactivar una regla la excluye de la evaluación sin eliminar el registro.

## Dependencias
- Tabla `answering_rules` (ver `data/modelo-datos-core.md`).
- Regla de negocio `rules/evaluacion-reglas-llamada-entrante.md` (consumidor de esta configuración).
- Librería de normalización E.164 en frontend (`libphonenumber-js`).

## Fuera de alcance
- Reglas basadas en identidad del llamante vía CNAM/caller-name lookup (costo adicional Twilio; candidato a v2).
- Reglas por categoría de spam de terceros (bases de datos de spam externas).
- Desvío al número real del usuario.

## Notas técnicas
- UI con **React 19 + shadcn/ui + Tailwind v4**, siguiendo el design system del equipo
  (control de cambios: la spec original decía PrimeVue/Vue; el proyecto real usa React/shadcn).
- Escrituras vía `supabase-js` directo con RLS (no pasa por n8n): son datos del propio usuario.
- Autenticación con **Clerk** (no Supabase Auth): `answering_rules.user_id` es `text` y RLS usa
  `auth.jwt()->>'sub'`, consistente con `001_initial_schema.sql`.
- La "Acción de rechazo" global se modela como una regla singleton `reject_action`.

## Estado de implementación (2026-07-04)
- ✅ Implementado: UI de configuración (`/dashboard/rules`), normalización E.164
  (`libphonenumber-js`), persistencia con RLS (`supabase/migrations/003_answering_rules.sql`),
  defaults al primer uso, activar/desactivar y validación de conflicto whitelist/blacklist.
- ✅ Degradación elegante: "modo demo" en memoria cuando Supabase no está configurado.
- 🔗 Ver simulador de escenarios en `/dashboard/rules/simulator`.
- Código: `src/lib/rules/*`, `src/hooks/use-answering-rules.ts`, `src/components/rules/*`.
