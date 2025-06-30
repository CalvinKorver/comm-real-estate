"use client"

import { cn } from "@/lib/shared/utils"
import { fontSans } from "@/lib/shared/fonts"
import { SearchHeader } from "@/components/search-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ProtectedRoute } from "@/components/protected-route"
import { SearchProvider } from "@/contexts/SearchContext"

interface PropertiesLayoutProps {
  children: React.ReactNode
}

export default function PropertiesLayout({ children }: PropertiesLayoutProps) {
  return (
    <ProtectedRoute>
      <SearchProvider>
        <div className="relative flex min-h-screen flex-col">
          <SearchHeader />
          <main className="flex-1">{children}</main>
          <TailwindIndicator />
        </div>
      </SearchProvider>
    </ProtectedRoute>
  )
} 