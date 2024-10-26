export class APIError extends Error {
    constructor(
      public status: number,
      message: string,
      public code?: string
    ) {
      super(message);
      this.name = 'APIError';
    }
  }
  
  export class AuthError extends Error {
    constructor(message = 'Authentication failed') {
      super(message);
      this.name = 'AuthError';
    }
  }
  
  export class NetworkError extends Error {
    constructor(message = 'Network request failed') {
      super(message);
      this.name = 'NetworkError';
    }
  }
  
  export function handleAPIError(error: unknown): never {
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new NetworkError();
    }
    
    throw new Error('An unexpected error occurred');
  }