/**
 * Returns the uppercase first letter of a display name.
 * Example: "Zain Ul Abidin" → "Z"
 */
export function getNameInitial(name?: string | null): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}
