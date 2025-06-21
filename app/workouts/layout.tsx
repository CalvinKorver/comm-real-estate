"use client"

import { cn } from "@/lib/shared/utils"
import { fontSans } from "@/lib/shared/fonts"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ProtectedRoute } from "@/components/protected-route"

interface WorkoutLayoutProps {
  children: React.ReactNode
}

export default function WorkoutLayout({ children }: WorkoutLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen flex-col">
        {/* Include the SiteHeader at the top of every workout page */}
        <SiteHeader />
        
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-8">{children}</main>
        
        <TailwindIndicator />
      </div>
    </ProtectedRoute>
  )
}