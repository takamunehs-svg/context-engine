import Link from "next/link";
import { listTenants } from "@/lib/fs/tenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const tenants = await listTenants();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          3層 × Episodic Memory で「使うほど subject 固有化」を体感する
        </h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          context-engine は、辞書層（普遍）/ SoA（現場ログ・append-only）/ SoM（判定・版管理） に、
          subject 別の Episodic Memory が積層していく構造を、
          ファイルシステム（MD / JSONL / YAML）の上で動かすメタプラットフォームです。
          <br />
          テナント（N社 = フレームを使うコンサル業者・トレーナー）の中で、複数の subject（A社・B社・C社）が
          並列に走り、Memory が厚くなるほど AI 出力が固有化していきます。
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">テナント一覧</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tenants.map((t) => (
            <Link key={t.tenant_id} href={`/t/${t.tenant_id}`} className="block group">
              <Card className="transition-colors group-hover:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t.display_name}</CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">
                      {t.applied_template}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    {t.tenant_id} · since {t.created_at}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {t.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {t.subjects?.map((s) => (
                      <Badge key={s.id} variant="secondary" className="text-xs">
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
