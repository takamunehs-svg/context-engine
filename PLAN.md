# context-engine PLAN.md

> セッションを始める前にこのファイルを読めば、現状と次にやるべきことが即座に把握できる状態を維持してください。
> 関連：`SPEC.md`（設計思想・データモデル）/ `AGENTS.md`（作業ルール）

---

## 1. プロジェクトのコアメッセージ

**「3層構造（辞書層 / Activity Layer / Management Layer）に Episodic Memory が積み重なるほど、その個人・会社に固有化していき、AIの出力品質が上がっていく」** — その構造そのものを体感できる Web アプリ。

汎用的な業界テンプレ（辞書）に、現場ログ（Activity Layer）と判定（Management Layer）と、判断・失敗・気づき（Memory）が積層していくことで、AI が「その対象専用の協働相手」に育っていく — これが Muratcan 流「AI that has your judgment」を、3層構造の上で形にしたもの。

---

## 2. 戦略意図（プロジェクトの位置づけ）

### context-engine の正体

ユーザー（渡邊鷹宗）が「**AIネイティブ事業構築コンサル / アドバイザー**」として活動するための **主戦兵器**。Muratcan が `Agent-Skills-for-Context-Engineering` を GitHub に置きつつ Sully.ai で Context Engineer として稼いでいるのと同じ構造。**システムは武器、本業はコンサル**。

### 想定セグメント

| セグメント | 形態 | 主収益源 |
|---|---|---|
| A: 大企業（DNP 等）| **self-host** + コンサル契約 | アドバイザリー・カスタマイズ・教育 |
| B: トレーナー・治療院 | **マネージドSaaS**（中央集権でも可）| 月額サブスク |
| C: ユーザー自身 | ローカル実行 | 自分の事業OSを動かす + 商談デモ |

データの機密性が高い大企業は self-host が必須。一方、機密度が低い個人事業はマネージドでも OK。**同じコードベースで両モード対応**するのが目標。

### 収益継続の仕組み（Phase 2 以降の設計対象）

self-host でも継続収益を確保する仕掛けを後で組み込む：
- 辞書層・スキル・Management Layerルールの**定期アップデート配信**
- アドバイザリー契約（月額）
- 業界テンプレ更新権
- 認定プログラム / コミュニティアクセス
- マネージドホスティング選択肢

### conditioning-app との関係

**完全に別事業・別商品**。conditioning-app は健康指導の縦特化アプリで継続稼働。context-engine が将来成熟したら、conditioning-app を「健康指導テンプレ（フル版）」として同居させる選択肢はあるが、Phase 4 以降。

### 知財方針（弁理士・森山氏 2026-04-22 助言と整合）

- 商標：屋号・ブランド名は商品形が固まってから出願（コードネーム context-engine 固定）
- 特許：商品化後に再検討
- 内部分類記号（C1-C5・A-G・R0-R3等）は **メタプラットフォームに持ち込まない**（業界テンプレ作成者の範囲）
- 保護は **商標 + 契約 + 秘密管理 + 先使用権タイムスタンプ** の4点

---

## 3. 設計思想（3つの源流の統合）

### 3.1 杉本「データモデリングでドメインを駆動する」由来

- 基幹系 = **Activity Layer + Management Layer** の組合せ。情報処理の性格が根本的に異なる
- **Activity Layer は2階建て**（業務機能・業務プロセス）。業務機能の最小単位は「**残**」を核に成立
- **残 = バッファー**（活動と活動の間）。発生イベント・解消イベントを紐付ける
- **Management Layer は3階層**（財務的 / 業務分野別 / 現場に近い経営管理）
- Activity Layer と Management Layer は **多次元・バージョン・ビジネスルール** の必要性が違う
- ビジネスルールは **依存性注入・テーブル駆動・DSL** で Activity Layer から疎結合化する
- **データモデル ≠ ドメインモデル**。データモデルが核心
- 「**ドメインを駆動する設計**」 — ドメインの未来を駆動する側に立つ

