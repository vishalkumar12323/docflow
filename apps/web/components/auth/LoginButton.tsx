'use client'

import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { Button } from "@/components/ui/button"
import { Loader2, LogIn, LogOut } from "lucide-react"

export function LoginButton() {
  const { isAuthenticated, isLoading } = useKindeBrowserClient()

  if (isLoading) {
    return (
      <Button disabled variant="ghost">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (isAuthenticated) {
    return (
      <LogoutLink>
        <Button variant="ghost" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </LogoutLink>
    )
  }

  return (
    <LoginLink>
      <Button>
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    </LoginLink>
  )
}