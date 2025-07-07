"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Upload } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface CSVUploadStageProps {
  onFileSelected: (file: File) => void
}

const MAX_ROWS = 100

export function CSVUploadStage({ onFileSelected }: CSVUploadStageProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const router = useRouter()

  const validateCSVRowCount = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n").filter((line) => line.trim() !== "")
          // Subtract 1 for header row
          const dataRows = Math.max(0, lines.length - 1)
          resolve(dataRows)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setIsValidating(true)

      try {
        // Validate file type
        if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
          setError("Please select a CSV file")
          setIsValidating(false)
          return
        }

        // Validate file size (limit to 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (selectedFile.size > maxSize) {
          setError("File size must be less than 10MB")
          setIsValidating(false)
          return
        }

        // Validate row count
        const rowCount = await validateCSVRowCount(selectedFile)
        if (rowCount > MAX_ROWS) {
          toast.error(
            `CSV file has ${rowCount} rows, but the maximum allowed is ${MAX_ROWS}. Please reduce the number of rows and try again.`
          )
          setError(
            `File has ${rowCount} rows, but maximum allowed is ${MAX_ROWS}`
          )
          setIsValidating(false)
          // Redirect back to the starting page after a short delay
          setTimeout(() => {
            router.push("/csv-upload")
          }, 2000)
          return
        }

        setIsValidating(false)
      } catch (error) {
        setError("Failed to validate file. Please try again.")
        setIsValidating(false)
      }
    }
  }

  const handleContinue = () => {
    if (file && !error) {
      onFileSelected(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Upload CSV File</h2>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">Choose a CSV file to upload</p>
          <p className="text-sm text-muted-foreground">
            Supported format: CSV files up to 10MB with maximum {MAX_ROWS} data
            rows
          </p>
        </div>

        <div className="mt-6">
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
      </div>

      {/* File Info */}
      {file && !error && !isValidating && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">{file.name}</p>
              <p className="text-sm text-green-700">
                Size: {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isValidating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-blue-800">Validating file...</p>
              <p className="text-sm text-blue-700">
                Checking row count and file format
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!file || !!error || isValidating}
          size="lg"
        >
          Continue to Column Mapping
        </Button>
      </div>
    </div>
  )
}
