import { env } from './env';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path: string, query?: Record<string, string | number | undefined | null>) {
  const url = new URL(path.replace(/^\//, ''), `${env.apiBase.replace(/\/+$/, '')}/`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      const s = String(v).trim();
      if (!s) continue;
      url.searchParams.set(k, s);
    }
  }
  return url.toString();
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(path: string, method: string, status: number, body: unknown): string {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (typeof b.message === 'string') return b.message;
    if (typeof b.error === 'string') return `${method} ${path} failed: ${b.error}`;
  }
  return `${method} ${path} failed (${status})`;
}

export async function apiGet<T>(path: string, query?: Record<string, string | number | undefined | null>): Promise<T> {
  const res = await fetch(buildUrl(path, query), {
    method: 'GET',
    headers: { accept: 'application/json' },
  });
  const body = await readJsonSafe(res);
  if (!res.ok) throw new ApiError(errorMessage(path, 'GET', res.status, body), res.status, body);
  return body as T;
}

export async function apiPost<T>(path: string, data?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const body = await readJsonSafe(res);
  if (!res.ok) throw new ApiError(errorMessage(path, 'POST', res.status, body), res.status, body);
  return body as T;
}

export async function apiPatch<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await readJsonSafe(res);
  if (!res.ok) throw new ApiError(errorMessage(path, 'PATCH', res.status, body), res.status, body);
  return body as T;
}
