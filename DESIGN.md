# context-engine DESIGN.md

> Web UIのデザイン仕様書（梶谷『AIで作るデザイン性の高いWebサイト』8つのポイント フォーマット準拠）。
> AI実装者との共有言語として機能させるため、あいまいな表現は避ける。
> 関連：`SPEC.md`（設計思想・データモデル）/ `PLAN.md`（進捗・意思決定）

---

## 1. Design Direction（デザイン方針）

### 1.1 コンセプト

**Engineering Dark × Editorial Restraint** — 開発者ツール（Linear / Vercel / Cursor）の硬派な世界観に、エディトリアル寄りのタイポと余白を重ねる。

「AI 時代のメタプラットフォーム」が一目で伝わる、ダーク基調・モノタイポ主役・控えめな緑グロー。

### 1.2 トーン

| 〜ではなく | 〜である |
|---|---|
| カラフル・ポップ | **モノクロ + 1色の差し色** |
| イラストや写真主体 | **タイポグラフィと余白主役** |
| 「親しみやすいAI」 | **「設計思想を売る、知的で硬派」** |
| SaaSランディングページ | **エディトリアル寄りのプロダクトページ** |
| ノイズ多め | **静謐・空白・必要な情報だけ** |
| 装飾的アニメーション | **意味のあるモーション**（Memory が積層していく等） |

### 1.3 カラースキーム

#### ベース（OKLCH準拠で `globals.css` に固定）

| トークン | HEX | 用途 |
|---|---|---|
| `--bg` | `#0a0a0a` | ページ背景（near-black） |
| `--bg-elevated` | `#141414` | カード・モーダル |
| `--bg-subtle` | `#171717` | テーブル行・サブセクション |
| `--fg` | `#fafafa` | 主要テキスト |
| `--fg-muted` | `#a1a1aa` | 副次テキスト・キャプション |
| `--fg-subtle` | `#71717a` | プレースホルダ・disabled |
| `--border` | `rgba(255,255,255,0.06)` | 標準ボーダー |
| `--border-strong` | `rgba(255,255,255,0.10)` | 強調ボーダー（hover時） |

#### アクセント

| トークン | HEX | 用途 |
|---|---|---|
| `--accent` | `#10b981` | プライマリCTA・Memory ON強調・アクセント線 |
| `--accent-glow` | `#34d399` | ホバー・グロー・Three.js 粒子 |
| `--accent-subtle` | `rgba(16,185,129,0.08)` | カードhover背景・薄いハイライト |

#### セマンティック

| トークン | HEX | 用途 |
|---|---|---|
| `--danger` | `#ef4444` | medical_referral等の警告 |
| `--warning` | `#f59e0b` | attention系・閾値超過 |
| `--info` | `#3b82f6` | 情報系（控えめ使用） |

#### グラデーション

```css
/* Hero 背景の薄いグロー */
--gradient-hero: radial-gradient(
  ellipse at 30% 20%,
  rgba(16, 185, 129, 0.10) 0%,
  transparent 50%
), radial-gradient(
  ellipse at 70% 80%,
  rgba(52, 211, 153, 0.06) 0%,
  transparent 50%
);

/* Memory ON 側のカード強調 */
--gradient-memory-on: linear-gradient(
  180deg,
  rgba(16, 185, 129, 0.04) 0%,
  rgba(16, 185, 129, 0) 100%
);
```

### 1.4 フォント

| 用途 | フォント | ウェイト |
|---|---|---|
| 欧文・大見出し | **Geist** | 300 / 400 / 500 / 600 |
| 欧文・mono | **Geist Mono** | 400 / 500 |
| 和文・本文 | **Noto Sans JP** | 400 / 500 / 700 |
| 和文・大見出し | **Noto Sans JP** | 500 / 700（letter-spacing狭め） |

#### 使い分けルール

- **見出し（英語）**：Geist 300〜400 で **大きめサイズ**（48-72px）→ Editorial 感
- **見出し（日本語）**：Noto Sans JP 500、letter-spacing `-0.02em`、サイズは英語より一段小さく
- **本文**：Noto Sans JP 400 / 16px / line-height 1.7
- **mono**：Geist Mono 400 / 12-13px。tenant_id・subject_id・ファイルパス・JSONなど構造的データすべて
- **アクセント数値**（Memory件数等）：Geist Mono 500 / 大きめサイズ

