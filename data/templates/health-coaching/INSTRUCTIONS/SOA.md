---
level: 2
module: soa
description: SoA モジュール — 現場活動ログの読み書き
---

# SOA — System of Activity

現場活動の記録・帳簿。**append-only**。

## ファイル構成

| ファイル | 内容 |
|---|---|
| `soa/_schema.yaml` | SoAイベント種別ごとのフィールド定義 |
| `soa/events/{YYYY-MM}/events.jsonl` | 月別イベントログ（時系列・append-only） |
| `soa/subjects/{subject_id}.md` | subject プロフィール（人間可読） |

## イベント種別（このテンプレで定義）

- `session`: セッション記録（実施日・内容・主観/客観評価）
- `measurement`: 測定（体組成・可動域・筋力・血圧等）
- `intake`: 初回問診・経過問診

## append-only の運用

- イベント追加：`soa/events/{YYYY-MM}/events.jsonl` に1行追加
- 補正：既存行を変更せず、新イベント `event_type: correction` で参照付きで追加
- 削除：物理削除しない。`event_type: archive` で論理アーカイブ

## context フィールドの4キー

すべての SoA イベントの `context` は4キーに分ける。混ぜない：
- `facts`: 観察・計測・システム算出（「こうだった」）
- `inputs`: 人間がフォーム入力した値（「なぜそうしたか」）
- `refs`: 判断根拠への参照（辞書層 key・ファイルパス）
- `snapshot`: UI状態の完全コピー（監査・再現用）
