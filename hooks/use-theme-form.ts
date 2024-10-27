import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThemeSchema } from '@/lib/types';
import type { Theme } from '@/lib/types';
import { useState, useCallback } from 'react';

interface UseThemeFormProps {
  defaultValues?: Partial<Theme>;
  onSubmit?: (data: Theme) => Promise<void>;
}

interface UseThemeFormReturn {
  form: UseFormReturn<Theme>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  isLoading: boolean;
  errors: Record<string, any>;
  setFormValues: (values: Partial<Theme>) => void;
  clearErrors: () => void;
  reset: () => void;
}

const DEFAULT_VALUES: Theme = {
  id: '',
  name: '',
  contentCount: 0,
  confidence: 0,
};

export function useThemeForm({ 
  defaultValues = {}, 
  onSubmit 
}: UseThemeFormProps = {}): UseThemeFormReturn {
  // Track loading state separately from form submission state
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Theme>({
    resolver: zodResolver(ThemeSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      ...defaultValues,
    }
  });

  // Handle form submission with loading state
  const handleSubmit = async (data: Theme) => {
    if (!onSubmit) return;

    setIsLoading(true);
    try {
      await onSubmit(data);
      form.reset(DEFAULT_VALUES);
    } catch (error) {
      console.error('Form submission failed:', error);
      form.setError('root', {
        type: 'submit',
        message: error instanceof Error 
          ? error.message 
          : 'Failed to save theme'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set form values programmatically
  const setFormValues = useCallback((values: Partial<Theme>) => {
    Object.entries(values).forEach(([field, value]) => {
      form.setValue(field as keyof Theme, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  }, [form]);

  // Clear all form errors
  const clearErrors = useCallback(() => {
    form.clearErrors();
  }, [form]);

  // Reset form to initial state
  const reset = useCallback(() => {
    form.reset(DEFAULT_VALUES);
    clearErrors();
  }, [form, clearErrors]);

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: form.formState.isSubmitting,
    isLoading,
    errors: form.formState.errors,
    setFormValues,
    clearErrors,
    reset,
  };
}

// Example usage:
/*
function ThemeForm() {
  const {
    form,
    handleSubmit,
    isSubmitting,
    isLoading,
    errors,
    setFormValues,
    clearErrors,
    reset,
  } = useThemeForm({
    defaultValues: {
      name: 'Default Theme',
      confidence: 0.5,
    },
    onSubmit: async (data) => {
      // Submit data to server
      await api.createTheme(data);
    },
  });

  // Example of programmatically setting values
  useEffect(() => {
    if (existingTheme) {
      setFormValues(existingTheme);
    }
  }, [existingTheme, setFormValues]);

  return (
    <form onSubmit={handleSubmit}>
      <input {...form.register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <button type="submit" disabled={isSubmitting || isLoading}>
        {isLoading ? 'Saving...' : 'Save Theme'}
      </button>
      
      <button type="button" onClick={reset}>
        Reset Form
      </button>
      
      {errors.root && (
        <div>
          {errors.root.message}
          <button onClick={clearErrors}>Dismiss</button>
        </div>
      )}
    </form>
  );
}
*/

// Test helper for validating theme data
export function validateThemeData(data: Partial<Theme>): boolean {
  try {
    ThemeSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}