import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "context-engine",
  description:
    "4層モデル（辞書 / 活動 / 管理 + Episodic Memory）のメタプラットフォーム — File System First",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-sm font-semibold tracking-tight"
            >
              context-engine
            </Link>
            <span className="text-xs text-muted-foreground">
              Phase 0 · File System First
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t mt-12">
          <div className="mx-auto max-w-6xl px-4 py-3 text-xs text-muted-foreground">
            データ正本 = ファイルシステム（MD / JSONL / YAML）。Append-only は非交渉。
          </div>
        </footer>
      </body>
    </html>
  );
}
