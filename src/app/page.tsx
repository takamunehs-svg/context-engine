import Link from "next/link";
import { listTenants } from "@/lib/fs/tenant";
import { ArrowRight, ArrowUpRight, Layers, FileText, GitBranch, Brain } from "lucide-react";

export default async function HomePage() {
  const tenants = await listTenants();
  return (
    <>
      <Hero />
      <FourLayers />
      <TheCore />
      <Tenants tenants={tenants} />
      <Principles />
      <Industries />
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* 背景：CSSグラデの薄いオーロラ（Phase 0：Three.js は後で差し替え） */}
      <div className="hero-bg absolute inset-0 -z-10" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg)_70%)]" aria-hidden />

      <div className="mx-auto max-w-7xl px-6 md:px-8 py-32 md:py-44">
        <div className="max-w-4xl">
          <p className="label-mono mb-8">CONTEXT ENGINE · v0.1.0</p>

          <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-[1.05] text-[var(--fg)]">
            The context engine
            <br />
            for human–AI{" "}
            <span className="italic font-extralight">collaboration</span>.
          </h1>

          <div className="mt-10 max-w-2xl space-y-5 text-lg text-[var(--fg-muted)] leading-[1.85]">
            <p>
              <span className="text-[var(--fg)]">3層構造 × Episodic Memory</span>{" "}
              が積層するほど、
              <br />
              AI は「その対象専用の協働相手」に育つ。
            </p>
            <p>
              ファイルシステム（MD / JSONL / YAML）の上で動く、
              <br />
              業界横展開可能なメタプラットフォーム。
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              href="/t/sample-tenant"
              className="group inline-flex items-center gap-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-glow)] px-5 py-3 text-sm font-medium text-[#052e1c] transition-colors shadow-[0_0_24px_rgba(16,185,129,0.25)]"
            >
              View live demo
              <ArrowRight className="h-4 w-4 arrow-slide" strokeWidth={2} />
            </Link>
            <a
              href="#four-layers"
              className="group inline-flex items-center gap-2 rounded-md border border-[var(--border-color)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] px-5 py-3 text-sm font-mono text-[var(--fg)] transition-colors"
            >
              Read the spec
              <ArrowUpRight className="h-4 w-4 arrow-slide" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 4 Layers
// ─────────────────────────────────────────────────────────

const layers = [
  {
    code: "01",
    en: "Dictionary Layer",
    jp: "ルールブック",
    desc: "業者が業務で使う「判断基準書」。学校の成績ルール、保険の料金表、就業規則のように「この条件ならこう動く」を表にしたもの。1度作ったら年単位で固定。AI は読むだけ。",
    nature: "永続",
    edit: "年単位",
    icon: FileText,
  },
  {
    code: "02",
    en: "Activity Layer",
    jp: "履歴ログ",
    desc: "対象（クライアント・選手・生徒）と過去にあったことを時系列で全部記録。病院のカルテ、銀行の取引履歴、LINE のトーク履歴と同じ。書き換え禁止、起きたことは下に追記するだけ。",
    nature: "append-only",
    edit: "セッション毎",
    icon: Layers,
  },
  {
    code: "03",
    en: "Management Layer",
    jp: "AI 相談窓口",
    desc: "「今こういう状況、どう動けばいい？」を AI に聞く画面。AI はルールブックと取扱い説明書を見て答える。版管理つき（v1, v2 …）で、過去の判定も後から追える。",
    nature: "版管理",
    edit: "週次〜月次",
    icon: GitBranch,
  },
  {
    code: "04",
    en: "Episodic Memory",
    jp: "取扱い説明書",
    desc: "ベテラン担当者が頭に持っている「この対象の特徴・反応パターン」をデータ化したもの。美容師が覚えてる「この客はアレルギーあり」、営業マンが覚えてる「この社長はゴルフ好き」のような知見。使うほど厚くなる。",
    nature: "subject別 / append-only",
    edit: "都度",
    icon: Brain,
  },
];

