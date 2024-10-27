// type-guards.ts
import { z } from 'zod';
import { toast } from 'sonner';

// Custom error for type assertions
export class TypeAssertionError extends Error {
  constructor(
    message: string,
    public zodError?: z.ZodError,
    public originalValue?: unknown
  ) {
    super(message);
    this.name = 'TypeAssertionError';
  }
}

// Configuration type for assertion options
interface AssertOptions {
  errorMessage?: string;
  showToast?: boolean;
  throwError?: boolean;
  logError?: boolean;
}

// Default options
const defaultAssertOptions: Required<AssertOptions> = {
  errorMessage: 'Invalid data received',
  showToast: true,
  throwError: true,
  logError: true
};

/**
 * Assert that data matches a Zod schema
 */
export function assertType<T>(
  data: unknown,
  schema: z.ZodType<T>,
  options?: AssertOptions
): T {
  const opts = { ...defaultAssertOptions, ...options };
  
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const assertionError = new TypeAssertionError(
        opts.errorMessage,
        error,
        data
      );

      // Log error if enabled
      if (opts.logError) {
        console.error('Type assertion failed:', {
          error: assertionError,
          zodError: error.flatten(),
          invalidData: data
        });
      }

      // Show toast if enabled
      if (opts.showToast) {
        toast.error(opts.errorMessage);
      }

      // Throw error if enabled
      if (opts.throwError) {
        throw assertionError;
      }

      // If we're not throwing, return a default value if schema provides one
      return schema.parse(undefined);
    }
    
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Type guard function that returns boolean instead of throwing
 */
export function isType<T>(
  data: unknown,
  schema: z.ZodType<T>
): data is T {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Assert that data is a non-nullable value
 */
export function assertNonNullable<T>(
  value: T,
  errorMessage = 'Value is null or undefined'
): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new TypeAssertionError(errorMessage);
  }
  return value as NonNullable<T>;
}

/**
 * Type guard for checking if value is a Record/object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Helper to create partial schema from existing schema
 */
export function createPartialSchema<T extends z.ZodType<any, any, any>>(
  schema: T
): z.ZodOptional<T> {
  return schema.optional();
}

/**
 * Helper to assert array of values
 */
export function assertArray<T>(
  data: unknown,
  schema: z.ZodType<T>,
  options?: AssertOptions
): T[] {
  return assertType(data, z.array(schema), options);
}