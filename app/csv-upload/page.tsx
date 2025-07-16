'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BaseHeader } from '@/components/base-header';
import { ArrowLeft, Upload, Settings, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CSVUploadStage } from '@/components/CSVUploadStage';
import { CSVColumnMappingStage } from '@/components/CSVColumnMappingStage';
import { CSVPreviewStage } from '@/components/CSVPreviewStage';
import { CSVProcessResults } from '@/components/CSVProcessResults';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useUserAuthorization } from '@/hooks/useUserAuthorization';

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

type Stage = 'upload' | 'mapping' | 'preview' | 'results';

export default function CSVUploadPage() {
  const [currentStage, setCurrentStage] = useState<Stage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string | null>>({});
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUnauthorizedDialog, setShowUnauthorizedDialog] = useState(false);
  const router = useRouter();
  const { isAuthorized, isLoading } = useUserAuthorization();

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    if (!isAuthorized) {
      setShowUnauthorizedDialog(true);
    } else {
      setCurrentStage('mapping');
    }
  };

  const handleMappingComplete = (mapping: Record<string, string | null>) => {
    setColumnMapping(mapping);
    setCurrentStage('preview');
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
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
        const errorMessage = data.error || 'Upload failed';
        toast.error(errorMessage);
        
        
        throw new Error(errorMessage);
      }

      setUploadResult(data);
      setCurrentStage('results');
      toast.success('CSV file processed successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      // Error toast is already shown above
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToUpload = () => {
    setCurrentStage('upload');
    setFile(null);
    setColumnMapping({});
    setUploadResult(null);
  };

  const handleBackToMapping = () => {
    setCurrentStage('mapping');
  };

  const handleBackToPreview = () => {
    setCurrentStage('preview');
  };

  const getProgressValue = () => {
    switch (currentStage) {
      case 'upload':
        return 25;
      case 'mapping':
        return 50;
      case 'preview':
        return 75;
      case 'results':
        return 100;
      default:
        return 0;
    }
  };

  const getStageIcon = (stage: Stage) => {
    switch (stage) {
      case 'upload':
        return <Upload className="h-5 w-5" />;
      case 'mapping':
        return <Settings className="h-5 w-5" />;
      case 'preview':
        return <Eye className="h-5 w-5" />;
      case 'results':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStageTitle = (stage: Stage) => {
    switch (stage) {
      case 'upload':
        return 'Upload';
      case 'mapping':
        return 'Map Columns';
      case 'preview':
        return 'Preview';
      case 'results':
        return 'Results';
      default:
        return '';
    }
  };

  const isStageActive = (stage: Stage) => {
    const stageOrder: Stage[] = ['upload', 'mapping', 'preview', 'results'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stageIndex = stageOrder.indexOf(stage);
    return stageIndex <= currentIndex;
  };

  const isStageCompleted = (stage: Stage) => {
    const stageOrder: Stage[] = ['upload', 'mapping', 'preview', 'results'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stageIndex = stageOrder.indexOf(stage);
    return stageIndex < currentIndex;
  };

  return (
    <div className="min-h-screen bg-background">
      <BaseHeader />
      <div className="container mx-auto py-8 max-w-5xl">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Data Upload</h1>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {(['upload', 'mapping', 'preview', 'results'] as Stage[]).map((stage) => (
                <div key={stage} className="flex items-center gap-2">
                  <div 
                    className={`p-2 rounded-full ${
                      isStageActive(stage) 
                        ? 'bg-primary text-primary-foreground' 
                        : isStageCompleted(stage)
                        ? 'bg-green-500 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    {isStageCompleted(stage) ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      getStageIcon(stage)
                    )}
                  </div>
                  <span 
                    className={`font-medium ${
                      isStageActive(stage) 
                        ? 'text-primary' 
                        : isStageCompleted(stage)
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {getStageTitle(stage)}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Step {(['upload', 'mapping', 'preview', 'results'] as Stage[]).indexOf(currentStage) + 1} of 4
            </div>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>

        {/* Stage Content */}
        <div className="bg-card rounded-lg border p-6">
          {currentStage === 'upload' && (
            <CSVUploadStage onFileSelected={handleFileSelected} />
          )}

          {currentStage === 'mapping' && file && (
            <CSVColumnMappingStage 
              file={file}
              onMappingComplete={handleMappingComplete}
              onBack={handleBackToUpload}
              isAuthorized={isAuthorized}
            />
          )}

          {currentStage === 'preview' && file && (
            <CSVPreviewStage 
              file={file}
              columnMapping={columnMapping}
              onProcess={handleProcess}
              onBack={handleBackToMapping}
            />
          )}

          {currentStage === 'results' && uploadResult && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold">Processing Complete</h2>
              </div>
              <CSVProcessResults 
                result={uploadResult} 
                onBack={handleBackToUpload}
              />
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-medium">Processing your data...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unauthorized Dialog */}
      <AlertDialog open={showUnauthorizedDialog} onOpenChange={setShowUnauthorizedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <AlertDialogTitle>Feature Not Available</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              The CSV upload feature is not available for general use yet. This feature is currently in limited access for authorized users only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowUnauthorizedDialog(false)}>
            Continue
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 