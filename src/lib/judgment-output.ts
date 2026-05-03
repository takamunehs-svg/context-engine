// 出力レイヤーの責務分離（SPEC.md §5.5）
//
// データ層（management-judge.ts）と画面層（page.tsx）の間に、
// audience 別の出力整形を担う中間層を置く。
//
// audience：誰に向けた出力か。出力レベルで Memory の中身が抽出/抑制される。
//   - self   ：担当者本人（フル表示）
//   - team   ：テナント内同僚（生活制約・家族構成等を抑制）
//   - client ：subject 本人（過去 Memory は出さない、推奨アクションのみ）
//   - demo   ：デモ・第三者（仮名化）
//
// 画面は常に JudgmentOutputV2 を受け取って表示するだけ。
// audience フィルタの実装は本ファイル内で完結。
// → audience 切替時に画面コードはノータッチ。
//
// 実装ロードマップ：
//   Step 0.5：型定義 + audience='self' のみ実装。他は self にフォールバック
//   Step 1  ：画面を JudgmentOutputV2 ベースに書き直し
//   Step 2（今）：audience='team' / 'client' / 'demo' の Phase 0 実装
//
// audience 別の抽出基準（Phase 0 の最小決定 — 詳細は SPEC.md §5.4）：
//   - self  ：フル
//   - team  ：personalization.raw_text 抑制（他は維持）
//   - client：Memory セクション全空、cautions/leverages 空、generic のみ
//   - demo  ：client と同じ + subject_id を仮名化

import type { MemoryBundle, MemoryDecision, MemoryFailure, MemoryExperience } from '@/types/core';
import { judge } from './fs/management-judge';
import { loadMemory } from './fs/subject';

// ─────────────────────────────────────────────
// audience 定義
// ─────────────────────────────────────────────

export type Audience = 'self' | 'team' | 'client' | 'demo';

export const AUDIENCE_LABELS: Record<Audience, string> = {
  self: '担当者本人（フル表示）',
  team: 'テナント内同僚（生活制約等を抑制）',
  client: 'subject 本人（過去 Memory 非表示）',
  demo: 'デモ・第三者（仮名化）',
};

// ─────────────────────────────────────────────
// 出力データ構造
// ─────────────────────────────────────────────

export interface JudgmentBullet {
  headline: string;
  detail?: string;
  meta?: { weight?: number; tag?: string };
}

export type MemorySectionKind = 'personalization' | 'failures' | 'decisions' | 'experiences';

export interface JudgmentMemorySection {
  kind: MemorySectionKind;
  title: string;
  items: JudgmentBullet[];
  /** audience='self' のみ含める可能性のある生テキスト（personalization.md 等） */
  raw_text?: string;
}

export interface JudgmentRecommendation {
  /** ルールベースの汎用アクション（audience に依らない） */
  generic: string[];
  /** 過去失敗からの注意（audience に応じて中身が変わる） */
  cautions: JudgmentBullet[];
  /** 強いエピソードからの効きどころ（audience に応じて中身が変わる） */
  leverages: JudgmentBullet[];
}

export interface JudgmentOutputV2 {
  decision_type: string;
  decision_type_label: string;
  subject_id: string;
  audience: Audience;
  use_memory: boolean;

  /** 入力された事実 */
  input_facts: Record<string, unknown>;

  /** ルール照合結果 */
  rule_match: {
    matched_rule_id: string | null;
    risk_level?: string;
    action?: string;
    rationale?: string;
  };

  /** Memory 参照状況（counts は audience 問わず表示可） */
  memory_counts: MemoryBundle['counts'];

  /** Memory ON 時の sections（audience に応じて中身が変わる。OFF 時は空配列） */
  memory_sections: JudgmentMemorySection[];

  /** 推奨アクション */
  recommendation: JudgmentRecommendation;
}

// ─────────────────────────────────────────────
// 入力
// ─────────────────────────────────────────────

