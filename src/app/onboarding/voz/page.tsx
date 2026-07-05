"use client";

import Link from "next/link";
import {
  AlertCircle,
  Check,
  FileText,
  Mic,
  PhoneCall,
  Search,
  Square,
  Volume2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GhostLineLogo } from "@/components/brand/ghostline-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import {
  createVoiceClone,
  updateVoiceProfileSettings,
} from "@/lib/voice-clone/client";
import type { PublicVoiceProfile } from "@/lib/voice-clone/types";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { VOICE_SAMPLE_MIN_DURATION_MS } from "@/lib/voice-clone/constants";
import { VOICE_RECORDING_PHRASES } from "@/lib/voice-clone/phrases";

const steps = ["Permiso", "Grabar", "Generar", "Listo"] as const;
const recordingPhrases = VOICE_RECORDING_PHRASES;

type ClonePhase = "uploading" | "creating" | "done" | "error";

export default function VoiceOnboardingPage() {
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(1);
  const [samples, setSamples] = useState<(Blob | null)[]>(
    () => Array.from({ length: recordingPhrases.length }, () => null),
  );
  const [clonePhase, setClonePhase] = useState<ClonePhase>("uploading");
  const [cloneProgress, setCloneProgress] = useState(12);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicVoiceProfile | null>(null);
  const cloneStartedRef = useRef(false);

  const runClone = useCallback(async (recordedSamples: Blob[]) => {
    setClonePhase("uploading");
    setCloneProgress(20);
    setCloneError(null);

    try {
      setClonePhase("creating");
      setCloneProgress(55);

      const result = await createVoiceClone({ samples: recordedSamples });

      setCloneProgress(100);
      setClonePhase("done");
      setProfile(result);
      setStep(3);
    } catch (error) {
      setClonePhase("error");
      setCloneError(
        error instanceof Error
          ? error.message
          : "No se pudo generar el clon de voz.",
      );
    }
  }, []);

  useEffect(() => {
    if (step !== 2 || cloneStartedRef.current) {
      return;
    }

    cloneStartedRef.current = true;

    const recordedSamples = samples.filter(
      (sample): sample is Blob => sample !== null,
    );

    void runClone(recordedSamples);
  }, [runClone, samples, step]);

  useEffect(() => {
    if (step !== 2 || clonePhase === "error" || clonePhase === "done") {
      return;
    }

    const timer = window.setInterval(() => {
      setCloneProgress((current) => {
        if (current >= 90) {
          return current;
        }
        return current + 4;
      });
    }, 400);

    return () => window.clearInterval(timer);
  }, [clonePhase, step]);

  const resetRecording = useCallback(() => {
    cloneStartedRef.current = false;
    setSamples(Array.from({ length: recordingPhrases.length }, () => null));
    setPhraseIndex(1);
    setClonePhase("uploading");
    setCloneProgress(12);
    setCloneError(null);
    setProfile(null);
    setStep(1);
  }, []);

  const handleAllPhrasesRecorded = useCallback(() => {
    cloneStartedRef.current = false;
    setStep(2);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="grid min-h-16 grid-cols-[1fr_auto_1fr] items-center border-b border-border px-5 sm:px-8">
        <GhostLineLogo markClassName="size-7" />
        <p className="hidden text-sm font-semibold text-muted-foreground sm:block">
          Configuración de voz
        </p>
        <Link
          href={routes.dashboard}
          className="justify-self-end rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Cerrar configuración de voz"
        >
          <X className="size-5" aria-hidden />
        </Link>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 pb-16 pt-8 sm:px-6">
        <VoiceStepper current={step} />

        <div className="mt-10 w-full">
          {step === 0 && (
            <PermissionStep
              consent={consent}
              onConsentChange={setConsent}
              onStart={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <RecordStep
              phraseIndex={phraseIndex}
              samples={samples}
              onSampleRecorded={(index, blob) => {
                setSamples((current) => {
                  const next = [...current];
                  next[index] = blob;
                  return next;
                });
              }}
              onRepeat={() => {
                setSamples((current) => {
                  const next = [...current];
                  next[phraseIndex - 1] = null;
                  return next;
                });
              }}
              onNext={() => {
                if (phraseIndex >= recordingPhrases.length) {
                  handleAllPhrasesRecorded();
                } else {
                  setPhraseIndex((current) => current + 1);
                }
              }}
            />
          )}
          {step === 2 && (
            <GenerateStep
              progress={cloneProgress}
              phase={clonePhase}
              error={cloneError}
              onRetry={resetRecording}
            />
          )}
          {step === 3 && profile && (
            <ReviewStep profile={profile} onBack={resetRecording} />
          )}
        </div>
      </section>
    </main>
  );
}

function VoiceStepper({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
      {steps.map((label, index) => {
        const isDone = index < current;
        const isActive = index === current;

        return (
          <li key={label} className="flex items-center gap-2">
            {index > 0 && <span className="h-px w-8 bg-border" aria-hidden />}
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full bg-secondary text-xs text-muted-foreground",
                (isDone || isActive) && "bg-primary text-primary-foreground",
              )}
            >
              {isDone ? <Check className="size-4" aria-hidden /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden text-muted-foreground sm:inline",
                (isDone || isActive) && "text-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function PermissionStep({
  consent,
  onConsentChange,
  onStart,
}: {
  consent: boolean;
  onConsentChange: (checked: boolean) => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <IconBubble icon={Mic} />
      <h1 className="mt-6 font-display text-4xl font-black leading-tight sm:text-5xl">
        Clona tu voz para responder por ti
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        Cuando entra una llamada sospechosa, GhostLine puede contestar con tu
        voz clonada y mantener al estafador en línea para descubrir qué busca:
        qué datos quiere robar, a nombre de quién y cómo opera. Tú te quedas
        tranquilo, nosotros reunimos la evidencia.
      </p>

      <Card className="mt-6 w-full gap-0 py-0 text-left shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <ConsentPoint>Leerás 3 frases en voz alta (~1 minuto en total).</ConsentPoint>
          <ConsentPoint>Creamos un clon privado, cifrado y solo tuyo.</ConsentPoint>
          <ConsentPoint>
            Se usa únicamente para atender llamadas de estafa.
          </ConsentPoint>
        </CardContent>
      </Card>

      <label className="mt-5 flex w-full cursor-pointer gap-3 rounded-xl bg-secondary p-4 text-left text-sm leading-6">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => onConsentChange(event.currentTarget.checked)}
          className="mt-1 size-5 rounded border-border accent-primary"
        />
        <span>
          Autorizo a GhostLine a crear y usar un clon de mi voz para atender
          llamadas sospechosas. Es un dato biométrico sensible: se cifra y
          puedo eliminarlo cuando quiera.
        </span>
      </label>

      <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" size="lg">
          <Link href={routes.dashboard}>Ahora no</Link>
        </Button>
        <Button size="lg" disabled={!consent} onClick={onStart}>
          Empezar a grabar
          <Mic data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}

function RecordStep({
  phraseIndex,
  samples,
  onSampleRecorded,
  onRepeat,
  onNext,
}: {
  phraseIndex: number;
  samples: (Blob | null)[];
  onSampleRecorded: (index: number, blob: Blob) => void;
  onRepeat: () => void;
  onNext: () => void;
}) {
  const phrase = recordingPhrases[phraseIndex - 1];
  const currentSample = samples[phraseIndex - 1];
  const recorder = useAudioRecorder();
  const [error, setError] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  const completedCount = samples.filter(Boolean).length;
  const minDurationMs = VOICE_SAMPLE_MIN_DURATION_MS;
  const hasMinDuration = recorder.durationMs >= minDurationMs;
  const canContinue =
    currentSample !== null && !recorder.isRecording && !isStopping;

  const handleToggleRecording = async () => {
    setError(null);

    if (recorder.isRecording) {
      if (!hasMinDuration) {
        setError(
          `Graba al menos ${Math.round(minDurationMs / 1000)} segundos antes de cortar.`,
        );
        return;
      }

      setIsStopping(true);
      try {
        const blob = await recorder.stop();
        onSampleRecorded(phraseIndex - 1, blob);
      } catch (recordError) {
        setError(
          recordError instanceof Error
            ? recordError.message
            : "No se pudo guardar la grabación.",
        );
      } finally {
        setIsStopping(false);
      }
      return;
    }

    try {
      await recorder.start();
    } catch (recordError) {
      setError(
        recordError instanceof Error
          ? recordError.message
          : "No se pudo iniciar la grabación.",
      );
    }
  };

  const activeBars = recorder.isRecording || currentSample ? 18 : 6;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <h1 className="font-display text-4xl font-black leading-tight sm:text-5xl">
        Graba tu voz
      </h1>
      <p className="mt-6 text-base text-muted-foreground">
        Lee esta frase con tu tono natural:
      </p>
      <div className="mt-5 rounded-2xl bg-secondary px-6 py-7">
        <p className="font-display text-2xl font-black leading-tight text-primary sm:text-3xl">
          «{phrase}»
        </p>
      </div>

      <Waveform className="mt-8" activeBars={activeBars} />

      <div className="mt-7 flex items-center gap-5">
        <button
          type="button"
          onClick={() => void handleToggleRecording()}
          disabled={isStopping}
          className={cn(
            "flex size-16 items-center justify-center rounded-full transition-colors",
            recorder.isRecording
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary hover:bg-primary/15",
          )}
          aria-label={
            recorder.isRecording ? "Detener grabación" : "Iniciar grabación"
          }
        >
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              recorder.isRecording
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground",
            )}
          >
            {recorder.isRecording ? (
              <Square className="size-5 fill-current" aria-hidden />
            ) : (
              <Mic className="size-5" aria-hidden />
            )}
          </span>
        </button>
        <div className="text-left">
          <p
            className={cn(
              "font-semibold",
              recorder.isRecording ? "text-destructive" : "text-foreground",
            )}
          >
            {recorder.isRecording
              ? "Grabando..."
              : currentSample
                ? "Frase guardada"
                : "Toca para grabar"}
          </p>
          <p className="text-sm text-muted-foreground">
            {recorder.isRecording
              ? hasMinDuration
                ? `${recorder.formatDuration(recorder.durationMs)} · toca para cortar`
                : `${recorder.formatDuration(recorder.durationMs)} · mínimo ${Math.round(minDurationMs / 1000)} s`
              : currentSample
                ? "Puedes repetir o continuar"
                : `Graba ~${Math.round(minDurationMs / 1000)} s por frase antes de continuar`}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="mt-7 flex items-center gap-2 text-sm font-semibold">
        <span>
          Frase {phraseIndex} de {recordingPhrases.length}
        </span>
        <PhraseDots current={phraseIndex} completedCount={completedCount} />
      </div>

      <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onRepeat}
          disabled={recorder.isRecording || isStopping}
        >
          Repetir
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canContinue}
        >
          {phraseIndex >= recordingPhrases.length
            ? "Generar clon"
            : "Siguiente frase"}
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Consejo: habla claro, en un lugar silencioso, y mantén cada frase al
        menos {Math.round(VOICE_SAMPLE_MIN_DURATION_MS / 1000)} segundos.
      </p>
    </div>
  );
}

