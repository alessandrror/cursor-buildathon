# Voice clone onboarding

## Objetivo

Permitir que una persona configure, de forma explícita y reversible, una voz clonada para que GhostLine pueda responder llamadas sospechosas y obtener contexto sin que la persona tenga que atender.

## Alcance MVP

- Ruta protegida: `/onboarding/voz`.
- Flujo visual de 5 pasos: permiso, grabar, generar, escuchar, listo.
- Consentimiento explícito antes de grabar.
- No persistir audio ni voz clonada desde el frontend hasta que exista backend seguro.
- Al finalizar, enviar a `/dashboard`.

## Seguridad y privacidad

La voz es dato biométrico sensible. Antes de habilitar persistencia real se requiere:

- Consentimiento explícito y auditable.
- Cifrado en tránsito y en reposo.
- Borrado/revocación desde ajustes.
- Separar muestras crudas de la voz sintetizada.
- Threat model dedicado antes de producción.

## Criterios de aceptación

- El registro nuevo redirige al flujo de voz antes del dashboard.
- El primer paso no permite iniciar sin aceptar el consentimiento.
- El flujo reproduce los frames `voz-1-permiso.png` a `voz-5-listo.png`.
- Todos los estilos usan tokens del design system, sin colores hard-codeados.
- El botón final lleva al dashboard.
