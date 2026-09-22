import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Postgres холболт — dashboard-ынхтай ижил зарчмаар залхуу (lazy) үүсгэнэ.
 * Build үед DATABASE_URL байхгүй байж болох тул модуль ачаалах агшинд
 * холбогдох ёсгүй.
 */
const globalForDb = globalThis as unknown as {
  __sitePool?: Pool;
  __siteDrizzle?: Database;
};

function getDb(): Database {
  if (globalForDb.__siteDrizzle) return globalForDb.__siteDrizzle;

  const connectionString = process.env.SITE_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "SITE_DATABASE_URL тохируулаагүй байна. .env.local файлдаа нэмнэ үү."
    );
  }

  const pool =
    globalForDb.__sitePool ??
    new Pool({
      connectionString,
      max: Number(process.env.SITE_DATABASE_POOL_MAX ?? 5),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ssl:
        process.env.SITE_DATABASE_SSL === "relaxed"
          ? { rejectUnauthorized: false }
          : process.env.SITE_DATABASE_SSL === "require"
            ? true
            : undefined,
    });

  globalForDb.__sitePool = pool;
  globalForDb.__siteDrizzle = drizzle(pool, { schema });

  return globalForDb.__siteDrizzle;
}

export const db = new Proxy({} as Database, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});

export { schema };
