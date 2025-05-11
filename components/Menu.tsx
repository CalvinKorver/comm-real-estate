"use client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Menu() {
  const pathname = usePathname()
  // Hide on /workouts root page
  if (pathname === "/workouts") return null

  return (
    <div className="absolute top-4 left-4 z-20 p-4">
      <Link href="/workouts" className="inline-flex items-center text-zinc-300 hover:text-white transition-colors">
        <ArrowLeft className="w-6 h-6 mr-1" />
        <span className="text-base font-medium">Back</span>
      </Link>
    </div>
  )
} 