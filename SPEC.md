# context-engine SPEC.md

> Specification for the design philosophy and data model. The basis for implementation and design decisions.
> Related: `AGENTS.md` (working rules) / internal planning docs (progress and decisions — not in public repo)

---

## 0. Hierarchy model (most important — read first)

context-engine runs on **three tiers**. Do not conflate them.

```
┌─────────────────────────────────────────────────────┐
│ context-engine (the meta-platform = generic frame)   │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │ Tenant (e.g., Firm N)        │
        │ The consulting firms,        │
        │ trainers, clinics, S&C       │
        │ teams that adopt the frame.  │
        └──────────────┬──────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
   Subject A       Subject B       Subject C
   (Firm N's clients, athletes, learners)
```

### How each layer specializes

| Layer | What it holds | Granularity | Differs across A/B/C? |
|---|---|---|---|
| **Dictionary Layer** | Criteria, thresholds, reference models | **One per tenant** | ❌ Shared |
| **Activity Layer** | Field-activity logs | **Per subject** | ⭕ Values differ |
| **Management Layer** | Decisions and plans | **Per subject** | ⭕ Values differ |
| **Memory** | Decisions, failures, insights, subject-specific information | **Per subject** | ⭕⭕⭕ **Differs the most** |

### The core message

**"The conceptual frame (the schemas of Dictionary / Activity / Management / Memory) lives once per tenant. Only the per-subject values, history, and Memory entries accumulate in parallel. So nothing mixes, nothing breaks, and yet each subject becomes more and more personalized."**

That is the real mechanism behind "the more you use it, the better it gets." Even if Firm N takes on ten clients, the frame stays as one set. When a new client D arrives, the dictionary and schemas are reused as-is and only D's Memory starts from zero.

---

## 1. The design core

### 1.1 In one sentence

**As Episodic Memory accumulates per subject on top of the 3-layer architecture (Dictionary / Activity / Management Layer), the AI specializes into a collaborator dedicated to that subject — and we express this on the file system.**

### 1.2 The four source streams

| Source | Design contribution |
|---|---|
| Sugimoto, *Domain-Driven Data Modeling* (Japanese: 杉本『データモデリングでドメインを駆動する』) | The 3-layer responsibility split, the buffer concept, business-rule decoupling |
| Muratcan, *The File System Is the New Database* | File-system first, Progressive Disclosure, Format-Function Mapping, Episodic Memory |
| Kajiya, *How to build a business and an organization in the generative-AI era* (Japanese: 梶谷『生成AI時代を勝ち抜く事業・組織のつくり方』) | The "gets better with use" structure, MOAT, UX principles |
| Choudary, Parker, Van Alstyne, *Platform Revolution* | Core Interaction (Participants + Value Unit + Filter), Pull/Facilitate/Match, End-to-End Principle, Modularity, the four kinds of network effect, Curation, the eight Launch strategies, three Openness axes, four causes of market failure + Lessig's four tools, lifecycle metrics, and niche-specialization strategy |

### 1.3 The six non-negotiable principles

1. **File-system first** — the canonical record is MD/JSONL/YAML. The DB plays only supporting roles such as indexing or auth.
2. **3-layer responsibility split** — never mix Dictionary / Activity / Management. Memory is independent of all three.
3. **Append-only is non-negotiable** — `activity/events/` and `memory/*/*` cannot be UPDATED or DELETED. Corrections become new entries.
4. **Progressive Disclosure in two hops** — at most two hops to reach any information (ROUTING → MODULE → DATA).
5. **AI-Neutral** — the same plain text must work with Claude, GPT, Gemini, or a self-hosted model.
6. **Context Engineering > Prompt Engineering** — "what information does the AI need to make a correct decision, and how should it be structured so the AI actually uses it?"

---

### 1.4 Core Interaction (the starting point of platform design)

**A platform does not start by building several interactions at once. It starts from a single Core Interaction and layers more on later** (Platform Revolution Ch.3). LinkedIn began only with "professionals connecting" and added groups, recruiters, and posts later.

**The three components of a Core Interaction:**

```
Participants + Value Unit + Filter → Core Interaction
```

| Component | Meaning | What it is in context-engine |
|---|---|---|
| Participants | Producer (creates value) and Consumer (consumes value) | Producer = template author; Consumer = tenant (a consulting firm) |
| Value Unit | The unit a Producer creates and a Consumer consumes | An industry template (a Dictionary schema + an Activity schema + a set of Management rules) |
| Filter | The algorithm that delivers a Value Unit to the right Consumer | Industry, scale, specialty, existing template ratings |

### The Core Interaction of context-engine (decided)

**A1 = the flow of industry templates from template authors to tenants (consulting firms)** is fixed as the platform's Core Interaction (D-009 / 2026-04-29).

