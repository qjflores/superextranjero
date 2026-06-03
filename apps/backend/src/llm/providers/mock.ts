import { CapabilityResponse } from '../capabilities.js';
import { LLMProvider } from './index.js';

export class MockProvider implements LLMProvider {
  name = 'mock';

  isAvailable(): boolean {
    return true;
  }

  async generateMicroScenarioIntro(
    verb: string,
    nativeLanguage: string,
    difficultyLevel: number
  ): Promise<CapabilityResponse> {
    // Simulate a micro-scenario intro for testing
    const scenarios: Record<string, string> = {
      ser: 'You introduce yourself to someone new. "Soy Juan."',
      estar: 'You describe where you are right now. "Estoy en casa."',
      tener: 'You show someone your possession. "Tengo un libro."',
      hacer: 'You talk about what you are doing. "Hago la tarea."',
      ir: 'You announce where you are going. "Voy al parque."',
    };

    const text = scenarios[verb] || `Micro-scenario for ${verb}.`;

    return {
      text,
      verbTarget: verb,
      level: difficultyLevel,
      guardrailPassed: true,
      metadata: {
        provider: this.name,
      },
    };
  }
}
