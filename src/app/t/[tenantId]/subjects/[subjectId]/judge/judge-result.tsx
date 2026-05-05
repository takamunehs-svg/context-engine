import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type {
  JudgmentOutputV2,
  JudgmentMemorySection,
  JudgmentBullet,
} from "@/lib/judgment-output";
import { humanizeKey } from "@/lib/labels";

// ─────────────────────────────────────────────
// JudgeResult
// JudgmentOutputV2 を受け取って構造化表示する。
// 画面はデータの形に依存しない（audience フィルタは中間層が担当）。
// ─────────────────────────────────────────────

export function JudgeResult({
  variant,
  title,
  subtitle,
  caption,
  icon,
  output,
}: {
  variant: "off" | "on";
  title: string;
  subtitle: string;
  caption: string;
  icon: ReactNode;
  output: JudgmentOutputV2;
}) {
  const isOn = variant === "on";
  return (
    <article
      className={`rounded-lg overflow-hidden flex flex-col ${
        isOn
          ? "border border-[var(--accent-border)] bg-[var(--bg-elevated)] shadow-[0_0_32px_rgba(16,185,129,0.10)]"
          : "border border-[var(--border-color)] bg-[var(--bg-elevated)]"
      }`}
    >
      {/* header */}
      <header
        className={`px-6 py-4 border-b ${
          isOn
            ? "border-[var(--accent-border)] memory-on-bg"
            : "border-[var(--border-color)]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={isOn ? "text-[var(--accent-primary)]" : "text-[var(--fg-muted)]"}>
              {icon}
            </span>
            <h3 className="text-base font-medium text-[var(--fg)]">{title}</h3>
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-mono ${
                isOn
                  ? "border border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
                  : "border border-[var(--border-color)] text-[var(--fg-muted)]"
              }`}
            >
              {subtitle}
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--fg-muted)]">{caption}</p>
      </header>

      {/* meta strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-2.5 bg-[var(--bg-subtle)]/50 border-b border-[var(--border-color)] text-[10px] font-mono">
        <span className="text-[var(--fg-subtle)]">
          rule:{" "}
          <span className="text-[var(--fg)]">
            {output.rule_match.matched_rule_id ?? "—"}
          </span>
        </span>
        <span className="text-[var(--fg-subtle)]">
          memory:{" "}
          <span className={isOn ? "text-[var(--accent-primary)]" : "text-[var(--fg)]"}>
            {output.use_memory
              ? `${output.memory_counts.total} entries${
                  output.memory_counts.has_personalization ? " + personalization" : ""
                }`
              : "—"}
          </span>
        </span>
        <span className="text-[var(--fg-subtle)]">
          audience: <span className="text-[var(--fg)]">{output.audience}</span>
        </span>
      </div>

      {/* body */}
      <div className="flex-1 px-6 py-6 overflow-auto max-h-[680px] space-y-6">
        {/* 1. 入力された事実 */}
        <Section heading="1. 入力された事実">
          <FactsList facts={output.input_facts} />
        </Section>

        {/* 2. ルール照合 */}
        <Section heading="2. ルール照合">
          <RuleMatchView ruleMatch={output.rule_match} />
        </Section>

        {/* 3. Memory 参照 */}
        {output.use_memory && output.memory_sections.length > 0 && (
          <Section heading="3. Memory 参照（subject 固有資産）">
            <div className="space-y-4">
              {output.memory_sections.map((s) => (
                <MemorySectionView key={s.kind} section={s} isOn={isOn} />
              ))}
            </div>
          </Section>
        )}
        {!output.use_memory && (
          <Section heading="3. Memory 参照">
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
              Memory を参照していないため、出力は <strong>辞書層 + ルール + 当該事実</strong> のみから生成された汎用的な内容です。
              <br />
              この subject の過去の判断・失敗・効いた進め方・反応パターンは反映されていません。
            </p>
          </Section>
        )}

        {/* 4. 推奨アクション */}
        <Section heading={`4. 推奨アクション${output.use_memory ? "（subject 固有化版）" : "（汎用）"}`}>
          <RecommendationView recommendation={output.recommendation} isOn={isOn} />
        </Section>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────
// 部品
// ─────────────────────────────────────────────

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="label-mono mb-3">{heading}</h4>
      {children}
    </section>
  );
}

function FactsList({ facts }: { facts: Record<string, unknown> }) {
  const entries = Object.entries(facts).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) {
    return <p className="text-sm text-[var(--fg-muted)]">入力なし</p>;
  }
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-mono">
      {entries.map(([k, v]) => (
        <li key={k}>
          <span className="text-[var(--fg-subtle)]">{humanizeKey(k)}</span>
          <span className="mx-1 text-[var(--fg-subtle)]">:</span>
          <span className="text-[var(--fg)]">{String(v)}</span>
        </li>
      ))}
    </ul>
  );
}

