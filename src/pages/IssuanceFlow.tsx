import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { useGeneration } from '@/contexts/GenerationContext';
import { usePagination } from '@/hooks';
import {
  StepProgress,
  TemplatePreview,
  FileUpload,
  // DataPreview,
  BatchList,
  BatchPreviewDialog,
  BatchConfirmationDialog,
} from '@/components/issuance';
import { type FileFormat } from '@/components/issuance/FileUpload';
import { uploadService, type StudentRecord, type UploadBatch } from '@/services/upload.service';
import { useMutation, useQuery } from '@tanstack/react-query';

const ROWS_PER_PAGE = 10;
const MAX_RECORDS_PER_BATCH = 3000;

// Valid file extensions for each format
const VALID_EXTENSIONS: Record<FileFormat, string[]> = {
  excel: ['.xlsx', '.xls', '.csv'],
  mdb: ['.mdb', '.accdb'],
};

export default function IssuanceFlow() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<StudentRecord[]>([]);
  // Use a map to store headers dynamically based on the first record
  const [headers, setHeaders] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [templateOpen, setTemplateOpen] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('excel');
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);

  // Batch management state
  const [batches, setBatches] = useState<UploadBatch[]>([]);
  const [previewBatchId, setPreviewBatchId] = useState<string | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Store generation info for dialog to use after data is cleared
  const [committingBatchIds, setCommittingBatchIds] = useState<string[]>([]);
  const [committedBatchIds, setCommittedBatchIds] = useState<string[]>([]);

  const [generationInfo, setGenerationInfo] = useState<{
    fileName: string;
    totalRecords: number;
  } | null>(null);

  const { activeJobs, isGenerating, getJobsByParentFile } = useGeneration();

  // Mutation for file upload
  const uploadMutation = useMutation({
    mutationFn: async ({ file, format }: { file: File; format: FileFormat }) => {
      return await uploadService.uploadFile(file, format);
    },
    onSuccess: (response) => {
      toast.success(response.message);

      if (response.data.batches && response.data.batches.length > 0) {
        setBatches(response.data.batches);
        // We don't auto-set uploadId anymore, user selects batch to view
        // setUploadId(response.data.batches[0].uploadId);
      }
    },
    onError: (error: Error) => {
      setParseError(error.message);
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  // Query to fetch preview data when we have an uploadId
  const { data: previewResponse, isLoading: isLoadingPreview } = useQuery({
    queryKey: ['uploadPreview', uploadId],
    queryFn: () => {
      if (!uploadId) throw new Error('Upload ID is required');
      return uploadService.getUploadPreview(uploadId);
    },
    enabled: !!uploadId,
  });

  // Update local state when preview data arrives
  useEffect(() => {
    if (previewResponse?.success && previewResponse.data) {
      setPreviewData(previewResponse.data.previewData);

      // Extract headers from the first record's student object and top-level fields
      if (previewResponse.data.previewData.length > 0) {
        const firstRecord = previewResponse.data.previewData[0];
        // Flatten for display: show direct fields + student fields
        const studentKeys = Object.keys(firstRecord.student || {}).map((k) => `student.${k}`);
        const directKeys = Object.keys(firstRecord).filter(
          (k) =>
            k !== 'student' &&
            k !== 'subjects' &&
            k !== 'remarks' &&
            typeof firstRecord[k] !== 'object'
        );

        // For simple display, let's just show some key fields or all flat keys
        // Ideally we map this to user-friendly headers
        setHeaders([...directKeys, ...studentKeys]);
      }
    }
  }, [previewResponse]);

  // Check for staging status on mount
  useEffect(() => {
    const checkStaging = async () => {
      try {
        const response = await uploadService.getUploadsByStatus('STAGING');
        if (response.success && response.data) {
          // If we get a valid preview/status response, restore state
          setUploadId(response.data.uploadId);
          toast.info('Restored release-pending upload session');
        }
      } catch (error) {
        // No active staging upload, ignore
        console.debug('No staging session found', error);
      }
    };
    checkStaging();
  }, []);

  // Pagination hook
  const pagination = usePagination({
    data: previewData,
    pageSize: ROWS_PER_PAGE,
  });

  // Calculate total batch info
  const batchInfo = useMemo(() => {
    // If we have batches array, use that
    if (batches.length > 0) {
      const totalRecords = batches.reduce((sum, b) => sum + b.count, 0);
      return {
        totalRecords,
        totalBatches: batches.length,
        recordsPerBatch: MAX_RECORDS_PER_BATCH, // Approximate
      };
    }

    if (previewData.length === 0 && !previewResponse?.data?.totalRecords) return null;
    const totalRecords = previewResponse?.data?.totalRecords || previewData.length;

    // If the API already batched it, we use that info
    // But here we are just showing preview.
    // The "totalRecords" from API is what matters.
    const totalBatches = Math.ceil(totalRecords / MAX_RECORDS_PER_BATCH);

    return {
      totalRecords,
      totalBatches,
      recordsPerBatch: MAX_RECORDS_PER_BATCH,
    };
  }, [batches, previewData.length, previewResponse]);

  // Get jobs for current file
  const currentFileJobs = useMemo(() => {
    const fileName = file?.name || generationInfo?.fileName;
    if (!fileName) return [];
    return getJobsByParentFile(fileName);
  }, [file, generationInfo, getJobsByParentFile]);

  // Calculate current step
  const currentStep = useMemo(() => {
    if (previewData.length > 0) return 2; // Preview step
    if (file) return 1; // Upload step (processing/uploaded)
    return 1;
  }, [file, previewData.length]);

  const handleUpload = useCallback(
    async (file: File, format: FileFormat) => {
      setFile(file);
      setParseError(null);
      setPreviewData([]);
      setBatches([]); // Reset batches
      setUploadId(null);

      uploadMutation.mutate({ file, format });
    },
    [uploadMutation]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, format: FileFormat) => {
      e.preventDefault();
      setIsDragOver(false);
      setParseError(null);
      const file = e.dataTransfer.files[0];
      if (file) {
        const validExtensions = VALID_EXTENSIONS[format];
        const isValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
        if (isValid) {
          await handleUpload(file, format);
        } else {
          const formatLabel =
            format === 'mdb' ? 'Access (.mdb, .accdb)' : 'Excel (.xlsx, .xls) or CSV';
          toast.error(`Please upload a ${formatLabel} file`);
        }
      }
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, format: FileFormat) => {
      setParseError(null);
      const file = e.target.files?.[0];
      if (file) {
        await handleUpload(file, format);
      }
    },
    [handleUpload]
  );

  const handleFormatChange = useCallback((format: FileFormat) => {
    setSelectedFormat(format);
  }, []);

  // Show batch confirmation dialog before generating
  const handleSubmit = useCallback(() => {
    if ((!file && batches.length === 0) || (previewData.length === 0 && batches.length === 0))
      return;
    setShowBatchDialog(true);
  }, [file, batches.length, previewData.length]);

  const handleViewBatch = useCallback((batchId: string) => {
    setPreviewBatchId(batchId);
    setShowPreviewDialog(true);
  }, []);

  // Start batch generation
  // Mutation for committing upload
  // Mutation for committing upload
  const commitMutation = useMutation({
    mutationFn: async (uploadId: string) => {
      return await uploadService.commitUpload(uploadId);
    },
    onSuccess: (response, variables) => {
      toast.success(response.message);
      setCommittedBatchIds((prev) => [...prev, variables]);
      setCommittingBatchIds((prev) => prev.filter((id) => id !== variables));
    },
    onError: (error: Error, variables) => {
      toast.error(`Commit failed: ${error.message}`);
      setCommittingBatchIds((prev) => prev.filter((id) => id !== variables));
    },
  });

  const handleCommitBatch = useCallback(
    (uploadId: string) => {
      if (committingBatchIds.includes(uploadId) || committedBatchIds.includes(uploadId)) return;

      setCommittingBatchIds((prev) => [...prev, uploadId]);
      commitMutation.mutate(uploadId);
    },
    [committingBatchIds, committedBatchIds, commitMutation]
  );

  const handleConfirmGeneration = useCallback(() => {
    // If we have batches, try to commit all uncommitted ones
    const uncommittedBatches = batches.filter(
      (b) => !committedBatchIds.includes(b.uploadId) && !committingBatchIds.includes(b.uploadId)
    );

    if (uncommittedBatches.length > 0) {
      uncommittedBatches.forEach((b) => handleCommitBatch(b.uploadId));
    } else if (batches.length > 0 && batches.every((b) => committedBatchIds.includes(b.uploadId))) {
      toast.info('All batches are already committed.');
    } else {
      // Legacy fallback or single uploadId
      const currentUploadId = uploadId || (batches.length > 0 ? batches[0].uploadId : null);
      if (
        currentUploadId &&
        !committedBatchIds.includes(currentUploadId) &&
        !committingBatchIds.includes(currentUploadId)
      ) {
        handleCommitBatch(currentUploadId);
      } else if (!uploadId && batches.length === 0) {
        toast.error('No active upload to commit');
      }
    }
  }, [batches, committedBatchIds, committingBatchIds, handleCommitBatch, uploadId]);

  const handleNavigateToMarksCards = useCallback(() => {
    setShowBatchDialog(false);
    navigate('/generation-status');
  }, [navigate]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreviewData([]);
    setBatches([]);
    setHeaders([]);
    setParseError(null);
    setGenerationInfo(null);
    setUploadId(null);
  }, []);

  return (
    <DashboardLayout
      title="Issue Marks Cards"
      subtitle="Upload student data to generate blockchain-verified marks cards"
    >
      <StepProgress currentStep={currentStep} steps={['Upload', 'Preview', 'Issue']} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Template Preview */}
        <div className="xl:col-span-2">
          <TemplatePreview open={templateOpen} onOpenChange={setTemplateOpen} />
        </div>

        {/* Right: Upload & Preview Section */}
        <div className="xl:col-span-3 space-y-6">
          <FileUpload
            file={file}
            isParsing={uploadMutation.isPending || isLoadingPreview}
            parseError={parseError}
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            onReset={handleReset}
            hasData={previewData.length > 0}
            selectedFormat={selectedFormat}
            onFormatChange={handleFormatChange}
          />

          {batches.length > 0 && (
            <BatchList
              batches={batches}
              onViewBatch={handleViewBatch}
              onIssueAll={handleSubmit}
              isIssuing={false}
            />
          )}

          {/* Legacy single preview fallback if needed, or remove completely if strict batch mode */}
          {/* {previewData.length > 0 && batchInfo && batches.length === 0 && (
            <DataPreview
               ...
            />
          )} */}
        </div>
      </div>

      <BatchPreviewDialog
        uploadId={previewBatchId}
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
      />

      {/* Batch Confirmation & Progress Dialog */}
      <BatchConfirmationDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        fileName={
          file?.name || generationInfo?.fileName || currentFileJobs[0]?.parentFileName || 'Unknown'
        }
        totalRecords={
          batchInfo?.totalRecords ||
          generationInfo?.totalRecords ||
          currentFileJobs.reduce((sum, j) => sum + j.totalCards, 0)
        }
        onConfirm={handleConfirmGeneration}
        onNavigateToMarksCards={handleNavigateToMarksCards}
        isGenerating={isGenerating && activeJobs.length > 0}
        isCommitting={committingBatchIds.length > 0}
        activeJobs={activeJobs.length > 0 ? activeJobs : currentFileJobs}
        batches={batches}
        onCommitBatch={handleCommitBatch}
        committingBatchIds={committingBatchIds}
        committedBatchIds={committedBatchIds}
      />
    </DashboardLayout>
  );
}
