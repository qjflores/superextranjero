import { getPool } from './index.js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');

export interface Migration {
  name: string;
  content: string;
}

export const loadMigrations = (): Migration[] => {
  const migrationsDir = join(__dirname, '../../migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  return files.map((file) => ({
    name: file,
    content: readFileSync(join(migrationsDir, file), 'utf8'),
  }));
};

export const runMigrations = async () => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Create schema_migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrations = loadMigrations();

    for (const migration of migrations) {
      // Check if migration was already applied
      const result = await client.query('SELECT id FROM schema_migrations WHERE name = $1', [
        migration.name,
      ]);

      if (result.rows.length > 0) {
        console.info(`  ✓ ${migration.name} (already applied)`);
        continue;
      }

      // Apply migration
      try {
        await client.query(migration.content);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migration.name]);
        console.info(`  ✓ ${migration.name}`);
      } catch (err) {
        console.error(`  ✗ ${migration.name}:`, err);
        throw err;
      }
    }

    console.info('✓ All migrations applied successfully');
  } finally {
    client.release();
  }
};

// Auto-run on import if ENV flag is set
if (process.env.AUTO_MIGRATE === 'true') {
  runMigrations().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