### 3.2 Muratcan「The File System Is the New Database」由来

- **ファイルシステムが新しいDB**。Git リポジトリ全体が OS。Zero dependencies
- **Context Engineering > Prompt Engineering**：「AIが正しい判断をするために何の情報が必要で、それをどう構造化すれば実際に使うか」
- **Progressive Disclosure 3層**：Routing（常時）→ Module（必要時）→ Data（タスク時）。**最大2 hops**
- **Module isolation** で token 使用量大幅削減
- フォーマット原則：
  - **JSONL** = append-only by design・stream-friendly・1行ずつ自己完結
  - **YAML** = 階層・コメント・人機械両読
  - **Markdown** = LLM native・universal rendering・clean Git diffs
- **Append-only is non-negotiable** — convention ではなく **safety mechanism**
- **JSONL の冒頭スキーマ行**：`{"_schema": "...", "_version": "1.0"}`
- Episodic Memory = 「ファイルを持つAI」と「**判断を持つAI**」の差

### 3.3 梶谷「生成AI時代を勝ち抜く事業・組織のつくり方」由来

- 意義（顧客課題）× 意味（AI 必然性）
- 使えば使うほど質の上がる構造（Memory累積）
- UX = 便益 + 情緒価値 − フリクション
- 組織変革 3→3→1
- MOAT 6類型のうち **「独自データ + オペレーション構造」** が context-engine の堀

### 3.4 Choudary/Parker/Van Alstyne「Platform Revolution」由来

- **Core Interaction**：プラットフォームは Participants + Value Unit + Filter で構成される 1つの中核相互作用から始まる。複数 interaction を最初から作らない
- **Pull / Facilitate / Match**：プラットフォームの3つの key function。現状 context-engine は Match が弱い
- **End-to-End Principle**：core platform は薄く・stable・low variety、application-specific は edge へ。D-003「内部分類記号はメタプラットフォームに持ち込まない」と完全整合
- **Modularity**：core / edge を API（context-engine ではファイル仕様）で接続。第三者がテンプレを独立開発可能に
- **Network Effects 4種**：same/cross-side × positive/negative。Curation がポジティブ効果を生む唯一の方法
- **Launch 戦略 8つ**のうち **Single-side + Seeding + Micromarket** の3点セットを Phase 0-1 で採用
- **Openness 3階層**：Sponsor / Manager / User を分けて判断。Phase 0-1 全 Proprietary、Phase 2 で Developer 開放
- **Governance 4ツール**（Lessig）：Laws / Norms / Architecture / Markets。Phase 2 以降の本格設計対象
- **Metrics**：登録者数ではなく interaction success。Smart metrics 3条件 = Actionable / Accessible / Auditable
- **競争戦略**：context-engine は完全 winner-take-all ではない（業界・専門ニッチが効く）。ニッチ特化が強い
- **Anti-Design Principle**：ユーザーの予期しない使い方への余白を残す

### 3.5 統合した結論

**ファイルシステム（MD/JSONL/YAML）が First × プラットフォーム DNA を最初から組み込む**。Web UI と AI は同じファイルを読む。3層+Memoryの構造を**ファイル配置として**表現し、それを操作する Web UI を被せる。同時に、§3.4 / SPEC.md §1.4 の Core Interaction（テンプレ作成者→テナント）を最初から設計に内包し、Phase 0-1 はテナント内ツール（A2 + A1 種まき）として価値を完成させ、Phase 2 で A1 を本格化する。

---

## 4. データモデル — ファイル配置として

### 4.1 リポジトリ構造（テナント単位）

