import Link from "next/link";
import { getTenantMeta, getDictionarySchema, readDictionary } from "@/lib/fs/tenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono">
            <Link href={`/t/${tenantId}`} className="underline">
              {meta.display_name}
            </Link>{" "}
            / dictionary
          </p>
          <h1 className="text-2xl font-bold tracking-tight">辞書層</h1>
        </div>
        <Link href={`/t/${tenantId}`}>
          <Button variant="outline" size="sm">
            ← テナントへ戻る
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">辞書層の性質</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>テナント内で1つ</strong>。subject A・B・C で共通。
          </p>
          <p>
            編集頻度：年単位。AI からは <strong>読み取り専用</strong>。
            業界テンプレ作成者・テナント管理者のみ編集可。
          </p>
          {schema && (
            <p className="font-mono text-xs">
              schema version: {schema.version} ·{" "}
              {schema.edit_policy?.frequency ?? "—"} edit ·{" "}
              {schema.edit_policy?.read_only_for_ai ? "AI: read-only" : "AI: writable"}
            </p>
          )}
        </CardContent>
      </Card>

      <section>
        <h2 className="text-lg font-semibold mb-3">
          エントリ ({entries.length} 件)
        </h2>
        <div className="grid gap-3">
          {entries.map((e) => (
            <Card key={e.path}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-mono">{e.path}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {e.format}
                  </Badge>
                </div>
                {e.format === "md" && (
                  <CardDescription>
                    {(e.data as { frontmatter?: { description?: string } })
                      .frontmatter?.description ?? ""}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted/40 p-3 rounded overflow-x-auto max-h-72">
                  {e.format === "yaml"
                    ? JSON.stringify(e.data, null, 2)
                    : (e.data as { body: string }).body.slice(0, 1500) +
                      ((e.data as { body: string }).body.length > 1500 ? "\n…" : "")}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