#### 日英の組み合わせ（POSTS パターン）

```
[英語の大見出し ← Geist Light で広く・大きく]

[日本語サブコピー ← Noto Sans JP 400 で説明的に]

[ ボタン ← Geist Medium → ]
```

例：
```
The context engine for AI collaboration

3層構造 × Episodic Memory が積層するほど、AI は「その対象専用の協働相手」に育つ。

[ View live demo → ]
```

---

## 2. セクション構成

### 2.1 グローバル要素

#### Header（全ページ共通）

```
┌────────────────────────────────────────────────────────────────────┐
│  context-engine ●               docs / GitHub / Try demo  [Login] │
│  (mono / 14px)                  (small links)         (subtle btn)│
└────────────────────────────────────────────────────────────────────┘
```

- 高さ：`h-14`（56px）
- 背景：`backdrop-blur-md` + `bg-[#0a0a0a]/80`（スクロール時のみ）
- ボーダー下：`border-b border-[var(--border)]`（スクロール時のみフェードイン）
- ロゴ左：`context-engine` を Geist Mono 14px、後ろに `●`（accent色）の小さな円
- 中央：薄いリンク（`text-fg-muted hover:text-fg`）
- 右：`Try demo` outline button + ログイン

#### Footer

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  context-engine                                                    │
│  Phase 0 · File System First                                       │
│                                                                    │
│  Data lives in MD / JSONL / YAML. Append-only is non-negotiable.   │
│                                                                    │
│  ──────────────                                                   │
│                                                                    │
│  © 2026 渡邊鷹宗            v0.1.0    GitHub  ·  Docs              │
└────────────────────────────────────────────────────────────────────┘
```

- 上ボーダー1本
- 大きな余白（`py-24`）
- mono 系で版バージョン表記
- 設計原則の一文を必ず入れる

### 2.2 トップ（ホーム）

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER                                                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  [ Three.js liquid-hero — Memory が積層していく粒子表現 ]           │
│                                                                    │
│  ─────────────────────────────────────────                         │
│                                                                    │
│  The context engine                                                │
│  for human-AI collaboration.                                       │
│                                                                    │
│  3層構造 × Episodic Memory が積層するほど、                          │
│  AI は「その対象専用の協働相手」に育つ。                             │
│                                                                    │
│  ファイルシステム（MD / JSONL / YAML）の上で動く、                   │
│  業界横展開可能なメタプラットフォーム。                              │
│                                                                    │
│  [ View live demo → ]   [ Read the spec ]                          │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  4 LAYERS                                                          │
│                                                                    │
│  辞書層 × 活動層 × 管理層 × エピソード記憶                          │
│                                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Dictionary  │ │ Activity    │ │ Management  │ │ Episodic    │ │
│  │ Layer       │ │ Layer       │ │ Layer       │ │ Memory      │ │
│  │ 辞書層       │ │ 活動層       │ │ 管理層       │ │ 固有化資産    │ │
│  │             │ │             │ │             │ │             │ │
│  │ 普遍知識     │ │ 現場ログ     │ │ 判定・計画   │ │ subject別積層│ │
│  │ 年単位       │ │ append-only │ │ 版管理       │ │ append-only │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  THE CORE                                                          │
│                                                                    │
│  Memory が積層するほど、subject 専用に固有化していく                 │
│                                                                    │
│  ┌────────────┬─────────────┐                                     │
│  │ Memory OFF │ Memory ON   │                                     │
│  │ 汎用出力    │ subject固有 │                                     │
│  │ ─────      │ ─────       │                                     │
│  │ [サンプル]  │ [サンプル]   │                                     │
│  └────────────┴─────────────┘                                     │
│                                                                    │
│  [ Try this with sample-tenant → ]                                 │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  TENANTS（活用中の N社）                                            │
│                                                                    │
│  [カード × 1〜N]                                                    │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  PRINCIPLES                                                        │
│                                                                    │
│  01 — Context Engineering > Prompt Engineering                     │
│  02 — Progressive Disclosure（最大2 hops）                          │
│  03 — AI-Neutral（plain text + Git）                                │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  INDUSTRIES（業界横展開）                                            │
│                                                                    │
│  健康指導 · チームスポーツ · 教育 · 治療院 · 健康経営 · 任意          │
│  （タイル並列・hoverで業界別の例コピー）                              │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                             │
└────────────────────────────────────────────────────────────────────┘
```

