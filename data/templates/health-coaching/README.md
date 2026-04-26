---
name: health-coaching
display_name: 健康指導テンプレート
version: 0.1.0
target_industry: 健康指導・コンディショニング・パーソナルトレーニング
target_tenant: 個人トレーナー / 治療院 / S&Cチーム / 健康経営アドバイザー
---

# 健康指導テンプレート

context-engine の業界テンプレ第1号。個人トレーナーや治療院、S&Cチーム、健康経営アドバイザーが「フレームを使う N社」となり、その下に複数のクライアント（subject = A社・B社・C社・選手・利用者等）を抱える運用を想定。

## 構造

- `INSTRUCTIONS/`：Progressive Disclosure ルーティング（テナント内で AI が読む順序）
- `dictionary/`：判定基準・閾値・参照モデル（テナント内で1つ・年単位編集）
- `soa/`：SoA スキーマ（イベント種別とフィールド定義）
- `som/`：SoM スキーマ + ルール（テーブル駆動）
- `memory/`：Memory スキーマ（subject別に積層する場所の定義）

## 内部分類記号について

このテンプレ内で使われる分類記号（リスク階層 low/moderate/high/critical 等）は **このテンプレに閉じる**。メタプラットフォーム（context-engine 本体）には持ち込まない。
