import { z } from 'zod';
import { toast } from 'sonner';

export function assertType<T>(
  data: unknown, 
  schema: z.ZodType<T>,
  errorMessage = 'Invalid data received'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Type assertion failed:', error);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}