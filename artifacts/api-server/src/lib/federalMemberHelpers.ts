/**
 * Shared utilities for normalizing Congress.gov member data.
 * Used by both the federal route handler and the member ingestion pipeline.
 */

/**
 * Congress.gov returns member names in "Last, First" order.
 * Convert to display order "First Last".
 */
export function formatCongressMemberName(name: string): string {
  const parts = name.split(", ");
  if (parts.length === 2) return `${parts[1]} ${parts[0]}`;
  return name;
}

/**
 * Congress.gov uses different structures for the terms field depending on
 * whether the data came from a list endpoint or a detail endpoint:
 *   - list:   member.terms = { item: [...] }
 *   - detail: member.terms = [...]
 * Normalizes both to a plain array. Falls back to depictedTerms if present.
 */
export function normalizeCongressTerms(member: any): any[] {
  const raw = member?.terms?.item ?? member?.terms ?? member?.depictedTerms;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}
