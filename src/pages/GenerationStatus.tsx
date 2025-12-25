import { useGeneration, GenerationJob } from '@/contexts/GenerationContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileSpreadsheet, 
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

function JobCard({ job }: { job: GenerationJob }) {
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
  const { jobs, isGenerating, activeJob } = useGeneration();
  const navigate = useNavigate();

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');
  const totalGenerated = completedJobs.reduce((sum, j) => sum + j.generatedCards, 0);

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Generation History</CardTitle>
                <CardDescription>
                  All marks card generation jobs
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
                    <JobCard key={job.id} job={job} />
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
