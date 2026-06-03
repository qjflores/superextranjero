import { query } from '../index.js';

export interface Verb {
  verb_id: number;
  infinitive: string;
  frequency_rank: number;
  difficulty_level: number;
  en_translation?: string;
  created_at: Date;
}

export const createVerb = async (
  infinitive: string,
  frequencyRank: number,
  difficultyLevel: number = 1,
  enTranslation?: string
): Promise<number> => {
  const result = await query<{ verb_id: number }>(
    'INSERT INTO verb (infinitive, frequency_rank, difficulty_level, en_translation) VALUES ($1, $2, $3, $4) RETURNING verb_id',
    [infinitive, frequencyRank, difficultyLevel, enTranslation]
  );
  return result.rows[0].verb_id;
};

export const findVerbById = async (verbId: number): Promise<Verb | null> => {
  const result = await query<Verb>('SELECT * FROM verb WHERE verb_id = $1', [verbId]);
  return result.rows[0] || null;
};

export const findVerbByInfinitive = async (infinitive: string): Promise<Verb | null> => {
  const result = await query<Verb>('SELECT * FROM verb WHERE infinitive = $1', [infinitive]);
  return result.rows[0] || null;
};

export const findAllVerbs = async (): Promise<Verb[]> => {
  const result = await query<Verb>('SELECT * FROM verb ORDER BY frequency_rank ASC');
  return result.rows;
};

export const findVerbsByFrequencyRank = async (limit: number = 20): Promise<Verb[]> => {
  const result = await query<Verb>('SELECT * FROM verb ORDER BY frequency_rank ASC LIMIT $1', [
    limit,
  ]);
  return result.rows;
};

export const bulkInsertVerbs = async (
  verbs: Array<{
    infinitive: string;
    frequency_rank: number;
    difficulty_level?: number;
    en_translation?: string;
  }>
): Promise<number> => {
  if (verbs.length === 0) return 0;

  const values = verbs
    .map((v, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
    .join(',');

  const params = verbs.flatMap((v) => [
    v.infinitive,
    v.frequency_rank,
    v.difficulty_level || 1,
    v.en_translation || null,
  ]);

  const result = await query(
    `INSERT INTO verb (infinitive, frequency_rank, difficulty_level, en_translation) VALUES ${values}`,
    params
  );
  return result.rowCount || 0;
};

export const countVerbs = async (): Promise<number> => {
  const result = await query<{ count: string }>('SELECT COUNT(*) as count FROM verb');
  return parseInt(result.rows[0].count, 10);
};
