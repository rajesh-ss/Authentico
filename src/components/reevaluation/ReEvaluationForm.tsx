import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  RefreshCcw,
  Loader2,
  X,
  File
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarksCardOption, SubjectOption, ReEvaluationFormData } from '@/types/reevaluation';

interface ReEvaluationFormProps {
  marksCards: MarksCardOption[];
  onSubmit: (data: ReEvaluationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ReEvaluationForm({ marksCards, onSubmit, isLoading }: ReEvaluationFormProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCard = marksCards.find((c) => c.id === selectedCardId);

  const handleSubjectToggle = (code: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
    setErrors((prev) => ({ ...prev, subjects: '' }));
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCardId) {
      newErrors.card = 'Please select a marks card';
    }
    if (selectedSubjects.length === 0) {
      newErrors.subjects = 'Please select at least one subject';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for re-evaluation';
    } else if (reason.trim().length < 50) {
      newErrors.reason = 'Reason must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      marksCardId: selectedCardId,
      subjects: selectedSubjects,
      reason: reason.trim(),
      supportingDocuments: files,
    });
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Select Marks Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              1
            </span>
            Select Marks Card
          </CardTitle>
          <CardDescription>
            Choose the semester marks card you want to re-evaluate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCardId} onValueChange={(value) => {
            setSelectedCardId(value);
            setSelectedSubjects([]);
            setErrors((prev) => ({ ...prev, card: '' }));
          }}>
            <SelectTrigger className={cn(errors.card && "border-destructive")}>
              <SelectValue placeholder="Select a marks card" />
            </SelectTrigger>
            <SelectContent>
              {marksCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.semester} - {card.academicYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.card && (
            <p className="text-sm text-destructive mt-2">{errors.card}</p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Select Subjects */}
      <Card className={cn(!selectedCard && "opacity-50 pointer-events-none")}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              2
            </span>
            Select Subjects
          </CardTitle>
          <CardDescription>
            Choose the subjects you want to get re-evaluated
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedCard ? (
            <div className="space-y-3">
              {selectedCard.subjects.map((subject) => (
                <div
                  key={subject.code}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                    selectedSubjects.includes(subject.code)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleSubjectToggle(subject.code)}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedSubjects.includes(subject.code)}
                      onCheckedChange={() => handleSubjectToggle(subject.code)}
                    />
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">{subject.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{subject.currentMarks}/{subject.maxMarks}</p>
                      <p className="text-xs text-muted-foreground">Current Marks</p>
                    </div>
                    <Badge variant="outline">{subject.grade}</Badge>
                  </div>
                </div>
              ))}
              {errors.subjects && (
                <p className="text-sm text-destructive">{errors.subjects}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a marks card to see subjects</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Reason */}
      <Card className={cn(selectedSubjects.length === 0 && "opacity-50 pointer-events-none")}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              3
            </span>
            Reason for Re-Evaluation
          </CardTitle>
          <CardDescription>
            Explain why you believe the marks should be re-evaluated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setErrors((prev) => ({ ...prev, reason: '' }));
            }}
            placeholder="Provide a detailed explanation of why you are requesting re-evaluation. Include specific points about your answers that you believe deserve higher marks..."
            className={cn("min-h-[150px]", errors.reason && "border-destructive")}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">
              Minimum 50 characters
            </p>
            <p className={cn(
              "text-sm",
              reason.length < 50 ? "text-muted-foreground" : "text-success"
            )}>
              {reason.length}/50
            </p>
          </div>
          {errors.reason && (
            <p className="text-sm text-destructive mt-2">{errors.reason}</p>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Supporting Documents */}
      <Card className={cn(!reason.trim() && "opacity-50 pointer-events-none")}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              4
            </span>
            Supporting Documents
            <Badge variant="secondary" className="ml-2">Optional</Badge>
          </CardTitle>
          <CardDescription>
            Upload any supporting documents (answer sheet copies, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="block">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG (Max 10MB each)
                </p>
              </div>
            </label>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button 
          size="lg" 
          onClick={handleSubmit}
          disabled={isLoading || !selectedCardId || selectedSubjects.length === 0 || !reason.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <RefreshCcw className="h-5 w-5 mr-2" />
              Submit Re-Evaluation Request
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
