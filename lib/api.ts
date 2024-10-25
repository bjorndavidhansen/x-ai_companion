// This is the complete content for lib/api.ts
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