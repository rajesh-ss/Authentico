import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useGeneration } from '@/contexts/GenerationContext';
import { usePagination } from '@/hooks';
import {
  StepProgress,
  TemplatePreview,
  FileUpload,
  DataPreview,
  SuccessScreen,
  GeneratingScreen,
} from '@/components/issuance';
import { type FileFormat } from '@/components/issuance/FileUpload';

const ROWS_PER_PAGE = 10;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(true);
  const [lastSubmittedJobId, setLastSubmittedJobId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('excel');

  const { jobs, activeJob, startGeneration, updateProgress, completeJob, failJob } = useGeneration();

  // Pagination hook
  const pagination = usePagination({
    data: rawData,
    pageSize: ROWS_PER_PAGE,
  });

  // Find the last completed job that we submitted
  const completedJob = useMemo(() => {
    if (!lastSubmittedJobId) return null;
    const job = jobs.find(j => j.id === lastSubmittedJobId);
    return job?.status === 'completed' ? job : null;
  }, [jobs, lastSubmittedJobId]);

  // Check if we're currently generating the submitted job
  const isGeneratingSubmittedJob = useMemo(() => {
    if (!lastSubmittedJobId) return false;
    const job = jobs.find(j => j.id === lastSubmittedJobId);
    return job?.status === 'in_progress';
  }, [jobs, lastSubmittedJobId]);

  // Calculate current step
  const currentStep = useMemo(() => {
    if (rawData.length > 0) return 3;
    if (excelFile) return 2;
    return 1;
  }, [excelFile, rawData.length]);

  // Data statistics
  const dataStats = useMemo(() => {
    if (rawData.length === 0) return null;
    return {
      totalRecords: rawData.length,
      totalColumns: headers.length,
      estimatedTime: Math.ceil(rawData.length / 50),
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
    
    // Return mock data structure that would come from server
    const mockData = Array.from({ length: 25 }, (_, i) => ({
      StudentID: `STU${String(i + 1).padStart(4, '0')}`,
      Name: `Student ${i + 1}`,
      RollNo: `${100 + i}`,
      Department: 'Computer Science',
      Semester: '6',
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
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
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
      toast.success(`Loaded ${result.data.length} records from ${result.headers.length} columns`);
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

  const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (generationIntervalRef.current) {
        clearInterval(generationIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!excelFile || rawData.length === 0) return;
    
    setIsSubmitting(true);
    const totalCards = rawData.length;
    const fileName = excelFile.name;
    
    const jobId = startGeneration(fileName, totalCards);
    setLastSubmittedJobId(jobId);
    
    setExcelFile(null);
    setRawData([]);
    setHeaders([]);
    setIsSubmitting(false);
    
    let generated = 0;
    const interval = setInterval(() => {
      generated += Math.ceil(Math.random() * 3) + 1;
      if (generated >= totalCards) {
        generated = totalCards;
        updateProgress(jobId, generated);
        clearInterval(interval);
        generationIntervalRef.current = null;
        
        if (Math.random() > 0.9) {
          failJob(jobId, 'Network error during blockchain verification');
          toast.error('Generation failed. Please try again.');
        } else {
          completeJob(jobId);
        }
      } else {
        updateProgress(jobId, generated);
      }
    }, 200);
    
    generationIntervalRef.current = interval;
  }, [excelFile, rawData, startGeneration, updateProgress, completeJob, failJob]);

  const handleReset = useCallback(() => {
    setExcelFile(null);
    setRawData([]);
    setHeaders([]);
    setParseError(null);
  }, []);

  const handleNewIssuance = useCallback(() => {
    setLastSubmittedJobId(null);
  }, []);

  const handleViewBatch = useCallback(() => {
    if (lastSubmittedJobId) {
      navigate(`/batch/${lastSubmittedJobId}`);
    }
  }, [lastSubmittedJobId, navigate]);

  // Show success screen if we have a completed job
  if (completedJob) {
    return (
      <DashboardLayout
        title="Issue Marks Cards"
        subtitle="Generation completed successfully"
      >
        <SuccessScreen 
          job={completedJob} 
          onNewIssuance={handleNewIssuance}
          onViewBatch={handleViewBatch}
        />
      </DashboardLayout>
    );
  }

  // Show generating state
  if (isGeneratingSubmittedJob && activeJob) {
    return (
      <DashboardLayout
        title="Issue Marks Cards"
        subtitle="Generating marks cards..."
      >
        <GeneratingScreen
          fileName={activeJob.fileName}
          generatedCards={activeJob.generatedCards}
          totalCards={activeJob.totalCards}
        />
      </DashboardLayout>
    );
  }

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
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