| Candidate | Producer | Consumer | Value Unit | Platform-ness | Position |
|---|---|---|---|---|---|
| **A1 (adopted)** | Template author | Tenant | Industry template | ◎ | **Core Interaction** |
| A2 | Tenant | Subject (client) | Guidance and decisions | ✕ (a pipeline) | **Tenant-internal tool** (off-platform) |
| A3 | Tenant (peer) | Tenant (peer) | Validated personalization patterns | ○ | **Second interaction layered in Phase 3+** |

### Phased rollout (Single-side strategy à la OpenTable / redBus)

OpenTable first delivered value as a reservation manager for restaurants (close to A2). Once enough restaurants were on board, it expanded to a consumer-facing reservation platform (closer to A1). context-engine takes the same path:

- **Phase 0–1**: complete the value of A2 (the tenant-internal tool) and bundle the health-coaching template as A1 seeding.
- **Phase 2**: scale A1 in earnest (template marketplace + curation mechanism).
- **Phase 3+**: layer A3 (peer-to-peer methodology sharing).

**Why A2 is positioned off-platform**: A2 is self-contained inside a tenant and produces no network effects. Putting it at the Core would freeze context-engine as a tool and forfeit licensing-based growth.

---

### 1.5 The three key functions: Pull / Facilitate / Match (Ch.3)

Three key functions make a Core Interaction stand up:

| Function | Role | Design responsibility in context-engine |
|---|---|---|
| **Pull** | Attract Producers and Consumers to the platform | Resolve chicken-or-egg, build feedback loops, piggyback on external networks |
| **Facilitate** | Make interactions easy (or deliberately hard, for quality) | Authoring tools, the level of friction, curation |
| **Match** | Connect the right Producer to the right Consumer | Data-driven matching, search, recommendations |

**Current weakness**: the context-engine design is **light on Match**. Auto-matching of templates ↔ industry/scale, peer-pattern sharing, and situational matching of Memory entries are not yet designed. Phase 1–2 must address them in earnest (a derivative of D-009).

---

### 1.6 End-to-End Principle and Modularity (Ch.3)

> *the core platform should be stable, simple, low-variety; application-specific features at the edge*

**Boundary between core and edge:**

| Layer | Character | What it includes |
|---|---|---|
| **Core platform** (thin, stable, low-variety) | Foundation shared by every tenant | The 3-layer + Memory responsibility split, the append-only rule, the JSONL/YAML/MD format spec, Progressive Disclosure 2-hops, the template-application mechanism, the file-access layer |
| **Edge** (high-variety, evolving) | Industry- and tenant-specific | Industry templates (Dictionary schema, Activity event types, Management rules), internal classification codes (`C1`–`C5`, `A`–`G`, `R0`–`R3`, etc.), Memory patterns |

**File specs as API**: context-engine's "file-system first" stance is consistent with Modularity. **Once schemas, rule definitions, and Memory formats are stable APIs**, third parties can develop templates independently.

**Alignment with prior decisions:**
- "Industry-specific classification codes do not belong in the meta-platform" — recorded as a decision in internal planning documents.
- Per advice from a patent attorney (April 2026): "industry-specific classification codes belong inside the template" — fully aligned.

---

### 1.7 The four kinds of network effect, and curation (Ch.2)

**The four kinds of network effect:**

| Type | Definition | Example in context-engine |
|---|---|---|
| Same-side positive | More users on the same side raises value | The more template authors, the more knowledge exchange among authors |
| Same-side negative | Too many on the same side lowers value | Too many similar templates make selection painful (a Phase 2 problem) |
| Cross-side positive | More on the opposite side raises value | More authors → more options for tenants; more tenants → more reach for authors |
| Cross-side negative | Too many on the opposite side lowers value | A flood of low-quality templates drives tenants away (a Phase 2 problem) |

**Curation = the only way to keep network effects positive:**
- Quality degrades with scale (the Chatroulette failure: no registration, no controls, the "Naked Hairy Men" problem collapsed it).
- OkCupid's tiered matching and Sittercity's verification are good examples of curation.
- For context-engine, **Phase 0–1 has a single Producer (the founder) so curation is unnecessary; Phase 2 introduces it in earnest** (D-011).

---

## 2. Responsibilities of the 3 layers + Memory

### 2.1 Dictionary Layer

**Universal principles, decision criteria, reference models.** The rules themselves.

| Aspect | Content |
|---|---|
| Edit cadence | Yearly |
| Edit authority | Industry-template authors and tenant administrators only; blocked by hooks |
| File format | MD (descriptions) + YAML (structured values) |
| Examples | Classification systems, decision thresholds, prescription caps, reference guidelines |
| Append-only? | No (version-controlled) |

**Important**: internal classification codes (`C1`–`C5`, `A`–`G`, etc.) are confined to the tenant's Dictionary Layer. They must not be carried into the meta-platform.

### 2.2 Activity Layer

**Field-activity records and ledger.** Observation, measurement, recording.

