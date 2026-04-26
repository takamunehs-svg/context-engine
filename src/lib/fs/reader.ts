import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import matter from 'gray-matter';

export async function readYaml<T = unknown>(filePath: string): Promise<T> {
  const text = await fs.readFile(filePath, 'utf-8');
  return yaml.load(text) as T;
}

export interface MarkdownFile<F = Record<string, unknown>> {
  frontmatter: F;
  body: string;
  raw: string;
}

export async function readMarkdown<F = Record<string, unknown>>(
  filePath: string
): Promise<MarkdownFile<F>> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed = matter(raw);
  return {
    frontmatter: parsed.data as F,
    body: parsed.content,
    raw,
  };
}

/**
 * JSONL を読み込む。
 * 冒頭がスキーマ宣言行（_schema フィールドを持つ）の場合はスキップして返す。
 */
export async function readJsonl<T = unknown>(
  filePath: string
): Promise<{ schema: Record<string, unknown> | null; entries: T[] }> {
  let text: string;
  try {
    text = await fs.readFile(filePath, 'utf-8');
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { schema: null, entries: [] };
    }
    throw err;
  }
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  let schema: Record<string, unknown> | null = null;
  const entries: T[] = [];
  for (const line of lines) {
    const obj = JSON.parse(line);
    if ('_schema' in obj && entries.length === 0 && schema === null) {
      schema = obj as Record<string, unknown>;
      continue;
    }
    entries.push(obj as T);
  }
  return { schema, entries };
}

export async function listDir(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

export async function listYamlsInDir(dirPath: string): Promise<string[]> {
  const entries = await listDir(dirPath);
  return entries.filter((e) => e.endsWith('.yaml') || e.endsWith('.yml'));
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export function joinPath(...segments: string[]): string {
  return path.join(...segments);
}
