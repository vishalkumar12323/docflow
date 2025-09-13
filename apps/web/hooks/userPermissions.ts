"use client";
import { useState, useEffect } from "react";
import { OrgRole } from "@prisma/client";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/lib/utils/permissions";

interface UsePermissionProps {
  orgId: string;
  userId?: string;
}

export function userPermissions({ orgId, userId }: UsePermissionProps) {
  const [userRole, setUserRole] = useState<OrgRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!orgId || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/organizations/${orgId}/members/me`);

        if (!response.ok) {
          throw new Error("Failed to fetch user role");
        }

        const data = await response.json();
        setUserRole(data.role);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch permissions"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [orgId, userId]);

  const can = (permission: string): boolean => {
    return userRole ? hasPermission(userRole, permission) : false;
  };

  const canAny = (permissions: string[]): boolean => {
    return userRole ? hasAnyPermission(userRole, permissions) : false;
  };

  const canAll = (permissions: string[]): boolean => {
    return userRole ? hasAllPermissions(userRole, permissions) : false;
  };

  return {
    userRole,
    isLoading,
    error,
    can,
    canAny,
    canAll,
  };
}
