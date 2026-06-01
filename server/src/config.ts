function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export const config = {
  port: parsePort(process.env.PORT, 3001),
  corsOrigins: parseCsv(process.env.CORS_ORIGIN ?? 'http://localhost:5173'),
  wsOrigins: parseCsv(process.env.WS_ORIGIN ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173'),
};

