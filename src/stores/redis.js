// Upstash Redis (REST) store — used on Vercel and anywhere else you like.
// Reads KV_REST_API_URL / KV_REST_API_TOKEN (Vercel Marketplace names)
// or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.
export function redisStore(env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Redis is not configured. Add an Upstash Redis database to this project (see README → Vercel).");
  }
  async function cmd(args) {
    const res = await fetch(url, {
      method: "POST",
      headers: { authorization: "Bearer " + token, "content-type": "application/json" },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    if (data.error) throw new Error("Redis: " + data.error);
    return data.result;
  }
  return {
    get: (key) => cmd(["GET", "pb:" + key]),
    put: (key, value, ttl) => cmd(ttl ? ["SET", "pb:" + key, value, "EX", String(ttl)] : ["SET", "pb:" + key, value]),
    delete: (key) => cmd(["DEL", "pb:" + key]),
  };
}
