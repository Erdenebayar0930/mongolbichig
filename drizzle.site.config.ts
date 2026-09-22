import { readFileSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

// drizzle-kit нь Next.js-ийн env ачаалагчийг ашигладаггүй тул .env.local-ыг
// өөрсдөө уншина. Эхлээд website/.env.local, байхгүй бол эцэг фолдерынхыг.
function loadEnvLocal() {
  if (process.env.SITE_DATABASE_URL) return;

  for (const file of [".env.local", "../.env.local"]) {
    try {
      const raw = readFileSync(file, "utf8");

      // Windows дээр .env.local нь CRLF-тэй байдаг — "\n"-ээр л таславал
      // мөрийн төгсгөлд "\r" үлдэж regex таарахаа больдог.
      for (const line of raw.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
        if (!match) continue;

        const [, key, rawValue] = match;
        const value = rawValue.trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }

      if (process.env.SITE_DATABASE_URL) return;
    } catch {
      // Файл байхгүй бол дараагийнхыг оролдоно
    }
  }
}

loadEnvLocal();

export default defineConfig({
  schema: "./src/lib/site/db/schema.ts",
  out: "./drizzle-site",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SITE_DATABASE_URL!,
  },
  /**
   * ⚠️ ЧУХАЛ: dashboard болон website нэг л Postgres дээр сууж байгаа.
   * Энэ шүүлтүүргүй бол `drizzle-kit push` нь схемд байхгүй бүх хүснэгтийг —
   * өөрөөр хэлбэл dashboard-ын users, transactions, assets... бүгдийг —
   * устгах SQL үүсгэнэ. `site_*`-аар хязгаарласнаар зөвхөн вэбсайтын
   * хүснэгтүүдийг л хөндөнө.
   */
  tablesFilter: ["site_*"],
});
