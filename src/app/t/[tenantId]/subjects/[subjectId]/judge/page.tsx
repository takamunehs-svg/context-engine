import Link from "next/link";
import { getTenantMeta } from "@/lib/fs/tenant";
import { getSubjectProfile, loadMemory } from "@/lib/fs/subject";
import {
  AUDIENCE_LABELS,
  buildJudgmentOutput,
  type Audience,
} from "@/lib/judgment-output";
import { ArrowLeft, Sparkles, Zap, ChevronRight } from "lucide-react";
import { JudgeForm } from "./judge-form";
import { JudgeResult } from "./judge-result";

interface PageProps {
  params: Promise<{ tenantId: string; subjectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JudgePage({ params, searchParams }: PageProps) {
  const { tenantId, subjectId } = await params;
  const sp = await searchParams;

  const [meta, profile, memory] = await Promise.all([
    getTenantMeta(tenantId),
    getSubjectProfile(tenantId, subjectId),
    loadMemory(tenantId, subjectId),
  ]);

  const audience = audienceFromSP(sp.audience);
  const submitted = "submitted" in sp;
  const facts = submitted
    ? {
        bp_systolic: numFromSP(sp.bp_systolic),
        bp_diastolic: numFromSP(sp.bp_diastolic),
        pain_nrs: numFromSP(sp.pain_nrs),
      }
    : null;

  const offResult = facts
    ? await buildJudgmentOutput({
        audience,
        tenant_id: tenantId,
        subject_id: subjectId,
        decision_type: "intervention_plan",
        current_facts: facts,
        use_memory: false,
      })
    : null;

  const onResult = facts
    ? await buildJudgmentOutput({
        audience,
        tenant_id: tenantId,
        subject_id: subjectId,
        decision_type: "intervention_plan",
        current_facts: facts,
        use_memory: true,
      })
    : null;

  const totalMemory = memory.counts.total;
  const maxBar = Math.max(totalMemory, 12); // 視覚化のスケール

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16 space-y-12">
      {/* breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[var(--fg-muted)]">
        <Link href={`/t/${tenantId}`} className="hover:text-[var(--fg)]">
          {meta.display_name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/t/${tenantId}/subjects/${subjectId}`}
          className="hover:text-[var(--fg)]"
        >
          {profile.display_name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[var(--fg)]">Management judge</span>
      </nav>

      {/* heading */}
      <header className="space-y-4">
        <p className="label-mono">MANAGEMENT JUDGE</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-normal leading-tight max-w-3xl">
          Memory <span className="text-[var(--accent-primary)]">ON / OFF</span>{" "}
          比較
        </h1>
        <p className="text-[var(--fg-muted)] max-w-2xl leading-relaxed">
          同じ事実に対して、Memory を参照する場合としない場合で出力がどう変わるかを並列表示します。
          Memory が厚い subject ほど、ON 側で <span className="text-[var(--fg)]">{profile.display_name}</span> 固有の
          反応パターン・過去の失敗・効いた介入が出力に反映されます。
        </p>
        <div>
          <Link
            href={`/t/${tenantId}/subjects/${subjectId}`}
            className="group inline-flex items-center gap-1.5 text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
            subject に戻る
          </Link>
        </div>
      </header>

      {/* この画面は何? */}
      <section className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/50 p-6">
        <p className="label-mono mb-3">この画面は何？</p>
        <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
          「今{" "}
          <span className="text-[var(--fg)]">{profile.display_name}</span>{" "}
          にこういう状況が出ました、どう動けばいい？」を{" "}
          <span className="text-[var(--fg)]">AI に相談する画面</span>。 AI は{" "}
          <span className="text-[var(--fg)]">ルールブック</span>
          （業者の判断基準）と{" "}
          <span className="text-[var(--fg)]">取扱い説明書</span>（
          {profile.display_name} 専用の積み上げ）を見て答えます。
        </p>
        <p className="text-sm text-[var(--fg-muted)] leading-relaxed mt-3">
          下で{" "}
          <span className="text-[var(--fg)]">
            Memory OFF と ON を並べて表示
          </span>
          し、「教科書通りの汎用回答」と「{profile.display_name}{" "}
          専用に育った回答」の差を見せます。Memory が厚くなるほど、ON 側が{" "}
          {profile.display_name} 固有に変化します。
        </p>
      </section>

      {/* Audience selector */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6">
        <p className="label-mono mb-2">AUDIENCE — 出力レベル</p>
        <p className="text-xs text-[var(--fg-muted)] mb-4 leading-relaxed">
          同じ判定でも「誰に見せるか」で Memory の出方が変わります。中間層
          <code className="mx-1 text-[var(--fg)]">judgment-output.ts</code>
          が audience 別にフィルタ（SPEC.md §5.4）。
        </p>
        <div className="flex flex-wrap gap-2">
          {(["self", "team", "client", "demo"] as Audience[]).map((a) => {
            const isCurrent = a === audience;
            return (
              <Link
                key={a}
                href={buildAudienceHref(
                  `/t/${tenantId}/subjects/${subjectId}/judge`,
                  sp,
                  a,
                )}
                className={
                  isCurrent
                    ? "px-3 py-1.5 rounded-full text-xs font-mono border border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
                    : "px-3 py-1.5 rounded-full text-xs font-mono border border-[var(--border-color)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg-muted)]"
                }
              >
                <span className="text-[var(--fg)]">{a}</span>
                <span className="ml-1.5 text-[var(--fg-subtle)]">
                  {AUDIENCE_LABELS[a]}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Memory depth */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="label-mono mb-1">MEMORY DEPTH</p>
            <p className="text-sm text-[var(--fg-muted)]">
              {profile.display_name} の Episodic Memory · 総 {totalMemory}{" "}
              entries
            </p>
          </div>
          <span className="font-mono text-3xl font-light text-[var(--accent-primary)] num">
            {totalMemory}
          </span>
        </div>
        <div className="space-y-3">
          <MemoryBar
            label="decisions"
            value={memory.counts.decisions}
            max={maxBar}
          />
          <MemoryBar
            label="failures"
            value={memory.counts.failures}
            max={maxBar}
          />
          <MemoryBar
            label="experiences"
            value={memory.counts.experiences}
            max={maxBar}
          />
          <MemoryBar
            label="personalization"
            value={memory.counts.has_personalization ? 1 : 0}
            max={1}
            displayText={memory.counts.has_personalization ? "あり" : "—"}
          />
        </div>
      </section>

      {/* facts input */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-8">
        <p className="label-mono mb-2">INPUT — facts</p>
        <h2 className="text-xl font-light text-[var(--fg)] mb-1">
          事実を入力
        </h2>
        <p className="text-sm text-[var(--fg-muted)] mb-8">
          BP / NRS の値で辞書層のルールがマッチします。
        </p>
        <JudgeForm
          defaults={{
            bp_systolic: numFromSP(sp.bp_systolic) ?? 135,
            bp_diastolic: numFromSP(sp.bp_diastolic) ?? 85,
            pain_nrs: numFromSP(sp.pain_nrs) ?? 4,
          }}
        />
      </section>

      {/* result */}
      {submitted && offResult && onResult ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="label-mono">RESULT</p>
            <p className="text-xs font-mono text-[var(--fg-subtle)]">
              ↑ 同じ事実に対して、左：汎用 · 右：{profile.display_name} 固有化
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <JudgeResult
              variant="off"
              title="Memory OFF"
              subtitle="汎用出力"
              caption="辞書 + ルール + 当該事実のみ。subject 固有の積層は使わない。"
              icon={<Zap className="h-4 w-4" strokeWidth={1.5} />}
              output={offResult}
            />
            <JudgeResult
              variant="on"
              title="Memory ON"
              subtitle="subject 固有化"
              caption="上記 + memory/* の personalization・failures・experiences を Context に積む。"
              icon={<Sparkles className="h-4 w-4" strokeWidth={1.5} />}
              output={onResult}
            />
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/40 p-16 text-center">
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
            上のフォームに値を入れて <span className="text-[var(--fg)]">「判定を実行」</span> すると、
            Memory OFF / ON を並列表示します。
            <br />
            Memory が厚い subject ほど、ON 側の出力が大きく固有化します。
          </p>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Memory bar
// ─────────────────────────────────────────────────────────

function MemoryBar({
  label,
  value,
  max,
  displayText,
}: {
  label: string;
  value: number;
  max: number;
  displayText?: string;
}) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="grid grid-cols-12 items-center gap-3 text-xs font-mono">
      <span className="col-span-3 text-[var(--fg-muted)]">{label}</span>
      <div className="col-span-7 h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="col-span-2 text-right text-[var(--fg)] num">
        {displayText ?? value}
      </span>
    </div>
  );
}

function numFromSP(v: string | string[] | undefined): number | undefined {
  if (v === undefined || Array.isArray(v) || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function audienceFromSP(v: string | string[] | undefined): Audience {
  const cand = Array.isArray(v) ? v[0] : v;
  if (cand === "team" || cand === "client" || cand === "demo") return cand;
  return "self";
}

function buildAudienceHref(
  base: string,
  sp: Record<string, string | string[] | undefined>,
  audience: Audience,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "audience") continue;
    if (Array.isArray(v)) v.forEach((vi) => params.append(k, vi));
    else if (v !== undefined) params.append(k, v);
  }
  params.set("audience", audience);
  return `${base}?${params.toString()}`;
}
