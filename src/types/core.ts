// context-engine 共通型
// 階層：context-engine → Tenant（N社）→ Subject（A社/B社/C社）

export type SubjectId = string;
export type TenantId = string;
export type TemplateId = string;

// ─────────────────────────────────────────
// Tenant / Subject メタ情報
// ─────────────────────────────────────────

export interface TenantMeta {
  tenant_id: TenantId;
  display_name: string;
  applied_template: TemplateId;
  template_version: string;
  created_at: string;
  description?: string;
  subjects: SubjectMeta[];
}

export interface SubjectMeta {
  id: SubjectId;
  label: string;
  memory_depth?: 'thick' | 'medium' | 'thin' | 'empty';
}

export interface SubjectProfile {
  subject_id: SubjectId;
  display_name: string;
  type?: string;
  since?: string;
  primary_concern?: string;
  medical_notes?: string[];
  demographics?: Record<string, unknown>;
  goals?: string[];
  session_frequency?: string;
  body: string; // Markdown 本文
  raw: string;  // 元ファイル全文
}

// ─────────────────────────────────────────
// 辞書層（Dictionary）
// ─────────────────────────────────────────

export interface DictionarySchema {
  version: string;
  description: string;
  sections: Record<string, { description: string; files: string[] }>;
  edit_policy: {
    who: string;
    frequency: string;
    read_only_for_ai: boolean;
  };
}

export interface DictionaryEntry {
  path: string;          // dictionary 配下の相対パス
  format: 'yaml' | 'md';
  data: unknown;         // YAML の場合：パース結果 / MD の場合：frontmatter + body
}

// ─────────────────────────────────────────
// SoA（System of Activity・append-only）
// ─────────────────────────────────────────

export type EventType = 'session' | 'measurement' | 'intake' | 'correction' | 'archive';

export interface SoAEventContext {
  facts?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  refs?: string[];
  snapshot?: unknown;
}

export interface SoAEvent {
  id: string;
  event_type: EventType;
  subject_id: SubjectId;
  recorded_at: string;
  context: SoAEventContext;
}

// ─────────────────────────────────────────
// SoM（System of Management・版管理）
// ─────────────────────────────────────────

export type DecisionType = 'intervention_plan' | 'weekly_review' | 'medical_referral';

export interface SoMRule {
  rule_id: string;
  trigger?: 'any' | 'all' | 'default';
  conditions?: Array<{
    field: string;
    op: string;
    value: unknown;
    op2?: string;
    value2?: unknown;
  }>;
  output: Record<string, unknown>;
}

export interface SoMRulesFile {
  version: string;
  description: string;
  rules: SoMRule[];
}

// ─────────────────────────────────────────
// Episodic Memory（append-only・subject別）
// ─────────────────────────────────────────

export type MemoryKind = 'decisions' | 'failures' | 'experiences' | 'personalization';

export interface MemoryDecision {
  id: string;
  recorded_at: string;
  title: string;
  context: string;
  alternatives_considered: string[];
  decision: string;
  rationale: string;
  outcome?: string;
}

export interface MemoryFailure {
  id: string;
  recorded_at: string;
  what_went_wrong: string;
  root_cause: string;
  prevention: string;
  pattern_tags: string[];
}

export interface MemoryExperience {
  id: string;
  recorded_at: string;
  insight: string;
  emotional_weight: number; // 1-10
  tags: string[];
}

export interface MemoryBundle {
  decisions: MemoryDecision[];
  failures: MemoryFailure[];
  experiences: MemoryExperience[];
  personalization: string; // Markdown 本文
  counts: {
    decisions: number;
    failures: number;
    experiences: number;
    has_personalization: boolean;
    total: number;
  };
}

// ─────────────────────────────────────────
// SoM 判定エンジン
// ─────────────────────────────────────────

export interface JudgeInput {
  tenant_id: TenantId;
  subject_id: SubjectId;
  decision_type: DecisionType;
  current_facts: Record<string, unknown>; // 今回の判定対象の事実
  use_memory: boolean; // Memory ON/OFF
}

export interface JudgeOutput {
  decision_type: DecisionType;
  subject_id: SubjectId;
  use_memory: boolean;
  memory_referenced: {
    used: boolean;
    counts: MemoryBundle['counts'];
    excerpts: {
      personalization?: string;
      failure_patterns?: string[];
      relevant_decisions?: string[];
      strong_experiences?: string[];
    };
  };
  rule_match: {
    matched_rule_id: string | null;
    output: Record<string, unknown>;
  };
  rendered: string; // 最終的な人間可読出力（Markdown）
}
