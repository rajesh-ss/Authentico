import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, PartyPopper, FileText, Users, ExternalLink, Plus 
} from 'lucide-react';
import { GenerationJob } from '@/contexts/GenerationContext';

interface SuccessScreenProps {
  job: GenerationJob;
  onNewIssuance: () => void;
  onViewBatch: () => void;
}

export const SuccessScreen = React.memo(function SuccessScreen({ 
  job, 
  onNewIssuance, 
  onViewBatch 
}: SuccessScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full text-center">
        <CardContent className="pt-10 pb-8 px-8">
          {/* Success Icon with Animation */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Generation Complete!</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Your marks cards have been successfully generated and are ready for distribution.
          </p>

          {/* Stats */}
          <div className="bg-muted/50 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                File Name
              </span>
              <span className="font-medium text-foreground">{job.fileName}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Cards Generated
              </span>
              <Badge variant="success" className="font-mono">
                {job.totalCards} cards
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Blockchain Status
              </span>
              <Badge variant="outline" className="gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Verified
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={onViewBatch}
            >
              <ExternalLink className="h-4 w-4" />
              View Batch Details
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={onNewIssuance}
            >
              <Plus className="h-4 w-4" />
              Issue More Cards
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

interface GeneratingScreenProps {
  fileName: string;
  generatedCards: number;
  totalCards: number;
}

export const GeneratingScreen = React.memo(function GeneratingScreen({
  fileName,
  generatedCards,
  totalCards,
}: GeneratingScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-3 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">Generating Marks Cards</h2>
          <p className="text-muted-foreground mb-6">
            Please wait while we generate and verify your marks cards on the blockchain.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">File</span>
              <span className="font-medium">{fileName}</span>
            </div>
            <Progress 
              value={(generatedCards / totalCards) * 100} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono font-medium">
                {generatedCards} / {totalCards} cards
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
