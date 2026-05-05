---
level: 2
module: memory
description: Episodic Memory モジュール — subject 別の判断・失敗・気づきの蓄積
---

# MEMORY — Episodic Memory（エピソード記憶）

subject別に積層する**最も対象固有化する層**。**append-only**。

## ファイル構成

`memory/{subject_id}/` 配下に4つ：

| ファイル | 形式 | 内容 |
|---|---|---|
| `decisions.jsonl` | JSONL | 判断・理由・代替案・結果 |
| `failures.jsonl` | JSONL | 失敗・根本原因・予防策 |
| `experiences.jsonl` | JSONL | 気づき（emotional_weight 1-10） |
| `personalization.md` | MD | この subject 固有の反応パターン・効いた進め方・意思決定特性 |

## append-only の運用

- 全ファイル：UPDATE / DELETE 禁止
- 既存エントリの修正は新エントリで上書き（`supersedes` フィールドで参照）
- 削除は `status: archived` 化のみ（物理削除しない）

## Management 判定時の参照戦略（Memory ON 時）

優先度順に：

1. `personalization.md`（**最重要**：subject の反応パターン全体像）
2. `failures.jsonl` のうち、現在の状況に類似するエントリ
3. `decisions.jsonl` の最新 N 件
4. `experiences.jsonl` のうち `emotional_weight >= 7` のもの

## subject 別の固有化が起きる仕組み

- subject A：50件のMemory → AI出力が「A固有のパターン」を反映
- subject B：5件のMemory → 一般的な提案に近い
- subject C：10件のMemory → 中間
- 新規 subject D：0件 → 完全に汎用（辞書とルールのみ）

辞書・Activity スキーマ・Management スキーマは subject 横断で共通。**Memory だけが subject 別に積層**することで、フレームを崩さずパーソナライズが進む。
