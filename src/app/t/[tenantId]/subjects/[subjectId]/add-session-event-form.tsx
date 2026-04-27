'use client';

import { addSessionEventAction } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AddSessionEventForm({
  tenantId,
  subjectId,
}: {
  tenantId: string;
  subjectId: string;
}) {
  const action = addSessionEventAction.bind(null, tenantId, subjectId);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="space-y-3 text-sm">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="session_date">セッション日</Label>
          <Input
            id="session_date"
            name="session_date"
            type="date"
            defaultValue={today}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration_min">時間（分）</Label>
          <Input
            id="duration_min"
            name="duration_min"
            type="number"
            defaultValue={60}
          />
        </div>
        <div>
          <Label htmlFor="rpe">RPE (6-20)</Label>
          <Input id="rpe" name="rpe" type="number" min={6} max={20} />
        </div>
        <div>
          <Label htmlFor="pain_nrs_pre">NRS（前）</Label>
          <Input
            id="pain_nrs_pre"
            name="pain_nrs_pre"
            type="number"
            min={0}
            max={10}
          />
        </div>
        <div>
          <Label htmlFor="pain_nrs_post">NRS（後）</Label>
          <Input
            id="pain_nrs_post"
            name="pain_nrs_post"
            type="number"
            min={0}
            max={10}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="session_notes">セッションノート</Label>
        <Textarea id="session_notes" name="session_notes" rows={2} />
      </div>
      <div>
        <Label htmlFor="client_subjective">クライアント主観コメント</Label>
        <Textarea id="client_subjective" name="client_subjective" rows={2} />
      </div>
      <Button type="submit">Activity イベントを append</Button>
    </form>
  );
}
