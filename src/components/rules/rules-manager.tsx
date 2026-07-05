"use client";

// UI de configuración de reglas de contestación. spec: US-003.
import { Plus, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAnsweringRules } from "@/hooks/use-answering-rules";
import { effectiveAnonymousAction, effectiveRejectAction, effectiveSchedule } from "@/lib/rules/config";
import { DEFAULT_PROFILE } from "@/lib/rules/defaults";
import { normalizeToE164 } from "@/lib/rules/phone";
import { rejectActionLabel } from "@/lib/rules/labels";
import type { AnsweringRule } from "@/lib/rules/types";
import { routes } from "@/lib/routes";
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
import { Segmented } from "@/components/rules/segmented";

export function RulesManager() {
  const {
    rules,
    mode,
    status,
    error,
    addRule,
    updateRule,
    removeRule,
    setSingleton,
  } = useAnsweringRules();

  if (status === "loading") {
    return (
      <p className="text-sm text-muted-foreground">Cargando reglas…</p>
    );
  }

  const whitelist = rules.filter((r) => r.ruleType === "whitelist");
  const blacklist = rules.filter((r) => r.ruleType === "blacklist");
  const prefixes = rules.filter((r) => r.ruleType === "prefix_block");
  const schedule = effectiveSchedule(rules);
  const anonymousAction = effectiveAnonymousAction(rules);
  const rejectAction = effectiveRejectAction(rules);

  return (
    <div className="flex flex-col gap-6">
      <ModeBanner mode={mode} error={error} />

      <NumberListSection
        title="Lista blanca"
        description="Números que siempre se atienden."
        icon={<ShieldCheck className="size-5" />}
        rules={whitelist}
        opposite={blacklist}
        oppositeName="lista negra"
        onAdd={(number) => addRule("whitelist", { number })}
        onToggle={(id, isActive) => updateRule(id, { isActive })}
        onRemove={removeRule}
      />

      <NumberListSection
        title="Lista negra"
        description="Números que siempre se rechazan."
        icon={<ShieldAlert className="size-5" />}
        rules={blacklist}
        opposite={whitelist}
        oppositeName="lista blanca"
        onAdd={(number) => addRule("blacklist", { number })}
        onToggle={(id, isActive) => updateRule(id, { isActive })}
        onRemove={removeRule}
      />

      <PrefixListSection
        rules={prefixes}
        onAdd={(prefix) => addRule("prefix_block", { prefix })}
        onToggle={(id, isActive) => updateRule(id, { isActive })}
        onRemove={removeRule}
      />

      <Card>
        <CardHeader>
          <CardTitle>Horario de atención</CardTitle>
          <CardDescription>
            Fuera de este rango (hora de {DEFAULT_PROFILE.timezone}) las llamadas se
            rechazan. Deja inicio y fin iguales para atender 24/7.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="schedule-start">Inicio</Label>
            <Input
              id="schedule-start"
              type="time"
              value={schedule.start}
              className="w-36"
              onChange={(e) =>
                setSingleton("schedule", { start: e.target.value, end: schedule.end })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="schedule-end">Fin</Label>
            <Input
              id="schedule-end"
              type="time"
              value={schedule.end}
              className="w-36"
              onChange={(e) =>
                setSingleton("schedule", { start: schedule.start, end: e.target.value })
              }
            />
          </div>
          {schedule.start === schedule.end ? (
            <Badge variant="success">24/7</Badge>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Llamadas anónimas / ocultas</CardTitle>
          <CardDescription>
            Qué hacer cuando el número del emisor viene oculto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Segmented
            aria-label="Acción para llamadas anónimas"
            value={anonymousAction}
            onChange={(action) => setSingleton("anonymous", { action })}
            options={[
              { value: "reject", label: "Rechazar" },
              { value: "answer", label: "Atender" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acción de rechazo</CardTitle>
          <CardDescription>
            Cómo se rechaza una llamada que no pasa las reglas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Segmented
            aria-label="Acción de rechazo"
            value={rejectAction}
            onChange={(action) => setSingleton("reject_action", { action })}
            options={[
              { value: "busy", label: rejectActionLabel.busy },
              { value: "hangup", label: rejectActionLabel.hangup },
              { value: "message", label: rejectActionLabel.message },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle>¿Cómo se comportarían tus reglas?</CardTitle>
          <CardDescription>
            Prueba distintos escenarios de llamada entrante y mira la decisión sin
            necesidad de recibir una llamada real.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={routes.rulesSimulator}>Abrir simulador</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ModeBanner({
  mode,
  error,
}: {
  mode: "persistent" | "demo";
  error: string | null;
}) {
  if (mode === "persistent") {
    return (
      <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
        Tus cambios se guardan en tu cuenta y aplican a la siguiente llamada.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
      <span className="font-semibold">Modo demo.</span>{" "}
      {error
        ? "No se pudieron cargar tus reglas guardadas; los cambios no se persisten."
        : "Supabase no está configurado; los cambios viven solo en esta sesión."}{" "}
      El simulador funciona igual.
    </div>
  );
}

function NumberListSection({
  title,
  description,
  icon,
  rules,
  opposite,
  oppositeName,
  onAdd,
  onToggle,
  onRemove,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  rules: AnsweringRule[];
  opposite: AnsweringRule[];
  oppositeName: string;
  onAdd: (number: string) => Promise<unknown>;
  onToggle: (id: string, isActive: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    const normalized = normalizeToE164(input, DEFAULT_PROFILE.countryCode);
    if (!normalized) {
      setError("Número inválido. Usa formato local o internacional (+503…).");
      return;
    }
    // spec: no puede estar en la lista opuesta activa.
    if (opposite.some((r) => r.isActive && "number" in r.value && r.value.number === normalized)) {
      setError(`Este número ya está en la ${oppositeName}.`);
      return;
    }
    if (rules.some((r) => "number" in r.value && r.value.number === normalized)) {
      setError("Este número ya está en esta lista.");
      return;
    }
    await onAdd(normalized);
    setInput("");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Input
            value={input}
            placeholder="Ej. 7777-7777 o +50377777777"
            className="max-w-xs"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAdd();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={() => void handleAdd()}>
            <Plus className="size-4" /> Agregar
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin números en esta lista.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
              >
                <span className="font-medium">
                  {"number" in rule.value ? rule.value.number : ""}
                </span>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={(v) => onToggle(rule.id, v)}
                    aria-label={rule.isActive ? "Desactivar regla" : "Activar regla"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(rule.id)}
                    aria-label="Eliminar número"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PrefixListSection({
  rules,
  onAdd,
  onToggle,
  onRemove,
}: {
  rules: AnsweringRule[];
  onAdd: (prefix: string) => Promise<unknown>;
  onToggle: (id: string, isActive: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    const prefix = input.trim();
    if (!/^\+[0-9]{1,6}$/.test(prefix)) {
      setError("Prefijo inválido. Usa formato como +1800 o +503.");
      return;
    }
    if (rules.some((r) => "prefix" in r.value && r.value.prefix === prefix)) {
      setError("Ese prefijo ya está bloqueado.");
      return;
    }
    await onAdd(prefix);
    setInput("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prefijos bloqueados</CardTitle>
        <CardDescription>
          Bloquea rangos por país o área (ej. +1800, +503).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Input
            value={input}
            placeholder="Ej. +1800"
            className="max-w-xs"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAdd();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={() => void handleAdd()}>
            <Plus className="size-4" /> Agregar
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin prefijos bloqueados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
              >
                <span className="font-medium">
                  {"prefix" in rule.value ? rule.value.prefix : ""}
                </span>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={(v) => onToggle(rule.id, v)}
                    aria-label={rule.isActive ? "Desactivar regla" : "Activar regla"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(rule.id)}
                    aria-label="Eliminar prefijo"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