```
{tenant-root}/
├── INSTRUCTIONS/                    … Progressive Disclosure 3層のルーティング
│   ├── ROUTING.md                   …  Level 1: 常時ロード。「どのモジュールを読むか」だけ
│   ├── DICTIONARY.md                …  Level 2: 辞書層モジュール命令
│   ├── ACTIVITY.md                       …  Level 2: Activity Layer モジュール命令
│   ├── MANAGEMENT.md                       …  Level 2: Management Layer モジュール命令
│   └── MEMORY.md                    …  Level 2: Memory モジュール命令
│
├── dictionary/                      … 辞書層（不変・年単位編集）
│   ├── _schema.yaml                 …  この業界テンプレの辞書スキーマ
│   ├── classifications/             …  分類体系（業界依存）
│   ├── thresholds/                  …  判定閾値
│   ├── references/                  …  参照モデル
│   └── glossary.md                  …  用語集
│
├── activity/                        … Activity Layer / 活動層（append-only）
│   ├── _schema.yaml                 …  イベント種別ごとのフィールド定義
│   ├── events/
│   │   ├── 2026-04/                 …  月別ディレクトリ（性能用）
│   │   │   └── events.jsonl         …  日付昇順で append
│   │   └── ...
│   └── subjects/                    …  対象別（クライアント・選手等）のインデックス
│       └── {subject_id}.md          …  対象プロフィール（人間可読）
│
├── management/                      … Management Layer / 管理層（版管理）
│   ├── _schema.yaml                 …  判定種別ごとのフィールド定義
│   ├── rules/                       …  ビジネスルール（テーブル駆動 / DSL）
│   │   └── {rule_name}.yaml
│   ├── decisions/
│   │   └── {subject_id}/
│   │       ├── {decision_id}_v1.md  …  版管理
│   │       └── {decision_id}_v2.md  …  superseded_by
│   └── plans/
│       └── {subject_id}/
│           └── {plan_id}.md
│
├── memory/                          … Episodic Memory（append-only・最も対象固有化する層）
│   └── {subject_id}/
│       ├── decisions.jsonl          …  判断・理由・代替案・結果
│       ├── failures.jsonl           …  失敗・根本原因・予防策
│       ├── experiences.jsonl        …  気づき（emotional_weight 1-10）
│       └── personalization.md       …  この対象固有の反応パターン・効いた介入
│
├── exports/                         … エクスポート履歴（ZIP/Git push）
│
└── README.md                        … テナント自身の説明
```

### 4.2 業界テンプレートとの関係

**業界テンプレ = リポジトリのスケルトン**。テンプレ適用 = 上記ディレクトリ構造 + サンプル辞書・スキーマ・ルール一式を配置すること。

| テンプレ | 状態 | 主用途 |
|---|---|---|
| 健康指導 | Phase 0 で同梱 | ユーザー自身の主戦領域・商談デモ |
| チームスポーツ | Phase 1-2 候補 | S&C チーム案件で使用 |
| 教育 | Phase 1-2 候補 | 教育スクール事業で使用 |
| 治療院 | Phase 2 候補 | あはき領域 |
| 健康経営 | Phase 2 候補 | Lamina® 領域 |
| 任意（テナントが自作）| Phase 2 | テンプレ作成 SDK |

### 4.3 「使うほど固有化する」の仕掛け

Management Layer 判定実行時、**該当 subject の `memory/` を必ず先に Read** する。

- Memory が空 → 辞書とルールから汎用的な判定
- Memory が積層 → 過去の判断・失敗・反応パターンを引用した固有化された判定
- Memory が厚い → AI の応答が「その対象専用の協働相手」に近づく

Phase 0 UI では、Management Layer 判定画面に「**Memory 参照 ON/OFF**」トグルを置き、ON/OFF で出力差を可視化する。これが「使うほど質が上がる」の体感装置。

---

## 5. 技術スタック

| 分類 | 採用 | 備考 |
|---|---|---|
| Framework | Next.js 16.2.4 (App Router) | **破壊的変更あり**。`node_modules/next/dist/docs/` を参照 |
| Language | TypeScript strict | |
| UI | Tailwind v4 + shadcn/ui + Framer Motion | |
| Forms | React Hook Form + Zod | |
| **データ正本** | **ファイルシステム（MD / JSONL / YAML）** | Git管理。Supabaseは Phase 1 で認証用に追加 |
| ファイルアクセス | Node.js fs API + gray-matter (frontmatter) + js-yaml | サーバーアクション経由 |
| Auth | Phase 0 はなし（ローカル専用）| Phase 1 で Supabase Auth |
| LLM | Phase 0 はなし（決定論的ロジック） | Phase 1 で AI-Neutral アダプタ層 |
| Test | Vitest（Phase 1） | |
| Deploy | Phase 1 後半で Vercel | |

