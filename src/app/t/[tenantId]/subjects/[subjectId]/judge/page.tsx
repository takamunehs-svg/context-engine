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
        stakeholder_alignment: numFromSP(sp.stakeholder_alignment),
        operating_clarity: numFromSP(sp.operating_clarity),
        field_readiness: numFromSP(sp.field_readiness),
        rollout_risk: numFromSP(sp.rollout_risk),
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
        <span className="text-[var(--fg)]">支援判断デモ</span>
      </nav>

      {/* heading */}
      <header className="space-y-4">
        <p className="label-mono">支援判断デモ</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-normal leading-tight max-w-3xl">
          Memory <span className="text-[var(--accent-primary)]">ON / OFF</span>{" "}
          比較
        </h1>
        <p className="text-[var(--fg-muted)] max-w-2xl leading-relaxed">
          同じ状況に対して、支援記録を使う場合と使わない場合で出力がどう変わるかを並列表示します。
          支援記録が厚いクライアントほど、あり側で <span className="text-[var(--fg)]">{profile.display_name}</span> 固有の
          反応パターン・過去の失敗・効いた進め方が出力に反映されます。
        </p>
        <div>
          <Link
            href={`/t/${tenantId}/subjects/${subjectId}`}
            className="group inline-flex items-center gap-1.5 text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
            支援先に戻る
          </Link>
        </div>
      </header>

      {/* この画面は何? — 初回のみ表示。submitted 時は結果に集中するため非表示。 */}
      {!submitted && (
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
      )}

      {/* Audience selector */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6">
        <p className="label-mono mb-2">表示レベル</p>
        <p className="text-xs text-[var(--fg-muted)] mb-4 leading-relaxed">
          同じ判定でも「誰向けに見せるか」で出力の詳細度が変わります。
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
            <p className="label-mono mb-1">蓄積された支援記録</p>
            <p className="text-sm text-[var(--fg-muted)]">
              {profile.display_name} の蓄積された支援記録 · 合計 {totalMemory} 件
            </p>
          </div>
          <span className="font-mono text-3xl font-light text-[var(--accent-primary)] num">
            {totalMemory}
          </span>
        </div>
        <div className="space-y-3">
          <MemoryBar
            label="判断記録"
            value={memory.counts.decisions}
            max={maxBar}
          />
          <MemoryBar
            label="失敗・注意点"
            value={memory.counts.failures}
            max={maxBar}
          />
          <MemoryBar
            label="気づき"
            value={memory.counts.experiences}
            max={maxBar}
          />
          <MemoryBar
            label="固有化情報"
            value={memory.counts.has_personalization ? 1 : 0}
            max={1}
            displayText={memory.counts.has_personalization ? "あり" : "—"}
          />
        </div>
      </section>

      {/* facts input */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-8">
        <p className="label-mono mb-2">入力情報 — 現在の状況</p>
        <h2 className="text-xl font-light text-[var(--fg)] mb-1">
          事実を入力
        </h2>
        <p className="text-sm text-[var(--fg-muted)] mb-6">
          導入・展開フェーズの事実で、辞書層のルールがマッチします。
        </p>
        <div className="mb-8 rounded-md border border-[var(--border-color)] bg-[var(--bg)] p-4">
          <p className="label-mono mb-2 text-[var(--fg-subtle)]">
            今回のデモ前提
          </p>
          <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
            <span className="text-[var(--fg)]">{profile.display_name}</span>
            （6ヶ月伴走中）— PoC が現場展開フェーズに入った段階。
            <span className="text-[var(--fg)]">経営層は半信半疑</span>
            （納得度3）、
            <span className="text-[var(--fg)]">運用ルール未整備</span>
            （明確さ2）、
            <span className="text-[var(--fg)]">現場は前向き</span>
            （準備度4）、ただし
            <span className="text-[var(--fg)]">展開リスクは高い</span>
            （リスク4）。
          </p>
        </div>
        <JudgeForm
          defaults={{
            stakeholder_alignment: numFromSP(sp.stakeholder_alignment) ?? 3,
            operating_clarity: numFromSP(sp.operating_clarity) ?? 2,
            field_readiness: numFromSP(sp.field_readiness) ?? 4,
            rollout_risk: numFromSP(sp.rollout_risk) ?? 4,
          }}
        />
      </section>

      {/* result */}
      {submitted && offResult && onResult ? (
        <section id="result" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="label-mono">判定結果</p>
            <p className="text-xs font-mono text-[var(--fg-subtle)]">
              ↑ 同じ状況に対して、左：汎用 · 右：{profile.display_name} 固有化
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <JudgeResult
              variant="off"
              title="Memory OFF"
              subtitle="汎用出力"
              caption="辞書 + ルール + 入力情報のみ。支援先固有の蓄積は使わない。"
              icon={<Zap className="h-4 w-4" strokeWidth={1.5} />}
              output={offResult}
            />
            <JudgeResult
              variant="on"
              title="Memory ON"
              subtitle="支援先を固有化"
              caption="上記 + この支援先の固有化情報・失敗・気づきを追加して生成。"
              icon={<Sparkles className="h-4 w-4" strokeWidth={1.5} />}
              output={onResult}
            />
          </div>
        </section>
      ) : (
        <section id="result" className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/40 p-16 text-center">
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
            上のフォームに値を入れて <span className="text-[var(--fg)]">「判定を実行」</span> すると、
            支援記録なし / ありを並列表示します。
            <br />
            支援記録が厚いクライアントほど、あり側の出力が大きく固有化します。
          </p>
        </section>
      )}

      {/* long-term accumulation — 結果を見たあとの長期視点として配置 */}
      <section className="rounded-lg border border-[var(--accent-border)] bg-[var(--bg-elevated)] memory-on-bg p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="label-mono text-[var(--accent-primary)] mb-3">
              3 YEARS LATER
            </p>
            <h2 className="text-2xl font-light tracking-normal text-[var(--fg)] leading-snug">
              3年積み上がると、
              <br />
              「回答」ではなく「A社の判断資産」になる。
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--fg-muted)]">
              今は6ヶ月分のデモデータです。3年運用では、四半期ごとの停滞、
              役員会の癖、現場展開で詰まる前兆まで Memory に残ります。
            </p>
          </div>

          <div className="space-y-px overflow-hidden rounded-md border border-[var(--accent-border)] bg-[var(--accent-border)]">
            <AccumulationRow
              label="6ヶ月"
              title="個別の失敗と効いた進め方が見える"
              detail="資料分離、責任分界、担当者の抱え込みなど、直近の判断に効くパターンが出る。"
            />
            <AccumulationRow
              label="1年"
              title="季節性と社内意思決定の癖が見える"
              detail="予算期、繁忙期、部門長レビュー待ちなど、進めるタイミングの判断ができる。"
            />
            <AccumulationRow
              label="3年"
              title="次の詰まりを先回りできる"
              detail="A社では誰を先に巻き込むべきか、どの資料で止まるか、どの展開単位なら承認されるかまで再利用できる。"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function AccumulationRow({
  label,
  title,
  detail,
}: {
  label: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="grid gap-3 bg-[var(--bg-elevated)] p-4 sm:grid-cols-[72px_1fr]">
      <div className="font-mono text-xs text-[var(--accent-primary)]">
        {label}
      </div>
      <div>
        <h3 className="text-sm font-medium text-[var(--fg)]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">
          {detail}
        </p>
      </div>
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
