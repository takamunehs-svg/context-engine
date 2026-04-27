---
level: 1
description: Progressive Disclosure Level 1 — 常時ロード。「どのモジュールを読むか」だけを定義
---

# ROUTING — 健康指導テンプレ

AIエージェントは、最初にこのファイルだけを読み、発話パターンに応じて次にどのモジュールを開くかを決定する。**最大2 hops** で目的のデータに到達できる構造を維持すること。

## モジュール一覧

| 発話パターン | 次に読むモジュール |
|---|---|
| 「{subject}さんの状況」「クライアント情報」 | `INSTRUCTIONS/ACTIVITY.md` → `activity/subjects/{subject_id}.md` |
| 「次のセッション」「処方を考えて」「介入を設計」 | `INSTRUCTIONS/MANAGEMENT.md` + `INSTRUCTIONS/DICTIONARY.md` + `INSTRUCTIONS/MEMORY.md` |
| 「過去の失敗」「気をつけるべきこと」「効いた介入」 | `INSTRUCTIONS/MEMORY.md` → `memory/{subject_id}/` |
| 「判定基準」「閾値」「リスク分類」 | `INSTRUCTIONS/DICTIONARY.md` → `dictionary/` |
| 「セッション記録を残す」「測定値を入れる」 | `INSTRUCTIONS/ACTIVITY.md` → `activity/events/` |
| 「判定の経過」「過去の処方」 | `INSTRUCTIONS/MANAGEMENT.md` → `management/decisions/{subject_id}/` |

## 4層モデル

| レイヤー | 名称 | 役割 |
|---|---|---|
| Dictionary | 辞書層 | 普遍原則・判定基準・参照モデル（年単位編集・読み取り専用） |
| Activity | 活動層 | 現場活動の記録・帳簿（append-only） |
| Management | 管理層 | 判定・計画・ルール（版管理） |
| Episodic Memory | エピソード記憶 | 判断・失敗・気づき・固有化情報（subject別・append-only） |

> 設計の3層（Dictionary / Activity / Management）の責務分離は杉本『データモデリングでドメインを駆動する』の SoA/SoM 論を参照。本プラットフォームでは業界横展開を念頭に **汎用語にリブランド** している。

## 守るべき非交渉ルール

1. `activity/events/*.jsonl` と `memory/{subject_id}/*.jsonl` は **append-only**。既存行を更新・削除しない
2. 辞書層（`dictionary/`）は AI からは **読み取り専用**。編集は人間（テナント管理者）のみ
3. Management 判定時は **必ず** `memory/{subject_id}/` を先に読む（subject別の固有化のため）
4. 内部分類記号はこのテンプレ内に閉じる（メタプラットフォームには持ち込まない）
