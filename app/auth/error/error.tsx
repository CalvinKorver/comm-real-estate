"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

function getErrorMessage(error: string | null): string {
  switch (error) {
    case "Configuration":
      return "There is a problem with the server configuration."
    case "AccessDenied":
      return "You do not have permission to sign in."
    case "Verification":
      return "The verification token has expired or has already been used."
    case "Default":
    default:
      return "An error occurred during authentication."
  }
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <Icons.logo className="mx-auto h-12 w-12" />

        <h1 className="mt-6 text-3xl font-bold text-foreground">
          Authentication Error
        </h1>

        <div className="mt-4 rounded-md bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <Button
            asChild
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <Link href="/auth/signin">Try signing in again</Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
