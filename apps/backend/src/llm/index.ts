import {
  Capability,
  CapabilityRequest,
  CapabilityResponse,
} from './capabilities.js';
import { Guardrails, GuardrailError } from './guardrails.js';
import { Policy, PolicyConfig } from './policy.js';
import { LLMProvider } from './providers/index.js';

export class LLMGateway {
  private policy: Policy;
  private guardrails: Guardrails;

  constructor(policyConfig: PolicyConfig) {
    this.policy = new Policy(policyConfig);
    this.guardrails = new Guardrails();
  }

  async generate(request: CapabilityRequest): Promise<CapabilityResponse> {
    // Validate capability
    if (!Object.values(Capability).includes(request.capability)) {
      throw new Error(`${GuardrailError.INVALID_CAPABILITY}: ${request.capability}`);
    }

    // Check routing guardrails (if context provides route/stakes)
    if (request.context?.route && request.context?.stakes) {
      const routeValid = this.guardrails.validateRouting(
        request.context.route as string,
        request.context.stakes as string
      );
      if (!routeValid) {
        throw new Error(GuardrailError.ROUTE_OVERRIDE);
      }
    }

    // Get providers for this capability
    const providers = this.policy.getProvidersForCapability(request.capability);
    if (providers.length === 0) {
      throw new Error(`${GuardrailError.PROVIDER_FAILED}: No providers available`);
    }

    // Try each provider in order until one succeeds
    let lastError: Error | null = null;
    for (const provider of providers) {
      try {
        if (request.capability === Capability.GENERATE_MICRO_SCENARIO_INTRO) {
          const response = await provider.generateMicroScenarioIntro(
            request.verbTarget,
            request.nativeLanguage,
            request.difficultyLevel || 1
          );
          return response;
        }

        // Extend for other capabilities as needed
        throw new Error(`Capability ${request.capability} not implemented`);
      } catch (error) {
        lastError = error as Error;
        // Try next provider
        continue;
      }
    }

    // All providers failed
    throw new Error(
      `${GuardrailError.PROVIDER_FAILED}: ${lastError?.message || 'Unknown error'}`
    );
  }

  getGuardrails(): Guardrails {
    return this.guardrails;
  }
}

export { Capability, CapabilityRequest, CapabilityResponse };
export { Guardrails, GuardrailError } from './guardrails.js';
export { LLMProvider } from './providers/index.js';
export { Policy, PolicyConfig } from './policy.js';
