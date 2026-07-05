"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioRecorderState = "idle" | "recording" | "denied" | "unsupported";

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>("idle");
  const [durationMs, setDurationMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      releaseStream();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [clearTimer, releaseStream]);

  const start = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setState("unsupported");
      throw new Error("Tu navegador no soporta grabación de audio.");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setDurationMs(0);
      setState("recording");

      timerRef.current = window.setInterval(() => {
        setDurationMs((current) => current + 100);
      }, 100);
    } catch {
      setState("denied");
      releaseStream();
      throw new Error(
        "No pudimos acceder al micrófono. Revisa los permisos del navegador.",
      );
    }
  }, [releaseStream]);

  const stop = useCallback(async (): Promise<Blob> => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      setState("idle");
      throw new Error("No hay una grabación activa.");
    }

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        clearTimer();
        releaseStream();
        setState("idle");

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (blob.size === 0) {
          reject(new Error("La grabación quedó vacía. Intenta de nuevo."));
          return;
        }

        resolve(blob);
      };

      recorder.onerror = () => {
        clearTimer();
        releaseStream();
        setState("idle");
        reject(new Error("Ocurrió un error al grabar."));
      };

      recorder.stop();
    });
  }, [clearTimer, releaseStream]);

  const formatDuration = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    state,
    durationMs,
    isRecording: state === "recording",
    start,
    stop,
    formatDuration,
  };
}
