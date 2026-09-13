export function getDashboardPath(role?: string | null): string | null {
  switch (role?.trim().toLowerCase()) {
    case "superadmin":
      return "/superadmin/dashboard";
    case "employee":
      return "/employee/dashboard";
    case "org_admin":
    case "hr_manager":
      return "/orgnization/dashboard";
    default:
      return null;
  }
}
