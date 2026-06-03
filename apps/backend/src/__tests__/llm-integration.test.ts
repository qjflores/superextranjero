import { LLMGateway, Capability } from '../llm/index.js';
import { MockProvider } from '../llm/providers/mock.js';
import { AnthropicProvider } from '../llm/providers/anthropic.js';

describe('LLM Gateway Integration', () => {
  let gateway: LLMGateway;

  beforeEach(() => {
    const mockProvider = new MockProvider();
    gateway = new LLMGateway({
      strategy: 'primary-fallback',
      primaryProviders: [mockProvider],
      fallbackProviders: [new MockProvider()],
    });
  });

  test('generates micro-scenario intro with complete response structure', async () => {
    const response = await gateway.generate({
      capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
      nativeLanguage: 'en',
      verbTarget: 'hacer',
      difficultyLevel: 2,
    });

    expect(response).toHaveProperty('text');
    expect(response).toHaveProperty('verbTarget', 'hacer');
    expect(response).toHaveProperty('level', 2);
    expect(response).toHaveProperty('guardrailPassed', true);
    expect(response).toHaveProperty('metadata');
    expect(response.metadata).toHaveProperty('provider', 'mock');
  });

  test('handles multiple verbs with different difficulty levels', async () => {
    const verbs = [
      { verb: 'ser', level: 1 },
      { verb: 'estar', level: 1 },
      { verb: 'tener', level: 1 },
    ];

    for (const { verb, level } of verbs) {
      const response = await gateway.generate({
        capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
        nativeLanguage: 'en',
        verbTarget: verb,
        difficultyLevel: level,
      });

      expect(response.verbTarget).toBe(verb);
      expect(response.level).toBe(level);
    }
  });

  test('respects guardrails in multi-provider fallback', async () => {
    const mock1 = new MockProvider();
    const mock2 = new MockProvider();
    const gateway2 = new LLMGateway({
      strategy: 'primary-fallback',
      primaryProviders: [mock1],
      fallbackProviders: [mock2],
    });

    // Low-stakes, live path should work
    const response = await gateway2.generate({
      capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
      nativeLanguage: 'en',
      verbTarget: 'venir',
      context: {
        route: 'live',
        stakes: 'low',
      },
    });

    expect(response.guardrailPassed).toBe(true);
  });

  test('provider metrics are tracked', () => {
    const guardrails = gateway.getGuardrails();
    expect(guardrails.getViolationRate()).toBe(0);

    // Simulate a violation
    guardrails.validateRouting('live', 'high');
    expect(guardrails.getViolationRate()).toBe(1);
  });

  test('falls back when primary provider unavailable', async () => {
    // Create a provider that always fails
    class FailingProvider extends MockProvider {
      override async generateMicroScenarioIntro() {
        throw new Error('Provider unavailable');
      }
    }

    const failingProvider = new FailingProvider();
    const mockProvider = new MockProvider();

    const gateway2 = new LLMGateway({
      strategy: 'primary-fallback',
      primaryProviders: [failingProvider],
      fallbackProviders: [mockProvider],
    });

    const response = await gateway2.generate({
      capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
      nativeLanguage: 'en',
      verbTarget: 'ir',
      difficultyLevel: 1,
    });

    expect(response.metadata?.provider).toBe('mock');
  });
});
