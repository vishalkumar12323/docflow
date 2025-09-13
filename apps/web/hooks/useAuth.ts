"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
    plan: string;
  }>;
}

export function useAuth() {
  const {
    isAuthenticated,
    isLoading: kindeLoading,
    user,
  } = useKindeBrowserClient();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!kindeLoading) {
      fetchUserData();
    }
  }, [isAuthenticated, kindeLoading]);

  return {
    user: userData,
    isAuthenticated,
    isLoading: kindeLoading || isLoading,
    kindeUser: user,
  };
}
