'use client';

import { ArrowRight } from "lucide-react";

export function JudgeForm({
  defaults,
}: {
  defaults: { bp_systolic: number; bp_diastolic: number; pain_nrs: number };
}) {
  return (
    <form action="" method="get" className="space-y-6">
      <input type="hidden" name="submitted" value="1" />
      <div className="grid md:grid-cols-3 gap-4">
        <FactInput
          name="bp_systolic"
          label="BP 収縮期"
          unit="mmHg"
          defaultValue={defaults.bp_systolic}
        />
        <FactInput
          name="bp_diastolic"
          label="BP 拡張期"
          unit="mmHg"
          defaultValue={defaults.bp_diastolic}
        />
        <FactInput
          name="pain_nrs"
          label="疼痛 NRS"
          unit="0-10"
          defaultValue={defaults.pain_nrs}
          min={0}
          max={10}
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
