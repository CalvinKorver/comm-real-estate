"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from 'next-auth/react'
import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'

  return (
    <div className="flex w-full justify-between items-center">
      <div className="flex gap-6 md:gap-10">
        <Link href="/workouts" className="flex items-center space-x-2">
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
        <ThemeToggle />
        
        {isLoading ? (
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse dark:bg-gray-700"></div>
        ) : (
          <UserNav />
        )}
      </div>
    </div>
  )
}