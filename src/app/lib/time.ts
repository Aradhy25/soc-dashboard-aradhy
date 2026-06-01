function plural(n: number, word: string) {
  return n === 1 ? `${n}${word}` : `${n}${word}s`;
}

export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return 'never';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return 'unknown';

  const diffMs = Date.now() - d.getTime();
  const past = diffMs >= 0;
  const abs = Math.abs(diffMs);

  const sec = Math.floor(abs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  let label: string;
  if (sec < 45) label = 'just now';
  else if (min < 60) label = plural(min, 'm');
  else if (hr < 24) label = plural(hr, 'h');
  else label = plural(day, 'd');

  if (label === 'just now') return label;
  return past ? `${label} ago` : `in ${label}`;
}

export function asPrettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

