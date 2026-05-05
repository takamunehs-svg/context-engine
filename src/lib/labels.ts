/**
 * Shared field-label mapping for activity facts and judgment result display.
 *
 * Single source of truth — used by:
 *   src/lib/event-summary.ts
 *   src/app/t/[tenantId]/subjects/[subjectId]/judge/judge-result.tsx
 *
 * Fallback for unknown keys: snake_case → "space separated", dotted → " › ".
 */
const FIELD_LABELS: Record<string, string> = {
  session_date: "支援日",
  measured_date: "チェック日",
  duration_min: "時間",
  stakeholder_alignment: "意思決定者の納得度",
  operating_clarity: "運用設計の明確さ",
  field_readiness: "現場の準備度",
  rollout_risk: "展開リスク",
  milestone_progress_pct: "マイルストーン進捗",
  decision_latency_days: "意思決定の停滞日数",
  adoption_readiness: "定着準備度",
};

export function humanizeKey(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, " ").replace(/\./g, " › ");
}
