import { Router, Request, Response, type Router as ExpressRouter } from 'express';
import { LLMGateway, Capability, CapabilityRequest, GuardrailError } from '../llm/index.js';
import { MockProvider } from '../llm/providers/mock.js';
import { OpenAIProvider } from '../llm/providers/openai.js';
import { AnthropicProvider } from '../llm/providers/anthropic.js';
import { config } from '../config/env.js';

const router: ExpressRouter = Router();

// Initialize gateway with providers
const primaryProvider =
  config.llm.openaiApiKey && config.llm.openaiApiKey !== ''
    ? new OpenAIProvider(config.llm.openaiApiKey)
    : new MockProvider();

const fallbackProvider =
  config.llm.anthropicApiKey && config.llm.anthropicApiKey !== ''
    ? new AnthropicProvider(config.llm.anthropicApiKey)
    : new MockProvider();

const gateway = new LLMGateway({
  strategy: 'primary-fallback',
  primaryProviders: [primaryProvider],
  fallbackProviders: [fallbackProvider],
});

// POST /llm/generate - Generate content via LLM Gateway
router.post('/llm/generate', async (req: Request, res: Response) => {
  try {
    const { capability, verbTarget, nativeLanguage, difficultyLevel, context } = req.body;

    if (!capability || !verbTarget || !nativeLanguage) {
      return res.status(400).json({
        error: {
          status: 400,
          message: 'Missing required fields: capability, verbTarget, nativeLanguage',
          code: 'E_INVALID_REQUEST',
        },
      });
    }

    const request: CapabilityRequest = {
      capability: capability as Capability,
      verbTarget,
      nativeLanguage,
      difficultyLevel: difficultyLevel || 1,
      context,
    };

    const response = await gateway.generate(request);
    return res.json({ data: response });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    if (errorMsg.includes(GuardrailError.ROUTE_OVERRIDE)) {
      return res.status(403).json({
        error: {
          status: 403,
          message: 'High-stakes content cannot run on live path',
          code: GuardrailError.ROUTE_OVERRIDE,
        },
      });
    }

    if (errorMsg.includes(GuardrailError.INVALID_CAPABILITY)) {
      return res.status(400).json({
        error: {
          status: 400,
          message: errorMsg,
          code: GuardrailError.INVALID_CAPABILITY,
        },
      });
    }

    return res.status(503).json({
      error: {
        status: 503,
        message: `LLM provider failed: ${errorMsg}`,
        code: GuardrailError.PROVIDER_FAILED,
      },
    });
  }
});

// GET /llm/health - Check LLM gateway status
router.get('/llm/health', (_req: Request, res: Response) => {
  return res.json({
    data: {
      status: 'ok',
      primaryProvider: primaryProvider.name,
      fallbackProvider: fallbackProvider.name,
      guardrailViolations: gateway.getGuardrails().getViolationRate(),
    },
  });
});

export default router;
