import { OrgRole } from "@prisma/client";
import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from "@/lib/constanst/auth";

export function hasPermission(userRole: OrgRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function hasAnyPermission(
  userRole: OrgRole,
  permissions: string[]
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

export function hasAllPermissions(
  userRole: OrgRole,
  permissions: string[]
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

export function canManageMember(
  managerRole: OrgRole,
  targetRole: OrgRole
): boolean {
  // Can't manage users with same or higher role
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

export function canAssignRole(
  assignerRole: OrgRole,
  targetRole: OrgRole
): boolean {
  // Can only assign roles lower than your own
  return ROLE_HIERARCHY[assignerRole] > ROLE_HIERARCHY[targetRole];
}
