"use client"

import { AlertCircle, CheckCircle, Info } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UploadResult {
  success: boolean
  message: string
  summary: {
    processedRows: number
    errors: number
    createdOwners: number
    createdProperties: number
    createdContacts: number
    duplicates: number
    mergedOwners: number
    mergedProperties: number
    reconciliationSummary: {
      propertiesCreated: number
      propertiesMerged: number
      ownersCreated: number
      ownersMerged: number
    } | null
  }
  errors: Array<{
    row: number
    address: string
    errors: string[]
  }>
  duplicates: Array<{
    row: number
    address: string
    message: string
  }>
}

interface CSVProcessResultsProps {
  result: UploadResult
  onBack: () => void
}

export function CSVProcessResults({ result, onBack }: CSVProcessResultsProps) {
  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="flex items-center gap-3">
        <CheckCircle className="h-8 w-8 text-green-600" />
        <div>
          <h2 className="text-2xl font-bold text-green-800">
            CSV processed successfully
          </h2>
          <p className="text-muted-foreground">{result.message}</p>
        </div>
      </div>

      {/* Main Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Processing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {result.summary.processedRows}
              </div>
              <div className="text-sm text-blue-700">Processed Rows</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {result.summary.errors}
              </div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {result.summary.duplicates}
              </div>
              <div className="text-sm text-yellow-700">Duplicates</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {result.summary.createdContacts}
              </div>
              <div className="text-sm text-green-700">Contacts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Created vs Merged */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Created</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Owners Created:</span>
              <span className="font-semibold">
                {result.summary.createdOwners}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Properties Created:</span>
              <span className="font-semibold">
                {result.summary.createdProperties}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Merged</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Owners Merged:</span>
              <span className="font-semibold">
                {result.summary.mergedOwners || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Properties Merged:</span>
              <span className="font-semibold">
                {result.summary.mergedProperties || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Summary */}
      {result.summary.reconciliationSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {result.summary.reconciliationSummary.propertiesCreated}
                </div>
                <div className="text-sm text-blue-700">Properties Created</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {result.summary.reconciliationSummary.propertiesMerged}
                </div>
                <div className="text-sm text-purple-700">Properties Merged</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {result.summary.reconciliationSummary.ownersCreated}
                </div>
                <div className="text-sm text-green-700">Owners Created</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {result.summary.reconciliationSummary.ownersMerged}
                </div>
                <div className="text-sm text-orange-700">Owners Merged</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {result.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Validation Errors ({result.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {result.errors.map((error, index) => (
                <div
                  key={index}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="font-medium text-red-800">
                    Row {error.row} ({error.address})
                  </div>
                  <div className="text-sm text-red-700 mt-1">
                    {error.errors.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicates */}
      {result.duplicates && result.duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              Duplicate Addresses ({result.duplicates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {result.duplicates.map((duplicate, index) => (
                <div
                  key={index}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="font-medium text-yellow-800">
                    Row {duplicate.row} ({duplicate.address})
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">
                    {duplicate.message}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-center pt-6">
        <Button onClick={onBack} variant="outline" size="lg">
          Upload Another File
        </Button>
      </div>
    </div>
  )
}
