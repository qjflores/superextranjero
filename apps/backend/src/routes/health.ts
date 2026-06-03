import { Router, Request, Response, type Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
