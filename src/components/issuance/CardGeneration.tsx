import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ArrowRight, Sparkles, FileText, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { GeneratedCard, StudentRecord } from '@/types/issuance';
import { cn } from '@/lib/utils';

interface CardGenerationProps {
  studentRecords: StudentRecord[];
  generatedCards: GeneratedCard[];
  onGenerate: (onProgress: (progress: number) => void) => Promise<GeneratedCard[]>;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function CardGeneration({
  studentRecords,
  generatedCards,
  onGenerate,
  onNext,
  onBack,
  isLoading,
}: CardGenerationProps) {
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCard, setSelectedCard] = useState<GeneratedCard | null>(null);

  const validRecords = studentRecords.filter((r) => r.isValid);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    try {
      await onGenerate((p) => setProgress(p));
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (generatedCards.length > 0 && !selectedCard) {
      setSelectedCard(generatedCards[0]);
    }
  }, [generatedCards, selectedCard]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Generate Marks Cards</h2>
        <p className="text-muted-foreground mt-1">
          Generate PDF marks cards with QR codes for {validRecords.length} students
        </p>
      </div>

      {generatedCards.length === 0 ? (
        /* Generation Start */
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Ready to Generate</h3>
                <p className="text-muted-foreground mt-1">
                  {validRecords.length} marks cards will be generated with unique QR codes
                </p>
              </div>

              {isGenerating ? (
                <div className="max-w-md mx-auto space-y-4">
                  <Progress value={progress} className="h-3" />
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating... {Math.round(progress)}%</span>
                  </div>
                </div>
              ) : (
                <Button size="lg" onClick={handleGenerate}>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Generation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Generated Cards */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cards List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Cards
              </CardTitle>
              <CardDescription>
                {generatedCards.length} cards generated successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {generatedCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        selectedCard?.id === card.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-success/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {card.studentRecord.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {card.studentRecord.registrationNumber}
                          </p>
                        </div>
                        <Badge
                          variant={card.status === 'generated' ? 'success' : 'warning'}
                          className="ml-auto"
                        >
                          {card.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Card Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Card Preview</CardTitle>
              <CardDescription>
                Preview the generated marks card with QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCard ? (
                <div className="space-y-6">
                  {/* Marks Card Preview */}
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-background to-muted/30">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <Badge variant="success" className="mb-2">
                          Blockchain Verified
                        </Badge>
                        <h3 className="text-xl font-bold">
                          {selectedCard.studentRecord.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {selectedCard.studentRecord.registrationNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <img
                          src={selectedCard.qrCode}
                          alt="QR Code"
                          className="h-24 w-24 rounded border"
                        />
                        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                          <QrCode className="h-3 w-3" />
                          Scan to verify
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Semester</p>
                        <p className="font-semibold">
                          {selectedCard.studentRecord.semester}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Academic Year</p>
                        <p className="font-semibold">
                          {selectedCard.studentRecord.academicYear || '2023-24'}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Total Marks</p>
                        <p className="font-semibold">
                          {selectedCard.studentRecord.totalMarks}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10">
                        <p className="text-xs text-muted-foreground">Grade</p>
                        <p className="font-bold text-primary text-xl">
                          {selectedCard.studentRecord.grade}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Percentage: {selectedCard.studentRecord.percentage}%
                      </span>
                      <Badge variant="issued">Version 1</Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <QrCode className="h-4 w-4 mr-2" />
                      Download QR
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a card to preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={generatedCards.length === 0 || isGenerating || isLoading}
        >
          Submit to Blockchain
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
