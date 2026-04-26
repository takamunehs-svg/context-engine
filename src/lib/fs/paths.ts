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

  soaSchema: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'soa', '_schema.yaml'),
  soaEventsDir: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'soa', 'events'),
  soaMonthFile: (tenantId: string, yyyymm: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'soa', 'events', yyyymm, 'events.jsonl'),
  soaSubjectsDir: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'soa', 'subjects'),
  soaSubject: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'soa', 'subjects', `${subjectId}.md`),

  somSchema: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'som', '_schema.yaml'),
  somRulesDir: (tenantId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'som', 'rules'),

  memoryDir: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'memory', subjectId),
  memoryDecisions: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'memory', subjectId, 'decisions.jsonl'),
  memoryFailures: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'memory', subjectId, 'failures.jsonl'),
  memoryExperiences: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'memory', subjectId, 'experiences.jsonl'),
  memoryPersonalization: (tenantId: string, subjectId: string) =>
    path.join(DATA_ROOT, 'tenants', tenantId, 'memory', subjectId, 'personalization.md'),
};

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