#### Hero コピー確定版（変更時はここを編集）

- **メイン（英語）**：`The context engine for human-AI collaboration.`
- **サブ1（日本語）**：「3層構造 × Episodic Memory が積層するほど、AI は『その対象専用の協働相手』に育つ。」
- **サブ2（日本語）**：「ファイルシステム（MD / JSONL / YAML）の上で動く、業界横展開可能なメタプラットフォーム。」
- **CTA1**：`View live demo →`（プライマリ・accent色背景）
- **CTA2**：`Read the spec`（ghost button）

### 2.3 テナント詳細ページ

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER                                                             │
├────────────────────────────────────────────────────────────────────┤
│  tenant: sample-tenant · template: health-coaching v0.1.0          │
│                                                                    │
│  サンプルN社（健康指導コンサル）                                      │
│  ──────────                                                       │
│                                                                    │
│  [ description テキスト ]                                          │
│                                                                    │
│  [ 辞書層を見る ] [ 全文エクスポート（Phase 1）]                     │
├────────────────────────────────────────────────────────────────────┤
│  SUBJECTS（このテナントが抱えるクライアント）                         │
│                                                                    │
│  ┌─[A社カード]─────┐ ┌─[B社カード]─────┐ ┌─[C社カード]─────┐       │
│  │ MEMORY DEPTH    │ │ MEMORY DEPTH    │ │ MEMORY DEPTH    │      │
│  │ ████████░ thick │ │ ██░░░░░░░ thin  │ │ ████░░░░░ med   │      │
│  │                 │ │                 │ │                 │      │
│  │ A社（仮）        │ │ B社（仮）        │ │ C社（仮）        │      │
│  │ ──────          │ │ ──────          │ │ ──────          │      │
│  │ 12 entries       │ │ 2 entries       │ │ 6 entries       │      │
│  │ d:5 / f:3 / e:4 │ │ d:1 / f:0 / e:1 │ │ d:3 / f:1 / e:2 │      │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘      │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                             │
└────────────────────────────────────────────────────────────────────┘
```

- subject カード：**Memory厚さに応じてグロー強度を変える**（thick = `--accent-glow` 強、thin = ボーダーのみ）
- 「MEMORY DEPTH」バー：CSS で塗り分け
- カード hover：枠線が `--border-strong` + accent-subtle 背景にスローフェード（200ms）

### 2.4 subject 詳細ページ

タブ構造（`activity / memory / add`）は維持しつつ、見せ方を整える：

- タブを ghost-style underline tabs に
- カード内のJSONは `bg-[var(--bg-subtle)]` + `font-mono text-xs` + 細いボーダー
- Memory entry はカード型ではなく **timeline 表示**：左に縦線、各エントリは点 + 横方向に説明
- personalization.md は専用ビュー（プロース体・読み物として整える）

### 2.5 Management 判定ページ（**核心・最も力を入れる**）

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER                                                             │
├────────────────────────────────────────────────────────────────────┤
│  N社 / A社 / Management judge                                      │
│                                                                    │
│  Management 判定                                                   │
│  ──────────                                                       │
│  Memory が積層するほど、出力は subject 固有化する。                  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  この subject の MEMORY                                            │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ████████████░ 12 entries                                     │  │
│  │ decisions  ████████  5                                      │  │
│  │ failures   ██████    3                                      │  │
│  │ experiences████████  4                                      │  │
│  │ personalization      あり ✓                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  INPUT — facts                                                     │
│                                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                           │
│  │ BP系統     │ │ BP拡張    │ │ NRS      │                          │
│  │ [ 145  ] │ │ [ 90   ] │ │ [ 5    ] │                           │
│  └──────────┘ └──────────┘ └──────────┘                           │
│                                                                    │
│  [ Run judgment → ]                                                │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  RESULT                                                            │
│                                                                    │
│  ┌─[ Memory OFF ]──────────┐  ┌─[ Memory ON ]──────────────┐      │
│  │ 汎用出力                 │  │ subject 固有化             │      │
│  │ ──────                  │  │ ──────                    │      │
│  │ ※薄いborder              │  │ ※accent borderとglow      │      │
│  │                          │  │                            │      │
│  │ # 介入計画 — 判定結果      │  │ # 介入計画 — 判定結果      │     │
│  │ ## ルール照合              │  │ ## ルール照合               │     │
│  │ - rule: low_default       │  │ - rule: low_default        │     │
│  │ ## Memory（OFF）           │  │ ## Memory（ON）             │     │
│  │ > 参照していません          │  │ > 反映：personalization     │     │
│  │                            │  │   + failures + experiences │     │
│  │ ## 推奨アクション           │  │ ## 推奨アクション            │     │
│  │ - 標準プログラムで開始       │  │ - 標準プログラム + 注意点    │     │
│  │ - 月次でレビュー            │  │   ・新種目は1セッション1つ   │     │
│  │                            │  │   ・「もう一回」と促さない    │     │
│  │                            │  │   ・睡眠の質を共通指標に     │     │
│  └────────────────────────┘  └────────────────────────────┘      │
│                                                                    │
│  ↑ 同じ事実に対して、左は汎用、右は **A社 12件のMemory が反映**       │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                             │
└────────────────────────────────────────────────────────────────────┘
```

