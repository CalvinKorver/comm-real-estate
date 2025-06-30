'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseHeader } from '@/components/base-header';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ColumnMappingModal } from '@/components/ColumnMappingModal';
import { extractCSVHeaders, suggestColumnMapping } from '@/lib/services/csv-upload-processor';
import { AlertCircle } from 'lucide-react';
import { CSVPreviewTable } from '@/components/CSVPreviewTable';

interface UploadResult {
  success: boolean;
  message: string;
  summary: {
    processedRows: number;
    errors: number;
    createdOwners: number;
    createdProperties: number;
    createdContacts: number;
    duplicates: number;
    mergedOwners: number;
    mergedProperties: number;
    reconciliationSummary: {
      propertiesCreated: number;
      propertiesMerged: number;
      ownersCreated: number;
      ownersMerged: number;
    } | null;
  };
  errors: Array<{
    row: number;
    address: string;
    errors: string[];
  }>;
  duplicates: Array<{
    row: number;
    address: string;
    message: string;
  }>;
}

const DB_FIELDS = [
  // Property fields
  'street_address', 'city', 'zip_code', 'state', 'parcel_id', 'net_operating_income', 'price', 'return_on_investment', 'number_of_units', 'square_feet',
  // Owner fields
  'firstName', 'lastName', 'fullName', 'llcContact', 'streetAddress', 'ownerCity', 'ownerState', 'ownerZip',
  // Contact fields
  'phone', 'email', 'type', 'priority',
];

const REQUIRED_FIELDS = ['street_address', 'city', 'zip_code', 'firstName', 'lastName'];

function hasUnmappedRequiredFields(mapping: Record<string, string | null>) {
  const mappedFields = Object.values(mapping).filter(Boolean);
  return REQUIRED_FIELDS.some(field => !mappedFields.includes(field));
}

// Helper to find duplicate property addresses in preview rows
function getDuplicateRowIndices(rows: string[][], mapping: Record<string, string | null>, csvHeaders: string[]) {
  const addressIdx = csvHeaders.findIndex(h => mapping[h] === 'street_address');
  const cityIdx = csvHeaders.findIndex(h => mapping[h] === 'city');
  const zipIdx = csvHeaders.findIndex(h => mapping[h] === 'zip_code');
  const seen = new Set<string>();
  const duplicates: number[] = [];
  rows.forEach((row, i) => {
    const key = [row[addressIdx], row[cityIdx], row[zipIdx]].join('|').toLowerCase();
    if (seen.has(key)) {
      duplicates.push(i);
    } else {
      seen.add(key);
    }
  });
  return duplicates;
}

