# context-engine SPEC.md

> 設計思想とデータモデルの仕様書。実装と設計判断の根拠。
> 関連：`AGENTS.md`（作業ルール）/ internal planning docs（進捗・意思決定 — public repo には含まれない）

---

## 0. 階層モデル（最重要・最初に読む）

context-engine は **3階層** で動く。混同しないこと。

```
┌─────────────────────────────────────────────────────┐
│ context-engine（メタプラットフォーム = 汎用フレーム）        │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │ Tenant（テナント = N社）          │
        │ フレームを使うコンサル業者・        │
        │ トレーナー・治療院・S&Cチーム等    │
        └──────────────┬──────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
   Subject A       Subject B       Subject C
   （N社のクライアント・選手・学習者）
```

### 各層の固有化

| 層 | 何を保持 | 粒度 | A/B/C で違うか |
|---|---|---|---|
| **辞書層** | 判定基準・閾値・参照モデル | **テナント内で1つ** | ❌ 共通 |
| **Activity Layer** | 現場活動ログ | **subject 別** | ⭕ 値が違う |
| **Management Layer** | 判定・計画 | **subject 別** | ⭕ 値が違う |
| **Memory** | 判断・失敗・気づき・固有化情報 | **subject 別** | ⭕⭕⭕ **最も違う** |

### 核心メッセージ

**「概念フレーム（辞書・Activity Layer・Management Layer・Memory のスキーマ）はテナント内で1つ。A/B/C別の値・履歴・Memoryエントリだけが並列に積層していく。だから混ざらず崩れず、しかも subject ごとにどんどんパーソナライズされる」**

これが「使えば使うほど質の上がる構造」の正体。N社が10社のクライアントを抱えても、フレームは1セットのまま。新しいクライアント D を取れば、辞書とスキーマはそのまま流用、D の Memory だけゼロから始まる。

---

## 1. 設計の核

### 1.1 一行で

**3層構造（辞書層 / Activity Layer / Management Layer）に subject 別の Episodic Memory が積層するほど、AI がその subject 専用の協働相手に固有化していく — これをファイルシステム上で表現する。**

### 1.2 4つの源流

| 源流 | 提供する設計要素 |
|---|---|
| 杉本『データモデリングでドメインを駆動する』 | 3層構造の責務分離・残管理・ビジネスルール疎結合化 |
| Muratcan「File System Is the New Database」 | ファイルシステム First・Progressive Disclosure・Format-Function Mapping・Episodic Memory |
| 梶谷『生成AI時代を勝ち抜く事業・組織のつくり方』 | 使うほど質が上がる構造・MOAT・UX原則 |
| Choudary/Parker/Van Alstyne『Platform Revolution』 | Core Interaction（Participants + Value Unit + Filter）・Pull/Facilitate/Match・End-to-End Principle・Modularity・Network Effects 4種・Curation・Launch 8戦略・Openness 3階層・市場失敗4原因 + Lessig 4ツール・lifecycle 別 Metrics・ニッチ特化戦略 |

### 1.3 6つの非交渉原則

1. **ファイルシステム First** — データの正本は MD/JSONL/YAML。DB はインデックスや認証等の補助役
2. **3層責務分離** — 辞書層 / Activity Layer / Management Layer を混ぜない。Memory はそれらと独立
3. **Append-only は非交渉** — `activity/events/`, `memory/*/`* は UPDATE/DELETE 禁止。補正は新エントリ
4. **Progressive Disclosure 2 hops** — 最大2ホップで情報に到達できる構造（ROUTING → MODULE → DATA）
5. **AI-Neutral** — Claude/GPT/Gemini/自社AI のいずれでも動く plain text
6. **Context Engineering > Prompt Engineering** — 「AIが正しい判断をするために何の情報が必要で、それをどう構造化すれば実際に使うか」

---

### 1.4 Core Interaction（プラットフォーム設計の起点）

**プラットフォームは「複数の interaction を最初から作る」のではなく、1つの Core Interaction を起点に、後から interaction を重ねて成長する**（Platform Revolution Ch.3）。LinkedIn も最初は「professionals connecting」のみで始まり、後から groups / recruiters / posts を重ねた。

**Core Interaction の3要素**：

```
Participants（参加者）+ Value Unit（価値単位）+ Filter（フィルタ）→ Core Interaction
```

| 要素 | 意味 | context-engine での具体 |
|---|---|---|
| Participants | Producer（価値創造側）と Consumer（価値消費側）| Producer = テンプレ作成者、Consumer = テナント（コンサル業者）|
| Value Unit | Producer が作る、Consumer が消費する単位 | 業界テンプレ（辞書スキーマ + 活動スキーマ + Management ルール一式）|
| Filter | Value Unit を適切な Consumer に届けるアルゴリズム | 業種・規模・専門領域・既存テンプレ評価 |

### context-engine の Core Interaction（決定）

**A1 = テンプレ作成者 → テナント（コンサル業者）の業界テンプレ流通** をプラットフォーム本体の Core Interaction に確定する（D-009 / 2026-04-29）。

