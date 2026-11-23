// Cloudflare Workers entry (used by the "Deploy to Cloudflare" button).
import { handle } from "./core.js";
import { kvStore } from "./stores/kv.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handle(request, kvStore(env.PLASHBOARD_KV), { env, defaultIterations: 50000 });
    }
    if (/^\/d\/[^/]+\/?$/.test(url.pathname)) {
      return env.ASSETS.fetch(new Request(new URL("/d/", url), request));
    }
    return env.ASSETS.fetch(request);
  },
};
