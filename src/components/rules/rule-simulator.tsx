"use client";

// Simulador de escenarios: corre la lógica pura de evaluación/silencio contra las
// reglas configuradas, sin depender de n8n/Twilio/ElevenLabs.
// spec: evaluacion §Ejemplos; deteccion-silencio-inicial §Ejemplos.
import { Check, PhoneIncoming, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useAnsweringRules } from "@/hooks/use-answering-rules";
import { DEFAULT_PROFILE } from "@/lib/rules/defaults";
import { evaluateIncomingCall } from "@/lib/rules/evaluate";
import {
  decisionLabel,
  decisionVariant,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function RuleSimulator() {
  const { rules, status } = useAnsweringRules();

  return (
    <div className="flex flex-col gap-6">
      <CustomSimulator rulesReady={status === "ready"} rules={rules} />
      <SpecEvaluateScenarios />
      <SilenceScenarios />
    </div>
  );
}

function DecisionResult({ result }: { result: EvaluationResult }) {
  const outcome = result.decision === "reject" ? "rejected" : "in_progress";
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={decisionVariant[result.decision]}>
          {decisionLabel[result.decision]}
        </Badge>
        {result.rejectAction ? (
          <Badge variant="outline">{rejectActionLabel[result.rejectAction]}</Badge>
        ) : null}
        <Badge variant="secondary">
          {matchedRuleLabel[result.matchedRule] ?? result.matchedRule}
        </Badge>
        <Badge variant={outcomeVariant[outcome]}>{outcomeLabel[outcome]}</Badge>
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
    const timestamp = new Date(when);
    setResult(
      evaluateIncomingCall({ callerNumber, timestamp }, rules, DEFAULT_PROFILE),
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <PhoneIncoming className="size-5" />
        </div>
        <CardTitle>Simular una llamada entrante</CardTitle>
        <CardDescription>
          Se evalúa con tus reglas configuradas. La hora se interpreta en la zona
          horaria del perfil ({DEFAULT_PROFILE.timezone}).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Switch
            id="sim-anon"
            checked={anonymous}
            onCheckedChange={setAnonymous}
          />
          <Label htmlFor="sim-anon">Llamada anónima / número oculto</Label>
        </div>

        {!anonymous ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sim-number">Número del emisor</Label>
            <Input
              id="sim-number"
              value={number}
              className="max-w-xs"
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sim-when">Fecha y hora</Label>
          <Input
            id="sim-when"
            type="datetime-local"
            value={when}
            className="max-w-xs"
            onChange={(e) => setWhen(e.target.value)}
          />
        </div>

        <div>
          <Button type="button" onClick={run} disabled={!rulesReady}>
            Evaluar llamada
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {result ? <DecisionResult result={result} /> : null}
      </CardContent>
    </Card>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ejemplos de la spec — evaluación de reglas</CardTitle>
        <CardDescription>
          Cada escenario corre con su propia configuración y se compara con el
          resultado esperado documentado en la spec.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {computed.map(({ scenario, result, matches }) => (
          <div
            key={scenario.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{scenario.title}</span>
                <span className="text-sm text-muted-foreground">
                  {scenario.description}
                </span>
              </div>
              <Badge variant={matches ? "success" : "destructive"}>
                {matches ? (
                  <>
                    <Check className="size-3.5" /> Coincide
                  </>
                ) : (
                  <>
                    <X className="size-3.5" /> Difiere
                  </>
                )}
              </Badge>
            </div>
            <DecisionResult result={result} />
          </div>
        ))}
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Ejemplos de la spec — silencio inicial</CardTitle>
        <CardDescription>
          Desenlace de una llamada ya atendida según lo que ocurre en los primeros
          5 segundos tras el saludo del agente.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {computed.map(({ scenario, result }) => (
          <div
            key={scenario.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{scenario.title}</span>
              <span className="text-sm text-muted-foreground">
                {scenario.description}
              </span>
            </div>
            <Badge variant={outcomeVariant[result.outcome]}>
              {outcomeLabel[result.outcome]}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
