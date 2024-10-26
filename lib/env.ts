import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  X_CLIENT_ID: z.string(),
  X_CLIENT_SECRET: z.string()
});

export function validateEnv() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  }
}