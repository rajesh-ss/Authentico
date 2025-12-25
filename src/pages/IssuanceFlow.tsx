import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertCircle, Send, GraduationCap, Award, 
  Calendar, Hash, BookOpen, ChevronDown, ChevronUp, FileCheck, Eye, 
  Users, Columns, Loader2, X, RotateCcw, Sparkles, PartyPopper, ArrowRight,
  FileText, ExternalLink, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useGeneration, GenerationJob } from '@/contexts/GenerationContext';

// Sample template data for preview
const sampleTemplate = {
  studentName: 'John Doe',
  registrationNo: 'REG2024001',
  semester: 'Semester 6',
  academicYear: '2023-2024',
  subjects: [
    { code: 'CS601', name: 'Machine Learning', credits: 4, internal: 28, external: 56, total: 84, grade: 'A' },
    { code: 'CS602', name: 'Cloud Computing', credits: 4, internal: 26, external: 52, total: 78, grade: 'B+' },
    { code: 'CS603', name: 'Data Mining', credits: 3, internal: 24, external: 48, total: 72, grade: 'B' },
    { code: 'CS604', name: 'Cyber Security', credits: 3, internal: 27, external: 54, total: 81, grade: 'A' },
  ],
  totalMarks: 315,
  percentage: 78.75,
  grade: 'First Class with Distinction',
};

