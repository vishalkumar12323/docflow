'use client'

import { useEffect, useState } from 'react'
import { OrgRole } from '@prisma/client'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: OrgRole[]
  orgId: string
  fallback?: React.ReactNode
  loading?: React.ReactNode
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  orgId, 
  fallback,
  loading 
}: RoleGuardProps) {
  const [userRole, setUserRole] = useState<OrgRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/members/me`)
        
        if (!response.ok) {
          throw new Error('Failed to check permissions')
        }
        
        const data = await response.json()
        setUserRole(data.role)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Permission check failed')
      } finally {
        setIsLoading(false)
      }
    }

    if (orgId) {
      checkPermission()
    }
  }, [orgId])

  if (isLoading) {
    return loading || (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span>Checking permissions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this content.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}