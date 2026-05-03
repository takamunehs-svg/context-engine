import Link from "next/link";
import { getTenantMeta } from "@/lib/fs/tenant";
import { loadMemory } from "@/lib/fs/subject";
import { ArrowRight, ChevronRight, BookOpen } from "lucide-react";
import { DEMO_JUDGE_HREF, DEMO_TENANT_ID } from "@/lib/demo-links";

interface PageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function TenantPage({ params }: PageProps) {
  const { tenantId } = await params;
  const meta = await getTenantMeta(tenantId);

  const subjectCards = await Promise.all(
    (meta.subjects ?? []).map(async (s) => {
      const memory = await loadMemory(tenantId, s.id);
      return { ...s, counts: memory.counts };
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16 space-y-16">
      {/* breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[var(--fg-muted)]">
        <Link href="/" className="hover:text-[var(--fg)]">
          context-engine
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[var(--fg)]">{tenantId}</span>
      </nav>

      {/* tenant header */}
      <header className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-3">
            <p className="label-mono">TENANT</p>
            <h1 className="text-4xl md:text-5xl font-light tracking-normal text-[var(--fg)]">
              {meta.display_name}
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono text-[var(--fg-muted)]">
              <span>{meta.tenant_id}</span>
              <span className="text-[var(--fg-subtle)]">·</span>
              <span>since {meta.created_at}</span>
            </div>
          </div>
          <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-3 py-1 text-xs font-mono text-[var(--accent-primary)]">
            template: {meta.applied_template} v{meta.template_version}
          </span>
        </div>

        <p className="text-[var(--fg-muted)] leading-relaxed max-w-3xl whitespace-pre-line">
          {meta.description}
        </p>

        <div>
          <Link
            href={`/t/${tenantId}/dictionary`}
            className="group inline-flex items-center gap-2 rounded-md border border-[var(--border-color)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] px-4 py-2 text-xs font-mono text-[var(--fg)] transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
            Dictionary Layer を見る
            <span className="text-[var(--fg-subtle)]">·</span>
            <span className="text-[var(--fg-muted)]">テナント内で1つ・共通</span>
          </Link>
        </div>
      </header>

      {tenantId === DEMO_TENANT_ID && (
        <section className="rounded-lg border border-[var(--accent-border)] bg-[var(--bg-elevated)] memory-on-bg p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="label-mono text-[var(--accent-primary)] mb-2">
                LAUNCH DEMO
              </p>
              <h2 className="text-2xl font-light tracking-normal text-[var(--fg)]">
                Memory ON/OFF 比較を入力済みで開く
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                client-a は6ヶ月伴走で Memory が最も厚いサンプル。商談デモではここを最初に見せる。
              </p>
            </div>
            <Link
              href={DEMO_JUDGE_HREF}
              className="group inline-flex w-fit items-center gap-2 rounded-md bg-[var(--accent-primary)] px-5 py-3 text-sm font-medium text-[#052e1c] shadow-[0_0_24px_rgba(16,185,129,0.25)] transition-colors hover:bg-[var(--accent-glow)]"
            >
              Run comparison
              <ArrowRight className="h-4 w-4 arrow-slide" strokeWidth={2} />
            </Link>
          </div>
        </section>
      )}

      {/* subjects */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <div className="space-y-2">
            <p className="label-mono">SUBJECTS</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-normal">
              このテナントが抱えるクライアント
            </h2>
          </div>
          <p className="hidden md:block text-xs font-mono text-[var(--fg-subtle)]">
            Memory 厚さに応じてグロー強度が変わる ↓
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {subjectCards.map((s) => (
            <SubjectCard
              key={s.id}
              tenantId={tenantId}
              subject={s}
            />
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--fg-muted)] leading-relaxed max-w-2xl">
          各 subject に入って <span className="text-[var(--fg)]">「Management 判定」</span> を実行すると、
          Memory ON / OFF を並列表示します。Memory が厚い subject ほど、ON 側の出力が大きく固有化します。
        </p>
      </section>
    </div>
  );
}

function SubjectCard({
  tenantId,
  subject,
}: {
  tenantId: string;
  subject: {
    id: string;
    label: string;
    memory_depth?: "thick" | "medium" | "thin" | "empty";
    counts: {
      decisions: number;
      failures: number;
      experiences: number;
      has_personalization: boolean;
      total: number;
    };
  };
}) {
  const depthClass =
    subject.memory_depth === "thick"
      ? "glow-thick"
      : subject.memory_depth === "medium"
        ? "glow-medium"
        : subject.memory_depth === "thin"
          ? "glow-thin"
          : "glow-empty";

  const depthLabel =
    subject.memory_depth === "thick"
      ? "Thick"
      : subject.memory_depth === "medium"
        ? "Medium"
        : subject.memory_depth === "thin"
          ? "Thin"
          : "Empty";

  const total = subject.counts.total;
  const max = 12;
  const pct = Math.min(100, (total / max) * 100);

  return (
    <Link
      href={`/t/${tenantId}/subjects/${subject.id}`}
      className={`group block rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] p-6 transition-all ${depthClass}`}
    >
      {/* depth badge */}
      <div className="flex items-center justify-between mb-5">
        <span className="label-mono text-[var(--fg-subtle)]">{subject.id}</span>
        <span className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[10px] font-mono text-[var(--fg-muted)]">
          memory · {depthLabel}
        </span>
      </div>

      <h3 className="text-lg font-medium text-[var(--fg)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
        {subject.label.split("（")[0]}
      </h3>
      <p className="text-xs text-[var(--fg-muted)] mb-6">{subject.label}</p>

      {/* memory bar */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
            MEMORY
          </span>
          <span className="font-mono text-xs text-[var(--fg)] num">
            {total} entries
          </span>
        </div>
        <div className="h-1 rounded-full bg-[var(--bg)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* counts */}
      <div className="grid grid-cols-2 gap-y-1 text-[11px] font-mono">
        <span className="text-[var(--fg-subtle)]">decisions</span>
        <span className="text-right text-[var(--fg)] num">
          {subject.counts.decisions}
        </span>
        <span className="text-[var(--fg-subtle)]">failures</span>
        <span className="text-right text-[var(--fg)] num">
          {subject.counts.failures}
        </span>
        <span className="text-[var(--fg-subtle)]">experiences</span>
        <span className="text-right text-[var(--fg)] num">
          {subject.counts.experiences}
        </span>
        <span className="text-[var(--fg-subtle)]">personalization</span>
        <span className="text-right text-[var(--fg)]">
          {subject.counts.has_personalization ? "あり" : "—"}
        </span>
      </div>

      {/* footer */}
      <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
        <span className="text-xs text-[var(--fg-muted)]">Open subject</span>
        <ArrowRight
          className="h-3.5 w-3.5 text-[var(--fg-muted)] group-hover:text-[var(--accent-primary)] arrow-slide"
          strokeWidth={1.5}
        />
      </div>
    </Link>
  );
}