| Aspect | Content |
|---|---|
| Edit cadence | Per session, daily |
| Edit authority | Field operators |
| File format | JSONL (events) + MD (subject profiles) |
| Examples | Session records, measurements, intake forms, coaching notes |
| Append-only? | **Yes (non-negotiable)**. Corrections become new events |

**The "buffer" concept** (from Sugimoto): the smallest unit of business function is built around a buffer — a paired "occurrence event" and "resolution event."

> **From Sugimoto**: this layer corresponds to the *System of Activity (SoA)* in the same book; rebranded to a generic English term in D-007.

### 2.3 Management Layer

**Decisions, plans, and rules.** The layer that determines the next action.

| Aspect | Content |
|---|---|
| Edit cadence | Weekly to monthly |
| Edit authority | Managers |
| File format | MD (decision documents) + YAML (rule definitions) |
| Examples | Program design, progress assessment, intervention mix |
| Append-only? | No (**version-controlled**: v1, v2, ... with `superseded_by`) |

**Multi-dimensional, versioned, business rules** (from Sugimoto): unlike the Activity Layer, the Management Layer handles summaries, cubes, and the evolution of plans. Business rules are decoupled from the Activity Layer via dependency injection and table-driven design.

> **From Sugimoto**: this layer corresponds to the *System of Management (SoM)* in the same book; rebranded to a generic English term in D-007.

### 2.4 Episodic Memory

**Cross-cutting learning and decision history.** **The layer that specializes the most.**

| File | Format | Content |
|---|---|---|
| `decisions.jsonl` | JSONL | Decisions, rationale, alternatives, outcomes |
| `failures.jsonl` | JSONL | Failures, root causes, prevention measures |
| `experiences.jsonl` | JSONL | Insights with `emotional_weight` (1–10) |
| `personalization.md` | MD | Subject-specific reaction patterns, interventions that worked, communication preferences |

| Aspect | Content |
|---|---|
| Append-only? | **Yes (non-negotiable)** |
| Location | Under `memory/{subject_id}/` (separated per subject) |
| Role at Management Layer decision time | Always read first; produces the difference in output |

---

## 3. Data model — file layout

### 3.1 Repository structure (per tenant)

```
{tenant-root}/
├── INSTRUCTIONS/                    … the three Progressive Disclosure tiers
│   ├── ROUTING.md                   …  Level 1: "which module to read"
│   ├── DICTIONARY.md                …  Level 2: dictionary module instructions
│   ├── ACTIVITY.md                  …  Level 2: Activity Layer module instructions
│   ├── MANAGEMENT.md                …  Level 2: Management Layer module instructions
│   └── MEMORY.md                    …  Level 2: Memory module instructions
│
├── dictionary/
│   ├── _schema.yaml
│   ├── classifications/
│   ├── thresholds/
│   ├── references/
│   └── glossary.md
│
├── activity/
│   ├── _schema.yaml
│   ├── events/{YYYY-MM}/events.jsonl
│   └── subjects/{subject_id}.md
│
├── management/
│   ├── _schema.yaml
│   ├── rules/{rule_name}.yaml
│   ├── decisions/{subject_id}/{decision_id}_v{N}.md
│   └── plans/{subject_id}/{plan_id}.md
│
├── memory/
│   └── {subject_id}/
│       ├── decisions.jsonl
│       ├── failures.jsonl
│       ├── experiences.jsonl
│       └── personalization.md
│
├── exports/
└── README.md
```

### 3.2 Schema header line in every JSONL (Muratcan principle)

Every JSONL file carries a schema declaration on its first line:

```jsonl
{"_schema": "activity.event", "_version": "1.0", "_description": "Field-activity event. Append-only."}
{"id": "evt_2026-04-26_001", "type": "session", "subject_id": "client_001", "recorded_at": "2026-04-26T10:00:00Z", "context": {"facts": {...}, "inputs": {...}, "refs": [...]}}
{"id": "evt_2026-04-26_002", ...}
```

### 3.3 The four keys of `context` (from Sugimoto's "facts/inputs/refs/snapshot")

The `context` field of an Activity Layer event and a Management Layer decision is split into four keys. **Never mix them.**

| Key | Content | Decision rule |
|---|---|---|
| `facts` | Observations, measurements, system-computed values | "What was the case." Do not include human interpretation. |
| `inputs` | Values entered by a human via a form | "Why this was done", "what was chosen" |
| `refs` | References to the rationale | Dictionary keys, file paths, rule IDs |
| `snapshot` | A complete copy of UI state | For audit and reproducibility. **Never use for display.** |

---

## 4. Progressive Disclosure (Muratcan style)

### 4.1 The three loading tiers

