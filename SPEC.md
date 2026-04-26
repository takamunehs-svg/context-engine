# context-engine SPEC.md

> 設計思想とデータモデルの仕様書。実装と設計判断の根拠。
> 関連：`PLAN.md`（進捗・意思決定）/ `AGENTS.md`（作業ルール）

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
| **SoA** | 現場活動ログ | **subject 別** | ⭕ 値が違う |
| **SoM** | 判定・計画 | **subject 別** | ⭕ 値が違う |
| **Memory** | 判断・失敗・気づき・固有化情報 | **subject 別** | ⭕⭕⭕ **最も違う** |

### 核心メッセージ

**「概念フレーム（辞書・SoA・SoM・Memory のスキーマ）はテナント内で1つ。A/B/C別の値・履歴・Memoryエントリだけが並列に積層していく。だから混ざらず崩れず、しかも subject ごとにどんどんパーソナライズされる」**

これが「使えば使うほど質の上がる構造」の正体。N社が10社のクライアントを抱えても、フレームは1セットのまま。新しいクライアント D を取れば、辞書とスキーマはそのまま流用、D の Memory だけゼロから始まる。

---

## 1. 設計の核

### 1.1 一行で

**3層構造（辞書層 / SoA / SoM）に subject 別の Episodic Memory が積層するほど、AI がその subject 専用の協働相手に固有化していく — これをファイルシステム上で表現する。**

### 1.2 3つの源流

| 源流 | 提供する設計要素 |
|---|---|
| 杉本『データモデリングでドメインを駆動する』 | 3層構造の責務分離・残管理・ビジネスルール疎結合化 |
| Muratcan「File System Is the New Database」 | ファイルシステム First・Progressive Disclosure・Format-Function Mapping・Episodic Memory |
| 梶谷『生成AI時代を勝ち抜く事業・組織のつくり方』 | 使うほど質が上がる構造・MOAT・UX原則 |

### 1.3 6つの非交渉原則

1. **ファイルシステム First** — データの正本は MD/JSONL/YAML。DB はインデックスや認証等の補助役
2. **3層責務分離** — 辞書層 / SoA / SoM を混ぜない。Memory はそれらと独立
3. **Append-only は非交渉** — `soa/events/`, `memory/*/`* は UPDATE/DELETE 禁止。補正は新エントリ
4. **Progressive Disclosure 2 hops** — 最大2ホップで情報に到達できる構造（ROUTING → MODULE → DATA）
5. **AI-Neutral** — Claude/GPT/Gemini/自社AI のいずれでも動く plain text
6. **Context Engineering > Prompt Engineering** — 「AIが正しい判断をするために何の情報が必要で、それをどう構造化すれば実際に使うか」

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

### 2.2 SoA（System of Activity）

**現場活動の記録・帳簿**。観察・計測・記録。

| 観点 | 内容 |
|---|---|
| 編集頻度 | セッション毎・日次 |
| 編集権限 | 現場担当者 |
| ファイル形式 | JSONL（events）+ MD（subject プロフィール） |
| 例 | セッション記録・測定値・問診票・指導記録 |
| append-only か | **YES（非交渉）**。補正は新イベント |

**残（バッファー）の概念**（杉本本由来）：業務機能の最小単位は「残」を核に成立する。発生イベント・解消イベントを紐付ける。

### 2.3 SoM（System of Management）

**判定・計画・ルール**。次アクションを決める層。

| 観点 | 内容 |
|---|---|
| 編集頻度 | 週次〜月次 |
| 編集権限 | マネージャー |
| ファイル形式 | MD（判定文書）+ YAML（ルール定義） |
| 例 | プログラム設計・経過判定・介入ミックス |
| append-only か | NO（**版管理**：v1, v2... + superseded_by） |

**多次元・バージョン・ビジネスルール**（杉本本由来）：SoMはSoAと違い、要約・キューブ・計画の変遷を扱う。ビジネスルールは依存性注入・テーブル駆動でSoAから疎結合化。

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
| SoM 判定時の役割 | 必ず先に Read される。出力に差を生む |

---

## 3. データモデル — ファイル配置

### 3.1 リポジトリ構造（テナント単位）

```
{tenant-root}/
├── INSTRUCTIONS/                    … Progressive Disclosure 3層
│   ├── ROUTING.md                   …  Level 1: 「どのモジュールを読むか」
│   ├── DICTIONARY.md                …  Level 2: 辞書モジュール命令
│   ├── SOA.md                       …  Level 2: SoAモジュール命令
│   ├── SOM.md                       …  Level 2: SoMモジュール命令
│   └── MEMORY.md                    …  Level 2: Memoryモジュール命令
│
├── dictionary/
│   ├── _schema.yaml
│   ├── classifications/
│   ├── thresholds/
│   ├── references/
│   └── glossary.md
│
├── soa/
│   ├── _schema.yaml
│   ├── events/{YYYY-MM}/events.jsonl
│   └── subjects/{subject_id}.md
│
├── som/
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
{"_schema": "soa.event", "_version": "1.0", "_description": "現場活動イベント。append-only"}
{"id": "evt_2026-04-26_001", "type": "session", "subject_id": "client_001", "recorded_at": "2026-04-26T10:00:00Z", "context": {"facts": {...}, "inputs": {...}, "refs": [...]}}
{"id": "evt_2026-04-26_002", ...}
```

