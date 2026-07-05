# Voice clone onboarding

## Objetivo

Permitir que una persona configure, de forma explícita y reversible, una voz clonada para que GhostLine pueda responder llamadas sospechosas y obtener contexto sin que la persona tenga que atender.

## Alcance MVP

- Ruta protegida: `/onboarding/voz` (Clerk `auth.protect()` vía middleware).
- Flujo visual: permiso → grabar (3 frases) → generar → listo.
- Consentimiento explícito antes de grabar; versión auditable (`2026-07-05-v1`).
- Grabación real con `MediaRecorder`; subida vía `POST /api/voice-clone` (server-only).
- Clonado con ElevenLabs Instant Voice Cloning (`POST /v1/voices/add`).
- Persistencia de metadatos en `user_voice_profiles`; **no** se guarda audio crudo en Supabase.
- Al finalizar, enviar a `/dashboard` y marcar `users.onboarding_completed = true`.

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/voice-clone` | Sube muestras, crea clon en ElevenLabs, persiste perfil |
| `GET` | `/api/voice-clone` | Devuelve perfil activo del usuario |
| `PATCH` | `/api/voice-clone` | Actualiza nombre, activación e interacción |
| `DELETE` | `/api/voice-clone` | Revoca perfil y elimina voz en ElevenLabs |

### Validación de muestras (POST)

- Mínimo 3 archivos (una por frase), máximo 3.
- ~12 segundos mínimo por frase (~36 s total; ElevenLabs recomienda ~1 min).
- Tamaño máximo por archivo: 10 MB.
- Tipos permitidos: `audio/webm`, `audio/mp4`, `audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/x-m4a`.
- Campo `consent` debe ser `"true"`; `consent_version` obligatorio.

### Estados del perfil

| Estado | Significado |
|--------|-------------|
| `pending` | Creación en curso |
| `ready` | Clon listo para usar |
| `verification_required` | ElevenLabs exige verificación adicional |
| `failed` | Error en creación (ver `error_message`) |
| `revoked` | Usuario eliminó el clon |

## Seguridad y privacidad (threat model resumido)

| Amenaza | Mitigación |
|---------|------------|
| Exfiltración de API key ElevenLabs | Solo servidor; nunca en cliente |
| Audio interceptado en tránsito | HTTPS; muestras no persistidas en DB |
| Clon sin consentimiento | Checkbox + `consented_at` + evento `consent_given` |
| Usuario accede a voz ajena | RLS + filtro `user_id` en API |
| Imposibilidad de borrar | `DELETE /api/voice-clone` + `DELETE /v1/voices/{id}` |
| Agente global con voz del último usuario | n8n pasa `voice_id` por override por llamada (ver `integrations/n8n/voice-override.md`) |

La voz es dato biométrico sensible:

- Consentimiento explícito y auditable (`voice_clone_events`).
- Cifrado en tránsito (TLS) y en reposo (Supabase/ElevenLabs).
- Borrado/revocación desde onboarding o ajustes (futuro).
- Muestras crudas efímeras: se envían a ElevenLabs y no se almacenan en GhostLine.

## Criterios de aceptación

- El registro nuevo redirige al flujo de voz antes del dashboard.
- El primer paso no permite iniciar sin aceptar el consentimiento.
- El flujo reproduce los frames `voz-1-permiso.png` a `voz-5-listo.png`.
- Todos los estilos usan tokens del design system, sin colores hard-codeados.
- El botón final lleva al dashboard.
- Sin permiso de micrófono se muestra error claro.
- Si ElevenLabs devuelve `requires_verification`, la UI lo comunica.
- Reintento tras error permite volver a grabar.

## Dependencias

- `ELEVENLABS_API_KEY` en servidor.
- `ELEVENLABS_VOICE_CLONING_ENABLED=true` (feature flag).
- Supabase migración `004_user_voice_profiles.sql`.

## Fuera de alcance (MVP)

- Almacenamiento de muestras crudas en Storage.
- Re-clonación desde ajustes (`/settings/voz`).
- Verificación manual en dashboard ElevenLabs desde GhostLine.
