import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

export interface GenerationJob {
  id: string;
  fileName: string;
  totalCards: number;
  generatedCards: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

interface GenerationContextType {
  jobs: GenerationJob[];
  activeJob: GenerationJob | null;
  startGeneration: (fileName: string, totalCards: number) => string;
  updateProgress: (jobId: string, generatedCards: number) => void;
  completeJob: (jobId: string) => void;
  failJob: (jobId: string, errorMessage: string) => void;
  retryJob: (jobId: string) => void;
  moveToBackground: () => void;
  isGenerating: boolean;
  showGeneratingOverlay: boolean;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [showGeneratingOverlay, setShowGeneratingOverlay] = useState(false);
  const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeJob = jobs.find(job => job.status === 'in_progress') || null;
  const isGenerating = activeJob !== null;

  const startGeneration = useCallback((fileName: string, totalCards: number): string => {
    const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newJob: GenerationJob = {
      id,
      fileName,
      totalCards,
      generatedCards: 0,
      status: 'in_progress',
      startedAt: new Date(),
    };
    setJobs(prev => [newJob, ...prev]);
    setShowGeneratingOverlay(true);
    return id;
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
    setShowGeneratingOverlay(false);
  }, []);

  const failJob = useCallback((jobId: string, errorMessage: string) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'failed', completedAt: new Date(), errorMessage }
          : job
      )
    );
    setShowGeneratingOverlay(false);
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
    let generated = 0;
    const interval = setInterval(() => {
      generated += Math.ceil(Math.random() * 3) + 1;
      if (generated >= jobToRetry.totalCards) {
        generated = jobToRetry.totalCards;
        setJobs(prev =>
          prev.map(job =>
            job.id === jobId ? { ...job, generatedCards: generated } : job
          )
        );
        clearInterval(interval);
        generationIntervalRef.current = null;
        
        // Complete successfully on retry (no random failure)
        setJobs(prev =>
          prev.map(job =>
            job.id === jobId
              ? { ...job, status: 'completed', completedAt: new Date(), generatedCards: jobToRetry.totalCards }
              : job
          )
        );
        setShowGeneratingOverlay(false);
      } else {
        setJobs(prev =>
          prev.map(job =>
            job.id === jobId ? { ...job, generatedCards: generated } : job
          )
        );
      }
    }, 200);
    
    generationIntervalRef.current = interval;
  }, [jobs]);

  const moveToBackground = useCallback(() => {
    setShowGeneratingOverlay(false);
  }, []);

  return (
    <GenerationContext.Provider
      value={{
        jobs,
        activeJob,
        startGeneration,
        updateProgress,
        completeJob,
        failJob,
        retryJob,
        moveToBackground,
        isGenerating,
        showGeneratingOverlay,
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