function GenerateStep({
  progress,
  phase,
  error,
  onRetry,
}: {
  progress: number;
  phase: ClonePhase;
  error: string | null;
  onRetry: () => void;
}) {
  if (phase === "error") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <IconBubble icon={AlertCircle} />
        <h1 className="mt-6 font-display text-4xl font-black leading-tight sm:text-5xl">
          No pudimos generar tu clon
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          {error ??
            "Ocurrió un error al procesar tus muestras. Puedes volver a grabar e intentarlo."}
        </p>
        <Button className="mt-8" size="lg" onClick={onRetry}>
          Volver a grabar
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <IconBubble icon={Volume2} size="lg" />
      <h1 className="mt-7 font-display text-4xl font-black leading-tight sm:text-5xl">
        Generando tu clon de voz...
      </h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
        Esto toma cerca de un minuto. Entrenamos un modelo privado solo con tus
        muestras; nada se comparte.
      </p>

      <div className="mt-7 w-full">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {phase === "uploading"
              ? "Enviando muestras"
              : "Sintetizando tu voz"}
          </span>
          <span className="font-semibold">{progress}%</span>
        </div>
      </div>

      <Card className="mt-6 w-full gap-0 py-0 text-left shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <ProcessLine done={progress >= 20}>Muestras recibidas</ProcessLine>
          <ProcessLine done={progress >= 55}>
            Analizando timbre y entonación
          </ProcessLine>
          <ProcessLine active={progress < 100}>
            Sintetizando tu voz
          </ProcessLine>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewStep({
  profile,
  onBack,
}: {
  profile: PublicVoiceProfile;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<
    "prudente" | "equilibrado" | "detective"
  >(profile.interactionMode as "prudente" | "equilibrado" | "detective");
  const [voiceName, setVoiceName] = useState(profile.displayName);
  const [useVoice, setUseVoice] = useState(profile.useForSuspiciousCalls);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const needsVerification =
    profile.status === "verification_required" || profile.requiresVerification;

  const handleFinish = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await updateVoiceProfileSettings({
        displayName: voiceName,
        useForSuspiciousCalls: useVoice,
        interactionMode: mode,
        completeOnboarding: true,
      });
      window.location.href = routes.dashboard;
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los ajustes.",
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <IconBubble icon={Check} />
      <h1 className="mt-6 font-display text-4xl font-black leading-tight sm:text-5xl">
        {needsVerification
          ? "Clon creado — verificación pendiente"
          : "¡Tu clon de voz está listo!"}
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
        {needsVerification
          ? "ElevenLabs puede requerir verificación adicional antes de usar tu voz en llamadas. Mientras tanto, puedes guardar tus preferencias."
          : "GhostLine ya puede contestar las estafas con tu voz y sacarles información sin que tú tengas que atender."}
      </p>

      {needsVerification && (
        <Card className="mt-5 w-full gap-0 py-0 text-left shadow-none">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm leading-6 text-muted-foreground">
              Tu clon fue creado pero ElevenLabs marcó que requiere verificación.
              Te avisaremos cuando esté listo para usarse en llamadas.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 w-full gap-0 py-0 text-left shadow-none">
        <CardHeader className="px-5 pt-5 pb-2">
          <CardTitle>Cómo se usa en las llamadas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-5 pt-2">
          <UsageLine icon={PhoneCall} title="Contesta con tu voz">
            Suena natural, como si atendieras tú.
          </UsageLine>
          <UsageLine icon={Volume2} title="Mantiene al estafador hablando">
            Gana tiempo y lo deja explicarse.
          </UsageLine>
          <UsageLine icon={Search} title="Extrae qué busca">
            Qué datos quiere, a quién suplanta y cómo opera.
          </UsageLine>
          <UsageLine icon={FileText} title="Te deja el reporte">
            Resumen y evidencia en tu panel.
          </UsageLine>
        </CardContent>
      </Card>

      <Card className="mt-5 w-full gap-0 py-0 text-left shadow-none">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="font-semibold">Usar mi voz en llamadas sospechosas</p>
            <p className="text-sm text-muted-foreground">
              Se activa solo cuando una regla marca la llamada como sospechosa.
            </p>
          </div>
          <Switch checked={useVoice} onCheckedChange={setUseVoice} />
        </CardContent>
      </Card>

      <Card className="mt-5 w-full gap-0 py-0 text-left shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Nombre de la voz</span>
            <Input
              value={voiceName}
              onChange={(event) => setVoiceName(event.currentTarget.value)}
            />
          </label>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Nivel de interacción</p>
            <div className="grid rounded-xl bg-muted p-1 sm:grid-cols-3">
              {(["prudente", "equilibrado", "detective"] as const).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMode(option)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors",
                      mode === option &&
                        "bg-primary text-primary-foreground shadow-sm",
                    )}
                  >
                    {option[0].toUpperCase()}
                    {option.slice(1)}
                  </button>
                ),
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Equilibrado: hace preguntas para descubrir la intención sin
              levantar sospechas.
            </p>
          </div>
        </CardContent>
      </Card>

      {saveError && (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {saveError}
        </p>
      )}

      <div className="mt-5 grid w-full gap-3 sm:grid-cols-2">
        <Button variant="outline" size="lg" onClick={onBack} disabled={isSaving}>
          Volver a grabar
        </Button>
        <Button size="lg" onClick={() => void handleFinish()} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Ir al panel"}
          <Check data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}

function IconBubble({
  icon: Icon,
  size = "default",
}: {
  icon: LucideIcon;
  size?: "default" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-secondary text-primary",
        size === "lg" ? "size-24" : "size-16",
      )}
    >
      <Icon className={cn(size === "lg" ? "size-12" : "size-8")} aria-hidden />
    </div>
  );
}

