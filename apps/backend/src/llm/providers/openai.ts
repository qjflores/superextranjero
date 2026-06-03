import OpenAI from 'openai';
import { CapabilityResponse } from '../capabilities.js';
import { LLMProvider } from './index.js';

export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
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

    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const text = response.choices[0]?.message?.content || '';

    return {
      text: text.trim(),
      verbTarget: verb,
      level: difficultyLevel,
      guardrailPassed: true,
      metadata: {
        provider: this.name,
        model: 'gpt-3.5-turbo',
      },
    };
  }
}
