import { z } from 'zod';

export const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  contentCount: z.number(),
  confidence: z.number().optional()
});

export const ContentSchema = z.object({
  id: z.string(),
  type: z.enum(['post', 'repost', 'like', 'bookmark']),
  text: z.string(),
  themeId: z.string().optional(),
  createdAt: z.string()
});

// Add explicit type exports
export type Theme = z.infer<typeof ThemeSchema>;
export type Content = z.infer<typeof ContentSchema>;

// Add ContentType type for better type safety
export type ContentType = z.infer<typeof ContentSchema>['type'];