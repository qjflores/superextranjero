-- Core tables for Survival Spanish (F2)

CREATE TABLE "user" (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pool_seeded BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_user_email ON "user"(email);

-- Verbs: core vocabulary set (100 verbs for v1)
CREATE TABLE verb (
  verb_id SERIAL PRIMARY KEY,
  infinitive TEXT NOT NULL UNIQUE,
  frequency_rank INT NOT NULL,
  difficulty_level INT DEFAULT 1,
  en_translation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verb_frequency_rank ON verb(frequency_rank);
CREATE INDEX idx_verb_infinitive ON verb(infinitive);

-- Micro-scenarios: one-verb situations for cold-start seeding (J5)
CREATE TABLE micro_scenario (
  micro_scenario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verb_id INT NOT NULL REFERENCES verb(verb_id),
  title TEXT NOT NULL,
  description TEXT,
  context_text TEXT,
  difficulty_level INT DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_micro_scenario_verb_id ON micro_scenario(verb_id);

-- User progress through micro-scenarios (recognition mode)
CREATE TABLE user_micro_scenario_progress (
  user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  micro_scenario_id UUID NOT NULL REFERENCES micro_scenario(micro_scenario_id) ON DELETE CASCADE,
  completed_at TIMESTAMP,
  recognized BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, micro_scenario_id)
);

CREATE INDEX idx_user_micro_progress_user_id ON user_micro_scenario_progress(user_id);
CREATE INDEX idx_user_micro_progress_completed ON user_micro_scenario_progress(user_id, completed_at);

-- Schema versions tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
