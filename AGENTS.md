# context-engine — エージェント作業ルール

セッション開始時に必ず読む：
- このファイル（AGENTS.md）
- `PLAN.md`（仕様・進捗・意思決定ログ）
- `SPEC.md`（設計思想・ドメインモデル仕様）
- `src/types/database.ts`（ドメイン型の正本・存在する場合）

CLAUDE.md は AGENTS.md を `@AGENTS.md` で参照しているだけ。中身はここ。

---

## プロジェクトの位置づけ

3層構造（辞書層 / Activity Layer / Management Layer）+ Episodic Memory（append-only）を、**任意の業界・業務に当てはめて運用できるメタプラットフォーム**。

- `conditioning-app`（健康指導・縦特化）の上位概念
- 別事業・別ブランド・別商品（コードネーム context-engine、ブランド名は商標出願後に決定）
- conditioning-app は継続稼働、将来このメタプラットフォームの上に統合する想定

### 階層モデル（最初に読む）

```
context-engine（メタプラットフォーム）
    ↓
Tenant（テナント = N社 / フレームを使うコンサル業者・トレーナー・治療院）
    ↓
Subject（A社・B社・C社・選手・学習者 / N社のクライアント）
```

- **辞書層・Activity Layer・Management Layer・Memory のスキーマはテナント内で1つ**（混ざらない）
- **値・履歴・Memoryエントリは subject 別**（並列に積層していく）
- **Memory が subject 別に積層するほど、その subject 専用の出力に固有化**
- 詳細：`SPEC.md §0` を必読

---

## R-1: 3層+Memoryの責務分離を崩さない

| 層 | 責務 | 編集 | テーブル |
|---|---|---|---|
| 辞書層 | 普遍原則・判定基準・参照モデル | 年単位・hookでブロック | `dictionary_entries` |
| Activity Layer | 現場活動の記録・帳簿 | append-only | `activity_events` |
| Management Layer | 判定・計画・ルール | 上書き可・版管理 | `management_decisions` |
| Memory | 横断的な学習・判断履歴 | append-only | `episodic_memory_entries` |

混ぜたり、Activity LayerをUPDATEしたりしてはならない。

## R-2: Append-only は非交渉

- `activity_events`：UPDATE/DELETE禁止。補正は新イベントで上書き
- `episodic_memory_entries`：UPDATE/DELETE禁止。追加のみ
- 上記2テーブルへの UPDATE/DELETE を含むコードは AI 生成でも必ず人間レビュー（S-5準拠）

## R-3: tenant_id は Day 1 から全テーブルに付与

- マルチテナントSaaS前提
- 全クエリは tenant_id でフィルタ
- 越境ガード関数を `src/lib/auth/tenant-guard.ts` に置く（Phase 1で実装）
- conditioning-app の D-026 `verifyXBelongsToTenant` パターンを流用

## R-4: 業界テンプレートは「差し替え可能」を維持

- `industry_templates` テーブル：辞書層・Activity Layerスキーマ・Management Layerルールをパッケージ化
- 内部分類記号（C1-C5・A-G・R0-R3等）はメタプラットフォームには持ち込まない
- これらは業界テンプレート作成者が定義する範囲
- 弁理士助言（2026-04-22 森山氏）：固有分類記号はテンプレ側に閉じ込める

## R-5: データポータビリティ第一級

- すべての資産は MD/JSONL で出力可能であること
- ベンダーロックインしない設計
- 「データはあなたのもの」を製品の核メッセージとして守る
- 新機能追加時に「これはMD/JSONL出力できるか」を必ず自問

## R-6: AI-Neutral

- 特定LLMに依存しない構造
- Anthropic / OpenAI / Google / 自社AI のいずれでも動く plain text 構造
- LLM 呼び出しを実装に直接埋めない（必要時はアダプタ層に閉じる）

## R-7: Progressive Disclosure

- フルファイルを一度に読ませない
- ルーティング → モジュール → 実データの3段階
- ドキュメントも同様（CLAUDE.md → 各 .md → 実データ）

## R-8: ルールエンジンに AI 推論を入れない

- `src/lib/rules/*.ts`（追加予定）は Management Layer ルールを `if/else` とテーブルでコード化したもの
- LLM 呼び出しは禁止
- 新規ルール追加時は EvidenceRef として正本セクション参照を残す

## R-9: 大きな依存を足す前に確認

- shadcn/ui, Radix, Zod, RHF, Framer Motion, supabase-js は自由に使ってよい
- それ以外の新規ランタイム依存は人間に確認

## R-10: 意思決定の理由を `PLAN.md §6` に追記

- 非自明な判断をコードに反映したら `D-XXX` として追記する
- **冒頭に「動かす葉: L1〜L9」を必須記載**（価値ツリーは PLAN.md §1.5 参照）
- 葉に紐づかない D-XXX は保留し、人間に確認

---

## やる前に確認すること

- `package.json` への新規依存追加（R-9）
- 認証関連（`src/lib/auth/`、`middleware.ts`、`src/proxy.ts`）の編集
- `activity_events` / `episodic_memory_entries` への UPDATE/DELETE を含むコード
- マイグレーションの編集・追加
- 既存テナントのスキーマに影響するDB変更
- ブランド名（Atlas® / Strata® / Lattice® / Codex® 等）の決め打ち（コードネーム context-engine 固定）

## セキュリティルール（conditioning-app S-1〜S-5 を継承）

**S-1: 秘密情報のハードコード禁止**
API鍵・署名秘密鍵・ソルトなどは `.env.local` のみ。コード内にフォールバック値を書かない。未設定時は起動エラー。

**S-2: 本番DBへの直接操作禁止**
`DROP TABLE`, `DELETE FROM` 等の破壊的SQLはAIエージェントに実行させない。plan作成まで。実行は人間が別権限で行う。

**S-3: dev/prod環境を分離する**
Supabaseは開発DBと本番DBを技術的に分離。同一認証情報で両方にアクセスできる設計にしない。

**S-4: 公開コンテンツと秘密情報のセッション分離**
公開Issue/READMEを読むセッションと、本番資格情報を扱うセッションを同居させない。

**S-5: AI生成コードのレビュー必須領域**
認証/認可、DB migration、課金、削除処理、CI/CD、MCP設定、secret参照、外部連携、Append-only違反コードは、AI生成であっても必ず人間がレビューする。

---

## やらないこと

- ルールエンジンへのLLM推論の混入（R-8）
- 個人情報・APIキー・トークンを `.env.local` 以外に書く（S-1）
- 本番DBへの破壊的操作の自動実行（S-2）
- `activity_events` / `episodic_memory_entries` への UPDATE/DELETE 自動実行（R-2 / S-5）
- ブランド名・商標決定（Phase 0-1ではコードネーム context-engine で進める）
- 課金実装（Phase 2まで先送り）
- conditioning-app との統合（Phase 4）

---

<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16 への警告（create-next-app が挿入したルール）

This is NOT the Next.js you know.
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