function ConsentPoint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Check className="size-4" aria-hidden />
      </span>
      <p className="text-sm font-semibold leading-6">{children}</p>
    </div>
  );
}

function PhraseDots({
  current,
  completedCount,
}: {
  current: number;
  completedCount: number;
}) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {recordingPhrases.map((_, index) => (
        <span
          key={index}
          className={cn(
            "size-2 rounded-full bg-muted",
            (index + 1 <= current || index < completedCount) && "bg-primary",
          )}
        />
      ))}
    </div>
  );
}

function Waveform({
  activeBars,
  className,
}: {
  activeBars: number;
  className?: string;
}) {
  const bars = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => {
        const height = 14 + ((index * 7) % 32);
        return { height, active: index < activeBars };
      }),
    [activeBars],
  );

  return (
    <div className={cn("flex h-16 items-center justify-center gap-1", className)}>
      {bars.map((bar, index) => (
        <span
          key={index}
          className={cn(
            "w-1 rounded-full bg-border",
            bar.active && "bg-primary",
          )}
          style={{ height: `${bar.height}px` }}
        />
      ))}
    </div>
  );
}

function ProcessLine({
  children,
  done = false,
  active = false,
}: {
  children: React.ReactNode;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full bg-secondary text-primary",
          active && "bg-primary text-primary-foreground",
        )}
      >
        {done ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <span className="size-2 rounded-full bg-current" />
        )}
      </span>
      <p
        className={cn(
          "text-muted-foreground",
          active && "font-semibold text-foreground",
        )}
      >
        {children}
      </p>
    </div>
  );
}

function UsageLine({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
