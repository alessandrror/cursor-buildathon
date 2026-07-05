"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Clock3,
  EyeOff,
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
import type {
  AnsweringRulesConfig,
  RuleListItem,
} from "@/lib/supabase/answering-rules";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type RulesBoardProps = {
  initialRules: AnsweringRulesConfig;
};

type RuleListKind = "whitelist" | "blacklist" | "prefixBlock";

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

function getActiveCount(list: RuleListItem[]) {
  return list.filter((item) => item.active).length;
}

function createRuleItem(value: string): RuleListItem {
  return {
    id: `${value}-${Date.now()}`,
    value,
    active: true,
  };
}

export function RulesBoard({ initialRules }: RulesBoardProps) {
  const [scheduleStart, setScheduleStart] = useState(initialRules.schedule.start);
  const [scheduleEnd, setScheduleEnd] = useState(initialRules.schedule.end);
  const [anonymousAction, setAnonymousAction] = useState(
    initialRules.anonymousAction,
  );
  const [whitelist, setWhitelist] = useState(() =>
    withFallback(initialRules.whitelist, fallbackWhiteList),
  );
  const [blacklist, setBlacklist] = useState(() =>
    withFallback(initialRules.blacklist, fallbackBlackList),
  );
  const [prefixBlock, setPrefixBlock] = useState(() =>
    withFallback(initialRules.prefixBlock, fallbackPrefixes),
  );

  const stats = useMemo(
    () => [
      {
        label: "Horario",
        value: `${scheduleStart}-${scheduleEnd}`,
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
    [anonymousAction, blacklist, scheduleEnd, scheduleStart, whitelist],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          Reglas de contestación
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define qué llamadas atiende el agente y cuáles se rechazan.
        </p>
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
              <Label className="mb-3 block font-display font-bold">
                Horario de atención
              </Label>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <Input
                  type="time"
                  value={scheduleStart}
                  onChange={(event) => setScheduleStart(event.target.value)}
                  aria-label="Hora de inicio"
                />
                <span className="text-muted-foreground" aria-hidden>
                  -
                </span>
                <Input
                  type="time"
                  value={scheduleEnd}
                  onChange={(event) => setScheduleEnd(event.target.value)}
                  aria-label="Hora de fin"
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Zona: America/El_Salvador
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
          items={prefixBlock}
          onChange={setPrefixBlock}
          kind="prefixBlock"
        />
      </section>

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
    </div>
  );
}

type RuleListCardProps = {
  title: string;
  count: number;
  icon: LucideIcon;
  iconClassName: string;
  placeholder: string;
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

  function toggleItem(id: string) {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item,
      ),
    );
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
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
        </div>
      </CardContent>
    </Card>
  );
}
