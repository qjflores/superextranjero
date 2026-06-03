import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from '../config/env.js';

let pool: Pool;

export const initializePool = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: config.database.url,
    min: config.database.poolMin,
    max: config.database.poolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializePool() first.');
  }
  return pool;
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = undefined as any;
  }
};

export interface QueryOptions {
  timeout?: number;
}

export const query = async <T extends any = any>(
  sql: string,
  values?: any[],
  options?: QueryOptions
): Promise<QueryResult<T>> => {
  const p = getPool();
  try {
    return await p.query<T>(sql, values);
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  const p = getPool();
  return p.connect();
};

export default { initializePool, getPool, closePool, query, getClient };
