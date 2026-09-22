# Бид туслая

Чуулганы санхүү, эд хөрөнгө, үйлчлэлийн удирдлагын систем — **Next.js 16**,
**React 19**, **TypeScript**, **Tailwind CSS v4** дээр бүтээгдсэн PWA.

## Overview

This project is a full-stack admin platform built on:

* Next.js 16.x (App Router, API routes)
* React 19
* TypeScript
* Tailwind CSS v4
* MySQL via Drizzle ORM
* Firebase Authentication + Firebase Admin SDK (FCM push)

## Installation

### Prerequisites

This project is configured as a full-stack admin platform using:

- Next.js 16 for the web app and API routes
- MySQL via Drizzle ORM for persistent user and transaction data
- Firebase Authentication for browser login
- Firebase Admin SDK for secure server-side token verification and push notifications

Node.js 18.x or later is required (Node.js 20.x or later recommended).

### Cloning the Repository

```bash
git clone https://github.com/Erdenebayar0930/bid_tuslay.git
```

> Windows Users: place the repository near the root of your drive if you face issues while cloning.

### Environment setup

1. Copy [.env.example](.env.example) to .env.local and fill in the values.
2. Create a MySQL database and set DATABASE_URL.
3. Install dependencies:

   ```bash
   npm install
   ```

   > Use `--legacy-peer-deps` flag if you face peer-dependency error during installation.

4. Run the database migration/schema push:

   ```bash
   npm run db:push
   ```

5. Verify the connection is configured correctly:

   ```bash
   npm run db:check
   ```

   This asserts the invariants the app depends on — UTC session timezone,
   `DECIMAL` returned as strings, `utf8mb4` charset, JSON round-trip, and that
   every table in the schema exists. It exits non-zero on failure, so it can be
   dropped into a deploy script.

6. Start the development server:

   ```bash
   npm run dev
   ```

### Architecture overview

- Client auth flows through Firebase Authentication.
- Server API routes validate Firebase ID tokens and read/write MySQL data.
- Admin actions can send FCM notifications through the /api/notifications/send route.
- User profiles, roles, statuses, and FCM tokens are stored in MySQL.

## Хоёр гадаргуу, нэг апп

Энэ репо **хоёр бүтээгдэхүүнийг нэг Next.js апп**-аар үйлчилдэг. Тэдгээр нь
route group-аар тусгаарлагдсан бөгөөд тус бүр **өөрийн root layout, өөрийн
CSS, өөрийн схем, өөрийн нэвтрэлттэй**.

| | Уран бичлэг | Бид туслая |
| --- | --- | --- |
| Бүлэг | `src/app/(site)/` | `src/app/(udirdlaga)/` |
| URL | `/`, `/surgalt`, `/delguur`, `/medee`, `/toli`, `/ner`, `/horvuulegch`, `/haih`, `/sags`, `/tuhai`, `/zahialga`, `/admin/*` | `/udirdlaga`, `/inventory`, `/users`, `/reports`, `/documents`, `/backup`, `/ai-analysis`, `/settings`, `/profile`, `/notifications`, `/login`, `/ui/*` |
| Өгөгдлийн сан | **MySQL** — `DATABASE_URL` (`site_*` хүснэгтүүд) | **MySQL** — `DATABASE_URL` |
| Схем | `src/lib/site/db/schema.ts` (`site_*`) | `src/lib/db/schema.ts` |
| Drizzle | `drizzle.site.config.ts` (`tablesFilter: ["site_*"]`) | `drizzle.config.ts` (`tablesFilter: ["!site_*"]`) |
| Нэвтрэлт | Нэг нууц үг + HMAC cookie | Firebase Auth + үүрэг |
| Код | `src/lib/site/`, `src/components/site/` | `src/lib/`, `src/components/`, `src/layout/` |

**Нэг сан, хоёр схем.** Сайт нь анх Postgres дээр бичигдсэн боловч
Hostinger-ийн shared hosting дээр Postgres байхгүй тул MySQL руу хөрвүүлэгдсэн.
Хүснэгтүүд нь `site_` угтвартай учир дашбоардынхтой зэрэгцэн сууж, холболтын
pool-ыг хуваалцана — shared hosting дээр холболт хомс тул энэ нь чухал.

Хоёр бүтээгдэхүүн нэг ч хүснэгт хуваалцдаггүй хэвээр; тусгаарлалтыг
`tablesFilter` барина. Сайтыг өөр сан руу салгах бол `SITE_DATABASE_URL`
хувьсагчийг өгөхөд л хангалттай — код нь түүнийг байвал дагана.

MySQL рүү хөрвүүлэхэд `distinct on` → `group by` + `min()`, `ilike` → `like`
(utf8mb4 collation нь регистр мэдрэхгүй), `::int` → `cast(… as signed)`,
`returning` → id-г апп талаас урьдчилж үүсгэх, `nulls last` → `is null` эрэмбэ
болж хувирсан. Дэлгэрэнгүйг [schema.ts](src/lib/site/db/schema.ts)-ийн толгойгоос.

**Хоёр root layout.** `src/app/layout.tsx` БАЙХГҮЙ — Next нь бүлэг тус бүрийн
`layout.tsx`-ыг root layout болгож үзнэ ([баримт](https://nextjs.org/docs/app/api-reference/file-conventions/layout)).
Тиймээс `<html>`, `<body>` тэмдэг хоёуланд нь бий. Хоёр гадаргуу хооронд
шилжихэд **бүтэн хуудас ачаална** — өөр өнгө, өөр фонт, өөр хэрэглэгчтэй тул
энэ нь зөв зан үйл.

⚠ `src/app/(site)/globals.css` ба `src/app/(udirdlaga)/globals.css` хоёрыг
**нэгтгэж болохгүй**. Удирдлагынх нь `@theme` дотор `--font-*: initial`,
`--breakpoint-*: initial` гэж Tailwind-ийн үндсэн утгыг УСТГАДАГ бөгөөд тэр нь
сайтын хэвд халдана. Бүлэг тус бүр өөрийнхөө CSS-ийг импортолж, тусдаа багц
болж гардаг.

## Deployment

Байршуулалтын одоогийн бодит тохиргоо болон скриптүүдийг
[deploy/README.md](deploy/README.md)-аас үзнэ үү.

## License

Released under the MIT License. The dashboard UI is based on the
[TailAdmin](https://tailadmin.com) Next.js template (MIT) — see [LICENSE](LICENSE).