| Level | What to read | When |
|---|---|---|
| **L1: ROUTING** | `INSTRUCTIONS/ROUTING.md` | Always loaded (lightweight) |
| **L2: MODULE** | `INSTRUCTIONS/{DICTIONARY,ACTIVITY,MANAGEMENT,MEMORY}.md` | When the task hits the corresponding module |
| **L3: DATA** | The actual data under `dictionary/`, `activity/`, `management/`, `memory/` | Only the slice required by the L2 instructions |

**At most two hops** to reach any piece of information.

### 4.2 Example `ROUTING.md` (health-coaching template)

```markdown
# ROUTING

## Module list

| Utterance pattern | Module to read |
|---|---|
| "Tell me about this client" / "How is {name} doing" | ACTIVITY → DATA: subjects/{name}.md |
| "What should we do next session" / "Help me design a prescription" | MANAGEMENT + DICTIONARY + MEMORY |
| "Past failure patterns" / "What to be careful about" | MEMORY → failures.jsonl |
| "Check the criteria" / "What's the threshold" | DICTIONARY |
```

---

## 5. The "specializes the more it is used" mechanism

### 5.1 Operating modes of a Management Layer decision

A Management Layer decision runs in two modes:

| Mode | Inputs | Output character |
|---|---|---|
| **Memory OFF** | Dictionary Layer + Management Layer rules + the relevant Activity Layer event | Generic, rule-based |
| **Memory ON** | The above + `memory/{subject_id}/*` | Specialized output that cites past decisions, failures, and reaction patterns |

### 5.2 The "feel-it" device on the Phase 0 UI

On the Management Layer decision screen:

1. A **Memory ON/OFF toggle** for reference.
2. **Side-by-side display of the two outputs.**
3. A **Memory entry-count badge** (e.g., "this subject has 12 Memory entries").

That makes "the more you use it, the better it gets" visible at a glance. **The single most powerful demo moment** in a sales conversation.

### 5.3 Phase 1 onward: behavior with an LLM connected

Prompt assembly:

```
[System]
{ROUTING.md}
{the relevant INSTRUCTIONS/*.md}

[Context — only when Memory is ON]
{memory/{subject_id}/personalization.md}
{the most recent N entries of memory/{subject_id}/decisions.jsonl}
{the relevant entries from memory/{subject_id}/failures.jsonl}
{the entries from memory/{subject_id}/experiences.jsonl with emotional_weight ≥ 7}

[Context — always]
{the relevant Dictionary Layer entries}
{the most recent Activity Layer events for the subject}
{the most recent Management Layer decisions for the subject}

[User]
{the current decision request}
```

The richer Memory becomes, the richer the Context — and the better the output.

### 5.4 Output-layer responsibility separation (a structural rule that prevents rewrites)

Place a **middle layer responsible for audience-specific output formatting** between the data layer (decision engines such as `management-judge.ts`) and the view layer (`page.tsx` / `*-result.tsx`).

```
[Data layer]                  [Middle layer]                [View layer]
Memory files          →      buildJudgmentOutput({   →     JSX rendering
Rules / dictionary           audience, ... })
                             → JudgmentOutputV2
                               (data already shaped
                                for that audience)
```

#### Placement

- Middle layer: `src/lib/judgment-output.ts`
- Primary types: `JudgmentOutputV2` / `JudgmentMemorySection` / `JudgmentBullet` / `JudgmentRecommendation`
- Primary function: `buildJudgmentOutput(input: BuildJudgmentOutputInput): Promise<JudgmentOutputV2>`

#### Design rules

1. **The view simply renders the structured data it receives from the middle layer.** It does not assemble raw Markdown, raw JSON, or raw Memory strings.
2. **The audience filter is implemented in the middle layer.** Switching audience does not touch the view code.
3. **The middle layer is responsible for extracting or suppressing Memory content according to the audience.**

#### The four audience levels (consistent with §9.2)

| audience | Target | How Memory is exposed |
|---|---|---|
| `self` | The operator themselves | Full display (full personalization, failure detail, decision rationale, experience body) |
| `team` | A colleague inside the same tenant | Suppress personal-life constraints and family details in personalization; summarize failures, decisions, and experiences |
| `client` | The subject themselves | Past Memory is not shown; only generic recommended actions |
| `demo` | Demos and third parties | Pseudonymize, replace concrete examples with samples |

#### Implementation roadmap

- **Step 0.5 (done: 2026-04-29)**: type definitions plus the `audience='self'` implementation. Other audiences fall back to `self`.
- **Step 1 (done: 2026-04-29)**: rewrite the views (`judge/page.tsx` + `judge-result.tsx`) to consume `JudgmentOutputV2`. The Activity section can follow the same pattern.
- **Step 2 (done: 2026-04-29)**: implement Phase 0 versions of `audience='team' / 'client' / 'demo'` plus the audience-selector UI (driven by URL parameter).

#### Phase 0 audience filter implementation

