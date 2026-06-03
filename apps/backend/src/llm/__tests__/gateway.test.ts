import {
  LLMGateway,
  Capability,
  GuardrailError,
} from '../index.js';
import { MockProvider } from '../providers/mock.js';

describe('LLMGateway', () => {
  let gateway: LLMGateway;

  beforeEach(() => {
    const mockProvider = new MockProvider();
    gateway = new LLMGateway({
      strategy: 'primary-fallback',
      primaryProviders: [mockProvider],
      fallbackProviders: [],
    });
  });

  test('generates micro-scenario intro via mock provider', async () => {
    const response = await gateway.generate({
      capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
      nativeLanguage: 'en',
      verbTarget: 'ser',
      difficultyLevel: 1,
    });

    expect(response.text).toBeTruthy();
    expect(response.verbTarget).toBe('ser');
    expect(response.level).toBe(1);
    expect(response.guardrailPassed).toBe(true);
    expect(response.metadata?.provider).toBe('mock');
  });

  test('rejects invalid capability', async () => {
    await expect(
      gateway.generate({
        capability: 'invalid' as Capability,
        nativeLanguage: 'en',
        verbTarget: 'ser',
      })
    ).rejects.toThrow('E_INVALID_CAPABILITY');
  });

  test('enforces high-stakes-on-live guardrail', async () => {
    await expect(
      gateway.generate({
        capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
        nativeLanguage: 'en',
        verbTarget: 'ser',
        context: {
          route: 'live',
          stakes: 'high',
        },
      })
    ).rejects.toThrow(GuardrailError.ROUTE_OVERRIDE);
  });

  test('allows high-stakes on non-live path', async () => {
    const response = await gateway.generate({
      capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
      nativeLanguage: 'en',
      verbTarget: 'ser',
      context: {
        route: 'staged',
        stakes: 'high',
      },
    });

    expect(response.guardrailPassed).toBe(true);
  });

  test('allows low-stakes on live path', async () => {
    const response = await gateway.generate({
      capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
      nativeLanguage: 'en',
      verbTarget: 'ser',
      context: {
        route: 'live',
        stakes: 'low',
      },
    });

    expect(response.guardrailPassed).toBe(true);
  });
});
