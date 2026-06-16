/**
 * Simple TTL cache for compute-worker internal use.
 */
interface CacheEntry<T> { value: T; expiresAt: number; }

export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  constructor(private ttlMs: number) {}

  get(key: string): T | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) { this.store.delete(key); return undefined; }
    return e.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  delete(key: string): void { this.store.delete(key); }
  clear(): void { this.store.clear(); }
}
