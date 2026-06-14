/**
 * Simple TTL cache.
 * Entries expire after the configured TTL.
 */

interface CacheEntry<T> {
  value: T;
  expires_at: number;
}

export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttl_ms: number;

  constructor(ttl_ms: number) {
    this.ttl_ms = ttl_ms;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires_at) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expires_at: Date.now() + this.ttl_ms });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
