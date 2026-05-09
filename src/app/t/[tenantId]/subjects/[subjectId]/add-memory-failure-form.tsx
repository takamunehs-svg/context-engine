'use client';

import { addMemoryFailureAction } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AddMemoryFailureForm({
  tenantId,
  subjectId,
}: {
  tenantId: string;
  subjectId: string;
}) {
  const action = addMemoryFailureAction.bind(null, tenantId, subjectId);
  return (
    <form action={action} className="space-y-3 text-sm">
      <div>
        <Label htmlFor="what_went_wrong">何が起きたか</Label>
        <Textarea
          id="what_went_wrong"
          name="what_went_wrong"
          rows={2}
          required
          placeholder="例：初回ヒアリングで前提を揃えず、運用の話に飛んでしまった。"
        />
      </div>
      <div>
        <Label htmlFor="root_cause">根本原因</Label>
        <Textarea
          id="root_cause"
          name="root_cause"
          rows={2}
          placeholder="例：意思決定者が誰かを確認しないまま開始した。"
        />
      </div>
      <div>
        <Label htmlFor="prevention">予防策</Label>
        <Textarea
          id="prevention"
          name="prevention"
          rows={2}
          placeholder="例：初回前に「誰が承認するか」を明文化する。"
        />
      </div>
      <div>
        <Label htmlFor="pattern_tags">タグ（カンマ区切り）</Label>
        <Input id="pattern_tags" name="pattern_tags" placeholder="新規導入, 完璧主義" />
      </div>
      <Button type="submit">失敗ログを保存（追記のみ）</Button>
    </form>
  );
}