export default function CSVUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string | null>>({});
  const [mappingConfirmed, setMappingConfirmed] = useState(false);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setMappingConfirmed(false);
      // Extract headers
      const headers = await extractCSVHeaders(selectedFile);
      setCsvHeaders(headers);
      // Suggest mapping
      const suggested = suggestColumnMapping(headers, DB_FIELDS);
      setColumnMapping(suggested);
    }
  };

  const handleConfirmMapping = async () => {
    setMappingConfirmed(true);
    // Parse the CSV file rows for preview
    if (file) {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      const rows = lines.slice(1).map(line => line.split(','));
      setCsvRows(rows);
      setShowPreview(true);
    }
  };

  const handleBackToMapping = () => {
    setMappingConfirmed(false);
    setShowPreview(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('columnMapping', JSON.stringify(columnMapping));

      const response = await fetch('/api/csv-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BaseHeader />
      <div className="container mx-auto py-8 max-w-2xl">
        
        <h1 className="text-3xl font-bold mb-8">Data Upload</h1>
        {/* <p className="text-sm text-grey-600">*.csv</p> */}
        <div className="space-y-6">
          {/* File Input */}
          <div className="space-y-2">
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Column Mapping Modal */}
          {file && csvHeaders.length > 0 && !mappingConfirmed && (
            <div>
              <ColumnMappingModal
                csvHeaders={csvHeaders}
                dbFields={DB_FIELDS}
                initialMapping={columnMapping}
                onMappingChange={setColumnMapping}
              />
              {hasUnmappedRequiredFields(columnMapping) && (
                <div className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mt-2 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Please map all required fields: {REQUIRED_FIELDS.join(', ')}
                </div>
              )}
              <Button className="mt-4 w-full" onClick={handleConfirmMapping} disabled={hasUnmappedRequiredFields(columnMapping)}>
                Confirm Mapping
              </Button>
            </div>
          )}

          {/* Preview */}
          {mappingConfirmed && showPreview && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg">Preview Mapped Data</h2>
                <Button variant="outline" size="sm" onClick={handleBackToMapping}>Back to Mapping</Button>
              </div>
              {/* Conflict detection */}
              {(() => {
                const duplicateRows = getDuplicateRowIndices(csvRows, columnMapping, csvHeaders);
                const hasMissingRequired = csvRows.slice(0, 10).some(row =>
                  csvHeaders.some((h, colIdx) => {
                    const dbField = columnMapping[h];
                    return dbField && REQUIRED_FIELDS.includes(dbField) && (!row[colIdx] || row[colIdx].trim() === '');
                  })
                );
                return (
                  <>
                    {(duplicateRows.length > 0 || hasMissingRequired) && (
                      <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-2 text-sm">
                        {duplicateRows.length > 0 && <div>{duplicateRows.length} duplicate property rows detected (highlighted in red).</div>}
                        {hasMissingRequired && <div>Some required fields are missing (highlighted in orange).</div>}
                      </div>
                    )}
                    <CSVPreviewTable
                      csvRows={csvRows}
                      mapping={columnMapping}
                      csvHeaders={csvHeaders}
                      maxRows={10}
                      conflictRows={duplicateRows}
                      requiredFields={REQUIRED_FIELDS}
                    />
                  </>
                );
              })()}
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full mt-4"
              >
                {isUploading ? 'Processing...' : 'Upload & Process'}
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Result */}
          {result && result.success && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">{result.message}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Processed Rows:</span> {result.summary.processedRows}
                    </div>
                    <div>
                      <span className="font-medium">Errors:</span> {result.summary.errors}
                    </div>
                    <div>
                      <span className="font-medium">Duplicates:</span> {result.summary.duplicates}
                    </div>
                    <div>
                      <span className="font-medium">Owners Created:</span> {result.summary.createdOwners}
                    </div>
                    <div>
                      <span className="font-medium">Properties Created:</span> {result.summary.createdProperties}
                    </div>
                    <div>
                      <span className="font-medium">Contacts:</span> {result.summary.createdContacts}
                    </div>
                    <div>
                      <span className="font-medium">Owners Merged:</span> {result.summary.mergedOwners || 0}
                    </div>
                    <div>
                      <span className="font-medium">Properties Merged:</span> {result.summary.mergedProperties || 0}
                    </div>
                  </div>
                  
                  {result.summary.reconciliationSummary && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="font-medium text-blue-800 mb-2">Reconciliation Summary:</p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>Properties Created: {result.summary.reconciliationSummary.propertiesCreated}</div>
                        <div>Properties Merged: {result.summary.reconciliationSummary.propertiesMerged}</div>
                        <div>Owners Created: {result.summary.reconciliationSummary.ownersCreated}</div>
                        <div>Owners Merged: {result.summary.reconciliationSummary.ownersMerged}</div>
                      </div>
                    </div>
                  )}

                  {result.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-red-600">Validation Errors:</p>
                      <div className="max-h-40 overflow-y-auto">
                        {result.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600 mt-1">
                            <span className="font-medium">Row {error.row} ({error.address}):</span> {error.errors.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.duplicates && result.duplicates.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-yellow-600">Duplicate Addresses (skipped):</p>
                      <div className="max-h-40 overflow-y-auto">
                        {result.duplicates.map((duplicate, index) => (
                          <div key={index} className="text-sm text-yellow-600 mt-1">
                            <span className="font-medium">Row {duplicate.row} ({duplicate.address}):</span> {duplicate.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
} 