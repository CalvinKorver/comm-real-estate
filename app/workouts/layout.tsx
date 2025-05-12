"use client"

import { cn } from "@/lib/utils"
import { fontSans } from "@/lib/fonts"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"

interface WorkoutLayoutProps {
  children: React.ReactNode
}

export default function WorkoutLayout({ children }: WorkoutLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Include the SiteHeader at the top of every workout page */}
      <SiteHeader />
      
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-8">{children}</main>
      
      <TailwindIndicator />
    </div>
  )
}