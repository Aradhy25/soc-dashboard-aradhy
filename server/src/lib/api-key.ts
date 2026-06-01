import crypto from 'node:crypto';

export function generateApiKey(): string {
  // 32 random bytes -> 64 hex chars
  return `soc_${crypto.randomBytes(32).toString('hex')}`;
}

export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

export function apiKeyPrefix(rawKey: string): string {
  return rawKey.slice(0, 12);
}

