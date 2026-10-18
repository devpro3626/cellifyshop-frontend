import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { authApi } from "@/lib/api/catalog.api";
import { ADMIN_TOKEN_COOKIE } from "@/lib/api/client";

/**
 * Admin session for the portal. The password is checked by the API
 * (ADMIN_PASSWORD in cellify-backend/.env); the token it returns is kept in an
 * httpOnly cookie and attached to admin requests by the adminApi interceptor.
 */

export async function signIn(password: string) {
  const { token, expiresAt } = await authApi.login(password);
  (await cookies()).set(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function signOut() {
  (await cookies()).delete(ADMIN_TOKEN_COOKIE);
}

/** True when the stored token is still accepted by the API. */
export async function isAuthenticated() {
  await connection();
  if (!(await cookies()).has(ADMIN_TOKEN_COOKIE)) return false;
  try {
    await authApi.me();
    return true;
  } catch {
    return false;
  }
}
