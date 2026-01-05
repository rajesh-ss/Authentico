import React from 'react';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  label: string;
}

export const StepIndicator = React.memo(function StepIndicator({ 
  step, 
  currentStep, 
  label 
}: StepIndicatorProps) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
        isCompleted && "bg-success text-success-foreground",
        isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
        !isActive && !isCompleted && "bg-muted text-muted-foreground"
      )}>
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span className={cn(
        "text-sm font-medium transition-colors",
        isActive && "text-foreground",
        !isActive && "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
});

interface StepProgressProps {
  currentStep: number;
  steps: string[];
}

export const StepProgress = React.memo(function StepProgress({ 
  currentStep, 
  steps 
}: StepProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((label, index) => (
          <React.Fragment key={index}>
            <StepIndicator step={index + 1} currentStep={currentStep} label={label} />
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-muted relative">
                <div 
                  className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
                  style={{ width: currentStep > index + 1 ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});
