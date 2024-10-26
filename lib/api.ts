// This is the complete content for lib/api.ts
import { APIError, handleAPIError } from './errors';

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
      handleAPIError(error);
    }
  }

  async fetchContent() {
    return this.fetch('/content');
  }

  async updateTheme(contentId: string, themeId: string) {
    return this.fetch(`/content/${contentId}/theme`, {
      method: 'PUT',
      body: JSON.stringify({ themeId })
    });
  }
  // ... other methods
}

import { ThemeSchema, ContentSchema } from './types';

export class APIClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  async fetchContent() {
    const res = await fetch(`${this.baseUrl}/content`);
    const data = await res.json();
    return z.array(ContentSchema).parse(data);
  }

  async updateTheme(contentId: string, themeId: string) {
    const res = await fetch(`${this.baseUrl}/content/${contentId}/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeId })
    });
    return ThemeSchema.parse(await res.json());
  }
}

// Add these methods to the APIClient class

async fetchThemes() {
    const res = await fetch(`${this.baseUrl}/themes`);
    const data = await res.json();
    return z.array(ThemeSchema).parse(data);
  }
  
  async synchronizeContent() {
    const res = await fetch(`${this.baseUrl}/content/sync`, {
      method: 'POST'
    });
    return res.json();
  }
  
  async checkSyncStatus() {
    const res = await fetch(`${this.baseUrl}/content/sync/status`);
    return res.json();
  }