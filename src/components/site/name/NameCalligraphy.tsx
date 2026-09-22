"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { convertName, nameLookups, type NameToli } from "@/lib/site/mongolScript";

/**
 * Нэрийн уран бичлэг үүсгэгч.
 *
 * Урьдчилсан харагдац ба татаж авах зураг **нэг л зурагдалтаас** гардаг:
 * хоёуланг нь `<canvas>` дээр зурна. DOM дээр тусад нь харуулаад canvas дээр
 * дахин зурвал хоёр нь өчүүхэн ялгаатай болж, хэрэглэгч татсан файлаа хараад
 * гайхах эрсдэлтэй.
 *
 * Босоо монгол бичгийг canvas дээр буулгах арга: хэвтээгээр бичээд 90°
 * цагийн зүүний дагуу эргүүлнэ. Monгол бичгийн фонтын үсгүүд хэвтээ
 * байрлалдаа хажуу тийшээ хэвтэж зурагддаг тул эргүүлэхэд яг босоо баганы
 * хэлбэрт ордог — CSS-ийн `writing-mode: vertical-lr` ч дотроо ийм ажилладаг.
 */

type Material = {
  value: string;
  label: string;
  /** Дэвсгэрийн өнгө */
  bg: string;
  /** Бэхний өнгө */
  ink: string;
  /** Хүрээний өнгө */
  frame: string;
  /** Цаасан ширхэгийн өнгө (маш бүдэг цэгүүд) */
  grain: string;
  /** Тамганы талбайн өнгө — улаан тамга улаан дэвсгэр дээр алга болно */
  sealBg: string;
  /** Тамганы хээний өнгө */
  sealInk: string;
};

const MATERIALS: Material[] = [
  {
    value: "caas",
    label: "Цаасан бичээс",
    bg: "#f2e7d3",
    ink: "#14100a",
    frame: "#a5842f",
    grain: "rgba(28, 21, 13, 0.06)",
    sealBg: "#d42a1e",
    sealInk: "#100c08",
  },
  {
    value: "beh",
    label: "Хар бэх",
    bg: "#13100b",
    ink: "#f5e7b7",
    frame: "#c9a748",
    grain: "rgba(255, 255, 255, 0.05)",
    sealBg: "#d42a1e",
    sealInk: "#100c08",
  },
  {
    value: "ulaan",
    label: "Улаан ерөөл",
    bg: "#8e1810",
    ink: "#f2e7d3",
    frame: "#ecd68d",
    grain: "rgba(255, 255, 255, 0.045)",
    sealBg: "#ecd68d",
    sealInk: "#8e1810",
  },
];

/**
 * Тамганы хээ — `public/brand/seal.svg`-тэй яг ижил лабиринт.
 *
 * Зургаар (`<img>`) татаж зотон дээр буулгаж ч болох ч зарим хөтөч SVG зураг
 * зурсан зотоныг «бохирдсон» гэж үзэж `toDataURL`-ыг хориглодог — тэгвэл
 * татах товч чимээгүй ажиллахаа болино. Зам нь ямар ч хэмжээнд тод.
 */
const TAMGA_MAZE =
  "M10 48H16V16H80V80H24V24H72V72H32V32H64V64H40V40H56V56H48";

/**
 * Бичлэгийн хэв.
 *
 * Вэбэд чөлөөтэй тараах эрхтэй монгол бичгийн фонт бараг ганц — Noto Sans
 * Mongolian, тэр нь хэвлэмэл, жигд нарийхан татлагатай. Уран бичлэгийн
 * фонтууд (Мэнксофт, БолорСофт) лицензтэй тул сайтад суулгаж тараах эрхгүй.
 *
 * Тиймээс гоо сайхныг фонтоос биш, бийрийн зан үйлээс гаргав: үсгийг бийрийн
 * үзүүрийн өнцгийн дагуу олон удаа давхарлан зурвал өнцөгт перпендикуляр
 * татлага бүдүүрч, зэрэгцээ нь нарийсна — яг л ташуу иштэй бийрийн үлдээх
 * зузаан нимгэний хэлбэлзэл. Дээр нь цаасанд шингэсэн бэхний зөөлөн хүрээ,
 * хуурай бийрийн сэвсгэр ул мөр нэмнэ.
 *
 * Лицензтэй уран бичлэгийн фонт олдвол docs/font.md-ийн дагуу суулгахад
 * эдгээр хэв тэр фонт дээр бүр илүү сайхан ажиллана.
 */
