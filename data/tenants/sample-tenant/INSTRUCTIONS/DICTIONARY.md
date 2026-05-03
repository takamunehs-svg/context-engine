---
level: 2
module: dictionary
description: Dictionary Layer モジュール — 判定基準・閾値・参照モデルの読み方
---

# DICTIONARY — 辞書層 (Dictionary Layer)

辞書層は **テナント内で1つ**。年単位で編集される普遍原則・判定基準・参照モデルを格納する。AI は読み取り専用。

## ファイル構成

| ファイル | 内容 |
|---|---|
| `dictionary/_schema.yaml` | 辞書層全体のスキーマ定義 |
| `dictionary/classifications/risk-levels.yaml` | 導入・展開リスク階層分類（low/watch/medium/high） |
| `dictionary/thresholds/intervention-thresholds.yaml` | 次アクション判定閾値 |
| `dictionary/references/program-design.md` | AI導入支援の参照モデル |
| `dictionary/glossary.md` | 用語集 |

## 読む順序

1. `_schema.yaml` でこのテナントの辞書スキーマを把握
2. 発話に該当するファイルだけを読む（全部読まない）
3. 該当 subject の Management 判定に必要な辞書エントリのみを Context に乗せる
