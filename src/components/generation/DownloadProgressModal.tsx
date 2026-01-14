import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Archive } from 'lucide-react';

export interface DownloadProgress {
  current: number;
  total: number;
  fileName: string;
}

interface DownloadProgressModalProps {
  progress: DownloadProgress;
  isVisible: boolean;
}

export const DownloadProgressModal = memo(function DownloadProgressModal({ 
  progress, 
  isVisible 
}: DownloadProgressModalProps) {
  if (!isVisible || progress.total === 0) return null;

  const percentComplete = Math.round((progress.current / progress.total) * 100);

  return (
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
                {progress.fileName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {progress.current} of {progress.total}
              </span>
            </div>
            <Progress value={percentComplete} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {percentComplete}% complete
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {progress.current === progress.total 
                ? 'Preparing ZIP file...' 
                : `Generating PDF ${progress.current}...`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});