import { Capability } from './capabilities.js';
import { LLMProvider } from './providers/index.js';

export type ProviderStrategy = 'primary-fallback' | 'round-robin';

export interface PolicyConfig {
  strategy: ProviderStrategy;
  primaryProviders: LLMProvider[];
  fallbackProviders: LLMProvider[];
}

export class Policy {
  private config: PolicyConfig;
  private providerIndex = 0;

  constructor(config: PolicyConfig) {
    this.config = config;
  }

  // Get the list of providers for a capability in preference order
  getProvidersForCapability(capability: Capability): LLMProvider[] {
    // For now, all capabilities use the same provider list
    // In the future, this can be specialized per capability
    return [
      ...this.config.primaryProviders.filter((p) => p.isAvailable()),
      ...this.config.fallbackProviders.filter((p) => p.isAvailable()),
    ];
  }

  // Get the next provider in round-robin fashion
  getNextProvider(capability: Capability): LLMProvider | null {
    const providers = this.getProvidersForCapability(capability);
    if (providers.length === 0) return null;

    if (this.config.strategy === 'round-robin') {
      const provider = providers[this.providerIndex % providers.length];
      this.providerIndex = (this.providerIndex + 1) % providers.length;
      return provider;
    }

    // primary-fallback: always start with primary
    return providers[0];
  }
}
