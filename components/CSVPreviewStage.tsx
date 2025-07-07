"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Eye } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CSVPreviewTable } from "@/components/CSVPreviewTable"

interface CSVPreviewStageProps {
  file: File
  columnMapping: Record<string, string | null>
  onProcess: () => void
  onBack: () => void
}

const REQUIRED_FIELDS = ["street_address", "full_name"]

// Helper to find duplicate property addresses in preview rows
function getDuplicateRowIndices(
  rows: string[][],
  mapping: Record<string, string | null>,
  csvHeaders: string[]
) {
  const addressIdx = csvHeaders.findIndex(
    (h) => mapping[h] === "street_address"
  )
  const cityIdx = csvHeaders.findIndex((h) => mapping[h] === "city")
  const zipIdx = csvHeaders.findIndex((h) => mapping[h] === "zip_code")
  const seen = new Set<string>()
  const duplicates: number[] = []
  rows.forEach((row, i) => {
    const key = [row[addressIdx], row[cityIdx], row[zipIdx]]
      .join("|")
      .toLowerCase()
    if (seen.has(key)) {
      duplicates.push(i)
    } else {
      seen.add(key)
    }
  })
  return duplicates
}

export function CSVPreviewStage({
  file,
  columnMapping,
  onProcess,
  onBack,
}: CSVPreviewStageProps) {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setIsLoading(true)

        // Read the CSV file
        const text = await file.text()
        const lines = text.split("\n").filter((l) => l.trim())

        if (lines.length === 0) {
          setError("CSV file is empty")
          return
        }

        // Parse headers
        const headers = lines[0].split(",")
        setCsvHeaders(headers)

        // Parse rows (skip header)
        const rows = lines.slice(1).map((line) => line.split(","))
        setCsvRows(rows)
      } catch (err) {
        setError("Failed to read CSV file")
      } finally {
        setIsLoading(false)
      }
    }

    loadPreview()
  }, [file])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Preview Data</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    )
  }

  const duplicateRows = getDuplicateRowIndices(
    csvRows,
    columnMapping,
    csvHeaders
  )
  const hasMissingRequired = csvRows.slice(0, 10).some((row) =>
    csvHeaders.some((h, colIdx) => {
      const dbField = columnMapping[h]
      return (
        dbField &&
        REQUIRED_FIELDS.includes(dbField) &&
        (!row[colIdx] || row[colIdx].trim() === "")
      )
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Eye className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Preview Mapped Data</h2>
      </div>

      {/* File Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>File:</strong> {file.name} ({(file.size / 1024).toFixed(1)}{" "}
          KB)
        </p>
        <p className="text-sm text-blue-700">
          <strong>Total rows:</strong> {csvRows.length}
        </p>
        <p className="text-sm text-blue-700">
          <strong>Preview showing:</strong> First 10 rows
        </p>
      </div>

      {/* Conflict Detection */}
      {(duplicateRows.length > 0 || hasMissingRequired) && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">
          {duplicateRows.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              {duplicateRows.length} duplicate property rows detected
              (highlighted in red).
            </div>
          )}
          {hasMissingRequired && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Some required fields are missing (highlighted in orange).
            </div>
          )}
        </div>
      )}

      {/* Preview Table */}
      {csvRows.length > 0 && (
        <div>
          <CSVPreviewTable
            csvRows={csvRows}
            mapping={columnMapping}
            csvHeaders={csvHeaders}
            maxRows={10}
            conflictRows={duplicateRows}
            requiredFields={REQUIRED_FIELDS}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">
          Back to Mapping
        </Button>
        <Button onClick={onProcess} size="lg">
          Process Data
        </Button>
      </div>
    </div>
  )
}
