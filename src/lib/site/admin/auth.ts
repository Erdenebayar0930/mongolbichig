import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

/**
 * Админы нэвтрэлт — нэг нууц үг, гарын үсэгтэй cookie.
 *
 * Хэрэглэгчийн бүртгэл байхгүй (сайтыг нэг хүн удирддаг) тул хэрэглэгчийн
 * хүснэгт, нууц үгийн хэш зэрэг нь илүү. Гэхдээ cookie-г HMAC-аар гарын
 * үсэглэсэн — эс бөгөөс хэн ч `admin=1` гэж бичээд орчихно.
 */

const COOKIE = "ub_admin";
/** 7 хоног — үүнээс урт байвал хулгайлагдсан cookie-ний хугацаа хэтэрхий урт */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} тохируулаагүй байна. website/.env.local файлдаа нэмнэ үү.`
    );
  }

  return value;
}

function sign(payload: string) {
  return createHmac("sha256", requireEnv("ADMIN_SESSION_SECRET"))
    .update(payload)
    .digest("base64url");
}

/** Урт нь зөрсөн ч алдаа шидэхгүйгээр `false` буцаана */
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Нууц үг зөв эсэх — хугацааны сувгаар таамаглахаас сэргийлж тогтмол хугацаанд */
export function checkPassword(password: string) {
  return safeEqual(password, requireEnv("ADMIN_PASSWORD"));
}

export async function startSession() {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

/** Нэвтэрсэн эсэх. Хугацаа дууссан эсвэл гарын үсэг зөрвөл `false`. */
export async function isAdmin() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;

  if (!raw) return false;

  const separator = raw.lastIndexOf(".");
  if (separator < 1) return false;

  const payload = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);

  try {
    if (!safeEqual(signature, sign(payload))) return false;
  } catch (error) {
    // ADMIN_SESSION_SECRET тохируулаагүй — нэвтрээгүйтэй адил үзнэ
    console.error("[admin] session:", (error as Error).message);
    return false;
  }

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/**
 * Бичилт хийдэг Server Action бүрийн эхний мөр. Server Action нь UI-аас
 * үл хамааран шууд POST-оор дуудагдаж болдог тул layout дахь шалгалт
 * хангалтгүй.
 */
export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Энэ үйлдэлд админаар нэвтэрсэн байх шаардлагатай.");
  }
}
