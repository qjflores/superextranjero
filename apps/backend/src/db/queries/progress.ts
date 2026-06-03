import { query } from '../index.js';

export interface Progress {
  user_id: string;
  micro_scenario_id: string;
  completed_at?: Date;
  recognized: boolean;
  attempts: number;
  created_at: Date;
  updated_at: Date;
}

export const createProgress = async (userId: string, microScenarioId: string): Promise<void> => {
  await query(
    'INSERT INTO user_micro_scenario_progress (user_id, micro_scenario_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, microScenarioId]
  );
};

export const findProgress = async (
  userId: string,
  microScenarioId: string
): Promise<Progress | null> => {
  const result = await query<Progress>(
    'SELECT * FROM user_micro_scenario_progress WHERE user_id = $1 AND micro_scenario_id = $2',
    [userId, microScenarioId]
  );
  return result.rows[0] || null;
};

export const updateProgress = async (
  userId: string,
  microScenarioId: string,
  updates: { completed_at?: Date | null; recognized?: boolean; attempts?: number }
): Promise<void> => {
  const setClauses = [];
  const values: any[] = [userId, microScenarioId];
  let paramIndex = 3;

  if (updates.completed_at !== undefined) {
    setClauses.push(`completed_at = $${paramIndex++}`);
    values.splice(2, 0, updates.completed_at);
  }

  if (updates.recognized !== undefined) {
    setClauses.push(`recognized = $${paramIndex++}`);
    values.splice(2, 0, updates.recognized);
  }

  if (updates.attempts !== undefined) {
    setClauses.push(`attempts = $${paramIndex++}`);
    values.splice(2, 0, updates.attempts);
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');

  if (setClauses.length === 1) return; // Only updated_at, skip

  const sql = `UPDATE user_micro_scenario_progress SET ${setClauses.join(', ')} WHERE user_id = $1 AND micro_scenario_id = $2`;
  await query(sql, values);
};

export const findUserProgress = async (userId: string): Promise<Progress[]> => {
  const result = await query<Progress>(
    'SELECT * FROM user_micro_scenario_progress WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return result.rows;
};

export const findUserCompletedScenarios = async (userId: string): Promise<string[]> => {
  const result = await query<{ micro_scenario_id: string }>(
    'SELECT micro_scenario_id FROM user_micro_scenario_progress WHERE user_id = $1 AND completed_at IS NOT NULL',
    [userId]
  );
  return result.rows.map((r) => r.micro_scenario_id);
};

export const countUserCompletedScenarios = async (userId: string): Promise<number> => {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM user_micro_scenario_progress WHERE user_id = $1 AND completed_at IS NOT NULL',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};

export const countUserRecognizedScenarios = async (userId: string): Promise<number> => {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM user_micro_scenario_progress WHERE user_id = $1 AND recognized = true',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};