### Phase 0 で Supabase を使わない理由

「ファイルシステムが正本」を最初から徹底するため。DB を入れると、ファイルとDBの二重持ち / 同期問題が必ず生まれる。Muratcan 原則「Zero dependencies, full portability」を守る。

---

## 6. ロードマップ

### Platform 視点（全 Phase 通底）

| Phase | Core Interaction の状態 | Openness | Curation | 主要 Metrics |
|---|---|---|---|---|
| **0-1** | A2（テナント内ツール）+ A1 種まき（健康指導テンプレ自作同梱）| 全 Proprietary | 不要（Producer は渡邊本人のみ）| liquidity / matching quality / trust |
| **2** | A1 本格化（テンプレマーケット）| Developer 階層開放（Keyless / Approved / Bespoke）| 認定制 + 評価機構を稼働 | producer/consumer ratio / LTV / interaction conversion |
| **3+** | A3（ピア間メソッド共有）追加 | コミュニティへ漸進開放 | 自己統治化（コミュニティ・キュレーション）| developer extensions / 急上昇機能 |

→ 詳細は SPEC.md §1.4 / §11 / §12 / §13 / §14 / §15 を参照

### Phase 0（完了：2026-04-29 動作確認済み）

- [x] プロジェクト初期化（Next.js 16 + TS + Tailwind v4）
- [x] 主要依存追加（Framer Motion / Supabase / Zod / RHF）
- [x] AGENTS.md / PLAN.md / SPEC.md 作成
- [x] shadcn/ui init + 必要コンポーネント（badge / button / card / input / label / scroll-area / select / separator / switch / tabs / textarea）
- [x] 追加依存：gray-matter, js-yaml
- [x] `data/` に健康指導サンプルテンプレを配置（`data/templates/health-coaching/` + `data/tenants/sample-tenant/` の INSTRUCTIONS / dictionary / activity / management / memory）
- [x] ファイルアクセス層（`src/lib/fs/`：paths / reader / writer / subject / tenant / management-judge）
- [x] Web UI 最小（**全機能動作確認済み**）：
  - [x] トップ：業界テンプレ選択（`src/app/page.tsx`）
  - [x] 辞書層ビュー（`/t/[tenantId]/dictionary`：YAML/MD 4 files 表示）
  - [x] Activity Layer ビュー + イベント追加（subject ページ + add-*-event-form.tsx）
  - [x] Management Layer 判定ビュー（**Memory 参照 ON/OFF トグル + 出力差表示**：`/t/[tenantId]/subjects/[subjectId]/judge`）
  - [x] Memory ビュー + 追記（add-memory-{decisions,experiences,failures}-form.tsx）
- [x] git init + 初回コミット
- [x] 動作確認 + サマリ報告（2026-04-29：dev server port 3200 で踏査、Memory ON/OFF 比較が CLIENT-A の 12 entries で固有化を完璧に実現）

### Phase 1（1週間以内）

- [ ] Supabase Auth（self-host モード対応：各社の Supabase に接続）
- [ ] マルチテナント（self-host: 1テナント1インスタンス / マネージド: テナント分離）
- [ ] LLM アダプタ層（AI-Neutral：Anthropic / OpenAI / 自社AI）
- [ ] 業界テンプレ2つ目（チームスポーツ or 教育）
- [ ] エクスポート機能（ZIP / Git push）
- [ ] ATC ミーティング後のフィードバック反映
- [ ] Vercel デモ URL

### Phase 2

