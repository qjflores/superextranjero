# Product Requirements Document — Survival Spanish

**Version:** 0.4 (Draft for review — cold-start seeding + pre-mission readiness folded in)

---

**Part of the Survival Spanish v1 specification suite. See also:**

- **Architecture_v0.1.md** — system design, LLM Gateway, persistence layer
- **ImplementationWorkstreams_v0.1.md** — build sequencing and vertical slices
- **InterfaceContracts_v0.1.html** — capability boundaries and contract schemas
- **UserJourneys_v0.1.html** — concrete persona walkthroughs

---

## 1. Objective & Vision

Build a **highly localized, mobile-first language acquisition tool** that fast-tracks absolute beginners _already living in Spain_ toward conversational survival competency.

The product combines two levers most apps ignore together:

1. **The 80/20 rule of language frequency** — master the small set of high-frequency verbs that drive the majority of daily interactions, instead of memorizing thousands of low-frequency words.
2. **Real-world immersion scenarios** — every piece of language is taught inside a hyper-local situation the user will actually face this week (Mercadona checkout, the extranjería office, the bus, the locutorio, the landlord's WhatsApp).

**The one-line vision:** _Get an absolute beginner through their next real-world Spanish interaction without freezing or reaching for Google Translate — and keep coaching them daily until they're not just surviving but belonging._

**Architectural stance — AI-native, not a static database.** The product is an **AI runtime**, not a fixed shelf of pre-written lessons. The model is a _live engine_ that surfaces scenarios on demand the moment a user asks, role-plays the cashier/landlord/funcionario as an adaptive conversation partner, and produces the off-script "curveballs" that turn rote survival into real fluency. A static content database can never do this; it can only ever re-skin Duolingo. **v1 is live-generative from day one, with tiered content discipline** (see §4.6, §6): a small pre-vetted set for high-stakes situations, live on-demand generation for the everyday long tail. Vetting scales to _stakes_, not applied uniformly.

**Community is part of the vision, deferred by design.** Because this persona faces the same scenarios repeatedly and shares a common predicament, the app has a real chance to build community (shared scenario libraries, mission leaderboards, peer encouragement). This is an explicit **v2+ vision**, not a v1 feature — community needs density to not feel empty, and would dilute the v1 wedge. v1 is built _community-ready_ (see §10) without committing to live social features.

**v1 scope is deliberately narrow:** Spain Spanish (Castellano) only, typing-first (no speech recognition), ~100 high-frequency verbs, and an AI generation pipeline gated behind mandatory native review.

---

## 2. The Core Problem

Traditional language apps (Duolingo, Babbel) fail immigrants living in the target country at three friction points:

**2.1 The Translation Gap.** They teach generic, grammatically-clean sentences ("The bear drinks milk") instead of the survival phrases a user needs _today_ ("Where do I collect my TIE card?"). The sentences are correct but useless at the moment of need.

**2.2 The Context Gap.** They teach isolated, textbook vocabulary divorced from the local situational script. A user may know that _bolsa_ means "bag," yet still freeze when a Mercadona cashier asks _"¿Quieres bolsa?"_ at speed — because they never learned the **exact phrasing, register, and rhythm** of that specific interaction. Knowing the word is not knowing the script.

**2.3 The Overwhelm Gap.** They push users to memorize thousands of low-frequency words rather than mastering the ~100–200 high-frequency verbs that power the overwhelming majority of daily interactions. Breadth is mistaken for progress.

**The Fragment Trap (the status quo behavior we're replacing):** To cope, the user maintains a clumsy patchwork of tools — frantically switching between Google Translate, Apple Translate, and DeepL mid-conversation. This is slow, breaks eye contact, signals helplessness, and never builds retained competency. **We are competing against the translator app, not against Duolingo.**

---

## 3. Target Persona

**Profile.** An absolute beginner who has _recently and deliberately relocated to Spain_ — a **digital-nomad-visa or work-visa holder**, or a professional moved for a job — who urgently needs functional Spanish for daily life. Not a hobbyist, not a student planning a future trip — someone whose rent, groceries, and legal status depend on getting through interactions now.

**Jobs to be done.** Order food. Navigate public transit. Get through grocery checkout. Interact with landlords, pharmacists, and government officials — without freezing up.

**Primary pain.** High daily anxiety during basic micro-interactions, caused by a lack of _rapid retrieval_ of core verb forms inside specific local scenarios.

**What success feels like to them.** First, walking into a known scenario and getting through it solo. Then, going _beyond_ survival — handling the off-script question, making the small talk, being treated as a participant rather than a problem.

_(See PRD v0.4 full for complete risk mitigations, monetization model, success metrics, and open questions.)_
