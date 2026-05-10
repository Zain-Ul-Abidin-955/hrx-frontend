/** Cookie names shared by client layout and middleware. */
export const AUTH_COOKIE_TOKEN = "authToken";
export const AUTH_COOKIE_ROLE = "userRole";
export const AUTH_COOKIE_EMAIL = "userEmail";

export type AppRoleCookie = "admin" | "superadmin";

export function normalizeRoleCookie(
  raw: string | undefined | null
): AppRoleCookie | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  if (s === "superadmin") return "superadmin";
  if (s === "admin" || s === "organization" || s === "hr") return "admin";
  return null;
}
