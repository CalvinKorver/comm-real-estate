"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Settings } from "lucide-react"

import {
  extractCSVHeaders,
  suggestColumnMapping,
} from "@/lib/services/csv-upload-processor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ColumnMappingModal } from "@/components/ColumnMappingModal"

interface CSVColumnMappingStageProps {
  file: File
  onMappingComplete: (columnMapping: Record<string, string | null>) => void
  onBack: () => void
}

const DATABASE_FIELDS = [
  // Property fields
  "street_address",
  "city",
  "zip_code",
  "state",
  "parcel_id",
  // Owner fields
  "first_name",
  "last_name",
  "full_name",
  "llc_contact",
  "owner_street_address",
  "owner_city",
  "owner_state",
  "owner_zip_code",
  // Contact fields
  "phone",
  "email",
  "phone_type",
  "contact_priority",
  // Additional property fields (with default values)
  "net_operating_income",
  "price",
  "return_on_investment",
  "number_of_units",
  "square_feet",
]

const REQUIRED_FIELDS = ["street_address", "full_name"]

function hasUnmappedRequiredFields(mapping: Record<string, string | null>) {
  const mappedFields = Object.values(mapping).filter(Boolean)
  return REQUIRED_FIELDS.some((field) => !mappedFields.includes(field))
}

export function CSVColumnMappingStage({
  file,
  onMappingComplete,
  onBack,
}: CSVColumnMappingStageProps) {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<
    Record<string, string | null>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHeaders = async () => {
      try {
        setIsLoading(true)
        const headers = await extractCSVHeaders(file)
        setCsvHeaders(headers)

        // Suggest mapping
        const suggested = suggestColumnMapping(headers, DATABASE_FIELDS)
        setColumnMapping(suggested)
      } catch (err) {
        setError("Failed to read CSV headers")
      } finally {
        setIsLoading(false)
      }
    }

    loadHeaders()
  }, [file])

  const handleContinue = () => {
    onMappingComplete(columnMapping)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Column Mapping</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading CSV headers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Map CSV Columns</h2>
      </div>

      {/* File Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>File:</strong> {file.name} ({(file.size / 1024).toFixed(1)}{" "}
          KB)
        </p>
        <p className="text-sm text-blue-700">
          <strong>Columns found:</strong> {csvHeaders.length}
        </p>
      </div>

      {/* Column Mapping Modal */}
      {csvHeaders.length > 0 && (
        <div>
          <ColumnMappingModal
            csvHeaders={csvHeaders}
            dbFields={DATABASE_FIELDS}
            initialMapping={columnMapping}
            onMappingChange={setColumnMapping}
          />

          {hasUnmappedRequiredFields(columnMapping) && (
            <div className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3 mt-4 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Please map all required fields: {REQUIRED_FIELDS.join(", ")}
            </div>
          )}
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
          Back to Upload
        </Button>
        <Button
          onClick={handleContinue}
          disabled={hasUnmappedRequiredFields(columnMapping)}
          size="lg"
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  )
}
