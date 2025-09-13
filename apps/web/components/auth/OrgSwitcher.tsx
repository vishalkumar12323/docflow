'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter, useSearchParams } from 'next/navigation'

interface Organization {
  id: string
  name: string
  slug: string
  role: string
  plan: string
  logo?: string
}

interface OrgSwitcherProps {
  organizations: Organization[]
  currentOrgId?: string
  onOrgChange?: (orgId: string) => void
}

export function OrgSwitcher({ organizations, currentOrgId, onOrgChange }: OrgSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (currentOrgId && organizations.length > 0) {
      const org = organizations.find(org => org.id === currentOrgId)
      if (org) setSelectedOrg(org)
    } else if (organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0])
    }
  }, [currentOrgId, organizations, selectedOrg])

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org)
    setOpen(false)
    
    if (onOrgChange) {
      onOrgChange(org.id)
    } else {
      // Update URL with selected org
      router.push(`/dashboard?org=${org.id}`)
    }
  }

  if (organizations.length === 0) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          {selectedOrg ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedOrg.logo} />
                <AvatarFallback className="text-xs">
                  {selectedOrg.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedOrg.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {selectedOrg.role}
              </span>
            </div>
          ) : (
            "Select organization..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandEmpty>No organization found.</CommandEmpty>
          <CommandGroup heading="Organizations">
            {organizations.map((org) => (
              <CommandItem
                key={org.id}
                onSelect={() => handleOrgSelect(org)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedOrg?.id === org.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage src={org.logo} />
                  <AvatarFallback className="text-xs">
                    {org.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span>{org.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {org.role} • {org.plan}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                router.push('/dashboard/organizations/new')
                setOpen(false)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}