"use client";

import Link from "next/link";
import {
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
import { useEffect, useMemo, useState } from "react";

import { GhostLineLogo } from "@/components/brand/ghostline-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const steps = ["Permiso", "Grabar", "Generar", "Listo"] as const;

const recordingPhrases = [
  "Hola, gracias por llamar. ¿De parte de quién y cuál es el motivo de tu llamada?",
  "Entiendo. ¿Puedes decirme tu nombre y de qué empresa llamas?",
  "Voy a tomar el mensaje para que la persona lo revise con calma.",
  "No puedo compartir datos personales, pero puedo registrar tu solicitud.",
  "Perfecto, dejo registrado el motivo de la llamada. Que tengas buen día.",
];

export default function VoiceOnboardingPage() {
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(1);
  const [progress, setProgress] = useState(62);
  const [useVoice, setUseVoice] = useState(true);

  useEffect(() => {
    if (step !== 2) {
      return;
    }

    setProgress(12);
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return current + 10;
      });
    }, 350);

    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step === 2 && progress >= 100) {
      const timer = window.setTimeout(() => setStep(3), 450);
      return () => window.clearTimeout(timer);
    }
  }, [progress, step]);

  const canContinueRecording = phraseIndex >= recordingPhrases.length;

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
              onRepeat={() => setPhraseIndex((current) => Math.max(1, current))}
              onNext={() => {
                if (canContinueRecording) {
                  setStep(2);
                } else {
                  setPhraseIndex((current) => current + 1);
                }
              }}
            />
          )}
          {step === 2 && <GenerateStep progress={progress} />}
          {step === 3 && (
            <ReviewStep
              useVoice={useVoice}
              onUseVoiceChange={setUseVoice}
              onBack={() => {
                setPhraseIndex(1);
                setStep(1);
              }}
            />
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
          <ConsentPoint>Leerás 5 frases en voz alta (~1 minuto).</ConsentPoint>
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
  onRepeat,
  onNext,
}: {
  phraseIndex: number;
  onRepeat: () => void;
  onNext: () => void;
}) {
  const phrase = recordingPhrases[phraseIndex - 1];

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

      <Waveform className="mt-8" activeBars={18} />

      <div className="mt-7 flex items-center gap-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <Square className="size-5 fill-current" aria-hidden />
          </span>
        </span>
        <div className="text-left">
          <p className="font-semibold text-destructive">Grabando...</p>
          <p className="text-sm text-muted-foreground">0:08 · toca para cortar</p>
        </div>
      </div>

      <div className="mt-7 flex items-center gap-2 text-sm font-semibold">
        <span>Frase {phraseIndex} de 5</span>
        <PhraseDots current={phraseIndex} />
      </div>

      <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
        <Button variant="outline" size="lg" onClick={onRepeat}>
          Repetir
        </Button>
        <Button size="lg" onClick={onNext}>
          {phraseIndex >= recordingPhrases.length
            ? "Generar clon"
            : "Siguiente frase"}
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Consejo: habla claro y en un lugar silencioso.
      </p>
    </div>
  );
}

function GenerateStep({ progress }: { progress: number }) {
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
          <span className="text-muted-foreground">Sintetizando tu voz</span>
          <span className="font-semibold">{progress}%</span>
        </div>
      </div>

      <Card className="mt-6 w-full gap-0 py-0 text-left shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <ProcessLine done>Muestras recibidas</ProcessLine>
          <ProcessLine done>Analizando timbre y entonación</ProcessLine>
          <ProcessLine active>Sintetizando tu voz</ProcessLine>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewStep({
  useVoice,
  onUseVoiceChange,
  onBack,
}: {
  useVoice: boolean;
  onUseVoiceChange: (checked: boolean) => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<"prudente" | "equilibrado" | "detective">(
    "equilibrado",
  );
  const [voiceName, setVoiceName] = useState("Mi voz (Ana)");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <IconBubble icon={Check} />
      <h1 className="mt-6 font-display text-4xl font-black leading-tight sm:text-5xl">
        ¡Tu clon de voz está listo!
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
        GhostLine ya puede contestar las estafas con tu voz y sacarles
        información sin que tú tengas que atender.
      </p>

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
          <Switch checked={useVoice} onCheckedChange={onUseVoiceChange} />
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

      <div className="mt-5 grid w-full gap-3 sm:grid-cols-2">
        <Button variant="outline" size="lg" onClick={onBack}>
          Volver a grabar
        </Button>
        <Button asChild size="lg">
          <Link href={routes.dashboard}>
            Ir al panel
            <Check data-icon="inline-end" />
          </Link>
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

function PhraseDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {recordingPhrases.map((_, index) => (
        <span
          key={index}
          className={cn(
            "size-2 rounded-full bg-muted",
            index + 1 <= current && "bg-primary",
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
      <p className={cn("text-muted-foreground", active && "font-semibold text-foreground")}>
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