| 候補 | Producer | Consumer | Value Unit | プラットフォーム性 | 位置付け |
|---|---|---|---|---|---|
| **A1（採用）** | テンプレ作成者 | テナント | 業界テンプレ | ◎ | **Core Interaction** |
| A2 | テナント | subject（クライアント）| ガイダンス・判定 | ✕（パイプライン的）| **テナント内ツール**（プラットフォーム外） |
| A3 | テナント（ピア）| テナント（ピア）| 実証済み personalization パターン | ○ | **Phase 3+ で重ねる第二 interaction** |

### Phase 別の段階展開（OpenTable / redBus 型 Single-side 戦略）

OpenTable は最初レストラン向けの予約管理ソフト（A2 相当）として価値を出し、レストランが集まってから消費者向け予約プラットフォーム（A1 に近い）に展開した。context-engine も同型：

- **Phase 0-1**：A2（テナント内ツール）として価値を完成 + 健康指導テンプレを seeding として同梱（A1 種まき）
- **Phase 2**：A1 を本格化（テンプレマーケット + curation 機構）
- **Phase 3+**：A3（ピア間メソッド共有）を重ねる

**A2 をプラットフォーム外と位置付ける理由**：A2 はテナント内で完結し、ネットワーク効果が発生しない。これをプラットフォームの Core にすると context-engine はツールに留まり、licensing-based growth が失われる。

---

### 1.5 Pull / Facilitate / Match の3機能（Ch.3）

Core Interaction を成立させるための3つの key function：

| 機能 | 役割 | context-engine での設計責任 |
|---|---|---|
| **Pull** | Producer / Consumer をプラットフォームに引きつける | chicken-or-egg 解消、feedback loop、外部ネットワーク便乗 |
| **Facilitate** | interaction を簡単にする（または品質のために難しくする）| 創作ツール、使用障壁の上下、curation |
| **Match** | 適切な Producer / Consumer をマッチング | データ駆動マッチング、検索、推薦 |

**現状の弱点**：context-engine 設計は **Match が弱い**。テンプレ⇄業種・規模の自動マッチング、ピア間パターン共有のマッチング、Memory entry の状況依存マッチングが未設計。Phase 1-2 で本格設計が必要（D-009 派生）。

---

### 1.6 End-to-End Principle と Modularity（Ch.3）

> *core platform should be stable, simple, low-variety; application-specific features at the edge*

**core / edge の境界**：

| 層 | 性質 | 該当物 |
|---|---|---|
| **Core platform**（薄く・stable・low variety）| 全テナント共通の基盤 | 3層+Memory の責務分離・Append-only ルール・JSONL/YAML/MD フォーマット仕様・Progressive Disclosure 2hops・テンプレ適用機構・ファイルアクセス層 |
| **Edge**（high variety・進化）| 業界・テナント固有 | 業界テンプレ（辞書スキーマ・活動イベント種別・Management ルール）・内部分類記号（C1-C5・A-G・R0-R3 等）・Memory のパターン |

**API としてのファイル仕様**：context-engine の「ファイルシステム First」は実は Modularity と整合する。**スキーマ・ルール定義・メモリ形式が安定 API** であれば、第三者がテンプレを独立開発できる。

**過去の意思決定との整合**：
- "Industry-specific classification codes do not belong in the meta-platform" — recorded as a decision in internal planning documents
- Per advice from a patent attorney (April 2026): "industry-specific classification codes belong inside the template" — fully aligned

---

### 1.7 Network Effects 4種と Curation（Ch.2）

**4種のネットワーク効果**：

| 種類 | 定義 | context-engine での例 |
|---|---|---|
| Same-side positive | 同サイドのユーザー増加で価値増 | テンプレ作成者が増えるほど作成者間の知見交換価値増 |
| Same-side negative | 同サイドが多すぎて価値低下 | 似たテンプレが多すぎて選択困難（Phase 2 課題）|
| Cross-side positive | 反対サイドの増加で価値増 | テンプレ作成者が増えるほどテナントの選択肢増、テナントが増えるほど作成者の対象拡大 |
| Cross-side negative | 反対サイドが多すぎて価値低下 | 低品質テンプレが氾濫してテナントが離脱（Phase 2 課題）|

**Curation = ポジティブネットワーク効果を生む唯一の方法**：
- スケールすると質が劣化する（Chatroulette 失敗例：登録不要・無制御で Naked Hairy Men 問題が起きて崩壊）
- OkCupid 階層マッチング、Sittercity の認証は Curation の好例
- context-engine では **Phase 0-1 はユーザー単独 producer なので curation 不要**、**Phase 2 で本格化**（D-011）

---

## 2. 3層 + Memory の責務

### 2.1 辞書層（Dictionary）

**普遍原則・判定基準・参照モデル**。ルールそのもの。

| 観点 | 内容 |
|---|---|
| 編集頻度 | 年単位 |
| 編集権限 | 業界テンプレ作成者・テナント管理者のみ。hookでブロック |
| ファイル形式 | MD（説明文） + YAML（構造化値） |
| 例 | 分類体系・判定閾値・処方上限・参照ガイドライン |
| append-only か | NO（版管理） |

**重要**：内部分類記号（C1-C5・A-G 等）はテナントの辞書層に閉じる。メタプラットフォームには持ち込まない。

### 2.2 Activity Layer

**現場活動の記録・帳簿**。観察・計測・記録。

