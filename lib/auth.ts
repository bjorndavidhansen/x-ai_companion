import { z } from 'zod';

const TokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number()
});

export class AuthClient {
  private storage = typeof window !== 'undefined' ? window.localStorage : null;
  
  storeTokens(tokens: z.infer<typeof TokenSchema>) {
    this.storage?.setItem('x_tokens', JSON.stringify(tokens));
  }
  
  getTokens() {
    const tokens = this.storage?.getItem('x_tokens');
    return tokens ? TokenSchema.parse(JSON.parse(tokens)) : null;
  }
  
  clearTokens() {
    this.storage?.removeItem('x_tokens');
  }
}