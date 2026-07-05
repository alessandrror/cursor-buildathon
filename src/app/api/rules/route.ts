import { auth } from "@clerk/nextjs/server";

import { answeringRulesPayloadSchema } from "@/lib/rules/schema";
import { validateAndNormalizeRulesPayload } from "@/lib/rules/validation";
import {
  getAnsweringRulesForCurrentUser,
  getCountryCodeForCurrentUser,
  saveAnsweringRulesForCurrentUser,
} from "@/lib/supabase/answering-rules";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";

function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
}

function configErrorResponse() {
  return Response.json(
    { error: "Rules backend is not configured", code: "not_configured" },
    { status: 503 },
  );
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorizedResponse();

  if (!isSupabaseAdminConfigured()) {
    return configErrorResponse();
  }

  try {
    const rules = await getAnsweringRulesForCurrentUser();
    return Response.json({ rules });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load answering rules";
    return Response.json({ error: message, code: "load_failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorizedResponse();

  if (!isSupabaseAdminConfigured()) {
    return configErrorResponse();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body", code: "invalid_body" },
      { status: 400 },
    );
  }

  const parsed = answeringRulesPayloadSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return Response.json(
      {
        error: firstIssue?.message ?? "Invalid request body",
        code: "invalid_body",
        field: firstIssue?.path.join("."),
      },
      { status: 400 },
    );
  }

  try {
    const countryCode = await getCountryCodeForCurrentUser();
    const validation = validateAndNormalizeRulesPayload(
      parsed.data,
      countryCode,
    );

    if (!validation.ok) {
      return Response.json(
        {
          error: validation.error.message,
          code: validation.error.code,
          field: validation.error.field,
        },
        { status: 400 },
      );
    }

    const rules = await saveAnsweringRulesForCurrentUser(validation.normalized);
    return Response.json({ rules });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save answering rules";
    return Response.json({ error: message, code: "save_failed" }, { status: 500 });
  }
}