| 観点 | 内容 |
|---|---|
| 編集頻度 | セッション毎・日次 |
| 編集権限 | 現場担当者 |
| ファイル形式 | JSONL（events）+ MD（subject プロフィール） |
| 例 | セッション記録・測定値・問診票・指導記録 |
| append-only か | **YES（非交渉）**。補正は新イベント |

**残（バッファー）の概念**（杉本本由来）：業務機能の最小単位は「残」を核に成立する。発生イベント・解消イベントを紐付ける。

> **杉本本由来**：本層は同書の System of Activity (SoA) に対応する（D-007 で汎用語にリブランド）。

### 2.3 Management Layer

**判定・計画・ルール**。次アクションを決める層。

| 観点 | 内容 |
|---|---|
| 編集頻度 | 週次〜月次 |
| 編集権限 | マネージャー |
| ファイル形式 | MD（判定文書）+ YAML（ルール定義） |
| 例 | プログラム設計・経過判定・介入ミックス |
| append-only か | NO（**版管理**：v1, v2... + superseded_by） |

**多次元・バージョン・ビジネスルール**（杉本本由来）：Management LayerはActivity Layerと違い、要約・キューブ・計画の変遷を扱う。ビジネスルールは依存性注入・テーブル駆動でActivity Layerから疎結合化。

> **杉本本由来**：本層は同書の System of Management (SoM) に対応する（D-007 で汎用語にリブランド）。

### 2.4 Episodic Memory

**横断的な学習・判断履歴**。**最も対象固有化する層**。

| ファイル | 形式 | 内容 |
|---|---|---|
| `decisions.jsonl` | JSONL | 判断・理由・代替案・結果 |
| `failures.jsonl` | JSONL | 失敗・根本原因・予防策 |
| `experiences.jsonl` | JSONL | 気づき（emotional_weight 1-10） |
| `personalization.md` | MD | 対象固有の反応パターン・効いた介入・コミュ特性 |

| 観点 | 内容 |
|---|---|
| append-only か | **YES（非交渉）** |
| 配置 | `memory/{subject_id}/` 配下（subject 別に分離） |
| Management Layer 判定時の役割 | 必ず先に Read される。出力に差を生む |

---

## 3. データモデル — ファイル配置

### 3.1 リポジトリ構造（テナント単位）

```
{tenant-root}/
├── INSTRUCTIONS/                    … Progressive Disclosure 3層
│   ├── ROUTING.md                   …  Level 1: 「どのモジュールを読むか」
│   ├── DICTIONARY.md                …  Level 2: 辞書モジュール命令
│   ├── ACTIVITY.md                       …  Level 2: Activity Layerモジュール命令
│   ├── MANAGEMENT.md                       …  Level 2: Management Layerモジュール命令
│   └── MEMORY.md                    …  Level 2: Memoryモジュール命令
│
├── dictionary/
│   ├── _schema.yaml
│   ├── classifications/
│   ├── thresholds/
│   ├── references/
│   └── glossary.md
│
├── activity/
│   ├── _schema.yaml
│   ├── events/{YYYY-MM}/events.jsonl
│   └── subjects/{subject_id}.md
│
├── management/
│   ├── _schema.yaml
│   ├── rules/{rule_name}.yaml
│   ├── decisions/{subject_id}/{decision_id}_v{N}.md
│   └── plans/{subject_id}/{plan_id}.md
│
├── memory/
│   └── {subject_id}/
│       ├── decisions.jsonl
│       ├── failures.jsonl
│       ├── experiences.jsonl
│       └── personalization.md
│
├── exports/
└── README.md
```

### 3.2 JSONL の冒頭スキーマ行（Muratcan 原則）

すべての JSONL ファイルは冒頭行にスキーマ宣言を持つ：

```jsonl
{"_schema": "activity.event", "_version": "1.0", "_description": "現場活動イベント。append-only"}
{"id": "evt_2026-04-26_001", "type": "session", "subject_id": "client_001", "recorded_at": "2026-04-26T10:00:00Z", "context": {"facts": {...}, "inputs": {...}, "refs": [...]}}
{"id": "evt_2026-04-26_002", ...}
```

### 3.3 `context` の4キー（杉本本「facts/inputs/refs/snapshot」由来）

Activity Layer イベントと Management Layer 判定の `context` フィールドは4キーに分ける。**混ぜない**。

| キー | 中身 | 判定基準 |
|---|---|---|
| `facts` | 観察・計測・システム算出 | 「こうだった」。人間の解釈は入れない |
| `inputs` | 人間がフォーム入力した値 | 「なぜそうしたか」「何を選んだか」 |
| `refs` | 判断根拠への参照 | 辞書層 key・ファイルパス・ルールID |
| `snapshot` | UI状態の完全コピー | 監査・再現用。**表示には使わない** |

---

## 4. Progressive Disclosure（Muratcan 流）

### 4.1 3層のロード戦略

| Level | 何を読むか | いつ読むか |
|---|---|---|
| **L1: ROUTING** | `INSTRUCTIONS/ROUTING.md` | 常時（軽量） |
| **L2: MODULE** | `INSTRUCTIONS/{DICTIONARY,ACTIVITY,MANAGEMENT,MEMORY}.md` | タスクが該当モジュールに当たった時 |
| **L3: DATA** | `dictionary/`, `activity/`, `management/`, `memory/` の実データ | L2 命令に従って必要分だけ |

