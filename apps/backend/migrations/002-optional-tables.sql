-- Optional tables for full v1 loop (F3, Progression, etc.)
-- Applied after core tables, but may not all be used in F2

-- Scenarios: full situations beyond micro-scenarios (for V1+)
CREATE TABLE IF NOT EXISTS scenario (
  scenario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  route TEXT NOT NULL DEFAULT 'live' CHECK (route IN ('live', 'vetted')),
  stakes TEXT NOT NULL DEFAULT 'low' CHECK (stakes IN ('low', 'medium', 'high')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_live_high_stakes CHECK (NOT (stakes = 'high' AND route = 'live'))
);

CREATE INDEX IF NOT EXISTS idx_scenario_route ON scenario(route);
CREATE INDEX IF NOT EXISTS idx_scenario_stakes ON scenario(stakes);

-- Verb mastery: per-user, per-verb progression (global pool)
CREATE TABLE IF NOT EXISTS verb_mastery (
  user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  verb_id INT NOT NULL REFERENCES verb(verb_id) ON DELETE CASCADE,
  mastery_level INT DEFAULT 0,
  success_count INT DEFAULT 0,
  last_attempted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, verb_id),
  UNIQUE (user_id, verb_id)
);

CREATE INDEX IF NOT EXISTS idx_verb_mastery_user_id ON verb_mastery(user_id);

-- Scenario content: what is served when scenario is accessed
CREATE TABLE IF NOT EXISTS scenario_content (
  content_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenario(scenario_id) ON DELETE CASCADE,
  dialogue_json JSONB,
  gating_verb_ids INT[] NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scenario_content_scenario_id ON scenario_content(scenario_id);

-- Mission results: user's real-world outcomes
CREATE TABLE IF NOT EXISTS mission_result (
  mission_result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenario(scenario_id) ON DELETE CASCADE,
  rung TEXT NOT NULL CHECK (rung IN ('froze', 'survived_with_phone', 'survived_solo', 'handled_curveball', 'made_small_talk')),
  understood TEXT CHECK (understood IN ('first_try', 'repeated_once', 'not_understood')),
  attempt_number INT DEFAULT 1,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mission_result_user_id ON mission_result(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_result_scenario_id ON mission_result(scenario_id);

-- Spaced repetition schedule
CREATE TABLE IF NOT EXISTS sr_schedule (
  schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  verb_id INT NOT NULL REFERENCES verb(verb_id) ON DELETE CASCADE,
  due_at TIMESTAMP NOT NULL,
  interval INT DEFAULT 1,
  ease_factor FLOAT DEFAULT 2.5,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sr_schedule_user_id_due_at ON sr_schedule(user_id, due_at);
