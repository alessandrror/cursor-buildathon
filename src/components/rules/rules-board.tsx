"use client";

import { useMemo, useState } from "react";
<<<<<<< HEAD
<<<<<<< HEAD
import {
  Ban,
  Check,
  Clock3,
  EyeOff,
  Loader2,
=======
import Link from "next/link";
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
import {
  Ban,
  Check,
  Clock3,
  EyeOff,
<<<<<<< HEAD
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
  Loader2,
>>>>>>> 555a6a5 (Add answering rules management and validation features)
  Plus,
  ShieldCheck,
  ShieldX,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
<<<<<<< HEAD
<<<<<<< HEAD
import { saveAnsweringRules } from "@/lib/rules/client";
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
import { saveAnsweringRules } from "@/lib/rules/client";
>>>>>>> 555a6a5 (Add answering rules management and validation features)
import type {
  AnsweringRulesConfig,
  RuleListItem,
} from "@/lib/supabase/answering-rules";
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { routes } from "@/lib/routes";
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
import { cn } from "@/lib/utils";

type RulesBoardProps = {
  initialRules: AnsweringRulesConfig;
};

type RuleListKind = "whitelist" | "blacklist" | "prefixBlock";

<<<<<<< HEAD
<<<<<<< HEAD
=======
const fallbackWhiteList: RuleListItem[] = [
  { id: "example-family", value: "+503 7712 4408", active: true },
  { id: "example-pharmacy", value: "+503 2260 1180", active: true },
  { id: "example-bank", value: "Banco (oficial)", active: true },
];

const fallbackBlackList: RuleListItem[] = [
  { id: "example-collection", value: "+503 2555 0142", active: true },
  { id: "example-spam", value: "+1 809 555 7788", active: true },
];

const fallbackPrefixes: RuleListItem[] = [
  { id: "example-prefix", value: "+1800", active: true },
];

function withFallback(list: RuleListItem[], fallback: RuleListItem[]) {
  return list.length > 0 ? list : fallback;
}

>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
function getActiveCount(list: RuleListItem[]) {
  return list.filter((item) => item.active).length;
}

function createRuleItem(value: string): RuleListItem {
  return {
<<<<<<< HEAD
<<<<<<< HEAD
    id: `temp-${value}-${Date.now()}`,
=======
    id: `${value}-${Date.now()}`,
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
    id: `temp-${value}-${Date.now()}`,
>>>>>>> 555a6a5 (Add answering rules management and validation features)
    value,
    active: true,
  };
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
function buildRulesPayload(params: {
  scheduleStart: string;
  scheduleEnd: string;
  scheduleActive: boolean;
  anonymousAction: "answer" | "reject";
  whitelist: RuleListItem[];
  blacklist: RuleListItem[];
  prefixBlock: RuleListItem[];
}): AnsweringRulesConfig {
  return {
    schedule: {
      start: params.scheduleStart,
      end: params.scheduleEnd,
      active: params.scheduleActive,
    },
    anonymousAction: params.anonymousAction,
    whitelist: params.whitelist,
    blacklist: params.blacklist,
    prefixBlock: params.prefixBlock,
  };
}

<<<<<<< HEAD
export function RulesBoard({ initialRules }: RulesBoardProps) {
  const [scheduleStart, setScheduleStart] = useState(initialRules.schedule.start);
  const [scheduleEnd, setScheduleEnd] = useState(initialRules.schedule.end);
  const [scheduleActive, setScheduleActive] = useState(
    initialRules.schedule.active,
  );
  const [anonymousAction, setAnonymousAction] = useState(
    initialRules.anonymousAction,
  );
  const [whitelist, setWhitelist] = useState(initialRules.whitelist);
  const [blacklist, setBlacklist] = useState(initialRules.blacklist);
  const [prefixBlock, setPrefixBlock] = useState(initialRules.prefixBlock);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
=======
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
export function RulesBoard({ initialRules }: RulesBoardProps) {
  const [scheduleStart, setScheduleStart] = useState(initialRules.schedule.start);
  const [scheduleEnd, setScheduleEnd] = useState(initialRules.schedule.end);
  const [scheduleActive, setScheduleActive] = useState(
    initialRules.schedule.active,
  );
  const [anonymousAction, setAnonymousAction] = useState(
    initialRules.anonymousAction,
  );
<<<<<<< HEAD
  const [whitelist, setWhitelist] = useState(() =>
    withFallback(initialRules.whitelist, fallbackWhiteList),
  );
  const [blacklist, setBlacklist] = useState(() =>
    withFallback(initialRules.blacklist, fallbackBlackList),
  );
  const [prefixBlock, setPrefixBlock] = useState(() =>
    withFallback(initialRules.prefixBlock, fallbackPrefixes),
  );
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
  const [whitelist, setWhitelist] = useState(initialRules.whitelist);
  const [blacklist, setBlacklist] = useState(initialRules.blacklist);
  const [prefixBlock, setPrefixBlock] = useState(initialRules.prefixBlock);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
>>>>>>> 555a6a5 (Add answering rules management and validation features)

  const stats = useMemo(
    () => [
      {
        label: "Horario",
<<<<<<< HEAD
<<<<<<< HEAD
        value: scheduleActive ? `${scheduleStart}-${scheduleEnd}` : "24/7",
=======
        value: `${scheduleStart}-${scheduleEnd}`,
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
        value: scheduleActive ? `${scheduleStart}-${scheduleEnd}` : "24/7",
>>>>>>> 555a6a5 (Add answering rules management and validation features)
        icon: Clock3,
        tone: "text-warning",
      },
      {
        label: "Anónimos",
        value: anonymousAction === "reject" ? "Rechazar" : "Atender",
        icon: EyeOff,
        tone: "text-primary",
      },
      {
        label: "Lista blanca",
        value: `${getActiveCount(whitelist)} números`,
        icon: ShieldCheck,
        tone: "text-success",
      },
      {
        label: "Lista negra",
        value: `${getActiveCount(blacklist)} números`,
        icon: ShieldX,
        tone: "text-destructive",
      },
    ],
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
    [
      anonymousAction,
      blacklist,
      scheduleActive,
      scheduleEnd,
      scheduleStart,
      whitelist,
    ],
<<<<<<< HEAD
  );

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const saved = await saveAnsweringRules(
        buildRulesPayload({
          scheduleStart,
          scheduleEnd,
          scheduleActive,
          anonymousAction,
          whitelist,
          blacklist,
          prefixBlock,
        }),
      );

      setScheduleStart(saved.schedule.start);
      setScheduleEnd(saved.schedule.end);
      setScheduleActive(saved.schedule.active);
      setAnonymousAction(saved.anonymousAction);
      setWhitelist(saved.whitelist);
      setBlacklist(saved.blacklist);
      setPrefixBlock(saved.prefixBlock);
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar las reglas.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
            Reglas de contestación
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define qué llamadas atiende el agente y cuáles se rechazan.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="sm:min-w-40"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
          {saveError ? (
            <p className="text-sm text-destructive" role="alert">
              {saveError}
            </p>
          ) : null}
          {saveSuccess ? (
            <p
              className="flex items-center gap-1.5 text-sm text-success"
              role="status"
            >
              <Check className="size-4" aria-hidden />
              Reglas guardadas
            </p>
          ) : null}
        </div>
=======
    [anonymousAction, blacklist, scheduleEnd, scheduleStart, whitelist],
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
  );

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const saved = await saveAnsweringRules(
        buildRulesPayload({
          scheduleStart,
          scheduleEnd,
          scheduleActive,
          anonymousAction,
          whitelist,
          blacklist,
          prefixBlock,
        }),
      );

      setScheduleStart(saved.schedule.start);
      setScheduleEnd(saved.schedule.end);
      setScheduleActive(saved.schedule.active);
      setAnonymousAction(saved.anonymousAction);
      setWhitelist(saved.whitelist);
      setBlacklist(saved.blacklist);
      setPrefixBlock(saved.prefixBlock);
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar las reglas.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10">
<<<<<<< HEAD
      <header className="max-w-3xl">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          Reglas de contestación
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define qué llamadas atiende el agente y cuáles se rechazan.
        </p>
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
            Reglas de contestación
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define qué llamadas atiende el agente y cuáles se rechazan.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="sm:min-w-40"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
          {saveError ? (
            <p className="text-sm text-destructive" role="alert">
              {saveError}
            </p>
          ) : null}
          {saveSuccess ? (
            <p
              className="flex items-center gap-1.5 text-sm text-success"
              role="status"
            >
              <Check className="size-4" aria-hidden />
              Reglas guardadas
            </p>
          ) : null}
        </div>
>>>>>>> 555a6a5 (Add answering rules management and validation features)
      </header>

      <section aria-label="Resumen de reglas" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="gap-0 py-0 shadow-none">
            <CardContent className="flex items-center gap-4 px-4 py-4">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary",
                  tone,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </div>
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 font-display text-base font-black tracking-tight">
                  {value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="gap-0 py-0 shadow-none">
        <CardContent className="px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-warning">
              <Clock3 className="size-4" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-xl font-black tracking-tight">
                Comportamiento
              </h2>
              <p className="text-sm text-muted-foreground">
                Cómo responde tu línea de forma general.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg bg-secondary/45 p-4">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
              <div className="mb-3 flex items-center justify-between gap-3">
                <Label className="font-display font-bold">
                  Horario de atención
                </Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="schedule-active" className="text-xs text-muted-foreground">
                    Activo
                  </Label>
                  <Switch
                    id="schedule-active"
                    checked={scheduleActive}
                    onCheckedChange={setScheduleActive}
                    aria-label="Activar horario de atención"
                  />
                </div>
              </div>
<<<<<<< HEAD
=======
              <Label className="mb-3 block font-display font-bold">
                Horario de atención
              </Label>
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <Input
                  type="time"
                  value={scheduleStart}
                  onChange={(event) => setScheduleStart(event.target.value)}
                  aria-label="Hora de inicio"
<<<<<<< HEAD
<<<<<<< HEAD
                  disabled={!scheduleActive}
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
                  disabled={!scheduleActive}
>>>>>>> 555a6a5 (Add answering rules management and validation features)
                />
                <span className="text-muted-foreground" aria-hidden>
                  -
                </span>
                <Input
                  type="time"
                  value={scheduleEnd}
                  onChange={(event) => setScheduleEnd(event.target.value)}
                  aria-label="Hora de fin"
<<<<<<< HEAD
<<<<<<< HEAD
                  disabled={!scheduleActive}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Zona: America/El_Salvador. Desactiva el horario para atender 24/7.
=======
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Zona: America/El_Salvador
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
                  disabled={!scheduleActive}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Zona: America/El_Salvador. Desactiva el horario para atender 24/7.
>>>>>>> 555a6a5 (Add answering rules management and validation features)
              </p>
            </div>

            <div className="rounded-lg bg-secondary/45 p-4">
              <Label className="mb-3 block font-display font-bold">
                Llamadas anónimas
              </Label>
              <div className="grid grid-cols-2 rounded-md border border-input bg-background p-1">
                <button
                  type="button"
                  onClick={() => setAnonymousAction("reject")}
                  className={cn(
                    "rounded-sm px-4 py-2 text-sm font-semibold transition-colors",
                    anonymousAction === "reject"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  onClick={() => setAnonymousAction("answer")}
                  className={cn(
                    "rounded-sm px-4 py-2 text-sm font-semibold transition-colors",
                    anonymousAction === "answer"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Atender
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Qué hacer cuando el número viene oculto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-label="Listas de reglas" className="grid gap-4 lg:grid-cols-3">
        <RuleListCard
          title="Lista blanca"
          count={getActiveCount(whitelist)}
          icon={ShieldCheck}
          iconClassName="text-success"
          placeholder="Añadir número..."
<<<<<<< HEAD
<<<<<<< HEAD
          emptyHint="Los números en lista blanca siempre se atienden."
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
          emptyHint="Los números en lista blanca siempre se atienden."
>>>>>>> 555a6a5 (Add answering rules management and validation features)
          items={whitelist}
          onChange={setWhitelist}
          kind="whitelist"
        />
        <RuleListCard
          title="Lista negra"
          count={getActiveCount(blacklist)}
          icon={ShieldX}
          iconClassName="text-destructive"
          placeholder="Añadir número..."
<<<<<<< HEAD
<<<<<<< HEAD
          emptyHint="Los números en lista negra siempre se rechazan."
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
          emptyHint="Los números en lista negra siempre se rechazan."
>>>>>>> 555a6a5 (Add answering rules management and validation features)
          items={blacklist}
          onChange={setBlacklist}
          kind="blacklist"
        />
        <RuleListCard
          title="Prefijos bloqueados"
          count={getActiveCount(prefixBlock)}
          icon={Ban}
          iconClassName="text-warning"
          placeholder="Añadir prefijo..."
<<<<<<< HEAD
<<<<<<< HEAD
          emptyHint="Ejemplo: +1800 para bloquear toll-free."
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
          emptyHint="Ejemplo: +1800 para bloquear toll-free."
>>>>>>> 555a6a5 (Add answering rules management and validation features)
          items={prefixBlock}
          onChange={setPrefixBlock}
          kind="prefixBlock"
        />
      </section>
<<<<<<< HEAD
<<<<<<< HEAD
=======

      <section className="rounded-xl bg-primary px-5 py-5 text-primary-foreground shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <div>
          <h2 className="font-display text-xl font-black tracking-tight">
            Pruébalo antes de una llamada real
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/75">
            Simula distintos escenarios y mira qué decidirían tus reglas.
          </p>
        </div>
        <Button className="mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:mt-0" asChild>
          <Link href={routes.dashboardSimulator}>
            Abrir simulador
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </section>
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
    </div>
  );
}

type RuleListCardProps = {
  title: string;
  count: number;
  icon: LucideIcon;
  iconClassName: string;
  placeholder: string;
<<<<<<< HEAD
<<<<<<< HEAD
  emptyHint: string;
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
  emptyHint: string;
>>>>>>> 555a6a5 (Add answering rules management and validation features)
  items: RuleListItem[];
  onChange: (items: RuleListItem[]) => void;
  kind: RuleListKind;
};

function RuleListCard({
  title,
  count,
  icon: Icon,
  iconClassName,
  placeholder,
<<<<<<< HEAD
<<<<<<< HEAD
  emptyHint,
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
  emptyHint,
>>>>>>> 555a6a5 (Add answering rules management and validation features)
  items,
  onChange,
  kind,
}: RuleListCardProps) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const value = draft.trim();
    if (!value) return;

    onChange([...items, createRuleItem(value)]);
    setDraft("");
  }

<<<<<<< HEAD
<<<<<<< HEAD
  function toggleItem(id: string | undefined, value: string) {
    onChange(
      items.map((item) =>
        (item.id ?? item.value) === (id ?? value)
          ? { ...item, active: !item.active }
          : item,
=======
  function toggleItem(id: string) {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item,
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
  function toggleItem(id: string | undefined, value: string) {
    onChange(
      items.map((item) =>
        (item.id ?? item.value) === (id ?? value)
          ? { ...item, active: !item.active }
          : item,
>>>>>>> 555a6a5 (Add answering rules management and validation features)
      ),
    );
  }

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
  function removeItem(id: string | undefined, value: string) {
    onChange(
      items.filter((item) => (item.id ?? item.value) !== (id ?? value)),
    );
<<<<<<< HEAD
=======
  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
  }

  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardContent className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary",
                iconClassName,
              )}
            >
              <Icon className="size-4" aria-hidden />
            </div>
            <h2 className="font-display text-lg font-black tracking-tight">
              {title}
            </h2>
          </div>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-muted-foreground">
            {count}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            onKeyDown={(event) => {
              if (event.key === "Enter") addItem();
            }}
          />
          <Button type="button" size="icon" onClick={addItem} aria-label="Añadir regla">
            <Plus aria-hidden />
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
          {items.length === 0 ? (
            <p className="rounded-md bg-secondary/45 px-3 py-3 text-sm text-muted-foreground">
              {emptyHint}
            </p>
          ) : (
            items.map((item) => (
              <div
                key={`${kind}-${item.id ?? item.value}`}
                className="flex items-center gap-3 rounded-md bg-secondary/45 px-3 py-2"
<<<<<<< HEAD
              >
                <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {item.value}
                </p>
                <Switch
                  checked={item.active}
                  onCheckedChange={() => toggleItem(item.id, item.value)}
                  aria-label={`Activar ${item.value}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  onClick={() => removeItem(item.id, item.value)}
                  aria-label={`Eliminar ${item.value}`}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
            ))
          )}
=======
          {items.map((item) => (
            <div
              key={`${kind}-${item.id}`}
              className="flex items-center gap-3 rounded-md bg-secondary/45 px-3 py-2"
            >
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                {item.value}
              </p>
              <Switch
                checked={item.active}
                onCheckedChange={() => toggleItem(item.id)}
                aria-label={`Activar ${item.value}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                onClick={() => removeItem(item.id)}
                aria-label={`Eliminar ${item.value}`}
              >
                <Trash2 aria-hidden />
              </Button>
            </div>
          ))}
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
              >
                <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {item.value}
                </p>
                <Switch
                  checked={item.active}
                  onCheckedChange={() => toggleItem(item.id, item.value)}
                  aria-label={`Activar ${item.value}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  onClick={() => removeItem(item.id, item.value)}
                  aria-label={`Eliminar ${item.value}`}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
            ))
          )}
>>>>>>> 555a6a5 (Add answering rules management and validation features)
        </div>
      </CardContent>
    </Card>
  );
}
