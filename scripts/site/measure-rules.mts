/**
 * ДҮРМИЙГ ТОЛЬ ДЭЭР ХЭМЖИНЭ.
 *
 *     npm run rules:measure
 *
 * [mongolRules.ts](../../src/lib/site/mongolRules.ts) дахь дүрэм бүр `evidence`
 * талбартай — «толинд ийм харьцаатай байв» гэсэн тоо. Тэр тоонууд яг эндээс
 * гарна. Дүрэм нэмэх, засах бол энэ скриптийг ажиллуулж, гарсан тоог нь
 * файлын тайлбарт бич.
 *
 * Дөрвөн хэсэг:
 *
 *   1. **Дүрмийн зөрчил** — толийн бичлэгүүд дүрэм бүрийг хэр баримталдаг вэ.
 *      Их тайлбар толь бол эрдэм шинжилгээний эх сурвалж тул зөрчил өндөр
 *      гарвал ТОЛЬ биш ДҮРЭМ буруу байх магадлалтай.
 *   2. **Буулгагчийн нарийвчлал** — `cyrillicPhonetic` толинд байгаа үгийг
 *      хэр зөв таадаг вэ. Толинд байгаа үгэнд хөрвүүлэгч дуудлага руу
 *      ордоггүй тул энэ нь шууд хэрэглэгчийн тоо биш, харин ТОЛИНД БАЙХГҮЙ
 *      үгэнд юу болохыг хамгийн сайн төлөөлдөг хэмжүүр.
 *   3. **Буулгагчийн өөрийн зөрчил** — гаралт нь өөрийн дүрмээ зөрчиж
 *      байвал энэ нь кодын алдаа. Тэг байх ёстой.
 *   4. **Багцад суусан толиуд** — `STEMS`, `WORDS` нь `build-toli.py`-аас
 *      үүсдэг бөгөөд тэр скрипт мөн ижил дүрмийг барьдаг. Хоёр хуулбар
 *      салвал энд илэрнэ.
 *
 * ⚠ Эх өгөгдөл нь `scripts/data/mongoltoli-words.jsonl` — `fetch-mongoltoli.py`
 * хураасан файл. Git-д ороогүй бол эхлээд `npm run toli:fetch` ажиллуул.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { WORDS } from "../../src/lib/site/mongolLexicon.ts";
import { STEMS, cyrillicPhonetic } from "../../src/lib/site/mongolScript.ts";
import {
  GALIG,
  MVS,
  RULES,
  checkWord,
  hasGalig,
} from "../../src/lib/site/mongolRules.ts";

type Entry = { id: number; cyrillic: string; mongol: string };

const here = dirname(fileURLToPath(import.meta.url));
const DATA = join(here, "data", "mongoltoli-words.jsonl");

const all: Entry[] = readFileSync(DATA, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line) as Entry);

/** Хэллэг биш, нэг үгтэй толгой үг — дүрэм үгэнд үйлчилнэ, өгүүлбэрт биш */
const single = all.filter((entry) => !/[\s ]/.test(entry.mongol.trim()));

/** Галиг тэмдэггүй «уугуул» хэсэг — харь үгэнд өөр дүрэм үйлчилдэг */
const native = single.filter((entry) => !hasGalig(entry.mongol));

const pct = (part: number, total: number) =>
  `${((100 * part) / (total || 1)).toFixed(2)}%`;

console.log(`Толь: ${all.length} бичлэг`);
console.log(`  нэг үгтэй:      ${single.length}`);
console.log(`  галиггүй:       ${native.length}`);
console.log(`  галиг тэмдэгт:  ${[...GALIG].join(" ")}`);

/* -------------------------------------------------------------------------- */
/* 1. Дүрэм бүрийн зөрчил                                                      */
/* -------------------------------------------------------------------------- */

console.log("\n════ 1. ТОЛЬ ДҮРМИЙГ ХЭР БАРИМТАЛДАГ ВЭ ════\n");

