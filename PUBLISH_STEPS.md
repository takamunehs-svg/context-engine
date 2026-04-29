# PUBLISH STEPS — GitHub Public 公開手順（手動）

このファイルは公開作業の **チェックリスト**。
AI はこの内容を実行しない。すべて Takamune Watanabe 本人が実行する。

最終更新：2026-04-30

---

## Phase 1：Pre-flight（公開前の最終確認）

git status / git log / GitHub UI でそれぞれ目視確認する。

### 1.1 機密情報スキャン（再度）

公開前に以下を 0 件にする。実際の語は手元のマスターリスト（internal docs）から差し替える。

```bash
cd <repo-path>

# 実クライアント名・取引先名（マスターリストから語を差し替え）
grep -rEn 'CLIENT_NAME_1|CLIENT_NAME_2|VENDOR_NAME_1' --include='*.md' --include='*.ts' --include='*.tsx' --include='*.yaml' .

# API key / secret
grep -rEn 'sk-[a-zA-Z0-9]{20,}|api[_-]?key.*=' --include='*.ts' --include='*.tsx' .

# 絶対パス漏洩（macOS / Linux / Windows の典型）
grep -rEn '/Users/|/home/|C:\\\\Users\\\\' --include='*.md' --include='*.ts' --include='*.tsx' .

# 個人連絡先（公開対象の Email 以外）
grep -rEn '@gmail\.com|@yahoo\.|@hotmail\.|@icloud\.' --include='*.md' --include='*.ts' --include='*.tsx' .
```

すべて 0 件であることを確認する。残っている場合は手動で抽象化／削除してから commit する。

### 1.2 ファイル除外確認

- [ ] `.env` / `.env.local` がコミット対象に入っていない
- [ ] `node_modules/` が入っていない
- [ ] `.next/` `.vercel/` が入っていない
- [ ] `data/tenants/` 配下が `sample-tenant/` のみ
- [ ] `.claude/launch.json` のみコミット（`settings.local.json` は ignore）
- [ ] `.DS_Store` が入っていない

```bash
git ls-files | grep -E '\.env|node_modules|\.next/|\.vercel/|\.DS_Store|settings\.local'
# 何も出なければ OK
```

### 1.3 README / LICENSE 内容確認

- [ ] README.md の Built by 欄に正しい名前と肩書き
- [ ] LICENSE の Copyright 年・氏名が正しい
- [ ] README.md の Phase 0 status が現実と一致
- [ ] What's open / what's not の境界が意図通り

---

## Phase 2：GitHub repo 作成

### 2.1 ユーザー名と repo 名を決める

- GitHub username：`takamunehs-svg`
- repo 名：`context-engine`（コードネーム固定）

### 2.2 repo 作成（GitHub CLI 推奨）

```bash
# auth 状態確認
gh auth status

# repo 作成（push しない）
gh repo create context-engine \
  --public \
  --description "The AI Operating System for Domain Experts. Bring your industry. Own your knowledge. Stay AI-neutral." \
  --source=. \
  --remote=origin \
  --push=false
```

GitHub CLI を使わない場合：

```bash
# GitHub web UI で空の public repo を作成 → 以下を実行
git remote add origin git@github.com:<username>/context-engine.git
```

---

## Phase 3：初回 push

```bash
# branch 名を確認（main 想定）
git branch --show-current

# tags / branch を整える
git branch -M main

# push
git push -u origin main
```

push 後、GitHub UI で以下を確認：

- [ ] LICENSE が GitHub に検出され "Other" or "Proprietary" と表示される
- [ ] README が正しくレンダリングされる
- [ ] `data/tenants/sample-tenant/` のみ公開され、他のテナント（将来追加予定）は含まれない
- [ ] `.env*` が含まれていない

---

## Phase 4：Repo 設定

### 4.1 About 欄

- **Description**：`The AI Operating System for Domain Experts. Bring your industry. Own your knowledge. Stay AI-neutral.`
- **Website**：（決まり次第追加）
- **Topics**：

```
ai
agents
context-engineering
domain-experts
file-system
append-only
ai-neutral
episodic-memory
nextjs
typescript
```

### 4.2 Default branch

- [ ] `main` を default に設定

### 4.3 Issues / Discussions

- [ ] Issues：ON（License inquiry の窓口）
- [ ] Discussions：Phase 1 まで OFF（散漫化を避ける、R-11 / SPEC.md §11）

### 4.4 Wiki / Projects

- [ ] Wiki：OFF（README + SPEC.md + AGENTS.md でカバー）
- [ ] Projects：OFF

---

## Phase 5：公開後の即時タスク

### 5.1 コードネーム → ブランド名の置換準備

`context-engine` は **コードネーム**。商標出願後にブランド名に置換する。

- [ ] the patent attorney engaged for trademark filings に GitHub 公開を報告
- [ ] 商標出願済み区分の確認
- [ ] ブランド候補（Atlas® / Strata® / Lattice® / Codex® 等）から決定
- [ ] 決定後、`git mv` ではなく **新ブランド名 repo に移行**（履歴は残す）

### 5.2 X / Twitter アカウント開設

- [ ] 英語ハンドルで開設（候補：`@contextengine_` 等）
- [ ] README の Contact 欄を更新して push

### 5.3 ドメイン

- [ ] `context-engine.dev` または類似ドメインの空き確認・取得検討
- [ ] Vercel に LP デプロイ（既存の他プロジェクトとは別 Vercel project に）

### 5.4 ローンチシーケンス

戦略：Single-side + Seeding + Micromarket（SPEC.md §11、詳細は internal planning docs）

- [ ] **Week 1**：Show HN（Hacker News）
- [ ] **Week 2**：Product Hunt（月曜 0:01 UTC）
- [ ] **Week 3**：Reddit ×複数 sub
- [ ] **Week 4**：IndieHackers / Dev.to / LinkedIn

各メディア向けの文面ドラフトは別途作成する。

---

## Phase 6：運用ルール

公開後、以下のルールを守る：

1. **Append-only documents（SPEC.md および internal planning docs）には「破壊的書き換え」禁止**。版管理する。
2. **PR は受けない**（Phase 0–1 は Producer = founder only、SPEC.md §11 / R-11）
3. **Issue は License inquiry のみ受ける**。Bug report は Phase 1 まで歓迎しない（散漫化を避ける）
4. **Phase 1 入り時に CONTRIBUTING.md を追加**して受け入れ範囲を明示する

---

## 緊急時：公開を取り下げる

```bash
# repo を private に戻す
gh repo edit --visibility private

# または完全削除
gh repo delete <username>/context-engine --confirm
```

機密情報が漏れた場合は、**履歴ごと削除**する（`gh repo delete` → 新規 repo として再作成）。
push 後の `git push --force` での履歴書き換えだけでは取り戻せないので注意。

---

End of PUBLISH_STEPS.md
