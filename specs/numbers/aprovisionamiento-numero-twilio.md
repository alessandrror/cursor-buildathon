# SPEC: Aprovisionamiento de número alternativo (Twilio)

- user_story: US-002
- autor: @noe
- fecha: 2026-07-04
- estado: borrador

## Descripción
Al completar el registro, el sistema asigna al usuario un número telefónico alternativo comprado
vía Twilio. El usuario puede elegir país/prefijo entre los disponibles o aceptar el sugerido. El
número queda configurado automáticamente con el webhook de voz apuntando a n8n y con la
Fallback URL de contingencia.

## Comportamiento esperado
- En `/onboarding`, el usuario selecciona país (default: el del perfil) y opcionalmente un prefijo/área.
- El frontend invoca el flujo n8n `provision-number` (endpoint autenticado con el JWT de Supabase), que:
  1. Busca números disponibles con `AvailablePhoneNumbers` de Twilio (capacidad: voice).
  2. Compra el primero disponible (`IncomingPhoneNumbers.create`).
  3. Configura `VoiceUrl` = webhook n8n de llamada entrante, `VoiceFallbackUrl` = TwiML Bin estático, `StatusCallback` = webhook de estado.
  4. Inserta la fila en `phone_numbers` asociada al usuario, estado `active`.
- El usuario ve su número asignado en pantalla con opción de copiarlo, y avanza a la configuración de reglas.
- Un usuario tiene exactamente **un** número activo en el MVP.

## Casos borde
- No hay números disponibles para el país/prefijo → mostrar "No hay números disponibles en esa zona" y ofrecer otro prefijo; no dejar al usuario bloqueado.
- La compra en Twilio se completa pero la inserción en Supabase falla → el flujo n8n reintenta la inserción 3 veces; si falla, libera el número en Twilio (`delete`) y registra el evento en `system_events` (nunca dejar números comprados huérfanos, cuestan dinero).
- El usuario abandona el onboarding sin aprovisionar → al volver a iniciar sesión se le redirige a `/onboarding` hasta completarlo.
- Doble clic / doble submit → el flujo es idempotente por `user_id`: si ya existe un número `active` para el usuario, devuelve ese número en lugar de comprar otro.
- Saldo insuficiente en la cuenta Twilio → error controlado, alerta al equipo vía Error Workflow, mensaje al usuario "Estamos aprovisionando tu número, te avisaremos por correo" y reintento diferido.

## Criterios de aceptación
- [ ] Un usuario nuevo obtiene un número activo con `VoiceUrl` y `VoiceFallbackUrl` correctamente configurados (verificable en la consola de Twilio).
- [ ] Un segundo intento de aprovisionamiento para el mismo usuario no compra un segundo número.
- [ ] Si falla la persistencia, el número comprado se libera en Twilio (verificable en test de integración con sandbox).
- [ ] El número aparece en el dashboard del usuario inmediatamente después del onboarding.

## Dependencias
- Twilio: `AvailablePhoneNumbers`, `IncomingPhoneNumbers` (credenciales en n8n, nunca en frontend).
- Spec `api/webhook-twilio-llamada-entrante.md` (la VoiceUrl que se configura).
- Tabla `phone_numbers` (ver `datos/modelo-datos-core.md`).

## Fuera_de_alcance
- Portar el número real del usuario.
- Múltiples números por usuario.
- Liberación/cambio de número self-service (se hace por soporte en MVP).

## Notas técnicas
- El flujo n8n valida el JWT de Supabase (verificación de firma con el JWKS del proyecto) antes de ejecutar cualquier acción de compra.
- Costo: registrar en la fila el `twilio_sid` del número para trazabilidad de facturación.
