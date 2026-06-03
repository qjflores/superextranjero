import { Router, Request, Response } from 'express';

const router = Router();

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

router.post('/register', (req: Request<unknown, unknown, RegisterRequest>, res: Response) => {
  // F4 will implement full auth; for now, just scaffold
  res.status(201).json({ message: 'Register endpoint - F4 will implement' });
});

router.post('/login', (req: Request<unknown, unknown, LoginRequest>, res: Response) => {
  // F4 will implement full auth; for now, just scaffold
  res.json({ message: 'Login endpoint - F4 will implement' });
});

export default router;
