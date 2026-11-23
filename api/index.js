// Vercel entry. Storage = Upstash Redis (add it from the Vercel Storage tab).
import { handle } from "../src/core.js";
import { redisStore } from "../src/stores/redis.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
  const url = new URL(request.url);
  const p = url.searchParams.get("__p");
  const path = p != null ? "/api/" + p : url.pathname;
  let store;
  try {
    store = redisStore(process.env);
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "content-type": "application/json" } });
  }
  return handle(request, store, { env: process.env, path });
}