type Script = {
  value: string;
  label: string;
  hint: string;
  /** Бийрийн үзүүрийн өргөн — фонтын хэмжээнд харьцуулсан */
  nib: number;
  /** Бэх цаасанд шингэх зөөлөн хүрээ */
  bleed: number;
  /** Хуурай бийрийн ул мөр. 0 бол чийглэг, жигд бэх */
  dry: number;
};

const SCRIPTS: Script[] = [
  {
    value: "biir",
    label: "Бийр",
    hint: "Ташуу иштэй бийр: зузаан нимгэний хэлбэлзэлтэй, бэх нь цаасанд бага зэрэг шингэнэ.",
    nib: 0.085,
    bleed: 0.5,
    dry: 0,
  },
  {
    value: "huurai",
    label: "Хуурай бийр",
    hint: "Бэх нь дуусах дөхсөн бийр: татлага дундуураа сэвсийж, ул мөр үлдээнэ.",
    nib: 0.065,
    bleed: 0,
    dry: 0.42,
  },
  {
    value: "hevlemel",
    label: "Хэвлэмэл",
    hint: "Номын хэвлэлийн жигд татлага: хамгийн тод, уншихад хялбар.",
    nib: 0,
    bleed: 0,
    dry: 0,
  },
];

/** Зургийн бодит хэмжээ. Дэлгэц дээр багасгаж харуулна. */
const WIDTH = 1200;
const HEIGHT = 1600;

/**
 * Давтагдах «санамсаргүй» — цаасан ширхэгт зориулав. `Math.random` ашиглавал
 * зурах бүрд ширхэг нь өөрчлөгдөж, хэрэглэгч тохиргоо сольход цаас нь
 * анивчих болно.
 */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

