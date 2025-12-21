import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  ArrowRight, 
  Link as LinkIcon, 
  Shield, 
  CheckCircle, 
  Loader2, 
  Hash,
  ExternalLink,
  Copy
} from 'lucide-react';
import { GeneratedCard, IssuanceSession } from '@/types/issuance';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface BlockchainSubmissionProps {
  generatedCards: GeneratedCard[];
  session: IssuanceSession | null;
  onSubmit: (onProgress: (progress: number, hash?: string) => void) => Promise<{ cards: GeneratedCard[]; session: IssuanceSession }>;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function BlockchainSubmission({
  generatedCards,
  session,
  onSubmit,
  onNext,
  onBack,
  isLoading,
}: BlockchainSubmissionProps) {
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [submittedCards, setSubmittedCards] = useState<GeneratedCard[]>([]);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setProgress(0);
    try {
      const result = await onSubmit((p, hash) => {
        setProgress(p);
        if (hash) setCurrentHash(hash);
      });
      setSubmittedCards(result.cards);
      toast({
        title: "Blockchain Registration Complete",
        description: `${result.session.successCount} marks cards registered successfully`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({ title: "Hash copied to clipboard" });
  };

  const confirmedCount = submittedCards.filter(c => c.blockchainStatus === 'confirmed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Blockchain Registration</h2>
        <p className="text-muted-foreground mt-1">
          Register {generatedCards.length} marks cards on the blockchain for immutable verification
        </p>
      </div>

      {submittedCards.length === 0 ? (
        /* Submission Start */
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className={cn(
                  "h-24 w-24 mx-auto rounded-full bg-blockchain/10 flex items-center justify-center",
                  isSubmitting && "animate-pulse"
                )}>
                  <Shield className="h-12 w-12 text-blockchain" />
                </div>
                {isSubmitting && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full border-4 border-blockchain/30 border-t-blockchain animate-spin" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold">
                  {isSubmitting ? 'Registering on Blockchain...' : 'Ready for Blockchain'}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {isSubmitting 
                    ? `Processing ${generatedCards.length} transactions`
                    : `Each marks card will receive a unique transaction hash`
                  }
                </p>
              </div>

              {isSubmitting ? (
                <div className="max-w-md mx-auto space-y-4">
                  <Progress value={progress} className="h-3" />
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting... {Math.round(progress)}%</span>
                  </div>
                  {currentHash && (
                    <div className="p-3 rounded-lg bg-muted/50 font-mono text-xs break-all animate-fade-up">
                      <span className="text-muted-foreground">Latest: </span>
                      {currentHash}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blockchain" />
                      <span>{generatedCards.length} Transactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-success" />
                      <span>SHA-256 Hashing</span>
                    </div>
                  </div>
                  <Button size="lg" variant="blockchain" onClick={handleSubmit}>
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Submit to Blockchain
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Submission Results */
        <div className="space-y-6">
          {/* Summary */}
          <Card variant="success">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-success">
                    Blockchain Registration Complete
                  </h3>
                  <p className="text-muted-foreground">
                    {confirmedCount} of {submittedCards.length} cards registered successfully
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-success">{confirmedCount}</p>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Records</CardTitle>
              <CardDescription>
                All blockchain transactions for this batch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-3">
                  {submittedCards.map((card, index) => (
                    <div
                      key={card.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-mono text-sm">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {card.studentRecord.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {card.studentRecord.registrationNumber}
                        </p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                            {card.transactionHash?.slice(0, 16)}...{card.transactionHash?.slice(-8)}
                          </code>
                          <button
                            onClick={() => card.transactionHash && copyHash(card.transactionHash)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <a
                            href={`https://etherscan.io/tx/${card.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      <Badge
                        variant={
                          card.blockchainStatus === 'confirmed'
                            ? 'confirmed'
                            : card.blockchainStatus === 'failed'
                            ? 'failed'
                            : 'pending'
                        }
                      >
                        {card.blockchainStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={confirmedCount === 0 || isSubmitting || isLoading}
        >
          Complete Issuance
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
