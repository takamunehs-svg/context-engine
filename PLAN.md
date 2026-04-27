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

### 3.4 統合した結論

**ファイルシステム（MD/JSONL/YAML）が First**。Web UI と AI は同じファイルを読む。3層+Memoryの構造を**ファイル配置として**表現し、それを操作する Web UI を被せる。

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
├── soa/                             … System of Activity（append-only）
│   ├── _schema.yaml                 …  イベント種別ごとのフィールド定義
│   ├── events/
│   │   ├── 2026-04/                 …  月別ディレクトリ（性能用）
│   │   │   └── events.jsonl         …  日付昇順で append
│   │   └── ...
│   └── subjects/                    …  対象別（クライアント・選手等）のインデックス
│       └── {subject_id}.md          …  対象プロフィール（人間可読）
│
├── som/                             … System of Management（版管理）
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

### Phase 0（今日中：4-6時間スコープ）

- [x] プロジェクト初期化（Next.js 16 + TS + Tailwind v4）
- [x] 主要依存追加（Framer Motion / Supabase / Zod / RHF）
- [x] AGENTS.md / PLAN.md / SPEC.md 作成
- [ ] shadcn/ui init + 必要コンポーネント
- [ ] 追加依存：gray-matter, js-yaml
- [ ] `data/` に健康指導サンプルテンプレを配置（INSTRUCTIONS / dictionary / soa / som / memory）
- [ ] ファイルアクセス層（`src/lib/fs/`）
- [ ] Web UI 最小：
  - トップ：業界テンプレ選択
  - 辞書層ビュー
  - Activity Layer ビュー + イベント追加
  - Management Layer 判定ビュー（**Memory 参照 ON/OFF トグル + 出力差表示**）
  - Memory ビュー + 追記
- [ ] git init + 初回コミット
- [ ] 動作確認 + サマリ報告

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
└─ 業界横展開性
    ├─ L8: 業界テンプレート数
    ├─ L9: テンプレ追加にかかる時間（設計→稼働）
    └─ L10: テンプレ差し替えで挙動変更できた事例数
```

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

**残すもの**：杉本本由来の設計思想（責務分離・残管理・依存性注入・テーブル駆動・ビジネスルール疎結合化）はそのまま採用。SPEC.md §2.2 / §2.3 で「Activity Layer（System of Activity）」のように **原典用語を併記** し、出典明記。

**代替案**: SoA / SoM のまま維持
**不採用理由**: 業界横展開性（L8）と説明コスト低減（L10）のため

### D-008: テンプレ形式 = `git template repo`（2026-04-27 検討中）

**動かす葉**: L9, L10

業界テンプレを「ファイルセットのスケルトン」として配布する形を検討中。テンプレ適用 = `git clone template-repo && git push tenant-repo`。

**未確定**：マネージドSaaSモード時にテンプレマーケットをDBで管理するかファイルで管理するか

---

## 9. 進捗ログ

| 日付 | 状態 |
|---|---|
| 2026-04-26 | プロジェクト初期化・3資料読み込み・設計再考・File System First へピボット |

---

## 関連ドキュメント

- 上位事業ルール：`/Users/takamune/Documents/事業OS/CLAUDE.md`
- 健康指導アプリ（参考、別事業）：`/Users/takamune/Documents/事業OS/SCコンサルティング/conditioning-app/`
- 設計思想スライド（DNP提案書）：`/Users/takamune/Documents/事業OS/slide-starter/decks/dnp-design-philosophy/index.html`
- ライセンス事業戦略：`/Users/takamune/Documents/事業OS/戦略室/ライセンス事業_戦略ドラフト.md`
- 設計の3源流：
  - 杉本『データモデリングでドメインを駆動する』 → `/Users/takamune/Documents/事業OS/references/domain-modeling/`
  - Muratcan「The File System Is the New Database」 → `/Users/takamune/Documents/事業OS/AIに関する参考資料/`
  - 梶谷『生成AI時代を勝ち抜く事業・組織のつくり方』 → `/Users/takamune/Documents/事業OS/戦略室/参考資料/10_生成AI時代を勝ち抜く事業と組織の育て方/`
