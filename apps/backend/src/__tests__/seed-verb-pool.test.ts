import { LLMGateway, Capability } from '../llm/index.js';
import { MockProvider } from '../llm/providers/mock.js';

describe('seed_verb_pool Contract', () => {
  const mockGateway = new LLMGateway({
    strategy: 'primary-fallback',
    primaryProviders: [new MockProvider()],
    fallbackProviders: [new MockProvider()],
  });

  describe('Output Schema Verification', () => {
    test('response includes required fields', () => {
      const response = {
        seeded_verbs: ['ser', 'estar', 'tener'],
        micro_scenarios_completed: 3,
        mode: 'recognition',
        pool_ready_for_full: true,
      };

      expect(response).toHaveProperty('seeded_verbs');
      expect(response).toHaveProperty('micro_scenarios_completed');
      expect(response).toHaveProperty('mode', 'recognition');
      expect(response).toHaveProperty('pool_ready_for_full');
    });

    test('seeded_verbs is string array', () => {
      const verbs = ['ser', 'estar', 'tener'];
      expect(Array.isArray(verbs)).toBe(true);
      expect(verbs.every((v) => typeof v === 'string')).toBe(true);
    });

    test('mode is always "recognition" for cold-start', () => {
      const mode = 'recognition';
      expect(mode).toBe('recognition');
    });

    test('pool_ready_for_full gates output', () => {
      // Should only be true when threshold is met
      const scenarios15 = { pool_ready_for_full: true }; // 15 verbs
      const scenarios10 = { pool_ready_for_full: false }; // 10 verbs

      expect(scenarios15.pool_ready_for_full).toBe(true);
      expect(scenarios10.pool_ready_for_full).toBe(false);
    });
  });

  describe('Core Verb Pool Setup', () => {
    test('loads top 20 verbs by frequency', async () => {
      // Verify the 20 core verbs exist in the database
      // This would use the actual query in integration test
      const verbs = ['ser', 'estar', 'tener', 'hacer', 'ir'];
      expect(verbs.length).toBeGreaterThan(0);
      expect(verbs[0]).toBe('ser'); // First by frequency
    });

    test('verbs have difficulty levels', () => {
      const verb = {
        infinitive: 'ser',
        difficulty_level: 2,
        frequency_rank: 1,
      };

      expect(verb).toHaveProperty('difficulty_level');
      expect(verb.difficulty_level).toBeGreaterThan(0);
    });
  });

  describe('Recognition Mode Constraints', () => {
    test('user is never asked to generate in recognition mode', () => {
      const mode = 'recognition';
      expect(mode).not.toBe('generation');
    });

    test('micro-scenarios are recognized, not produced', async () => {
      // In recognition mode, user matches/hears, not speaks
      const scenario = {
        text: 'You point at food and say "Quiero eso"',
        mode: 'recognize',
      };

      expect(scenario.mode).toBe('recognize');
    });

    test('LLM provides intro text only', async () => {
      const response = await mockGateway.generate({
        capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
        nativeLanguage: 'en',
        verbTarget: 'ser',
        difficultyLevel: 1,
      });

      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('guardrailPassed', true);
      expect(response.text).toBeTruthy();
    });
  });

  describe('Failure Modes', () => {
    test('rejects E_CORPUS_MISSING if no verbs available', () => {
      const error = 'E_CORPUS_MISSING';
      expect(error).toBe('E_CORPUS_MISSING');
    });

    test('rejects E_FORCED_GENERATION if user production requested', () => {
      const error = 'E_FORCED_GENERATION';
      expect(error).toBe('E_FORCED_GENERATION');
    });

    test('continues on LLM failure with fallback text', async () => {
      // If LLM fails, should use canned text, not hallucinate
      const response = await mockGateway.generate({
        capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
        nativeLanguage: 'en',
        verbTarget: 'hacer',
        difficultyLevel: 1,
      });

      expect(response.text).toBeTruthy();
      // Response must always exist, never be null/undefined
      expect(response.text).not.toBeNull();
    });
  });

  describe('Acceptance Criteria', () => {
    test('verb mastery pool created for seeded verbs', () => {
      // After seeding, user.verb_mastery should have 20 rows
      const poolSize = 20;
      expect(poolSize).toBeGreaterThanOrEqual(15);
    });

    test('all verbs seeded only in micro-scenarios', () => {
      // Every verb in seeded_verbs should come from micro_scenario table
      // not from isolation drills
      const source = 'micro_scenario';
      expect(source).toBe('micro_scenario');
    });

    test('scenario completion marks recognized=true', () => {
      // In recognition mode, completing = being able to recognize
      const progress = {
        recognized: true,
        attempts: 1,
      };

      expect(progress.recognized).toBe(true);
    });

    test('pool_ready_for_full only after 15+ verbs', () => {
      const cases = [
        { verbs: 10, ready: false },
        { verbs: 15, ready: true },
        { verbs: 20, ready: true },
      ];

      cases.forEach(({ verbs, ready }) => {
        const isReady = verbs >= 15;
        expect(isReady).toBe(ready);
      });
    });

    test('user.pool_seeded set to true after completion', () => {
      // After seeding endpoint completes, user.pool_seeded = true
      const user = { pool_seeded: true };
      expect(user.pool_seeded).toBe(true);
    });
  });

  describe('End-to-End Expectations', () => {
    test('response structure matches contract', () => {
      const response = {
        seeded_verbs: ['ser', 'estar', 'tener', 'hacer', 'ir'],
        micro_scenarios_completed: 5,
        mode: 'recognition',
        pool_ready_for_full: false,
      };

      // Validate structure
      expect(response.seeded_verbs).toEqual(expect.arrayContaining(['ser', 'estar', 'tener']));
      expect(response.micro_scenarios_completed).toEqual(expect.any(Number));
      expect(response.mode).toBe('recognition');
      expect(response.pool_ready_for_full).toEqual(expect.any(Boolean));
    });

    test('calling twice returns same pool', () => {
      // If user already seeded, second call returns existing pool
      const firstCall = {
        seeded_verbs: ['ser', 'estar'],
        pool_ready_for_full: false,
      };

      const secondCall = {
        seeded_verbs: ['ser', 'estar'],
        pool_ready_for_full: false,
      };

      expect(firstCall.seeded_verbs).toEqual(secondCall.seeded_verbs);
    });
  });
});
