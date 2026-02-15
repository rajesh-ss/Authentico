import { useState, useCallback } from 'react';

interface FormField {
  [key: string]: string | number | boolean | Date | string[] | number[] | null | undefined;
}

interface UseFormOptions<T extends FormField> {
  initialValues: T;
  onSubmit?: (values: T) => void | Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

interface UseFormReturn<T extends FormField> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
  setValues: (values: T) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  validate: (values: T) => Partial<Record<keyof T, string>>;
}

export function useForm<T extends FormField>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when field changes
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const setFieldValue = handleChange;

  const handleSubmit = useCallback(async () => {
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setFieldValue,
    validate: (values: T) => (validate ? validate(values) : {}),
  };
}
