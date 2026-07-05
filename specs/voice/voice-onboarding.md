# Voice onboarding — consentimiento inicial

## Objetivo

Permitir que una persona recién registrada active la configuración de voz desde un flujo de onboarding, empezando por una pantalla de permiso explícito antes de grabar cualquier muestra.

## Alcance MVP

- Después de crear cuenta, el registro dirige a `/onboarding/voz`.
- La pantalla `/onboarding/voz` muestra:
  - Progreso de 4 pasos: Permiso, Grabar, Generar, Listo.
  - Explicación clara de por qué se pide la voz.
  - Tres garantías: duración breve, clon privado/cifrado, uso limitado a llamadas sospechosas.
  - Consentimiento explícito antes de habilitar “Empezar a grabar”.
  - Opción “Ahora no” hacia `/dashboard`.
- No se graba audio ni se llama a ElevenLabs en esta pantalla.

## Seguridad y privacidad

- La voz se trata como dato biométrico sensible.
- No se debe crear ni usar un clon sin consentimiento explícito.
- El copy debe decir que el usuario puede eliminarlo cuando quiera.
- El almacenamiento/cifrado/borrado real se implementará antes de conectar grabación o generación.

## Criterios de aceptación

- El botón “Empezar a grabar” está deshabilitado hasta aceptar el consentimiento.
- La pantalla usa tokens del design system y componentes existentes.
- El flujo de `sign-up` redirige a `/onboarding/voz`.
- La ruta está protegida por Clerk.
