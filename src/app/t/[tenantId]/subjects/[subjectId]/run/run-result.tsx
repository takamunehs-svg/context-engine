import type { JudgmentOutputV2 } from "@/lib/judgment-output";
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────
// RunResult — 実運用向けの判定結果ビュー
// 結論ベース：推奨アクション・注意点・効きどころのみ
// 内部 ID やルール照合の詳細は「詳細を見る」折り畳みに格納
// ─────────────────────────────────────────────

export function RunResult({
  output,
  subjectName,
}: {
  output: JudgmentOutputV2;
  subjectName: string;
}) {
  const { recommendation } = output;

  return (
    <section className="space-y-6">
      <p className="label-mono">AI からの回答</p>

      {/* 次の一手 */}
      <article className="rounded-lg border border-[var(--accent-border)] bg-[var(--bg-elevated)] shadow-[0_0_32px_rgba(16,185,129,0.10)] p-8">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles
            className="h-4 w-4 text-[var(--accent-primary)]"
            strokeWidth={1.5}
          />
          <h2 className="text-lg font-medium text-[var(--fg)]">
            次の一手
          </h2>
        </div>
        {recommendation.generic.length > 0 ? (
          <ul className="space-y-3">
            {recommendation.generic.map((g, i) => (
              <li
                key={i}
                className="text-base text-[var(--fg)] flex gap-2.5 leading-relaxed"
              >
                <ArrowRight
                  className="h-4 w-4 mt-1 shrink-0 text-[var(--accent-primary)]"
                  strokeWidth={1.5}
                />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">
            ルール未マッチ。判定基準の確認が必要です。
          </p>
        )}
      </article>

      {/* 注意（過去の失敗から） */}
      {recommendation.cautions.length > 0 && (
        <article className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle
              className="h-4 w-4 text-[var(--fg-muted)]"
              strokeWidth={1.5}
            />
            <h2 className="text-base font-medium text-[var(--fg)]">
              {subjectName} で気をつけること
              <span className="text-xs font-mono text-[var(--fg-subtle)] ml-2">
                過去の失敗から
              </span>
            </h2>
          </div>
          <ul className="space-y-3">
            {recommendation.cautions.map((c, i) => (
              <li key={i}>
                <p className="text-sm text-[var(--fg)] leading-relaxed">
                  {c.headline}
                </p>
                {c.detail && (
                  <p className="text-xs text-[var(--fg-muted)] mt-1">
                    {c.detail}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </article>
      )}

      {/* 効きどころ（強いエピソード） */}
      {recommendation.leverages.length > 0 && (
        <article className="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-subtle)]/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles
              className="h-4 w-4 text-[var(--accent-primary)]"
              strokeWidth={1.5}
            />
            <h2 className="text-base font-medium text-[var(--fg)]">
              {subjectName} に効くこと
              <span className="text-xs font-mono text-[var(--fg-subtle)] ml-2">
                過去の成功から
              </span>
            </h2>
          </div>
          <ul className="space-y-3">
            {recommendation.leverages.map((l, i) => (
              <li key={i}>
                <p className="text-sm text-[var(--fg)] leading-relaxed">
                  {l.headline}
                </p>
              </li>
            ))}
          </ul>
        </article>
      )}

      {recommendation.cautions.length === 0 &&
        recommendation.leverages.length === 0 && (
          <p className="text-xs text-[var(--fg-subtle)] italic">
            {subjectName}{" "}
            への注意点・効くことはまだ蓄積されていません。支援後に「気づいたこと」を残していくと、次回から
            {subjectName} 専用のアドバイスが出るようになります。
          </p>
        )}

      {/* 詳細を見る（折り畳み） */}
      <details className="group rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/40 p-6">
        <summary className="cursor-pointer flex items-center gap-2 text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] select-none list-none">
          <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
          AI が見たもの・使ったルールを開く（裏側）
        </summary>
        <div className="mt-6 space-y-6">
          {/* meta */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] font-mono">
            <span className="text-[var(--fg-subtle)]">
              rule:{" "}
              <span className="text-[var(--fg)]">
                {output.rule_match.matched_rule_id ?? "—"}
              </span>
            </span>
            <span className="text-[var(--fg-subtle)]">
              memory:{" "}
              <span className="text-[var(--fg)]">
                {output.memory_counts.total} entries
                {output.memory_counts.has_personalization
                  ? " + personalization"
                  : ""}
              </span>
            </span>
            <span className="text-[var(--fg-subtle)]">
              audience:{" "}
              <span className="text-[var(--fg)]">{output.audience}</span>
            </span>
          </div>

          {/* 1. 入力された事実 */}
          <section>
            <h3 className="label-mono mb-2">1. 入力された事実</h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-mono">
              {Object.entries(output.input_facts)
                .filter(([, v]) => v !== undefined && v !== null && v !== "")
                .map(([k, v]) => (
                  <li key={k}>
                    <span className="text-[var(--fg-subtle)]">{humanKey(k)}</span>
                    <span className="mx-1 text-[var(--fg-subtle)]">:</span>
                    <span className="text-[var(--fg)]">{String(v)}</span>
                  </li>
                ))}
            </ul>
          </section>

          {/* 2. ルール照合 */}
          <section>
            <h3 className="label-mono mb-2">2. ルール照合</h3>
            {output.rule_match.matched_rule_id ? (
              <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-1 text-xs">
                <dt className="text-[var(--fg-subtle)]">rule id</dt>
                <dd className="font-mono text-[var(--fg)]">
                  {output.rule_match.matched_rule_id}
                </dd>
                {output.rule_match.risk_level && (
                  <>
                    <dt className="text-[var(--fg-subtle)]">risk level</dt>
                    <dd className="text-[var(--fg)]">
                      {output.rule_match.risk_level}
                    </dd>
                  </>
                )}
                {output.rule_match.action && (
                  <>
                    <dt className="text-[var(--fg-subtle)]">action</dt>
                    <dd className="font-mono text-[var(--fg)]">
                      {output.rule_match.action}
                    </dd>
                  </>
                )}
                {output.rule_match.rationale && (
                  <>
                    <dt className="text-[var(--fg-subtle)]">rationale</dt>
                    <dd className="text-[var(--fg-muted)]">
                      {output.rule_match.rationale}
                    </dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="text-xs text-[var(--fg-muted)]">
                マッチするルールなし
              </p>
            )}
          </section>

          {/* 3. 参照した取扱い説明書 */}
          {output.memory_sections.length > 0 && (
            <section>
              <h3 className="label-mono mb-2">
                3. 参照した {subjectName} の取扱い説明書
              </h3>
              <div className="space-y-3">
                {output.memory_sections.map((s) => (
                  <div
                    key={s.kind}
                    className="rounded-md border border-[var(--border-color)] p-3"
                  >
                    <p className="text-xs font-mono text-[var(--fg-muted)] mb-2">
                      {s.title}
                    </p>
                    {s.items.length > 0 && (
                      <ul className="space-y-1.5">
                        {s.items.map((item, i) => (
                          <li key={i} className="text-xs">
                            <p className="text-[var(--fg)]">{item.headline}</p>
                            {item.detail && (
                              <p className="text-[var(--fg-muted)] mt-0.5">
                                {item.detail}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {s.raw_text && (
                      <pre className="mt-2 text-[10px] whitespace-pre-wrap leading-relaxed text-[var(--fg-muted)] font-sans border border-[var(--border-color)] rounded p-2 bg-[var(--bg)]">
                        {s.raw_text.trim()}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </details>
    </section>
  );
}

function humanKey(key: string): string {
  const labels: Record<string, string> = {
    stakeholder_alignment: "意思決定者の納得度",
    operating_clarity: "運用設計の明確さ",
    field_readiness: "現場の準備度",
    rollout_risk: "展開リスク",
  };
  return labels[key] ?? key.replace(/_/g, " ");
}
