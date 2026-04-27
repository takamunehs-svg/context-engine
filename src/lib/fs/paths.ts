import path from 'node:path';

// data/ ディレクトリは context-engine プロジェクトルート直下
// process.cwd() = Next.js 起動時の作業ディレクトリ = context-engine/
const DATA_ROOT = path.join(process.cwd(), 'data');

export const paths = {
  dataRoot: DATA_ROOT,

  templates: () => path.join(DATA_ROOT, 'templates'),
  template: (id: string) => path.join(DATA_ROOT, 'templates', id),

  tenants: () => path.join(DATA_ROOT, 'tenants'),
  tenant: (id: string) => path.join(DATA_ROOT, 'tenants', id),
  tenantMeta: (id: string) => path.join(DATA_ROOT, 'tenants', id, '_meta.yaml'),

  // Tenant 配下
  instructions: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'INSTRUCTIONS'),
  routing: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'INSTRUCTIONS', 'ROUTING.md'),

  dictionary: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'dictionary'),
  dictionarySchema: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'dictionary', '_schema.yaml'),

  // Activity Layer（旧 SoA）
  activitySchema: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'activity', '_schema.yaml'),
  activityEventsDir: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'activity', 'events'),
  activityMonthFile: (tenantId: string, yyyymm: string) =>
    path.join(
      DATA_ROOT,
      'tenants',
      tenantId,
      'activity',
      'events',
      yyyymm,
      'events.jsonl'
    ),
  activitySubjectsDir: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'activity', 'subjects'),
  activitySubject: (tenantId: string, subjectId: string) =>
    path.join(
      DATA_ROOT,
      'tenants',
      tenantId,
      'activity',
      'subjects',
      `${subjectId}.md`
    ),

  // Management Layer（旧 SoM）
  managementSchema: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'management', '_schema.yaml'),
  managementRulesDir: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'management', 'rules'),

  // Episodic Memory（subject別）
  memoryDir: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'memory', subjectId),
  memoryDecisions: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'memory', subjectId, 'decisions.jsonl'),
  memoryFailures: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'memory', subjectId, 'failures.jsonl'),
  memoryExperiences: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'memory', subjectId, 'experiences.jsonl'),
  memoryPersonalization: (tenantId: string, subjectId: string) =>
    path.join(
      DATA_ROOT,
      'tenants',
      tenantId,
      'memory',
      subjectId,
      'personalization.md'
    ),
};

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
