import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import helloRoutes from './routes/hello.js';
import llmRoutes from './routes/llm.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(authMiddleware);

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/api', helloRoutes);
app.use('/', llmRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { status: 404, message: 'Not found' } });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const port = config.port;
app.listen(port, () => {
  console.info(`✓ Server running on http://localhost:${port}`);
  console.info(`  Health check: GET http://localhost:${port}/health`);
  console.info(`  Hello endpoint: GET http://localhost:${port}/api/hello`);
});
