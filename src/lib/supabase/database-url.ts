const DIRECT_HOST_PATTERN = /^db\.([a-z0-9-]+)\.supabase\.co$/;

type PoolerOptions = {
  projectRef: string;
  password: string;
  region: string;
  port?: 5432 | 6543;
};

export function buildPoolerDatabaseUrl({
  projectRef,
  password,
  region,
  port = 5432,
}: PoolerOptions) {
  const username = `postgres.${projectRef}`;

  return `postgresql://${username}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:${port}/postgres`;
}

export function resolveDatabaseUrl() {
  const poolerUrl = process.env.DATABASE_POOLER_URL?.trim();
  if (poolerUrl) {
    return { url: poolerUrl, source: "DATABASE_POOLER_URL" as const };
  }

  const rawUrl = process.env.DATABASE_URL?.trim();
  if (!rawUrl) {
    throw new Error(
      "Missing DATABASE_URL. Add it to .env from Supabase Dashboard → Project Settings → Database → Connection string.",
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL connection URI.");
  }

  const directMatch = parsed.hostname.match(DIRECT_HOST_PATTERN);

  if (!directMatch) {
    return { url: rawUrl, source: "DATABASE_URL" as const };
  }

  const projectRef = directMatch[1];
  const region = process.env.SUPABASE_DB_REGION?.trim() || "us-east-1";
  const password = parsed.password;

  if (!password) {
    throw new Error("DATABASE_URL is missing the database password.");
  }

  return {
    url: buildPoolerDatabaseUrl({ projectRef, password, region }),
    source: "DATABASE_URL (converted to Session pooler)" as const,
    note:
      "Direct db.*.supabase.co connections are IPv6-only. Migrations use the IPv4-compatible Session pooler automatically.",
  };
}
