// use-theme-form.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThemeSchema } from '@/lib/types';
import type { Theme } from '@/lib/types';

interface UseThemeFormProps {
  defaultValues?: Partial<Theme>;
  onSubmit?: (data: Theme) => Promise<void>;
}

export function useThemeForm({ defaultValues, onSubmit }: UseThemeFormProps = {}) {
  const form = useForm<Theme>({
    resolver: zodResolver(ThemeSchema),
    defaultValues: {
      name: '',
      contentCount: 0,
      confidence: 0,
      ...defaultValues,
    }
  });

  const handleSubmit = async (data: Theme) => {
    try {
      await onSubmit?.(data);
      form.reset();
    } catch (error) {
      // Handle error in form context
      form.setError('root', {
        type: 'submit',
        message: 'Failed to save theme'
      });
    }
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
}