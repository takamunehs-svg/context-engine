---
level: 2
module: som
description: SoM モジュール — 判定・計画・ルールの読み書き
---

# SOM — System of Management

判定・計画・ルール。**版管理**（v1, v2... + superseded_by）。

## ファイル構成

| ファイル | 内容 |
|---|---|
| `som/_schema.yaml` | SoM 判定種別ごとのフィールド定義 |
| `som/rules/{rule_name}.yaml` | ビジネスルール（テーブル駆動） |
| `som/decisions/{subject_id}/{decision_id}_v{N}.md` | subject 別判定（版管理） |
| `som/plans/{subject_id}/{plan_id}.md` | subject 別計画 |

## 判定種別（このテンプレで定義）

- `intervention_plan`: 介入計画（処方）
- `weekly_review`: 週次レビュー（GO/ADJUST/STOP）
- `medical_referral`: 医療連携判定

## SoM 判定の動作モード（核心）

| モード | 入力 | 出力の特徴 |
|---|---|---|
| **Memory OFF** | 辞書 + ルール + 当該 subject の SoA | 汎用的・規則的 |
| **Memory ON** | 上記 + `memory/{subject_id}/*` | 過去の判断・失敗・反応パターンを引用した固有化された出力 |

**SoM 判定時は必ず該当 subject の `memory/` を先に読む**。これが「使うほど subject 固有化」の核心。

## ビジネスルールの形式

`som/rules/*.yaml` はテーブル駆動方式。例：

```yaml
rule_id: medical_referral_check
description: 医療連携が必要な状態を検出
conditions:
  - field: facts.bp_systolic
    op: ">="
    value: 160
    action: medical_referral
  - field: facts.pain_nrs
    op: ">="
    value: 7
    action: medical_referral
```
