import { z } from 'zod';

const envSchema = z.object({
  // Required in production, optional in development
  NEXT_PUBLIC_API_URL: z.string().url()
    .or(z.string().optional())
    .transform(val => val || 'http://localhost:3000'),
  
  NEXT_PUBLIC_APP_URL: z.string().url()
    .or(z.string().optional())
    .transform(val => val || 'http://localhost:3000'),
  
  // Auth credentials (required in production)
  X_CLIENT_ID: z.string(),
  X_CLIENT_SECRET: z.string(),

  // Environment with default
  NODE_ENV: z.enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
});

// Create type from schema
export type Env = z.infer<typeof envSchema>;

// Validate and export environment
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);

    // Only enforce strict validation in production
    if (env.NODE_ENV === 'production') {
      // Ensure required variables are present in production
      if (!env.NEXT_PUBLIC_API_URL) {
        throw new Error('API URL is required in production');
      }
      if (!env.NEXT_PUBLIC_APP_URL) {
        throw new Error('APP URL is required in production');
      }
      if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET) {
        throw new Error('X client credentials are required in production');
      }
    }

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:', error.errors);
    } else {
      console.error('Environment validation failed:', error);
    }
    
    // In development, return defaults instead of throwing
    if (process.env.NODE_ENV !== 'production') {
      return {
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        X_CLIENT_ID: '',
        X_CLIENT_SECRET: '',
        NODE_ENV: 'development'
      } as Env;
    }
    
    throw error;
  }
}

// Export validated env
export const env = validateEnv();

// Helper functions
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';