#### この画面のデザイン上の最重要ポイント

1. **Memory 量バー**：横棒グラフで件数を視覚化（4本：decisions / failures / experiences / personalization）
2. **左右並列の出力カード**：
   - 左（OFF）：背景 `--bg-elevated`、ボーダー `--border`、控えめな見た目
   - 右（ON）：背景 `--gradient-memory-on`、ボーダー `--accent` の0.3透過、薄いグロー
   - **右側の "subject 固有化" 部分（personalization セクションや failures セクション）は accent 色で左ボーダー線を引く**
3. **判定実行時のアニメーション**：左→右 の順で 150ms 遅延フェードイン（Framer Motion `staggerChildren`）。「Memory が後から積層してくる」感
4. **新規 entry 追加後の判定再実行で、Memory バーが伸びるアニメーション**

### 2.6 辞書層ページ

```
┌────────────────────────────────────────────────────────────────────┐
│  N社 / dictionary                                                  │
│                                                                    │
│  Dictionary Layer                                                  │
│  ──────────                                                       │
│  辞書層 — 普遍知識・テナント内で1つ・年単位編集・AIは読み取り専用     │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  SCHEMA                                                            │
│  [schema YAML の整形ビュー]                                         │
│                                                                    │
│  ENTRIES                                                           │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 📁 classifications/                                         │  │
│  │   risk-levels.yaml                       4 entries · YAML  │  │
│  │ 📁 thresholds/                                              │  │
│  │   intervention-thresholds.yaml           5 entries · YAML  │  │
│  │ 📁 references/                                              │  │
│  │   program-design.md                      MD                 │  │
│  │ glossary.md                              MD                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

- ファイルツリー風表示（mono フォント・各行ホバーで accent 下線）
- クリックで右ペインに展開 or モーダル

---

## 3. グローバルなインタラクション仕様

### 3.1 スクロールアニメーション

- **セクション entrance**：`opacity 0 → 1`, `translateY 24px → 0`, `0.6s ease-out`、Intersection Observer で1回だけ発火（Framer Motion `whileInView` + `viewport={{ once: true }}`）
- **見出しの slow reveal**：英語見出しは1文字ずつ stagger 30ms（オプション、Phase 0では不要）
- **3層+Memory図解**：4枚のカードが左から順に 80ms ずつ stagger でフェードイン

### 3.2 ホバーエフェクト

| 対象 | エフェクト |
|---|---|
| カード | 200ms で `border` → `--border-strong`、`bg` → `--accent-subtle`、`translateY -2px` |
| プライマリボタン | 150ms で背景 `--accent` → `--accent-glow` |
| セカンダリリンク | underline スライドイン（左→右）+ accent 色 |
| subject カード | Memory厚さに応じた **グロー強度の増加** |
| アイコン付きリンク | 矢印が右に `4px` スライド |

### 3.3 ページ遷移

- Next.js `router.push` 標準のまま（過剰なトランジションは避ける）
- 共通レイアウトはサーバーで保持（layout.tsx）
- ローディング中はヘッダー下に薄い `accent` 色の進行バー（オプション・Phase 1で）

### 3.4 レスポンシブの方針

**梶谷ポイント6準拠：PC版を先に完成、モバイルは後で一括**。

- 主要ブレークポイント：`md: 768px` / `lg: 1024px` / `xl: 1280px`
- グリッド：max-width `1280px` (`max-w-7xl`)、px-6 md:px-8
- モバイル：Phase 0 末で対応（Hero と判定画面は縦積み）

### 3.5 ダーク/ライトモード

- **ダーク基調を主**にし、Phase 0 ではライトモード対応しない
- `prefers-color-scheme: light` でも上記ダーク色を強制（`html.dark` を default）
- Phase 1 でライト切替を検討

### 3.6 Three.js Hero エフェクト（梶谷ポイント5準拠）

#### コンセプト

「**Memory が積層していく流れ**」を液体パーティクルで可視化。POSTS の `liquid-hero` パターンを参考に、context-engine 固有の表現を作る。

#### 実装方針

- ライブラリ：`three` + `@react-three/fiber` + `@react-three/drei`
- レイヤー：Hero 背景の絶対位置 `inset-0`、`pointer-events-none`、`opacity-50`
- パーティクル：1500 個程度の点、`accent`（`#10b981`）と `accent-glow`（`#34d399`）の混色
- 動き：
  - 中央下部から **上方向に流れる粒子**（Memory が積層していくメタファー）
  - 緩やかな回転（`y軸 0.0005 rad/frame`）
  - マウスカーソルに対して反発力（`subtle parallax`）
