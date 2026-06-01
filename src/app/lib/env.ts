function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const env = {
  apiBase: trimTrailingSlash(import.meta.env.VITE_API_BASE ?? 'http://localhost:3001/api/v1'),
  wsUrl: trimTrailingSlash(import.meta.env.VITE_WS_URL ?? 'http://localhost:3001'),
};

