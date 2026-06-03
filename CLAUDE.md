# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## Specification & Build Roadmap

**Current scope:** Build F1–F5 foundations to support J5 (cold-start seeding).

**Survival Spanish specifications are in `/docs/specs/`:**

- **InterfaceContracts_v0.1.html** — The `seed_verb_pool` contract (what you're implementing); capability boundaries and acceptance criteria
- **ImplementationWorkstreams_v0.1.md** — Workstream definitions, "Done when" criteria, and current scope (F1–F5 + cold-start only)
- **UserJourneys_v0.1.html** — J5 (cold-start seeding journey); concrete persona walkthroughs
- **PRD_v0.4.md** — Product context, objectives, and the cold-start pillar (PRD §5.0)
- **Architecture_v0.1.md** — System design, LLM Gateway, modular monolith, persistence

### How to Use the Specs

**When building a workstream:**
1. Read the "Done when" criteria in ImplementationWorkstreams_v0.1.md
2. Find the contract(s) it implements in InterfaceContracts_v0.1.html
3. Study the contract's "Verify · output" block — this is your acceptance test
4. Study the contract's "Failure modes" — guard against these
5. Code defensively; validate outputs against the contract

**Example:** When implementing `seed_verb_pool`:
- Contract: InterfaceContracts_v0.1.html, group A
- Input schema: user_id, native_language, seed_target=20
- Output schema: seeded_verbs[], micro_scenarios_completed, mode="recognition", pool_ready_for_full
- Checks: (1) verbs only in micro-scenarios, (2) mode is recognition at zero, (3) pool_ready_for_full gates exit
- Test: user completes 20 micro-scenarios → system returns pool_ready_for_full=true → verb_mastery table has 20 rows

### Current Build: Foundations for J5 Cold-Start

**Workstreams (in order):**
- **F1:** Repo + CI + monorepo (RN client + modular backend)
- **F2:** Data layer (Postgres schema including `micro_scenario`, `user.pool_seeded`)
- **F3:** LLM Gateway (provider abstraction + guardrails) ⭐ load-bearing
- **F4:** Auth + API edge (minimal; just enough for authenticated requests)
- **F5:** RN client shell (navigation, state, cold-start session state)

**Then:** Implement `seed_verb_pool` contract end-to-end

**Not yet:** drill, missions, ladder, high-stakes vetted path, audio, community, V1+ features

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
