# SPEC: Regla de negocio — Detección de silencio inicial (corte a los 5 segundos)

- nombre: Corte por silencio inicial del emisor
- autor: @noe
- fecha: 2026-07-04
- estado: borrador
- fuente: Flujo de producto definido por @noe — nodo K del flowchart ("¿El emisor comunica algo en los primeros 5 segundos?")

> **Modificado 2026-07-04 (cambio de comportamiento):** el `outcome` de silencio inicial pasa de `silent_hangup` a `no_answer` para unificar nomenclatura con la spec de feature `../calls/flujo-contestacion-agente-ia.md`. Se explicita que no se dispara el webhook post-llamada de transcripción. `sdd-qa` debe revisar los tests afectados.

## Descripción
Una vez que el agente de IA contesta la llamada y emite su saludo, si el emisor **no comunica
nada audible dentro de los primeros 5 segundos** posteriores al saludo, la llamada se considera
robocall/silenciosa y se **cierra automáticamente**. Este patrón (silencio inicial) es el
comportamiento típico de marcadores automáticos de spam.

## Inputs
- Evento de inicio de conversación del agente ElevenLabs (fin del saludo inicial).
- Stream de audio del emisor / eventos de detección de voz (VAD) del agente.

## Output
- `early_hangup`: boolean.
- Si `true` → el agente termina la llamada y la fila de `calls` se marca con `outcome = 'no_answer'`. **No** se genera resumen, **no** se dispara el webhook post-llamada de transcripción como si fuera una conversación normal, y **no** se consumen tokens de OpenAI. La llamada sí aparece en el dashboard como llamada sin respuesta (silenciosa). El registro va a la misma colección/tabla `calls` que las demás llamadas, pero con los campos de transcripción y resumen vacíos.

## Condiciones

| Condición | Resultado |
|---|---|
| Voz humana o audio con habla detectado en ≤ 5 s tras el saludo | Continuar conversación (regla no aplica) |
| Silencio o ruido sin habla durante > 5 s tras el saludo | Cerrar llamada, `outcome = no_answer`, sin resumen ni webhook de transcripción |
| El emisor cuelga antes de los 5 s | Cerrar flujo, `outcome = caller_hangup` |

## Excepciones
- Tonos DTMF no cuentan como "comunicar algo": muchos robocalls emiten tonos; se tratan como silencio.
- Si la plataforma no puede medir el silencio con exactitud (limitación del proveedor), se acepta un margen de 5 ± 2 s; el valor se configura en el agente (`turn timeout` / mensaje de inactividad de ElevenLabs) y se documenta el valor real usado.

## Ejemplos
1. Agente saluda, emisor dice "Hola, le llamo de..." a los 2 s → conversación continúa.
2. Agente saluda, 6 s de silencio → agente cuelga, llamada registrada como `no_answer`, sin resumen ni webhook de transcripción.
3. Agente saluda, se escucha música de espera sin habla por 8 s → cuelga, `no_answer`.
4. Emisor cuelga al segundo 1 → `caller_hangup`, sin resumen.

## Criterios de aceptación
- [ ] Una llamada de prueba en silencio se corta en ≤ 7 s tras el saludo (margen documentado).
- [ ] Las llamadas cortadas por silencio no generan resumen ni consumen tokens de OpenAI.
- [ ] El `outcome` correcto queda persistido y visible en el dashboard.

## Notas técnicas
- Implementación preferente: configuración nativa del agente ElevenLabs (timeout de inactividad
  de primer turno). Evitar implementar VAD propio en n8n — no está en el camino del audio.
