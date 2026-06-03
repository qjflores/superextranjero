import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${status}: ${message}`, err);

  res.status(status).json({
    error: {
      status,
      message,
      code: err.code || 'INTERNAL_ERROR',
    },
  });
};