### 3.3 `context` の4キー（杉本本「facts/inputs/refs/snapshot」由来）

SoA イベントと SoM 判定の `context` フィールドは4キーに分ける。**混ぜない**。

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
| **L2: MODULE** | `INSTRUCTIONS/{DICTIONARY,SOA,SOM,MEMORY}.md` | タスクが該当モジュールに当たった時 |
| **L3: DATA** | `dictionary/`, `soa/`, `som/`, `memory/` の実データ | L2 命令に従って必要分だけ |

**最大2 hops** で任意の情報に到達。

### 4.2 ROUTING.md の例（健康指導テンプレ）

```markdown
# ROUTING

## モジュール一覧

| 発話パターン | 読むモジュール |
|---|---|
| 「クライアント情報を教えて」「{name}さんの状況」 | SOA → DATA: subjects/{name}.md |
| 「次のセッションでどうする」「処方を考えて」 | SOM + DICTIONARY + MEMORY |
| 「過去の失敗パターン」「気をつけるべきこと」 | MEMORY → failures.jsonl |
| 「判定基準を確認」「閾値は」 | DICTIONARY |
```

---

## 5. 「使うほど固有化」の仕掛け

### 5.1 SoM 判定の動作モード

SoM 判定は2モードで動く：

| モード | 入力 | 出力の特徴 |
|---|---|---|
| **Memory OFF** | 辞書層 + SoMルール + 当該SoAイベント | 汎用的・規則的 |
| **Memory ON** | 上記 + `memory/{subject_id}/*` | 過去の判断・失敗・反応パターンを引用した固有化された出力 |

### 5.2 Phase 0 UI での体感装置

SoM 判定画面に：

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
{該当 subject の最新 SoA イベント}
{該当 subject の最新 SoM 判定}

[User]
{今回の判定要求}
```

Memory が積層するほど Context のリッチさが増し、出力品質が上がる。

---

## 6. 業界テンプレート

### 6.1 テンプレ = リポジトリのスケルトン

業界テンプレ適用 = 上記ディレクトリ構造 + サンプル辞書・スキーマ・ルール一式を配置すること。

### 6.2 Phase 0 同梱：健康指導テンプレ

`data/templates/health-coaching/` に配置：

- `INSTRUCTIONS/`：健康指導向けルーティング
- `dictionary/`：リスク階層・運動分類・栄養基準などの簡易版
- `soa/_schema.yaml`：セッション記録・問診・測定の3イベント種別
- `som/rules/`：簡易判定ルール（例：medical_check 必須条件）
- サンプル subject 1名分の SoA + SoM + Memory データ

### 6.3 テンプレートの構造的責務

| 配置物 | 責務 |
|---|---|
| `INSTRUCTIONS/*.md` | この業界での Progressive Disclosure ルーティング |
| `dictionary/_schema.yaml` | この業界の辞書層スキーマ |
| `dictionary/**/*` | この業界の判定基準・参照モデル |
| `soa/_schema.yaml` | この業界のSoA イベント種別とフィールド |
| `som/_schema.yaml` | この業界のSoM 判定種別とフィールド |
| `som/rules/*.yaml` | この業界のビジネスルール |
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
| **テンプレ更新サブスク** | 辞書層・SoMルール・スキルの定期アップデート配信。ライセンスキー検証 |
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

---

## 10. 用語集

| 語 | 定義 |
|---|---|
| 辞書層 (Dictionary) | 普遍原則・判定基準・参照モデル。年単位編集 |
| SoA (System of Activity) | 現場活動の記録・帳簿。append-only |
| SoM (System of Management) | 判定・計画・ルール。版管理 |
| Episodic Memory | 判断・失敗・気づき・対象固有化情報。append-only |
| 残（バッファー）| 業務機能の最小単位。発生イベントと解消イベントのペア |
| context 4キー | facts / inputs / refs / snapshot |
| Progressive Disclosure | ROUTING → MODULE → DATA の3層ロード戦略 |
| Tenant（テナント）| **N社** = context-engine フレームを使う側のコンサル業者・トレーナー・治療院・S&Cチーム等。リポジトリ単位の独立した利用者 |
| Subject（サブジェクト）| **N社のクライアント** = A社・B社・C社・選手・学習者等。SoA・SoM・Memory が紐付く対象 |
| Industry Template | 業界別の辞書・スキーマ・ルールのスケルトン |
| Memory ON/OFF | SoM 判定時に該当 subject の Memory を参照するか否か |
| Self-host モード | テナントの環境にデプロイして運用するモード |
| マネージドSaaSモード | context-engine 中央クラスタで運用するモード |