function RuleMatchView({ ruleMatch }: { ruleMatch: JudgmentOutputV2["rule_match"] }) {
  if (!ruleMatch.matched_rule_id) {
    return (
      <p className="text-sm text-[var(--fg-muted)]">
        マッチするルールなし（ルール定義の見直しが必要）
      </p>
    );
  }
  return (
    <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-1 text-sm">
      <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider pt-0.5">
        rule id
      </dt>
      <dd className="font-mono text-[var(--fg)]">{ruleMatch.matched_rule_id}</dd>

      {ruleMatch.risk_level && (
        <>
          <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider pt-0.5">
            risk level
          </dt>
          <dd className="text-[var(--fg)]">{ruleMatch.risk_level}</dd>
        </>
      )}
      {ruleMatch.action && (
        <>
          <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider pt-0.5">
            action
          </dt>
          <dd className="font-mono text-[var(--fg)]">{ruleMatch.action}</dd>
        </>
      )}
      {ruleMatch.rationale && (
        <>
          <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider pt-0.5">
            rationale
          </dt>
          <dd className="text-[var(--fg-muted)]">{ruleMatch.rationale}</dd>
        </>
      )}
    </dl>
  );
}

function MemorySectionView({
  section,
  isOn,
}: {
  section: JudgmentMemorySection;
  isOn: boolean;
}) {
  const accentClass = isOn
    ? "border-[var(--accent-border)] bg-[var(--accent-subtle)]/30"
    : "border-[var(--border-color)]";

  return (
    <div className={`rounded-md border ${accentClass} p-4`}>
      <p className="text-xs font-mono text-[var(--fg-muted)] mb-3">{section.title}</p>

      {/* items（構造化された bullet list） */}
      {section.items.length > 0 && (
        <ul className="space-y-2.5">
          {section.items.map((item, i) => (
            <li key={i}>
              <BulletView bullet={item} />
            </li>
          ))}
        </ul>
      )}

      {/* personalization 等の raw_text は折り畳み */}
      {section.raw_text && (
        <details className="group mt-3">
          <summary className="cursor-pointer text-[10px] font-mono text-[var(--fg-subtle)] hover:text-[var(--fg-muted)] select-none list-none flex items-center gap-1">
            <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
            Raw {section.kind}.md を見る
          </summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap leading-relaxed text-[var(--fg-muted)] font-sans border border-[var(--border-color)] rounded p-3 bg-[var(--bg)]">
            {section.raw_text.trim()}
          </pre>
        </details>
      )}
    </div>
  );
}

function BulletView({ bullet }: { bullet: JudgmentBullet }) {
  return (
    <div>
      <div className="flex items-start gap-2">
        {bullet.meta?.weight !== undefined && (
          <span className="shrink-0 mt-0.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-1.5 py-px text-[9px] font-mono text-[var(--accent-primary)]">
            {bullet.meta.weight}/10
          </span>
        )}
        <p className="text-sm text-[var(--fg)] leading-relaxed">
          {bullet.headline}
        </p>
      </div>
      {bullet.detail && (
        <p className="text-xs text-[var(--fg-muted)] mt-1 leading-relaxed pl-1">
          {bullet.detail}
        </p>
      )}
      {bullet.meta?.tag && (
        <span className="inline-block mt-1 rounded-full border border-[var(--border-color)] px-1.5 py-px text-[9px] font-mono text-[var(--fg-muted)]">
          {bullet.meta.tag}
        </span>
      )}
    </div>
  );
}

function RecommendationView({
  recommendation,
  isOn,
}: {
  recommendation: JudgmentOutputV2["recommendation"];
  isOn: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* generic */}
      {recommendation.generic.length > 0 && (
        <div>
          <p className="text-xs font-mono text-[var(--fg-muted)] mb-2">基本アクション</p>
          <ul className="space-y-1">
            {recommendation.generic.map((g, i) => (
              <li key={i} className="text-sm text-[var(--fg)] flex gap-2 leading-relaxed">
                <span className="text-[var(--fg-subtle)] shrink-0">•</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* cautions（過去の失敗から） */}
      {recommendation.cautions.length > 0 && (
        <div className="rounded-md border border-[var(--border-color)] bg-[var(--bg)]/30 p-3">
          <p className="text-xs font-mono text-[var(--fg-muted)] mb-2">
            注意（過去の失敗から）
          </p>
          <ul className="space-y-2">
            {recommendation.cautions.map((c, i) => (
              <li key={i}>
                <BulletView bullet={c} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* leverages（強いエピソードから） */}
      {recommendation.leverages.length > 0 && (
        <div
          className={`rounded-md border p-3 ${
            isOn
              ? "border-[var(--accent-border)] bg-[var(--accent-subtle)]/20"
              : "border-[var(--border-color)] bg-[var(--bg)]/30"
          }`}
        >
          <p
            className={`text-xs font-mono mb-2 ${
              isOn ? "text-[var(--accent-primary)]" : "text-[var(--fg-muted)]"
            }`}
          >
            この subject の効きどころ（強いエピソードから）
          </p>
          <ul className="space-y-2">
            {recommendation.leverages.map((l, i) => (
              <li key={i}>
                <BulletView bullet={l} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendation.cautions.length === 0 && recommendation.leverages.length === 0 && (
        <p className="text-xs text-[var(--fg-subtle)] italic">
          Memory が空または該当エントリなし。基本アクションのみ適用。
        </p>
      )}
    </div>
  );
}