**最大2 hops** で任意の情報に到達。

### 4.2 ROUTING.md の例（健康指導テンプレ）

```markdown
# ROUTING

## モジュール一覧

| 発話パターン | 読むモジュール |
|---|---|
| 「クライアント情報を教えて」「{name}さんの状況」 | ACTIVITY → DATA: subjects/{name}.md |
| 「次のセッションでどうする」「処方を考えて」 | MANAGEMENT + DICTIONARY + MEMORY |
| 「過去の失敗パターン」「気をつけるべきこと」 | MEMORY → failures.jsonl |
| 「判定基準を確認」「閾値は」 | DICTIONARY |
```

---

## 5. 「使うほど固有化」の仕掛け

### 5.1 Management Layer 判定の動作モード

Management Layer 判定は2モードで動く：

| モード | 入力 | 出力の特徴 |
|---|---|---|
| **Memory OFF** | 辞書層 + Management Layerルール + 当該Activity Layerイベント | 汎用的・規則的 |
| **Memory ON** | 上記 + `memory/{subject_id}/*` | 過去の判断・失敗・反応パターンを引用した固有化された出力 |

### 5.2 Phase 0 UI での体感装置

Management Layer 判定画面に：

1. **Memory 参照 ON/OFF トグル**
2. **左右並べて出力差を表示**
3. **Memory entry 数バッジ**（このsubjectは memory: 12件 など）

これによって「使うほど質が上がる」が一目で分かる。**商談デモの最強の見せ場**。

### 5.3 Phase 1 以降：LLM 接続時の動作

LLM プロンプトの組み立て：

```
[System]
{ROUTING.md}
{該当モジュールの INSTRUCTIONS/*.md}

[Context — Memory ON 時のみ]
{memory/{subject_id}/personalization.md}
{memory/{subject_id}/decisions.jsonl の最新 N件}
{memory/{subject_id}/failures.jsonl の関連エントリ}
{memory/{subject_id}/experiences.jsonl の emotional_weight ≥ 7 のもの}

[Context — 常時]
{該当する辞書層エントリ}
{該当 subject の最新 Activity Layer イベント}
{該当 subject の最新 Management Layer 判定}

[User]
{今回の判定要求}
```

Memory が積層するほど Context のリッチさが増し、出力品質が上がる。

### 5.4 出力レイヤーの責務分離（書き直し回避の構造原則）

データ層（`management-judge.ts` 等の判定エンジン）と画面層（`page.tsx` / `*-result.tsx`）の間に、**audience 別の出力整形を担う中間層**を置く。

```
[データ層]                    [中間層]                       [画面層]
Memory ファイル群       →   buildJudgmentOutput({       →   JSX で表示
ルール / 辞書層              audience, ... })
                            → JudgmentOutputV2
                              （audience を考慮した
                                整形済みデータ）
```

#### 配置

- 中間層：`src/lib/judgment-output.ts`
- 主要型：`JudgmentOutputV2` / `JudgmentMemorySection` / `JudgmentBullet` / `JudgmentRecommendation`
- 主要関数：`buildJudgmentOutput(input: BuildJudgmentOutputInput): Promise<JudgmentOutputV2>`

#### 設計原則

1. **画面は中間層から受け取った構造化データを表示するだけ**。生 Markdown / 生 JSON / 生 Memory 文字列を画面側で組み立てない
2. **audience フィルタの実装は中間層に閉じる**。画面コードは audience 切替時にノータッチ
3. **中間層は audience に応じて Memory の中身を抽出/抑制する責務を持つ**

#### audience の4レベル（§9.2 と整合）

| audience | 対象 | Memory の出し方 |
|---|---|---|
| `self` | 担当者本人 | フル表示（personalization 全文・失敗詳細・判断理由・エピソード本文） |
| `team` | テナント内同僚 | personalization の生活制約・家族構成等を抑制、失敗・判断・エピソードは要約 |
| `client` | subject 本人 | 過去 Memory は出さない、汎用推奨アクションのみ |
| `demo` | デモ・第三者 | 仮名化、具体例はサンプルに置換 |

#### 実装ロードマップ

- **Step 0.5（完了：2026-04-29）**：型定義 + `audience='self'` の実装。他は self にフォールバック
- **Step 1（完了：2026-04-29）**：画面（`judge/page.tsx` + `judge-result.tsx`）を `JudgmentOutputV2` ベースに書き直し。Activity セクションも同パターンに整理可
- **Step 2（完了：2026-04-29）**：`audience='team' / 'client' / 'demo'` の Phase 0 実装 + audience セレクター UI（URL パラメータ駆動）

#### Phase 0 の audience 別フィルタ実装

| audience | personalization | failures / decisions / experiences | recommendation | subject_id |
|---|---|---|---|---|
| `self` | 全文（raw_text） | 全件 bullet 化 | generic + cautions + leverages | 実 ID |
| `team` | 抽象化された方針 1 行のみ（raw_text 抑制） | 全件 bullet 化 | generic + cautions + leverages | 実 ID |
| `client` | 非表示 | 非表示 | generic のみ | 実 ID |
| `demo` | 非表示 | 非表示 | generic のみ | `[demo-subject]` に置換 |

