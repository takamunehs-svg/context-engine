import Link from "next/link";
import { getTenantMeta } from "@/lib/fs/tenant";
import { getSubjectProfile, listActivityEvents, loadMemory } from "@/lib/fs/subject";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddSessionEventForm } from "./add-session-event-form";
import { AddMeasurementEventForm } from "./add-measurement-event-form";
import { AddMemoryDecisionForm } from "./add-memory-decision-form";
import { AddMemoryFailureForm } from "./add-memory-failure-form";
import { AddMemoryExperienceForm } from "./add-memory-experience-form";

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
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono">
            <Link href={`/t/${tenantId}`} className="underline">
              {meta.display_name}
            </Link>{" "}
            / subjects / {subjectId}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.display_name}
          </h1>
        </div>
        <Link href={`/t/${tenantId}/subjects/${subjectId}/judge`}>
          <Button>Management 判定（Memory ON/OFF 比較）</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">プロフィール</CardTitle>
          <CardDescription className="font-mono text-xs">
            soa/subjects/{subjectId}.md
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="grid md:grid-cols-3 gap-2">
            <div>
              <span className="text-muted-foreground">since: </span>
              {profile.since ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">primary: </span>
              {profile.primary_concern ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">frequency: </span>
              {profile.session_frequency ?? "—"}
            </div>
          </div>
          {profile.body && (
            <pre className="text-xs whitespace-pre-wrap bg-muted/40 p-3 rounded mt-2">
              {profile.body.trim()}
            </pre>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList>
          <TabsTrigger value="activity">Activity イベント ({events.length})</TabsTrigger>
          <TabsTrigger value="memory">
            Memory ({memory.counts.total})
          </TabsTrigger>
          <TabsTrigger value="add">追加</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground">
            <strong>append-only</strong>。既存行は変更されません。補正は新イベントで上書き。
          </p>
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground">イベントなし</p>
          )}
          {events.slice().reverse().map((e) => (
            <Card key={e.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {e.event_type}
                    </Badge>
                    <span className="ml-2 text-xs text-muted-foreground font-mono">
                      {e.recorded_at}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {e.id}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted/40 p-2 rounded overflow-x-auto">
                  {JSON.stringify(e.context, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="memory" className="space-y-4 mt-4">
          <Tabs defaultValue="decisions">
            <TabsList>
              <TabsTrigger value="decisions">
                decisions ({memory.counts.decisions})
              </TabsTrigger>
              <TabsTrigger value="failures">
                failures ({memory.counts.failures})
              </TabsTrigger>
              <TabsTrigger value="experiences">
                experiences ({memory.counts.experiences})
              </TabsTrigger>
              <TabsTrigger value="personalization">personalization.md</TabsTrigger>
            </TabsList>

            <TabsContent value="decisions" className="space-y-2 mt-3">
              {memory.decisions.length === 0 && (
                <p className="text-sm text-muted-foreground">エントリなし</p>
              )}
              {memory.decisions.slice().reverse().map((d) => (
                <Card key={d.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{d.title}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {d.recorded_at}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>
                      <strong>状況：</strong>
                      {d.context}
                    </p>
                    <p>
                      <strong>判断：</strong>
                      {d.decision}
                    </p>
                    <p>
                      <strong>理由：</strong>
                      {d.rationale}
                    </p>
                    {d.outcome && (
                      <p>
                        <strong>結果：</strong>
                        {d.outcome}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="failures" className="space-y-2 mt-3">
              {memory.failures.length === 0 && (
                <p className="text-sm text-muted-foreground">エントリなし</p>
              )}
              {memory.failures.slice().reverse().map((f) => (
                <Card key={f.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {f.what_went_wrong}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {f.recorded_at}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>
                      <strong>根本原因：</strong>
                      {f.root_cause}
                    </p>
                    <p>
                      <strong>予防策：</strong>
                      {f.prevention}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {f.pattern_tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="experiences" className="space-y-2 mt-3">
              {memory.experiences.length === 0 && (
                <p className="text-sm text-muted-foreground">エントリなし</p>
              )}
              {memory.experiences.slice().reverse().map((e) => (
                <Card key={e.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        weight {e.emotional_weight}/10
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {e.recorded_at}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>{e.insight}</p>
                    <div className="flex flex-wrap gap-1">
                      {e.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="personalization" className="mt-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono">
                    memory/{subjectId}/personalization.md
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {memory.personalization.trim().length > 0 ? (
                    <pre className="text-xs whitespace-pre-wrap bg-muted/40 p-3 rounded">
                      {memory.personalization.trim()}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">未作成</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="add" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity: セッション記録を追加</CardTitle>
              <CardDescription>append-only</CardDescription>
            </CardHeader>
            <CardContent>
              <AddSessionEventForm tenantId={tenantId} subjectId={subjectId} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity: 測定を追加</CardTitle>
              <CardDescription>append-only</CardDescription>
            </CardHeader>
            <CardContent>
              <AddMeasurementEventForm
                tenantId={tenantId}
                subjectId={subjectId}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Memory: decision を追加
              </CardTitle>
              <CardDescription>
                append-only · subject 固有化を厚くする
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddMemoryDecisionForm tenantId={tenantId} subjectId={subjectId} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Memory: failure を追加</CardTitle>
              <CardDescription>
                失敗ログ · 再発防止資産。append-only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddMemoryFailureForm tenantId={tenantId} subjectId={subjectId} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Memory: experience を追加
              </CardTitle>
              <CardDescription>
                気づき · emotional_weight 1-10。append-only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddMemoryExperienceForm
                tenantId={tenantId}
                subjectId={subjectId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
