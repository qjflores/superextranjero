import Anthropic from '@anthropic-ai/sdk';
import { CapabilityResponse } from '../capabilities.js';
import { LLMProvider } from './index.js';

export class AnthropicProvider implements LLMProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  isAvailable(): boolean {
    return !!this.client;
  }

  async generateMicroScenarioIntro(
    verb: string,
    nativeLanguage: string,
    difficultyLevel: number
  ): Promise<CapabilityResponse> {
    const prompt = `Generate a brief, recognition-focused micro-scenario intro for the Spanish verb "${verb}" (infinitive).
Target language: ${nativeLanguage}
Difficulty level: ${difficultyLevel} (1=beginner, 2=intermediate)

The scenario should:
1. Be 200-300 characters max
2. Describe a tiny, concrete situation (not a drill)
3. Make the verb recognizable in context
4. Include a glossed word if helpful

Format: Plain text, single sentence or two.`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      text: text.trim(),
      verbTarget: verb,
      level: difficultyLevel,
      guardrailPassed: true,
      metadata: {
        provider: this.name,
        model: 'claude-3-5-sonnet-20241022',
      },
    };
  }
}
