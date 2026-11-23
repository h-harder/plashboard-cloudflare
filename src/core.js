// Plashboard API core.
// A single web-standard handler: (Request, store, options) -> Response.
// Every hosting adapter (Cloudflare, Netlify, Vercel, Node) calls this.
//
// Store interface (all async, values are strings):
//   get(key) -> string | null
//   put(key, value, ttlSeconds?)
//   delete(key)

const SESSION_COOKIE = "pb_session";
const SESSION_DAYS = 30;
const MAX_DASHBOARD_BYTES = 2 * 1024 * 1024; // 2 MB of JSON
const MAX_ASSET_BYTES = 8 * 1024 * 1024; // 8 MB per uploaded file
const MAX_DASHBOARDS = 100;
const ALLOWED_ASSET_TYPES = /^(image\/(png|jpe?g|gif|webp|svg\+xml|avif)|video\/(mp4|webm))$/;

const enc = new TextEncoder();

// ---------- helpers ----------

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function error(status, message) {
  return json({ error: message }, status);
}

function randomId(len = 12) {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hashPassword(password, saltHex, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromHex(saltHex), iterations },
    key,
    256
  );
  return toHex(bits);
}

async function sha256(text) {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function sessionCookie(token, secure, maxAge) {
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

async function readJson(request, limit = MAX_DASHBOARD_BYTES + 1024) {
  const ct = request.headers.get("content-type") || "";
  // Requiring JSON blocks simple cross-site form posts (CSRF).
  if (!ct.includes("application/json")) throw new HttpError(415, "Expected application/json");
  const text = await request.text();
  if (text.length > limit) throw new HttpError(413, "Request too large");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function getJSON(store, key) {
  const raw = await store.get(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function putJSON(store, key, value, ttl) {
  return store.put(key, JSON.stringify(value), ttl);
}

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

// ---------- auth ----------

async function currentUser(request, store) {
  const token = parseCookies(request.headers.get("cookie"))[SESSION_COOKIE];
  if (!token || !/^[A-Za-z0-9]{20,64}$/.test(token)) return null;
  const session = await getJSON(store, "session:" + (await sha256(token)));
  if (!session || session.exp < Date.now()) return null;
  const user = await getJSON(store, "user:" + session.username);
  return user;
}

async function requireUser(request, store) {
  const user = await currentUser(request, store);
  if (!user) throw new HttpError(401, "Not signed in");
  return user;
}

async function createSession(store, username) {
  const token = randomId(40);
  const exp = Date.now() + SESSION_DAYS * 86400e3;
  await putJSON(store, "session:" + (await sha256(token)), { username, exp }, SESSION_DAYS * 86400);
  return token;
}

async function checkRateLimit(store, key, max, windowSec) {
  const rec = (await getJSON(store, key)) || { n: 0, reset: Date.now() + windowSec * 1000 };
  if (rec.reset < Date.now()) {
    rec.n = 0;
    rec.reset = Date.now() + windowSec * 1000;
  }
  rec.n++;
  await putJSON(store, key, rec, Math.max(60, windowSec));
  if (rec.n > max) throw new HttpError(429, "Too many attempts. Try again in a few minutes.");
}

function publicUser(u) {
  return { username: u.display || u.username, createdAt: u.createdAt };
}

// ---------- dashboards ----------

function summary(d) {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
    interactive: !!(d.settings && d.settings.interactive),
    background: d.settings && d.settings.background,
    theme: d.settings && d.settings.theme,
  };
}

function sanitizeDoc(input) {
  if (!input || typeof input !== "object") throw new HttpError(400, "Missing dashboard");
  const doc = {
    name: String(input.name || "Untitled dashboard").slice(0, 120),
    settings: input.settings && typeof input.settings === "object" ? input.settings : {},
    widgets: Array.isArray(input.widgets) ? input.widgets.slice(0, 500) : [],
    version: 1,
  };
  if (JSON.stringify(doc).length > MAX_DASHBOARD_BYTES) throw new HttpError(413, "Dashboard is too large");
  return doc;
}

async function ownedDashboard(store, user, id) {
  if (!user.dashboards || !user.dashboards.includes(id)) throw new HttpError(404, "Dashboard not found");
  const d = await getJSON(store, "dash:" + id);
  if (!d || d.owner !== user.username) throw new HttpError(404, "Dashboard not found");
  return d;
}

// ---------- assets ----------

function decodeDataUrl(dataUrl) {
  const m = /^data:([a-z0-9.+\/-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(dataUrl || "");
  if (!m) throw new HttpError(400, "Expected a base64 data URL");
  const type = m[1].toLowerCase();
  if (!ALLOWED_ASSET_TYPES.test(type)) throw new HttpError(415, "Unsupported file type: " + type);
  const b64 = m[2].replace(/\s+/g, "");
  const bytes = Math.floor((b64.length * 3) / 4);
  if (bytes > MAX_ASSET_BYTES) throw new HttpError(413, "File is too large (max 8 MB)");
  return { type, b64 };
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---------- router ----------

/**
 * @param {Request} request
 * @param {object} store
 * @param {object} opts { env: {REGISTRATION, INVITE_CODE, PBKDF2_ITERATIONS}, path?: override pathname }
 */
export async function handle(request, store, opts = {}) {
  const env = opts.env || {};
  const url = new URL(request.url);
  const path = (opts.path || url.pathname).replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();
  const secure = url.protocol === "https:" || (request.headers.get("x-forwarded-proto") || "") === "https";
  const registration = String(env.REGISTRATION || (env.INVITE_CODE ? "invite" : "open")).toLowerCase();
  const iterations = Math.min(Math.max(parseInt(env.PBKDF2_ITERATIONS, 10) || opts.defaultIterations || 100000, 10000), 1000000);
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  try {
    const seg = path.split("/").filter(Boolean); // ["api", ...]
    if (seg[0] !== "api") return error(404, "Not found");
    const r = seg.slice(1);

    // --- public ---
    if (r[0] === "health") return json({ ok: true });

    if (r[0] === "config" && method === "GET") {
      return json({ registration: registration === "closed" ? "closed" : registration === "invite" ? "invite" : "open" });
    }

    if (r[0] === "view" && r[1] && method === "GET") {
      const id = await store.get("slug:" + r[1]);
      if (!id) return error(404, "Dashboard not found");
      const d = await getJSON(store, "dash:" + id);
      if (!d) return error(404, "Dashboard not found");
      const etag = `"${d.updatedAt}"`;
      if (request.headers.get("if-none-match") === etag) {
        return new Response(null, { status: 304, headers: { etag, "cache-control": "no-cache" } });
      }
      const { owner, ...pub } = d;
      return json(pub, 200, { etag, "cache-control": "no-cache" });
    }

    if (r[0] === "assets" && r[1] && method === "GET") {
      const a = await getJSON(store, "asset:" + r[1]);
      if (!a) return error(404, "Asset not found");
      const headers = {
        "content-type": a.type,
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      };
      // SVGs can carry scripts; sandbox them when opened directly.
      if (a.type === "image/svg+xml") headers["content-security-policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
      return new Response(b64ToBytes(a.b64), { headers });
    }

    // --- auth ---
    if (r[0] === "auth") {
      if (r[1] === "me" && method === "GET") {
        const user = await currentUser(request, store);
        return json({ user: user ? publicUser(user) : null, registration });
      }

      if (r[1] === "signup" && method === "POST") {
        if (registration === "closed") return error(403, "Sign-ups are closed on this Plashboard.");
        const body = await readJson(request, 4096);
        if (registration === "invite") {
          if (!env.INVITE_CODE || !timingSafeEqual(String(body.invite || ""), String(env.INVITE_CODE))) {
            return error(403, "That invite code is not right.");
          }
        }
        await checkRateLimit(store, "rl:signup:" + ip, 10, 3600);
        const display = String(body.username || "").trim();
        const password = String(body.password || "");
        if (!USERNAME_RE.test(display)) return error(400, "Usernames are 3–32 characters: letters, numbers, dots, dashes or underscores.");
        if (password.length < 8) return error(400, "Passwords need at least 8 characters.");
        if (password.length > 256) return error(400, "That password is too long.");
        const username = display.toLowerCase();
        if (await store.get("user:" + username)) return error(409, "That username is taken.");
        const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
        const hash = await hashPassword(password, salt, iterations);
        const user = { username, display, salt, hash, iter: iterations, createdAt: Date.now(), dashboards: [] };
        await putJSON(store, "user:" + username, user);
        const token = await createSession(store, username);
        return json({ user: publicUser(user) }, 201, { "set-cookie": sessionCookie(token, secure, SESSION_DAYS * 86400) });
      }

      if (r[1] === "login" && method === "POST") {
        const body = await readJson(request, 4096);
        const username = String(body.username || "").trim().toLowerCase();
        const password = String(body.password || "");
        await checkRateLimit(store, "rl:login:" + username, 10, 900);
        await checkRateLimit(store, "rl:loginip:" + ip, 40, 900);
        const user = await getJSON(store, "user:" + username);
        if (!user) return error(401, "Wrong username or password.");
        const hash = await hashPassword(password, user.salt, user.iter || iterations);
        if (!timingSafeEqual(hash, user.hash)) return error(401, "Wrong username or password.");
        const token = await createSession(store, username);
        return json({ user: publicUser(user) }, 200, { "set-cookie": sessionCookie(token, secure, SESSION_DAYS * 86400) });
      }

      if (r[1] === "logout" && method === "POST") {
        const token = parseCookies(request.headers.get("cookie"))[SESSION_COOKIE];
        if (token) await store.delete("session:" + (await sha256(token)));
        return json({ ok: true }, 200, { "set-cookie": sessionCookie("", secure, 0) });
      }

      if (r[1] === "password" && method === "POST") {
        const user = await requireUser(request, store);
        const body = await readJson(request, 4096);
        await checkRateLimit(store, "rl:pw:" + user.username, 10, 900);
        const cur = await hashPassword(String(body.current || ""), user.salt, user.iter || iterations);
        if (!timingSafeEqual(cur, user.hash)) return error(401, "Your current password is not right.");
        const next = String(body.next || "");
        if (next.length < 8) return error(400, "Passwords need at least 8 characters.");
        user.salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
        user.iter = iterations;
        user.hash = await hashPassword(next, user.salt, iterations);
        await putJSON(store, "user:" + user.username, user);
        return json({ ok: true });
      }
      return error(404, "Not found");
    }

    // --- dashboards (signed in) ---
    if (r[0] === "dashboards") {
      const user = await requireUser(request, store);
      user.dashboards = user.dashboards || [];

      if (!r[1]) {
        if (method === "GET") {
          const list = [];
          for (const id of user.dashboards) {
            const d = await getJSON(store, "dash:" + id);
            if (d) list.push(summary(d));
          }
          list.sort((a, b) => b.updatedAt - a.updatedAt);
          return json({ dashboards: list });
        }
        if (method === "POST") {
          if (user.dashboards.length >= MAX_DASHBOARDS) return error(400, "You have reached the dashboard limit.");
          const body = await readJson(request);
          const doc = sanitizeDoc(body.dashboard || body);
          const now = Date.now();
          const d = { ...doc, id: randomId(12), slug: randomId(16), owner: user.username, createdAt: now, updatedAt: now };
          await putJSON(store, "dash:" + d.id, d);
          await store.put("slug:" + d.slug, d.id);
          user.dashboards.push(d.id);
          await putJSON(store, "user:" + user.username, user);
          return json({ dashboard: d }, 201);
        }
        return error(405, "Method not allowed");
      }

      const d = await ownedDashboard(store, user, r[1]);

      if (r[2] === "regenerate-link" && method === "POST") {
        await store.delete("slug:" + d.slug);
        d.slug = randomId(16);
        d.updatedAt = Date.now();
        await putJSON(store, "dash:" + d.id, d);
        await store.put("slug:" + d.slug, d.id);
        return json({ dashboard: d });
      }

      if (r[2]) return error(404, "Not found");

      if (method === "GET") return json({ dashboard: d });

      if (method === "PUT") {
        const body = await readJson(request);
        const doc = sanitizeDoc(body.dashboard || body);
        const next = { ...d, ...doc, updatedAt: Date.now() };
        await putJSON(store, "dash:" + d.id, next);
        return json({ dashboard: next });
      }

      if (method === "DELETE") {
        await store.delete("dash:" + d.id);
        await store.delete("slug:" + d.slug);
        user.dashboards = user.dashboards.filter((x) => x !== d.id);
        await putJSON(store, "user:" + user.username, user);
        return json({ ok: true });
      }
      return error(405, "Method not allowed");
    }

    // --- uploads ---
    if (r[0] === "assets" && !r[1] && method === "POST") {
      const user = await requireUser(request, store);
      await checkRateLimit(store, "rl:upload:" + user.username, 120, 3600);
      const body = await readJson(request, MAX_ASSET_BYTES * 1.4 + 4096);
      const { type, b64 } = decodeDataUrl(body.dataUrl);
      const id = randomId(20);
      await putJSON(store, "asset:" + id, { type, b64, owner: user.username, createdAt: Date.now() });
      return json({ url: "/api/assets/" + id, id }, 201);
    }

    return error(404, "Not found");
  } catch (e) {
    if (e instanceof HttpError) return error(e.status, e.message);
    console.error(e);
    return error(500, "Something went wrong: " + (e && e.message ? e.message : "unknown error"));
  }
}
