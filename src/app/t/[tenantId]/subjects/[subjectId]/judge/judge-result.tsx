import type { ReactNode } from "react";
import type { MemoryBundle } from "@/types/core";

export function JudgeResult({
  variant,
  title,
  subtitle,
  caption,
  icon,
  rendered,
  ruleId,
  memoryCounts,
}: {
  variant: "off" | "on";
  title: string;
  subtitle: string;
  caption: string;
  icon: ReactNode;
  rendered: string;
  ruleId: string | null;
  memoryCounts: MemoryBundle["counts"];
}) {
  const isOn = variant === "on";
  return (
    <article
      className={`rounded-lg overflow-hidden flex flex-col ${
        isOn
          ? "border border-[var(--accent-border)] bg-[var(--bg-elevated)] shadow-[0_0_32px_rgba(16,185,129,0.10)]"
          : "border border-[var(--border-color)] bg-[var(--bg-elevated)]"
      }`}
    >
      {/* header */}
      <header
        className={`px-6 py-4 border-b ${
          isOn
            ? "border-[var(--accent-border)] memory-on-bg"
            : "border-[var(--border-color)]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={isOn ? "text-[var(--accent-primary)]" : "text-[var(--fg-muted)]"}>
              {icon}
            </span>
            <h3 className="text-base font-medium text-[var(--fg)]">{title}</h3>
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-mono ${
                isOn
                  ? "border border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
                  : "border border-[var(--border-color)] text-[var(--fg-muted)]"
              }`}
            >
              {subtitle}
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--fg-muted)]">{caption}</p>
      </header>

      {/* meta strip */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-[var(--bg-subtle)]/50 border-b border-[var(--border-color)] text-[10px] font-mono">
        <span className="text-[var(--fg-subtle)]">
          rule:{" "}
          <span className="text-[var(--fg)]">{ruleId ?? "—"}</span>
        </span>
        <span className="text-[var(--fg-subtle)]">
          memory used:{" "}
          <span className={isOn ? "text-[var(--accent-primary)]" : "text-[var(--fg)]"}>
            {isOn ? `${memoryCounts.total} entries + personalization` : "—"}
          </span>
        </span>
      </div>

      {/* body */}
      <div className="flex-1 px-6 py-6 overflow-auto max-h-[640px]">
        <pre className="whitespace-pre-wrap text-[13px] leading-[1.7] text-[var(--fg)] font-mono">
          {rendered}
        </pre>
      </div>
    </article>
  );
}
