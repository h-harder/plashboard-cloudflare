// Cloudflare Pages Functions entry (if you deploy with Cloudflare Pages instead of Workers).
import { handle } from "../../src/core.js";
import { kvStore } from "../../src/stores/kv.js";

export async function onRequest({ request, env }) {
  return handle(request, kvStore(env.PLASHBOARD_KV), { env, defaultIterations: 50000 });
}
