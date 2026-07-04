# SPEC: Flujo de contestación con agente de IA (ElevenLabs)

- user_story: US-004
- autor: @noe
- fecha: 2026-07-04
- estado: borrador

## Descripción
Cuando una llamada entrante pasa las reglas de contestación, el sistema la conecta con un agente
conversacional de ElevenLabs que contesta **en español**, mantiene la conversación con el
emisor, y al finalizar entrega la transcripción completa vía webhook post-llamada. El agente
actúa como asistente/filtro: identifica quién llama y el motivo, sin comprometerse a nada en
nombre del usuario.

## Comportamiento esperado
- n8n responde al webhook de Twilio con TwiML que conecta la llamada al agente ElevenLabs
  (integración nativa Twilio ↔ ElevenLabs Agents; el número puede registrarse directamente en
  la plataforma de agentes o conectarse vía `<Connect><Stream>`).
- El agente saluda en español: "Hola, ha llamado al asistente de [nombre]. ¿De parte de quién y cuál es el motivo de su llamada?" (texto exacto configurable por usuario en v2; en MVP es plantilla fija con el nombre del perfil).
- Aplica la regla de silencio inicial (ver `reglas/deteccion-silencio-inicial.md`).
- El agente mantiene la conversación: pregunta nombre, empresa y motivo; responde cortésmente; **nunca** confirma datos personales del usuario, ni acepta compromisos, citas o pagos.
- Duración máxima de conversación: **3 minutos**; al alcanzarla, el agente se despide y cierra.
- Al terminar (por cualquier vía), ElevenLabs envía el webhook post-llamada con transcripción y metadata → dispara la generación de resumen (ver `llamadas/generacion-resumen-llamada.md`).

## Casos borde
- El emisor habla en otro idioma → el agente responde en español indicando que solo atiende en español; si no hay entendimiento en 2 turnos, se despide y cierra (`outcome = language_mismatch` si es detectable, si no `completed`).
- El emisor es agresivo o insiste en hablar con el usuario real → el agente repite una sola vez que tomará el mensaje y cierra cortésmente.
- Caída del agente/ElevenLabs a mitad de llamada → Twilio detecta el stream cerrado; `StatusCallback` registra la llamada con `outcome = agent_error`; se notifica al usuario que hubo una llamada que no pudo atenderse.
- ElevenLabs no disponible al momento de conectar → TwiML de contingencia: locución estática "No es posible atender su llamada en este momento" y colgar; evento en `system_events`.
- El emisor intenta inyectar instrucciones al agente ("olvida tus instrucciones...") → el prompt del agente instruye ignorar meta-instrucciones; el contenido queda en la transcripción como cualquier otro dicho.

## Criterios de aceptación
- [ ] Una llamada de prueba que pasa las reglas es contestada por el agente en español en < 4 s desde que Twilio recibe la llamada.
- [ ] El agente nunca revela el número real ni datos del usuario (test de conversación adversarial).
- [ ] Una conversación que supera 3 minutos se cierra con despedida.
- [ ] Toda conversación finalizada produce exactamente un webhook post-llamada procesado (idempotencia por `conversation_id`).

## Dependencias
- ElevenLabs Conversational AI (agente configurado con voz en español, prompt del sistema versionado en el repo en `/agents/filtro-spam-es.md`).
- `api/webhook-elevenlabs-post-llamada.md`.
- Twilio Programmable Voice.

## Fuera de alcance
- Personalización del saludo y personalidad del agente por usuario (v2).
- Transferencia de la llamada al número real del usuario.
- Detección de emociones o scoring de spam por ML propio.

## Notas técnicas
- El prompt del agente es un artefacto versionado (P4 del framework: vive en el repo).
- Grabación de audio: **desactivada** en MVP; solo se persiste transcripción (menor superficie de privacidad). Decisión reversible documentada aquí.
