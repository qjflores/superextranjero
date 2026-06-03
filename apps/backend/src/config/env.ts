export const config: {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  database: { url: string; poolMin: number; poolMax: number };
  llm: { openaiApiKey: string; anthropicApiKey: string };
} = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/survival_spanish',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  llm: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  },
};
