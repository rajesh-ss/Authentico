import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { toast } from 'sonner';

export interface GenerationJob {
  id: string;
  fileName: string;
  totalCards: number;
  generatedCards: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  // New batch-related fields
  transactionId: string;
  batchNumber?: number;
  totalBatches?: number;
  parentFileName?: string;
}

interface BatchGenerationOptions {
  fileName: string;
  totalRecords: number;
  maxRecordsPerBatch?: number;
}

interface GenerationContextType {
  jobs: GenerationJob[];
  activeJob: GenerationJob | null;
  activeJobs: GenerationJob[];
  startGeneration: (fileName: string, totalCards: number) => string;
  startBatchGeneration: (options: BatchGenerationOptions) => string[];
  updateProgress: (jobId: string, generatedCards: number) => void;
  completeJob: (jobId: string) => void;
  failJob: (jobId: string, errorMessage: string) => void;
  retryJob: (jobId: string) => void;
  moveToBackground: () => void;
  isGenerating: boolean;
  showGeneratingOverlay: boolean;
  getJobsByParentFile: (parentFileName: string) => GenerationJob[];
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

const MAX_RECORDS_PER_BATCH = 3000;

// Generate a unique transaction ID
function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `TXN-${timestamp}-${randomPart}`.toUpperCase();
}

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [showGeneratingOverlay, setShowGeneratingOverlay] = useState(false);
  const generationIntervalRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const activeJobs = jobs.filter(job => job.status === 'in_progress');
  const activeJob = activeJobs[0] || null;
  const isGenerating = activeJobs.length > 0;

  const startGeneration = useCallback((fileName: string, totalCards: number): string => {
    const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newJob: GenerationJob = {
      id,
      fileName,
      totalCards,
      generatedCards: 0,
      status: 'in_progress',
      startedAt: new Date(),
      transactionId: generateTransactionId(),
    };
    setJobs(prev => [newJob, ...prev]);
    setShowGeneratingOverlay(true);
    return id;
  }, []);

  const startBatchGeneration = useCallback((options: BatchGenerationOptions): string[] => {
    const { fileName, totalRecords, maxRecordsPerBatch = MAX_RECORDS_PER_BATCH } = options;
    
    // Calculate number of batches needed
    const totalBatches = Math.ceil(totalRecords / maxRecordsPerBatch);
    const jobIds: string[] = [];
    const now = Date.now();
    
    const newJobs: GenerationJob[] = [];
    
    for (let i = 0; i < totalBatches; i++) {
      const batchNumber = i + 1;
      const startIdx = i * maxRecordsPerBatch;
      const batchSize = Math.min(maxRecordsPerBatch, totalRecords - startIdx);
      
      const id = `batch_${now}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      jobIds.push(id);
      
      const batchJob: GenerationJob = {
        id,
        fileName: `${fileName.replace(/\.[^/.]+$/, '')}_Batch${batchNumber}`,
        totalCards: batchSize,
        generatedCards: 0,
        status: 'in_progress',
        startedAt: new Date(),
        transactionId: generateTransactionId(),
        batchNumber,
        totalBatches,
        parentFileName: fileName,
      };
      
      newJobs.push(batchJob);
    }
    
    setJobs(prev => [...newJobs, ...prev]);
    setShowGeneratingOverlay(true);
    
    // Start simulated generation for each batch with staggered start
    newJobs.forEach((job, index) => {
      setTimeout(() => {
        simulateBatchGeneration(job.id, job.totalCards);
      }, index * 500); // Stagger batch starts by 500ms
    });
    
    return jobIds;
  }, []);

  const simulateBatchGeneration = useCallback((jobId: string, totalCards: number) => {
    let generated = 0;
    const interval = setInterval(() => {
      generated += Math.ceil(Math.random() * 50) + 20; // Faster generation for batches
      if (generated >= totalCards) {
        generated = totalCards;
        setJobs(prev =>
          prev.map(job =>
            job.id === jobId ? { ...job, generatedCards: generated } : job
          )
        );
        clearInterval(interval);
        generationIntervalRefs.current.delete(jobId);
        
        // Complete the job (small chance of failure for demo)
        const isFailed = Math.random() > 0.95;
        
        setJobs(prev => {
          const updatedJobs = prev.map(job => {
            if (job.id !== jobId) return job;
            
            if (isFailed) {
              return { 
                ...job, 
                status: 'failed' as const, 
                completedAt: new Date(), 
                errorMessage: 'Network error during blockchain verification' 
              };
            } else {
              return { 
                ...job, 
                status: 'completed' as const, 
                completedAt: new Date(), 
                generatedCards: totalCards 
              };
            }
          });
          
          // Get the job that just finished
          const finishedJob = updatedJobs.find(j => j.id === jobId);
          const batchLabel = finishedJob?.batchNumber 
            ? `Batch ${finishedJob.batchNumber}/${finishedJob.totalBatches}` 
            : finishedJob?.fileName || 'Batch';
          
          // Show toast notification
          if (isFailed) {
            toast.error(`${batchLabel} failed to generate`, {
              description: 'Network error during blockchain verification. You can retry this batch.',
            });
          } else {
            toast.success(`${batchLabel} generated successfully`, {
              description: `${totalCards.toLocaleString()} marks cards verified on blockchain.`,
            });
          }
          
          // Check if all batches from the same parent file are done
          if (finishedJob?.parentFileName) {
            const siblingJobs = updatedJobs.filter(j => j.parentFileName === finishedJob.parentFileName);
            const allCompleted = siblingJobs.every(j => j.status === 'completed' || j.status === 'failed');
            
            if (allCompleted) {
              const successCount = siblingJobs.filter(j => j.status === 'completed').length;
              const failedCount = siblingJobs.filter(j => j.status === 'failed').length;
              const totalCards = siblingJobs.reduce((sum, j) => sum + j.totalCards, 0);
              
              if (failedCount === 0) {
                toast.success(`All ${successCount} batches completed!`, {
                  description: `${totalCards.toLocaleString()} marks cards from "${finishedJob.parentFileName}" are now verified.`,
                });
              } else if (successCount === 0) {
                toast.error(`All ${failedCount} batches failed`, {
                  description: `Please retry the failed batches for "${finishedJob.parentFileName}".`,
                });
              } else {
                toast.warning(`Batch generation partially complete`, {
                  description: `${successCount} succeeded, ${failedCount} failed for "${finishedJob.parentFileName}".`,
                });
              }
            }
          }
          
          return updatedJobs;
        });
        
        // Hide overlay if no more active jobs
        setJobs(prevJobs => {
          const stillActive = prevJobs.some(j => j.id !== jobId && j.status === 'in_progress');
          if (!stillActive) {
            setShowGeneratingOverlay(false);
          }
          return prevJobs;
        });
      } else {
        setJobs(prev =>
          prev.map(job =>
            job.id === jobId ? { ...job, generatedCards: generated } : job
          )
        );
      }
    }, 150);
    
    generationIntervalRefs.current.set(jobId, interval);
  }, []);

  const updateProgress = useCallback((jobId: string, generatedCards: number) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === jobId ? { ...job, generatedCards } : job
      )
    );
  }, []);

  const completeJob = useCallback((jobId: string) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'completed', completedAt: new Date(), generatedCards: job.totalCards }
          : job
      )
    );
    
    // Check if any jobs still active
    setJobs(prevJobs => {
      const stillActive = prevJobs.some(j => j.status === 'in_progress');
      if (!stillActive) {
        setShowGeneratingOverlay(false);
      }
      return prevJobs;
    });
  }, []);

  const failJob = useCallback((jobId: string, errorMessage: string) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'failed', completedAt: new Date(), errorMessage }
          : job
      )
    );
    
    // Check if any jobs still active
    setJobs(prevJobs => {
      const stillActive = prevJobs.some(j => j.status === 'in_progress');
      if (!stillActive) {
        setShowGeneratingOverlay(false);
      }
      return prevJobs;
    });
  }, []);

  const retryJob = useCallback((jobId: string) => {
    const jobToRetry = jobs.find(j => j.id === jobId);
    if (!jobToRetry || jobToRetry.status !== 'failed') return;

    // Reset the job state
    setJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? { 
              ...job, 
              status: 'in_progress', 
              generatedCards: 0, 
              startedAt: new Date(),
              completedAt: undefined,
              errorMessage: undefined
            }
          : job
      )
    );
    setShowGeneratingOverlay(true);

    // Simulate generation progress
    simulateBatchGeneration(jobId, jobToRetry.totalCards);
  }, [jobs, simulateBatchGeneration]);

  const moveToBackground = useCallback(() => {
    setShowGeneratingOverlay(false);
  }, []);

  const getJobsByParentFile = useCallback((parentFileName: string) => {
    return jobs.filter(job => job.parentFileName === parentFileName);
  }, [jobs]);

  return (
    <GenerationContext.Provider
      value={{
        jobs,
        activeJob,
        activeJobs,
        startGeneration,
        startBatchGeneration,
        updateProgress,
        completeJob,
        failJob,
        retryJob,
        moveToBackground,
        isGenerating,
        showGeneratingOverlay,
        getJobsByParentFile,
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
}
