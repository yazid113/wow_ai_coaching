/**
 * guideService.ts
 *
 * Spec knowledge is now seeded offline by knowledgeSeedService via the
 * /api/admin/seed-knowledge endpoint, which derives facts directly from the
 * SimC APL. This file is kept as a thin shim for backwards compatibility with
 * specKnowledgeService — it returns empty string so the caller falls through
 * to the Supabase cache (which is the authoritative source).
 *
 * On-demand generation was removed because:
 * 1. It added 5–25s latency to every analysis request
 * 2. Claude's training knowledge is unreliable for current-patch rotation facts
 * 3. The seed job produces higher-quality knowledge grounded in the actual APL
 *
 * To refresh knowledge after a patch: POST /api/admin/seed-knowledge { force: true }
 */
export async function fetchSpecGuideContext(
  _specName: string,
  _heroTalent: string,
  _talentNames?: string[],
): Promise<string> {
  return ''
}