| audience | personalization | failures / decisions / experiences | recommendation | subject_id |
|---|---|---|---|---|
| `self` | Full text (`raw_text`) | All entries as bullets | `generic` + `cautions` + `leverages` | Real ID |
| `team` | One abstracted policy line only (raw_text suppressed) | All entries as bullets | `generic` + `cautions` + `leverages` | Real ID |
| `client` | Hidden | Hidden | `generic` only | Real ID |
| `demo` | Hidden | Hidden | `generic` only | Replaced with `[demo-subject]` |

- `memory_counts` is preserved for every audience (to honor R-5 "your data is yours" — at least the count is transparent).
- Phase 1 plans further refinement: summarize `team` experiences, pseudonymize subject display name and Activity for `demo`, rewrite from the subject's own perspective for `client`.

#### Why this principle pays off

- View code does not need to be rewritten when audiences expand.
- An LLM adapter layer (Phase 1) can be absorbed in the middle layer.
- New output destinations (PDF, email, client portal) reuse the same middle layer.

---

### 5.5 Curation mechanism (a Phase 2 design target)

To stop the network effects in §1.7 from going negative, curation is introduced when third-party templates start arriving in Phase 2.

**The four curation layers** (from Ch.7 / Ch.8):

| Layer | Role | What it is in context-engine |
|---|---|---|
| Screening | Decide who is allowed in as a Producer | Certification of template authors (vetting acupuncture / S&C / education credentials, etc.) |
| Feedback | Reinforce desirable behavior | Template ratings, usage logs, count of successful interactions |
| Reputation | Tune screening and feedback by past behavior | Author reputation score, failure history |
| Human gatekeeping + User-driven | Moderation + user review | Founder-led initial screening + tenant-rating aggregation |

**Operating principles:**
- Too open = a flood of garbage templates → tenant churn.
- Too closed = legitimate, educational templates are excluded → starvation.
- **"Combine human judgment with software to keep watching the boundary"** (lesson from Ch.7).

---

## 6. Industry templates

### 6.1 A template = a repository skeleton

Applying an industry template means placing the directory structure above with a sample dictionary, schema, and rule set.

### 6.2 Bundled in Phase 0: the health-coaching template

Located at `data/templates/health-coaching/`:

- `INSTRUCTIONS/`: routing for health coaching
- `dictionary/`: simplified versions of risk tiers, exercise classifications, nutrition criteria, etc.
- `activity/_schema.yaml`: three event types — session record, intake, measurement
- `management/rules/`: simple decision rules (for example, the conditions that require a `medical_check`)
- Sample data for one subject, including Activity, Management, and Memory

### 6.3 Structural responsibilities of a template

| Asset | Responsibility |
|---|---|
| `INSTRUCTIONS/*.md` | Progressive Disclosure routing for this industry |
| `dictionary/_schema.yaml` | Dictionary-Layer schema for this industry |
| `dictionary/**/*` | Decision criteria and reference models for this industry |
| `activity/_schema.yaml` | Activity-Layer event types and fields for this industry |
| `management/_schema.yaml` | Management-Layer decision types and fields for this industry |
| `management/rules/*.yaml` | Business rules for this industry |
| Internal classification codes (`C1`–`C5`, etc.) | Confined to this industry template |

---

## 7. Two-mode support (self-host / managed SaaS)

### 7.1 Self-host mode