for (const rule of RULES) {
  const pool = rule.nativeOnly ? native : single;
  const broken: Entry[] = [];

  for (const entry of pool) {
    if (rule.nativeOnly && hasGalig(entry.mongol)) continue;
    if (rule.find(entry.mongol.replace(/[᠊-᠍‍]/g, "")).length > 0) {
      broken.push(entry);
    }
  }

  const rate = pct(broken.length, pool.length);
  console.log(
    `${rule.severity.toUpperCase().padEnd(5)} ${rule.id.padEnd(22)} ` +
      `зөрчил ${String(broken.length).padStart(6)}/${pool.length}  ${rate}`,
  );
  console.log(`      тэмдэглэсэн нотолгоо: ${rule.evidence}`);
  for (const entry of broken.slice(0, 3)) {
    console.log(`      · ${entry.cyrillic} → ${show(entry.mongol)}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Буулгагчийн нарийвчлал                                                   */
/* -------------------------------------------------------------------------- */

console.log("\n════ 2. cyrillicPhonetic ТОЛИЙГ ХЭР ТААДАГ ВЭ ════\n");

let exact = 0;
const missed: Entry[] = [];

for (const entry of native) {
  const guess = cyrillicPhonetic(entry.cyrillic.toLowerCase());
  if (guess === entry.mongol) exact += 1;
  else if (missed.length < 4000) missed.push(entry);
}

console.log(`  яг таарсан: ${exact}/${native.length}  ${pct(exact, native.length)}`);
console.log("\n  Хамгийн түгээмэл зөрүү (эхний 8):");
for (const entry of missed.slice(0, 8)) {
  console.log(
    `    ${entry.cyrillic.toLowerCase().padEnd(16)} толь ${show(entry.mongol).padEnd(18)} ` +
      `буулгасан ${show(cyrillicPhonetic(entry.cyrillic.toLowerCase()))}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Буулгагч өөрийн дүрмээ зөрчиж байна уу                                   */
/* -------------------------------------------------------------------------- */

console.log("\n════ 3. БУУЛГАГЧИЙН ГАРАЛТ ДҮРМЭЭ ЗӨРЧИЖ БАЙНА УУ ════\n");

const selfBroken = new Map<string, { count: number; sample: string }>();

for (const entry of native) {
  const cyrillic = entry.cyrillic.toLowerCase();
  for (const issue of checkWord(cyrillicPhonetic(cyrillic))) {
    const seen = selfBroken.get(issue.rule);
    if (seen) seen.count += 1;
    else {
      selfBroken.set(issue.rule, {
        count: 1,
        sample: `${cyrillic} → ${show(cyrillicPhonetic(cyrillic))}`,
      });
    }
  }
}

if (selfBroken.size === 0) {
  console.log("  зөрчилгүй — буулгагч дүрмийн хүснэгтээ бүрэн барьж байна");
} else {
  for (const [id, { count, sample }] of [...selfBroken].sort(
    (a, b) => b[1].count - a[1].count,
  )) {
    console.log(`  ${id.padEnd(22)} ${String(count).padStart(6)}  жишээ: ${sample}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Багцад суусан толиуд                                                     */
/* -------------------------------------------------------------------------- */

/**
 * `STEMS` ба `WORDS` нь `build-toli.py` үүсгэдэг бөгөөд тэр скрипт мөн ижил
 * дүрмийг барьдаг. Хоёр хуулбар салвал энд шууд харагдана — тиймээс энэ хэсэг
 * нь зөвхөн тайлан биш, ХАМГААЛАЛТ.
 */

console.log(`\n════ 4. БАГЦАД СУУСАН ТОЛИУД ════\n`);

for (const [name, table] of [
  ["STEMS", STEMS],
  ["WORDS", WORDS],
] as const) {
  const byRule = new Map<string, string[]>();

  for (const [cyrillic, script] of Object.entries(table)) {
    for (const issue of checkWord(script)) {
      const list = byRule.get(issue.rule) ?? [];
      list.push(`${cyrillic}=${show(script)}`);
      byRule.set(issue.rule, list);
    }
  }

  console.log(`  ${name} (${Object.keys(table).length} бичлэг)`);
  if (byRule.size === 0) console.log("    зөрчилгүй");

  for (const [id, list] of [...byRule].sort((a, b) => b[1].length - a[1].length)) {
    console.log(
      `    ${id.padEnd(22)} ${String(list.length).padStart(3)}  ${list.slice(0, 6).join("  ")}`,
    );
  }
}

/** Зайлуулагчийг терминалд харагдахуйц болгоно — эс бөгөөс үл үзэгдэнэ */
function show(script: string) {
  return script.replaceAll(MVS, "·");
}
