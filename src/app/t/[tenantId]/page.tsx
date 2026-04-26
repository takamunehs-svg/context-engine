import Link from "next/link";
import { getTenantMeta } from "@/lib/fs/tenant";
import { loadMemory } from "@/lib/fs/subject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function TenantPage({ params }: PageProps) {
  const { tenantId } = await params;
  const meta = await getTenantMeta(tenantId);

  // 各 subject の Memory 件数を並列取得
  const subjectCards = await Promise.all(
    (meta.subjects ?? []).map(async (s) => {
      const memory = await loadMemory(tenantId, s.id);
      return { ...s, counts: memory.counts };
    })
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      <section>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-muted-foreground font-mono">
              tenant: {meta.tenant_id}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              {meta.display_name}
            </h1>
          </div>
          <Badge variant="outline" className="font-mono">
            template: {meta.applied_template} v{meta.template_version}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl whitespace-pre-line">
          {meta.description}
        </p>
        <div className="mt-4 flex gap-2">
          <Link href={`/t/${tenantId}/dictionary`}>
            <Button variant="outline" size="sm">
              辞書層を見る（テナント内で1つ・共通）
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          subjects（このテナントが抱えるクライアント）
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {subjectCards.map((s) => (
            <Link
              key={s.id}
              href={`/t/${tenantId}/subjects/${s.id}`}
              className="block group"
            >
              <Card className="transition-colors group-hover:border-primary h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{s.label}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {s.id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Memory 厚さ
                    </p>
                    <Badge variant={depthVariant(s.memory_depth)}>
                      {s.memory_depth ?? "—"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span>decisions: {s.counts.decisions}</span>
                    <span>failures: {s.counts.failures}</span>
                    <span>experiences: {s.counts.experiences}</span>
                    <span>
                      personalization:{" "}
                      {s.counts.has_personalization ? "あり" : "なし"}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    total memory: {s.counts.total} entries
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Memory の厚さに差をつけてあります。各 subject に入って「SoM 判定」で Memory ON/OFF を切り替えると、
          出力差が体感できます。
        </p>
      </section>
    </div>
  );
}

function depthVariant(
  d?: "thick" | "medium" | "thin" | "empty"
): "default" | "secondary" | "outline" {
  if (d === "thick") return "default";
  if (d === "medium") return "secondary";
  return "outline";
}
