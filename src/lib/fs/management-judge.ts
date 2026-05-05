import { paths } from './paths';
import { listDir } from './reader';
import { loadMemory } from './subject';
import path from 'node:path';
import yaml from 'js-yaml';
import { promises as fs } from 'node:fs';
import type {
  JudgeInput,
  JudgeOutput,
  ManagementRule,
  ManagementRulesFile,
  MemoryBundle,
} from '@/types/core';

/**
 * Phase 0 の Management 判定エンジン。
 * 決定論的ロジック（LLMなし）。テーブル駆動方式（杉本本由来）+ Memory ON/OFF（Muratcan由来）。
 *
 * Memory ON のとき、出力に「subject 固有の補足」が加わることで
 * 「使うほど subject 固有化していく」を体感できる。
 *
 * 注：本エンジンは杉本本『データモデリングでドメインを駆動する』の SoM（System of Management）
 * の概念を Management Layer に汎用語化したもの。
 */
export async function judge(input: JudgeInput): Promise<JudgeOutput> {
  const { tenant_id, subject_id, decision_type, current_facts, use_memory } = input;

  // 1. ルール読み込み
  const rules = await loadAllRules(tenant_id);

  // 2. ルール評価（Phase 0：単純な any/all/default トリガー）
  // normalizeRuleFacts により、平坦な形式とネストされた形式の両方を受け付ける。
  const matched = evaluateRules(rules, normalizeRuleFacts(current_facts));

  // 3. Memory 読み込み（ON でも OFF でも件数は表示する）
  const memory = await loadMemory(tenant_id, subject_id);
  const memoryExcerpts: ReturnType<typeof extractRecentMemory> = use_memory
    ? extractRecentMemory(memory)
    : {
        personalization: undefined,
        failure_patterns: [],
        relevant_decisions: [],
        strong_experiences: [],
      };

  // 4. 出力レンダリング
  const rendered = renderOutput(
    decision_type,
    current_facts,
    matched,
    use_memory,
    memory,
    memoryExcerpts
  );

  return {
    decision_type,
    subject_id,
    use_memory,
    memory_referenced: {
      used: use_memory,
      counts: memory.counts,
      excerpts: memoryExcerpts,
    },
    rule_match: {
      matched_rule_id: matched?.rule_id ?? null,
      output: matched?.output ?? {},
    },
    rendered,
  };
}

async function loadAllRules(tenantId: string): Promise<ManagementRule[]> {
  const dir = paths.managementRulesDir(tenantId);
  const files = await listDir(dir);
  const all: ManagementRule[] = [];
  for (const f of files) {
    if (!f.endsWith('.yaml') && !f.endsWith('.yml')) continue;
    const text = await fs.readFile(path.join(dir, f), 'utf-8');
    const parsed = yaml.load(text) as ManagementRulesFile;
    all.push(...(parsed.rules ?? []));
  }
  return all;
}

/**
 * 平坦な facts とネストされた { facts: {...} } 形式の両方を受け付けるよう正規化する。
 * ルールエンジン境界でのみ呼び出す。元のオブジェクトは変更しない。
 *
 * 対応する2つの形式:
 *   flat:   { stakeholder_alignment: 3, rollout_risk: 4 }
 *   nested: { facts: { stakeholder_alignment: 3, rollout_risk: 4 } }
 *
 * ネスト形式の場合、facts キー配下のフィールドをトップレベルにマージして返す。
 * これにより、ルール YAML は常にベアフィールド名（例: rollout_risk）で記述できる。
 */
export function normalizeRuleFacts(
  input: Record<string, unknown>
): Record<string, unknown> {
  const nested = input['facts'];
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...input, ...(nested as Record<string, unknown>) };
  }
  return input;
}

export function evaluateRules(
  rules: ManagementRule[],
  facts: Record<string, unknown>
): ManagementRule | null {
  // ルールは記述順で評価。最初にマッチしたものを採用。
  // default は最後に評価。
  const nonDefault = rules.filter((r) => r.trigger !== 'default');
  const defaults = rules.filter((r) => r.trigger === 'default');

  for (const rule of nonDefault) {
    if (matchesRule(rule, facts)) return rule;
  }
  return defaults[0] ?? null;
}

