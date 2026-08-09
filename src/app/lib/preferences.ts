const KEY = 'soc-preferences';

export type SocPreferences = {
  autoRefresh: boolean;
  soundNotifications: boolean;
  refreshIntervalSec: number;
};

export const defaultPreferences: SocPreferences = {
  autoRefresh: true,
  soundNotifications: true,
  refreshIntervalSec: 30,
};

export function loadPreferences(): SocPreferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultPreferences };
    const parsed = JSON.parse(raw) as Partial<SocPreferences>;
    return {
      autoRefresh: parsed.autoRefresh ?? defaultPreferences.autoRefresh,
      soundNotifications: parsed.soundNotifications ?? defaultPreferences.soundNotifications,
      refreshIntervalSec:
        typeof parsed.refreshIntervalSec === 'number' && parsed.refreshIntervalSec >= 5
          ? parsed.refreshIntervalSec
          : defaultPreferences.refreshIntervalSec,
    };
  } catch {
    return { ...defaultPreferences };
  }
}

export function savePreferences(prefs: SocPreferences) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent('soc:preferences', { detail: prefs }));
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';
  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const escape = (value: unknown) => {
    const s = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  return [keys.join(','), ...rows.map((row) => keys.map((k) => escape(row[k])).join(','))].join('\n');
}
