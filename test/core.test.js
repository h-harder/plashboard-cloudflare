// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../src/core.js";

function memoryStore() {
  const m = new Map();
  return {
    get: async (k) => (m.has(k) ? m.get(k) : null),
    put: async (k, v) => void m.set(k, v),
    delete: async (k) => void m.delete(k),
  };
}

function client(store, env = {}) {
  let cookie = "";
  return async (method, path, body) => {
    const res = await handle(
      new Request("https://pb.test/api" + path, {
        method,
        headers: { "content-type": "application/json", cookie },
        body: body ? JSON.stringify(body) : undefined,
      }),
      store,
      { env: { PBKDF2_ITERATIONS: "10000", ...env } }
    );
    const sc = res.headers.get("set-cookie");
    if (sc) cookie = sc.split(";")[0];
    return { status: res.status, body: res.status === 304 ? null : await res.json().catch(() => null), headers: res.headers };
  };
}

test("sign up, create, edit, view, delete", async () => {
  const store = memoryStore();
  const c = client(store);
  assert.equal((await c("POST", "/auth/signup", { username: "Alice", password: "secret-pass" })).status, 201);
  assert.equal((await c("POST", "/auth/signup", { username: "alice", password: "secret-pass" })).status, 409);
  const me = await c("GET", "/auth/me");
  assert.equal(me.body.user.username, "Alice");

  const created = await c("POST", "/dashboards", { dashboard: { name: "One", settings: { interactive: true }, widgets: [] } });
  assert.equal(created.status, 201);
  const d = created.body.dashboard;

  const put = await c("PUT", "/dashboards/" + d.id, { dashboard: { name: "Renamed", settings: {}, widgets: [{ id: "a", type: "text" }] } });
  assert.equal(put.body.dashboard.name, "Renamed");

  const anon = client(store);
  const view = await anon("GET", "/view/" + d.slug);
  assert.equal(view.status, 200);
  assert.equal(view.body.widgets.length, 1);
  assert.equal(view.body.owner, undefined);

  // other users can't touch it
  const bob = client(store);
  await bob("POST", "/auth/signup", { username: "bob", password: "secret-pass" });
  assert.equal((await bob("GET", "/dashboards/" + d.id)).status, 404);
  assert.equal((await bob("DELETE", "/dashboards/" + d.id)).status, 404);

  const regen = await c("POST", "/dashboards/" + d.id + "/regenerate-link", {});
  assert.notEqual(regen.body.dashboard.slug, d.slug);
  assert.equal((await anon("GET", "/view/" + d.slug)).status, 404);

  assert.equal((await c("DELETE", "/dashboards/" + d.id)).status, 200);
  assert.equal((await c("GET", "/dashboards")).body.dashboards.length, 0);
});

test("login, logout and wrong password", async () => {
  const store = memoryStore();
  const c = client(store);
  await c("POST", "/auth/signup", { username: "carol", password: "secret-pass" });
  await c("POST", "/auth/logout", {});
  assert.equal((await c("GET", "/dashboards")).status, 401);
  assert.equal((await c("POST", "/auth/login", { username: "carol", password: "nope-nope" })).status, 401);
  assert.equal((await c("POST", "/auth/login", { username: "CAROL", password: "secret-pass" })).status, 200);
  assert.equal((await c("GET", "/dashboards")).status, 200);
});

test("registration modes", async () => {
  const closed = client(memoryStore(), { REGISTRATION: "closed" });
  assert.equal((await closed("POST", "/auth/signup", { username: "dave", password: "secret-pass" })).status, 403);
  const invite = client(memoryStore(), { INVITE_CODE: "letmein" });
  assert.equal((await invite("POST", "/auth/signup", { username: "dave", password: "secret-pass", invite: "nope" })).status, 403);
  assert.equal((await invite("POST", "/auth/signup", { username: "dave", password: "secret-pass", invite: "letmein" })).status, 201);
});

test("rejects non-JSON writes (CSRF guard)", async () => {
  const res = await handle(
    new Request("https://pb.test/api/auth/login", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "a=b" }),
    memoryStore()
  );
  assert.equal(res.status, 415);
});

test("asset upload and fetch", async () => {
  const store = memoryStore();
  const c = client(store);
  await c("POST", "/auth/signup", { username: "erin", password: "secret-pass" });
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const up = await c("POST", "/assets", { dataUrl: "data:image/png;base64," + png });
  assert.equal(up.status, 201);
  const res = await handle(new Request("https://pb.test" + up.body.url), store);
  assert.equal(res.headers.get("content-type"), "image/png");
  assert.equal((await res.arrayBuffer()).byteLength, 70);
  assert.equal((await c("POST", "/assets", { dataUrl: "data:text/html;base64,PGgxPg==" })).status, 415);
});
