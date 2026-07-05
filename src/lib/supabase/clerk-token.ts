import { auth } from "@clerk/nextjs/server";

const DEFAULT_SUPABASE_JWT_TEMPLATE = "supabase";

function getSupabaseJwtTemplateName(): string {
  return (
    process.env.CLERK_SUPABASE_JWT_TEMPLATE?.trim() ||
    DEFAULT_SUPABASE_JWT_TEMPLATE
  );
}

async function tryClerkJwtTemplate(
  getToken: Awaited<ReturnType<typeof auth>>["getToken"],
  template: string,
): Promise<string | null> {
  try {
    return (await getToken({ template })) ?? null;
  } catch {
    return null;
  }
}

/**
 * Token para Supabase RLS.
 * 1) JWT template «supabase» (legacy / setup de Clerk Connect)
 * 2) Session token (integración nativa Third Party Auth en Supabase)
 */
export async function getClerkSupabaseAccessToken(): Promise<string | null> {
  const { getToken } = await auth();

  const templateToken = await tryClerkJwtTemplate(
    getToken,
    getSupabaseJwtTemplateName(),
  );
  if (templateToken) {
    return templateToken;
  }

  return (await getToken()) ?? null;
}
