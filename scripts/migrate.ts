import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import postgres from "postgres";

import { resolveDatabaseUrl } from "@/lib/supabase/database-url";

const migrationsDir = join(process.cwd(), "supabase/migrations");

async function ensureMigrationsTable(sql: postgres.Sql) {
  await sql`
    create table if not exists public.schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    )
  `;
}

async function main() {
  const { url, source, note } = resolveDatabaseUrl();

  console.log(`Using ${source}.`);
  if (note) {
    console.log(note);
  }

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  const sql = postgres(url, {
    max: 1,
    connect_timeout: 15,
    ssl: "require",
  });

  try {
    await ensureMigrationsTable(sql);

    for (const file of files) {
      const version = file.replace(/\.sql$/, "");
      const applied = await sql<{ version: string }[]>`
        select version
        from public.schema_migrations
        where version = ${version}
      `;

      if (applied.length > 0) {
        console.log(`skip  ${file} (already applied)`);
        continue;
      }

      const contents = readFileSync(join(migrationsDir, file), "utf8");

      await sql.begin(async (transaction) => {
        await transaction.unsafe(contents);
        await transaction`
          insert into public.schema_migrations (version)
          values (${version})
        `;
      });

      console.log(`apply ${file}`);
    }

    console.log("Migrations complete.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);

    if ("code" in error && error.code === "ENOTFOUND") {
      console.error(
        "\nCould not resolve the database host. Use the Session pooler URI from Supabase Dashboard → Connect → Session pooler, or set DATABASE_POOLER_URL in .env.",
      );
    }

    if ("code" in error && error.code === "XX000") {
      console.error(
        "\nPooler connection rejected. Check SUPABASE_DB_REGION matches your project region, or paste the Session pooler URI into DATABASE_POOLER_URL.",
      );
    }
  } else {
    console.error(error);
  }

  process.exit(1);
});
