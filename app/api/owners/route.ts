import { NextResponse } from "next/server"

import { OwnerService } from "@/lib/services/owner-service"

// GET /api/owners - Get all owners
export async function GET(request: Request) {
  try {
    console.log("API: Fetching owners from database")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    if (id) {
      // Get single owner
      try {
        const owner = await OwnerService.getOwnerById(id)
        return NextResponse.json(owner)
      } catch (error) {
        if (error instanceof Error && error.message === "Owner not found") {
          return NextResponse.json(
            { error: "Owner not found" },
            { status: 404 }
          )
        }
        throw error
      }
    }

    // Get owners with pagination and search
    const result = await OwnerService.getOwners({
      page,
      limit,
      search,
    })

    console.log(
      `API: Fetched ${result.owners.length} owners (page ${result.pagination.currentPage}/${result.pagination.totalPages})`
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("API: Error fetching owners:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch owners",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// POST /api/owners - Create a new owner
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const owner = await OwnerService.createOwner(body)
    return NextResponse.json(owner, { status: 201 })
  } catch (error) {
    console.error("API: Error creating owner:", error)

    // Handle validation errors
    if (
      error instanceof Error &&
      error.message === "First name and last name are required"
    ) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create owner",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
