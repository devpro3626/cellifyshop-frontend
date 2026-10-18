import "server-only";
import http from "node:http";
import https from "node:https";
import axios, { type AxiosError, type AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { ApiError, type ApiErrorBody } from "./errors";

/**
 * HTTP clients for the CellifyShop API (cellify-backend).
 *
 * All calls run on the server (Server Components and Server Actions), so the
 * API address and the admin token never reach the browser.
 *
 * Interceptors:
 *  - response (both clients): turns any failure into a typed `ApiError` with
 *    the backend's message, or a clear message when the API is unreachable.
 *  - request (`adminApi` only): attaches the admin session token stored in an
 *    httpOnly cookie as `Authorization: Bearer <token>`.
 */

export const API_URL = (process.env.API_URL || "http://localhost:4000/api").replace(/\/+$/, "");

/** Cookie holding the admin token issued by POST /auth/login. */
export const ADMIN_TOKEN_COOKIE = "cellify_admin_token";

function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  if (error.response) {
    const body = error.response.data?.error;
    return new ApiError(error.response.status, body?.message ?? `Request failed with status ${error.response.status}.`, body?.details);
  }
  if (error.request) return new ApiError(503, `Can't reach the CellifyShop API at ${API_URL}. Is cellify-backend running?`);
  return new ApiError(500, error.message);
}

/** Reuse connections to the API instead of opening a new one per request. */
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 32 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 32 });

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 20_000,
    httpAgent,
    httpsAgent,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  });
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorBody>) => Promise.reject(toApiError(error)),
  );
  return client;
}

/** Public, unauthenticated reads (storefront). */
export const publicApi = createClient();

/** Authenticated calls from the admin portal. */
export const adminApi = createClient();

adminApi.interceptors.request.use(async (config) => {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
