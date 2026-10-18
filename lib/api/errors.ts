/** A failed API call, normalised by the response interceptor in `client.ts`. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

/** Shape of every error body the backend returns. */
export interface ApiErrorBody {
  error?: { message?: string; details?: { path: string; message: string }[] };
}
