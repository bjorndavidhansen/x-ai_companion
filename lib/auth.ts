import { z } from 'zod';

const TokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number()
});

export type Tokens = z.infer<typeof TokenSchema>;

export class AuthClient {
  private get storage() {
    return typeof window !== 'undefined' ? window.localStorage : null;
  }
  
  storeTokens(tokens: Tokens) {
    if (!this.storage) return;
    try {
      this.storage.setItem('x_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }
  
  getTokens(): Tokens | null {
    if (!this.storage) return null;
    try {
      const tokens = this.storage.getItem('x_tokens');
      if (!tokens) return null;
      return TokenSchema.parse(JSON.parse(tokens));
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      this.clearTokens(); // Clear invalid tokens
      return null;
    }
  }
  
  clearTokens() {
    this.storage?.removeItem('x_tokens');
  }
}