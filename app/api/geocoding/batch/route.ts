import { NextRequest, NextResponse } from "next/server"

import { BatchGeocodingService } from "@/lib/services/batch-geocoding"

export async function GET(request: NextRequest) {
  try {
    const batchService = new BatchGeocodingService()
    const stats = await batchService.getGeocodingStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error getting geocoding stats:", error)
    return NextResponse.json(
      {
        error: "Failed to get geocoding statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { batchSize = 10, delayBetweenBatches = 1000 } = body

    const batchService = new BatchGeocodingService()
    const result = await batchService.batchGeocodeAllProperties(
      batchSize,
      delayBetweenBatches
    )

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Error in batch geocoding:", error)
    return NextResponse.json(
      {
        error: "Failed to perform batch geocoding",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
