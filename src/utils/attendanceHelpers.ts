import type { AttendanceDayStatus } from "@/types/attendance";

export function formatAttendanceDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatAttendanceTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatWorkingHours(
  checkIn?: string | null,
  checkOut?: string | null,
): string {
  if (!checkIn || !checkOut) return "—";
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "—";

  const totalMinutes = Math.floor((end - start) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function formatAttendanceStatus(status: AttendanceDayStatus): string {
  return status.replace(/_/g, " ");
}

export function getAttendanceStatusColor(
  status: AttendanceDayStatus,
): string {
  switch (status) {
    case "present":
      return "green";
    case "checked_in":
      return "blue";
    case "on_leave":
      return "purple";
    case "absent":
      return "red";
    case "non_working":
    default:
      return "default";
  }
}

export function toApiDate(value: Date | string): string {
  if (typeof value === "string") return value.slice(0, 10);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameApiDate(value?: string | null, compare = new Date()): boolean {
  if (!value) return false;
  return value.slice(0, 10) === toApiDate(compare);
}
