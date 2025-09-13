'use client'

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { Loader2 } from "lucide-react"
import { redirect } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useKindeBrowserClient()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/api/auth/login")
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}