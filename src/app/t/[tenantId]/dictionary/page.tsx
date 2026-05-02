import Link from "next/link";
import { getTenantMeta, getDictionarySchema, readDictionary } from "@/lib/fs/tenant";
import { ChevronRight, ArrowLeft, FileCode, FileText, Folder } from "lucide-react";

interface PageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function DictionaryPage({ params }: PageProps) {
  const { tenantId } = await params;
  const [meta, schema, entries] = await Promise.all([
    getTenantMeta(tenantId),
    getDictionarySchema(tenantId).catch(() => null),
    readDictionary(tenantId),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16 space-y-10">
      {/* breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[var(--fg-muted)]">
        <Link href={`/t/${tenantId}`} className="hover:text-[var(--fg)]">
          {meta.display_name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[var(--fg)]">dictionary</span>
      </nav>

      {/* heading */}
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-3">
          <p className="label-mono">DICTIONARY LAYER</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-normal text-[var(--fg)]">
            辞書層 <span className="text-[var(--fg-muted)]">— 普遍知識</span>
          </h1>
          <p className="text-[var(--fg-muted)] max-w-2xl leading-relaxed">
            判定基準・閾値・参照モデル。テナント内で1つ・年単位編集・AI は読み取り専用。
            すべての subject に共通して適用される、変わりにくい知識資産。
          </p>
        </div>
        <Link
          href={`/t/${tenantId}`}
          className="group inline-flex items-center gap-1.5 rounded-md border border-[var(--border-color)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] px-3 py-2 text-xs font-mono text-[var(--fg)] transition-colors"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          テナントに戻る
        </Link>
      </header>

      {/* schema strip */}
      {schema && (
        <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="label-mono">SCHEMA</p>
            <span className="font-mono text-[10px] text-[var(--fg-subtle)]">
              dictionary/_schema.yaml
            </span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono">
            <span>
              <span className="text-[var(--fg-subtle)]">version </span>
              <span className="text-[var(--fg)]">{schema.version}</span>
            </span>
            <span>
              <span className="text-[var(--fg-subtle)]">edit </span>
              <span className="text-[var(--fg)]">{schema.edit_policy?.frequency ?? "—"}</span>
            </span>
            <span>
              <span className="text-[var(--fg-subtle)]">who </span>
              <span className="text-[var(--fg)]">{schema.edit_policy?.who ?? "—"}</span>
            </span>
            <span>
              <span className="text-[var(--fg-subtle)]">AI </span>
              <span
                className={
                  schema.edit_policy?.read_only_for_ai
                    ? "text-[var(--accent-primary)]"
                    : "text-[var(--fg)]"
                }
              >
                {schema.edit_policy?.read_only_for_ai ? "read-only" : "writable"}
              </span>
            </span>
          </div>
        </section>
      )}

      {/* entries */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="label-mono mb-2">ENTRIES</p>
            <h2 className="text-xl font-light text-[var(--fg)]">
              {entries.length} files
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {entries.map((e) => (
            <article
              key={e.path}
              className="rounded-lg border border-[var(--border-color)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)] overflow-hidden transition-colors"
            >
              <header className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-subtle)]/40">
                <div className="flex items-center gap-2 font-mono text-sm">
                  {e.format === "yaml" ? (
                    <FileCode
                      className="h-3.5 w-3.5 text-[var(--accent-primary)]"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <FileText
                      className="h-3.5 w-3.5 text-[var(--fg-muted)]"
                      strokeWidth={1.5}
                    />
                  )}
                  {e.path.includes("/") && (
                    <>
                      <Folder
                        className="h-3 w-3 text-[var(--fg-subtle)]"
                        strokeWidth={1.5}
                      />
                      <span className="text-[var(--fg-subtle)]">
                        {e.path.split("/").slice(0, -1).join("/")}/
                      </span>
                    </>
                  )}
                  <span className="text-[var(--fg)]">
                    {e.path.split("/").pop()}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">
                  {e.format}
                </span>
              </header>

              {e.format === "md" ? (
                <div className="px-5 py-4">
                  <pre className="text-xs whitespace-pre-wrap leading-relaxed text-[var(--fg-muted)] max-h-72 overflow-auto font-mono">
                    {((e.data as { body: string }).body ?? "").slice(0, 1500) +
                      (((e.data as { body: string }).body ?? "").length > 1500
                        ? "\n…"
                        : "")}
                  </pre>
                </div>
              ) : (
                <pre className="text-[11px] bg-[var(--bg)] px-5 py-4 overflow-x-auto leading-relaxed text-[var(--fg-muted)] font-mono max-h-80">
                  {JSON.stringify(e.data, null, 2)}
                </pre>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