- `memory_counts` は全 audience で維持（R-5「データはあなたのもの」を担保するため、件数だけは透明にする）
- Phase 1 で精緻化予定：`team` の experience を要約化、`demo` の subject 表示名や Activity も仮名化、`client` 用の subject 視点リライト

#### この原則を守るメリット

- audience 拡張時に画面コードを書き直さない
- LLM アダプタ層（Phase 1）の追加時も中間層で吸収できる
- 新しい出力先（PDF / メール / クライアントポータル）追加時も中間層を再利用

---

### 5.5 Curation 機構（Phase 2 設計対象）

§1.7 の Network Effects を負方向に振らせないため、テンプレが第三者から流入し始める Phase 2 で導入する。

**4つの Curation レイヤー**（Ch.7 / Ch.8 ベース）：

| レイヤー | 役割 | context-engine での具体 |
|---|---|---|
| Screening | 誰を Producer として入れるか決める | テンプレ作成者の認定（あはき資格・S&C資格・教育者等の専門性審査）|
| Feedback | 望ましい行動を促す | テンプレ評価・利用ログ・成功 interaction 数 |
| Reputation | 過去行動に基づいて審査・フィードバックを調整 | テンプレ作成者の評判スコア、失敗履歴 |
| Human gatekeeping + User-driven | モデレーション + ユーザー評価 | founder-led initial screening + tenant rating aggregation |

**運用原則**：
- 開きすぎ = ゴミテンプレ氾濫 → テナント離脱
- 閉じすぎ = 教育的・正当なテンプレまで排除 → 供給不足
- **「人間の判断 + ソフトウェアの組み合わせで境界を継続監視」**（Ch.7 教訓）

---

## 6. 業界テンプレート

### 6.1 テンプレ = リポジトリのスケルトン

業界テンプレ適用 = 上記ディレクトリ構造 + サンプル辞書・スキーマ・ルール一式を配置すること。

### 6.2 Phase 0 同梱：健康指導テンプレ

`data/templates/health-coaching/` に配置：

- `INSTRUCTIONS/`：健康指導向けルーティング
- `dictionary/`：リスク階層・運動分類・栄養基準などの簡易版
- `activity/_schema.yaml`：セッション記録・問診・測定の3イベント種別
- `management/rules/`：簡易判定ルール（例：medical_check 必須条件）
- サンプル subject 1名分の Activity Layer + Management Layer + Memory データ

### 6.3 テンプレートの構造的責務

| 配置物 | 責務 |
|---|---|
| `INSTRUCTIONS/*.md` | この業界での Progressive Disclosure ルーティング |
| `dictionary/_schema.yaml` | この業界の辞書層スキーマ |
| `dictionary/**/*` | この業界の判定基準・参照モデル |
| `activity/_schema.yaml` | この業界のActivity Layer イベント種別とフィールド |
| `management/_schema.yaml` | この業界のManagement Layer 判定種別とフィールド |
| `management/rules/*.yaml` | この業界のビジネスルール |
| 内部分類記号（C1-C5 等）| この業界テンプレ内に閉じる |

---

## 7. 2モード対応（self-host / マネージドSaaS）

### 7.1 self-host モード

| 観点 | 仕様 |
|---|---|
| データ配置 | テナントの環境（オンプレ・各社の Vercel・各社の AWS） |
| Auth | Supabase Auth（テナント側 Supabase に接続） |
| 課金 | アドバイザリー契約・テンプレ更新サブスク・カスタマイズ |
| アップデート | Git pull or 1クリックアップデート |

### 7.2 マネージドSaaS モード

| 観点 | 仕様 |
|---|---|
| データ配置 | context-engine 中央クラスタ（テナント別に隔離） |
| Auth | 中央 Supabase Auth |
| 課金 | 月額サブスク |
| ターゲット | 機密度低めの個人事業（トレーナー・治療院等） |

### 7.3 同じコードベースで両モード対応

Phase 0 では実装しないが、Phase 1 設計時に：

- ファイルアクセス層を `LocalFs` / `RemoteFs` の抽象に
- Auth プロバイダを設定可能に
- テンプレ更新は **配信API** でも **Git pull** でも対応

---

## 8. 収益継続の仕組み（Phase 2 以降）

self-host でも継続収益を確保する仕掛け：

| 収益源 | 仕組み |
|---|---|
| **アドバイザリー契約** | 月額。ユーザー（コンサル）が直接対応 |
| **テンプレ更新サブスク** | 辞書層・Management Layerルール・スキルの定期アップデート配信。ライセンスキー検証 |
| **新スキル配信** | Skills（Reference / Task）の追加配信 |
| **教育プログラム** | 社内導入時の研修コンテンツ |
| **認定プログラム** | 「context-engine 認定アドバイザー」資格 |
| **コミュニティアクセス** | Discord/Slack |
| **マネージドホスティング** | self-host 構築・運用代行 |
| **カスタムテンプレ開発** | 業界別カスタマイズ |

---

## 9. やらないこと（Phase 0-1）

