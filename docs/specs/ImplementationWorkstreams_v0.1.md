# Implementation Plan & Workstreams — Survival Spanish (v1)

**Status:** Draft v0.1 · grounded in PRD v0.4, the Interface Contracts, and the Architecture

---

**Part of the Survival Spanish v1 specification suite. See also:**
- **PRD_v0.4.md** — product objectives and scope  
- **Architecture_v0.1.md** — system design and module boundaries
- **InterfaceContracts_v0.1.html** — capability boundaries and acceptance criteria
- **UserJourneys_v0.1.html** — concrete persona walkthroughs

---

## 1. Philosophy

Two kinds of work:

- **Foundation (F-streams):** thin spine every slice needs — repo, data layer, LLM gateway, auth, client shell. Built once, early.
- **Vertical slices (V-streams):** each delivers a usable path end-to-end. A slice is only "done" when a real user could complete it.

**Governing principle:** Build the walking skeleton first (V1), prove the loop works thin, then widen and deepen.

---

## 2. Current Scope: F1–F5 + `seed_verb_pool`

You are building **only the foundations (F1–F5) + the `seed_verb_pool` contract to support J5 (cold-start seeding).**

This is validation-first: prove the riskiest user (J5: zero verbs on day one) can onboard safely before proving the full loop.

**Do NOT build yet:**
- ❌ Full drill system (V1 `drill_verbs` with scaffold-and-fade)
- ❌ Missions or Competency Ladder (V1 `grade_mission`)
- ❌ High-stakes vetted path (V2)
- ❌ Audio production (V6)

**Do build:**
- ✅ F1: Repo + CI + monorepo
- ✅ F2: Postgres schema with `micro_scenario` tables
- ✅ F3: LLM Gateway (provider abstraction + guardrails)
- ✅ F4: Auth + API edge (minimal)
- ✅ F5: RN client shell (navigation, state)
- ✅ **`seed_verb_pool` contract:** Cold-start seeding end-to-end

---

## 3. Foundation Workstreams (F1–F5)

### F1 · Repo + CI + Monorepo
**Done when:** `git push` triggers CI; hello-world client reaches hello-world backend in staging.

### F2 · Data Layer (Postgres Schema)
**Critical tables:**
- `user` (user_id PK, pool_seeded BOOLEAN)
- `verb` (verb_id PK, infinitive, frequency_rank)
- `micro_scenario` (micro_scenario_id PK, verb_id FK)
- `user_micro_scenario_progress` (user_id, micro_scenario_id, completed_at, recognized BOOLEAN)

**Constraints (encode now):**
- `scenario: CHECK (NOT (stakes='high' AND route='live'))`
- `verb_mastery: UNIQUE(user_id, verb_id)`

**Done when:** Migrations run clean; schema supports seeding 20 micro-scenarios per user.

### F3 · LLM Gateway (⭐ Load-bearing)
**Must include:**
- Provider abstraction (≥2 providers switchable)
- Fallback provider
- Guardrail enforcement (reject high-stakes-on-live)
- Violation metering (`guardrail_violation_rate` metric)
- `generate_micro_scenario_intro` capability for cold-start

**Done when:** Micro-scenario intro request succeeds via 2+ providers; high-stakes-on-live is rejected in a test.

### F4 · Auth + API Edge (Minimal)
- Register, login (JWT or session)
- Protected routes require valid token

**Done when:** Client can register, authenticate, and reach protected routes.

### F5 · React Native Client Shell (Minimal)
- Navigation stack
- Session state management  
- On-device cache stub (structure ready, not fully wired)
- Basic cold-start seeding UI

**Done when:** App boots, authenticates, displays seeding screen, holds session state.

---

## 4. `seed_verb_pool` Contract Implementation

**Input:**
```
user_id: string
native_language: string (for recognition-mode glosses)
seed_target: 20
```

**Output:**
```
seeded_verbs: [string]
micro_scenarios_completed: int
mode: "recognition"        (NOT generation at true zero)
pool_ready_for_full: bool
```

**Verification checks (your acceptance tests):**
1. Every verb introduced inside a micro-scenario — never isolated drills
2. `mode == "recognition"` while pool < target
3. `pool_ready_for_full == true` only when ≥20 verbs seeded

**Failure modes to guard:**
- `E_CORPUS_MISSING`: no micro-scenario for a verb → block, don't fabricate
- `E_FORCED_GENERATION`: system demanded generation at zero → reject

**Done when:**
- New user completes ~15–20 micro-scenarios in recognition mode
- `pool_ready_for_full` returns `true`
- User's `verb_mastery` table reflects those 20 verbs

---

## 5. End-to-End Verification Test

1. **F1–F5 scaffolding complete:**
   - CI triggers on push
   - Client boots in staging
   - User can register and log in

2. **F3 LLM Gateway works:**
   - Micro-scenario intro request succeeds via Provider A, then Provider B (fallback)
   - High-stakes-on-live requests are rejected

3. **`seed_verb_pool` works end-to-end:**
   - Brand-new user (empty pool) enters app
   - System routes to `seed_verb_pool`
   - 20 micro-scenarios in recognition mode (no user production)
   - User "completes" each by recognizing verb (matching gloss, hearing)
   - System returns `pool_ready_for_full = true`
   - User's `verb_mastery` table shows 20 rows
   - Next step (entering a full scenario) is architecturally ready

**Pass criteria:**
- Seeding is complete, clear, non-punishing (recognition mode only)
- Verb pool is seeded and persisted
- Handoff to full scenarios is ready

---

## 6. What's Deferred

Explicitly NOT in this phase:
- Full V1 walking skeleton (drill → mission → mastery compound across scenarios)
- High-stakes vetted path
- Missions and ladder
- Curveballs and small talk
- Full audio production
- Speech recognition

These become the next phases once J5 cold-start is validated.

---

*(Draft v0.1. This narrower scope (foundations + J5) validates the riskiest user journey first. After cold-start works, proceed to V1 full loop, then V2–V6. Grounded in PRD v0.4, Architecture v0.1, and Interface Contracts.)*
