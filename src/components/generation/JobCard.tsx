import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileSpreadsheet, 
  Layers,
  RefreshCw,
  RotateCcw,
  Download,
  Eye,
  Hash
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { GenerationJob } from '@/contexts/GenerationContext';

export interface JobCardProps {
  job: GenerationJob;
  onRetry?: (jobId: string) => void;
  onDownload?: (job: GenerationJob) => void;
  onViewDetails?: (jobId: string) => void;
  isDownloading?: boolean;
}

export const JobCard = memo(function JobCard({ 
  job, 
  onRetry, 
  onDownload, 
  onViewDetails, 
  isDownloading 
}: JobCardProps) {
  const progressPercent = Math.round((job.generatedCards / job.totalCards) * 100);
  const isActive = job.status === 'in_progress';
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';

  return (
    <Card className={cn(
      "transition-all",
      isActive && "border-primary/50 bg-primary/5"
    )}>
      <CardContent className="pt-4 md:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          {/* Status Icon */}
          <div className={cn(
            "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0 self-start",
            isActive && "bg-primary/10",
            isCompleted && "bg-success/10",
            isFailed && "bg-destructive/10",
            job.status === 'pending' && "bg-muted"
          )}>
            {isActive && <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-spin" />}
            {isCompleted && <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-success" />}
            {isFailed && <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />}
            {job.status === 'pending' && <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="font-medium truncate text-sm sm:text-base">{job.fileName}</p>
                  {job.batchNumber && job.totalBatches && job.totalBatches > 1 && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      Batch {job.batchNumber}/{job.totalBatches}
                    </Badge>
                  )}
                </div>
                {job.transactionId && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono truncate">{job.transactionId}</span>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">
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
                className="shrink-0 self-start"
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
              <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive">{job.errorMessage}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {isFailed && onRetry && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onRetry(job.id)}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
              )}
              {isCompleted && onDownload && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDownload(job)}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download
                </Button>
              )}
              {isCompleted && onViewDetails && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onViewDetails(job.id)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
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
});