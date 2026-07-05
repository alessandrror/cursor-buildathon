type PostgrestErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export function formatSupabaseError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Error al consultar llamadas.";
  }

  const pg = error as PostgrestErrorLike;
  const parts = [pg.message, pg.details, pg.hint].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" — ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Error al consultar llamadas.";
}

export function getSupabaseErrorHint(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const code = (error as PostgrestErrorLike).code;
  const message = (error as PostgrestErrorLike).message ?? "";

  if (
    code === "PGRST301" ||
    /jwt/i.test(message) ||
    /cryptographic operation failed/i.test(message)
  ) {
    return "Supabase rechazó el token de Clerk. En Clerk activa Connect with Supabase (JWT template «supabase»). En Supabase → Authentication → Third Party Auth → Clerk, usa el dominio welcome-wasp-44.clerk.accounts.dev (o el de tu instancia).";
  }

  if (code === "42P01" || /does not exist/i.test(message)) {
    return "Faltan tablas del pipeline. Ejecuta supabase/migrations/*.sql en el SQL Editor de Supabase (001 + 003).";
  }

  if (/relationship/i.test(message)) {
    return "El esquema de base de datos no coincide con la app. Aplica la migración 003_call_pipeline_schema.sql.";
  }

  return null;
}
