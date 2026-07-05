// Dominio de reglas de contestación (capa pura, sin dependencias de n8n/Twilio).
// spec: specs/rules/configuracion-reglas-contestacion.md
// spec: specs/rules/evaluacion-reglas-llamada-entrante.md
// spec: specs/rules/deteccion-silencio-inicial.md

/** Tipos de regla soportados. spec: data/modelo-datos-core.md §answering_rules.
 *  `reject_action` se añade como singleton para la "Acción de rechazo" global de
 *  la spec de configuración (control de cambios documentado en la spec). */
export type RuleType =
  | "whitelist"
  | "blacklist"
  | "schedule"
  | "anonymous"
  | "prefix_block"
  | "reject_action";

/** Reglas de las que puede haber varias (listas). */
export const LIST_RULE_TYPES = ["whitelist", "blacklist", "prefix_block"] as const;
/** Reglas de las que solo hay una activa (ajustes). */
export const SINGLETON_RULE_TYPES = ["schedule", "anonymous", "reject_action"] as const;

/** Decisión sobre una llamada entrante. spec: evaluacion §Output. */
export type Decision = "answer" | "reject";

/** Acción con la que se rechaza. spec: configuracion §Acción de rechazo. */
export type RejectAction = "busy" | "hangup" | "message";

/** Acción configurada para llamadas anónimas. spec: configuracion. */
export type AnonymousAction = "answer" | "reject";

/** Payload por tipo de regla. spec: data/modelo-datos-core.md §answering_rules. */
export type RuleValue =
  | { number: string } // whitelist | blacklist (E.164)
  | { start: string; end: string } // schedule (HH:MM local)
  | { action: AnonymousAction } // anonymous
  | { prefix: string } // prefix_block (E.164 prefix)
  | { action: RejectAction }; // reject_action

export type AnsweringRule = {
  id: string;
  userId?: string;
  ruleType: RuleType;
  value: RuleValue;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** Perfil relevante para la evaluación. spec: data/modelo-datos-core.md §profiles. */
export type Profile = {
  /** IANA timezone, p.ej. "America/El_Salvador". */
  timezone: string;
  /** ISO 3166-1 alpha-2, p.ej. "SV". Usado para normalizar números locales. */
  countryCode: string;
};

/** Entrada de una llamada entrante a evaluar. spec: evaluacion §Inputs. */
export type IncomingCall = {
  /** Número del emisor en E.164, o null si viene oculto/anónimo. */
  callerNumber: string | null;
  /** Momento de la llamada (UTC). */
  timestamp: Date;
};

/** Resultado de la evaluación. spec: evaluacion §Output. */
export type EvaluationResult = {
  decision: Decision;
  /** Solo presente si decision === "reject". */
  rejectAction?: RejectAction;
  /** Identificador de la regla que determinó la decisión (trazabilidad). */
  matchedRule: string;
  /** Explicación legible del porqué (para la UI del simulador). */
  reason: string;
};

/** Outcome persistido en la fila de `calls`. spec: data/modelo-datos-core.md §calls. */
export type CallOutcome =
  | "rejected"
  | "in_progress"
  | "completed"
  | "silent_hangup"
  | "caller_hangup"
  | "agent_error"
  | "pending_summary";
