import { query } from '../index.js';

export interface VerbMastery {
  user_id: string;
  verb_id: number;
  mastery_level: number;
  success_count: number;
  last_attempted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export const createVerbMastery = async (userId: string, verbId: number): Promise<void> => {
  await query(
    'INSERT INTO verb_mastery (user_id, verb_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, verbId]
  );
};

export const findVerbMastery = async (
  userId: string,
  verbId: number
): Promise<VerbMastery | null> => {
  const result = await query<VerbMastery>(
    'SELECT * FROM verb_mastery WHERE user_id = $1 AND verb_id = $2',
    [userId, verbId]
  );
  return result.rows[0] || null;
};

export const findUserVerbMastery = async (userId: string): Promise<VerbMastery[]> => {
  const result = await query<VerbMastery>(
    'SELECT * FROM verb_mastery WHERE user_id = $1 ORDER BY verb_id ASC',
    [userId]
  );
  return result.rows;
};

export const updateVerbMastery = async (
  userId: string,
  verbId: number,
  updates: { mastery_level?: number; success_count?: number; last_attempted_at?: Date }
): Promise<void> => {
  const setClauses = ['updated_at = CURRENT_TIMESTAMP'];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.mastery_level !== undefined) {
    setClauses.unshift(`mastery_level = $${paramIndex++}`);
    values.push(updates.mastery_level);
  }

  if (updates.success_count !== undefined) {
    setClauses.unshift(`success_count = $${paramIndex++}`);
    values.push(updates.success_count);
  }

  if (updates.last_attempted_at !== undefined) {
    setClauses.unshift(`last_attempted_at = $${paramIndex++}`);
    values.push(updates.last_attempted_at);
  }

  values.push(userId, verbId);

  const sql = `UPDATE verb_mastery SET ${setClauses.join(', ')} WHERE user_id = $${paramIndex} AND verb_id = $${paramIndex + 1}`;
  await query(sql, values);
};

export const countUserVerbMastery = async (userId: string): Promise<number> => {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM verb_mastery WHERE user_id = $1',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};

export const bulkCreateVerbMastery = async (userId: string, verbIds: number[]): Promise<number> => {
  if (verbIds.length === 0) return 0;

  const values = verbIds.map((_, i) => `($1, $${i + 2})`).join(',');
  const params = [userId, ...verbIds];

  const result = await query(
    `INSERT INTO verb_mastery (user_id, verb_id) VALUES ${values} ON CONFLICT DO NOTHING`,
    params
  );
  return result.rowCount || 0;
};
