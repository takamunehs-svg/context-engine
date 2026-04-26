'use client';

import { addMemoryDecisionAction } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AddMemoryDecisionForm({
  tenantId,
  subjectId,
}: {
  tenantId: string;
  subjectId: string;
}) {
  const action = addMemoryDecisionAction.bind(null, tenantId, subjectId);
  return (
    <form action={action} className="space-y-3 text-sm">
      <div>
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="context">状況・背景</Label>
        <Textarea id="context" name="context" rows={2} />
      </div>
      <div>
        <Label htmlFor="alternatives_considered">
          検討した代替案（1行ごと）
        </Label>
        <Textarea
          id="alternatives_considered"
          name="alternatives_considered"
          rows={3}
          placeholder="案A&#10;案B&#10;案C"
        />
      </div>
      <div>
        <Label htmlFor="decision">判断（採用したもの）</Label>
        <Textarea id="decision" name="decision" rows={2} required />
      </div>
      <div>
        <Label htmlFor="rationale">理由</Label>
        <Textarea id="rationale" name="rationale" rows={2} />
      </div>
      <div>
        <Label htmlFor="outcome">結果（任意・後追記でも可）</Label>
        <Textarea id="outcome" name="outcome" rows={2} />
      </div>
      <Button type="submit">decision を append</Button>
    </form>
  );
}
