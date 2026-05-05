# context-engine — Agent Working Rules

Read at the start of every session:
- This file (`AGENTS.md`)
- `SPEC.md` (design philosophy and domain model specification)
- `src/types/database.ts` (canonical domain types, when present)
- `docs/internal/PLAN.md` (specification, progress, decision log — internal, not in public repo)

`CLAUDE.md` simply references this file via `@AGENTS.md`. The substance lives here.

---

## このプロジェクトの境界（Project Boundaries）

> 詳細は `事業OS/PROJECT_BOUNDARIES.md` 参照。

**管轄IN**：
- context-engine 本体の設計・実装
- 機能拡張（SPEC.md / AGENTS.md 等）
- 業界テンプレート（Dictionary / Activity / Management Layer）
- GitHub リポジトリ管理（コード側）
- ドキュメント整備

**管轄OUT（他プロジェクトに渡す）**：

- 英語圏SNSでの公開戦略（→ sns-strategy）
- メディア露出（→ 戦略室・content-strategy）
- 個人事業との接続（→ 戦略室で判断）
- マーケティング判断（→ sns-strategy / 戦略室）

### 振る舞いルール（越境禁止5原則）

1. 自分の管轄内のタスクのみ実装する
2. 管轄外のタスクは「[対象プロジェクト名] の管轄です」と一言返して終わる
3. 「他のプロジェクトも一気に進めるか？」と提案しない
4. 次のアクション提案は管轄内に限定する
5. 判断不能・横断判断が必要な場合は「戦略室に戻してください」と伝える

ユーザーが管轄外のタスクを依頼した場合：

- 作業しない
- 該当プロジェクトを示す
- 戦略室に戻すべきか判断する

### 作業ワークフロー制約

- `事業OS/` 配下の他プロジェクトのファイルを変更しない
- `事業OS/PROJECT_BOUNDARIES.md` を上書きしない（戦略室セッションのみ更新権限を持つ）
- 明示的なバッチ指示なしに広範なリファクタを開始しない
- 作業フローは常に **audit → fix plan → small batch → verification** の順で進める
- 1バッチ = 1セッション。バッチ外の作業を提案しない

---

## Project positioning

A meta-platform that lets you apply a 3-layer architecture
(Dictionary Layer / Activity Layer / Management Layer) plus
Episodic Memory (append-only) to **any industry or workflow**.

- A super-set above the vertical product application (a domain-specific deployment)
- A separate business, brand, and product (codename `context-engine`; the public brand will be decided after the trademark is registered)
- The vertical product application keeps running independently and is expected to be folded into this meta-platform later

### Hierarchy model (read first)

```
context-engine (the meta-platform)
    ↓
Tenant (e.g., Firm N — the consulting firm, trainer, or clinic that uses the framework)
    ↓
Subject (Client A / B / C, athlete, learner — Firm N's clients)
```

- **The schemas of the Dictionary Layer, Activity Layer, Management Layer, and Memory live once per tenant** (no cross-mixing).
- **Values, history, and Memory entries are kept per subject** and accumulate in parallel.
- **The more Memory accumulates per subject, the more the output specializes to that specific subject.**
- For details, read `SPEC.md §0`.

---

## R-1: Do not violate the responsibility split between the 3 layers and Memory

| Layer | Responsibility | Editing | Table |
|---|---|---|---|
| Dictionary Layer | Universal principles, criteria, reference models | Yearly cadence, blocked by hooks | `dictionary_entries` |
| Activity Layer | Field-activity records and ledger | append-only | `activity_events` |
| Management Layer | Decisions, plans, rules | Editable, version-controlled | `management_decisions` |
| Memory | Cross-cutting learning and decision history | append-only | `episodic_memory_entries` |

Do not mix them, and never UPDATE the Activity Layer.

## R-2: Append-only is non-negotiable

- `activity_events`: UPDATE/DELETE forbidden. Corrections are recorded as new events.
- `episodic_memory_entries`: UPDATE/DELETE forbidden. Append only.
- Any code that performs UPDATE/DELETE against the two tables above must be reviewed by a human, even when AI-generated (per S-5).

## R-3: Apply `tenant_id` to every table from day one

- Multi-tenant SaaS is assumed.
- All queries must filter by `tenant_id`.
- The cross-tenant guard helper lives at `src/lib/auth/tenant-guard.ts` (to be implemented in Phase 1).
- Reuse the `verifyXBelongsToTenant` pattern (decision D-026 in the vertical product application).

## R-4: Industry templates must remain swappable

- The `industry_templates` table packages a Dictionary Layer, an Activity Layer schema, and Management Layer rules.
- Internal classification codes (such as `C1`–`C5`, `A`–`G`, `R0`–`R3`) must NOT enter the meta-platform.
- These belong to the template author's scope.
- Per advice from a patent attorney (April 2026): industry-specific classification codes belong inside the template, not in the meta-platform.

## R-5: Data portability is first-class

- Every asset must be exportable as MD/JSONL.
- The design rejects vendor lock-in.
- "Your data is yours" is a core product message and must be preserved.
- When adding a new feature, always ask: "can this be exported to MD/JSONL?"

## R-6: AI-Neutral

