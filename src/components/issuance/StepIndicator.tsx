import { Check, FileText, Upload, Settings, Sparkles, Link, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IssuanceStep } from '@/hooks/useIssuanceFlow';

interface Step {
  id: IssuanceStep;
  label: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: 'template', label: 'Template', icon: FileText },
  { id: 'upload', label: 'Upload Data', icon: Upload },
  { id: 'mapping', label: 'Field Mapping', icon: Settings },
  { id: 'generate', label: 'Generate Cards', icon: Sparkles },
  { id: 'blockchain', label: 'Blockchain', icon: Link },
  { id: 'complete', label: 'Complete', icon: CheckCircle },
];

interface StepIndicatorProps {
  currentStep: IssuanceStep;
  onStepClick?: (step: IssuanceStep) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => isCompleted && onStepClick?.(step.id)}
                disabled={!isCompleted}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all",
                  isCompleted && "cursor-pointer hover:opacity-80",
                  !isCompleted && !isCurrent && "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted && "bg-success text-success-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent && "text-primary",
                    isCompleted && "text-success",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-all",
                      index < currentIndex ? "bg-success" : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