function FourLayers() {
  return (
    <section
      id="four-layers"
      className="border-t border-[var(--border-color)]"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-24 md:py-32">
        <div className="mb-16">
          <p className="label-mono mb-4">FOUR LAYERS</p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight max-w-3xl">
            <span className="text-[var(--fg)]">ルールブック</span>
            <span className="text-[var(--fg-muted)]"> × </span>
            <span className="text-[var(--fg)]">履歴ログ</span>
            <span className="text-[var(--fg-muted)]"> × </span>
            <span className="text-[var(--fg)]">AI 相談窓口</span>
            <span className="text-[var(--fg-muted)]"> × </span>
            <span className="text-[var(--fg)]">取扱い説明書</span>
          </h2>
          <p className="mt-4 text-[var(--fg-muted)] max-w-2xl text-base leading-relaxed">
            業務に必要な 4 つの要素を、ファイルとして管理する仕組み。業者が使う
            <span className="text-[var(--fg)]">ルールブック</span>は共通のまま、
            対象（クライアント・選手・生徒）ごとの<span className="text-[var(--fg)]">履歴</span>と
            <span className="text-[var(--fg)]">取扱い説明書</span>だけが並列に積み上がる。
          </p>
        </div>

        <div className="grid gap-px bg-[var(--border-color)] md:grid-cols-2 border border-[var(--border-color)] rounded-lg overflow-hidden">
          {layers.map((l) => {
            const Icon = l.icon;
            return (
              <div
                key={l.code}
                className="bg-[var(--bg)] p-8 md:p-10 group hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="label-mono">LAYER {l.code}</span>
                  <Icon
                    className="h-4 w-4 text-[var(--fg-muted)] group-hover:text-[var(--accent-primary)] transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-2xl font-light tracking-tight text-[var(--fg)] mb-1">
                  {l.en}
                </h3>
                <p className="text-sm text-[var(--accent-primary)] font-mono mb-6">
                  {l.jp}
                </p>
                <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-8">
                  {l.desc}
                </p>
                <div className="flex gap-6 text-xs font-mono">
                  <div>
                    <span className="text-[var(--fg-subtle)]">性質 </span>
                    <span className="text-[var(--fg)]">{l.nature}</span>
                  </div>
                  <div>
                    <span className="text-[var(--fg-subtle)]">編集 </span>
                    <span className="text-[var(--fg)]">{l.edit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// THE CORE — Memory が積層するほど subject 固有化
// ─────────────────────────────────────────────────────────

function TheCore() {
  return (
    <section className="border-t border-[var(--border-color)] bg-[var(--bg-subtle)]/30">
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <p className="label-mono mb-4">THE CORE</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight leading-tight">
              Memory が積層するほど、
              <br />
              <span className="text-[var(--accent-primary)]">subject 専用に</span>
              <br />
              固有化していく。
            </h2>
          </div>
          <div className="md:col-span-7 space-y-6 text-[var(--fg-muted)] leading-relaxed">
            <p>
              context-engine の核心は「使うほど、その個人・会社にアジャストされる構造」。
              3層構造のスキーマは共通のまま、subject 別の Memory（判断・失敗・気づき）が
              並列に積層することで、AI の出力が
              <span className="text-[var(--fg)]">「汎用」</span>から
              <span className="text-[var(--accent-primary)]">「subject 固有化」</span>
              へ徐々に変わる。
            </p>
            <p>
              トレーナー N社が抱える A社・B社・C社は、辞書層も活動層スキーマも管理層ルールも
              同じものを使う。違うのは Memory の厚さと内容だけ。だから
              <span className="text-[var(--fg)]">フレームは1つのまま</span>、
              出力だけが対象に合わせて深まっていく。
            </p>
            <div className="pt-4">
              <Link
                href="/t/sample-tenant"
                className="group inline-flex items-center gap-2 text-[var(--accent-primary)] hover:text-[var(--accent-glow)] text-sm font-mono"
              >
                Try this with sample-tenant
                <ArrowRight className="h-4 w-4 arrow-slide" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Tenants
// ─────────────────────────────────────────────────────────

async function Tenants({
  tenants,
}: {
  tenants: Awaited<ReturnType<typeof listTenants>>;
}) {
  return (
    <section className="border-t border-[var(--border-color)]">
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-24 md:py-32">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="label-mono mb-4">TENANTS</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">
              活用中の N社
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tenants.map((t) => (
            <Link
              key={t.tenant_id}
              href={`/t/${t.tenant_id}`}
              className="group block rounded-lg border border-[var(--border-color)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] p-8 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="label-mono text-[var(--fg-subtle)]">
                  {t.tenant_id}
                </span>
                <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--accent-primary)]">
                  {t.applied_template} v{t.template_version}
                </span>
              </div>
              <h3 className="text-2xl font-light tracking-tight text-[var(--fg)] mb-3 group-hover:text-[var(--accent-primary)] transition-colors">
                {t.display_name}
              </h3>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed line-clamp-3 mb-6 whitespace-pre-line">
                {t.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-6 border-t border-[var(--border-color)]">
                {t.subjects?.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-[var(--border-color)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--fg-muted)]"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Principles
// ─────────────────────────────────────────────────────────

const principles = [
  {
    code: "01",
    title: "Context Engineering > Prompt Engineering",
    desc: "プロンプトではなく、AI に渡す材料の構造で品質が決まる。",
  },
  {
    code: "02",
    title: "Progressive Disclosure",
    desc: "最大2 hops で目的のデータに到達。全部読ませない。",
  },
  {
    code: "03",
    title: "AI-Neutral",
    desc:
      "Claude / GPT / Gemini / 自社AI で同じ品質で動く plain text 構造。特定ベンダーに依存しない、可搬性のある資産。",
  },
];

function Principles() {
  return (
    <section
      id="principles"
      className="border-t border-[var(--border-color)] bg-[var(--bg-subtle)]/30"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-24 md:py-32">
        <p className="label-mono mb-4">PRINCIPLES</p>
        <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-16">
          設計思想 3原則
        </h2>
        <div className="space-y-px bg-[var(--border-color)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          {principles.map((p) => (
            <div
              key={p.code}
              className="bg-[var(--bg)] hover:bg-[var(--bg-elevated)] transition-colors p-8 md:p-10 grid md:grid-cols-12 gap-6 items-start"
            >
              <div className="md:col-span-1">
                <span className="font-mono text-sm text-[var(--accent-primary)]">
                  {p.code}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-xl font-light tracking-tight text-[var(--fg)]">
                  {p.title}
                </h3>
              </div>
              <div className="md:col-span-7">
                <p className="text-[var(--fg-muted)] leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Industries
// ─────────────────────────────────────────────────────────

const industries = [
  { en: "Health Coaching", jp: "健康指導", state: "Phase 0 同梱", active: true },
  { en: "Team Sports", jp: "チームスポーツ", state: "Phase 1-2", active: false },
  { en: "Education", jp: "教育", state: "Phase 1-2", active: false },
  { en: "Clinic", jp: "治療院", state: "Phase 2", active: false },
  { en: "Corporate Wellness", jp: "健康経営", state: "Phase 2", active: false },
  { en: "Custom", jp: "任意（テナント自作）", state: "Phase 2", active: false },
];

function Industries() {
  return (
    <section className="border-t border-[var(--border-color)]">
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-24 md:py-32">
        <div className="mb-16">
          <p className="label-mono mb-4">INDUSTRIES</p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">
            業界横展開
          </h2>
          <p className="mt-4 text-[var(--fg-muted)] max-w-2xl">
            同じフレームを、ドメインに合わせて差し替える。
            辞書層・スキーマ・ルールを業界テンプレートとしてパッケージ化。
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-color)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          {industries.map((ind) => (
            <div
              key={ind.en}
              className={`p-8 ${
                ind.active
                  ? "bg-[var(--bg-elevated)]"
                  : "bg-[var(--bg)] opacity-70"
              } hover:bg-[var(--bg-subtle)] transition-colors`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono text-xs text-[var(--fg-subtle)]">
                  {ind.state}
                </span>
                {ind.active && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                )}
              </div>
              <h3 className="text-lg font-light text-[var(--fg)]">{ind.en}</h3>
              <p className="text-sm text-[var(--fg-muted)] mt-1">{ind.jp}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
