import React, { memo, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Layers,
  Package,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Hash,
  AlertTriangle,
  RefreshCw,
  PartyPopper,
  Info,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GenerationJob, useGeneration } from '@/contexts/GenerationContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { UploadBatch } from '@/services/upload.service';

const MAX_RECORDS_PER_BATCH = 3000;

interface BatchInfo {
  batchNumber: number;
  recordCount: number;
}

interface BatchConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  totalRecords: number;
  onConfirm: () => void;
  onNavigateToMarksCards: () => void;
  isGenerating: boolean;
  isCommitting?: boolean;
  activeJobs: GenerationJob[];
  batches?: UploadBatch[];
  onCommitBatch?: (uploadId: string) => void;
  committingBatchIds?: string[];
  committedBatchIds?: string[];
}

export const BatchConfirmationDialog = memo(function BatchConfirmationDialog({
  open,
  onOpenChange,
  fileName,
  totalRecords,
  onConfirm,
  onNavigateToMarksCards,
  isGenerating,
  isCommitting = false,
  activeJobs,
  batches: propBatches,
  onCommitBatch,
  committingBatchIds = [],
  committedBatchIds = [],
}: BatchConfirmationDialogProps) {
  const { retryJob } = useGeneration();
  // Use totalRecords from props OR calculate from jobs if data was cleared
  const effectiveTotalRecords = useMemo(() => {
    if (totalRecords > 0) return totalRecords;
    return activeJobs.reduce((sum, job) => sum + job.totalCards, 0);
  }, [totalRecords, activeJobs]);

  // Use fileName from props OR get from first job's parentFileName
  const effectiveFileName = useMemo(() => {
    if (fileName && fileName !== 'Unknown') return fileName;
    return activeJobs[0]?.parentFileName || activeJobs[0]?.fileName || 'Unknown';
  }, [fileName, activeJobs]);

  // Calculate batch breakdown
  const batches = useMemo((): BatchInfo[] => {
    // If we have active jobs, use their batch info
    if (activeJobs.length > 0) {
      return activeJobs
        .map((job) => ({
          batchNumber: job.batchNumber || 1,
          recordCount: job.totalCards,
        }))
        .sort((a, b) => a.batchNumber - b.batchNumber);
    }

    // Otherwise calculate from totalRecords
    const totalBatches = Math.ceil(effectiveTotalRecords / MAX_RECORDS_PER_BATCH);
    const result: BatchInfo[] = [];

    for (let i = 0; i < totalBatches; i++) {
      const startIdx = i * MAX_RECORDS_PER_BATCH;
      const batchSize = Math.min(MAX_RECORDS_PER_BATCH, effectiveTotalRecords - startIdx);
      result.push({
        batchNumber: i + 1,
        recordCount: batchSize,
      });
    }

    return result;
  }, [effectiveTotalRecords, activeJobs]);

  // Get corresponding job for each batch
  const getJobForBatch = (batchNumber: number): GenerationJob | undefined => {
    return activeJobs.find((job) => job.batchNumber === batchNumber);
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (activeJobs.length === 0) return 0;
    const totalGenerated = activeJobs.reduce((sum, job) => sum + job.generatedCards, 0);
    const totalCards = activeJobs.reduce((sum, job) => sum + job.totalCards, 0);
    return totalCards > 0 ? Math.round((totalGenerated / totalCards) * 100) : 0;
  }, [activeJobs]);

  const completedJobs = activeJobs.filter((job) => job.status === 'completed');
  const failedJobs = activeJobs.filter((job) => job.status === 'failed');
  const inProgressJobs = activeJobs.filter((job) => job.status === 'in_progress');

  const allCompleted = activeJobs.length > 0 && inProgressJobs.length === 0;
  const hasFailures = failedJobs.length > 0;
  const allSuccess = allCompleted && !hasFailures;
  const partialSuccess = allCompleted && hasFailures && completedJobs.length > 0;
  const allFailed = allCompleted && completedJobs.length === 0 && failedJobs.length > 0;

  // Show toast when generation completes
  useEffect(() => {
    if (!open || !allCompleted || activeJobs.length === 0) return;

    const totalGeneratedCards = completedJobs.reduce((sum, j) => sum + j.totalCards, 0);

    if (allSuccess) {
      toast.success('All batches generated successfully!', {
        description: `${totalGeneratedCards.toLocaleString()} marks cards are now verified on blockchain.`,
        icon: <PartyPopper className="h-5 w-5" />,
      });
    } else if (allFailed) {
      toast.error('All batches failed to generate', {
        description: 'Please check the errors and retry the failed batches.',
        icon: <XCircle className="h-5 w-5" />,
      });
    } else if (partialSuccess) {
      toast.warning('Batch generation partially complete', {
        description: `${completedJobs.length} succeeded, ${failedJobs.length} failed. You can retry failed batches.`,
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    }
  }, [
    open,
    allCompleted,
    allSuccess,
    allFailed,
    partialSuccess,
    completedJobs,
    failedJobs,
    activeJobs.length,
  ]);

  const allCommitted = useMemo(() => {
    return (
      propBatches &&
      propBatches.length > 0 &&
      propBatches.every((b) => committedBatchIds.includes(b.uploadId))
    );
  }, [propBatches, committedBatchIds]);

  // Render success/failure summary screen
  const renderCompletionSummary = () => {
    // If in commit mode
    if (batches && batches.length > 0) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6 rounded-lg bg-success/10">
            <div className="relative">
              <CheckCircle2 className="h-16 w-16 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-success">All Batches Committed!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {batches.length} batches have been submitted for processing.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{effectiveFileName}</p>
              <p className="text-sm text-muted-foreground">
                {effectiveTotalRecords.toLocaleString()} total records
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {batches.length} Batches
            </Badge>
          </div>
        </div>
      );
    }

    const totalGeneratedCards = completedJobs.reduce((sum, j) => sum + j.totalCards, 0);

    return (
      <div className="space-y-4">
        {/* Success/Failure Icon and Message */}
        <div
          className={cn(
            'flex flex-col items-center justify-center py-6 rounded-lg',
            allSuccess && 'bg-success/10',
            allFailed && 'bg-destructive/10',
            partialSuccess && 'bg-warning/10'
          )}
        >
          {allSuccess && (
            <>
              <div className="relative">
                <CheckCircle2 className="h-16 w-16 text-success" />
                <PartyPopper className="h-6 w-6 text-success absolute -top-1 -right-1" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-success">
                All Batches Generated Successfully!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {totalGeneratedCards.toLocaleString()} marks cards verified on blockchain
              </p>
            </>
          )}
          {allFailed && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <h3 className="mt-4 text-lg font-semibold text-destructive">Generation Failed</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All {failedJobs.length} batches failed to generate. Please retry.
              </p>
            </>
          )}
          {partialSuccess && (
            <>
              <AlertTriangle className="h-16 w-16 text-warning" />
              <h3 className="mt-4 text-lg font-semibold text-warning">Partially Complete</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {completedJobs.length} succeeded • {failedJobs.length} failed
              </p>
            </>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">{propBatches?.length || batches.length}</p>
            <p className="text-xs text-muted-foreground">Total Batches</p>
          </div>
          <div className="p-3 rounded-lg bg-success/10 text-center">
            <p className="text-2xl font-bold text-success">{completedJobs.length}</p>
            <p className="text-xs text-muted-foreground">Succeeded</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 text-center">
            <p className="text-2xl font-bold text-destructive">{failedJobs.length}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>

        {/* File Info */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{effectiveFileName}</p>
            <p className="text-sm text-muted-foreground">
              {effectiveTotalRecords.toLocaleString()} total records
            </p>
          </div>
        </div>

        {/* Failed Batches List (if any) */}
        {hasFailures && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              Failed Batches
            </p>
            <ScrollArea className="h-[100px]">
              <div className="space-y-2">
                {failedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-2 rounded-lg border border-destructive/50 bg-destructive/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium">Batch {job.batchNumber}</span>
                        <Badge variant="outline" className="text-xs">
                          {job.totalCards.toLocaleString()} records
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1"
                        onClick={() => retryJob(job.id)}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </Button>
                    </div>
                    {/* Error details inline */}
                    <div className="flex items-start gap-2 text-xs bg-destructive/10 rounded p-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[300px]">
                            <p className="font-medium">Error Details</p>
                            <p className="text-muted-foreground">
                              {job.errorMessage || 'Unknown error occurred'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex-1 min-w-0">
                        <p className="text-destructive font-medium truncate">
                          {job.errorMessage || 'Unknown error occurred'}
                        </p>
                        <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>
                            {job.completedAt
                              ? format(new Date(job.completedAt), 'MMM d, yyyy h:mm:ss a')
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isGenerating || ((isCommitting || committingBatchIds.length > 0) && !allCommitted) ? (
              <>
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                {isCommitting || committingBatchIds.length > 0
                  ? 'Committing Batches...'
                  : 'Generating Marks Cards'}
              </>
            ) : allSuccess || allCommitted ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                {allCommitted ? 'Commit Complete' : 'Generation Complete'}
              </>
            ) : allFailed ? (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Generation Failed
              </>
            ) : partialSuccess ? (
              <>
                <AlertTriangle className="h-5 w-5 text-warning" />
                Partially Complete
              </>
            ) : (
              <>
                <Layers className="h-5 w-5 text-primary" />
                Batch Generation Preview
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {allCommitted
              ? 'All batches have been successfully committed for processing.'
              : isGenerating
                ? 'Please wait while marks cards are being generated for each batch.'
                : isCommitting || committingBatchIds.length > 0
                  ? 'Please wait while we commit your batches for processing.'
                  : allSuccess
                    ? 'All batches have been successfully generated and verified.'
                    : allFailed
                      ? 'All batches failed to generate. You can retry them.'
                      : partialSuccess
                        ? 'Some batches completed while others failed.'
                        : `Your data will be split into ${propBatches?.length || batches.length} batch${(propBatches?.length || batches.length) > 1 ? 'es' : ''} (max ${MAX_RECORDS_PER_BATCH.toLocaleString()} records per batch).`}
          </DialogDescription>
        </DialogHeader>

        {/* Show completion summary when done */}
        {(allCompleted && activeJobs.length > 0) || allCommitted ? (
          renderCompletionSummary()
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{effectiveFileName}</p>
                <p className="text-sm text-muted-foreground">
                  {effectiveTotalRecords.toLocaleString()} total records
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {batches.length} Batch{batches.length > 1 ? 'es' : ''}
              </Badge>
            </div>

            {/* Overall Progress (when generating) */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            )}

            {/* Batch List */}
            <ScrollArea className="h-[200px] pr-4 hidden">
              <div className="space-y-3">
                {batches.map((batch) => {
                  const job = getJobForBatch(batch.batchNumber);
                  const progress = job
                    ? Math.round((job.generatedCards / job.totalCards) * 100)
                    : 0;
                  const isActive = job?.status === 'in_progress';
                  const isCompleted = job?.status === 'completed';
                  const isFailed = job?.status === 'failed';

                  return (
                    <div
                      key={batch.batchNumber}
                      className={cn(
                        'p-3 rounded-lg border transition-colors',
                        isActive && 'border-primary/50 bg-primary/5',
                        isCompleted && 'border-success/50 bg-success/5',
                        isFailed && 'border-destructive/50 bg-destructive/5',
                        !job && 'border-border'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Batch {batch.batchNumber}</span>
                          <Badge variant="outline" className="text-xs">
                            {batch.recordCount.toLocaleString()} records
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                          {isCompleted && <CheckCircle2 className="h-4 w-4 text-success" />}
                          {isFailed && <XCircle className="h-4 w-4 text-destructive" />}
                        </div>
                      </div>

                      {/* Transaction ID */}
                      {job?.transactionId && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <Hash className="h-3 w-3" />
                          <span className="font-mono">{job.transactionId}</span>
                        </div>
                      )}

                      {/* Progress Bar (when generating) */}
                      {job && (
                        <div className="space-y-1">
                          <Progress
                            value={progress}
                            className={cn(
                              'h-1.5',
                              isCompleted && '[&>div]:bg-success',
                              isFailed && '[&>div]:bg-destructive'
                            )}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {job.generatedCards.toLocaleString()} /{' '}
                              {job.totalCards.toLocaleString()}
                            </span>
                            <span>{progress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {!isGenerating && !allCompleted && !allCommitted && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onConfirm} className="gap-2">
                Commit All Batches
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {(isGenerating || allCompleted || allCommitted) && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating || committingBatchIds.length > 0}
              >
                {isGenerating || committingBatchIds.length > 0 ? 'Continue in Background' : 'Close'}
              </Button>
              <Button
                onClick={onNavigateToMarksCards}
                className="gap-2"
                disabled={isGenerating || committingBatchIds.length > 0}
              >
                View All Batches
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
