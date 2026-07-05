"use client";

// Simulador de escenarios: corre la lógica pura de evaluación/silencio contra las
// reglas configuradas, sin depender de n8n/Twilio/ElevenLabs.
// spec: evaluacion §Ejemplos; deteccion-silencio-inicial §Ejemplos.
import { Check, PhoneIncoming, Volume2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useAnsweringRules } from "@/hooks/use-answering-rules";
import { DEFAULT_PROFILE } from "@/lib/rules/defaults";
import { evaluateIncomingCall } from "@/lib/rules/evaluate";
import {
  decisionLabel,
  matchedRuleLabel,
  outcomeLabel,
  outcomeVariant,
  rejectActionLabel,
} from "@/lib/rules/labels";
import { normalizeToE164 } from "@/lib/rules/phone";
import { EVALUATE_SCENARIOS, SILENCE_SCENARIOS } from "@/lib/rules/scenarios";
import { evaluateInitialSilence } from "@/lib/rules/silence";
import type { EvaluationResult } from "@/lib/rules/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionCard } from "@/components/rules/ui";
import { cn } from "@/lib/utils";

export function RuleSimulator() {
  const { rules, status } = useAnsweringRules();

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="lg:sticky lg:top-24">
        <CustomSimulator rulesReady={status === "ready"} rules={rules} />
      </div>
      <div className="flex flex-col gap-5">
        <SpecEvaluateScenarios />
        <SilenceScenarios />
      </div>
    </div>
  );
}

function ResultBanner({ result }: { result: EvaluationResult }) {
  const answered = result.decision === "answer";
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4",
        answered
          ? "border-success/30 bg-success/10"
          : "border-destructive/30 bg-destructive/10",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-background",
            answered ? "bg-success" : "bg-destructive",
          )}
        >
          {answered ? <Check className="size-4" /> : <X className="size-4" />}
        </span>
        <span className="font-display text-lg font-black">
          {decisionLabel[result.decision]}
        </span>
        {result.rejectAction ? (
          <Badge variant="outline">{rejectActionLabel[result.rejectAction]}</Badge>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Regla aplicada
        </span>
        <Badge variant="secondary">
          {matchedRuleLabel[result.matchedRule] ?? result.matchedRule}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{result.reason}</p>
    </div>
  );
}

function CustomSimulator({
  rules,
  rulesReady,
}: {
  rules: ReturnType<typeof useAnsweringRules>["rules"];
  rulesReady: boolean;
}) {
  const [anonymous, setAnonymous] = useState(false);
  const [number, setNumber] = useState("+50376543210");
  const [when, setWhen] = useState("2026-07-07T10:00");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    let callerNumber: string | null = null;
    if (!anonymous) {
      const normalized = normalizeToE164(number, DEFAULT_PROFILE.countryCode);
      if (!normalized) {
        setError("Número inválido. Usa formato local o +503…");
        return;
      }
      callerNumber = normalized;
    }
    setResult(
      evaluateIncomingCall(
        { callerNumber, timestamp: new Date(when) },
        rules,
        DEFAULT_PROFILE,
      ),
    );
  }

  return (
    <SectionCard
      icon={<PhoneIncoming className="size-5" />}
      tint="bg-primary/10 text-primary"
      title="Simular una llamada"
      description={`Se evalúa con tus reglas. Hora en ${DEFAULT_PROFILE.timezone}.`}
    >
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
        <Label htmlFor="sim-anon" className="text-sm font-medium">
          Número oculto / anónimo
        </Label>
        <Switch id="sim-anon" checked={anonymous} onCheckedChange={setAnonymous} />
      </div>

      {!anonymous ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sim-number" className="text-xs uppercase tracking-wide text-muted-foreground">
            Número del emisor
          </Label>
          <Input
            id="sim-number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sim-when" className="text-xs uppercase tracking-wide text-muted-foreground">
          Fecha y hora
        </Label>
        <Input
          id="sim-when"
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
        />
      </div>

      <Button type="button" onClick={run} disabled={!rulesReady} className="w-full">
        Evaluar llamada
      </Button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {result ? (
        <ResultBanner result={result} />
      ) : (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
          Configura una llamada y pulsa «Evaluar» para ver la decisión.
        </p>
      )}
    </SectionCard>
  );
}

function SpecEvaluateScenarios() {
  const computed = useMemo(
    () =>
      EVALUATE_SCENARIOS.map((scenario) => {
        const result = evaluateIncomingCall(
          {
            callerNumber: scenario.call.callerNumber,
            timestamp: new Date(scenario.call.timestampIso),
          },
          scenario.rules,
          scenario.profile,
        );
        const matches =
          result.decision === scenario.expected.decision &&
          result.matchedRule === scenario.expected.matchedRule &&
          (!scenario.expected.rejectAction ||
            result.rejectAction === scenario.expected.rejectAction);
        return { scenario, result, matches };
      }),
    [],
  );

  const allPass = computed.every((c) => c.matches);

  return (
    <SectionCard
      icon={<PhoneIncoming className="size-5" />}
      tint="bg-accent/50 text-accent-foreground"
      title="Ejemplos de la spec — evaluación"
      description="Cada caso corre con su configuración y se compara con lo esperado."
      action={
        <Badge variant={allPass ? "success" : "destructive"}>
          {allPass ? "Todos coinciden" : "Revisar"}
        </Badge>
      }
    >
      {computed.map(({ scenario, result, matches }) => {
        const answered = result.decision === "answer";
        return (
          <div
            key={scenario.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold">{scenario.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {matchedRuleLabel[result.matchedRule] ?? result.matchedRule}
                {result.rejectAction
                  ? ` · ${rejectActionLabel[result.rejectAction]}`
                  : ""}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={answered ? "success" : "destructive"}>
                {decisionLabel[result.decision]}
              </Badge>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-background",
                  matches ? "bg-success" : "bg-destructive",
                )}
                aria-label={matches ? "Coincide con la spec" : "Difiere de la spec"}
              >
                {matches ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              </span>
            </div>
          </div>
        );
      })}
    </SectionCard>
  );
}

function SilenceScenarios() {
  const computed = useMemo(
    () =>
      SILENCE_SCENARIOS.map((scenario) => ({
        scenario,
        result: evaluateInitialSilence(scenario.input),
      })),
    [],
  );

  return (
    <SectionCard
      icon={<Volume2 className="size-5" />}
      tint="bg-warning/15 text-warning"
      title="Ejemplos de la spec — silencio inicial"
      description="Desenlace según los primeros 5 s tras el saludo del agente."
    >
      {computed.map(({ scenario, result }) => (
        <div
          key={scenario.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold">{scenario.title}</span>
            <span className="truncate text-xs text-muted-foreground">
              {scenario.description}
            </span>
          </div>
          <Badge variant={outcomeVariant[result.outcome]}>
            {outcomeLabel[result.outcome]}
          </Badge>
        </div>
      ))}
    </SectionCard>
  );
}
