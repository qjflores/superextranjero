import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email?: string;
    }
  }
}

interface JWTPayload {
  userId: string;
  email: string;
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // No token; continue without user context (public routes)
    return next();
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    req.userId = decoded.userId;
    req.email = decoded.email;
  } catch (error) {
    // Invalid token; continue without user context
    // Routes can check req.userId to enforce authentication
  }

  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Authentication required',
        code: 'E_UNAUTHORIZED',
      },
    });
  }
  next();
};