- 完璧主義
- ブランド名・商標の決め打ち（コードネーム context-engine 固定）
- 課金実装
- LLM 直接呼び出し（Phase 1 でアダプタ層）
- conditioning-app との統合（Phase 4）
- 認証本体の細部設計（Phase 1 で Supabase Auth 標準実装のみ）
- 内部分類記号（C1-C5 等）のメタプラットフォーム持ち込み
- **Core Interaction の散漫化**（Phase 0-1 では A2 + A1 種まきのみ。新規 interaction の追加は §1.4 / R-11 に従って分類してから）
- **Curation なき第三者テンプレ受け入れ**（Chatroulette 失敗例。Phase 2 で curation 機構が稼働してから）
- **vanity metrics による意思決定**（登録者数・招待数を主要KPIにしない。BranchOut 失敗例。§14 参照）

---

## 10. 用語集

| 語 | 定義 |
|---|---|
| 辞書層 (Dictionary Layer) | 普遍原則・判定基準・参照モデル。年単位編集 |
| Activity Layer | 現場活動の記録・帳簿。append-only。杉本本の System of Activity (SoA) に対応 |
| Management Layer | 判定・計画・ルール。版管理。杉本本の System of Management (SoM) に対応 |
| Episodic Memory | 判断・失敗・気づき・対象固有化情報。append-only |
| 残（バッファー）| 業務機能の最小単位。発生イベントと解消イベントのペア |
| context 4キー | facts / inputs / refs / snapshot |
| Progressive Disclosure | ROUTING → MODULE → DATA の3層ロード戦略 |
| Tenant（テナント）| **N社** = context-engine フレームを使う側のコンサル業者・トレーナー・治療院・S&Cチーム等。リポジトリ単位の独立した利用者 |
| Subject（サブジェクト）| **N社のクライアント** = A社・B社・C社・選手・学習者等。Activity Layer・Management Layer・Memory が紐付く対象 |
| Industry Template | 業界別の辞書・スキーマ・ルールのスケルトン |
| Memory ON/OFF | Management Layer 判定時に該当 subject の Memory を参照するか否か |
| Self-host モード | テナントの環境にデプロイして運用するモード |
| マネージドSaaSモード | context-engine 中央クラスタで運用するモード |
| **Core Interaction** | プラットフォーム上で起こる中核相互作用。Participants + Value Unit + Filter で構成 |
| **Value Unit** | Producer が作成し Consumer が消費する情報・財・サービスの単位。context-engine では業界テンプレ |
| **Filter** | Value Unit を適切な Consumer に届けるアルゴリズム的選別ツール |
| **Pull** | Producer / Consumer をプラットフォームに引きつける機能 |
| **Facilitate** | interaction を簡単にする（または品質のために難しくする）機能 |
| **Match** | 適切な Producer / Consumer をマッチングする機能 |
| **End-to-End Principle** | アプリ固有機能は core ではなく edge に置く設計原則 |
| **Modularity** | core（low variety・stable）と edge（high variety・進化）に分け、API で接続する構造 |
| **Network Orchestrator** | プラットフォーム型企業。Asset builder / Service provider / Technology creator より market multiplier が高い |
| **Same-side / Cross-side network effects** | 同サイド / 反対サイドの参加者数による価値変動。各々 positive と negative がある |
| **Curation** | 品質・安全・関連性を維持するための選別・フィードバック・評判管理 |
| **Anti-Design Principle** | ユーザーの予期しない使い方への余白を残す設計姿勢（Twitter ハッシュタグ等）|
| **Multihoming** | ユーザーが同種 interaction を複数プラットフォーム上で行うこと |
| **Switching costs** | プラットフォーム移行に伴う金銭・非金銭コスト |
| **Platform envelopment** | 隣接プラットフォームの機能・ユーザーを吸収する競争戦略 |
| **Liquidity** | 最小限の Producer / Consumer がいて、interaction が高い成功率で成立する状態。Startup 期の最重要マイルストーン |
| **Interaction success / failure** | 開始された interaction が価値ある成果に至ったか否か |
| **Side switching** | Consumer が Producer に転換すること（Airbnb のホストの多くは過去のゲスト）|
| **Smart metrics** | Actionable / Accessible / Auditable の3条件を満たす指標 |
| **Vanity metrics** | 登録者数など、見栄えは良いが事業健全性を示さない指標 |
| **Single-side strategy** | 単一サイドにツールとして価値を出してから後にプラットフォーム化する Launch 戦略（OpenTable / redBus 型）|
| **Seeding strategy** | プラットフォーム自身が初期 Value Unit を作成・借用して種まきする Launch 戦略 |
| **Micromarket strategy** | 小さく濃い市場から始めて相互作用密度を確保する Launch 戦略（Facebook の Harvard 起点等）|

---

## 11. Launch 戦略（Ch.5）

### 11.1 Phase 0-1 採用戦略 = Single-side + Seeding + Micromarket の3点セット

| 戦略 | 適用方法 | 該当事例 |
|---|---|---|
| **Single-side** | A2（テナント内ツール）として価値完成 → A1 へ拡張 | OpenTable はレストラン向け予約管理から、redBus はバス事業者向け在庫管理から始めた |
| **Seeding** | the founder produces and bundles the first industry template | Huffington Post 初期ライター雇用、Quora 編集者シード、Reddit 創業者偽プロフィール投稿 |
| **Micromarket** | start from a single small, deep domain; expand to other industries later | Facebook の Harvard 起点、Stack Overflow のプログラミング起点 |

