import { Router, Request, Response, type Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

router.get('/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from backend' });
});

export default router;
