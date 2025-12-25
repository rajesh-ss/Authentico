import { useGeneration } from '@/contexts/GenerationContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileCheck2, Layers, ArrowRight, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GeneratingOverlay() {
  const { activeJob, showGeneratingOverlay, moveToBackground } = useGeneration();
  const navigate = useNavigate();

  if (!showGeneratingOverlay || !activeJob) return null;

  const progressPercent = Math.round((activeJob.generatedCards / activeJob.totalCards) * 100);

  const handleContinueInBackground = () => {
    moveToBackground();
    navigate('/generation-status');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 border-primary/20 shadow-2xl animate-scale-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 relative">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
              <FileCheck2 className="h-4 w-4 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Generating Marks Cards</CardTitle>
          <CardDescription className="text-base">
            Please wait while we generate marks cards from your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Info */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>Processing: <span className="font-medium text-foreground">{activeJob.fileName}</span></span>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono font-medium">
                {activeJob.generatedCards} / {activeJob.totalCards}
              </span>
            </div>
            <div className="relative">
              <Progress value={progressPercent} className="h-4" />
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

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="gap-2 px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Generating...
            </Badge>
          </div>

          {/* Animation Cards Preview */}
          <div className="flex justify-center gap-2 py-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-12 w-9 rounded border-2 border-primary/30 bg-primary/5"
                style={{
                  animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-2 space-y-3">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleContinueInBackground}
            >
              <Minimize2 className="h-4 w-4" />
              Generate in Background
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Continue working while marks cards are generated
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
