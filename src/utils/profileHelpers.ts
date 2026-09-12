import type { UpdateProfilePayload, UserProfile } from "@/types/profile";

/** Builds a display name from profile fields. */
export function getUserDisplayName(user?: UserProfile | null): string {
  return user?.name?.trim() || "";
}

/** Builds update payload with only the name field. */
export function buildUpdateProfilePayload(name: string): UpdateProfilePayload {
  return { name: name.trim() };
}
