const DEFAULT_ELEVENLABS_BASE_URL = "https://api.elevenlabs.io";

export function isVoiceCloningEnabled(): boolean {
  const flag = process.env.ELEVENLABS_VOICE_CLONING_ENABLED;
  if (flag === undefined || flag === "") {
    return true;
  }
  return flag === "true" || flag === "1";
}

export function getElevenLabsApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }
  return key;
}

export function getElevenLabsBaseUrl(): string {
  return (
    process.env.ELEVENLABS_API_BASE_URL?.trim().replace(/\/$/, "") ??
    DEFAULT_ELEVENLABS_BASE_URL
  );
}
