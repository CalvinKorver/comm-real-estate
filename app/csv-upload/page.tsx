'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SiteHeader } from '@/components/site-header';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function CSVUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
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
      <SiteHeader />
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
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            {file && (
              <p className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? 'Processing...' : 'Upload & Process'}
          </Button>

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
                      <span className="font-medium">Owners:</span> {result.summary.createdOwners}
                    </div>
                    <div>
                      <span className="font-medium">Properties:</span> {result.summary.createdProperties}
                    </div>
                    <div>
                      <span className="font-medium">Contacts:</span> {result.summary.createdContacts}
                    </div>
                  </div>
                  
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