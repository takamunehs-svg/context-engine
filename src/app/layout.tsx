import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "context-engine — The context engine for human-AI collaboration",
  description:
    "4層モデル（辞書 / 活動 / 管理 + Episodic Memory）で、AI を「その対象専用の協働相手」に育てるメタプラットフォーム。File System First.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 md:px-8 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-sm tracking-tight text-[var(--fg)]"
        >
          <span className="font-medium">context-engine</span>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]"
            aria-hidden
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--fg-muted)]">
          <Link
            href="/t/sample-tenant"
            className="hover:text-[var(--fg)] transition-colors"
          >
            Demo
          </Link>
          <Link
            href="/t/sample-tenant/dictionary"
            className="hover:text-[var(--fg)] transition-colors"
          >
            Dictionary
          </Link>
          <a
            href="#principles"
            className="hover:text-[var(--fg)] transition-colors"
          >
            Principles
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/t/sample-tenant"
            className="group inline-flex items-center gap-1.5 rounded-md border border-[var(--border-color)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-mono text-[var(--fg)] transition-colors"
          >
            Try the demo
            <ArrowUpRight className="h-3 w-3 arrow-slide" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--border-color)]">
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="font-medium">context-engine</span>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]"
                aria-hidden
              />
            </div>
            <p className="text-xs text-[var(--fg-muted)] font-mono">
              Phase 0 · File System First
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-md">
              Data lives in MD / JSONL / YAML.
              <br />
              Append-only is non-negotiable.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-[var(--border-color)] text-xs font-mono text-[var(--fg-subtle)]">
              <span>© 2026 Takamune Watanabe</span>
              <span>v0.1.0</span>
              <span className="ml-auto flex gap-4">
                <span>SPEC.md</span>
                <span>PLAN.md</span>
                <span>DESIGN.md</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
