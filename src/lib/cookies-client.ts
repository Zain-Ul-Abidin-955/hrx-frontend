import {
  AUTH_COOKIE_EMAIL,
  AUTH_COOKIE_ROLE,
  AUTH_COOKIE_TOKEN,
} from "@/lib/auth-cookies";

const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function serializeCookie(
  name: string,
  value: string,
  maxAgeSec: number
): string {
  const encoded = encodeURIComponent(value);
  return `${name}=${encoded}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax`;
}

/** Client-only: set a cookie readable by middleware on subsequent navigations. */
export function setClientCookie(
  name: string,
  value: string,
  maxAgeSec: number = DEFAULT_MAX_AGE_SEC
): void {
  if (typeof document === "undefined") return;
  document.cookie = serializeCookie(name, value, maxAgeSec);
}

export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length !== 2) return null;
  const value = parts.pop()?.split(";").shift();
  return value ? decodeURIComponent(value) : null;
}

export function deleteClientCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function setAuthCookies(opts: {
  token: string;
  role: string;
  email?: string;
}): void {
  setClientCookie(AUTH_COOKIE_TOKEN, opts.token);
  setClientCookie(AUTH_COOKIE_ROLE, opts.role);
  if (opts.email) setClientCookie(AUTH_COOKIE_EMAIL, opts.email);
}

export function clearAuthCookies(): void {
  deleteClientCookie(AUTH_COOKIE_TOKEN);
  deleteClientCookie(AUTH_COOKIE_ROLE);
  deleteClientCookie(AUTH_COOKIE_EMAIL);
}

export { AUTH_COOKIE_EMAIL, AUTH_COOKIE_ROLE, AUTH_COOKIE_TOKEN };
