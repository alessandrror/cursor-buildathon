"use client";

// UI de configuración de reglas de contestación. spec: US-003.
import {
  ArrowRight,
  Ban,
  Clock,
  EyeOff,
  PhoneOff,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { useAnsweringRules } from "@/hooks/use-answering-rules";
import {
  effectiveAnonymousAction,
  effectiveRejectAction,
  effectiveSchedule,
} from "@/lib/rules/config";
import { DEFAULT_PROFILE } from "@/lib/rules/defaults";
import { normalizeToE164 } from "@/lib/rules/phone";
import type { AnsweringRule } from "@/lib/rules/types";
import { routes } from "@/lib/routes";
import { GhostLineMark } from "@/components/brand/ghostline-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Segmented } from "@/components/rules/segmented";
import { SectionCard, StatChip } from "@/components/rules/ui";

const rejectShort = { busy: "Ocupado", hangup: "Colgar", message: "Mensaje" } as const;

/** Hace visible el ícono del picker nativo en tema oscuro. */
const timeInputClass =
  "w-28 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 dark:[&::-webkit-calendar-picker-indicator]:invert";

function countLabel(n: number) {
  return `${n} ${n === 1 ? "número" : "números"}`;
}

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
    return <p className="text-sm text-muted-foreground">Cargando reglas…</p>;
  }

  const whitelist = rules.filter((r) => r.ruleType === "whitelist");
  const blacklist = rules.filter((r) => r.ruleType === "blacklist");
  const prefixes = rules.filter((r) => r.ruleType === "prefix_block");
  const schedule = effectiveSchedule(rules);
  const anonymousAction = effectiveAnonymousAction(rules);
  const rejectAction = effectiveRejectAction(rules);

  const scheduleValue =
    schedule.start === schedule.end ? "24/7" : `${schedule.start}–${schedule.end}`;

  return (
    <div className="flex flex-col gap-5">
      {mode === "demo" ? <ModeBanner error={error} /> : null}

      {/* Resumen — estado de un vistazo, aprovechando la paleta semántica */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatChip
          icon={<Clock className="size-4" />}
          tint="bg-accent/50 text-accent-foreground"
          label="Horario"
          value={scheduleValue}
        />
        <StatChip
          icon={<EyeOff className="size-4" />}
          tint="bg-secondary text-secondary-foreground"
          label="Anónimos"
          value={anonymousAction === "reject" ? "Rechazar" : "Atender"}
        />
        <StatChip
          icon={<PhoneOff className="size-4" />}
          tint="bg-primary/10 text-primary"
          label="Al rechazar"
          value={rejectShort[rejectAction]}
        />
        <StatChip
          icon={<ShieldCheck className="size-4" />}
          tint="bg-success/15 text-success"
          label="Lista blanca"
          value={countLabel(whitelist.filter((r) => r.isActive).length)}
        />
        <StatChip
          icon={<ShieldAlert className="size-4" />}
          tint="bg-destructive/10 text-destructive"
          label="Lista negra"
          value={countLabel(blacklist.filter((r) => r.isActive).length)}
        />
      </div>

      {/* Comportamiento — panel único con los tres ajustes globales */}
      <SectionCard
        icon={<Clock className="size-5" />}
        tint="bg-accent/50 text-accent-foreground"
        title="Comportamiento"
        description="Cómo responde tu línea de forma general."
      >
        <div className="grid gap-5 md:grid-cols-3 md:divide-x md:divide-border">
          <div className="flex flex-col gap-2 md:pr-5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Horario de atención
            </Label>
            <div className="flex items-center gap-2">
              <label htmlFor="schedule-start" className="sr-only">
                Hora de inicio
              </label>
              <Input
                id="schedule-start"
                name="schedule-start"
                type="time"
                value={schedule.start}
                className={timeInputClass}
                onChange={(e) =>
                  setSingleton("schedule", { start: e.target.value, end: schedule.end })
                }
              />
              <span className="text-muted-foreground">–</span>
              <label htmlFor="schedule-end" className="sr-only">
                Hora de fin
              </label>
              <Input
                id="schedule-end"
                name="schedule-end"
                type="time"
                value={schedule.end}
                className={timeInputClass}
                onChange={(e) =>
                  setSingleton("schedule", { start: schedule.start, end: e.target.value })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {schedule.start === schedule.end
                ? "Atendiendo 24/7 (inicio y fin iguales)."
                : `Zona: ${DEFAULT_PROFILE.timezone}.`}
            </p>
          </div>

          <div className="flex flex-col gap-2 md:px-5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Llamadas anónimas
            </Label>
            <Segmented
              aria-label="Acción para llamadas anónimas"
              value={anonymousAction}
              onChange={(action) => setSingleton("anonymous", { action })}
              options={[
                { value: "reject", label: "Rechazar" },
                { value: "answer", label: "Atender" },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              Qué hacer cuando el número viene oculto.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:pl-5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Acción de rechazo
            </Label>
            <Segmented
              aria-label="Acción de rechazo"
              value={rejectAction}
              onChange={(action) => setSingleton("reject_action", { action })}
              options={[
                { value: "busy", label: "Ocupado" },
                { value: "hangup", label: "Colgar" },
                { value: "message", label: "Mensaje" },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              Cómo se corta una llamada bloqueada.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Listas — lado a lado */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ListEditor
          icon={<ShieldCheck className="size-5" />}
          tint="bg-success/15 text-success"
          title="Lista blanca"
          description="Siempre se atienden."
          placeholder="Ej. 7777-7777 o +50377777777"
          items={toItems(whitelist, "number")}
          onAdd={(raw) => addNumber(raw, whitelist, blacklist, "la lista negra", (n) => addRule("whitelist", { number: n }))}
          onToggle={(id, v) => updateRule(id, { isActive: v })}
          onRemove={removeRule}
          emptyText="Sin números en la lista blanca."
        />
        <ListEditor
          icon={<ShieldAlert className="size-5" />}
          tint="bg-destructive/10 text-destructive"
          title="Lista negra"
          description="Siempre se rechazan."
          placeholder="Ej. 7777-7777 o +50377777777"
          items={toItems(blacklist, "number")}
          onAdd={(raw) => addNumber(raw, blacklist, whitelist, "la lista blanca", (n) => addRule("blacklist", { number: n }))}
          onToggle={(id, v) => updateRule(id, { isActive: v })}
          onRemove={removeRule}
          emptyText="Sin números en la lista negra."
        />
      </div>

      {/* Prefijos + CTA al simulador */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ListEditor
          icon={<Ban className="size-5" />}
          tint="bg-warning/15 text-warning"
          title="Prefijos bloqueados"
          description="Bloquea rangos por país o área."
          placeholder="Ej. +1800"
          items={toItems(prefixes, "prefix")}
          onAdd={(raw) => addPrefix(raw, prefixes, (p) => addRule("prefix_block", { prefix: p }))}
          onToggle={(id, v) => updateRule(id, { isActive: v })}
          onRemove={removeRule}
          emptyText="Sin prefijos bloqueados."
        />

        <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-xl bg-hero p-5 text-hero-foreground">
          <GhostLineMark className="absolute -right-6 -top-6 size-32 opacity-10" inverted />
          <div className="relative flex flex-col gap-1.5">
            <h3 className="font-display text-lg font-bold">Pruébalo antes de una llamada real</h3>
            <p className="text-sm text-hero-foreground/80">
              Simula distintos escenarios y mira la decisión que tomarían tus reglas,
              sin esperar a que suene el teléfono.
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            className="relative w-fit border-transparent bg-hero-foreground text-hero hover:bg-hero-foreground/90"
          >
            <Link href={routes.rulesSimulator}>
              Abrir simulador <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- helpers de validación (spec: normalización E.164 y conflicto de listas) ---

function toItems(rules: AnsweringRule[], key: "number" | "prefix") {
  return rules.map((r) => ({
    id: r.id,
    label: key in r.value ? (r.value as Record<string, string>)[key] : "",
    isActive: r.isActive,
  }));
}

async function addNumber(
  raw: string,
  same: AnsweringRule[],
  opposite: AnsweringRule[],
  oppositeName: string,
  insert: (n: string) => Promise<unknown>,
): Promise<string | null> {
  const normalized = normalizeToE164(raw, DEFAULT_PROFILE.countryCode);
  if (!normalized) return "Número inválido. Usa formato local o +503…";
  if (opposite.some((r) => r.isActive && "number" in r.value && r.value.number === normalized)) {
    return `Este número ya está en ${oppositeName}.`;
  }
  if (same.some((r) => "number" in r.value && r.value.number === normalized)) {
    return "Este número ya está en esta lista.";
  }
  await insert(normalized);
  return null;
}

async function addPrefix(
  raw: string,
  prefixes: AnsweringRule[],
  insert: (p: string) => Promise<unknown>,
): Promise<string | null> {
  const prefix = raw.trim();
  if (!/^\+[0-9]{1,6}$/.test(prefix)) return "Prefijo inválido. Usa formato como +1800.";
  if (prefixes.some((r) => "prefix" in r.value && r.value.prefix === prefix)) {
    return "Ese prefijo ya está bloqueado.";
  }
  await insert(prefix);
  return null;
}

function ModeBanner({ error }: { error: string | null }) {
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm text-foreground">
      <span className="font-semibold">Modo demo.</span>{" "}
      {error
        ? "No se pudieron cargar tus reglas guardadas; los cambios no se persisten."
        : "Supabase no está configurado; los cambios viven solo en esta sesión."}{" "}
      El simulador funciona igual.
    </div>
  );
}

type ListItem = { id: string; label: string; isActive: boolean };

function ListEditor({
  icon,
  tint,
  title,
  description,
  placeholder,
  items,
  onAdd,
  onToggle,
  onRemove,
  emptyText,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  description: string;
  placeholder: string;
  items: ListItem[];
  onAdd: (raw: string) => Promise<string | null>;
  onToggle: (id: string, isActive: boolean) => void;
  onRemove: (id: string) => void;
  emptyText: string;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  async function handleAdd() {
    const err = await onAdd(input);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setInput("");
  }

  return (
    <SectionCard
      icon={icon}
      tint={tint}
      title={title}
      description={description}
      action={<Badge variant="outline">{items.length}</Badge>}
    >
      <label htmlFor={inputId} className="sr-only">
        {`Agregar a ${title}`}
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          name={`add-${title.toLowerCase().replace(/\s+/g, "-")}`}
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleAdd();
            }
          }}
        />
        <Button type="button" variant="secondary" size="icon" onClick={() => void handleAdd()} aria-label="Agregar">
          <Plus className="size-4" />
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className={cnRow(item.isActive)}
            >
              <span className="truncate font-medium">{item.label}</span>
              <div className="flex shrink-0 items-center gap-2">
                <Switch
                  checked={item.isActive}
                  onCheckedChange={(v) => onToggle(item.id, v)}
                  aria-label={item.isActive ? "Desactivar" : "Activar"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => onRemove(item.id)}
                  aria-label="Eliminar"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function cnRow(isActive: boolean) {
  return [
    "flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-opacity",
    isActive ? "" : "opacity-55",
  ].join(" ");
}