- The structure must not depend on a specific LLM.
- Plain-text structures must work with Anthropic, OpenAI, Google, or a self-hosted model.
- Do not embed LLM calls directly in implementation; isolate them in an adapter layer when needed.

## R-7: Progressive Disclosure

- Never load full files all at once.
- Three steps: routing → module → real data.
- Documentation follows the same pattern (`CLAUDE.md` → individual `*.md` → real data).

## R-8: Do not put LLM inference inside the rule engine

- `src/lib/rules/*.ts` (planned) must encode Management Layer rules with `if/else` and tables.
- LLM calls are forbidden here.
- When adding a new rule, leave an `EvidenceRef` pointing to the canonical reference section.

## R-9: Confirm before adding heavy dependencies

- shadcn/ui, Radix, Zod, RHF, Framer Motion, and supabase-js are free to use.
- Any other new runtime dependency requires human confirmation.

## R-10: Record decision rationale in internal planning documents

- When a non-trivial judgment is reflected in code, add a decision-log entry (`D-XXX`) to the internal `PLAN.md`.
- **Each entry must start with the "value-tree leaves" it advances** (the value tree is maintained in the internal `PLAN.md`).
- Decisions that do not map to a leaf must be put on hold and confirmed with a human.

## R-11: Do not let the Core Interaction become diffuse (Platform Revolution Ch.3)

The Core Interaction of context-engine is **A1 = template author → tenant** (locked in by D-009). It is acceptable to layer additional interactions later (the LinkedIn pattern), but do not start with several at once.

Before adding any new feature, classify it as one of the following:

| Classification | Meaning | Treatment |
|---|---|---|
| **Reinforces the Core Interaction (A1)** | Directly strengthens template author → tenant flow | OK, proceed |
| **Layered interaction (A2 — tenant-internal tool)** | Lets the tenant work with their own subjects | Prioritize this in Phase 0–1 (Single-side strategy) |
| **New interaction (A3 etc.)** | Tenant ↔ tenant or another axis | **Postpone to Phase 3+**. Do not add in Phase 0–1. |
| **External interaction** | Completes outside the platform (e.g., a feature for the subject as an individual) | Position it as off-platform; do not build it inside context-engine |

Any feature added without this classification requires human review. See `SPEC.md §1.4` / `§11`.

---

## Confirm before doing

- Adding a new dependency to `package.json` (R-9)
- Editing authentication-related code (`src/lib/auth/`, `middleware.ts`, `src/proxy.ts`)
- Code that performs UPDATE/DELETE on `activity_events` or `episodic_memory_entries`
- Editing or adding migrations
- DB changes that affect existing tenants' schemas
- Locking in a brand name (the codename `context-engine` is fixed; do not pre-decide brands such as Atlas® / Strata® / Lattice® / Codex®)
- **Adding a new interaction (R-11 classification is required)**
- **Accepting third-party content without a curation mechanism** (in Phase 0–1 the Producer is the founder only; curation begins to operate in Phase 2 — see `SPEC.md §5.5`)
- **Expanding template intake when it changes governance** (see `SPEC.md §13`)
- **Adding UI for vanity metrics** (registration-count badges, cumulative counters, etc. — see `SPEC.md §14` / `D-014`)

## Security rules (inherited from the vertical product application's S-1 through S-5)

**S-1: No hardcoded secrets**
API keys, signing secrets, salts, and so on live only in `.env.local`. Do not write fallback values in code. The app must fail to start when the variable is missing.

**S-2: No direct operations against the production DB**
Destructive SQL (`DROP TABLE`, `DELETE FROM`, etc.) must not be executed by an AI agent. The agent stops at the plan stage; a human runs it under separate credentials.

**S-3: Separate dev and prod environments**
Supabase development and production databases must be technically separated. Do not design a setup where the same credentials reach both.

**S-4: Separate sessions for public content and secrets**
Do not mix a session that reads public Issues / READMEs with a session that handles production credentials.

**S-5: AI-generated code must be reviewed in these areas**
Authentication / authorization, DB migration, billing, deletion logic, CI/CD, MCP configuration, secret references, external integrations, and any code that violates append-only must be reviewed by a human, even when AI-generated.

---

## Do not

- Mix LLM inference into the rule engine (R-8)
- Place personal data, API keys, or tokens anywhere other than `.env.local` (S-1)
- Run destructive operations against the production DB automatically (S-2)
- Run UPDATE/DELETE against `activity_events` / `episodic_memory_entries` automatically (R-2 / S-5)
- Lock in a brand name or trademark (Phase 0–1 stays on the codename `context-engine`)
- Implement billing (deferred to Phase 2)
- Integrate with the vertical product application (deferred to Phase 4)
- **Diffuse the Core Interaction** (R-11 / `SPEC.md §1.4`)
- **Accept third-party templates without curation** (the Chatroulette failure pattern — `SPEC.md §5.5` / `§9`)
- **Surface vanity metrics (registration counts, etc.) as a primary KPI in UI** (the BranchOut failure pattern — `SPEC.md §14` / `D-014`)
- **Build several interactions simultaneously from the start** (Phase 0–1 only does A2 plus A1 seeding — see `SPEC.md §11`)

---

<!-- BEGIN:nextjs-agent-rules -->
# Notes on Next.js 16 (inserted by create-next-app)

This is NOT the Next.js you know.
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
