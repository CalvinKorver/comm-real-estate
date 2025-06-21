"use client"

import { cn } from "@/lib/shared/utils"
import { fontSans } from "@/lib/shared/fonts"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ProtectedRoute } from "@/components/protected-route"

interface PropertiesLayoutProps {
  children: React.ReactNode
}

export default function PropertiesLayout({ children }: PropertiesLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <TailwindIndicator />
      </div>
    </ProtectedRoute>
  )
} 