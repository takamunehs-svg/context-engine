'use server';

import { revalidatePath } from 'next/cache';
import { appendSoAEvent, appendMemoryDecision, appendMemoryFailure, appendMemoryExperience } from '@/lib/fs/subject';
import { currentMonth } from '@/lib/fs/paths';
import type { SoAEvent, MemoryDecision, MemoryFailure, MemoryExperience } from '@/types/core';

function nowIso(): string {
  return new Date().toISOString();
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─────────────────────────────────────────
// SoA: イベント追加（append-only）
// ─────────────────────────────────────────

export async function addSessionEventAction(
  tenantId: string,
  subjectId: string,
  formData: FormData
) {
  const event: SoAEvent = {
    id: genId('evt'),
    event_type: 'session',
    subject_id: subjectId,
    recorded_at: nowIso(),
    context: {
      facts: {
        session_date: String(formData.get('session_date') ?? ''),
        duration_min: Number(formData.get('duration_min') ?? 0),
        pain_nrs_pre: numOrNull(formData.get('pain_nrs_pre')),
        pain_nrs_post: numOrNull(formData.get('pain_nrs_post')),
        rpe: numOrNull(formData.get('rpe')),
      },
      inputs: {
        session_notes: String(formData.get('session_notes') ?? ''),
        client_subjective: String(formData.get('client_subjective') ?? ''),
      },
      refs: [],
    },
  };
  await appendSoAEvent(tenantId, currentMonth(), event);
  revalidatePath(`/t/${tenantId}/subjects/${subjectId}`);
}

export async function addMeasurementEventAction(
  tenantId: string,
  subjectId: string,
  formData: FormData
) {
  const event: SoAEvent = {
    id: genId('evt'),
    event_type: 'measurement',
    subject_id: subjectId,
    recorded_at: nowIso(),
    context: {
      facts: {
        measured_date: String(formData.get('measured_date') ?? ''),
        bp_systolic: numOrNull(formData.get('bp_systolic')),
        bp_diastolic: numOrNull(formData.get('bp_diastolic')),
        weight_kg: numOrNull(formData.get('weight_kg')),
      },
      inputs: {
        notes: String(formData.get('notes') ?? ''),
      },
    },
  };
  await appendSoAEvent(tenantId, currentMonth(), event);
  revalidatePath(`/t/${tenantId}/subjects/${subjectId}`);
}

// ─────────────────────────────────────────
// Memory: append（4種類）
// ─────────────────────────────────────────

export async function addMemoryDecisionAction(
  tenantId: string,
  subjectId: string,
  formData: FormData
) {
  const entry: MemoryDecision = {
    id: genId('dec'),
    recorded_at: nowIso(),
    title: String(formData.get('title') ?? ''),
    context: String(formData.get('context') ?? ''),
    alternatives_considered: splitLines(formData.get('alternatives_considered')),
    decision: String(formData.get('decision') ?? ''),
    rationale: String(formData.get('rationale') ?? ''),
    outcome: String(formData.get('outcome') ?? '') || undefined,
  };
  await appendMemoryDecision(tenantId, subjectId, entry);
  revalidatePath(`/t/${tenantId}/subjects/${subjectId}`);
}

export async function addMemoryFailureAction(
  tenantId: string,
  subjectId: string,
  formData: FormData
) {
  const entry: MemoryFailure = {
    id: genId('fail'),
    recorded_at: nowIso(),
    what_went_wrong: String(formData.get('what_went_wrong') ?? ''),
    root_cause: String(formData.get('root_cause') ?? ''),
    prevention: String(formData.get('prevention') ?? ''),
    pattern_tags: splitTags(formData.get('pattern_tags')),
  };
  await appendMemoryFailure(tenantId, subjectId, entry);
  revalidatePath(`/t/${tenantId}/subjects/${subjectId}`);
}

export async function addMemoryExperienceAction(
  tenantId: string,
  subjectId: string,
  formData: FormData
) {
  const ew = Number(formData.get('emotional_weight') ?? 5);
  const entry: MemoryExperience = {
    id: genId('exp'),
    recorded_at: nowIso(),
    insight: String(formData.get('insight') ?? ''),
    emotional_weight: Math.max(1, Math.min(10, ew || 5)),
    tags: splitTags(formData.get('tags')),
  };
  await appendMemoryExperience(tenantId, subjectId, entry);
  revalidatePath(`/t/${tenantId}/subjects/${subjectId}`);
}

// ─────────────────────────────────────────
// helpers
// ─────────────────────────────────────────

function numOrNull(v: FormDataEntryValue | null): number | null {
  if (v === null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function splitLines(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function splitTags(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split(/[,、\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
