import Link from "next/link";
import { getTenantMeta } from "@/lib/fs/tenant";
import { getSubjectProfile, loadMemory } from "@/lib/fs/subject";
import { judge } from "@/lib/fs/som-judge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const submitted = "submitted" in sp;
  const facts = submitted
    ? {
        bp_systolic: numFromSP(sp.bp_systolic),
        bp_diastolic: numFromSP(sp.bp_diastolic),
        pain_nrs: numFromSP(sp.pain_nrs),
      }
    : null;

  const offResult = facts
    ? await judge({
        tenant_id: tenantId,
        subject_id: subjectId,
        decision_type: "intervention_plan",
        current_facts: facts,
        use_memory: false,
      })
    : null;

  const onResult = facts
    ? await judge({
        tenant_id: tenantId,
        subject_id: subjectId,
        decision_type: "intervention_plan",
        current_facts: facts,
        use_memory: true,
      })
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono">
            <Link href={`/t/${tenantId}`} className="underline">
              {meta.display_name}
            </Link>{" "}
            /{" "}
            <Link
              href={`/t/${tenantId}/subjects/${subjectId}`}
              className="underline"
            >
              {profile.display_name}
            </Link>{" "}
            / SoM judge
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            SoM 判定 — Memory ON / OFF 比較
          </h1>
        </div>
        <Link href={`/t/${tenantId}/subjects/${subjectId}`}>
          <Button variant="outline" size="sm">
            ← subject へ戻る
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            この subject の Memory 厚さ
          </CardTitle>
          <CardDescription>
            Memory ON 時にこれが Context に積まれて、出力が固有化する
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">
              decisions: {memory.counts.decisions}
            </Badge>
            <Badge variant="default">failures: {memory.counts.failures}</Badge>
            <Badge variant="default">
              experiences: {memory.counts.experiences}
            </Badge>
            <Badge variant="outline">
              personalization:{" "}
              {memory.counts.has_personalization ? "あり" : "なし"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">事実（facts）の入力</CardTitle>
          <CardDescription>
            介入計画判定の入力。BP・NRS の値で辞書層のルールがマッチする
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="" method="get" className="space-y-4">
            <input type="hidden" name="submitted" value="1" />
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bp_systolic">BP 収縮期 (mmHg)</Label>
                <Input
                  id="bp_systolic"
                  name="bp_systolic"
                  type="number"
                  defaultValue={String(sp.bp_systolic ?? 135)}
                />
              </div>
              <div>
                <Label htmlFor="bp_diastolic">BP 拡張期 (mmHg)</Label>
                <Input
                  id="bp_diastolic"
                  name="bp_diastolic"
                  type="number"
                  defaultValue={String(sp.bp_diastolic ?? 85)}
                />
              </div>
              <div>
                <Label htmlFor="pain_nrs">疼痛 NRS (0-10)</Label>
                <Input
                  id="pain_nrs"
                  name="pain_nrs"
                  type="number"
                  min={0}
                  max={10}
                  defaultValue={String(sp.pain_nrs ?? 4)}
                />
              </div>
            </div>
            <Button type="submit">
              判定を実行（Memory OFF と ON を並べて表示）
            </Button>
          </form>
        </CardContent>
      </Card>

      {submitted && offResult && onResult && (
        <section className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="bg-muted/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Memory OFF</CardTitle>
                <Badge variant="outline">汎用出力</Badge>
              </div>
              <CardDescription>
                辞書 + ルール + 当該事実のみ。subject 固有の積層は使わない
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap leading-relaxed">
                {offResult.rendered}
              </pre>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Memory ON</CardTitle>
                <Badge>subject 固有化</Badge>
              </div>
              <CardDescription>
                上記 + memory/{subjectId}/* を Context に積む
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap leading-relaxed">
                {onResult.rendered}
              </pre>
            </CardContent>
          </Card>
        </section>
      )}

      {!submitted && (
        <Card className="bg-muted/20">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            上のフォームに値を入れて判定を実行すると、Memory OFF / ON を並べて表示します。
            <br />
            Memory が厚い subject ほど、ON 側の出力が大きく固有化されます。
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function numFromSP(v: string | string[] | undefined): number | undefined {
  if (v === undefined || Array.isArray(v) || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}
