import { z } from 'zod';
import { APIError, handleAPIError } from './errors';
import { ThemeSchema, ContentSchema, type Theme, type Content } from './types';
import { env } from './env';

/**
 * API Client for managing content and themes
 */
export class APIClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_API_URL;
  }
  
  /**
   * Generic fetch wrapper with error handling and type validation
   */
  private async fetch<T>(
    path: string, 
    options?: RequestInit & { 
      validateResponse?: (data: unknown) => T 
    }
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new APIError(
          response.status,
          data.message || 'API request failed',
          data.code
        );
      }

      const data = await response.json();
      
      if (options?.validateResponse) {
        return options.validateResponse(data);
      }
      
      return data as T;
    } catch (error) {
      return handleAPIError(error);
    }
  }

  /**
   * Fetch all content items
   */
  async fetchContent(): Promise<Content[]> {
    return this.fetch<Content[]>('/content', {
      validateResponse: (data) => z.array(ContentSchema).parse(data)
    });
  }

  /**
   * Fetch all themes
   */
  async fetchThemes(): Promise<Theme[]> {
    return this.fetch<Theme[]>('/themes', {
      validateResponse: (data) => z.array(ThemeSchema).parse(data)
    });
  }

  /**
   * Create a new theme
   */
  async createTheme(theme: Omit<Theme, 'id'>): Promise<Theme> {
    return this.fetch<Theme>('/themes', {
      method: 'POST',
      body: JSON.stringify(theme),
      validateResponse: (data) => ThemeSchema.parse(data)
    });
  }

  /**
   * Update theme for a specific content item
   */
  async updateTheme(contentId: string, themeId: string): Promise<Theme> {
    return this.fetch<Theme>(`/content/${contentId}/theme`, {
      method: 'PUT',
      body: JSON.stringify({ themeId }),
      validateResponse: (data) => ThemeSchema.parse(data)
    });
  }

  /**
   * Start content synchronization process
   */
  async synchronizeContent(): Promise<{ status: string }> {
    return this.fetch<{ status: string }>('/content/sync', {
      method: 'POST'
    });
  }

  /**
   * Check the status of content synchronization
   */
  async checkSyncStatus(): Promise<{ 
    status: string;
    complete: boolean;
    progress?: number;
    error?: string;
  }> {
    return this.fetch('/content/sync/status');
  }

  /**
   * Delete a theme
   */
  async deleteTheme(themeId: string): Promise<void> {
    await this.fetch<void>(`/themes/${themeId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Update theme metadata
   */
  async updateThemeMetadata(
    themeId: string, 
    metadata: Partial<Omit<Theme, 'id'>>
  ): Promise<Theme> {
    return this.fetch<Theme>(`/themes/${themeId}`, {
      method: 'PATCH',
      body: JSON.stringify(metadata),
      validateResponse: (data) => ThemeSchema.parse(data)
    });
  }

  /**
   * Bulk update themes for multiple content items
   */
  async bulkUpdateThemes(
    updates: Array<{ contentId: string; themeId: string }>
  ): Promise<void> {
    await this.fetch<void>('/content/theme/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates })
    });
  }
}