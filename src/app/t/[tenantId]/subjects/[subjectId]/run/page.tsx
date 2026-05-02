import Link from "next/link";
import { getTenantMeta } from "@/lib/fs/tenant";
import { getSubjectProfile } from "@/lib/fs/subject";
import { buildJudgmentOutput } from "@/lib/judgment-output";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { JudgeForm } from "./judge-form";
import { RunResult } from "./run-result";

interface PageProps {
  params: Promise<{ tenantId: string; subjectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RunPage({ params, searchParams }: PageProps) {
  const { tenantId, subjectId } = await params;
  const sp = await searchParams;

  const [meta, profile] = await Promise.all([
    getTenantMeta(tenantId),
    getSubjectProfile(tenantId, subjectId),
  ]);

  const submitted = "submitted" in sp;
  const facts = submitted
    ? {
        bp_systolic: numFromSP(sp.bp_systolic),
        bp_diastolic: numFromSP(sp.bp_diastolic),
        pain_nrs: numFromSP(sp.pain_nrs),
      }
    : null;

  const result = facts
    ? await buildJudgmentOutput({
        audience: "self",
        tenant_id: tenantId,
        subject_id: subjectId,
        decision_type: "intervention_plan",
        current_facts: facts,
        use_memory: true,
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-8 py-12 md:py-16 space-y-10">
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
        <span className="text-[var(--fg)]">判定</span>
      </nav>

      {/* heading */}
      <header className="space-y-3">
        <p className="label-mono">AI 相談</p>
        <h1 className="text-3xl md:text-4xl font-light tracking-normal leading-tight">
          {profile.display_name} さんへの次の一手
        </h1>
        <p className="text-[var(--fg-muted)] max-w-2xl text-base leading-relaxed">
          今日の {profile.display_name} さんの様子を入れると、
          <span className="text-[var(--fg)]">過去の {profile.display_name} さんを全部覚えている AI</span>
          が、次に何をすればいいか・気をつけること・この人に効くことを教えてくれます。
        </p>
        <div>
          <Link
            href={`/t/${tenantId}/subjects/${subjectId}`}
            className="group inline-flex items-center gap-1.5 text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
            戻る
          </Link>
        </div>
      </header>

      {/* facts input */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-8">
        <p className="label-mono mb-4">今日の様子</p>
        <JudgeForm
          defaults={{
            bp_systolic: numFromSP(sp.bp_systolic) ?? 135,
            bp_diastolic: numFromSP(sp.bp_diastolic) ?? 85,
            pain_nrs: numFromSP(sp.pain_nrs) ?? 4,
          }}
        />
      </section>

      {/* result */}
      {submitted && result ? (
        <RunResult output={result} subjectName={profile.display_name} />
      ) : (
        <section className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/40 p-12 text-center">
          <p className="text-sm text-[var(--fg-muted)]">
            今日の様子を上に入れて「AI に相談」を押してください。
          </p>
        </section>
      )}
    </div>
  );
}

function numFromSP(v: string | string[] | undefined): number | undefined {
  if (v === undefined || Array.isArray(v) || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}