function matchesRule(rule: ManagementRule, facts: Record<string, unknown>): boolean {
  if (!rule.conditions || rule.conditions.length === 0) return false;
  const trigger = rule.trigger ?? 'all';
  const results = rule.conditions.map((c) => evalCondition(c, facts));
  if (trigger === 'any') return results.some(Boolean);
  if (trigger === 'all') return results.every(Boolean);
  return false;
}

function evalCondition(
  cond: NonNullable<ManagementRule['conditions']>[number],
  facts: Record<string, unknown>
): boolean {
  const v = getByPath(facts, cond.field);
  if (v === undefined || v === null) return false;
  const numV = typeof v === 'number' ? v : Number(v);
  if (Number.isNaN(numV)) return false;

  const numTarget = typeof cond.value === 'number' ? cond.value : Number(cond.value);
  if (Number.isNaN(numTarget)) return false;

  let primary = false;
  switch (cond.op) {
    case '>=':
      primary = numV >= numTarget;
      break;
    case '>':
      primary = numV > numTarget;
      break;
    case '<=':
      primary = numV <= numTarget;
      break;
    case '<':
      primary = numV < numTarget;
      break;
    case '==':
      primary = numV === numTarget;
      break;
    default:
      return false;
  }
  if (!primary) return false;

  if (cond.op2 && cond.value2 !== undefined) {
    const numTarget2 = typeof cond.value2 === 'number' ? cond.value2 : Number(cond.value2);
    if (Number.isNaN(numTarget2)) return primary;
    let secondary = false;
    switch (cond.op2) {
      case '>=':
        secondary = numV >= numTarget2;
        break;
      case '>':
        secondary = numV > numTarget2;
        break;
      case '<=':
        secondary = numV <= numTarget2;
        break;
      case '<':
        secondary = numV < numTarget2;
        break;
    }
    return primary && secondary;
  }
  return primary;
}

