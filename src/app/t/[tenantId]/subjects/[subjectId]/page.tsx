import Link from "next/link";
import { getTenantMeta } from "@/lib/fs/tenant";
import { getSubjectProfile, listActivityEvents, loadMemory } from "@/lib/fs/subject";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { AddSessionEventForm } from "./add-session-event-form";
import { AddMeasurementEventForm } from "./add-measurement-event-form";
import { AddMemoryDecisionForm } from "./add-memory-decision-form";
import { AddMemoryFailureForm } from "./add-memory-failure-form";
import { AddMemoryExperienceForm } from "./add-memory-experience-form";
import { summarizeEvent } from "@/lib/event-summary";

interface PageProps {
  params: Promise<{ tenantId: string; subjectId: string }>;
}

export default async function SubjectPage({ params }: PageProps) {
  const { tenantId, subjectId } = await params;
  const [meta, profile, events, memory] = await Promise.all([
    getTenantMeta(tenantId),
    getSubjectProfile(tenantId, subjectId),
    listActivityEvents(tenantId, subjectId),
    loadMemory(tenantId, subjectId),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16 space-y-10">
      {/* breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[var(--fg-muted)]">
        <Link href={`/t/${tenantId}`} className="hover:text-[var(--fg)]">
          {meta.display_name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>subjects</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[var(--fg)]">{subjectId}</span>
      </nav>

      {/* heading */}
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-3">
          <p className="label-mono">SUBJECT</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-[var(--fg)]">
            {profile.display_name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-[var(--fg-muted)]">
            <span>{subjectId}</span>
            {profile.since && (
              <>
                <span className="text-[var(--fg-subtle)]">·</span>
                <span>since {profile.since}</span>
              </>
            )}
            {profile.session_frequency && (
              <>
                <span className="text-[var(--fg-subtle)]">·</span>
                <span>{profile.session_frequency}</span>
              </>
            )}
          </div>
        </div>
        <Link
          href={`/t/${tenantId}/subjects/${subjectId}/judge`}
          className="group inline-flex items-center gap-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-glow)] px-5 py-3 text-sm font-medium text-[#052e1c] transition-colors shadow-[0_0_24px_rgba(16,185,129,0.25)]"
        >
          <Sparkles className="h-4 w-4" strokeWidth={1.5} />
          Management 判定（Memory ON/OFF 比較）
          <ArrowRight className="h-4 w-4 arrow-slide" strokeWidth={2} />
        </Link>
      </header>

      {/* profile */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="label-mono">PROFILE</p>
          <span className="font-mono text-[10px] text-[var(--fg-subtle)]">
            activity/subjects/{subjectId}.md
          </span>
        </div>
        <dl className="grid md:grid-cols-3 gap-x-8 gap-y-4 text-sm mb-6">
          <div>
            <dt className="text-xs text-[var(--fg-subtle)] uppercase tracking-wider mb-1">
              Primary
            </dt>
            <dd className="text-[var(--fg)]">{profile.primary_concern ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--fg-subtle)] uppercase tracking-wider mb-1">
              Since
            </dt>
            <dd className="text-[var(--fg)]">{profile.since ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--fg-subtle)] uppercase tracking-wider mb-1">
              Frequency
            </dt>
            <dd className="text-[var(--fg)]">{profile.session_frequency ?? "—"}</dd>
          </div>
        </dl>
        {profile.body && (
          <div className="rounded-md bg-[var(--bg)] border border-[var(--border-color)] p-4">
            <pre className="text-xs whitespace-pre-wrap leading-relaxed text-[var(--fg-muted)] font-mono">
              {profile.body.trim()}
            </pre>
          </div>
        )}
      </section>

      {/* tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="bg-transparent border-b border-[var(--border-color)] rounded-none w-full justify-start gap-6 h-auto p-0">
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)] data-[state=active]:shadow-none rounded-none px-0 pb-3 font-mono text-xs uppercase tracking-wider text-[var(--fg-muted)]"
          >
            Activity ({events.length})
          </TabsTrigger>
          <TabsTrigger
            value="memory"
            className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)] data-[state=active]:shadow-none rounded-none px-0 pb-3 font-mono text-xs uppercase tracking-wider text-[var(--fg-muted)]"
          >
            Memory ({memory.counts.total})
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)] data-[state=active]:shadow-none rounded-none px-0 pb-3 font-mono text-xs uppercase tracking-wider text-[var(--fg-muted)]"
          >
            Add entry
          </TabsTrigger>
        </TabsList>

        {/* Activity */}
        <TabsContent value="activity" className="space-y-3 mt-8">
          <p className="text-xs text-[var(--fg-muted)] mb-4 font-mono">
            append-only · 既存行は変更されません · 補正は新イベントで上書き
          </p>
          {events.length === 0 && (
            <p className="text-sm text-[var(--fg-muted)]">イベントなし</p>
          )}
          <ol className="relative border-l border-[var(--border-color)] pl-6 space-y-4">
            {events
              .slice()
              .reverse()
              .map((e) => {
                const summary = summarizeEvent(e);
                return (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[29px] top-3 h-2 w-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[10px] font-mono text-[var(--fg-muted)]">
                            {e.event_type}
                          </span>
                          <span className="text-xs font-mono text-[var(--fg-muted)]">
                            {summary.date}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                          {e.id}
                        </span>
                      </div>

                      {summary.notes && (
                        <p className="text-sm text-[var(--fg)] leading-relaxed mb-3">
                          {summary.notes}
                        </p>
                      )}

                      {summary.metrics.length > 0 && (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--fg-muted)] mb-3">
                          {summary.metrics.map((m) => (
                            <li key={m.key} className="font-mono">
                              <span className="text-[var(--fg-subtle)]">{m.key}</span>
                              <span className="mx-1 text-[var(--fg-subtle)]">:</span>
                              <span className="text-[var(--fg)]">{m.value}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <details className="group">
                        <summary className="cursor-pointer text-[10px] font-mono text-[var(--fg-subtle)] hover:text-[var(--fg-muted)] select-none list-none flex items-center gap-1">
                          <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                          Raw を見る
                        </summary>
                        <pre className="mt-2 text-[11px] bg-[var(--bg)] border border-[var(--border-color)] rounded p-3 overflow-x-auto font-mono text-[var(--fg-muted)] leading-relaxed">
                          {JSON.stringify(e.context, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </li>
                );
              })}
          </ol>
        </TabsContent>

        {/* Memory */}
        <TabsContent value="memory" className="mt-8">
          <Tabs defaultValue="decisions">
            <TabsList className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-md p-1">
              <TabsTrigger value="decisions" className="text-xs font-mono">
                decisions ({memory.counts.decisions})
              </TabsTrigger>
              <TabsTrigger value="failures" className="text-xs font-mono">
                failures ({memory.counts.failures})
              </TabsTrigger>
              <TabsTrigger value="experiences" className="text-xs font-mono">
                experiences ({memory.counts.experiences})
              </TabsTrigger>
              <TabsTrigger value="personalization" className="text-xs font-mono">
                personalization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="decisions" className="space-y-3 mt-6">
              {memory.decisions.length === 0 && (
                <p className="text-sm text-[var(--fg-muted)]">エントリなし</p>
              )}
              {memory.decisions.slice().reverse().map((d) => (
                <article
                  key={d.id}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6 space-y-3"
                >
                  <header className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[var(--fg)]">
                      {d.title}
                    </h3>
                    <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                      {d.recorded_at}
                    </span>
                  </header>
                  <dl className="text-sm space-y-2">
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                      <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider">
                        状況
                      </dt>
                      <dd className="text-[var(--fg-muted)]">{d.context}</dd>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                      <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider">
                        判断
                      </dt>
                      <dd className="text-[var(--fg)]">{d.decision}</dd>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                      <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider">
                        理由
                      </dt>
                      <dd className="text-[var(--fg-muted)]">{d.rationale}</dd>
                    </div>
                    {d.outcome && (
                      <div className="grid grid-cols-[80px_1fr] gap-3">
                        <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider">
                          結果
                        </dt>
                        <dd className="text-[var(--accent-primary)]">
                          {d.outcome}
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </TabsContent>

            <TabsContent value="failures" className="space-y-3 mt-6">
              {memory.failures.length === 0 && (
                <p className="text-sm text-[var(--fg-muted)]">エントリなし</p>
              )}
              {memory.failures.slice().reverse().map((f) => (
                <article
                  key={f.id}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6 space-y-3 accent-rule"
                >
                  <header className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[var(--fg)] pl-3">
                      {f.what_went_wrong}
                    </h3>
                    <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                      {f.recorded_at}
                    </span>
                  </header>
                  <dl className="text-sm space-y-2 pl-3">
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                      <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider">
                        根本原因
                      </dt>
                      <dd className="text-[var(--fg-muted)]">{f.root_cause}</dd>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                      <dt className="text-[var(--fg-subtle)] text-xs uppercase tracking-wider">
                        予防策
                      </dt>
                      <dd className="text-[var(--fg)]">{f.prevention}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-1 pl-3">
                    {f.pattern_tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[10px] font-mono text-[var(--fg-muted)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </TabsContent>

            <TabsContent value="experiences" className="space-y-3 mt-6">
              {memory.experiences.length === 0 && (
                <p className="text-sm text-[var(--fg-muted)]">エントリなし</p>
              )}
              {memory.experiences.slice().reverse().map((e) => (
                <article
                  key={e.id}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6 space-y-3"
                >
                  <header className="flex items-center justify-between">
                    <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-mono text-[var(--accent-primary)]">
                      weight {e.emotional_weight}/10
                    </span>
                    <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                      {e.recorded_at}
                    </span>
                  </header>
                  <p className="text-sm text-[var(--fg)] leading-relaxed">
                    {e.insight}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[10px] font-mono text-[var(--fg-muted)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </TabsContent>

            <TabsContent value="personalization" className="mt-6">
              <article className="rounded-lg border border-[var(--accent-border)] bg-[var(--bg-elevated)] memory-on-bg p-6">
                <header className="flex items-center justify-between mb-4">
                  <p className="label-mono text-[var(--accent-primary)]">
                    PERSONALIZATION
                  </p>
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                    memory/{subjectId}/personalization.md
                  </span>
                </header>
                {memory.personalization.trim().length > 0 ? (
                  <pre className="text-sm whitespace-pre-wrap leading-relaxed text-[var(--fg)] font-sans">
                    {memory.personalization.trim()}
                  </pre>
                ) : (
                  <p className="text-sm text-[var(--fg-muted)]">未作成</p>
                )}
              </article>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Add */}
        <TabsContent value="add" className="space-y-6 mt-8">
          <AddCard
            tag="ACTIVITY"
            title="セッション記録を追加"
            desc="append-only"
          >
            <AddSessionEventForm tenantId={tenantId} subjectId={subjectId} />
          </AddCard>
          <AddCard tag="ACTIVITY" title="測定を追加" desc="append-only">
            <AddMeasurementEventForm
              tenantId={tenantId}
              subjectId={subjectId}
            />
          </AddCard>
          <AddCard
            tag="MEMORY"
            title="decision を追加"
            desc="append-only · subject 固有化を厚くする"
          >
            <AddMemoryDecisionForm tenantId={tenantId} subjectId={subjectId} />
          </AddCard>
          <AddCard
            tag="MEMORY"
            title="failure を追加"
            desc="失敗ログ · 再発防止資産 · append-only"
          >
            <AddMemoryFailureForm tenantId={tenantId} subjectId={subjectId} />
          </AddCard>
          <AddCard
            tag="MEMORY"
            title="experience を追加"
            desc="気づき · emotional_weight 1-10 · append-only"
          >
            <AddMemoryExperienceForm
              tenantId={tenantId}
              subjectId={subjectId}
            />
          </AddCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddCard({
  tag,
  title,
  desc,
  children,
}: {
  tag: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6 md:p-8">
      <header className="mb-6">
        <p className="label-mono mb-1">{tag}</p>
        <h3 className="text-lg font-light text-[var(--fg)]">{title}</h3>
        <p className="text-xs text-[var(--fg-muted)] font-mono mt-1">{desc}</p>
      </header>
      {children}
    </section>
  );
}
