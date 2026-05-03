'use client';

import { ArrowRight } from "lucide-react";

export function JudgeForm({
  defaults,
}: {
  defaults: {
    stakeholder_alignment: number;
    operating_clarity: number;
    field_readiness: number;
    rollout_risk: number;
  };
}) {
  return (
    <form action="" method="get" className="space-y-6">
      <input type="hidden" name="submitted" value="1" />
      <div className="grid md:grid-cols-4 gap-4">
        <FactInput
          name="stakeholder_alignment"
          label="意思決定者の納得度"
          unit="1-5"
          defaultValue={defaults.stakeholder_alignment}
          min={1}
          max={5}
        />
        <FactInput
          name="operating_clarity"
          label="運用設計の明確さ"
          unit="1-5"
          defaultValue={defaults.operating_clarity}
          min={1}
          max={5}
        />
        <FactInput
          name="field_readiness"
          label="現場の準備度"
          unit="1-5"
          defaultValue={defaults.field_readiness}
          min={1}
          max={5}
        />
        <FactInput
          name="rollout_risk"
          label="展開リスク"
          unit="1-5"
          defaultValue={defaults.rollout_risk}
          min={1}
          max={5}
        />
      </div>
      <button
        type="submit"
        className="group inline-flex items-center gap-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-glow)] px-5 py-3 text-sm font-medium text-[#052e1c] transition-colors shadow-[0_0_24px_rgba(16,185,129,0.25)]"
      >
        判定を実行（OFF と ON を並列表示）
        <ArrowRight className="h-4 w-4 arrow-slide" strokeWidth={2} />
      </button>
    </form>
  );
}

function FactInput({
  name,
  label,
  unit,
  defaultValue,
  min,
  max,
}: {
  name: string;
  label: string;
  unit: string;
  defaultValue: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs text-[var(--fg-muted)]">{label}</span>
        <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
          {unit}
        </span>
      </div>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        min={min}
        max={max}
        className="w-full rounded-md border border-[var(--border-color)] hover:border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-subtle)] focus:outline-none bg-[var(--bg)] px-3 py-2.5 text-base font-mono text-[var(--fg)] transition-colors num"
      />
    </label>
  );
}
