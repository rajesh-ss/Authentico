import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  RefreshCcw,
  Loader2,
  X,
  File,
  User,
  Hash,
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarksCardOption, ReEvaluationFormData, DetailsUpdateField, WORKFLOW_CONFIG } from '@/types/reevaluation';
import { ReEvaluationType } from '@/types/blockchain';

interface ReEvaluationFormProps {
  marksCards: MarksCardOption[];
  onSubmit: (data: ReEvaluationFormData) => Promise<void>;
  isLoading?: boolean;
}

const REQUEST_TYPES: { value: ReEvaluationType; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: 'marks_revaluation',
    label: 'Marks Re-Evaluation',
    description: 'Request to re-evaluate marks for specific subjects',
    icon: BookOpen,
  },
  {
    value: 'details_update',
    label: 'Details Update',
    description: 'Request to update personal details (name, roll number, etc.)',
    icon: User,
  },
];

const DETAILS_FIELDS: { value: DetailsUpdateField; label: string; icon: React.ElementType }[] = [
  { value: 'name', label: 'Student Name', icon: User },
  { value: 'roll_number', label: 'Roll Number', icon: Hash },
  { value: 'registration_number', label: 'Registration Number', icon: Hash },
  { value: 'other', label: 'Other Field', icon: FileText },
];

