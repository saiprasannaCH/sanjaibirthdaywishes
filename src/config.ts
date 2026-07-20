const DEFAULT_UNLOCK = new Date(2026, 6, 22, 0, 0, 0, 0).getTime();

function parseUnlockAt(value: string | undefined): number {
  if (!value?.trim()) return DEFAULT_UNLOCK;
  const parsed = new Date(value.trim());
  return Number.isNaN(parsed.getTime()) ? DEFAULT_UNLOCK : parsed.getTime();
}

/** Opens at the configured local datetime (see `.env` → VITE_UNLOCK_AT) */
export const UNLOCK_AT = parseUnlockAt(import.meta.env.VITE_UNLOCK_AT);

export const RECIPIENT_NAME = (import.meta.env.VITE_RECIPIENT_NAME || 'Sanjai').trim();

/** Human label for countdown copy, e.g. "July 22" */
export const UNLOCK_DATE_LABEL = new Date(UNLOCK_AT).toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
});

/** Human label for unlock clock, e.g. "12:00 AM" */
export const UNLOCK_TIME_LABEL = new Date(UNLOCK_AT).toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});
