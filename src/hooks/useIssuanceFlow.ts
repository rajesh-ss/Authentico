import { useState, useCallback } from 'react';
import { MarksCardTemplate, StudentRecord, FieldMapping, GeneratedCard, IssuanceSession } from '@/types/issuance';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';

export type IssuanceStep = 'template' | 'upload' | 'mapping' | 'generate' | 'blockchain' | 'complete';

interface IssuanceState {
  currentStep: IssuanceStep;
  template: MarksCardTemplate | null;
  templateFile: File | null;
  excelFile: File | null;
  rawData: Record<string, unknown>[];
  headers: string[];
  fieldMappings: FieldMapping[];
  studentRecords: StudentRecord[];
  generatedCards: GeneratedCard[];
  session: IssuanceSession | null;
}

const defaultTemplateFields = [
  { id: 'name', name: 'Student Name', type: 'text' as const, required: true },
  { id: 'regNo', name: 'Registration Number', type: 'text' as const, required: true },
  { id: 'semester', name: 'Semester', type: 'text' as const, required: true },
  { id: 'academicYear', name: 'Academic Year', type: 'text' as const, required: true },
  { id: 'totalMarks', name: 'Total Marks', type: 'number' as const, required: true },
  { id: 'percentage', name: 'Percentage', type: 'number' as const, required: true },
  { id: 'grade', name: 'Grade', type: 'text' as const, required: true },
];

export function useIssuanceFlow() {
  const [state, setState] = useState<IssuanceState>({
    currentStep: 'template',
    template: null,
    templateFile: null,
    excelFile: null,
    rawData: [],
    headers: [],
    fieldMappings: [],
    studentRecords: [],
    generatedCards: [],
    session: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStep = useCallback((step: IssuanceStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const uploadTemplate = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const fileType = file.name.endsWith('.pdf') ? 'pdf' : 'html';
      const fileUrl = URL.createObjectURL(file);

      const template: MarksCardTemplate = {
        id: `template-${Date.now()}`,
        name: file.name,
        fileType,
        fileUrl,
        fields: defaultTemplateFields,
        createdAt: new Date(),
      };

      setState(prev => ({
        ...prev,
        template,
        templateFile: file,
      }));

      return template;
    } catch (err) {
      setError('Failed to process template file');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadExcel = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      const headers = Object.keys(jsonData[0] || {});

      // Auto-map fields based on header names
      const autoMappings: FieldMapping[] = defaultTemplateFields.map(field => {
        const matchingHeader = headers.find(h => 
          h.toLowerCase().includes(field.name.toLowerCase()) ||
          h.toLowerCase().includes(field.id.toLowerCase())
        );
        return {
          templateField: field.id,
          excelColumn: matchingHeader || '',
        };
      });

      setState(prev => ({
        ...prev,
        excelFile: file,
        rawData: jsonData as Record<string, unknown>[],
        headers,
        fieldMappings: autoMappings,
      }));

      return { data: jsonData, headers };
    } catch (err) {
      setError('Failed to parse Excel file');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFieldMapping = useCallback((templateField: string, excelColumn: string) => {
    setState(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.map(m => 
        m.templateField === templateField ? { ...m, excelColumn } : m
      ),
    }));
  }, []);

  const validateAndProcessData = useCallback(() => {
    const { rawData, fieldMappings } = state;

    const records: StudentRecord[] = rawData.map((row, index) => {
      const errors: string[] = [];
      
      const getField = (fieldId: string) => {
        const mapping = fieldMappings.find(m => m.templateField === fieldId);
        return mapping?.excelColumn ? row[mapping.excelColumn] : undefined;
      };

      const name = String(getField('name') || '');
      const regNo = String(getField('regNo') || '');
      const semester = String(getField('semester') || '');
      const academicYear = String(getField('academicYear') || '');
      const totalMarks = Number(getField('totalMarks')) || 0;
      const percentage = Number(getField('percentage')) || 0;
      const grade = String(getField('grade') || '');

      if (!name) errors.push('Student name is required');
      if (!regNo) errors.push('Registration number is required');
      if (!semester) errors.push('Semester is required');
      if (totalMarks <= 0) errors.push('Total marks must be positive');
      if (percentage < 0 || percentage > 100) errors.push('Percentage must be 0-100');

      return {
        id: `record-${index}`,
        name,
        registrationNumber: regNo,
        semester,
        academicYear,
        subjects: [],
        totalMarks,
        percentage,
        grade,
        isValid: errors.length === 0,
        errors,
      };
    });

    setState(prev => ({ ...prev, studentRecords: records }));
    return records;
  }, [state.rawData, state.fieldMappings]);

  const generateCards = useCallback(async (onProgress?: (progress: number) => void) => {
    setIsLoading(true);
    setError(null);

    const { studentRecords, template } = state;
    const validRecords = studentRecords.filter(r => r.isValid);
    const generatedCards: GeneratedCard[] = [];

    try {
      for (let i = 0; i < validRecords.length; i++) {
        const record = validRecords[i];
        
        // Generate QR code
        const qrData = JSON.stringify({
          id: record.id,
          regNo: record.registrationNumber,
          name: record.name,
          semester: record.semester,
          grade: record.grade,
          verifyUrl: `https://verify.academic.edu/${record.registrationNumber}`,
        });

        const qrCode = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: '#1e3a5f', light: '#ffffff' },
        });

        generatedCards.push({
          id: `card-${record.id}`,
          studentRecord: record,
          qrCode,
          status: 'generated',
        });

        if (onProgress) {
          onProgress(((i + 1) / validRecords.length) * 100);
        }

        // Simulate processing time
        await new Promise(r => setTimeout(r, 100));
      }

      setState(prev => ({ ...prev, generatedCards }));
      return generatedCards;
    } catch (err) {
      setError('Failed to generate marks cards');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.studentRecords, state.template]);

  const submitToBlockchain = useCallback(async (onProgress?: (progress: number, hash?: string) => void) => {
    setIsLoading(true);
    setError(null);

    const { generatedCards } = state;

    try {
      const updatedCards = [...generatedCards];

      for (let i = 0; i < updatedCards.length; i++) {
        const card = updatedCards[i];
        
        // Simulate blockchain submission
        await new Promise(r => setTimeout(r, 300));
        
        const hash = `0x${Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;

        updatedCards[i] = {
          ...card,
          blockchainStatus: 'confirmed',
          transactionHash: hash,
        };

        if (onProgress) {
          onProgress(((i + 1) / updatedCards.length) * 100, hash);
        }
      }

      const session: IssuanceSession = {
        id: `session-${Date.now()}`,
        templateId: state.template?.id || '',
        totalRecords: updatedCards.length,
        processedRecords: updatedCards.length,
        successCount: updatedCards.filter(c => c.blockchainStatus === 'confirmed').length,
        failedCount: updatedCards.filter(c => c.blockchainStatus === 'failed').length,
        status: 'completed',
        startedAt: new Date(Date.now() - 60000),
        completedAt: new Date(),
      };

      setState(prev => ({ 
        ...prev, 
        generatedCards: updatedCards,
        session,
      }));

      return { cards: updatedCards, session };
    } catch (err) {
      setError('Failed to submit to blockchain');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.generatedCards, state.template]);

  const reset = useCallback(() => {
    setState({
      currentStep: 'template',
      template: null,
      templateFile: null,
      excelFile: null,
      rawData: [],
      headers: [],
      fieldMappings: [],
      studentRecords: [],
      generatedCards: [],
      session: null,
    });
    setError(null);
  }, []);

  return {
    ...state,
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
  };
}
