"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If the status is not loading anymore and there's no session,
    // redirect to the sign-in page
    if (status !== "loading" && !session) {
      console.log("No session detected, redirecting to sign-in")
      router.push("/auth/signin")
    }
  }, [session, status, router])

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Loading...
        </span>
      </div>
    )
  }

  // If there's no session, return null (the useEffect will handle redirection)
  if (!session) {
    return null
  }

  // If there's a session, render the children
  return <>{children}</>
}
