"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from 'next-auth/react'
import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { UserNav } from "@/components/user-nav"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const router = useRouter()

  const handleSignOut = () => {
    router.push('/auth/signout')
  }

  return (
    <div className="flex w-full justify-between items-center">
      <div className="flex gap-6 md:gap-10">
        <Link href="/properties" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          
          <span className="inline-block font-bold">{siteConfig.name}</span>
        </Link>
        {items?.length ? (
          <nav className="flex gap-6">
            {items?.map(
              (item, index) =>
                item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center text-sm font-medium text-muted-foreground",
                      item.disabled && "cursor-not-allowed opacity-80"
                    )}
                  >
                    {item.title}
                  </Link>
                )
            )}
          </nav>
        ) : null}
      </div>

      {/* Add user profile and theme toggle to the right side */}
      <div className="flex items-center space-x-4">
        {session && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        )}
        {/* <ThemeToggle /> */}
        
        {isLoading ? (
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse dark:bg-gray-700"></div>
        ) : (
          <UserNav />
        )}
      </div>
    </div>
  )
}