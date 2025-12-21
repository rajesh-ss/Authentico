import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StepIndicator } from '@/components/issuance/StepIndicator';
import { TemplateUpload } from '@/components/issuance/TemplateUpload';
import { ExcelUpload } from '@/components/issuance/ExcelUpload';
import { FieldMapping } from '@/components/issuance/FieldMapping';
import { CardGeneration } from '@/components/issuance/CardGeneration';
import { BlockchainSubmission } from '@/components/issuance/BlockchainSubmission';
import { IssuanceComplete } from '@/components/issuance/IssuanceComplete';
import { useIssuanceFlow, IssuanceStep } from '@/hooks/useIssuanceFlow';
import { useNavigate } from 'react-router-dom';

export default function IssuanceFlow() {
  const navigate = useNavigate();
  const {
    currentStep,
    template,
    excelFile,
    rawData,
    headers,
    fieldMappings,
    studentRecords,
    generatedCards,
    session,
    isLoading,
    error,
    setStep,
    uploadTemplate,
    uploadExcel,
    updateFieldMapping,
    validateAndProcessData,
    generateCards,
    submitToBlockchain,
    reset,
  } = useIssuanceFlow();

  const handleStepClick = (step: IssuanceStep) => {
    setStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'template':
        return (
          <TemplateUpload
            template={template}
            onUpload={uploadTemplate}
            onNext={() => setStep('upload')}
            isLoading={isLoading}
          />
        );

      case 'upload':
        return (
          <ExcelUpload
            excelFile={excelFile}
            rawData={rawData}
            headers={headers}
            onUpload={uploadExcel}
            onNext={() => setStep('mapping')}
            onBack={() => setStep('template')}
            isLoading={isLoading}
          />
        );

      case 'mapping':
        return (
          <FieldMapping
            headers={headers}
            fieldMappings={fieldMappings}
            studentRecords={studentRecords}
            onUpdateMapping={updateFieldMapping}
            onValidate={validateAndProcessData}
            onNext={() => setStep('generate')}
            onBack={() => setStep('upload')}
            isLoading={isLoading}
          />
        );

      case 'generate':
        return (
          <CardGeneration
            studentRecords={studentRecords}
            generatedCards={generatedCards}
            onGenerate={generateCards}
            onNext={() => setStep('blockchain')}
            onBack={() => setStep('mapping')}
            isLoading={isLoading}
          />
        );

      case 'blockchain':
        return (
          <BlockchainSubmission
            generatedCards={generatedCards}
            session={session}
            onSubmit={submitToBlockchain}
            onNext={() => setStep('complete')}
            onBack={() => setStep('generate')}
            isLoading={isLoading}
          />
        );

      case 'complete':
        return (
          <IssuanceComplete
            generatedCards={generatedCards}
            session={session}
            onReset={() => {
              reset();
              setStep('template');
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Issue Marks Cards"
      subtitle="Generate and register marks cards on blockchain"
    >
      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          {error}
        </div>
      )}

      {/* Current Step Content */}
      {renderStep()}
    </DashboardLayout>
  );
}
