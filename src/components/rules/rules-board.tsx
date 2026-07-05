"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  Check,
  Clock3,
  EyeOff,
  Loader2,
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
import { saveAnsweringRules } from "@/lib/rules/client";
import type {
  AnsweringRulesConfig,
  RuleListItem,
} from "@/lib/supabase/answering-rules";
import { cn } from "@/lib/utils";

type RulesBoardProps = {
  initialRules: AnsweringRulesConfig;
};

type RuleListKind = "whitelist" | "blacklist" | "prefixBlock";

function getActiveCount(list: RuleListItem[]) {
  return list.filter((item) => item.active).length;
}

function createRuleItem(value: string): RuleListItem {
  return {
    id: `temp-${value}-${Date.now()}`,
    value,
    active: true,
  };
}

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

  const stats = useMemo(
    () => [
      {
        label: "Horario",
        value: scheduleActive ? `${scheduleStart}-${scheduleEnd}` : "24/7",
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
    [
      anonymousAction,
      blacklist,
      scheduleActive,
      scheduleEnd,
      scheduleStart,
      whitelist,
    ],
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
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <Input
                  type="time"
                  value={scheduleStart}
                  onChange={(event) => setScheduleStart(event.target.value)}
                  aria-label="Hora de inicio"
                  disabled={!scheduleActive}
                />
                <span className="text-muted-foreground" aria-hidden>
                  -
                </span>
                <Input
                  type="time"
                  value={scheduleEnd}
                  onChange={(event) => setScheduleEnd(event.target.value)}
                  aria-label="Hora de fin"
                  disabled={!scheduleActive}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Zona: America/El_Salvador. Desactiva el horario para atender 24/7.
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
          emptyHint="Los números en lista blanca siempre se atienden."
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
          emptyHint="Los números en lista negra siempre se rechazan."
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
          emptyHint="Ejemplo: +1800 para bloquear toll-free."
          items={prefixBlock}
          onChange={setPrefixBlock}
          kind="prefixBlock"
        />
      </section>
    </div>
  );
}

type RuleListCardProps = {
  title: string;
  count: number;
  icon: LucideIcon;
  iconClassName: string;
  placeholder: string;
  emptyHint: string;
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
  emptyHint,
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

  function toggleItem(id: string | undefined, value: string) {
    onChange(
      items.map((item) =>
        (item.id ?? item.value) === (id ?? value)
          ? { ...item, active: !item.active }
          : item,
      ),
    );
  }

  function removeItem(id: string | undefined, value: string) {
    onChange(
      items.filter((item) => (item.id ?? item.value) !== (id ?? value)),
    );
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
          {items.length === 0 ? (
            <p className="rounded-md bg-secondary/45 px-3 py-3 text-sm text-muted-foreground">
              {emptyHint}
            </p>
          ) : (
            items.map((item) => (
              <div
                key={`${kind}-${item.id ?? item.value}`}
                className="flex items-center gap-3 rounded-md bg-secondary/45 px-3 py-2"
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
        </div>
      </CardContent>
    </Card>
  );
}