### 11.2 採用しない / 後送りする Launch 戦略

| 戦略 | 不採用 / 後送り理由 |
|---|---|
| Follow-the-rabbit | 既に Single-side で代替可能 |
| Piggyback | no suitable host platform exists; Fortune 500 enterprise clients are customers, not piggyback targets |
| Marquee | 重要 Producer に金銭インセンティブを与える資金がない、Phase 2 で再検討 |
| Producer evangelism | Phase 2 でテンプレ作成者を集めるときに採用 |
| Big-bang adoption | Phase 3 以降のローンチイベントで検討（SXSW 型の場が必要）|

### 11.3 chicken-or-egg 問題への対処

context-engine の chicken-or-egg：「テンプレ作成者がいないとテナントは来ない、テナントがいないと作成者は作らない」。

**Phase 0-1 解法**：the founder serves as **Producer and first Consumer**. The founder builds the first industry template, uses it with their own existing clients (e.g., a major sports organization), and exhibits the result as a live reference implementation.

### 11.4 バイラル成長は当面採用しない

バイラル成長の4要素（送信者 / 価値単位 / 外部ネットワーク / 受信者）は、機密性の高いコンサル業務（医療境界・個人情報）では原則的に向かない。Building in Public の限定版（症例守秘解除した形での発信）は別軸として `ai_era_business_framework.md` 参照。

---

## 12. Openness 設計（Ch.7）

### 12.1 Openness は3軸で判断

| 軸 | Phase 0-1 | Phase 2 | Phase 3+ |
|---|---|---|---|
| **Sponsor / Manager** | Proprietary (single-founder operation) | Proprietary 維持 | Proprietary 維持（licensing business core）|
| **Developer** | クローズド（外部 API なし）| Guardian 型 API 階層を開放 | Approved 開発者のエコシステム |
| **User Producer**（テンプレ作成者）| founder only | 認定アドバイザー（screening 後）| コミュニティへ漸進開放 |

### 12.2 Phase 2 で開く Developer API 階層（Guardian モデル応用）

| 階層 | 内容 | 課金 / 制限 |
|---|---|---|
| Keyless | 公開可能なテンプレスケルトン・スキーマ仕様の閲覧 | 無料 |
| Approved | 認定アドバイザーがカスタムテンプレを開発・配布 | 収益分配 |
| Bespoke | self-host support and custom assistance for Fortune 500 enterprise clients | 有料アドバイザリー |

### 12.3 What to Open vs What to Own（Phase 2 以降の判断軸）

