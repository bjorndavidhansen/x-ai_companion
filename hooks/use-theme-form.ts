// This is the complete content for hooks/use-theme-form.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThemeSchema } from '@/lib/types';

export function useThemeForm() {
  const form = useForm({
    resolver: zodResolver(ThemeSchema),
    defaultValues: {
      name: '',
      contentCount: 0
    }
  });

  return form;
}