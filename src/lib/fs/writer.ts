import { promises as fs } from 'node:fs';
import { ensureDir, fileExists } from './reader';
import path from 'node:path';

/**
 * JSONL ファイルへの append-only 書き込み。
 * 既存行は絶対に変更しない。新規エントリを末尾に追加する。
 * ファイルが存在しない場合は、schemaLine を冒頭に書いて新規作成する。
 */
export async function appendJsonl(
  filePath: string,
  entry: Record<string, unknown>,
  schemaLine?: Record<string, unknown>
): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const exists = await fileExists(filePath);
  if (!exists) {
    if (schemaLine) {
      await fs.writeFile(filePath, JSON.stringify(schemaLine) + '\n', 'utf-8');
    } else {
      await fs.writeFile(filePath, '', 'utf-8');
    }
  }
  await fs.appendFile(filePath, JSON.stringify(entry) + '\n', 'utf-8');
}

/**
 * Markdown ファイルの上書き保存。
 * personalization.md など、版管理ではなく直接編集される系統で使う。
 * 上書き対象は append-only ファイルではないことを呼び出し側で保証すること。
 */
export async function writeMarkdown(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}