export function ReEvaluationForm({ marksCards, onSubmit, isLoading }: ReEvaluationFormProps) {
  const [requestType, setRequestType] = useState<ReEvaluationType>('marks_revaluation');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Details update specific state
  const [detailsField, setDetailsField] = useState<DetailsUpdateField>('name');
  const [otherFieldName, setOtherFieldName] = useState('');
  const [requestedValue, setRequestedValue] = useState('');

  const selectedCard = marksCards.find((c) => c.id === selectedCardId);
  const workflowConfig = WORKFLOW_CONFIG[requestType];

  const getCurrentValue = (): string => {
    if (!selectedCard) return '';
    switch (detailsField) {
      case 'name': return selectedCard.studentName;
      case 'roll_number': return selectedCard.rollNo;
      case 'registration_number': return selectedCard.registrationNo;
      default: return '';
    }
  };

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

  const handleTypeChange = (type: ReEvaluationType) => {
    setRequestType(type);
    // Reset form state when switching types
    setSelectedSubjects([]);
    setDetailsField('name');
    setRequestedValue('');
    setOtherFieldName('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCardId) {
      newErrors.card = 'Please select a marks card';
    }

    if (requestType === 'marks_revaluation') {
      if (selectedSubjects.length === 0) {
        newErrors.subjects = 'Please select at least one subject';
      }
    } else {
      // Details update validation
      if (detailsField === 'other' && !otherFieldName.trim()) {
        newErrors.otherField = 'Please specify the field name';
      }
      if (!requestedValue.trim()) {
        newErrors.requestedValue = 'Please enter the requested value';
      }
    }

    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason';
    } else if (reason.trim().length < 50) {
      newErrors.reason = 'Reason must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formData: ReEvaluationFormData = {
      type: requestType,
      marksCardId: selectedCardId,
      subjects: requestType === 'marks_revaluation' ? selectedSubjects : [],
      reason: reason.trim(),
      supportingDocuments: files,
    };

    if (requestType === 'details_update') {
      formData.detailsUpdate = {
        field: detailsField,
        currentValue: getCurrentValue(),
        requestedValue: requestedValue.trim(),
        otherFieldName: detailsField === 'other' ? otherFieldName.trim() : undefined,
      };
    }

    await onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Select Request Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              1
            </span>
            Request Type
          </CardTitle>
          <CardDescription>
            Choose the type of re-evaluation request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={requestType}
            onValueChange={(value) => handleTypeChange(value as ReEvaluationType)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {REQUEST_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = requestType === type.value;
              return (
                <label
                  key={type.value}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={type.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>

          {/* Workflow Info */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Approval Workflow:</span> {workflowConfig.description}
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {workflowConfig.route.map((step, index) => (
                  <span key={step} className="flex items-center gap-1">
                    <Badge variant="outline" className="capitalize text-xs">
                      {step}
                    </Badge>
                    {index < workflowConfig.route.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Select Marks Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              2
            </span>
            Select Marks Card
          </CardTitle>
          <CardDescription>
            Choose the semester marks card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCardId} onValueChange={(value) => {
            setSelectedCardId(value);
            setSelectedSubjects([]);
            setRequestedValue('');
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

      {/* Step 3: Conditional based on request type */}
      {requestType === 'marks_revaluation' ? (
        /* Select Subjects for Marks Re-Evaluation */
        <Card className={cn(!selectedCard && "opacity-50 pointer-events-none")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
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
      ) : (
        /* Details Update Fields */
        <Card className={cn(!selectedCard && "opacity-50 pointer-events-none")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </span>
              Update Details
            </CardTitle>
            <CardDescription>
              Specify which detail you want to update
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCard ? (
              <>
                {/* Field Selection */}
                <div className="space-y-2">
                  <Label>Select Field to Update</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {DETAILS_FIELDS.map((field) => {
                      const Icon = field.icon;
                      const isSelected = detailsField === field.value;
                      return (
                        <button
                          key={field.value}
                          type="button"
                          onClick={() => {
                            setDetailsField(field.value);
                            setRequestedValue('');
                            setErrors((prev) => ({ ...prev, requestedValue: '', otherField: '' }));
                          }}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{field.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Other Field Name */}
                {detailsField === 'other' && (
                  <div className="space-y-2">
                    <Label>Field Name</Label>
                    <Input
                      value={otherFieldName}
                      onChange={(e) => {
                        setOtherFieldName(e.target.value);
                        setErrors((prev) => ({ ...prev, otherField: '' }));
                      }}
                      placeholder="Enter the field name"
                      className={cn(errors.otherField && "border-destructive")}
                    />
                    {errors.otherField && (
                      <p className="text-sm text-destructive">{errors.otherField}</p>
                    )}
                  </div>
                )}

                {/* Current and Requested Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Value</Label>
                    <Input
                      value={getCurrentValue()}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Requested Value</Label>
                    <Input
                      value={requestedValue}
                      onChange={(e) => {
                        setRequestedValue(e.target.value);
                        setErrors((prev) => ({ ...prev, requestedValue: '' }));
                      }}
                      placeholder="Enter the correct value"
                      className={cn(errors.requestedValue && "border-destructive")}
                    />
                    {errors.requestedValue && (
                      <p className="text-sm text-destructive">{errors.requestedValue}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a marks card to update details</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Reason */}
      <Card className={cn(
        (requestType === 'marks_revaluation' && selectedSubjects.length === 0) && "opacity-50 pointer-events-none",
        (requestType === 'details_update' && !requestedValue.trim()) && "opacity-50 pointer-events-none"
      )}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              4
            </span>
            Reason for Request
          </CardTitle>
          <CardDescription>
            {requestType === 'marks_revaluation' 
              ? 'Explain why you believe the marks should be re-evaluated'
              : 'Explain why the details need to be updated'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setErrors((prev) => ({ ...prev, reason: '' }));
            }}
            placeholder={
              requestType === 'marks_revaluation'
                ? "Provide a detailed explanation of why you are requesting re-evaluation. Include specific points about your answers that you believe deserve higher marks..."
                : "Explain why this detail needs to be corrected. Include any relevant documentation or reference numbers..."
            }
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

      {/* Step 5: Supporting Documents */}
      <Card className={cn(!reason.trim() && "opacity-50 pointer-events-none")}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              5
            </span>
            Supporting Documents
            <Badge variant="secondary" className="ml-2">
              {requestType === 'details_update' ? 'Required' : 'Optional'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {requestType === 'marks_revaluation'
              ? 'Upload any supporting documents (answer sheet copies, etc.)'
              : 'Upload proof of correct details (ID card, official documents, etc.)'
            }
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
          disabled={
            isLoading || 
            !selectedCardId || 
            (requestType === 'marks_revaluation' && selectedSubjects.length === 0) ||
            (requestType === 'details_update' && !requestedValue.trim()) ||
            !reason.trim()
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <RefreshCcw className="h-5 w-5 mr-2" />
              Submit {requestType === 'marks_revaluation' ? 'Re-Evaluation' : 'Update'} Request
            </>
          )}
        </Button>
      </div>
    </div>
  );
}