- [ ] テンプレートマーケット（公式 + ユーザー作成）
- [ ] テンプレ更新サブスク機構（self-host 向け定期更新配信）
- [ ] 既存事業OS（`/Users/takamune/Documents/事業OS/`）との接続レイヤ
- [ ] アドバイザリー契約管理 / コミュニティ機能
- [ ] 課金（Stripe）

### Phase 3

- [ ] SOC 2 / GDPR 対応（マネージドSaaS版）
- [ ] エンタープライズSSO
- [ ] テンプレ作成 SDK / CLI
- [ ] 認定プログラム

### Phase 4

- [ ] conditioning-app を「健康指導フル版テンプレ」として同居
- [ ] データ移行ツール

---

## 7. 価値ツリー（Profit Tree簡易版）

```
[ROOT] AI協働体としての「対象固有化」の深さ
  = 3層構造の整合性 × Memory累積の質 × 業界横展開性

├─ 3層構造の整合性
│   ├─ L1: 辞書層・Activity Layer・Management Layer の責務分離違反ゼロ率
│   ├─ L2: append-only 違反ゼロ率（DB トリガーや読み取り専用ファイル属性で強制）
│   └─ L3: Progressive Disclosure 2hops 守備率
│
├─ Memory累積の質
│   ├─ L4: subject あたり Memory entry 数の伸び
│   ├─ L5: Management Layer 判定時の Memory 参照率
│   ├─ L6: Memory ON / OFF での出力差の有意性
│   └─ L7: failures / experiences の蓄積バランス
│
├─ 業界横展開性
│   ├─ L8: 業界テンプレート数
│   ├─ L9: テンプレ追加にかかる時間（設計→稼働）
│   └─ L10: テンプレ差し替えで挙動変更できた事例数
│
└─ プラットフォーム性（Platform Revolution 由来）
    ├─ L11: Core Interaction（A1）1回あたりの完了時間（Producer のテンプレ作成 → Consumer のテナント適用 → 価値交換）
    ├─ L12: テンプレ供給側（Producer）の数
    ├─ L13: テンプレ消費側（Consumer = テナント）の数
    └─ L14: 同一テンプレを使うテナント数（network effect の強さの代理指標）
```

**Phase 別の主要葉**：
- Phase 0-1：L1, L2, L3（責務分離 + append-only + PD）+ L4, L5, L6（Memory 累積効果）
- Phase 2：L8, L9, L10（業界横展開）+ L12, L13, L14（プラットフォーム成立）
- Phase 3+：L11（Core Interaction の効率）+ L7（Memory バランス）

---

## 8. 意思決定ログ（D-XXX）

> **冒頭に「動かす葉: L1〜L10」を必須記載**。

### D-001: コードネームを context-engine に固定（2026-04-26）

**動かす葉**: L8

ブランド名は商標出願後に決定。コードベース・パッケージ名・URL・ディレクトリ名は context-engine のまま。商標確定後にブランド表記層だけ更新。

### D-002: ファイルシステム First を採用、Phase 0 では DB を使わない（2026-04-26）

**動かす葉**: L1, L2, L3

Muratcan「File System Is the New Database」と杉本「データモデルが核心」の統合。データの正本は MD/JSONL/YAML、Git で版管理。Supabase は Phase 1 で認証専用に。

**代替案A**: Supabase 7テーブル中心設計（最初の設計案）
**不採用理由A**: ファイルとDBの二重持ち、Muratcan の zero-dependency 原則違反、DNP のような大企業は self-host 必須でDB前提だと阻害

**代替案B**: Markdown のみ（YAML/JSONL なし）
**不採用理由B**: append-only の安全性（JSONL）と階層構造（YAML）が表現できない。Format-Function Mapping 原則違反

### D-003: 内部分類記号はメタプラットフォームに持ち込まない（2026-04-26）

**動かす葉**: L8

弁理士助言（2026-04-22）と整合。固有分類記号（C1-C5・A-G・R0-R3 等）は業界テンプレート作成者の範囲。メタプラットフォーム側には汎用語彙のみ（kind / event_type / decision_type 等）。