// Step indicator component
const StepIndicator = ({ step, currentStep, label }: { step: number; currentStep: number; label: string }) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
        isCompleted && "bg-success text-success-foreground",
        isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
        !isActive && !isCompleted && "bg-muted text-muted-foreground"
      )}>
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span className={cn(
        "text-sm font-medium transition-colors",
        isActive && "text-foreground",
        !isActive && "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
};

// Success Screen Component
const SuccessScreen = ({ 
  job, 
  onNewIssuance, 
  onViewBatch 
}: { 
  job: GenerationJob; 
  onNewIssuance: () => void; 
  onViewBatch: () => void;
}) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full text-center">
        <CardContent className="pt-10 pb-8 px-8">
          {/* Success Icon with Animation */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Generation Complete!</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Your marks cards have been successfully generated and are ready for distribution.
          </p>

          {/* Stats */}
          <div className="bg-muted/50 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                File Name
              </span>
              <span className="font-medium text-foreground">{job.fileName}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Cards Generated
              </span>
              <Badge variant="success" className="font-mono">
                {job.totalCards} cards
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Blockchain Status
              </span>
              <Badge variant="outline" className="gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Verified
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={onViewBatch}
            >
              <ExternalLink className="h-4 w-4" />
              View Batch Details
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={onNewIssuance}
            >
              <Plus className="h-4 w-4" />
              Issue More Cards
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
  const [previewPage, setPreviewPage] = useState(0);
  const [lastSubmittedJobId, setLastSubmittedJobId] = useState<string | null>(null);
  const rowsPerPage = 10;

  const { jobs, activeJob, startGeneration, updateProgress, completeJob, failJob } = useGeneration();

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
      estimatedTime: Math.ceil(rawData.length / 50), // ~50 cards per second
    };
  }, [rawData, headers]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = previewPage * rowsPerPage;
    return rawData.slice(start, start + rowsPerPage);
  }, [rawData, previewPage]);

  const totalPages = Math.ceil(rawData.length / rowsPerPage);

  const handleUpload = useCallback(async (file: File) => {
    setIsParsing(true);
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      if (jsonData.length === 0) {
        throw new Error('The file appears to be empty');
      }

      const extractedHeaders = Object.keys(jsonData[0] || {});

      setExcelFile(file);
      setRawData(jsonData as Record<string, unknown>[]);
      setHeaders(extractedHeaders);
      setParseError(null);
      setPreviewPage(0);
      toast.success(`Loaded ${jsonData.length} records from ${extractedHeaders.length} columns`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse the file';
      setParseError(message);
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setParseError(null);
      const file = e.dataTransfer.files[0];
      if (file) {
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        if (isValid) {
          await handleUpload(file);
        } else {
          toast.error('Please upload an Excel (.xlsx, .xls) or CSV file');
        }
      }
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setParseError(null);
      const file = e.target.files?.[0];
      if (file) {
        await handleUpload(file);
      }
    },
    [handleUpload]
  );

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
    setPreviewPage(0);
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-10 pb-8 px-8">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">Generating Marks Cards</h2>
              <p className="text-muted-foreground mb-6">
                Please wait while we generate and verify your marks cards on the blockchain.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">File</span>
                  <span className="font-medium">{activeJob.fileName}</span>
                </div>
                <Progress 
                  value={(activeJob.generatedCards / activeJob.totalCards) * 100} 
                  className="h-2"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono font-medium">
                    {activeJob.generatedCards} / {activeJob.totalCards} cards
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Issue Marks Cards"
      subtitle="Upload student data to generate blockchain-verified marks cards"
    >
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <StepIndicator step={1} currentStep={currentStep} label="Upload" />
          <div className="flex-1 h-0.5 mx-4 bg-muted relative">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
              style={{ width: currentStep > 1 ? '100%' : '0%' }}
            />
          </div>
          <StepIndicator step={2} currentStep={currentStep} label="Preview" />
          <div className="flex-1 h-0.5 mx-4 bg-muted relative">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
              style={{ width: currentStep > 2 ? '100%' : '0%' }}
            />
          </div>
          <StepIndicator step={3} currentStep={currentStep} label="Issue" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Template Preview - Collapsible */}
        <div className="xl:col-span-2">
          <Collapsible open={templateOpen} onOpenChange={setTemplateOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Marks Card Template</CardTitle>
                        <CardDescription>Preview of generated cards</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="hidden sm:flex">Sample</Badge>
                      {templateOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="border rounded-lg p-5 bg-gradient-to-br from-background to-muted/30 space-y-5">
                    {/* Header */}
                    <div className="text-center space-y-2 pb-4 border-b border-dashed">
                      <div className="flex justify-center">
                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-bold text-base text-foreground">University of Technology</h3>
                      <p className="text-xs text-muted-foreground">Statement of Marks</p>
                    </div>

                    {/* Student Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          Student Name
                        </p>
                        <p className="font-medium text-sm">{sampleTemplate.studentName}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          Registration No
                        </p>
                        <p className="font-medium font-mono text-sm">{sampleTemplate.registrationNo}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Semester
                        </p>
                        <p className="font-medium text-sm">{sampleTemplate.semester}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Academic Year
                        </p>
                        <p className="font-medium text-sm">{sampleTemplate.academicYear}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Subjects Table */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Subject-wise Marks</p>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="text-xs h-7 py-1">Subject</TableHead>
                              <TableHead className="text-xs text-center h-7 py-1 w-10">Int</TableHead>
                              <TableHead className="text-xs text-center h-7 py-1 w-10">Ext</TableHead>
                              <TableHead className="text-xs text-center h-7 py-1 w-12">Total</TableHead>
                              <TableHead className="text-xs text-center h-7 py-1 w-14">Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sampleTemplate.subjects.map((subject) => (
                              <TableRow key={subject.code} className="text-xs">
                                <TableCell className="py-1.5">
                                  <div>
                                    <p className="font-medium text-xs">{subject.name}</p>
                                    <p className="text-muted-foreground text-[10px]">{subject.code}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center py-1.5 text-xs">{subject.internal}</TableCell>
                                <TableCell className="text-center py-1.5 text-xs">{subject.external}</TableCell>
                                <TableCell className="text-center py-1.5 font-medium text-xs">{subject.total}</TableCell>
                                <TableCell className="text-center py-1.5">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {subject.grade}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-primary/5 rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Total Marks</span>
                        <span className="font-bold">{sampleTemplate.totalMarks}/400</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Percentage</span>
                        <span className="font-bold">{sampleTemplate.percentage}%</span>
                      </div>
                      <Separator className="my-1.5" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Result</span>
                        <Badge variant="success" className="text-[10px]">{sampleTemplate.grade}</Badge>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex items-center justify-center pt-1">
                      <div className="text-center space-y-1">
                        <div className="h-12 w-12 mx-auto border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
                          <span className="text-[10px] text-muted-foreground">QR</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Blockchain Verified</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Right: Upload & Preview Section */}
        <div className="xl:col-span-3 space-y-6">
          {/* Upload Area */}
          <Card className={cn(
            "transition-all duration-300",
            rawData.length > 0 && "ring-2 ring-success/20"
          )}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                    excelFile && !parseError ? "bg-success/10" : "bg-primary/10"
                  )}>
                    {isParsing ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : excelFile && !parseError ? (
                      <FileCheck className="h-5 w-5 text-success" />
                    ) : (
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">Upload Student Data</CardTitle>
                    <CardDescription>Excel (.xlsx, .xls) or CSV format</CardDescription>
                  </div>
                </div>
                {excelFile && !parseError && (
                  <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200",
                  isDragOver && "border-primary bg-primary/5 scale-[1.02]",
                  !isDragOver && !excelFile && !parseError && "border-border hover:border-primary/50 hover:bg-muted/30",
                  excelFile && !parseError && "border-success bg-success/5",
                  parseError && "border-destructive bg-destructive/5"
                )}
              >
                {isParsing ? (
                  <div className="space-y-3 py-4">
                    <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
                    <div>
                      <p className="font-medium text-foreground">Processing file...</p>
                      <p className="text-sm text-muted-foreground">Extracting student records</p>
                    </div>
                  </div>
                ) : excelFile && !parseError ? (
                  <div className="space-y-4">
                    <div className="h-12 w-12 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{excelFile.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(excelFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <label className="cursor-pointer inline-block">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                          Change File
                        </span>
                      </Button>
                    </label>
                  </div>
                ) : parseError ? (
                  <div className="space-y-4">
                    <div className="h-12 w-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-destructive">{parseError}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please try again with a valid file
                      </p>
                    </div>
                    <label className="cursor-pointer inline-block">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span>Try Again</span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Drop your Excel file here
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse • Max 10MB
                      </p>
                    </div>
                    <label className="cursor-pointer inline-block">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button variant="outline" asChild>
                        <span>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Browse Files
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          {rawData.length > 0 && (
            <Card className="animate-in slide-in-from-bottom-4 duration-300">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Data Preview</CardTitle>
                      <CardDescription>Review your data before issuing</CardDescription>
                    </div>
                  </div>
                  {dataStats && (
                    <div className="flex gap-3">
                      <Badge variant="secondary" className="gap-1.5">
                        <Users className="h-3 w-3" />
                        {dataStats.totalRecords} Records
                      </Badge>
                      <Badge variant="outline" className="gap-1.5">
                        <Columns className="h-3 w-3" />
                        {dataStats.totalColumns} Columns
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Column Headers Preview */}
                <div className="flex flex-wrap gap-1.5">
                  {headers.map((header, i) => (
                    <Badge key={header} variant="outline" className="text-xs font-normal">
                      {header}
                    </Badge>
                  ))}
                </div>

                {/* Data Table */}
                <ScrollArea className="w-full rounded-lg border">
                  <div className="min-w-max">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-14 text-center">#</TableHead>
                          {headers.slice(0, 5).map((header) => (
                            <TableHead key={header} className="whitespace-nowrap font-medium">
                              {header}
                            </TableHead>
                          ))}
                          {headers.length > 5 && (
                            <TableHead className="text-muted-foreground text-center">
                              +{headers.length - 5} more
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((row, index) => (
                          <TableRow key={index} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-xs text-center text-muted-foreground">
                              {previewPage * rowsPerPage + index + 1}
                            </TableCell>
                            {headers.slice(0, 5).map((header) => (
                              <TableCell key={header} className="whitespace-nowrap max-w-[200px] truncate">
                                {String(row[header] ?? '-')}
                              </TableCell>
                            ))}
                            {headers.length > 5 && (
                              <TableCell className="text-muted-foreground text-center">...</TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {previewPage * rowsPerPage + 1}-{Math.min((previewPage + 1) * rowsPerPage, rawData.length)} of {rawData.length}
                    </p>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                        disabled={previewPage === 0}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={previewPage >= totalPages - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Est. generation time: ~{dataStats?.estimatedTime || 1} seconds</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
                      Clear
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Issue {rawData.length} Cards
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
