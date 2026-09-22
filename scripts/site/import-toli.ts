/**
 * mongoltoli.mn-ээс хураасан толийг Postgres руу бичнэ.
 *
 *   python scripts/fetch-mongoltoli.py index
 *   python scripts/fetch-mongoltoli.py detail --limit 150000
 *   npm run db:push          # site_toli хүснэгтийг үүсгэнэ
 *   npm run toli:import      # энэ скрипт
 *
 * Эх файл: scripts/data/mongoltoli-words.jsonl — мөр бүр
 * `{"id": 34, "cyrillic": "ААВ", "mongol": "ᠠᠪᠤ"}`.
 *
 * Дахин ажиллуулахад аюулгүй: `ug_id`-аар upsert хийнэ. Хураах ажил тасарч,
 * дахин үргэлжилсэн ч энэ скриптийг дахин дуудахад давхардал үүсэхгүй.
 *
 * Кирилл үгийг ЖИЖИГ үсгээр хадгална — эх сурвалж бүгдийг том үсгээр өгдөг
 * бол хөрвүүлэгч жижгээр хайдаг. Нормчлолыг нэг л газар, энд хийнэ.
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { siteToli } from "../../src/lib/site/db/schema";

// tsx --env-file=.env.local уншаагүй тохиолдолд эцэг фолдерынхыг оролдоно.
if (!process.env.DATABASE_URL) {
  for (const file of [".env.local", "../.env.local"]) {
    try {
      for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
        if (!match) continue;

        const [, key, rawValue] = match;
        if (!process.env[key]) {
          process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
        }
      }
      if (process.env.DATABASE_URL) break;
    } catch {
      // дараагийн файлыг оролдоно
    }
  }
}

const SOURCE = "scripts/data/mongoltoli-words.jsonl";
/** Нэг INSERT-д хэдэн мөр. Postgres-ийн параметрийн дээд хязгаар 65535 —
 *  мөр тутамд 3 багана тул 1000 нь аюулгүй зайтай. */
const CHUNK = 1000;

type Row = { ugId: number; cyrillic: string; mongol: string };

async function main() {
  if (!existsSync(SOURCE)) {
    throw new Error(
      `${SOURCE} олдсонгүй — эхлээд fetch-mongoltoli.py detail ажиллуулна уу.`,
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "disable" ? false : undefined,
  });
  const db = drizzle(pool);

  try {
    let batch: Row[] = [];
    let total = 0;
    let malformed = 0;

    const flush = async () => {
      if (batch.length === 0) return;
      await db
        .insert(siteToli)
        .values(batch)
        .onConflictDoUpdate({
          target: siteToli.ugId,
          set: {
            cyrillic: sql`excluded.cyrillic`,
            mongol: sql`excluded.mongol`,
          },
        });
      total += batch.length;
      batch = [];
      process.stdout.write(`\r  ${total} бичлэг…`);
    };

    // Файл нь хэдэн зуун MB болж болзошгүй тул бүтнээр нь санах ойд авахгүй.
    const lines = createInterface({
      input: createReadStream(SOURCE, "utf8"),
      crlfDelay: Infinity,
    });

    for await (const line of lines) {
      if (!line.trim()) continue;
      let parsed: { id?: number; cyrillic?: string; mongol?: string };
      try {
        parsed = JSON.parse(line);
      } catch {
        malformed++;
        continue;
      }
      const { id, cyrillic, mongol } = parsed;
      if (typeof id !== "number" || !cyrillic || !mongol) {
        malformed++;
        continue;
      }
      batch.push({
        ugId: id,
        cyrillic: cyrillic.trim().toLowerCase(),
        mongol: mongol.trim(),
      });
      if (batch.length >= CHUNK) await flush();
    }
    await flush();

    process.stdout.write("\n");
    if (malformed > 0) console.log(`⚠ гэмтсэн мөр алгасав: ${malformed}`);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(siteToli);
    const [{ distinct }] = await db
      .select({ distinct: sql<number>`count(distinct cyrillic)::int` })
      .from(siteToli);

    console.log(`✓ Нийт бичлэг: ${count}`);
    console.log(`  давхцалгүй кирилл үг: ${distinct} (зөрүү нь омоним)`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