- パフォーマンス：`prefers-reduced-motion` 対応で静的グラデーションにフォールバック

#### Phase 0 の最小実装

Three.js を入れる前に、まず **CSS グラデーション + Framer Motion で擬似実装** する：

```css
/* 大きな緑のオーロラ風グラデーション、ゆっくり動く */
.hero-bg {
  background:
    radial-gradient(ellipse 60% 80% at 30% 20%, rgba(16,185,129,.10), transparent),
    radial-gradient(ellipse 40% 60% at 70% 80%, rgba(52,211,153,.06), transparent);
  animation: hero-drift 20s ease-in-out infinite alternate;
}
```

Three.js 版は Phase 0 末 or Phase 1 で実装（梶谷ポイント5：使い捨てプロトを複数作って選定）。

---

## 4. 採用技術スタック（梶谷ポイント8準拠）

| 分類 | 採用 | 状態 |
|---|---|---|
| Framework | **Next.js 16** (App Router) | 既存 |
| Language | TypeScript strict | 既存 |
| Styling | **Tailwind CSS v4** | 既存 |
| Components | **shadcn/ui** | 既存 |
| Animation | **Framer Motion** | 既存 |
| Forms | React Hook Form + Zod | 既存 |
| Icons | **Lucide React** | **追加** |
| 3D / Particles | `three` + `@react-three/fiber` + `@react-three/drei` | **追加（Hero用・Phase 0末）** |
| Fonts | Geist + Geist Mono（next/font）+ Noto Sans JP | 既存（和文追加） |
| Deploy | Vercel | Phase 1 |
| Analytics | GA4 | Phase 2 |

---

## 5. コピー・テキスト一覧（実装時はここを正本）

### Hero

```
[英語大見出し]
The context engine
for human-AI collaboration.

[日本語サブ1]
3層構造 × Episodic Memory が積層するほど、
AI は「その対象専用の協働相手」に育つ。

[日本語サブ2]
ファイルシステム（MD / JSONL / YAML）の上で動く、
業界横展開可能なメタプラットフォーム。

[CTA1] View live demo →
[CTA2] Read the spec
```

### 4層モデルセクション

```
[セクション英タイトル] 4 LAYERS
[セクション日本語見出し] 辞書層 × 活動層 × 管理層 × エピソード記憶

Dictionary Layer  · 辞書層
普遍知識・年単位編集・AI読み取り専用

Activity Layer    · 活動層
現場ログ・append-only・補正は新エントリで

Management Layer  · 管理層
判定・計画・版管理・Memoryを参照して固有化

Episodic Memory   · エピソード記憶
判断・失敗・気づき・subject別に積層・最も固有化する
```

### 体感セクション（THE CORE）

