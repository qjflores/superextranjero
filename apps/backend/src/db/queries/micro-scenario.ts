import { query } from '../index.js';

export interface MicroScenario {
  micro_scenario_id: string;
  verb_id: number;
  title: string;
  description?: string;
  context_text?: string;
  difficulty_level: number;
  created_at: Date;
}

export const createMicroScenario = async (
  verbId: number,
  title: string,
  description?: string,
  contextText?: string,
  difficultyLevel: number = 1
): Promise<string> => {
  const result = await query<{ micro_scenario_id: string }>(
    'INSERT INTO micro_scenario (verb_id, title, description, context_text, difficulty_level) VALUES ($1, $2, $3, $4, $5) RETURNING micro_scenario_id',
    [verbId, title, description, contextText, difficultyLevel]
  );
  return result.rows[0].micro_scenario_id;
};

export const findMicroScenarioById = async (scenarioId: string): Promise<MicroScenario | null> => {
  const result = await query<MicroScenario>(
    'SELECT * FROM micro_scenario WHERE micro_scenario_id = $1',
    [scenarioId]
  );
  return result.rows[0] || null;
};

export const findMicroScenariosByVerbId = async (verbId: number): Promise<MicroScenario[]> => {
  const result = await query<MicroScenario>(
    'SELECT * FROM micro_scenario WHERE verb_id = $1 ORDER BY difficulty_level ASC',
    [verbId]
  );
  return result.rows;
};

export const findRandomMicroScenariosByVerbIds = async (
  verbIds: number[],
  limit: number = 20
): Promise<MicroScenario[]> => {
  if (verbIds.length === 0) return [];

  const placeholders = verbIds.map((_, i) => `$${i + 1}`).join(',');
  const result = await query<MicroScenario>(
    `SELECT * FROM micro_scenario WHERE verb_id IN (${placeholders}) ORDER BY RANDOM() LIMIT $${verbIds.length + 1}`,
    [...verbIds, limit]
  );
  return result.rows;
};

export const bulkInsertMicroScenarios = async (
  scenarios: Array<{
    verb_id: number;
    title: string;
    description?: string;
    context_text?: string;
    difficulty_level?: number;
  }>
): Promise<number> => {
  if (scenarios.length === 0) return 0;

  const values = scenarios
    .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
    .join(',');

  const params = scenarios.flatMap((s) => [
    s.verb_id,
    s.title,
    s.description || null,
    s.context_text || null,
    s.difficulty_level || 1,
  ]);

  const result = await query(
    `INSERT INTO micro_scenario (verb_id, title, description, context_text, difficulty_level) VALUES ${values}`,
    params
  );
  return result.rowCount || 0;
};

export const countMicroScenarios = async (): Promise<number> => {
  const result = await query<{ count: string }>('SELECT COUNT(*) as count FROM micro_scenario');
  return parseInt(result.rows[0].count, 10);
};
