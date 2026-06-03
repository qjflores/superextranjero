import { query } from '../index.js';

export interface User {
  user_id: string;
  email: string;
  password_hash?: string;
  created_at: Date;
  updated_at: Date;
  pool_seeded: boolean;
}

export const createUser = async (email: string, passwordHash?: string): Promise<string> => {
  const result = await query<{ user_id: string }>(
    'INSERT INTO "user" (email, password_hash) VALUES ($1, $2) RETURNING user_id',
    [email, passwordHash]
  );
  return result.rows[0].user_id;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query<User>(
    'SELECT * FROM "user" WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

export const findUserById = async (userId: string): Promise<User | null> => {
  const result = await query<User>(
    'SELECT * FROM "user" WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

export const updateUserPoolSeeded = async (userId: string): Promise<void> => {
  await query(
    'UPDATE "user" SET pool_seeded = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
    [userId]
  );
};

export const getAllUsers = async (): Promise<User[]> => {
  const result = await query<User>(
    'SELECT * FROM "user" ORDER BY created_at DESC'
  );
  return result.rows;
};

export const countUsers = async (): Promise<number> => {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM "user"'
  );
  return parseInt(result.rows[0].count, 10);
};
