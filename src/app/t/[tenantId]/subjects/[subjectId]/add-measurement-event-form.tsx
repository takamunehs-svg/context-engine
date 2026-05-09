'use client';

import { addMeasurementEventAction } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AddMeasurementEventForm({
  tenantId,
  subjectId,
}: {
  tenantId: string;
  subjectId: string;
}) {
  const action = addMeasurementEventAction.bind(null, tenantId, subjectId);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="space-y-3 text-sm">
      <div className="grid md:grid-cols-4 gap-3">
        <div>
          <Label htmlFor="measured_date">チェック日</Label>
          <Input
            id="measured_date"
            name="measured_date"
            type="date"
            defaultValue={today}
            required
          />
        </div>
        <div>
          <Label htmlFor="milestone_progress_pct">マイルストーン進捗 (%)</Label>
          <Input id="milestone_progress_pct" name="milestone_progress_pct" type="number" min={0} max={100} />
        </div>
        <div>
          <Label htmlFor="decision_latency_days">意思決定の停滞日数</Label>
          <Input id="decision_latency_days" name="decision_latency_days" type="number" min={0} />
        </div>
        <div>
          <Label htmlFor="adoption_readiness">定着準備度</Label>
          <Input id="adoption_readiness" name="adoption_readiness" type="number" min={1} max={5} />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">ノート</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="例：マイルストーン進捗が想定より15%遅延。停滞は意思決定者の不在期間。"
        />
      </div>
      <Button type="submit">測定を保存（追記のみ）</Button>
    </form>
  );
}
