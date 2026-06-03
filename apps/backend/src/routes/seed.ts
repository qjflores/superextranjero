import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { findUserById, updateUserPoolSeeded } from '../db/queries/user.js';
import {
  findVerbsByFrequencyRank,
  countVerbs,
} from '../db/queries/verb.js';
import {
  findMicroScenariosByVerbId,
  createMicroScenario,
} from '../db/queries/micro-scenario.js';
import {
  createProgress,
  findProgress,
  updateProgress,
  countUserCompletedScenarios,
} from '../db/queries/progress.js';
import {
  bulkCreateVerbMastery,
  findUserVerbMastery,
} from '../db/queries/verb-mastery.js';
import { LLMGateway, Capability } from '../llm/index.js';
import { MockProvider } from '../llm/providers/mock.js';
import { config } from '../config/env.js';

const router = Router();

interface SeedVerbPoolRequest {
  nativeLanguage: string;
  seedTarget?: number;
}

interface SeedVerbPoolResponse {
  data?: {
    seeded_verbs: string[];
    micro_scenarios_completed: number;
    mode: 'recognition';
    pool_ready_for_full: boolean;
  };
  error?: {
    status: number;
    message: string;
    code: string;
  };
}

// Initialize LLM Gateway for generating micro-scenarios
const llmGateway = new LLMGateway({
  strategy: 'primary-fallback',
  primaryProviders: [new MockProvider()],
  fallbackProviders: [new MockProvider()],
});

// POST /seed-verb-pool - Seed a user's verb pool for cold-start
router.post(
  '/seed-verb-pool',
  requireAuth,
  async (req: Request<unknown, unknown, SeedVerbPoolRequest>, res: Response<SeedVerbPoolResponse>) => {
    try {
      const userId = req.userId!;
      const { nativeLanguage, seedTarget = 20 } = req.body;

      if (!nativeLanguage) {
        return res.status(400).json({
          error: {
            status: 400,
            message: 'nativeLanguage is required',
            code: 'E_MISSING_FIELDS',
          },
        });
      }

      // Check if user exists
      const user = await findUserById(userId);
      if (!user) {
        return res.status(404).json({
          error: {
            status: 404,
            message: 'User not found',
            code: 'E_USER_NOT_FOUND',
          },
        });
      }

      // If already seeded, return existing pool
      if (user.pool_seeded) {
        const seededVerbs = await findUserVerbMastery(userId);
        return res.json({
          data: {
            seeded_verbs: seededVerbs.map((vm) => vm.verb_id.toString()),
            micro_scenarios_completed: seededVerbs.length,
            mode: 'recognition',
            pool_ready_for_full: true,
          },
        });
      }

      // Load core verbs (by frequency rank)
      const verbs = await findVerbsByFrequencyRank(seedTarget);

      if (verbs.length === 0) {
        return res.status(503).json({
          error: {
            status: 503,
            message: 'No verbs available for seeding',
            code: 'E_CORPUS_MISSING',
          },
        });
      }

      const seededVerbIds: number[] = [];
      const seededVerbNames: string[] = [];

      // Seed each verb with micro-scenarios
      for (const verb of verbs) {
        try {
          // Find or generate micro-scenario for this verb
          let scenarios = await findMicroScenariosByVerbId(verb.verb_id);

          if (scenarios.length === 0) {
            // Generate a micro-scenario intro via LLM
            try {
              const intro = await llmGateway.generate({
                capability: Capability.GENERATE_MICRO_SCENARIO_INTRO,
                nativeLanguage,
                verbTarget: verb.infinitive,
                difficultyLevel: verb.difficulty_level,
              });

              const scenarioId = await createMicroScenario(
                verb.verb_id,
                `${verb.infinitive} intro`,
                intro.text,
                intro.text,
                intro.level
              );

              scenarios = [
                {
                  micro_scenario_id: scenarioId,
                  verb_id: verb.verb_id,
                  title: `${verb.infinitive} intro`,
                  description: intro.text,
                  context_text: intro.text,
                  difficulty_level: intro.level,
                  created_at: new Date(),
                },
              ];
            } catch (llmError) {
              // If LLM fails, continue with empty scenario list
              console.warn(
                `Failed to generate scenario for verb ${verb.infinitive}:`,
                llmError
              );
              // Don't fail the whole seeding; just skip this verb
              continue;
            }
          }

          // Mark first scenario as completed (for recognition mode)
          if (scenarios.length > 0) {
            const scenario = scenarios[0];
            const progress = await findProgress(userId, scenario.micro_scenario_id);

            if (!progress) {
              await createProgress(userId, scenario.micro_scenario_id);
            }

            // Mark as recognized (recognition mode = automatic completion)
            await updateProgress(userId, scenario.micro_scenario_id, {
              recognized: true,
              attempts: 1,
            });
          }

          seededVerbIds.push(verb.verb_id);
          seededVerbNames.push(verb.infinitive);
        } catch (error) {
          console.error(`Error seeding verb ${verb.infinitive}:`, error);
          // Continue with next verb on error
        }
      }

      // Bulk create verb_mastery records for seeded verbs
      if (seededVerbIds.length > 0) {
        await bulkCreateVerbMastery(userId, seededVerbIds);
      }

      // Mark user's pool as seeded
      await updateUserPoolSeeded(userId);

      // Count completed scenarios
      const completedCount = await countUserCompletedScenarios(userId);

      const poolReadyForFull = seededVerbIds.length >= (seedTarget * 0.75); // 75% threshold

      return res.status(201).json({
        data: {
          seeded_verbs: seededVerbNames,
          micro_scenarios_completed: completedCount,
          mode: 'recognition',
          pool_ready_for_full: poolReadyForFull,
        },
      });
    } catch (error) {
      console.error('Seed verb pool error:', error);
      return res.status(500).json({
        error: {
          status: 500,
          message: 'Failed to seed verb pool',
          code: 'E_INTERNAL',
        },
      });
    }
  }
);

// GET /seed-verb-pool/status - Check user's seeding status
router.get(
  '/seed-verb-pool/status',
  requireAuth,
  async (_req: Request, res: Response) => {
    try {
      const userId = _req.userId!;

      const user = await findUserById(userId);
      if (!user) {
        return res.status(404).json({
          error: {
            status: 404,
            message: 'User not found',
            code: 'E_USER_NOT_FOUND',
          },
        });
      }

      const seededVerbs = await findUserVerbMastery(userId);
      const completedScenarios = await countUserCompletedScenarios(userId);

      return res.json({
        data: {
          pool_seeded: user.pool_seeded,
          seeded_verbs_count: seededVerbs.length,
          completed_scenarios: completedScenarios,
          ready_for_full: user.pool_seeded && seededVerbs.length >= 15,
        },
      });
    } catch (error) {
      console.error('Seeding status error:', error);
      return res.status(500).json({
        error: {
          status: 500,
          message: 'Failed to check seeding status',
          code: 'E_INTERNAL',
        },
      });
    }
  }
);

export default router;