export interface BuildJudgmentOutputInput {
  audience: Audience;
  tenant_id: string;
  subject_id: string;
  decision_type: 'intervention_plan' | 'weekly_review' | 'medical_referral';
  current_facts: Record<string, unknown>;
  use_memory: boolean;
}

// ─────────────────────────────────────────────
// メイン関数
// ─────────────────────────────────────────────

export async function buildJudgmentOutput(
  input: BuildJudgmentOutputInput
): Promise<JudgmentOutputV2> {
  const raw = await judge({
    tenant_id: input.tenant_id,
    subject_id: input.subject_id,
    decision_type: input.decision_type,
    current_facts: input.current_facts,
    use_memory: input.use_memory,
  });

  const memory = await loadMemory(input.tenant_id, input.subject_id);

  // audience 別整形
  switch (input.audience) {
    case 'self':
      return formatForSelf(input, raw, memory);
    case 'team':
      return formatForTeam(input, raw, memory);
    case 'client':
      return formatForClient(input, raw, memory);
    case 'demo':
      return formatForDemo(input, raw, memory);
  }
}

// ─────────────────────────────────────────────
// audience='self' の整形
// ─────────────────────────────────────────────

function formatForSelf(
  input: BuildJudgmentOutputInput,
  raw: Awaited<ReturnType<typeof judge>>,
  memory: MemoryBundle
): JudgmentOutputV2 {
  const memory_sections: JudgmentMemorySection[] = [];

  if (input.use_memory) {
    if (memory.counts.has_personalization && memory.personalization.trim().length > 0) {
      memory_sections.push({
        kind: 'personalization',
        title: 'personalization（subject 固有の反応パターン）',
        items: [],
        raw_text: memory.personalization,
      });
    }

    const failures = memory.failures.slice(-3);
    if (failures.length > 0) {
      memory_sections.push({
        kind: 'failures',
        title: '過去の失敗パターン（最新 3 件）',
        items: failures.map(failureToBullet),
      });
    }

    const decisions = memory.decisions.slice(-3);
    if (decisions.length > 0) {
      memory_sections.push({
        kind: 'decisions',
        title: '関連する過去判断（最新 3 件）',
        items: decisions.map(decisionToBullet),
      });
    }

    const strongExp = memory.experiences.filter((e) => e.emotional_weight >= 7);
    if (strongExp.length > 0) {
      memory_sections.push({
        kind: 'experiences',
        title: '強いエピソード（emotional_weight ≥ 7）',
        items: strongExp.map(experienceToBullet),
      });
    }
  }

  const action = String(raw.rule_match.output.action ?? '');
  const generic = genericActionsForRule(action);

  const cautions: JudgmentBullet[] = input.use_memory
    ? memory.failures.slice(-3).map(failureToBullet)
    : [];

  const leverages: JudgmentBullet[] = input.use_memory
    ? memory.experiences
        .filter((e) => e.emotional_weight >= 7)
        .map(experienceToBullet)
    : [];

  return {
    decision_type: input.decision_type,
    decision_type_label: decisionTypeLabel(input.decision_type),
    subject_id: input.subject_id,
    audience: input.audience,
    use_memory: input.use_memory,
    input_facts: input.current_facts,
    rule_match: {
      matched_rule_id: raw.rule_match.matched_rule_id,
      risk_level: raw.rule_match.output.risk_level as string | undefined,
      action: raw.rule_match.output.action as string | undefined,
      rationale: raw.rule_match.output.rationale as string | undefined,
    },
    memory_counts: raw.memory_referenced.counts,
    memory_sections,
    recommendation: { generic, cautions, leverages },
  };
}

// ─────────────────────────────────────────────
// audience='team' の整形
// 担当者 self の出力から、subject の生活制約・家族構成等プライバシー寄りの
// 生テキスト（personalization.md 全文）だけを抑制。
// 失敗・判断・経験はチームレビューに必要なので維持。
// ─────────────────────────────────────────────

