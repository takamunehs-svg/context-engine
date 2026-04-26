import { paths } from './paths';
import { readMarkdown, readJsonl, listDir } from './reader';
import { appendJsonl } from './writer';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  SubjectProfile,
  SoAEvent,
  MemoryBundle,
  MemoryDecision,
  MemoryFailure,
  MemoryExperience,
  SubjectId,
} from '@/types/core';

export async function getSubjectProfile(
  tenantId: string,
  subjectId: SubjectId
): Promise<SubjectProfile> {
  const md = await readMarkdown<Omit<SubjectProfile, 'body' | 'raw'>>(
    paths.soaSubject(tenantId, subjectId)
  );
  return {
    ...md.frontmatter,
    subject_id: md.frontmatter.subject_id ?? subjectId,
    display_name: md.frontmatter.display_name ?? subjectId,
    body: md.body,
    raw: md.raw,
  };
}

/**
 * subject の SoA イベントを全月分読む（Phase 0 用・小規模想定）
 * 後で月別ロード or 範囲指定に置き換える
 */
export async function listSoAEvents(
  tenantId: string,
  subjectId?: SubjectId
): Promise<SoAEvent[]> {
  const eventsRoot = paths.soaEventsDir(tenantId);
  const months = await listDir(eventsRoot);
  const all: SoAEvent[] = [];
  for (const month of months) {
    if (month.startsWith('.')) continue;
    const file = path.join(eventsRoot, month, 'events.jsonl');
    const { entries } = await readJsonl<SoAEvent>(file);
    all.push(...entries);
  }
  const filtered = subjectId ? all.filter((e) => e.subject_id === subjectId) : all;
  return filtered.sort((a, b) =>
    a.recorded_at < b.recorded_at ? -1 : a.recorded_at > b.recorded_at ? 1 : 0
  );
}

export async function appendSoAEvent(
  tenantId: string,
  yyyymm: string,
  event: SoAEvent
): Promise<void> {
  await appendJsonl(
    paths.soaMonthFile(tenantId, yyyymm),
    event as unknown as Record<string, unknown>,
    {
      _schema: 'soa.event',
      _version: '1.0',
      _description: 'SoA event log. Append-only.',
    }
  );
}

// ─────────────────────────────────────────
// Memory（subject別・append-only）
// ─────────────────────────────────────────

export async function loadMemory(
  tenantId: string,
  subjectId: SubjectId
): Promise<MemoryBundle> {
  const [decisions, failures, experiences, personalization] = await Promise.all([
    readJsonl<MemoryDecision>(paths.memoryDecisions(tenantId, subjectId)),
    readJsonl<MemoryFailure>(paths.memoryFailures(tenantId, subjectId)),
    readJsonl<MemoryExperience>(paths.memoryExperiences(tenantId, subjectId)),
    readPersonalization(tenantId, subjectId),
  ]);
  const total =
    decisions.entries.length + failures.entries.length + experiences.entries.length;
  return {
    decisions: decisions.entries,
    failures: failures.entries,
    experiences: experiences.entries,
    personalization,
    counts: {
      decisions: decisions.entries.length,
      failures: failures.entries.length,
      experiences: experiences.entries.length,
      has_personalization: personalization.trim().length > 0,
      total,
    },
  };
}

async function readPersonalization(
  tenantId: string,
  subjectId: SubjectId
): Promise<string> {
  try {
    return await fs.readFile(paths.memoryPersonalization(tenantId, subjectId), 'utf-8');
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return '';
    throw err;
  }
}

export async function appendMemoryDecision(
  tenantId: string,
  subjectId: SubjectId,
  entry: MemoryDecision
): Promise<void> {
  await appendJsonl(
    paths.memoryDecisions(tenantId, subjectId),
    entry as unknown as Record<string, unknown>,
    { _schema: 'memory.decision', _version: '1.0' }
  );
}

export async function appendMemoryFailure(
  tenantId: string,
  subjectId: SubjectId,
  entry: MemoryFailure
): Promise<void> {
  await appendJsonl(
    paths.memoryFailures(tenantId, subjectId),
    entry as unknown as Record<string, unknown>,
    { _schema: 'memory.failure', _version: '1.0' }
  );
}

export async function appendMemoryExperience(
  tenantId: string,
  subjectId: SubjectId,
  entry: MemoryExperience
): Promise<void> {
  await appendJsonl(
    paths.memoryExperiences(tenantId, subjectId),
    entry as unknown as Record<string, unknown>,
    { _schema: 'memory.experience', _version: '1.0' }
  );
}
