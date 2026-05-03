# sample-tenant — サンプルN社（AI導入アドバイザリー）

Phase 0 のデモ用テナント。

## 状況

N社（このテナント）= 1人のAIネイティブ事業構築アドバイザーが、3社の継続支援クライアント（subject）を抱えている：

| subject | 関係期間 | Memory 厚さ | AI 出力の固有化度 |
|---|---|---|---|
| client-a（A社）| 6ヶ月 | 厚い（10+件） | A社特有のパターン反映 |
| client-b（B社）| 初回商談後 | 薄い（1-2件） | 一般的な提案に近い |
| client-c（C社）| 3ヶ月 | 中（5件前後） | 中間 |

## 4層モデル

| 層 | 性質 | テナント内での粒度 |
|---|---|---|
| Dictionary（辞書層）| 普遍原則・年単位編集 | 1つ・共通 |
| Activity（活動層）| 現場ログ・append-only | subject 別の値 |
| Management（管理層）| 判定・版管理 | subject 別の値 |
| Episodic Memory | 判断・失敗・気づき・append-only | **subject 別に積層**（最も固有化） |

## デモシナリオ

1. トップで sample-tenant を選択
2. subject 一覧 → client-a / b / c の Memory 件数バッジを確認
3. 各 subject で「Management 判定（次アクション設計）」を実行
4. 「Memory 参照 ON/OFF トグル」で出力差を見る
5. **Memory が厚いほど、ON で出力が大きく変わる**ことを体感
