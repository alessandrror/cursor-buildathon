import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

import type { AnsweringRulesPayload } from "@/lib/rules/schema";
import type { AnsweringRulesConfig, RuleListItem } from "@/lib/supabase/answering-rules";

const E164_REGEX = /^\+[1-9]\d{6,14}$/;
const PREFIX_REGEX = /^\+[1-9]\d{0,14}$/;

export type RulesValidationError = {
  code: string;
  message: string;
  field?: string;
};

export function normalizePhoneToE164(
  input: string,
  defaultCountry: string,
): string | null {
  const trimmed = input.trim();
  const country = defaultCountry.toUpperCase() as CountryCode;

  const parsed = parsePhoneNumberFromString(trimmed, country);
  if (parsed?.isValid()) {
    return parsed.format("E.164");
  }

  const compact = trimmed.replace(/\s/g, "");
  if (E164_REGEX.test(compact)) {
    return compact;
  }

  return null;
}

export function normalizePrefix(input: string): string | null {
  const cleaned = input.trim().replace(/\s/g, "");
  if (!PREFIX_REGEX.test(cleaned)) {
    return null;
  }
  return cleaned;
}

function findDuplicateValues(values: string[]): string | null {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      return value;
    }
    seen.add(value);
  }
  return null;
}

function normalizePhoneList(
  items: RuleListItem[],
  listName: "whitelist" | "blacklist",
  countryCode: string,
): { ok: true; items: RuleListItem[] } | { ok: false; error: RulesValidationError } {
  const normalized: RuleListItem[] = [];
  const numbers: string[] = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index]!;
    const number = normalizePhoneToE164(item.value, countryCode);

    if (!number) {
      const label = listName === "whitelist" ? "lista blanca" : "lista negra";
      return {
        ok: false,
        error: {
          code: "invalid_phone",
          message: `Número inválido en ${label}: «${item.value}». Usa formato internacional (ej. +503 7712 4408).`,
          field: `${listName}.${index}`,
        },
      };
    }

    numbers.push(number);
    normalized.push({ ...item, value: number });
  }

  const duplicate = findDuplicateValues(numbers);
  if (duplicate) {
    const label = listName === "whitelist" ? "lista blanca" : "lista negra";
    return {
      ok: false,
      error: {
        code: "duplicate_number",
        message: `El número ${duplicate} está duplicado en la ${label}.`,
        field: listName,
      },
    };
  }

  return { ok: true, items: normalized };
}

function normalizePrefixList(
  items: RuleListItem[],
): { ok: true; items: RuleListItem[] } | { ok: false; error: RulesValidationError } {
  const normalized: RuleListItem[] = [];
  const prefixes: string[] = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index]!;
    const prefix = normalizePrefix(item.value);

    if (!prefix) {
      return {
        ok: false,
        error: {
          code: "invalid_prefix",
          message: `Prefijo inválido: «${item.value}». Debe empezar con + y dígitos (ej. +1800).`,
          field: `prefixBlock.${index}`,
        },
      };
    }

    prefixes.push(prefix);
    normalized.push({ ...item, value: prefix });
  }

  const duplicate = findDuplicateValues(prefixes);
  if (duplicate) {
    return {
      ok: false,
      error: {
        code: "duplicate_prefix",
        message: `El prefijo ${duplicate} está duplicado.`,
        field: "prefixBlock",
      },
    };
  }

  return { ok: true, items: normalized };
}

export function validateAndNormalizeRulesPayload(
  payload: AnsweringRulesPayload,
  countryCode: string,
):
  | { ok: true; normalized: AnsweringRulesConfig }
  | { ok: false; error: RulesValidationError } {
  const whitelistResult = normalizePhoneList(
    payload.whitelist,
    "whitelist",
    countryCode,
  );
  if (!whitelistResult.ok) {
    return whitelistResult;
  }

  const blacklistResult = normalizePhoneList(
    payload.blacklist,
    "blacklist",
    countryCode,
  );
  if (!blacklistResult.ok) {
    return blacklistResult;
  }

  const prefixResult = normalizePrefixList(payload.prefixBlock);
  if (!prefixResult.ok) {
    return prefixResult;
  }

  const activeWhitelist = new Set(
    whitelistResult.items
      .filter((item) => item.active)
      .map((item) => item.value),
  );
  const activeBlacklist = new Set(
    blacklistResult.items
      .filter((item) => item.active)
      .map((item) => item.value),
  );

  for (const number of activeWhitelist) {
    if (activeBlacklist.has(number)) {
      return {
        ok: false,
        error: {
          code: "whitelist_blacklist_conflict",
          message: `El número ${number} no puede estar activo en lista blanca y negra a la vez.`,
          field: "whitelist",
        },
      };
    }
  }

  return {
    ok: true,
    normalized: {
      ...payload,
      whitelist: whitelistResult.items,
      blacklist: blacklistResult.items,
      prefixBlock: prefixResult.items,
    },
  };
}
