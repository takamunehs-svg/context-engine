// イベント表示用の汎用フォーマッター。
// 業界横断のメタプラットフォームとして、健康指導固有のフィールド名をハードコードしない。
// facts / inputs から自動的に主要キーを抽出して 1行サマリ + ノート + フォールバック JSON を返す。

import type { ActivityEvent } from "@/types/core";
import { humanizeKey } from "@/lib/labels";

export interface EventSummary {
  date: string; // ISO 日付部分のみ（YYYY-MM-DD）
  metrics: { key: string; value: string }[];
  notes: string; // inputs から推定したフリーテキスト
  hasMore: boolean; // metrics/notes に出ていない情報があるか
}

const NOTE_CANDIDATE_KEYS = [
  "notes",
  "note",
  "session_notes",
  "client_signal",
  "summary",
  "description",
  "comment",
];

const MAX_METRIC_VALUE_LEN = 40;

export function summarizeEvent(event: ActivityEvent): EventSummary {
  const facts = (event.context.facts ?? {}) as Record<string, unknown>;
  const inputs = (event.context.inputs ?? {}) as Record<string, unknown>;

  const date = event.recorded_at.split("T")[0] ?? event.recorded_at;

  // notes 推定：inputs の代表的なキーから順に
  let notes = "";
  for (const k of NOTE_CANDIDATE_KEYS) {
    const v = inputs[k];
    if (typeof v === "string" && v.trim().length > 0) {
      notes = v.trim();
      break;
    }
  }

  // metrics：facts のスカラー値を展開。nested object は 1段だけ flatten
  const metrics: { key: string; value: string }[] = [];
  for (const [k, v] of Object.entries(facts)) {
    if (isScalar(v)) {
      metrics.push({ key: humanizeKey(k), value: truncate(String(v)) });
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const [nk, nv] of Object.entries(v as Record<string, unknown>)) {
        if (isScalar(nv)) {
          metrics.push({
            key: humanizeKey(`${k}.${nk}`),
            value: truncate(String(nv)),
          });
        }
      }
    }
  }

  // hasMore 判定：refs / snapshot がある、または notes 以外の inputs キーがある
  const hasMore =
    Boolean(event.context.refs?.length) ||
    Boolean(event.context.snapshot) ||
    Object.keys(inputs).some((k) => !NOTE_CANDIDATE_KEYS.includes(k));

  return { date, metrics, notes, hasMore };
}

function isScalar(v: unknown): boolean {
  return (
    typeof v === "string" || typeof v === "number" || typeof v === "boolean"
  );
}


function truncate(s: string): string {
  if (s.length <= MAX_METRIC_VALUE_LEN) return s;
  return s.slice(0, MAX_METRIC_VALUE_LEN - 1) + "…";
}
