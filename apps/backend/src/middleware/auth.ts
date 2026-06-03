import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // F4 will implement JWT verification; for now, this is a placeholder
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // Parse token (not verified yet)
    req.userId = 'placeholder-user';
  }
  next();
};
