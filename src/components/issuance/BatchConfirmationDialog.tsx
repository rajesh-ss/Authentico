import React, { memo, useMemo } from 'react';
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
import { 
  Layers, 
  Package, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GenerationJob } from '@/contexts/GenerationContext';

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
  activeJobs: GenerationJob[];
}

export const BatchConfirmationDialog = memo(function BatchConfirmationDialog({
  open,
  onOpenChange,
  fileName,
  totalRecords,
  onConfirm,
  onNavigateToMarksCards,
  isGenerating,
  activeJobs,
}: BatchConfirmationDialogProps) {
  // Calculate batch breakdown
  const batches = useMemo((): BatchInfo[] => {
    const totalBatches = Math.ceil(totalRecords / MAX_RECORDS_PER_BATCH);
    const result: BatchInfo[] = [];
    
    for (let i = 0; i < totalBatches; i++) {
      const startIdx = i * MAX_RECORDS_PER_BATCH;
      const batchSize = Math.min(MAX_RECORDS_PER_BATCH, totalRecords - startIdx);
      result.push({
        batchNumber: i + 1,
        recordCount: batchSize,
      });
    }
    
    return result;
  }, [totalRecords]);

  // Get corresponding job for each batch
  const getJobForBatch = (batchNumber: number): GenerationJob | undefined => {
    return activeJobs.find(job => job.batchNumber === batchNumber);
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (activeJobs.length === 0) return 0;
    const totalGenerated = activeJobs.reduce((sum, job) => sum + job.generatedCards, 0);
    const totalCards = activeJobs.reduce((sum, job) => sum + job.totalCards, 0);
    return totalCards > 0 ? Math.round((totalGenerated / totalCards) * 100) : 0;
  }, [activeJobs]);

  const allCompleted = activeJobs.length > 0 && activeJobs.every(job => job.status === 'completed');
  const hasFailed = activeJobs.some(job => job.status === 'failed');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                Generating Marks Cards
              </>
            ) : allCompleted ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                Generation Complete
              </>
            ) : (
              <>
                <Layers className="h-5 w-5 text-primary" />
                Batch Generation Preview
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isGenerating 
              ? 'Please wait while marks cards are being generated for each batch.'
              : allCompleted
              ? 'All batches have been successfully generated.'
              : `Your data will be split into ${batches.length} batch${batches.length > 1 ? 'es' : ''} (max ${MAX_RECORDS_PER_BATCH.toLocaleString()} records per batch).`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{fileName}</p>
              <p className="text-sm text-muted-foreground">
                {totalRecords.toLocaleString()} total records
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
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {batches.map((batch) => {
                const job = getJobForBatch(batch.batchNumber);
                const progress = job ? Math.round((job.generatedCards / job.totalCards) * 100) : 0;
                const isActive = job?.status === 'in_progress';
                const isCompleted = job?.status === 'completed';
                const isFailed = job?.status === 'failed';

                return (
                  <div 
                    key={batch.batchNumber}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      isActive && "border-primary/50 bg-primary/5",
                      isCompleted && "border-success/50 bg-success/5",
                      isFailed && "border-destructive/50 bg-destructive/5",
                      !job && "border-border"
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
                            "h-1.5",
                            isCompleted && "[&>div]:bg-success",
                            isFailed && "[&>div]:bg-destructive"
                          )}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {job.generatedCards.toLocaleString()} / {job.totalCards.toLocaleString()}
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

        <DialogFooter className="gap-2 sm:gap-0">
          {!isGenerating && !allCompleted && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onConfirm} className="gap-2">
                Generate All Batches
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {(isGenerating || allCompleted || hasFailed) && (
            <>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                {isGenerating ? 'Continue in Background' : 'Close'}
              </Button>
              <Button onClick={onNavigateToMarksCards} className="gap-2">
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
