import { readFileSync } from "node:fs";
import { STEMS } from "../../src/lib/site/mongolScript.ts";
import { WORDS } from "../../src/lib/site/mongolLexicon.ts";
import { checkWord, MVS } from "../../src/lib/site/mongolRules.ts";

type Row = { id: number; cyrillic: string; mongol: string };
const toli = new Map<string, string[]>();
for (const line of readFileSync("scripts/data/mongoltoli-words.jsonl", "utf8").split("\n").filter(Boolean)) {
  const r: Row = JSON.parse(line);
  const key = r.cyrillic.toLowerCase();
  toli.set(key, [...(toli.get(key) ?? []), r.mongol]);
}

/** Дүрмийн `fix` талбарыг ашиглаж механик засвар хийнэ */
function apply(script: string, only: string[]): string {
  for (let pass = 0; pass < 6; pass += 1) {
    const issue = checkWord(script).find((i) => only.includes(i.rule) && i.fix);
    if (!issue) break;
    script = script.slice(0, issue.index) + issue.fix + script.slice(issue.index + issue.length);
  }
  return script;
}

const RULES_TO_FIX = ["mvs-missing", "rounded-position"];
let agree = 0, disagree = 0, unknown = 0;
const rows: string[] = [];

for (const [name, table] of [["STEMS", STEMS], ["WORDS", WORDS]] as const) {
  for (const [cyr, script] of Object.entries(table)) {
    if (!checkWord(script).some((i) => RULES_TO_FIX.includes(i.rule))) continue;
    const fixed = apply(script, RULES_TO_FIX);
    if (fixed === script) continue;
    const dict = toli.get(cyr);
    const verdict = !dict ? (unknown++, "толинд алга") : dict.includes(fixed) ? (agree++, "ТОЛЬ ЗӨВШӨӨРЛӨӨ") : (disagree++, `толь: ${dict.slice(0,2).join(" | ")}`);
    rows.push(`  ${name} ${cyr.padEnd(14)} ${script.padEnd(16)} → ${fixed.padEnd(16)} ${verdict}`);
  }
}
console.log(rows.join("\n"));
console.log(`\nтолин дээр таарсан ${agree}, зөрсөн ${disagree}, толинд байхгүй ${unknown}`);