| 外部機能の性質 | 推奨判断 | context-engine での例 |
|---|---|---|
| 主要価値源である | 所有・買収・自社実装 | the health-coaching template and integrated screening design (the core of the founder's premium template offering) |
| 独立プラットフォーム化し得る | 所有または代替 | 認定プログラム本体・コミュニティ運営 |
| 一時的・分散的・個別価値 | 外部所有を許容 | 個別テナントの subject 別 Memory |
| 多数開発者が再発明している汎用機能 | API化・標準化 | テンプレ適用機構・エクスポート機構 |

---

## 13. Governance（Ch.8 / Phase 2 以降の設計対象）

### 13.1 Market Failure 4原因（context-engine 文脈）

| 原因 | context-engine での具体問題 | 設計対応 |
|---|---|---|
| 情報の非対称性 | テンプレ品質・Memory entry の真偽が外から分からない | テンプレ評価・利用ログ開示・実績証明 |
| 外部性 | テンプレ作成者の利益と consumer 利益の乖離（金銭インセンティブ目的の低品質テンプレ）| 収益分配ルール・品質連動報酬 |
| 独占力 | 特定テンプレが標準化しすぎて代替が排除される | 多様性確保ルール・複数テンプレ併存推奨 |
| リスク | 不正テンプレで誤った臨床判断 → 安全被害 | 認定制・保険・違反時の責任配分 |

### 13.2 Lessig 4ツール（context-engine 適用）

| ツール | context-engine での具体化 |
|---|---|
| **Laws** | 利用規約・テンプレ作成者契約・Code of Conduct・違反時のサスペンド条項 |
| **Norms** | テンプレ作成者コミュニティの文化・ロール進行（投稿者→検査者→組織者の経路 = iStockphoto 型）|
| **Architecture** | Append-only 強制・edit_lock・version 管理・ファイル仕様 API |
| **Markets** | 収益分配・社会的通貨（テンプレ評価・認定アドバイザー資格・寄付ポイント）|

### 13.3 Smart Self-Governance 2原則（Ch.8）

1. **Internal transparency**：context-engine 内部チームも全機能を API として公開（Amazon Yegge Rant 型）。これは §1.6 Modularity と表裏一体
2. **Participation**：外部パートナー（テンプレ作成者）に意思決定の声を与える。一方的なルール変更（Keurig 2.0 失敗例）を避ける

### 13.4 Intel Architecture Labs 自己統治 10原則（参照点）

The IAL 10 principles are kept in internal reference materials and will be consulted when designing Phase 2 governance. Key points:
1. 顧客に重要意思決定への声を与える
2. オープン標準はオープンであり続ける
3. 知的財産を公正に扱う
4. 明確なロードマップを伝え守る
5. 戦略的市場参入は事前告知し差別的情報提供をしない
6. 大型投資ではリスクを共有する
7. プラットフォーム不変は約束しない、早期通知を約束する
8. 差別化された便益の資格条件は明確にする
9. パートナーの長期財務健全性を促進する
10. 成熟に伴い意思決定をコアから周辺へ外向きに進める

---

## 14. Metrics（Ch.9）

### 14.1 lifecycle 別の主要指標

| フェーズ | 主な問い | 指標の焦点 |
|---|---|---|
| **Startup（Phase 0-1）** | Core Interaction は成立しているか | liquidity / matching quality / trust |
| **Growth（Phase 2）** | 成長と収益化を壊さず拡大できるか | producer/consumer ratio / LTV / interaction conversion / side switching |
| **Maturity（Phase 3+）** | 成熟後も価値を増やし競争に対応できるか | developer extensions / 急上昇機能 / 戦略データ |

### 14.2 Phase 0-1 で測る指標（具体）

| 指標 | 測り方 | 意味 |
|---|---|---|
| **liquidity** | 1テンプレあたりの interaction 成功率（テナントが実際に Memory を積層・Management 判定を実行した回数）| プラットフォーム成立の最初の閾値 |
| **matching quality** | テンプレ↔業種・症状↔知識参照のマッチ精度 | 検索 → interaction の転換率 |
| **trust** | テナントが Memory ON で判定を実行する率（Memory OFF からの離脱率）| 「使うほど質が上がる」体感 |

### 14.3 Smart Metrics 3条件

| 条件 | 意味 |
|---|---|
| **Actionable** | 次のアクションに繋がる指標である |
| **Accessible** | データを集め使う人々が理解できる |
| **Auditable** | 正確で意味があり、現実のユーザー体験を反映している |

### 14.4 Vanity metrics 禁止リスト

以下は主要 KPI として使わない（D-014）：
- 登録テナント数（活動していない登録は無価値）
- 累積テンプレ数（使われていないテンプレは無価値）
- ダウンロード数 / アクセス数
- SNS フォロワー / シェア数

**最終指標**：「各ネットワーク側にいる happy なテナントが、価値創造的な interaction へ繰り返し、増加的に参加しているか」（Ch.9 結語）

---

## 15. Competitive Strategy（Ch.10）

### 15.1 context-engine は「完全 winner-take-all 市場」ではない

Winner-take-all 4つの力での診断：

| 力 | context-engine での強さ | 含意 |
|---|---|---|
| Supply economies of scale | 中（テンプレ作成は固定費そこそこ、配布は限界費用ゼロ）| 他社追随を強くは阻めない |
| Strong network effects | 中〜強（同業界テンプレを使うテナントが増えるほど Memory パターンの共有価値増、curation 改善）| Phase 2 で curation が機能すれば強化 |
| Multihoming / Switching costs | 中（自テナントの Memory・Activity ログを移行できるならスイッチコスト下がる、ただし Memory が積層するほど高くなる）| データポータビリティを残しつつ Memory 蓄積で粘着性を作る |
| Lack of niche specialization | **弱い = ニッチ特化が効く**（業界別テンプレ・規模別・専門領域別）| **複数プラットフォームが業界別に共存する**市場構造 |

→ **完全 winner-take-all ではない。各業界・各専門領域でリーダー争いが起きる**（D-015）。

### 15.2 ニッチ特化戦略

| 取り組み | 内容 |
|---|---|
| 業界別テンプレで差別化 | 健康指導・チームスポーツ・教育・治療院・健康経営でそれぞれ最強テンプレを目指す |
| Vimeo モデル | 高品質 Producer 向けツールを徹底（YouTube 型の汎用大衆化を追わない）|
| Airbnb vs Craigslist 教訓 | facilitate と match の品質で勝負（unmanaged list ではなく品質キュレートされた検索体験）|

### 15.3 6つの Platform Competition Strategies（参照表）

Phase 2 以降の戦略道具箱として保持：

| 番号 | 戦略 | context-engine での適用想定時期 |
|---|---|---|
| 1 | Prevent multihoming | Phase 2 後半（テンプレ作成者囲い込み）|
| 2 | Foster innovation, capture value | Phase 2-3（ロードマップ公開で外部開発者を集め、主要価値源は所有）|
| 3 | Leverage data | Phase 2-3（戦略的データ分析）|
| 4 | Redefine M&A | Phase 3+（隣接プラットフォーム買収判断）|
| 5 | Platform envelopment | Phase 3+（隣接領域の包囲）|
| 6 | Enhanced platform design | **Phase 0-1 から継続**（pull / facilitate / match の品質で勝つ）|

### 15.4 3D チェスの認識

competition は3層で起きる：
1. **Platform vs Platform**：他のメソドロジー流通プラットフォーム
2. **Platform vs Partner**：context-engine 自身がテンプレ作成者と競合する局面（注意：自社が便利機能をコア化するとパートナー信頼を失う / Microsoft IE / Amazon 出店者問題）
3. **Partner vs Partner**：テンプレ作成者同士の競争設計
