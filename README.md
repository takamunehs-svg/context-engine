# Context-Engine

> **The AI Operating System for Domain Experts.**
>
> Bring your industry. Own your knowledge. Stay AI-neutral.

---

## Why this exists

Every domain expert already runs this cycle:

1. **Assess** — using reference materials and guidelines
2. **Decide** — based on case-specific context
3. **Intervene** — with a chosen approach
4. **Record** — what happened, what was tried
5. **Learn** — from outcomes, failures, patterns

This isn't a new theory. It's what trainers, therapists, coaches,
medical professionals, lawyers, and consultants have always done.

**Context-Engine is the first software that maps to this natural cycle**
— making it AI-readable, append-only, and portable.

| Cycle step | Layer in Context-Engine |
|---|---|
| Reference materials | **Dictionary Layer** |
| Decisions | **Management Layer** |
| Field records | **Activity Layer** |
| Lessons learned | **Episodic Memory** |

---

## Six non-negotiable principles

1. **File-system first** — Data is MD / JSONL / YAML. Git-versioned. Zero lock-in.
2. **3-layer separation** — Dictionary / Activity / Management. Never mix.
3. **Append-only is sacred** — Activity events and Memory entries cannot be updated or deleted.
4. **Progressive Disclosure** — Routing → Module → Data, max 2 hops.
5. **AI-Neutral** — Works with Claude, GPT, Gemini, or local models.
6. **Context Engineering > Prompt Engineering** — Structure the materials, not the prompt.

---

## What makes Context-Engine different

- **3-layer separation by edit frequency** — Not by data type, not by access speed.
- **Append-only as audit trail** — Memory entries are evidence, not just history.
- **Plain-text portability** — Your knowledge stays yours. No vector lock-in.
- **Built for non-coders** — Domain experts encode their expertise without writing code.

---

## What's open / what's not

**Open (this repository):**
- Core architecture and file format specification
- Sample industry template (health coaching, simplified)
- Web UI for exploration and demo

**Closed (proprietary):**
- Production industry templates with full classification rules and thresholds
- Tenant data and customer-specific configurations
- Hosted SaaS infrastructure
- Advanced features for enterprise self-host clients

This follows the Linux × Red Hat model: open core, proprietary services.

---

## Status

- [x] **Phase 0**: File-system architecture, web UI, health-coaching sample template, Memory ON/OFF differentiation
- [ ] **Phase 1**: Multi-tenant, Supabase Auth, LLM adapter, second template (team sports)
- [ ] **Phase 2**: Template marketplace, certified advisors, governance layer
- [ ] **Phase 3+**: Open ecosystem, peer methodology sharing

---

## Built by

**Takamune Watanabe** — Licensed acupuncturist, anma-massage therapist
(Japan national licenses), NSCA-CSCS. 7+ years teaching at vocational
schools and government-accredited international institutions.

Building Context-Engine because no existing tool worked for the way
domain experts actually think.

---

## License

Phase 0–1: Proprietary. All rights reserved.
Phase 2+: Core layer planned for open-source release (MIT or Apache 2.0).

---

## Contact

- **GitHub Issues**: [Issues](https://github.com/takamunehs-svg/context-engine/issues)
  (recommended for technical questions and bug reports)
- **Email**: [takamune.contextengine@gmail.com](mailto:takamune.contextengine@gmail.com)
  (general inquiries, partnership, press)
- **X / Twitter**: To be added (handle migration in progress)

---

## Documentation

- 📘 [SPEC.md](SPEC.md) — Architecture and design specification
- 📗 [AGENTS.md](AGENTS.md) — AI agent working rules
- 🇯🇵 [SPEC_ja.md](SPEC_ja.md) / [AGENTS_ja.md](AGENTS_ja.md) — Japanese versions

---

## Internal documentation

Internal planning docs (strategic decisions, design history) are kept
private under proprietary business strategy. Public documentation is
limited to `README.md`, `SPEC.md`, `AGENTS.md`, and their Japanese
counterparts (`SPEC_ja.md`, `AGENTS_ja.md`).