### D-004: 2モード対応（self-host / マネージドSaaS）を Day 1 から想定（2026-04-26）

**動かす葉**: L8, L10

大企業（DNP）は self-host 必須、トレーナー・治療院はマネージドでも可。同じコードベースで両モード対応。Phase 0 はローカル実行のみ、Phase 1 で Supabase Auth を入れる際に「接続先 Supabase」をテナント側のものにできる設計にする。

**代替案**: 最初はマネージドSaaS のみ
**不採用理由**: DNP のような主要顧客候補が乗れない。collateral として失う

### D-005: Management Layer 判定UIに「Memory 参照 ON/OFF」トグルを置く（2026-04-26）

**動かす葉**: L5, L6

「使うほど質が上がる」を Phase 0 段階で**体感**できる装置にする。Memory が空でも厚くても、ON/OFFの差を見せることで核心メッセージが伝わる。商談デモでも最強の見せ場。

**代替案**: Memory は常に参照して比較しない
**不採用理由**: 「Memory が効いてる」感覚が伝わらない。デモ価値を逃す

### D-006: 「使うほど固有化」を商品の核メッセージとして守る（2026-04-26）

**動かす葉**: L4, L5, L6

ユーザー指示：「3層の役割と概念にクライアントとのエピソードが加わると、よりその個人・会社にアジャストされていき、どんどん性能が上がっていく構造」。これを失う設計判断はすべて却下。

### D-007: 用語を「Activity Layer / Management Layer」に汎用語化（2026-04-27）

**動かす葉**: L8, L10

杉本本固有の用語「SoA / SoM」を、業界標準的な英語汎用語「Activity Layer / Management Layer」にリブランド。

**経緯**：
- 杉本『データモデリングでドメインを駆動する』第2章で「SoA / SoM は本書固有の用語」と明記されている
- 業界標準の System of Record/Engagement/Insight（Geoffrey Moore）とは別系統
- 商談・ライセンス事業・横展開のたびに「これは杉本さんという日本の方の本に出てくる用語で…」と前置きが必要になるのは弱い
- 弁理士助言「内部分類記号はメタプラットフォームに持ち込まない」と同根

**新旧対応**：
| 旧（杉本本固有） | 新（汎用語） | 日本語 |
|---|---|---|
| SoA (System of Activity) | Activity Layer | 活動層 |
| SoM (System of Management) | Management Layer | 管理層 |

**残すもの**：杉本本由来の設計思想（責務分離・残管理・依存性注入・テーブル駆動・ビジネスルール疎結合化）はそのまま採用。SPEC.md §2.2 / §2.3 / §10 用語集 で**杉本本との対応関係を脚注として出典明記**（2026-04-29 改訂：見出し併記から脚注方式に整理）。

**代替案**: SoA / SoM のまま維持
**不採用理由**: 業界横展開性（L8）と説明コスト低減（L10）のため

### D-008: テンプレ形式 = `git template repo`（2026-04-27 検討中）

**動かす葉**: L9, L10

業界テンプレを「ファイルセットのスケルトン」として配布する形を検討中。テンプレ適用 = `git clone template-repo && git push tenant-repo`。

**未確定**：マネージドSaaSモード時にテンプレマーケットをDBで管理するかファイルで管理するか

---

### D-009: Core Interaction を A1（テンプレ作成者→テナント）に確定（2026-04-29）

**動かす葉**: L11, L12, L13, L14（Platform Revolution 由来の葉）

Platform Revolution Ch.3 を読み、context-engine をプラットフォーム型として育てる前提でユーザーと合意（2026-04-29）。Core Interaction の3要素（Participants + Value Unit + Filter）に従って、3つの interaction 候補を比較：

| 候補 | Producer | Consumer | Value Unit | プラットフォーム性 |
|---|---|---|---|---|
| **A1（採用）** | テンプレ作成者 | テナント | 業界テンプレ | ◎ |
| A2 | テナント | subject | ガイダンス・判定 | ✕（パイプライン的）|
| A3 | テナント（ピア）| テナント（ピア）| personalization パターン | ○ |

