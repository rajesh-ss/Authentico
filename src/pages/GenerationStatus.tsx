import { useState, useMemo } from 'react';
import { useGeneration, GenerationJob } from '@/contexts/GenerationContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileSpreadsheet, 
  Layers,
  ArrowRight,
  RefreshCw,
  RotateCcw,
  Download,
  Archive,
  Search,
  Filter,
  X,
  Eye,
  Hash,
  ChevronDown,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, isAfter, subDays, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { generateMarksCardPDF } from '@/lib/pdfGenerator';

interface JobCardProps {
  job: GenerationJob;
  onRetry?: (jobId: string) => void;
  onDownload?: (job: GenerationJob) => void;
  onViewDetails?: (jobId: string) => void;
  isDownloading?: boolean;
}

function JobCard({ job, onRetry, onDownload, onViewDetails, isDownloading }: JobCardProps) {
  const progressPercent = Math.round((job.generatedCards / job.totalCards) * 100);
  const isActive = job.status === 'in_progress';
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';

  return (
    <Card className={cn(
      "transition-all",
      isActive && "border-primary/50 bg-primary/5"
    )}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
            isActive && "bg-primary/10",
            isCompleted && "bg-success/10",
            isFailed && "bg-destructive/10",
            job.status === 'pending' && "bg-muted"
          )}>
            {isActive && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
            {isCompleted && <CheckCircle2 className="h-6 w-6 text-success" />}
            {isFailed && <XCircle className="h-6 w-6 text-destructive" />}
            {job.status === 'pending' && <Clock className="h-6 w-6 text-muted-foreground" />}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="font-medium truncate">{job.fileName}</p>
                  {job.batchNumber && job.totalBatches && job.totalBatches > 1 && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      Batch {job.batchNumber}/{job.totalBatches}
                    </Badge>
                  )}
                </div>
                {job.transactionId && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{job.transactionId}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Started {formatDistanceToNow(job.startedAt, { addSuffix: true })}
                </p>
              </div>
              <Badge 
                variant={
                  isActive ? 'default' : 
                  isCompleted ? 'success' : 
                  isFailed ? 'destructive' : 
                  'secondary'
                }
                className="shrink-0"
              >
                {job.status === 'in_progress' && 'Generating'}
                {job.status === 'completed' && 'Completed'}
                {job.status === 'failed' && 'Failed'}
                {job.status === 'pending' && 'Pending'}
              </Badge>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>Cards Generated</span>
                </div>
                <span className="font-mono font-medium">
                  {job.generatedCards} / {job.totalCards}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={progressPercent} 
                  className={cn(
                    "h-3",
                    isCompleted && "[&>div]:bg-success",
                    isFailed && "[&>div]:bg-destructive"
                  )}
                />
                <span 
                  className={cn(
                    "absolute inset-0 flex items-center justify-center text-xs font-medium",
                    progressPercent > 50 ? "text-primary-foreground" : "text-foreground"
                  )}
                >
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Error Message */}
            {isFailed && job.errorMessage && (
              <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">
                {job.errorMessage}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Retry Button for Failed Jobs */}
              {isFailed && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(job.id)}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry Generation
                </Button>
              )}

              {/* View Details Button for Completed Jobs */}
              {isCompleted && onViewDetails && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onViewDetails(job.id)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              )}

              {/* Download Button for Completed Jobs */}
              {isCompleted && onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(job)}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download ZIP
                </Button>
              )}
            </div>

            {/* Completion Time */}
            {job.completedAt && (
              <p className="text-xs text-muted-foreground">
                {isCompleted ? 'Completed' : 'Ended'} on {format(job.completedAt, 'PPp')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock historical batches (simulating previously generated marks cards)
const historicalBatches: GenerationJob[] = [
  {
    id: 'hist_batch_001',
    fileName: 'CS_Semester6_2024_Batch1',
    totalCards: 2500,
    generatedCards: 2500,
    status: 'completed',
    startedAt: new Date('2024-12-20T10:30:00'),
    completedAt: new Date('2024-12-20T10:35:00'),
    transactionId: 'TXN-M4K8J2-XYZ123AB',
    batchNumber: 1,
    totalBatches: 4,
    parentFileName: 'CS_Semester6_2024.xlsx',
  },
  {
    id: 'hist_batch_002',
    fileName: 'CS_Semester6_2024_Batch2',
    totalCards: 2500,
    generatedCards: 2500,
    status: 'completed',
    startedAt: new Date('2024-12-20T10:32:00'),
    completedAt: new Date('2024-12-20T10:37:00'),
    transactionId: 'TXN-M4K8J3-DEF456GH',
    batchNumber: 2,
    totalBatches: 4,
    parentFileName: 'CS_Semester6_2024.xlsx',
  },
  {
    id: 'hist_batch_003',
    fileName: 'ECE_Semester4_2024_Batch1',
    totalCards: 1800,
    generatedCards: 1800,
    status: 'completed',
    startedAt: new Date('2024-12-18T14:00:00'),
    completedAt: new Date('2024-12-18T14:04:00'),
    transactionId: 'TXN-L3J7H1-JKL789MN',
    batchNumber: 1,
    totalBatches: 1,
    parentFileName: 'ECE_Semester4_2024.xlsx',
  },
  {
    id: 'hist_batch_004',
    fileName: 'ME_Semester2_2024_Batch1',
    totalCards: 3000,
    generatedCards: 3000,
    status: 'completed',
    startedAt: new Date('2024-12-15T09:15:00'),
    completedAt: new Date('2024-12-15T09:20:00'),
    transactionId: 'TXN-K2I6G0-OPQ012RS',
    batchNumber: 1,
    totalBatches: 2,
    parentFileName: 'ME_Semester2_2024.xlsx',
  },
  {
    id: 'hist_batch_005',
    fileName: 'ME_Semester2_2024_Batch2',
    totalCards: 1500,
    generatedCards: 1500,
    status: 'completed',
    startedAt: new Date('2024-12-15T09:17:00'),
    completedAt: new Date('2024-12-15T09:22:00'),
    transactionId: 'TXN-K2I6G1-TUV345WX',
    batchNumber: 2,
    totalBatches: 2,
    parentFileName: 'ME_Semester2_2024.xlsx',
  },
];

export default function GenerationStatus() {
  const { jobs, isGenerating, activeJob, retryJob } = useGeneration();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [parentFileFilter, setParentFileFilter] = useState<string>('all');
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Combine current session jobs with historical batches
  const allJobs = [...jobs, ...historicalBatches.filter(h => !jobs.some(j => j.id === h.id))];

  // Get unique parent file names for filter dropdown
  const parentFileNames = useMemo(() => {
    const names = new Set<string>();
    allJobs.forEach(job => {
      if (job.parentFileName) {
        names.add(job.parentFileName);
      }
    });
    return Array.from(names).sort();
  }, [allJobs]);

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        job.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.transactionId && job.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

      // Parent file filter
      const matchesParentFile = parentFileFilter === 'all' || job.parentFileName === parentFileFilter;

      // Date filter
      let matchesDate = true;
      const jobDate = job.completedAt || job.startedAt;
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = isAfter(jobDate, subDays(now, 1));
          break;
        case 'week':
          matchesDate = isAfter(jobDate, subDays(now, 7));
          break;
        case 'month':
          matchesDate = isAfter(jobDate, subMonths(now, 1));
          break;
        case 'all':
        default:
          matchesDate = true;
      }

      return matchesSearch && matchesStatus && matchesDate && matchesParentFile;
    });
  }, [allJobs, searchQuery, statusFilter, dateFilter, parentFileFilter]);

  // Group jobs by parent file name
  const groupedJobs = useMemo(() => {
    const groups = new Map<string, GenerationJob[]>();
    
    filteredJobs.forEach(job => {
      const key = job.parentFileName || job.fileName;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(job);
    });
    
    // Sort batches within each group by batch number
    groups.forEach((jobs, key) => {
      jobs.sort((a, b) => (a.batchNumber || 0) - (b.batchNumber || 0));
    });
    
    // Convert to array and sort groups by most recent
    return Array.from(groups.entries())
      .map(([parentFile, jobs]) => ({
        parentFile,
        jobs,
        totalCards: jobs.reduce((sum, j) => sum + j.totalCards, 0),
        completedCards: jobs.reduce((sum, j) => sum + j.generatedCards, 0),
        allCompleted: jobs.every(j => j.status === 'completed'),
        hasActive: jobs.some(j => j.status === 'in_progress'),
        hasFailed: jobs.some(j => j.status === 'failed'),
        latestDate: Math.max(...jobs.map(j => (j.completedAt || j.startedAt).getTime())),
      }))
      .sort((a, b) => b.latestDate - a.latestDate);
  }, [filteredJobs]);

  const toggleGroup = (parentFile: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(parentFile)) {
        next.delete(parentFile);
      } else {
        next.add(parentFile);
      }
      return next;
    });
  };
  
  const completedJobs = filteredJobs.filter(j => j.status === 'completed');
  const failedJobs = filteredJobs.filter(j => j.status === 'failed');
  const totalGenerated = completedJobs.reduce((sum, j) => sum + j.generatedCards, 0);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setParentFileFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || dateFilter !== 'all' || parentFileFilter !== 'all';

  const handleViewDetails = (jobId: string) => {
    navigate(`/batch/${jobId}`);
  };

  const handleDownloadAll = async () => {
    if (completedJobs.length === 0) {
      toast.error('No completed jobs to download');
      return;
    }

    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const marksCardsFolder = zip.folder('marks-cards');

      // Generate sample marks card data for each completed job
      for (const job of completedJobs) {
        const jobFolder = marksCardsFolder?.folder(job.fileName.replace(/\.[^/.]+$/, ''));
        
        // Generate mock marks card data files
        for (let i = 1; i <= job.generatedCards; i++) {
          const cardData = {
            id: `MC-${job.id.slice(-6)}-${String(i).padStart(4, '0')}`,
            studentName: `Student ${i}`,
            registrationNo: `REG${new Date().getFullYear()}${String(i).padStart(4, '0')}`,
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
            generatedAt: job.completedAt?.toISOString(),
            blockchainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          };

          jobFolder?.file(
            `marks-card-${String(i).padStart(4, '0')}.json`,
            JSON.stringify(cardData, null, 2)
          );
        }

        // Add a summary file for each job
        const summaryData = {
          jobId: job.id,
          fileName: job.fileName,
          totalCards: job.generatedCards,
          generatedAt: job.completedAt?.toISOString(),
          status: job.status,
        };
        jobFolder?.file('_summary.json', JSON.stringify(summaryData, null, 2));
      }

      // Add a manifest file
      const manifest = {
        generatedAt: new Date().toISOString(),
        totalJobs: completedJobs.length,
        totalCards: totalGenerated,
        jobs: completedJobs.map(j => ({
          id: j.id,
          fileName: j.fileName,
          cards: j.generatedCards,
          completedAt: j.completedAt?.toISOString(),
        })),
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // Generate and download the ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `marks-cards-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.zip`);
      
      toast.success(`Downloaded ${totalGenerated} marks cards from ${completedJobs.length} jobs`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate ZIP file');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadJob = async (job: GenerationJob) => {
    if (job.status !== 'completed') return;

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: job.generatedCards, fileName: job.fileName });
    
    try {
      const zip = new JSZip();
      const folderName = job.fileName.replace(/\.[^/.]+$/, '');
      const folder = zip.folder(folderName);

      // Generate PDF marks cards for each student
      for (let i = 1; i <= job.generatedCards; i++) {
        const studentData = {
          id: `MC-${job.id.slice(-6)}-${String(i).padStart(4, '0')}`,
          studentName: `Student ${i}`,
          registrationNo: `REG${new Date().getFullYear()}${String(i).padStart(4, '0')}`,
          rollNo: `R${String(i).padStart(3, '0')}`,
          semester: 'Semester 6',
          academicYear: '2023-2024',
          department: 'Computer Science & Engineering',
          subjects: [
            { code: 'CS601', name: 'Machine Learning', credits: 4, internal: 28, external: 56, total: 84, grade: 'A' },
            { code: 'CS602', name: 'Cloud Computing', credits: 4, internal: 26, external: 52, total: 78, grade: 'B+' },
            { code: 'CS603', name: 'Data Mining', credits: 3, internal: 24, external: 48, total: 72, grade: 'B' },
            { code: 'CS604', name: 'Cyber Security', credits: 3, internal: 27, external: 54, total: 81, grade: 'A' },
          ],
          totalMarks: 315,
          maxMarks: 400,
          percentage: 78.75,
          grade: 'First Class with Distinction',
          blockchainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          issuedAt: job.completedAt || new Date(),
        };

        // Generate PDF using the pdfGenerator utility
        const pdfDoc = generateMarksCardPDF(studentData);
        const pdfBlob = pdfDoc.output('blob');
        
        folder?.file(
          `${studentData.registrationNo}-${studentData.studentName.replace(/\s+/g, '_')}.pdf`,
          pdfBlob
        );

        // Update progress
        setDownloadProgress(prev => ({ ...prev, current: i }));
        
        // Small delay to allow UI to update and prevent blocking
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Finalize ZIP
      setDownloadProgress(prev => ({ ...prev, current: prev.total }));
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}-marks-cards.zip`);
      
      toast.success(`Downloaded ${job.generatedCards} marks cards as PDF`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate PDF files');
    } finally {
      setIsDownloading(false);
      setDownloadProgress({ current: 0, total: 0, fileName: '' });
    }
  };

  return (
    <DashboardLayout
      title="Generation Status"
      subtitle="Track the progress of marks card generation jobs"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold">{isGenerating ? 1 : 0}</p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{failedJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Layers className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalGenerated}</p>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Job */}
        {activeJob && (
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <CardTitle className="text-lg">Currently Generating</CardTitle>
              </div>
              <CardDescription>
                Marks cards are being generated in the background
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobCard job={activeJob} />
            </CardContent>
          </Card>
        )}

        {/* Job History */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Generation History</CardTitle>
                <CardDescription>
                  {hasActiveFilters 
                    ? `Showing ${filteredJobs.length} of ${allJobs.length} batches`
                    : 'All marks card generation jobs'
                  }
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/issue/template')}
                className="gap-2"
              >
                New Generation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by file name or transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                  {parentFileNames.length > 0 && (
                    <Select value={parentFileFilter} onValueChange={setParentFileFilter}>
                      <SelectTrigger className="w-[180px]">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Source File" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Uploads</SelectItem>
                        {parentFileNames.map(name => (
                          <SelectItem key={name} value={name}>
                            {name.length > 20 ? `${name.slice(0, 20)}...` : name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={clearFilters}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                </div>
                {hasActiveFilters ? (
                  <>
                    <h3 className="font-medium text-lg mb-1">No matching batches</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button variant="outline" onClick={clearFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-lg mb-1">No generation jobs yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Upload student data to start generating marks cards
                    </p>
                    <Button onClick={() => navigate('/issue/template')} className="gap-2">
                      Issue Marks Cards
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {groupedJobs.map((group) => {
                    const isExpanded = expandedGroups.has(group.parentFile);
                    const hasSingleBatch = group.jobs.length === 1;
                    
                    // For single batch uploads, show directly without grouping
                    if (hasSingleBatch) {
                      const job = group.jobs[0];
                      if (job.id === activeJob?.id) return null;
                      return (
                        <JobCard 
                          key={job.id} 
                          job={job} 
                          onRetry={retryJob} 
                          onDownload={handleDownloadJob} 
                          onViewDetails={handleViewDetails} 
                          isDownloading={isDownloading} 
                        />
                      );
                    }
                    
                    // For multi-batch uploads, show collapsible group
                    return (
                      <Collapsible key={group.parentFile} open={isExpanded} onOpenChange={() => toggleGroup(group.parentFile)}>
                        <Card className={cn(
                          "transition-all",
                          group.hasActive && "border-primary/50",
                          group.hasFailed && "border-destructive/30"
                        )}>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {isExpanded ? (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                  )}
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FolderOpen className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{group.parentFile}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {group.jobs.length} batches • {group.totalCards.toLocaleString()} total records
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {group.hasActive && (
                                    <Badge variant="default" className="gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Generating
                                    </Badge>
                                  )}
                                  {group.allCompleted && (
                                    <Badge variant="success" className="gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Completed
                                    </Badge>
                                  )}
                                  {group.hasFailed && !group.hasActive && (
                                    <Badge variant="destructive" className="gap-1">
                                      <XCircle className="h-3 w-3" />
                                      Has Failures
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {/* Progress bar for the entire group */}
                              {(group.hasActive || !group.allCompleted) && (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Overall Progress</span>
                                    <span>{group.completedCards.toLocaleString()} / {group.totalCards.toLocaleString()}</span>
                                  </div>
                                  <Progress 
                                    value={(group.completedCards / group.totalCards) * 100} 
                                    className="h-2"
                                  />
                                </div>
                              )}
                            </CardHeader>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2 border-t">
                                {group.jobs
                                  .filter(j => j.id !== activeJob?.id)
                                  .map((job) => (
                                    <JobCard 
                                      key={job.id} 
                                      job={job} 
                                      onRetry={retryJob} 
                                      onDownload={handleDownloadJob} 
                                      onViewDetails={handleViewDetails} 
                                      isDownloading={isDownloading} 
                                    />
                                  ))}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Download Progress Dialog */}
        {isDownloading && downloadProgress.total > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 shadow-lg border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Generating PDFs</CardTitle>
                    <CardDescription className="text-sm truncate max-w-[250px]">
                      {downloadProgress.fileName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {downloadProgress.current} of {downloadProgress.total}
                    </span>
                  </div>
                  <Progress 
                    value={(downloadProgress.current / downloadProgress.total) * 100} 
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {Math.round((downloadProgress.current / downloadProgress.total) * 100)}% complete
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {downloadProgress.current === downloadProgress.total 
                      ? 'Preparing ZIP file...' 
                      : `Generating PDF ${downloadProgress.current}...`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
