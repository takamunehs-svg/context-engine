'use client';

import { addMemoryExperienceAction } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AddMemoryExperienceForm({
  tenantId,
  subjectId,
}: {
  tenantId: string;
  subjectId: string;
}) {
  const action = addMemoryExperienceAction.bind(null, tenantId, subjectId);
  return (
    <form action={action} className="space-y-3 text-sm">
      <div>
        <Label htmlFor="insight">気づき・洞察</Label>
        <Textarea id="insight" name="insight" rows={2} required />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="emotional_weight">emotional_weight (1-10)</Label>
          <Input
            id="emotional_weight"
            name="emotional_weight"
            type="number"
            min={1}
            max={10}
            defaultValue={6}
            required
          />
        </div>
        <div>
          <Label htmlFor="tags">タグ（カンマ区切り）</Label>
          <Input id="tags" name="tags" placeholder="動機付け, 言語化" />
        </div>
      </div>
      <Button type="submit">experience を append</Button>
    </form>
  );
}