**A1 を Core に確定する理由**：A2 はテナント内で完結しネットワーク効果が発生しない。A1 を Core にすることで Lamina®/ライセンス事業の拡張性が確保される。A3 は Phase 3+ の第二 interaction として後から重ねる。

**Phase 段階展開**（Single-side 戦略 / OpenTable 型）：
- Phase 0-1：A2（テナント内ツール）として価値完成 + A1 種まき（健康指導テンプレ自作同梱）
- Phase 2：A1 本格化
- Phase 3+：A3 追加

**代替案A**：A2 を Core にする → 不採用：context-engine がツールに留まる
**代替案B**：A1 と A3 を最初から両立 → 不採用：Core Interaction の散漫化（Ch.3 警告）

詳細：SPEC.md §1.4

---

### D-010: End-to-End Principle 採用、core/edge 境界を明文化（2026-04-29）

**動かす葉**: L9, L10

Platform Revolution Ch.3「アプリ固有機能は core ではなく edge に置く」を採用。core platform は薄く・stable・low variety、業界固有機能は edge へ。

**core / edge の境界**：
- **Core**：3層+Memory 責務分離・Append-only ルール・JSONL/YAML/MD フォーマット仕様・Progressive Disclosure 2hops・テンプレ適用機構・ファイルアクセス層
- **Edge**：業界テンプレ（辞書スキーマ・活動イベント種別・Management ルール）・内部分類記号（C1-C5・A-G・R0-R3 等）・Memory パターン

**過去の意思決定との整合**：D-003「内部分類記号はメタプラットフォームに持ち込まない」をより明示化。弁理士助言（2026-04-22 森山氏）と完全整合。

詳細：SPEC.md §1.6

---

### D-011: Curation 機構は Phase 2 で本格化（2026-04-29）

**動かす葉**: L8, L13

Platform Revolution Ch.2 の Network Effects 4種を負方向に振らせないため、Curation が必須。ただし Phase 0-1 は Producer が渡邊本人のみなので curation 不要。

**Phase 2 で導入する 4 Curation レイヤー**：Screening（テンプレ作成者の認定）/ Feedback（評価・利用ログ）/ Reputation（評判スコア）/ Human + User-driven gatekeeping。

**Chatroulette 失敗例の教訓**：登録不要・無制御で Naked Hairy Men 問題が起きて崩壊。context-engine では「Curation なき第三者テンプレ受け入れ」を SPEC.md §9 で明示禁止。

詳細：SPEC.md §5.4

---

### D-012: Phase 0-1 Launch 戦略 = Single-side + Seeding + Micromarket（2026-04-29）

**動かす葉**: L8, L12, L13

Platform Revolution Ch.5 の8戦略から3点採用：

| 戦略 | 適用方法 |
|---|---|
| Single-side | A2（テナント内ツール）として価値完成 → A1 へ拡張（OpenTable / redBus 型）|
| Seeding | 健康指導テンプレを渡邊本人が作成し同梱 |
| Micromarket | 健康指導という小さく濃い市場から開始、後に他業界へ拡張 |

**chicken-or-egg 解法**：渡邊本人が Producer 兼第一 Consumer としてシード。ATC（MLB系）が第一 Consumer 候補。

**バイラル成長は当面採用しない**：機密性の高いコンサル業務には向かない。

詳細：SPEC.md §11

---

### D-013: Openness 3軸判断、Phase 0-1 全 Proprietary（2026-04-29）

**動かす葉**: L8, L10

Platform Revolution Ch.7 の Openness 3階層に従い：

| 軸 | Phase 0-1 | Phase 2 | Phase 3+ |
|---|---|---|---|
| Sponsor / Manager | Proprietary（渡邊1社）| 維持 | 維持（ライセンス事業の要）|
| Developer | クローズド | Guardian 型 API 階層開放 | Approved 開発者エコシステム |
| User Producer | 渡邊本人のみ | 認定アドバイザー | コミュニティへ漸進開放 |

