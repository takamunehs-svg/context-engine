import { paths } from './paths';
import { readYaml, readMarkdown, listDir } from './reader';
import type { TenantMeta, DictionarySchema, DictionaryEntry } from '@/types/core';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import yaml from 'js-yaml';

export async function listTenants(): Promise<TenantMeta[]> {
  const ids = await listDir(paths.tenants());
  const metas: TenantMeta[] = [];
  for (const id of ids) {
    if (id.startsWith('.')) continue;
    try {
      const meta = await readYaml<TenantMeta>(paths.tenantMeta(id));
      metas.push(meta);
    } catch {
      // _meta.yaml がないテナントはスキップ
    }
  }
  return metas;
}

export async function getTenantMeta(tenantId: string): Promise<TenantMeta> {
  return readYaml<TenantMeta>(paths.tenantMeta(tenantId));
}

export async function getDictionarySchema(tenantId: string): Promise<DictionarySchema> {
  return readYaml<DictionarySchema>(paths.dictionarySchema(tenantId));
}

/**
 * 辞書層全体を再帰的に読む（Phase 0 では全件・後で Progressive Disclosure で絞る）
 */
export async function readDictionary(tenantId: string): Promise<DictionaryEntry[]> {
  const root = paths.dictionary(tenantId);
  const entries: DictionaryEntry[] = [];

  async function walk(dir: string, relPrefix: string) {
    const items = await listDir(dir);
    for (const item of items) {
      if (item.startsWith('.') || item === '_schema.yaml') continue;
      const abs = path.join(dir, item);
      const rel = relPrefix ? `${relPrefix}/${item}` : item;
      const stat = await fs.stat(abs);
      if (stat.isDirectory()) {
        await walk(abs, rel);
      } else if (item.endsWith('.yaml') || item.endsWith('.yml')) {
        const data = yaml.load(await fs.readFile(abs, 'utf-8'));
        entries.push({ path: rel, format: 'yaml', data });
      } else if (item.endsWith('.md')) {
        const md = await readMarkdown(abs);
        entries.push({
          path: rel,
          format: 'md',
          data: { frontmatter: md.frontmatter, body: md.body },
        });
      }
    }
  }
  await walk(root, '');
  return entries;
}
