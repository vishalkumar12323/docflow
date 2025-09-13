'use client'

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs"
import { Settings, User, LogOut, Building } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserProfile() {
  const { user, isAuthenticated } = useKindeBrowserClient()
  const router = useRouter()

  if (!isAuthenticated || !user) {
    return null
  }

  const initials = user.given_name && user.family_name 
    ? `${user.given_name[0]}${user.family_name[0]}`
    : user.email?.[0]?.toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.picture || undefined} alt={user.email || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.given_name} {user.family_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/organizations')}>
          <Building className="mr-2 h-4 w-4" />
          <span>Organizations</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutLink>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}