**Phase 2 で開く Developer API 階層**：Keyless / Approved / Bespoke の 3階層。

詳細：SPEC.md §12

---

### D-014: Metrics は interaction success ベース、登録者数を主要 KPI にしない（2026-04-29）

**動かす葉**: L11, L13, L14

Platform Revolution Ch.9 と BranchOut 失敗例（4,900万ドル調達 → 100万→3,300万ユーザーで vanity metrics を見て急落）に従い、登録者数・累積テンプレ数・SNS フォロワー等の vanity metrics を主要 KPI にしない。

**Phase 0-1 の主要指標**：liquidity / matching quality / trust。

**Smart Metrics 3条件**：Actionable / Accessible / Auditable。

**最終指標**：「各ネットワーク側にいる happy なテナントが、価値創造的な interaction へ繰り返し、増加的に参加しているか」。

**UI 設計への影響**：登録者数バッジ、累積数表示などの vanity 表示を最初から作らない。

詳細：SPEC.md §14

---

### D-015: Niche specialization 戦略を採用（完全 winner-take-all ではない）（2026-04-29）

**動かす葉**: L8

Platform Revolution Ch.10 の Winner-take-all 4つの力で context-engine を診断した結果、Niche specialization が **弱い = ニッチ特化が効く** 市場と判定。複数プラットフォームが業界別に共存する構造。

**戦略含意**：
- 業界別テンプレ（健康指導・チームスポーツ・教育・治療院・健康経営）でそれぞれ最強テンプレを目指す（Vimeo モデル）
- 高品質 Producer 向けツールを徹底（YouTube 型の汎用大衆化を追わない）
- facilitate と match の品質で勝負（Airbnb vs Craigslist 教訓）

詳細：SPEC.md §15

---

## 9. 進捗ログ

| 日付 | 状態 |
|---|---|
| 2026-04-26 | プロジェクト初期化・3資料読み込み・設計再考・File System First へピボット |
| 2026-04-29 | Platform Revolution（Choudary/Parker/Van Alstyne）読み込み・**プラットフォーム型として育てる前提**でユーザーと合意・SPEC.md §1.4-1.7 / §5.4 / §11-15 / §用語集 / 「やらない」追加・PLAN.md §3.4 / §3.5 / §6 platform 視点 / §7 L11-14 / §8 D-009-015 追加・AGENTS.md R-11 追加・メモリ保存 |

---

## 関連ドキュメント

- 上位事業ルール：`/Users/takamune/Documents/事業OS/CLAUDE.md`
- 健康指導アプリ（参考、別事業）：`/Users/takamune/Documents/事業OS/SCコンサルティング/conditioning-app/`
- 設計思想スライド（DNP提案書）：`/Users/takamune/Documents/事業OS/slide-starter/decks/dnp-design-philosophy/index.html`
- ライセンス事業戦略：`/Users/takamune/Documents/事業OS/戦略室/ライセンス事業_戦略ドラフト.md`
- 設計の4源流：
  - 杉本『データモデリングでドメインを駆動する』 → `/Users/takamune/Documents/事業OS/references/domain-modeling/`
  - Muratcan「The File System Is the New Database」 → `/Users/takamune/Documents/事業OS/AIに関する参考資料/`
  - 梶谷『生成AI時代を勝ち抜く事業・組織のつくり方』 → `/Users/takamune/Documents/事業OS/戦略室/参考資料/10_生成AI時代を勝ち抜く事業と組織の育て方/`
  - Choudary/Parker/Van Alstyne『Platform Revolution』 → `/Users/takamune/Documents/事業OS/サイト構築参考資料/Platform Revolution - Sangeet Paul Choudary.pdf`（原典） / `/Users/takamune/Documents/事業OS/サイト構築参考資料/platform_part1_markdown_kb/`（Chapter 1-6 KB）/ `/Users/takamune/Documents/事業OS/サイト構築参考資料/platform_part2_markdown_kb/`（Chapter 6-11 KB）
