---
level: 2
module: activity
description: Activity Layer モジュール — 現場活動ログの読み書き
---

# ACTIVITY — 活動層 (Activity Layer)

現場活動の記録・帳簿。**append-only**。

> 杉本本の System of Activity (SoA) に対応。本プラットフォームでは Activity Layer に汎用語化。

## ファイル構成

| ファイル | 内容 |
|---|---|
| `activity/_schema.yaml` | Activity イベント種別ごとのフィールド定義 |
| `activity/events/{YYYY-MM}/events.jsonl` | 月別イベントログ（時系列・append-only） |
| `activity/subjects/{subject_id}.md` | subject プロフィール（人間可読） |

## イベント種別（このテンプレで定義）

- `session`: 支援セッション記録（実施日・論点・導入状況）
- `measurement`: 進捗チェック（マイルストーン・意思決定停滞・定着準備度）
- `intake`: 初回ヒアリング

## append-only の運用

- イベント追加：`activity/events/{YYYY-MM}/events.jsonl` に1行追加
- 補正：既存行を変更せず、新イベント `event_type: correction` で参照付きで追加
- 削除：物理削除しない。`event_type: archive` で論理アーカイブ

## context フィールドの4キー

すべての Activity イベントの `context` は4キーに分ける。混ぜない：

- `facts`: 観察・計測・システム算出（「こうだった」）
- `inputs`: 人間がフォーム入力した値（「なぜそうしたか」）
- `refs`: 判断根拠への参照（辞書層 key・ファイルパス）
- `snapshot`: UI状態の完全コピー（監査・再現用）
