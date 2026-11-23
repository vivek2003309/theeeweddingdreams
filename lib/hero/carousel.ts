export interface NetworkConnectionLike {
  downlink?: number;
  saveData?: boolean;
}

export function getNextChapterIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

export function getPrevChapterIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current - 1 + total) % total;
}

export function clampChapterIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  if (index < 0) return 0;
  if (index >= total) return total - 1;
  return index;
}

export function computeProgressRatio(
  elapsedMs: number,
  durationSeconds: number
): number {
  if (durationSeconds <= 0) return 0;
  const totalMs = durationSeconds * 1000;
  const clamped = Math.max(0, Math.min(elapsedMs, totalMs));
  return clamped / totalMs;
}

export function formatChapterNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * Enforces AGENTS.md media performance rule #12:
 * 2160p only on capable connections (downlink >= 10, width >= 1600, not saveData).
 */
export function canUpgradeTo4K(params: {
  viewportWidth: number;
  reducedMotion: boolean;
  connection?: NetworkConnectionLike;
}): boolean {
  if (params.reducedMotion) return false;
  if (params.viewportWidth < 1600) return false;
  if (params.connection?.saveData) return false;
  const downlink = params.connection?.downlink ?? 0;
  return downlink >= 10;
}
