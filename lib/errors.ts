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
  
  if (error instanceof TypeError) {
    if (error.message === 'Failed to fetch' || !window.navigator.onLine) {
      throw new NetworkError();
    }
  }
  
  if (error instanceof Error) {
    throw new Error(`Unexpected error: ${error.message}`);
  }
  
  throw new Error('An unexpected error occurred');
}