function getByPath(obj: unknown, dotPath: string): unknown {
  return dotPath.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Memory から最新の personalization / failures / decisions / strong experiences を抽出する。
 * Phase 0 はシンプルに：
 *  - personalization.md は全文（短い前提）
 *  - failures は最新3件
 *  - decisions は最新3件
 *  - experiences は emotional_weight >= 7 のもの
 * Phase 1 で current_facts に基づく context-aware な extractRelevantMemory を別関数として追加予定。
 */
function extractRecentMemory(
  memory: MemoryBundle
) {
  return {
    personalization: memory.personalization || undefined,
    failure_patterns: memory.failures
      .slice(-3)
      .map((f) => `${f.what_went_wrong} → 予防策: ${f.prevention}`),
    relevant_decisions: memory.decisions
      .slice(-3)
      .map((d) => `${d.title}: ${d.decision}（理由: ${d.rationale}）`),
    strong_experiences: memory.experiences
      .filter((e) => e.emotional_weight >= 7)
      .map((e) => `[${e.emotional_weight}/10] ${e.insight}`),
  };
}

function renderOutput(
  decisionType: string,
  facts: Record<string, unknown>,
  matched: ManagementRule | null,
  useMemory: boolean,
  memory: MemoryBundle,
  excerpts: ReturnType<typeof extractRecentMemory>
): string {
  const lines: string[] = [];
  lines.push(`# ${decisionTypeLabel(decisionType)} — 判定結果\n`);

  lines.push(`## 1. 入力された事実 (facts)\n`);
  lines.push('```json');
  lines.push(JSON.stringify(facts, null, 2));
  lines.push('```\n');

  lines.push(`## 2. ルール照合\n`);
  if (matched) {
    lines.push(`- **マッチしたルール**: \`${matched.rule_id}\``);
    lines.push(`- **risk_level**: ${matched.output.risk_level ?? '—'}`);
    lines.push(`- **action**: ${matched.output.action ?? '—'}`);
    lines.push(`- **rationale**: ${matched.output.rationale ?? '—'}`);
  } else {
    lines.push('- マッチするルールなし（ルール定義の見直しが必要）');
  }
  lines.push('');

  lines.push(`## 3. Memory 参照（${useMemory ? 'ON' : 'OFF'}）\n`);
  lines.push(
    `- decisions: ${memory.counts.decisions}件 / failures: ${memory.counts.failures}件 / experiences: ${memory.counts.experiences}件 / personalization: ${memory.counts.has_personalization ? 'あり' : 'なし'}`
  );
  lines.push('');

  if (!useMemory) {
    lines.push(
      '> Memory を参照していないため、出力は **辞書層 + ルール + 当該事実** のみから生成された汎用的な内容です。'
    );
    lines.push(
      '> この subject の過去の判断・失敗・効いた進め方・反応パターンは反映されていません。'
    );
    lines.push('');
    lines.push(`## 4. 推奨アクション（汎用）\n`);
    lines.push(genericRecommendation(matched));
    return lines.join('\n');
  }

  // Memory ON
  lines.push(
    '> Memory を参照しているため、この subject 固有の過去資産が出力に反映されます。'
  );
  lines.push('');

  if (excerpts.personalization && excerpts.personalization.trim().length > 0) {
    lines.push('### 3.1 personalization.md（subject 固有の反応パターン）\n');
    lines.push('```markdown');
    lines.push(excerpts.personalization.trim());
    lines.push('```\n');
  }

  if ((excerpts.failure_patterns?.length ?? 0) > 0) {
    lines.push('### 3.2 過去の失敗パターン（最新 3 件）\n');
    for (const f of excerpts.failure_patterns!) {
      lines.push(`- ${f}`);
    }
    lines.push('');
  }

  if ((excerpts.relevant_decisions?.length ?? 0) > 0) {
    lines.push('### 3.3 関連する過去判断（最新 3 件）\n');
    for (const d of excerpts.relevant_decisions!) {
      lines.push(`- ${d}`);
    }
    lines.push('');
  }

  if ((excerpts.strong_experiences?.length ?? 0) > 0) {
    lines.push('### 3.4 強いエピソード（emotional_weight ≥ 7）\n');
    for (const e of excerpts.strong_experiences!) {
      lines.push(`- ${e}`);
    }
    lines.push('');
  }

  lines.push(`## 4. 推奨アクション（subject 固有化版）\n`);
  lines.push(personalizedRecommendation(matched, excerpts));
  return lines.join('\n');
}

function genericRecommendation(matched: ManagementRule | null): string {
  if (!matched) return '- ルール未マッチ。辞書層と判定ルールの確認が必要';
  const action = String(matched.output.action ?? '');
  const map: Record<string, string[]> = {
    governance_first_plan: [
      '- 責任分界と運用ルールを1枚に整理',
      '- 90日ロードマップを「誰が・いつ・何を決めるか」で引き直す',
      '- 現場向け資料と役員向け資料を分けて作る',
    ],
    executive_alignment_plan: [
      '- 役員向けの意思決定資料を先に作る',
      '- 費用対効果・リスク・現場負荷を1枚に圧縮',
      '- 担当者が社内説明に使える台本を渡す',
    ],
    rollout_enablement_plan: [
      '- 現場チャンピオンを1名決める',
      '- 展開単位を小さく切って最初の成功例を作る',
      '- 週次レビューの判断指標を固定する',
    ],
    standard_followup_plan: [
      '- 論点を3つに整理して次回アジェンダ化',
      '- 次回までの宿題を1つに絞る',
    ],
  };
  const lines = map[action] ?? ['- ルール出力に従って次アクションを設計'];
  return lines.join('\n');
}

function personalizedRecommendation(
  matched: ManagementRule | null,
  excerpts: ReturnType<typeof extractRecentMemory>
): string {
  const generic = genericRecommendation(matched);
  const personalNotes: string[] = [];

  if (excerpts.failure_patterns && excerpts.failure_patterns.length > 0) {
    personalNotes.push('### 注意（過去の失敗から）');
    for (const f of excerpts.failure_patterns) {
      personalNotes.push(`- ${f}`);
    }
  }

  if (excerpts.strong_experiences && excerpts.strong_experiences.length > 0) {
    personalNotes.push('');
    personalNotes.push('### この subject の効きどころ（強いエピソードから）');
    for (const e of excerpts.strong_experiences) {
      personalNotes.push(`- ${e}`);
    }
  }

  if (personalNotes.length === 0) {
    return generic + '\n\n> Memory が空または該当エントリなし。汎用と同等の出力です。';
  }

  return generic + '\n\n' + personalNotes.join('\n');
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
