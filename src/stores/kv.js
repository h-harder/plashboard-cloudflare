// Cloudflare KV store (Workers and Pages).
export function kvStore(kv) {
  if (!kv) throw new Error("No KV namespace bound as PLASHBOARD_KV. See README → Cloudflare.");
  return {
    get: (key) => kv.get(key),
    put: (key, value, ttl) => kv.put(key, value, ttl ? { expirationTtl: Math.max(60, ttl) } : undefined),
    delete: (key) => kv.delete(key),
  };
}
