import { test } from "node:test";
import assert from "node:assert/strict";
import { redisStore } from "../src/stores/redis.js";

test("redis store speaks the Upstash REST protocol", async () => {
  const db = new Map();
  const calls = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(init.headers.authorization, "Bearer tok");
    const [cmd, key, value, ex, ttl] = JSON.parse(init.body);
    calls.push(cmd);
    let result = null;
    if (cmd === "GET") result = db.has(key) ? db.get(key) : null;
    if (cmd === "SET") (db.set(key, value), (result = "OK"), ex && assert.equal(ttl, "60"));
    if (cmd === "DEL") result = db.delete(key) ? 1 : 0;
    return new Response(JSON.stringify({ result }));
  };
  const s = redisStore({ KV_REST_API_URL: "https://x.upstash.io", KV_REST_API_TOKEN: "tok" });
  await s.put("a", "1");
  await s.put("b", "2", 60);
  assert.equal(await s.get("a"), "1");
  await s.delete("a");
  assert.equal(await s.get("a"), null);
  assert.deepEqual(calls, ["SET", "SET", "GET", "DEL", "GET"]);
  assert.throws(() => redisStore({}), /not configured/);
});
