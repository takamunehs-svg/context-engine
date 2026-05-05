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
          anchorLow="1 反対"
          anchorHigh="5 合意"
          defaultValue={defaults.stakeholder_alignment}
          min={1}
          max={5}
        />
        <FactInput
          name="operating_clarity"
          label="運用設計の明確さ"
          anchorLow="1 曖昧"
          anchorHigh="5 明文化"
          defaultValue={defaults.operating_clarity}
          min={1}
          max={5}
        />
        <FactInput
          name="field_readiness"
          label="現場の準備度"
          anchorLow="1 未着手"
          anchorHigh="5 自走可"
          defaultValue={defaults.field_readiness}
          min={1}
          max={5}
        />
        <FactInput
          name="rollout_risk"
          label="展開リスク"
          anchorLow="1 低"
          anchorHigh="5 高"
          inverted
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
  anchorLow,
  anchorHigh,
  inverted,
  defaultValue,
  min,
  max,
}: {
  name: string;
  label: string;
  anchorLow: string;
  anchorHigh: string;
  inverted?: boolean;
  defaultValue: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs text-[var(--fg-muted)]">{label}</span>
        {inverted && (
          <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
            高=悪い
          </span>
        )}
      </div>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        min={min}
        max={max}
        className="w-full rounded-md border border-[var(--border-color)] hover:border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-subtle)] focus:outline-none bg-[var(--bg)] px-3 py-2.5 text-base font-mono text-[var(--fg)] transition-colors num"
      />
      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-[var(--fg-subtle)]">
        <span>{anchorLow}</span>
        <span>{anchorHigh}</span>
      </div>
    </label>
  );
}