export default function NameCalligraphy({
  initialName = "",
  initialScript = "",
  phone,
  facebook,
}: {
  /** `/ner?ner=...`-аас ирнэ — хуваалцсан холбоосыг нээхэд нэр бэлэн байна */
  initialName?: string;
  /** `/ner?hev=huurai` — бичлэгийн хэвийг ч хамт хуваалцана */
  initialScript?: string;
  phone: string;
  facebook: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);

  const [name, setName] = useState(initialName);
  /** Гараар засварласан монгол бичиг. `null` бол автомат хөрвүүлэлт хүчинтэй. */
  const [override, setOverride] = useState<string | null>(null);
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [script, setScript] = useState(
    SCRIPTS.find((option) => option.value === initialScript) ?? SCRIPTS[0]
  );
  const [withSeal, setWithSeal] = useState(true);
  const [withFrame, setWithFrame] = useState(true);
  const [fontReady, setFontReady] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Их тайлбар толиос татсан язгуурууд.
   *
   * Багцад суусан `STEMS` нь 234 язгууртай — түгээмэл нэрийг барих ч
   * «саран», «ууган», «билгүүн» мэт үг тэнд байхгүй. Тэдгээр нь толийн
   * 52 мянган үгэнд бий. 88 нэр дээр хэмжихэд `STEMS` дангаараа 77, толь
   * нэмэхэд 87 нэр бүрэн задарсан.
   */
  const [toli, setToli] = useState<NameToli>({});
  /** Аль хэдийн асуусан хэсгүүд — олдоогүй нь ч «асуусан» гэж тооцогдоно. */
  const asked = useRef<Set<string>>(new Set());

  useEffect(() => {
    const missing = nameLookups(name).filter(
      (part) => !asked.current.has(part),
    );
    if (missing.length === 0) return;

    // Хэрэглэгч бичиж байх зуур товчлол бүрт хүсэлт явуулах нь хэрэггүй
    // чимээ — бичиж дуустал нь хүлээнэ.
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      for (const part of missing) asked.current.add(part);

      try {
        const response = await fetch("/api/toli", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ words: missing }),
          signal: controller.signal,
        });
        if (!response.ok) return;

        const { found, variants } = (await response.json()) as {
          found?: Record<string, string>;
          variants?: Record<string, string[]>;
        };
        if (found && Object.keys(found).length > 0) {
          // ⚠ `found` биш, БҮХ хувилбарыг дамжуулна. Омоним үгэнд («даваа» нь
          // ᠳᠠᠪᠠᠭ᠎ᠠ ба ᠳᠠᠸᠠ) аль нь НЭРИЙН утга болохыг `STEMS` шийддэг —
          // тэр шийдвэрийг гаргах өгөгдөл `variants` дотор л байна.
          const next: NameToli = {};
          for (const [cyrillic, mongol] of Object.entries(found)) {
            next[cyrillic] = variants?.[cyrillic] ?? [mongol];
          }
          setToli((previous) => ({ ...previous, ...next }));
        }
      } catch {
        // Сүлжээ тасарсан ч `STEMS` дангаараа ажиллана. Чимээгүй бууна.
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [name]);

  const auto = useMemo(() => convertName(name, toli), [name, toli]);

  const words = useMemo(() => {
    if (override === null) return auto.words;
    return override.trim().split(/\s+/).filter(Boolean);
  }, [auto.words, override]);

  const scriptText = words.join(" ");

  /* --- Фонт ------------------------------------------------------------- */

  // Canvas нь CSS-ийн фонтыг өөрөө хүлээдэггүй: ачаалагдаагүй байхад зурвал
  // системийн ямар нэг фонтоор буулгаад өнгөрнө. Тиймээс нэрийг нь уншиж
  // аваад ачаалж дуустал нь хүлээнэ.
  const fontFamily = useMemo(() => {
    if (!fontReady || !probeRef.current) return "";
    return getComputedStyle(probeRef.current).fontFamily;
  }, [fontReady]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const probe = probeRef.current;
      if (!probe) return;

      const family = getComputedStyle(probe).fontFamily;

      try {
        await document.fonts.load(`96px ${family}`, "ᠮᠣᠩᠭᠣᠯ");
        await document.fonts.ready;
      } catch {
        // Фонт ачаалагдаагүй ч зурна — уншигдахгүй байснаас алдаа заасан нь дээр
      }

      if (!cancelled) setFontReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* --- Зурах ------------------------------------------------------------ */

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 1. Дэвсгэр
    ctx.fillStyle = material.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. Цаасан ширхэг
    const random = seeded(20260820);
    ctx.fillStyle = material.grain;
    for (let i = 0; i < 2600; i += 1) {
      const x = random() * WIDTH;
      const y = random() * HEIGHT;
      ctx.fillRect(x, y, 1.6, 1.6);
    }

    // 3. Хүрээ — гадна зузаан, дотор нимгэн
    if (withFrame) {
      ctx.strokeStyle = material.frame;
      ctx.lineWidth = 3;
      ctx.strokeRect(54, 54, WIDTH - 108, HEIGHT - 108);
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.strokeRect(72, 72, WIDTH - 144, HEIGHT - 144);
      ctx.globalAlpha = 1;
    }

    // 4. Бичээс
    if (words.length > 0 && fontFamily) {
      const padding = withFrame ? 190 : 150;
      const available = HEIGHT - padding * 2;

      // Хамгийн урт үг босоо талдаа багтах ёстой тул түүгээр хэмжээг тааруулна.
      const probeSize = 200;
      ctx.font = `${probeSize}px ${fontFamily}`;
      const longest = Math.max(
        ...words.map((word) => ctx.measureText(word).width)
      );
      // Хоёр хязгаар: багана өндөрт багтах ба бүх багана өргөнд багтах.
      const widthLimit = ((WIDTH - padding * 2) / words.length) * 0.8;
      const fontSize = Math.min(
        340,
        widthLimit,
        Math.floor((available / longest) * probeSize)
      );

      // Босоо бичигт багана зүүнээс баруун тийш дараалдаг тул эхний үг зүүн
      // талд. Багана бүр дээд ирмэгээсээ эхэлнэ — бичээч цаасныхаа дээрээс
      // доош бичдэг болохоос үгээ голлуулдаггүй. Хамгийн урт багана голдоо
      // таарахаар бүх баганын эхлэлийг тавина.
      const longestLength = (longest / probeSize) * fontSize;
      const topY = (HEIGHT - longestLength) / 2;

      const step = fontSize * 1.25;
      const startX = WIDTH / 2 - ((words.length - 1) * step) / 2;

      /*
        Бичээсийг тусдаа давхарга дээр зурна. Хуурай бийрийн ул мөрийг
        `destination-out`-оор идэж гаргадаг тул шууд үндсэн зотон дээр зурвал
        цаас, хүрээ хоёрыг ч цоолох байлаа.
      */
      const layer = document.createElement("canvas");
      layer.width = WIDTH;
      layer.height = HEIGHT;
      const lctx = layer.getContext("2d");

      if (lctx) {
        lctx.font = `${fontSize}px ${fontFamily}`;
        lctx.fillStyle = material.ink;
        lctx.strokeStyle = material.ink;
        lctx.lineJoin = "round";
        lctx.lineCap = "round";
        lctx.textBaseline = "middle";
        lctx.textAlign = "left";

        words.forEach((word, index) => {
          lctx.save();
          lctx.translate(startX + index * step, topY);
          // 90° цагийн зүүний дагуу — хэвтээ бичээс босоо багана болно
          lctx.rotate(Math.PI / 2);

          if (script.nib > 0) {
            /*
              Бийрийн үзүүрийн дагуу давхарлана: давхарлах чиглэлд
              перпендикуляр татлага бүдүүн, зэрэгцээ нь нарийн гарна.

              Энд бид эргүүлсэн орон зайд байгаа тул баганын нуруу нь
              нутгийн x тэнхлэгийн дагуу урсана. Тиймээс нутгийн y-ийн дагуу
              (π/2) давхарлавал нуруу зузаарч, шүд, сүүл нь нарийн үлдэнэ —
              монгол уран бичлэгийн үндсэн зарчим яг тийм. Цэвэр тэнхлэгээс
              арай хазайлгасан нь бийрийг гараар ташуу барьсны ул мөр.
            */
            const angle = Math.PI * 0.42;
            const spread = fontSize * script.nib;
            const passes = 18;

            for (let pass = 0; pass < passes; pass += 1) {
              const shift = (pass / (passes - 1) - 0.5) * spread;
              lctx.fillText(
                word,
                Math.cos(angle) * shift,
                Math.sin(angle) * shift
              );
            }
          } else {
            // Хэвлэмэл: татлагыг арай зузаалахаас хэтрэхгүй
            lctx.lineWidth = fontSize * 0.03;
            lctx.fillText(word, 0, 0);
            lctx.strokeText(word, 0, 0);
          }

          lctx.restore();
        });

        // Хуурай бийр: сэвсгэр цэгүүдээр бэхийг сийрэгжүүлнэ
        if (script.dry > 0) {
          const speck = document.createElement("canvas");
          speck.width = 256;
          speck.height = 256;
          const sctx = speck.getContext("2d");

          if (sctx) {
            /*
              Ул мөр нь дугуй цэг биш, татлагын дагуух зураас байх ёстой:
              хуурай бийр цаасан дээгүүр гулсахдаа хялгасныхаа мөрийг
              үлддэг. Багана босоо тул зураасууд ч босоо — өндрөөр нь гурав
              дахин сунгав.
            */
            sctx.fillStyle = "#000";
            for (let i = 0; i < 2600; i += 1) {
              const radius = 0.4 + random() * 1.5;
              sctx.globalAlpha = 0.3 + random() * 0.55;
              sctx.beginPath();
              sctx.ellipse(
                random() * 256,
                random() * 256,
                radius,
                radius * (2.5 + random() * 2.5),
                0,
                0,
                Math.PI * 2
              );
              sctx.fill();
            }

            const pattern = lctx.createPattern(speck, "repeat");
            if (pattern) {
              lctx.globalCompositeOperation = "destination-out";
              lctx.globalAlpha = script.dry;
              lctx.fillStyle = pattern;
              lctx.fillRect(0, 0, WIDTH, HEIGHT);
              lctx.globalAlpha = 1;
              lctx.globalCompositeOperation = "source-over";
            }
          }
        }

        // Бэх цаасанд шингэх нь: доогуур нь бүдэг, зөөлөн хуулбар
        if (script.bleed > 0) {
          ctx.save();
          ctx.globalAlpha = script.bleed * 0.34;
          // `filter` дэмжигдэхгүй хөтөч дээр зүгээр л бүдэг давхарга үлдэнэ
          ctx.filter = `blur(${Math.max(2, fontSize * 0.035)}px)`;
          ctx.drawImage(layer, 0, 0);
          ctx.restore();
        }

        ctx.drawImage(layer, 0, 0);
      }
    }

    // 5. Тамга — бичээсийн доод хэсэгт, уламжлал ёсоор зүүн талд
    if (withSeal) {
      const size = 150;
      ctx.save();
      ctx.translate(132, HEIGHT - 300);
      ctx.scale(size / 96, size / 96);

      // Гадна хар ирмэг, дотор нь өнгөт талбай
      ctx.fillStyle = material.sealInk;
      ctx.fillRect(0, 0, 96, 96);
      ctx.fillStyle = material.sealBg;
      ctx.fillRect(4, 4, 88, 88);

      // Хүрээ ба эргэх хээ
      ctx.strokeStyle = material.sealInk;
      ctx.lineCap = "square";
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, 72, 72);
      ctx.lineWidth = 5;
      ctx.stroke(new Path2D(TAMGA_MAZE));

      ctx.restore();
    }
  }, [fontFamily, material, script, withFrame, withSeal, words]);

  useEffect(() => {
    draw();
  }, [draw]);

  /* --- Үйлдлүүд --------------------------------------------------------- */

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${name.trim() || "uran-bichleg"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(scriptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Зөвшөөрөл өгөөгүй бол чимээгүй өнгөрнө — бичээс нь дэлгэц дээр байгаа
    }
  }

  const sourceNote =
    auto.source === "dictionary"
      ? "Толиос олдсон сонгодог бичлэг."
      : auto.source === "mixed"
        ? "Нэг хэсэг нь толиос, нөгөө нь дуудлагаар буув."
        : "Дуудлагаар буулгав — сонгодог бичлэг нь өөр байж болно.";

  return (
    <div className="grid gap-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-14">
      {/* Фонтын нэрийг уншихад л хэрэгтэй, харагдах шаардлагагүй */}
      <span ref={probeRef} aria-hidden className="mongol absolute opacity-0">
        ᠠ
      </span>

      {/* --- Тохиргоо ------------------------------------------------------ */}
      <div className="space-y-8">
        <div>
          <label htmlFor="ner" className="field-label">
            Нэрээ бичнэ үү
          </label>
          <input
            id="ner"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              // Шинэ нэр орж ирвэл гар засвар хүчингүй болно.
              setOverride(null);
            }}
            placeholder="Батбаяр эсвэл John"
            maxLength={40}
            autoComplete="name"
            className="field"
          />
          <p className="mt-2 text-[0.72rem] leading-6 text-brand-900/55 dark:text-ivory-100/50">
            Кирилл эсвэл латинаар. <span lang="en">Foreign guests: type your
            name in Latin letters.</span>
          </p>
        </div>

        {words.length > 0 ? (
          <div>
            <label htmlFor="bichig" className="field-label">
              Монгол бичиг — гараар засаж болно
            </label>
            {/*
              Талбар дотор босоо бичиг гаргах боломжгүй — үсгүүд хажуулдан
              хэвтэнэ. Ядаж уншигдахуйц байхын тулд томруулж, монгол бичгийн
              фонтоор өгөв.
            */}
            <input
              id="bichig"
              value={scriptText}
              onChange={(event) => setOverride(event.target.value)}
              lang="mn-Mong"
              className="field text-xl"
              style={{ fontFamily: "var(--font-mongol)" }}
            />
            <p className="mt-2 text-[0.72rem] leading-6 text-brand-900/55 dark:text-ivory-100/50">
              {sourceNote} Эцсийн бичээсийг багш гараар нягтална.
            </p>
          </div>
        ) : null}

        <fieldset>
          <legend className="field-label">Материал</legend>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {MATERIALS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMaterial(option)}
                aria-pressed={material.value === option.value}
                className={`border px-2 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.12em] transition duration-300 ${
                  material.value === option.value
                    ? "border-gold-500 text-gold-700 dark:text-gold-300"
                    : "hairline text-brand-900/60 hover:border-gold-500/50 dark:text-ivory-100/55"
                }`}
              >
                <span
                  aria-hidden
                  className="mx-auto mb-2 block h-6 w-6 border"
                  style={{
                    backgroundColor: option.bg,
                    borderColor: option.frame,
                  }}
                />
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="field-label">Бичлэгийн хэв</legend>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {SCRIPTS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setScript(option)}
                aria-pressed={script.value === option.value}
                className={`border px-2 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] transition duration-300 ${
                  script.value === option.value
                    ? "border-gold-500 text-gold-700 dark:text-gold-300"
                    : "hairline text-brand-900/60 hover:border-gold-500/50 dark:text-ivory-100/55"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[0.72rem] leading-6 text-brand-900/55 dark:text-ivory-100/50">
            {script.hint}
          </p>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="field-label">Чимэглэл</legend>
          {[
            { label: "Алтан хүрээ", value: withFrame, set: setWithFrame },
            { label: "Улаан тамга", value: withSeal, set: setWithSeal },
          ].map((toggle) => (
            <label
              key={toggle.label}
              className="flex cursor-pointer items-center gap-3 text-[0.85rem] text-brand-900/75 dark:text-ivory-100/70"
            >
              <input
                type="checkbox"
                checked={toggle.value}
                onChange={(event) => toggle.set(event.target.checked)}
                className="h-4 w-4 accent-[color:var(--color-gold-600)]"
              />
              {toggle.label}
            </label>
          ))}
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={download}
            disabled={words.length === 0}
            className="btn-solid"
          >
            Зураг татах
          </button>
          <button
            type="button"
            onClick={copyScript}
            disabled={words.length === 0}
            className="btn-quiet"
          >
            {copied ? "Хуулагдлаа ✓" : "Бичээс хуулах"}
          </button>
        </div>
      </div>

      {/* --- Урьдчилсан харагдац ------------------------------------------- */}
      <div>
        <div className="surface p-4 sm:p-6">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            role="img"
            aria-label={
              words.length > 0
                ? `${name} нэрийг монгол бичгээр бичсэн загвар`
                : "Нэр оруулахад загвар энд гарна"
            }
            className="mx-auto block h-auto w-full max-w-md shadow-card"
          />

          {words.length === 0 ? (
            <p className="mt-5 text-center text-[0.8rem] uppercase tracking-[0.18em] text-brand-900/45 dark:text-ivory-100/40">
              Зүүн талд нэрээ бичихэд загвар шууд гарна
            </p>
          ) : null}
        </div>

        {/* Загвараа авсан хүн дараагийн алхмаа мэдэж байх ёстой */}
        <div className="hairline mt-6 border p-6">
          <h2 className="font-serif text-lg text-brand-950 dark:text-ivory-50">
            Бүтээл болгож захиалах уу?
          </h2>
          <p className="mt-3 text-[0.86rem] leading-7 text-brand-900/70 dark:text-ivory-100/64">
            Татсан зургаа бидэн рүү илгээгээрэй. Багш бичлэгийг нягталж,
            гараар бийрдэн, хүссэн хэмжээ, хүрээтэй нь гүйцэтгэнэ.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {phone ? (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn-gold">
                {phone}
              </a>
            ) : null}
            {facebook ? (
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-quiet"
              >
                Facebook-ээр илгээх
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
