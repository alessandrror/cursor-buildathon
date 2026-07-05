"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Ban,
  CircleHelp,
  EyeOff,
  Mic,
  Moon,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ScenarioId = "unknown" | "hidden" | "trusted" | "afterHours";
type SimulatorResult = "rejected" | "answered" | null;

const scenarios: Array<{
  id: ScenarioId;
  title: string;
  description: string;
  icon: typeof CircleHelp;
  result: Exclude<SimulatorResult, null>;
}> = [
  {
    id: "unknown",
    title: "Número desconocido",
    description: "Alguien que no está en tus contactos.",
    icon: CircleHelp,
    result: "rejected",
  },
  {
    id: "hidden",
    title: "Llamada oculta",
    description: "El número viene anónimo.",
    icon: EyeOff,
    result: "rejected",
  },
  {
    id: "trusted",
    title: "Contacto de confianza",
    description: "Está en tu lista blanca.",
    icon: ShieldCheck,
    result: "answered",
  },
  {
    id: "afterHours",
    title: "Fuera de horario",
    description: "Llega de madrugada.",
    icon: Moon,
    result: "rejected",
  },
];

const rejectedSteps = [
  "Entró una llamada de un número que no está en tus contactos.",
  "Coincidió con un patrón de estafa reportado por la red GhostLine.",
  "Se colgó automáticamente, según tu regla para desconocidos.",
  "Quedó registrada en tu panel como «Bloqueada», por si quieres revisarla.",
];

const answeredSteps = [
  "Entró una llamada sospechosa dentro de tu horario.",
  "GhostLine contestó con tu voz clonada, sin que tú hicieras nada.",
  "Mantuvo al llamante hablando y detectó su intención real.",
  "Te dejó el resumen y la conclusión en tu panel.",
];

export function CallSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>("unknown");
  const [specificNumber, setSpecificNumber] = useState("");
  const [result, setResult] = useState<SimulatorResult>(null);

  const selected = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenario) ?? scenarios[0],
    [selectedScenario],
  );

  if (result === "rejected") {
    return <RejectedResult onReset={() => setResult(null)} />;
  }

  if (result === "answered") {
    return <AnsweredResult onReset={() => setResult(null)} />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          Ensaya una llamada
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simula una llamada y mira qué haría GhostLine, sin esperar a que suene el teléfono.
        </p>
      </header>

      <Card className="gap-0 py-0 shadow-none">
        <CardContent className="px-5 py-5">
          <h2 className="font-display text-xl font-black tracking-tight">
            Elige un escenario
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isSelected = selectedScenario === scenario.id;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={cn(
                    "rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/35 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    isSelected && "border-primary bg-secondary/60 ring-1 ring-primary",
                  )}
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-base font-black tracking-tight">
                    {scenario.title}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">
                    {scenario.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg bg-secondary/45 p-4 sm:flex sm:items-center sm:gap-4">
            <label
              htmlFor="specific-number"
              className="text-sm font-semibold text-muted-foreground"
            >
              o prueba un número específico:
            </label>
            <Input
              id="specific-number"
              value={specificNumber}
              onChange={(event) => setSpecificNumber(event.target.value)}
              className="mt-3 bg-card sm:mt-0"
              placeholder="+503 0000 0000"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full"
        onClick={() => setResult(selected.result)}
      >
        <PhoneCall data-icon="inline-start" />
        Probar llamada
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Verás si GhostLine la atiende o la rechaza, y por qué, igual que en una llamada real.
      </p>
    </div>
  );
}

function RejectedResult({ onReset }: { onReset: () => void }) {
  return (
    <SimulatorResultShell
      icon={<Ban className="size-8" aria-hidden />}
      iconClassName="bg-destructive/10 text-destructive"
      title="Rechazada"
      description="GhostLine colgó esta llamada por ti. No sonó tu teléfono."
      badge="Regla: número desconocido"
      steps={rejectedSteps}
      onReset={onReset}
      primaryAction={
        <Button className="w-full" asChild>
          <Link href={routes.dashboard}>Ir al panel</Link>
        </Button>
      }
    />
  );
}

function AnsweredResult({ onReset }: { onReset: () => void }) {
  return (
    <SimulatorResultShell
      icon={<Mic className="size-8" aria-hidden />}
      iconClassName="bg-success/10 text-success"
      title="Atendida con tu voz"
      description="GhostLine contestó por ti y averiguó qué buscaba el llamante."
      badge="Regla: atender y sonsacar"
      steps={answeredSteps}
      onReset={onReset}
      discovery={
        <Card className="gap-0 py-0 shadow-none">
          <CardContent className="px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-black tracking-tight">
                Lo que descubrió
              </h2>
              <Badge variant="destructive">Intento de estafa</Badge>
            </div>
            <p className="mt-6 text-sm leading-6 text-muted-foreground">
              Se hizo pasar por tu banco y pidió tu clave y un código SMS para
              «desbloquear» tu cuenta. GhostLine no entregó ningún dato y registró el número.
            </p>
          </CardContent>
        </Card>
      }
      primaryAction={
        <Button className="w-full" asChild>
          <Link href={routes.dashboard}>Ver resumen completo</Link>
        </Button>
      }
    />
  );
}

function SimulatorResultShell({
  icon,
  iconClassName,
  title,
  description,
  badge,
  steps,
  discovery,
  primaryAction,
  onReset,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  badge: string;
  steps: string[];
  discovery?: React.ReactNode;
  primaryAction: React.ReactNode;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col justify-center gap-5 px-4 py-10 sm:px-6">
      <header className="flex flex-col items-center text-center">
        <div
          className={cn(
            "flex size-20 items-center justify-center rounded-full",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <h1 className="mt-5 font-display text-3xl font-black tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{description}</p>
        <Badge variant="secondary" className="mt-4">
          {badge}
        </Badge>
      </header>

      <Card className="gap-0 py-0 shadow-none">
        <CardContent className="px-5 py-5">
          <h2 className="font-display text-xl font-black tracking-tight">Qué pasó</h2>
          <ol className="mt-3 flex flex-col">
            {steps.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 border-b border-border py-4 last:border-b-0"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-black text-muted-foreground">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold leading-6">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {discovery}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" className="bg-card" onClick={onReset}>
          <RotateCcw data-icon="inline-start" />
          Probar otro escenario
        </Button>
        {primaryAction}
      </div>
    </div>
  );
}
