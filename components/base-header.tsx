"use client"

import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { useRouter } from "next/navigation"

export function BaseHeader() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const router = useRouter()

  const handleSignOut = () => {
    router.push('/auth/signout')
  }

  return (
    <header className="bg-background sticky top-0 z-40 w-full">
      <div className="w-full px-4 flex h-18 items-center pt-2">
        {/* Left section - Navigation */}
        <div className="flex gap-6 md:gap-10">
          <a href="/properties" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="inline-block font-bold">{siteConfig.name}</span>
          </a>
          {siteConfig.mainNav?.length ? (
            <nav className="flex gap-6">
              {siteConfig.mainNav?.map(
                (item, index) =>
                  item.href && (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-center text-sm font-medium text-muted-foreground"
                    >
                      {item.title}
                    </a>
                  )
              )}
            </nav>
          ) : null}
        </div>

        {/* Right section - User controls */}
        <div className="flex items-center space-x-4 ml-auto">
          {session && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              <Icons.logout className="h-4 w-4" />
            </Button>
          )}
          <Button 
            className="h-8 w-24 bg-green-600 rounded-full hover:bg-green-700 text-white text-muted-foreground hover:text-foreground"
            variant="ghost"
            size="icon"
            title="upload-csv"
            onClick={() => router.push('/csv-upload')}>
            <span className="text-white">Upload</span>
          </Button>
          
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : (
            <UserNav />
          )}
        </div>
      </div>
    </header>
  )
} 