# SPEC: Notificaciones de llamada procesada

- user_story: US-007
- autor: @noe
- fecha: 2026-07-04
- estado: borrador

## Descripción
Notifica al usuario cuando su número alternativo procesa una llamada: por **email** y/o **web
push**, según sus preferencias. La notificación de una llamada atendida incluye el resumen; la
de una llamada filtrada indica el motivo del bloqueo. Se implementa con patrón **outbox**: la
notificación se persiste primero y un despachador de n8n la envía con reintentos.

## Comportamiento esperado
- Preferencias en `/configuracion/notificaciones`: activar/desactivar por canal (email, push) y por tipo de evento (`atendida_con_resumen`, `bloqueada_por_regla`, `filtrada_por_silencio`). Defaults: email ON para atendidas, push ON para todo, bloqueadas solo push.
- Al persistirse un resumen (o cerrarse una llamada filtrada), n8n inserta filas en `notifications` (estado `pending`) según preferencias del usuario.
- Despachador n8n (trigger por inserción o schedule cada 1 min) toma `pending`, renderiza y envía:
  - **Email** (Resend/SMTP): asunto "📞 Llamada de {caller_name|número} — {category}"; cuerpo con resumen y link al detalle en el dashboard.
  - **Web push** (VAPID): título + primera oración del resumen; clic abre el detalle.
- Envío exitoso → `status = sent`, `sent_at`. Fallo → `attempts + 1` y reintento con backoff; a los 5 intentos → `status = failed` + evento en `system_events`.

## Casos borde
- Usuario sin suscripción push registrada pero con push activado → la notificación push se marca `failed` con motivo `no_subscription` sin reintentos; email no se ve afectado.
- Proveedor de email caído → las filas quedan `pending` y se despachan al recuperarse (ninguna notificación se pierde).
- Ráfaga de llamadas (10+ en 5 min) → agrupar: a partir de la 4.ª notificación en 5 minutos se envía una sola notificación agregada "Tienes N llamadas nuevas" (anti-fatiga).
- Usuario desactiva un canal con notificaciones `pending` en cola → las pendientes de ese canal se cancelan (`status = failed`, motivo `channel_disabled`).
- El resumen es degradado (`is_degraded = true`) → el email lo indica: "Resumen parcial, revisa la transcripción".

## Criterios de aceptación
- [ ] Una llamada atendida genera email + push (con defaults) en < 2 min tras finalizar.
- [ ] Con el proveedor de email simulado caído, la notificación se envía al restablecerse sin intervención manual.
- [ ] Ninguna notificación se envía por un canal desactivado en preferencias.
- [ ] La agrupación anti-ráfaga tiene test con 10 llamadas simuladas.
- [ ] Un usuario no puede leer notificaciones de otro (RLS).

## Dependencias
- Tabla `notifications` (outbox) y preferencias en `profiles` o tabla dedicada.
- Proveedor email (Resend o SMTP corporativo) con credencial en n8n.
- Service Worker + VAPID keys para web push en el frontend Vue.

## Fuera de alcance
- SMS/WhatsApp como canal.
- Notificaciones push nativas móviles (no hay app nativa).
- Digest diario/semanal.

## Notas técnicas
- Las plantillas de email viven versionadas en el repo (`/templates/email/*`), principio P4.