function formatForTeam(
  input: BuildJudgmentOutputInput,
  raw: Awaited<ReturnType<typeof judge>>,
  memory: MemoryBundle
): JudgmentOutputV2 {
  const base = formatForSelf(input, raw, memory);
  return {
    ...base,
    audience: 'team',
    memory_sections: base.memory_sections.map((s) =>
      s.kind === 'personalization'
        ? {
            ...s,
            title: 'personalization（チーム閲覧では生テキスト非表示）',
            raw_text: undefined,
            items: [
              {
                headline:
                  'subject の生活制約・家族構成等は担当者本人のみ閲覧可。チームレビューでは抽象化した方針のみ参照。',
              },
            ],
          }
        : s
    ),
  };
}

// ─────────────────────────────────────────────
// audience='client' の整形
// subject 本人向け：Memory セクションは出さない（プライバシー & 自分の過去
// を全部見たい用途ではない）。推奨アクションは generic のみ。
// ─────────────────────────────────────────────

function formatForClient(
  input: BuildJudgmentOutputInput,
  raw: Awaited<ReturnType<typeof judge>>,
  memory: MemoryBundle
): JudgmentOutputV2 {
  const base = formatForSelf(input, raw, memory);
  return {
    ...base,
    audience: 'client',
    memory_sections: [],
    recommendation: {
      generic: base.recommendation.generic,
      cautions: [],
      leverages: [],
    },
  };
}

// ─────────────────────────────────────────────
// audience='demo' の整形
// 第三者（営業デモ・採用面談・登壇等）向け：client 相当 + subject_id 仮名化。
// 個人特定可能な Memory は一切出さない。
// ─────────────────────────────────────────────

function formatForDemo(
  input: BuildJudgmentOutputInput,
  raw: Awaited<ReturnType<typeof judge>>,
  memory: MemoryBundle
): JudgmentOutputV2 {
  const client = formatForClient(input, raw, memory);
  return {
    ...client,
    audience: 'demo',
    subject_id: '[demo-subject]',
  };
}

// ─────────────────────────────────────────────
// 変換ヘルパー
// ─────────────────────────────────────────────

function failureToBullet(f: MemoryFailure): JudgmentBullet {
  return {
    headline: f.what_went_wrong,
    detail: `予防策: ${f.prevention}`,
    meta: { tag: f.pattern_tags?.[0] },
  };
}

function decisionToBullet(d: MemoryDecision): JudgmentBullet {
  return {
    headline: d.title,
    detail: `${d.decision}（理由: ${d.rationale}）`,
  };
}

function experienceToBullet(e: MemoryExperience): JudgmentBullet {
  return {
    headline: e.insight,
    meta: { weight: e.emotional_weight, tag: e.tags?.[0] },
  };
}

// ルール → 汎用アクション群（テンプレが提供すべき値だが、Phase 0 は management-judge.ts と同じ）
function genericActionsForRule(action: string): string[] {
  const map: Record<string, string[]> = {
    governance_first_plan: [
      '責任分界と運用ルールを1枚に整理',
      '90日ロードマップを「誰が・いつ・何を決めるか」で引き直す',
      '現場向け資料と役員向け資料を分けて作る',
    ],
    executive_alignment_plan: [
      '役員向けの意思決定資料を先に作る',
      '費用対効果・リスク・現場負荷を1枚に圧縮',
      '担当者が社内説明に使える台本を渡す',
    ],
    rollout_enablement_plan: [
      '現場チャンピオンを1名決める',
      '展開単位を小さく切って最初の成功例を作る',
      '週次レビューの判断指標を固定する',
    ],
    standard_followup_plan: [
      '論点を3つに整理して次回アジェンダ化',
      '次回までの宿題を1つに絞る',
    ],
  };
  return map[action] ?? ['ルール出力に従って次アクションを設計'];
}

function decisionTypeLabel(t: string): string {
  switch (t) {
    case 'intervention_plan':
      return '次アクション設計';
    case 'weekly_review':
      return '週次レビュー';
    case 'medical_referral':
      return 'エスカレーション判定';
    default:
      return t;
  }
}
