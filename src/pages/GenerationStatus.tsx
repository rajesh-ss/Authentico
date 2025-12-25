import { useState } from 'react';
import { useGeneration, GenerationJob } from '@/contexts/GenerationContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Archive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

interface JobCardProps {
  job: GenerationJob;
  onRetry?: (jobId: string) => void;
  onDownload?: (job: GenerationJob) => void;
  isDownloading?: boolean;
}

function JobCard({ job, onRetry, onDownload, isDownloading }: JobCardProps) {
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
                </div>
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

export default function GenerationStatus() {
  const { jobs, isGenerating, activeJob, retryJob } = useGeneration();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');
  const totalGenerated = completedJobs.reduce((sum, j) => sum + j.generatedCards, 0);

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
    try {
      const zip = new JSZip();
      const folderName = job.fileName.replace(/\.[^/.]+$/, '');
      const folder = zip.folder(folderName);

      // Generate mock marks card data
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

        folder?.file(
          `marks-card-${String(i).padStart(4, '0')}.json`,
          JSON.stringify(cardData, null, 2)
        );
      }

      // Add summary
      const summaryData = {
        jobId: job.id,
        fileName: job.fileName,
        totalCards: job.generatedCards,
        generatedAt: job.completedAt?.toISOString(),
        status: job.status,
      };
      folder?.file('_summary.json', JSON.stringify(summaryData, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.zip`);
      
      toast.success(`Downloaded ${job.generatedCards} marks cards`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate ZIP file');
    } finally {
      setIsDownloading(false);
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
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Generation History</CardTitle>
                <CardDescription>
                  All marks card generation jobs
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {completedJobs.length > 0 && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleDownloadAll}
                    disabled={isDownloading}
                    className="gap-2"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                    Download All ({totalGenerated} cards)
                  </Button>
                )}
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
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-1">No generation jobs yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Upload student data to start generating marks cards
                </p>
                <Button onClick={() => navigate('/issue/template')} className="gap-2">
                  Issue Marks Cards
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {jobs.filter(j => j.id !== activeJob?.id).map((job) => (
                    <JobCard key={job.id} job={job} onRetry={retryJob} onDownload={handleDownloadJob} isDownloading={isDownloading} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
