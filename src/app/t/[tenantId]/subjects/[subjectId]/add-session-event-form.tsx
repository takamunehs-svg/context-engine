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
        <ScoreField
          id="stakeholder_alignment"
          label="意思決定者の納得度"
          anchorLow="1 反対"
          anchorHigh="5 合意"
        />
        <ScoreField
          id="operating_clarity"
          label="運用設計の明確さ"
          anchorLow="1 曖昧"
          anchorHigh="5 明文化"
        />
        <ScoreField
          id="field_readiness"
          label="現場の準備度"
          anchorLow="1 未着手"
          anchorHigh="5 自走可"
        />
        <ScoreField
          id="rollout_risk"
          label="展開リスク"
          anchorLow="1 低"
          anchorHigh="5 高"
          inverted
        />
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

function ScoreField({
  id,
  label,
  anchorLow,
  anchorHigh,
  inverted,
}: {
  id: string;
  label: string;
  anchorLow: string;
  anchorHigh: string;
  inverted?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <Label htmlFor={id}>{label}</Label>
        {inverted && (
          <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
            高=悪い
          </span>
        )}
      </div>
      <Input id={id} name={id} type="number" min={1} max={5} />
      <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-[var(--fg-subtle)]">
        <span>{anchorLow}</span>
        <span>{anchorHigh}</span>
      </div>
    </div>
  );
}
