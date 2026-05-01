# Competitor Adoption Plan (Phase 1)

## 目的

公開されている AI memory / context-engineering 系プロダクトの優れた設計を、context-engine の原則（3層責務分離・append-only・AI-neutral）を崩さずに取り込む。

## 取り込み対象（優先度順）

### 1. Memory relevance ranking（最優先）
- 取り込む理由: 最新3件固定では、現在の facts と無関係な記憶が出る。
- 取り込み方: タグ・テキスト・ルール出力との一致度でスコア化し、上位抽出。
- 実装: `src/lib/fs/management-judge.ts` の `extractRelevantMemory`。

### 2. Recency-aware + semantic-lite scoring
- 取り込む理由: 新しい記憶の価値と、古いが重要な記憶の両立が必要。
- 取り込み方: まずは deterministic（タグ/トークン一致 + emotional_weight）で実装。
- 将来: LLM なしで BM25 風スコアまたは embedding adapter 層を追加。

### 3. Audience-aware output shaping
- 取り込む理由: 同一判定でも閲覧者（self/team/client/demo）で最適な表現が異なる。
- 既存実装: `buildJudgmentOutput` にて audience フィルタ済み。
- 次段階: 各 audience ごとの memory visibility policy を明文化。

## 借りるが採用しないもの（現時点）

### End-to-end LLM memory synthesis
- 不採用理由: R-8（ルールエンジンに AI 推論を入れない）と衝突。
- 方針: ルールは deterministic 維持。LLM は adapter 層で補助に限定。

### Vector DB first design
- 不採用理由: File-system first / portability（MD/JSONL）を損なう可能性。
- 方針: 正本はテキスト。検索補助としてのみ optional に扱う。

## カスタマイズ方針

1. append-only 資産からのみランキングを構築
2. ranking ロジックは pure function 化してテスト可能にする
3. どの記憶が採用されたか説明可能にする（監査性）
4. tenant 境界を常に尊重する

## 30日アクション

- Week 1: relevance ranking（今回実装）を導入し lint 通過
- Week 2: スコアの explainability（なぜ採用されたか）を出力に追加
- Week 3: subject ごとの効果測定（Memory ON の有用性）
- Week 4: audience 別の policy を固定化し、テンプレにも反映