```
[英タイトル] THE CORE
[日本語見出し] Memory が積層するほど、subject 専用に固有化していく

[本文]
context-engine の核心は「使うほど、その個人・会社にアジャストされる構造」。
3層構造のスキーマは共通のまま、subject 別の Memory（判断・失敗・気づき）が
並列に積層することで、AI の出力が「汎用」から「subject 固有化」へ徐々に変わる。

[CTA] Try this with sample-tenant →
```

### 設計原則セクション

```
[英タイトル] PRINCIPLES

01 — Context Engineering > Prompt Engineering
プロンプトではなく、AI に渡す材料の構造で品質が決まる。

02 — Progressive Disclosure
最大2 hops で目的のデータに到達。全部読ませない。

03 — AI-Neutral
Claude / GPT / Gemini / 自社AI で同じ品質で動く plain text 構造。
特定ベンダーに依存しない、可搬性のある資産。
```

### 業界セクション

```
[英タイトル] INDUSTRIES
[日本語] 業界横展開 — 同じフレームを、ドメインに合わせて差し替える

健康指導         （Phase 0 同梱）
チームスポーツ   （Phase 1-2 候補）
教育             （Phase 1-2 候補）
治療院           （Phase 2 候補）
健康経営         （Phase 2 候補）
任意（テナント自作）  （Phase 2）
```

### Footer

```
context-engine
Phase 0 · File System First

Data lives in MD / JSONL / YAML. Append-only is non-negotiable.

© 2026 渡邊鷹宗            v0.1.0    GitHub  ·  Docs
```

---

## 6. 実装上の注意事項

### 6.1 AI実装者向け（このファイルが共有言語）

1. このファイルに書かれていない要素は実装しない。指示が必要なら問い合わせる
2. カラーコード・フォント名は **このファイルに記載のとおり正確に** 使う
3. コピー・テキストは **このファイルの「コピー一覧」を正本** とする。勝手に書き換えない
4. アスキーアートのワイヤーフレームは構造の指示。**比率や余白は現代的な感覚に補正してよい**
5. インタラクション仕様は §3 を参照。秒数・ease は守る

### 6.2 Phase 0 のデザイン改修順序

1. **`globals.css` のカラートークン定義**（OKLCH）
2. **`layout.tsx` の Header / Footer 整備**
3. **`page.tsx`（トップ）の全面書き直し** ← Hero + 4層モデル + THE CORE + PRINCIPLES + INDUSTRIES
4. **テナント詳細**：subject カードの memory_depth ビジュアル化
5. **Management 判定**（核心）：左右並列の出力カード + Memory バー + Framer Motion stagger
6. **subject 詳細**：タブ整備 + timeline ビュー（後回し可）
7. **辞書層**：ファイルツリー風表示（後回し可）
8. **Three.js Hero**（Phase 0 末 or Phase 1）

### 6.3 やらないこと

- ライト/ダーク切替（Phase 1）
- モバイル最適化の細部（PC完成後、一括）
- 認証 UI（Phase 1）
- 3パターン以上のカードバリエーション（統一感を優先）
- 業界別の写真・イラスト（タイポと余白で勝負）

---

## 7. 参考サイト（実物を見て採用したパターン）

| 採用元 | 取り入れた要素 |
|---|---|
| **Linear** (linear.app) | 「Designed for the AI era」型タグライン・セクション構成・mono併用 |
| **Vercel** (vercel.com) | 「Build and deploy on the AI Cloud」型・ダーク基調・コードと文章の対比 |
| **Cursor** (cursor.com) | プロダクトデモ前面化・矢印付き CTA・Y Combinator的引用 |
| **Anthropic** (anthropic.com) | 「safety at the frontier」型・思想を売る姿勢 |
| **POSTS** (posts-tokyo.com) | 英語タグライン+日本語サブの並列・Editorial Modernism |
| **Sully.ai** (sully.ai) | Context Engineering の世界観・「医師の自律性維持」と同型の「人間判断の構造化」表現・規制／コンプライアンス早期提示 |
| **Wolff Olins / AREA 17 / monopo.london** | エディトリアル寄りの大胆タイポ・余白の使い方 |

---

## 8. 改訂履歴

| 日付 | 改訂内容 | 担当 |
|---|---|---|
| 2026-04-27 | 初版作成（Engineering Dark + Hero Three.js 方向で確定）| 渡邊鷹宗 + AI |
