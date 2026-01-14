import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import * as XLSX from '@e965/xlsx';
import { useGeneration } from '@/contexts/GenerationContext';
import { usePagination } from '@/hooks';
import {
  StepProgress,
  TemplatePreview,
  FileUpload,
  DataPreview,
  BatchConfirmationDialog,
} from '@/components/issuance';
import { type FileFormat } from '@/components/issuance/FileUpload';

const ROWS_PER_PAGE = 10;
const MAX_RECORDS_PER_BATCH = 3000;

// Valid file extensions for each format
const VALID_EXTENSIONS: Record<FileFormat, string[]> = {
  excel: ['.xlsx', '.xls', '.csv'],
  mdb: ['.mdb', '.accdb'],
};

export default function IssuanceFlow() {
  const navigate = useNavigate();
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('excel');
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  const { activeJobs, startBatchGeneration, isGenerating, getJobsByParentFile } = useGeneration();

  // Pagination hook
  const pagination = usePagination({
    data: rawData,
    pageSize: ROWS_PER_PAGE,
  });

  // Calculate batch info
  const batchInfo = useMemo(() => {
    if (rawData.length === 0) return null;
    const totalBatches = Math.ceil(rawData.length / MAX_RECORDS_PER_BATCH);
    return {
      totalRecords: rawData.length,
      totalBatches,
      recordsPerBatch: MAX_RECORDS_PER_BATCH,
    };
  }, [rawData.length]);

  // Get jobs for current file
  const currentFileJobs = useMemo(() => {
    if (!excelFile) return [];
    return getJobsByParentFile(excelFile.name);
  }, [excelFile, getJobsByParentFile]);

  // Calculate current step
  const currentStep = useMemo(() => {
    if (rawData.length > 0) return 3;
    if (excelFile) return 2;
    return 1;
  }, [excelFile, rawData.length]);

  // Data statistics
  const dataStats = useMemo(() => {
    if (rawData.length === 0) return null;
    const totalBatches = Math.ceil(rawData.length / MAX_RECORDS_PER_BATCH);
    return {
      totalRecords: rawData.length,
      totalColumns: headers.length,
      estimatedTime: Math.ceil(rawData.length / 50),
      totalBatches,
    };
  }, [rawData, headers]);

  // Parse Excel/CSV files
  const parseExcelFile = useCallback(async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
    
    if (jsonData.length === 0) {
      throw new Error('The file appears to be empty');
    }
    
    return {
      data: jsonData as Record<string, unknown>[],
      headers: Object.keys(jsonData[0] || {}),
    };
  }, []);

  // Parse MDB/Access files (mock implementation - in production would use server-side parsing)
  const parseMdbFile = useCallback(async (file: File) => {
    // MDB files require server-side processing in production
    // For now, we simulate with mock data structure
    toast.info('MDB parsing requires server-side processing. Using sample data structure.');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock data structure that would come from server (larger dataset to demo batching)
    const mockData = Array.from({ length: 7500 }, (_, i) => ({
      StudentID: `STU${String(i + 1).padStart(5, '0')}`,
      Name: `Student ${i + 1}`,
      RollNo: `${1000 + i}`,
      Department: ['Computer Science', 'Mechanical', 'Electrical', 'Civil'][i % 4],
      Semester: String((i % 8) + 1),
      Subject1: Math.floor(Math.random() * 40) + 60,
      Subject2: Math.floor(Math.random() * 40) + 60,
      Subject3: Math.floor(Math.random() * 40) + 60,
      Subject4: Math.floor(Math.random() * 40) + 60,
      Subject5: Math.floor(Math.random() * 40) + 60,
    }));
    
    return {
      data: mockData,
      headers: Object.keys(mockData[0]),
    };
  }, []);

  const handleUpload = useCallback(async (file: File, format: FileFormat) => {
    setIsParsing(true);
    try {
      // Access DB files can be larger, allow up to 100MB; Excel/CSV limited to 10MB
      const maxSize = format === 'mdb' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      const maxSizeLabel = format === 'mdb' ? '100MB' : '10MB';
      
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSizeLabel} limit`);
      }

      let result: { data: Record<string, unknown>[]; headers: string[] };

      if (format === 'mdb') {
        result = await parseMdbFile(file);
      } else {
        result = await parseExcelFile(file);
      }

      setExcelFile(file);
      setRawData(result.data);
      setHeaders(result.headers);
      setParseError(null);
      
      const numBatches = Math.ceil(result.data.length / MAX_RECORDS_PER_BATCH);
      toast.success(
        `Loaded ${result.data.length.toLocaleString()} records from ${result.headers.length} columns. ` +
        `Will be split into ${numBatches} batch${numBatches > 1 ? 'es' : ''}.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse the file';
      setParseError(message);
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  }, [parseExcelFile, parseMdbFile]);

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
        const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        if (isValid) {
          await handleUpload(file, format);
        } else {
          const formatLabel = format === 'mdb' ? 'Access (.mdb, .accdb)' : 'Excel (.xlsx, .xls) or CSV';
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
    if (!excelFile || rawData.length === 0) return;
    setShowBatchDialog(true);
  }, [excelFile, rawData.length]);

  // Start batch generation
  const handleConfirmGeneration = useCallback(() => {
    if (!excelFile || rawData.length === 0) return;
    
    startBatchGeneration({
      fileName: excelFile.name,
      totalRecords: rawData.length,
      maxRecordsPerBatch: MAX_RECORDS_PER_BATCH,
    });
    
    // Clear the file/data but keep dialog open to show progress
    setExcelFile(null);
    setRawData([]);
    setHeaders([]);
    
    toast.success(`Started generating ${batchInfo?.totalBatches} batch${(batchInfo?.totalBatches || 0) > 1 ? 'es' : ''}`);
  }, [excelFile, rawData.length, startBatchGeneration, batchInfo]);

  const handleNavigateToMarksCards = useCallback(() => {
    setShowBatchDialog(false);
    navigate('/generation-status');
  }, [navigate]);

  const handleReset = useCallback(() => {
    setExcelFile(null);
    setRawData([]);
    setHeaders([]);
    setParseError(null);
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
            file={excelFile}
            isParsing={isParsing}
            parseError={parseError}
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            onReset={handleReset}
            hasData={rawData.length > 0}
            selectedFormat={selectedFormat}
            onFormatChange={handleFormatChange}
          />

          {rawData.length > 0 && dataStats && (
            <DataPreview
              headers={headers}
              paginatedData={pagination.paginatedData}
              totalRecords={dataStats.totalRecords}
              estimatedTime={dataStats.estimatedTime}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onNextPage={pagination.nextPage}
              onPrevPage={pagination.prevPage}
              canGoNext={pagination.canGoNext}
              canGoPrev={pagination.canGoPrev}
              onSubmit={handleSubmit}
              isSubmitting={false}
              batchCount={dataStats.totalBatches}
            />
          )}
        </div>
      </div>

      {/* Batch Confirmation & Progress Dialog */}
      <BatchConfirmationDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        fileName={excelFile?.name || currentFileJobs[0]?.parentFileName || 'Unknown'}
        totalRecords={rawData.length || currentFileJobs.reduce((sum, j) => sum + j.totalCards, 0)}
        onConfirm={handleConfirmGeneration}
        onNavigateToMarksCards={handleNavigateToMarksCards}
        isGenerating={isGenerating && activeJobs.length > 0}
        activeJobs={activeJobs.length > 0 ? activeJobs : currentFileJobs}
      />
    </DashboardLayout>
  );
}
