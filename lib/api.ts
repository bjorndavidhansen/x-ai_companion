import { z } from 'zod';
import { APIError, handleAPIError } from './errors';
import { ThemeSchema, ContentSchema } from './types';

export class APIClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
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

      return response.json();
    } catch (error) {
      return handleAPIError(error);
    }
  }

  async fetchContent() {
    const data = await this.fetch<unknown>('/content');
    return z.array(ContentSchema).parse(data);
  }

  async fetchThemes() {
    const data = await this.fetch<unknown>('/themes');
    return z.array(ThemeSchema).parse(data);
  }

  async updateTheme(contentId: string, themeId: string) {
    const data = await this.fetch<unknown>(`/content/${contentId}/theme`, {
      method: 'PUT',
      body: JSON.stringify({ themeId })
    });
    return ThemeSchema.parse(data);
  }

  async synchronizeContent() {
    return this.fetch<{ status: string }>('/content/sync', {
      method: 'POST'
    });
  }

  async checkSyncStatus() {
    return this.fetch<{ status: string }>('/content/sync/status');
  }
}