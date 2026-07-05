import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const ruleListItemSchema = z.object({
  id: z.string().optional(),
  value: z.string().trim().min(1, "El valor no puede estar vacío"),
  active: z.boolean(),
});

export const answeringRulesPayloadSchema = z.object({
  schedule: z.object({
    start: z.string().regex(timePattern, "Hora de inicio inválida (HH:MM)"),
    end: z.string().regex(timePattern, "Hora de fin inválida (HH:MM)"),
    active: z.boolean(),
  }),
  anonymousAction: z.enum(["answer", "reject"]),
  whitelist: z.array(ruleListItemSchema),
  blacklist: z.array(ruleListItemSchema),
  prefixBlock: z.array(ruleListItemSchema),
});

export type AnsweringRulesPayload = z.infer<typeof answeringRulesPayloadSchema>;
