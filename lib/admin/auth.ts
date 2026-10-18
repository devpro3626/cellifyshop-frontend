import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * Minimal password session for the admin portal (version 1).
 *
 * Set ADMIN_PASSWORD (and optionally ADMIN_SECRET) in `.env.local`. The
 * session is an expiry timestamp signed with HMAC-SHA256 in an httpOnly
 * cookie. In development only, a default password is used when none is set.
 */

const COOKIE = "cellify_admin";
const SESSION_DAYS = 7;
const DEV_PASSWORD = "cellify-admin";

const isDev = process.env.NODE_ENV === "development";

export function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || (isDev ? DEV_PASSWORD : null);
}

/** Shown on the login screen during development so the portal is usable out of the box. */
export function devPasswordHint(): string | null {
  return isDev && !process.env.ADMIN_PASSWORD ? DEV_PASSWORD : null;
}

function secret() {
  return process.env.ADMIN_SECRET || adminPassword() || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function checkPassword(input: string) {
  const expected = adminPassword();
  return Boolean(expected) && safeEqual(sign(input), sign(expected!));
}

export async function createSession() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const store = await cookies();
  store.set(COOKIE, `${expires}.${sign(String(expires))}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: !isDev,
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthenticated() {
  // Session checks compare against the clock, so they must run per request.
  await connection();
  if (!adminPassword()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}
