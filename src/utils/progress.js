/**
 * localStorage-backed learning progress, keyed by cheat sheet id (matches
 * src/data/topics.js `id`). Per-browser only, same tradeoff devsheets.io
 * makes for its own progress dashboard - no account, no server round trip.
 */

const STORAGE_KEY = 'cheatsheet-progress';

export const STATUS = {
  IN_PROGRESS: 'in-progress',
  KNOWN: 'known',
};

export const STATUS_LABEL = {
  [STATUS.IN_PROGRESS]: 'In Progress',
  [STATUS.KNOWN]: 'Known',
};

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getAllProgress() {
  if (typeof window === 'undefined') return {};
  return safeParse(window.localStorage.getItem(STORAGE_KEY) || '{}');
}

export function getStatus(id) {
  return getAllProgress()[id] || null;
}

export function setStatus(id, status) {
  if (typeof window === 'undefined') return;
  const all = getAllProgress();
  if (status) {
    all[id] = status;
  } else {
    delete all[id];
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  touchStreak();
  window.dispatchEvent(new CustomEvent('cheatsheet-progress-changed'));
}

export function clearAllProgress() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('cheatsheet-progress-changed'));
}

/* ------------------------------------------------------------------ */
/* Portability: export / import so progress survives a browser switch */
/* ------------------------------------------------------------------ */

const EXPORT_VERSION = 1;

export function exportProgress() {
  return JSON.stringify(
    {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      progress: getAllProgress(),
      streak: getStreak(),
    },
    null,
    2,
  );
}

/** Accepts the exportProgress() shape or a bare {id: status} map. Merges. */
export function importProgress(json) {
  if (typeof window === 'undefined') return {ok: false, error: 'no window'};
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {ok: false, error: 'Not valid JSON'};
  }
  const incoming =
    parsed && typeof parsed === 'object' && parsed.progress
      ? parsed.progress
      : parsed;
  if (!incoming || typeof incoming !== 'object') {
    return {ok: false, error: 'No progress data found'};
  }
  const valid = new Set(Object.values(STATUS));
  const merged = getAllProgress();
  let added = 0;
  for (const [id, status] of Object.entries(incoming)) {
    if (valid.has(status)) {
      if (merged[id] !== status) added += 1;
      merged[id] = status;
    }
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent('cheatsheet-progress-changed'));
  return {ok: true, added, total: Object.keys(merged).length};
}

/* ------------------------------------------------------------------ */
/* Study streak — consecutive days you marked something               */
/* ------------------------------------------------------------------ */

const STREAK_KEY = 'cheatsheet-streak';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

export function getStreak() {
  if (typeof window === 'undefined') return {count: 0, last: null, best: 0};
  try {
    const s = JSON.parse(window.localStorage.getItem(STREAK_KEY) || '{}');
    return {count: s.count || 0, last: s.last || null, best: s.best || 0};
  } catch {
    return {count: 0, last: null, best: 0};
  }
}

export function touchStreak() {
  if (typeof window === 'undefined') return;
  const s = getStreak();
  const d = today();
  if (s.last === d) return;
  const gap = s.last ? dayDiff(s.last, d) : null;
  const count = gap === 1 ? s.count + 1 : 1;
  const next = {count, last: d, best: Math.max(count, s.best)};
  try {
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  } catch {
    /* storage disabled */
  }
}
