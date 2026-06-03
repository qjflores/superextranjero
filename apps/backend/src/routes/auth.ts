import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import {
  createUser,
  findUserByEmail,
  updateUserPoolSeeded,
} from '../db/queries/user.js';

const router = Router();

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  data?: {
    userId: string;
    email: string;
    token: string;
  };
  error?: {
    status: number;
    message: string;
    code: string;
  };
}

// POST /auth/register - Create a new user
router.post(
  '/register',
  async (req: Request<unknown, unknown, RegisterRequest>, res: Response<AuthResponse>) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: {
            status: 400,
            message: 'Email and password are required',
            code: 'E_MISSING_FIELDS',
          },
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: {
            status: 400,
            message: 'Password must be at least 8 characters',
            code: 'E_WEAK_PASSWORD',
          },
        });
      }

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: {
            status: 409,
            message: 'User already exists',
            code: 'E_USER_EXISTS',
          },
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = await createUser(email, passwordHash);

      const token = jwt.sign({ userId, email }, config.jwtSecret, {
        expiresIn: '7d',
      });

      return res.status(201).json({
        data: {
          userId,
          email,
          token,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        error: {
          status: 500,
          message: 'Internal server error',
          code: 'E_INTERNAL',
        },
      });
    }
  }
);

// POST /auth/login - Authenticate user
router.post(
  '/login',
  async (req: Request<unknown, unknown, LoginRequest>, res: Response<AuthResponse>) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: {
            status: 400,
            message: 'Email and password are required',
            code: 'E_MISSING_FIELDS',
          },
        });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: {
            status: 401,
            message: 'Invalid credentials',
            code: 'E_INVALID_CREDENTIALS',
          },
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({
          error: {
            status: 401,
            message: 'Invalid credentials',
            code: 'E_INVALID_CREDENTIALS',
          },
        });
      }

      const token = jwt.sign({ userId: user.user_id, email: user.email }, config.jwtSecret, {
        expiresIn: '7d',
      });

      return res.json({
        data: {
          userId: user.user_id,
          email: user.email,
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        error: {
          status: 500,
          message: 'Internal server error',
          code: 'E_INTERNAL',
        },
      });
    }
  }
);

export default router;
