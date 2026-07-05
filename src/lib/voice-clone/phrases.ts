<<<<<<< HEAD
<<<<<<< HEAD
/** Frases de onboarding — 3 muestras (~5 s mínimo c/u). */
=======
/** Frases de onboarding — 3 muestras (~20 s c/u ≈ 1 min total, recomendado por ElevenLabs IVC). */
>>>>>>> 8a53055 (Enhance voice cloning features and onboarding process)
=======
/** Frases de onboarding — 3 muestras (~5 s mínimo c/u). */
>>>>>>> 555a6a5 (Add answering rules management and validation features)
export const VOICE_RECORDING_PHRASES = [
  "Hola, gracias por llamar. ¿De parte de quién y cuál es el motivo de tu llamada?",
  "Entiendo. No puedo compartir datos personales, pero puedo registrar tu solicitud y pasarle el mensaje.",
  "Perfecto, dejo registrado el motivo de la llamada. Que tengas buen día.",
] as const;

export const VOICE_PHRASE_COUNT = VOICE_RECORDING_PHRASES.length;
