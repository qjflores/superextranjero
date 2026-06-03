# Architecture — Survival Spanish

**Status:** Draft v0.1 · grounded in PRD v0.4, the Agent Charter, the Interface Contracts, and the User Journeys

---

**Part of the Survival Spanish v1 specification suite. See also:**

- **PRD_v0.4.md** — product objectives, scope, risks, metrics
- **ImplementationWorkstreams_v0.1.md** — build sequencing and vertical slices
- **InterfaceContracts_v0.1.html** — capability boundaries and contract schemas
- **UserJourneys_v0.1.html** — concrete persona walkthroughs

---

## 1. Guiding Constraints

The architecture is shaped by four product facts, not by technology preference:

1. **Mobile-first, in-the-moment use.** The user reaches for this standing in a checkout line.
2. **AI-native, multi-provider.** Content is generated live at runtime, not served from a static database.
3. **The #1 risk is consequential-content authenticity.** High-stakes phrasing must never be generated unguarded.
4. **Effort must compound.** The shared verb mastery pool is durable, relational, cross-scenario state.

---

## 2. High-Level Shape

**Client:** React Native (iOS + Android from one codebase)  
**Backend:** Modular monolith for v1 — one deployable with hard module boundaries  
**Model access:** LLM Gateway that abstracts providers and enforces guardrails  
**Persistence:** PostgreSQL (system of record), Redis (hot state), object storage (audio/media)

---

## 3. The LLM Gateway — Load-Bearing Piece

This is where the #1 risk is enforced. It has three jobs:

**a) Provider abstraction.** Product code requests a _capability_, not a named model. The gateway maps that to a provider/model based on policy.

**b) Guardrail enforcement.** Refuses to generate high-stakes content on the live path—must be pre-routed to vetting or the gateway rejects it.

**c) Violation metering.** Emits `guardrail_violation_rate` metric on every guardrail failure.

**Design consequence:** No module may call a provider directly. Bypassing the gateway bypasses the safety boundary.

---

## 4. Backend Modules (Mapped to Contracts)

| Module               | Owns Contracts                                                         | Responsibility                                       |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| **Scenario Router**  | `resolve_scenario`                                                     | Routes by stakes (vetted vs. live)                   |
| **Content Runtime**  | `provision_scenario` (live), `generate_curveball`, `rehearse_dialogue` | Live generation and adaptive role-play               |
| **Content Vetting**  | `provision_scenario` (vetted)                                          | Validated phrasing layer + native-review             |
| **Learning Content** | `seed_verb_pool`                                                       | Cold-start micro-scenarios (J5)                      |
| **Practice Engine**  | `drill_verbs`                                                          | Scaffold-and-fade ladder, verb mastery               |
| **Progression**      | `grade_mission`, `update_ladder`, `update_verb_mastery`                | Ladder state, shared mastery pool (effort compounds) |

---

## 5. Why a Modular Monolith for v1

At early stage the dominant risks are _moving slowly_ and _over-engineering_, not scale:

- **One deployable, one schema, easy local dev** — ship features without orchestrating a fleet
- **Transactional integrity for free** — updating ladder + shared verb pool is a single transaction
- **Hard module boundaries via contracts** — preserves the option to extract

**Extraction path:** Content Runtime splits out first (cost center + latency variable).

---

## 6. Persistence

**PostgreSQL is the system of record:**

- Shared verb mastery pool is relational, cross-scenario state
- Competency Ladder + mission outcomes are append-with-history
- Validated phrasing layer needs versioning, provenance, audit
- Spaced-repetition scheduling is just rows with `due_at`

**Redis** holds hot, ephemeral state: sessions, SR due-queue, rate limits, gen cache.

**Object storage** holds audio (produced + TTS) and media, referenced from Postgres by key.

---

_(Draft v0.1. The LLM Gateway is the load-bearing decision. Grounded in PRD v0.4 and the Interface Contracts.)_
