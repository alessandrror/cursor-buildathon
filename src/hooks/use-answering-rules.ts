"use client";

// Hook cliente que gestiona las reglas de contestación con degradación elegante:
// - "persistent": lee/escribe en Supabase con RLS (usuario autenticado).
// - "demo": estado en memoria sembrado con defaults cuando Supabase no está
//   configurado, para poder demostrar los escenarios sin integración.
// spec: configuracion-reglas-contestacion.md

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { buildDefaultRules } from "@/lib/rules/defaults";
import type { AnsweringRule, RuleType, RuleValue } from "@/lib/rules/types";
import * as api from "@/lib/supabase/answering-rules";
import { useSupabaseClient } from "@/lib/supabase/client";

export type RulesMode = "persistent" | "demo";
export type RulesStatus = "loading" | "ready" | "error";

export function useAnsweringRules() {
  const supabase = useSupabaseClient();
  const { user, isLoaded } = useUser();
  const userId = user?.id ?? null;

  const [rules, setRules] = useState<AnsweringRule[]>([]);
  const [mode, setMode] = useState<RulesMode>("demo");
  const [status, setStatus] = useState<RulesStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const persistent = Boolean(supabase && userId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isLoaded) return;

      if (!supabase || !userId) {
        if (cancelled) return;
        setRules(buildDefaultRules());
        setMode("demo");
        setStatus("ready");
        return;
      }

      setStatus("loading");
      try {
        let fetched = await api.fetchAnsweringRules(supabase);
        // Genera el set por defecto la primera vez (spec: defaults al crear cuenta).
        if (fetched.length === 0) {
          const created = await Promise.all(
            buildDefaultRules().map((r) =>
              api.insertAnsweringRule(supabase, userId, r.ruleType, r.value),
            ),
          );
          fetched = created;
        }
        if (cancelled) return;
        setRules(fetched);
        setMode("persistent");
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Error al cargar reglas");
        setRules(buildDefaultRules());
        setMode("demo");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, isLoaded]);

  const addRule = useCallback(
    async (ruleType: RuleType, value: RuleValue) => {
      if (persistent && supabase && userId) {
        const created = await api.insertAnsweringRule(
          supabase,
          userId,
          ruleType,
          value,
        );
        setRules((prev) => [...prev, created]);
        return created;
      }
      const local: AnsweringRule = {
        id: crypto.randomUUID(),
        ruleType,
        value,
        isActive: true,
      };
      setRules((prev) => [...prev, local]);
      return local;
    },
    [persistent, supabase, userId],
  );

  const updateRule = useCallback(
    async (id: string, patch: { value?: RuleValue; isActive?: boolean }) => {
      if (persistent && supabase) {
        const updated = await api.updateAnsweringRule(supabase, id, patch);
        setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
        return;
      }
      setRules((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                value: patch.value ?? r.value,
                isActive: patch.isActive ?? r.isActive,
              }
            : r,
        ),
      );
    },
    [persistent, supabase],
  );

  const removeRule = useCallback(
    async (id: string) => {
      if (persistent && supabase) {
        await api.deleteAnsweringRule(supabase, id);
      }
      setRules((prev) => prev.filter((r) => r.id !== id));
    },
    [persistent, supabase],
  );

  /** Crea o actualiza la regla singleton (schedule/anonymous/reject_action). */
  const setSingleton = useCallback(
    async (ruleType: RuleType, value: RuleValue) => {
      const existing = rules.find((r) => r.ruleType === ruleType);
      if (existing) {
        await updateRule(existing.id, { value, isActive: true });
      } else {
        await addRule(ruleType, value);
      }
    },
    [rules, addRule, updateRule],
  );

  return {
    rules,
    mode,
    status,
    error,
    addRule,
    updateRule,
    removeRule,
    setSingleton,
  };
}
