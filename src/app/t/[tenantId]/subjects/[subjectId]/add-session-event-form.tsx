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
          <Label htmlFor="session_date">支援日</Label>
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
          <Label htmlFor="stakeholder_alignment">意思決定者の納得度</Label>
          <Input id="stakeholder_alignment" name="stakeholder_alignment" type="number" min={1} max={5} />
        </div>
        <div>
          <Label htmlFor="operating_clarity">運用設計の明確さ</Label>
          <Input
            id="operating_clarity"
            name="operating_clarity"
            type="number"
            min={1}
            max={5}
          />
        </div>
        <div>
          <Label htmlFor="field_readiness">現場の準備度</Label>
          <Input
            id="field_readiness"
            name="field_readiness"
            type="number"
            min={1}
            max={5}
          />
        </div>
        <div>
          <Label htmlFor="rollout_risk">展開リスク</Label>
          <Input
            id="rollout_risk"
            name="rollout_risk"
            type="number"
            min={1}
            max={5}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="session_notes">支援メモ</Label>
        <Textarea
          id="session_notes"
          name="session_notes"
          rows={2}
          placeholder="例：販社チームと新パッケージの運用フローをレビュー。値引き条件で意見が割れた。"
        />
      </div>
      <div>
        <Label htmlFor="client_signal">クライアントの反応・社内シグナル</Label>
        <Textarea
          id="client_signal"
          name="client_signal"
          rows={2}
          placeholder="例：営業統括が「現場で回せるか不安」と発言。"
        />
      </div>
      <Button type="submit">セッション記録を保存（追記のみ）</Button>
    </form>
  );
}
