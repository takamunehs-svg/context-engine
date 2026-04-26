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
          <Label htmlFor="measured_date">測定日</Label>
          <Input
            id="measured_date"
            name="measured_date"
            type="date"
            defaultValue={today}
            required
          />
        </div>
        <div>
          <Label htmlFor="bp_systolic">BP 収縮期</Label>
          <Input id="bp_systolic" name="bp_systolic" type="number" />
        </div>
        <div>
          <Label htmlFor="bp_diastolic">BP 拡張期</Label>
          <Input id="bp_diastolic" name="bp_diastolic" type="number" />
        </div>
        <div>
          <Label htmlFor="weight_kg">体重 (kg)</Label>
          <Input id="weight_kg" name="weight_kg" type="number" step={0.1} />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">ノート</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <Button type="submit">測定イベントを append</Button>
    </form>
  );
}
