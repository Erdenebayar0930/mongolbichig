import "server-only";

import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";

import { createDbPool, resolveDatabaseUrl } from "@/lib/db/createPool";

import * as schema from "./schema";

import type { Pool } from "mysql2/promise";

type Database = MySql2Database<typeof schema>;

/**
 * Сайтын MySQL холболт.
 *
 * Хүснэгтүүд `site_` угтвартай тул dashboard-тай НЭГ санд зэрэгцэн сууж
 * чадна — Hostinger-ийн shared hosting дээр яг ийм байдлаар ажиллана.
 * Тийм үед `SITE_DATABASE_URL`-ыг огт тохируулахгүй орхивол dashboard-ын
 * pool-ыг дахин ашиглана: shared hosting дээр холболт хомс тул хоёр тусдаа
 * pool барих нь шууд алдагдал.
 *
 * `SITE_DATABASE_URL` өгвөл тусдаа сан руу холбогдоно — хоёр аппыг өөр
 * сервер дээр салгах өдөр энэ нь ганц шаардлагатай өөрчлөлт болно.
 *
 * Pool-ыг ЗАЛХУУ (lazy) үүсгэнэ: build үед DATABASE_URL байхгүй байж болох
 * тул модуль ачаалах агшинд холбогдох ёсгүй.
 */
const globalForDb = globalThis as unknown as {
  __sitePool?: Pool;
  __siteDrizzle?: Database;
};

function getDb(): Database {
  if (globalForDb.__siteDrizzle) return globalForDb.__siteDrizzle;

  const connectionString =
    process.env.SITE_DATABASE_URL || resolveDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      "SITE_DATABASE_URL (эсвэл DATABASE_URL) тохируулаагүй байна. .env.local файлдаа нэмнэ үү."
    );
  }

  const pool =
    globalForDb.__sitePool ??
    createDbPool(
      connectionString,
      Number(process.env.SITE_DATABASE_POOL_MAX ?? process.env.DATABASE_POOL_MAX ?? 5)
    );

  globalForDb.__sitePool = pool;
  globalForDb.__siteDrizzle = drizzle(pool, { schema, mode: "default" });

  return globalForDb.__siteDrizzle;
}

export const db = new Proxy({} as Database, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});

export { schema };
