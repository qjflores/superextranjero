import { CapabilityResponse } from '../capabilities.js';

export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  generateMicroScenarioIntro(
    verb: string,
    nativeLanguage: string,
    difficultyLevel: number
  ): Promise<CapabilityResponse>;
}

export type ProviderFactory = () => LLMProvider;