| Aspect | Spec |
|---|---|
| Data placement | The tenant's environment (on-prem, the tenant's Vercel, the tenant's AWS) |
| Auth | Supabase Auth (connected to the tenant's Supabase) |
| Billing | Advisory contracts, template-update subscriptions, customization |
| Updates | Git pull, or one-click update |

### 7.2 Managed SaaS mode

| Aspect | Spec |
|---|---|
| Data placement | The central context-engine cluster (isolated per tenant) |
| Auth | Central Supabase Auth |
| Billing | Monthly subscription |
| Target | Lower-sensitivity individual operators (trainers, clinics, etc.) |

### 7.3 Both modes from the same codebase

Not implemented in Phase 0, but Phase 1 design will:

- Abstract the file-access layer into `LocalFs` / `RemoteFs`
- Make the auth provider configurable
- Support template updates via either a **delivery API** or a **Git pull**

---

## 8. Recurring revenue mechanism (Phase 2 onward)

How recurring revenue stays in place even in self-host:

| Revenue source | Mechanism |
|---|---|
| **Advisory contracts** | Monthly retainer; the user (a consultant) handles delivery directly |
| **Template-update subscription** | Periodic distribution of Dictionary-Layer, Management-Layer rule, and skill updates; license-key verification |
| **New skill distribution** | Additional Reference / Task skills |
| **Education program** | Onboarding training content |
| **Certification program** | A "context-engine certified advisor" credential |
| **Community access** | Discord / Slack |
| **Managed hosting** | Self-host setup and operations on behalf of tenants |
| **Custom template development** | Industry-specific customization |

---

## 9. What we do NOT do (Phase 0–1)

- Perfectionism
- Locking in a brand or trademark (the codename `context-engine` is fixed)
- Billing implementation
- Direct LLM calls (an adapter layer is added in Phase 1)
- Integration with the vertical product application (Phase 4)
- Detailed auth design (Phase 1 will use a stock Supabase Auth implementation only)
- Carrying internal classification codes (`C1`–`C5`, etc.) into the meta-platform
- **Diffusing the Core Interaction** (Phase 0–1 only does A2 plus A1 seeding; new interactions must be classified per §1.4 / R-11 first)
- **Accepting third-party templates without curation** (the Chatroulette failure pattern; wait for Phase 2 curation to stand up)
- **Driving decisions with vanity metrics** (registration counts, invitation counts must not be primary KPIs; the BranchOut failure pattern; see §14)

---

## 10. Glossary

| Term | Definition |
|---|---|
| Dictionary Layer | Universal principles, decision criteria, reference models. Edited yearly. |
| Activity Layer | Field-activity records and ledger. Append-only. Corresponds to *System of Activity (SoA)* in Sugimoto. |
| Management Layer | Decisions, plans, rules. Version-controlled. Corresponds to *System of Management (SoM)* in Sugimoto. |
| Episodic Memory | Decisions, failures, insights, subject-specific information. Append-only. |
| Buffer (残) | The smallest unit of business function; a paired occurrence event and resolution event. |
| The four `context` keys | facts / inputs / refs / snapshot |
| Progressive Disclosure | The three-tier load strategy ROUTING → MODULE → DATA. |
| Tenant | **Firm N** — the consulting firm, trainer, clinic, or S&C team that uses the context-engine framework. An independent user at the repository level. |
| Subject | **Firm N's client** — Client A, B, C, athlete, learner, etc. The entity that the Activity Layer, Management Layer, and Memory hang off. |
| Industry Template | A skeleton of dictionary, schema, and rules for a given industry. |
| Memory ON/OFF | Whether the Management Layer decision references that subject's Memory. |
| Self-host mode | A mode in which the tenant deploys and operates inside their own environment. |
| Managed SaaS mode | A mode in which a central context-engine cluster operates the deployment. |
| **Core Interaction** | The central interaction on a platform. Composed of Participants + Value Unit + Filter. |
| **Value Unit** | The unit of information / good / service produced and consumed. In context-engine: an industry template. |
| **Filter** | The algorithmic selection tool that delivers a Value Unit to the right Consumer. |
| **Pull** | The function that draws Producers and Consumers in. |
| **Facilitate** | The function that makes interactions easy (or deliberately hard, for quality). |
| **Match** | The function that pairs the right Producer with the right Consumer. |
| **End-to-End Principle** | A design principle: app-specific features belong at the edge, not in the core. |
| **Modularity** | A structure split between core (low-variety, stable) and edge (high-variety, evolving), connected by an API. |
| **Network Orchestrator** | A platform-type firm. Higher market multiplier than asset builders, service providers, or technology creators. |
| **Same-side / Cross-side network effects** | Value shifts driven by participant counts on the same or opposite side. Each can be positive or negative. |
| **Curation** | The selection, feedback, and reputation management that maintain quality, safety, and relevance. |
| **Anti-Design Principle** | A design stance that leaves room for unanticipated user behavior (e.g., Twitter hashtags). |
| **Multihoming** | The same user pursuing the same kind of interaction across multiple platforms. |
| **Switching costs** | The financial and non-financial cost of moving between platforms. |
| **Platform envelopment** | A competitive strategy that absorbs the features and users of an adjacent platform. |
| **Liquidity** | The state in which the minimum required Producers / Consumers are present and interactions complete with a high success rate. The most critical milestone of the startup phase. |
| **Interaction success / failure** | Whether a started interaction reaches a valuable outcome. |
| **Side switching** | A Consumer becoming a Producer (e.g., many Airbnb hosts were guests first). |
| **Smart metrics** | Metrics that are Actionable, Accessible, and Auditable. |
| **Vanity metrics** | Look-good metrics (registration counts, etc.) that fail to indicate business health. |
| **Single-side strategy** | A Launch strategy that delivers value as a tool to a single side first, then turns into a platform (OpenTable / redBus pattern). |
| **Seeding strategy** | A Launch strategy in which the platform itself produces or borrows the initial Value Units. |
| **Micromarket strategy** | A Launch strategy that starts with a small, dense market to secure interaction density (Facebook's Harvard origin, etc.). |

---

## 11. Launch strategy (Ch.5)

### 11.1 The Phase 0–1 strategy = Single-side + Seeding + Micromarket

| Strategy | How it is applied | Reference cases |
|---|---|---|
| **Single-side** | Complete the value of A2 (the tenant-internal tool), then expand to A1 | OpenTable started as a reservation manager for restaurants; redBus started as inventory management for bus operators |
| **Seeding** | The founder produces and bundles the first industry template | The Huffington Post's early hired writers, Quora's seeded editors, Reddit founders' fake profiles |
| **Micromarket** | Start from a single small, deep domain; expand to other industries later | Facebook starting at Harvard; Stack Overflow starting from programming |

### 11.2 Launch strategies we do NOT use, or postpone

| Strategy | Reason |
|---|---|
| Follow-the-rabbit | Already covered by Single-side |
| Piggyback | No suitable host platform exists; Fortune 500 enterprise clients are customers, not piggyback targets |
| Marquee | No funds for paying key Producers; revisit in Phase 2 |
| Producer evangelism | Adopted in Phase 2 when gathering template authors |
| Big-bang adoption | Considered for Phase 3+ launch events (an SXSW-like venue is required) |

### 11.3 Solving the chicken-or-egg problem

The chicken-or-egg of context-engine: "no template authors → no tenants; no tenants → no authors."

**Phase 0–1 solution**: the founder serves as **Producer and first Consumer**. The founder builds the first industry template, uses it with their own existing clients (e.g., a major sports organization), and exhibits the result as a live reference implementation.

### 11.4 Viral growth is not adopted for now

The four ingredients of viral growth (sender / value unit / external network / receiver) are fundamentally a poor fit for high-confidentiality consulting work (medical boundaries, personal data). A bounded form of "Building in Public" (broadcast with case-confidentiality removed) is treated on a separate axis; see internal `ai_era_business_framework.md`.

---

## 12. Openness design (Ch.7)

### 12.1 Three axes for evaluating Openness

| Axis | Phase 0–1 | Phase 2 | Phase 3+ |
|---|---|---|---|
| **Sponsor / Manager** | Proprietary (single-founder operation) | Stays proprietary | Stays proprietary (the licensing-business core) |
| **Developer** | Closed (no external API) | A Guardian-style API tier is opened | Approved-developer ecosystem |
| **User Producer (template authors)** | Founder only | Certified advisors (after screening) | Gradual opening to the community |

### 12.2 The Phase 2 Developer-API tier (a Guardian-model application)

| Tier | Content | Pricing / restrictions |
|---|---|---|
| Keyless | Read access to the publishable template skeleton and schema spec | Free |
| Approved | Certified advisors develop and distribute custom templates | Revenue share |
| Bespoke | Self-host support and custom assistance for Fortune 500 enterprise clients | Paid advisory |

### 12.3 What to Open vs. What to Own (decision axes for Phase 2 onward)

| Character of the external feature | Recommended decision | Example in context-engine |
|---|---|---|
| It is a primary value source | Own / acquire / build in-house | The health-coaching template and the integrated screening design (the core of the founder's premium template offering) |
| It could become a standalone platform | Own or substitute | The certification-program core, community operations |
| Temporary, distributed, individual value | External ownership is acceptable | Per-subject Memory inside an individual tenant |
| A generic feature that many developers reinvent | API-ize and standardize | The template-application mechanism, the export mechanism |

---

## 13. Governance (Ch.8 / a Phase 2-onward design target)

### 13.1 The four causes of market failure (in the context of context-engine)

| Cause | Concrete problem in context-engine | Design response |
|---|---|---|
| Information asymmetry | Outsiders cannot tell template quality or whether Memory entries are truthful | Template ratings, usage-log disclosure, evidence of results |
| Externalities | Author interests diverge from consumer interests (low-quality templates pushed for monetary incentives) | Revenue-sharing rules, quality-linked compensation |
| Monopoly power | A specific template standardizes too far and crowds out alternatives | Diversity rules, recommend coexistence of multiple templates |
| Risk | Bad templates → wrong clinical decisions → safety harm | Certification, insurance, allocation of liability for violations |

### 13.2 Lessig's four tools (applied to context-engine)

| Tool | What it becomes in context-engine |
|---|---|
| **Laws** | Terms of service, template-author agreements, code of conduct, suspension clauses for violations |
| **Norms** | Author-community culture, role progression (poster → reviewer → organizer; the iStockphoto pattern) |
| **Architecture** | Append-only enforcement, `edit_lock`, version control, the file-spec API |
| **Markets** | Revenue sharing, social currency (template ratings, certified-advisor credentials, donation points) |

### 13.3 Two principles of Smart Self-Governance (Ch.8)

1. **Internal transparency**: even an internal context-engine team exposes every feature as an API (the Amazon-Yegge-Rant pattern). This is two sides of the same coin as §1.6 Modularity.
2. **Participation**: external partners (template authors) are given a voice in decision-making. Avoid unilateral rule changes (the Keurig 2.0 failure).

### 13.4 The IAL (Intel Architecture Labs) Self-Governance Ten Principles (reference)

The IAL 10 principles are kept in internal reference materials and will be consulted when designing Phase 2 governance. Key points:
1. Give customers a voice in important decisions
2. Open standards stay open
3. Treat IP fairly
4. Communicate and keep a clear roadmap
5. Pre-announce strategic market entries; do not provide discriminatory information
6. Share risk on large investments
7. Promise early notice, not platform immutability
8. Make eligibility for differentiated benefits explicit
9. Promote partners' long-term financial health
10. As maturity grows, push decision-making outward from the core to the edge

---

## 14. Metrics (Ch.9)

### 14.1 Lifecycle-specific primary metrics

| Phase | Key question | Metric focus |
|---|---|---|
| **Startup (Phase 0–1)** | Is the Core Interaction working? | liquidity / matching quality / trust |
| **Growth (Phase 2)** | Can we scale without breaking growth or monetization? | producer/consumer ratio / LTV / interaction conversion / side switching |
| **Maturity (Phase 3+)** | Can we keep adding value and respond to competition? | developer extensions / breakout features / strategic data |

### 14.2 Phase 0–1 metrics in concrete terms

| Metric | How to measure | Meaning |
|---|---|---|
| **liquidity** | The success rate of interactions per template (the count of times a tenant actually accumulated Memory or executed a Management decision) | The first threshold for the platform to exist |
| **matching quality** | Match accuracy between template ↔ industry, symptoms ↔ knowledge references | The conversion rate from search to interaction |
| **trust** | The rate at which tenants execute decisions with Memory ON (the churn rate from Memory OFF) | The "it gets better with use" experience |

### 14.3 The three Smart-Metric conditions

| Condition | Meaning |
|---|---|
| **Actionable** | Drives the next action |
| **Accessible** | Understandable to the people gathering and using the data |
| **Auditable** | Accurate, meaningful, reflects the real user experience |

### 14.4 Vanity-metric blacklist

The following are not used as primary KPIs (D-014):
- Registered tenant count (registrations without activity are worthless)
- Cumulative template count (templates that nobody uses are worthless)
- Download / page-view counts
- Social-media followers / shares

**The final indicator**: "Are happy tenants on each side of the network repeatedly and increasingly engaging in value-creating interactions?" (Ch.9 conclusion)

---

## 15. Competitive strategy (Ch.10)

### 15.1 context-engine is not a "perfect winner-take-all" market

Diagnosis with the four winner-take-all forces:

| Force | Strength in context-engine | Implication |
|---|---|---|
| Supply economies of scale | Medium (template authoring has decent fixed cost; distribution is near-zero marginal cost) | Cannot strongly block competitors |
| Strong network effects | Medium-to-strong (more tenants on a single industry template → more Memory-pattern sharing → curation improves) | Strengthens once curation is functioning in Phase 2 |
| Multihoming / Switching costs | Medium (a tenant's Memory and Activity logs can be migrated, lowering switching costs; but stickiness rises as Memory accumulates) | Keep portability while creating gravity through Memory accumulation |
| Lack of niche specialization | **Weak — niche specialization works well** (industry-specific templates, scale-specific, specialty-specific) | **A market structure where multiple platforms coexist along industry lines** |

→ **Not a perfect winner-take-all. Leadership races happen per industry and per specialty** (D-015).

### 15.2 Niche-specialization strategy

| Effort | Content |
|---|---|
| Differentiate via industry-specific templates | Aim for the strongest template in each of: health coaching, team sports, education, clinics, corporate health management |
| The Vimeo model | Focus on tools for high-quality Producers (do not chase YouTube-style mass generalization) |
| The Airbnb-vs-Craigslist lesson | Compete on the quality of Facilitate and Match (a curated search experience, not an unmanaged list) |

### 15.3 The six Platform Competition Strategies (reference table)

Kept as a strategy toolbox for Phase 2 onward:

| # | Strategy | Expected use in context-engine |
|---|---|---|
| 1 | Prevent multihoming | Phase 2 late stage (lock in template authors) |
| 2 | Foster innovation, capture value | Phase 2–3 (open the roadmap to attract external developers; own the primary value sources) |
| 3 | Leverage data | Phase 2–3 (strategic data analysis) |
| 4 | Redefine M&A | Phase 3+ (decisions on acquiring adjacent platforms) |
| 5 | Platform envelopment | Phase 3+ (envelop adjacent domains) |
| 6 | Enhanced platform design | **Continuous from Phase 0–1** (win on Pull / Facilitate / Match quality) |

### 15.4 The 3D-chess view

Competition happens on three layers:
1. **Platform vs. Platform**: other methodology-distribution platforms.
2. **Platform vs. Partner**: cases where context-engine itself competes with a template author (warning: turning a partner-favorite feature into a core feature kills partner trust — Microsoft IE / the Amazon-Marketplace seller problem).
3. **Partner vs. Partner**: how competition between template authors is designed.
