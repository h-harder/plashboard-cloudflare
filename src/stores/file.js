// File-system store for self-hosting with Node / Docker.
import { mkdir, readFile, writeFile, rm, rename } from "node:fs/promises";
import { join } from "node:path";

export function fileStore(dir) {
  const ready = mkdir(dir, { recursive: true });
  const file = (key) => join(dir, encodeURIComponent(key).replace(/\./g, "%2E") + ".json");
  return {
    async get(key) {
      await ready;
      try {
        const raw = JSON.parse(await readFile(file(key), "utf8"));
        if (raw.exp && raw.exp < Date.now()) return null;
        return raw.v;
      } catch {
        return null;
      }
    },
    async put(key, value, ttl) {
      await ready;
      const tmp = file(key) + "." + Math.random().toString(36).slice(2) + ".tmp";
      await writeFile(tmp, JSON.stringify({ v: value, exp: ttl ? Date.now() + ttl * 1000 : 0 }));
      await rename(tmp, file(key));
    },
    async delete(key) {
      await ready;
      await rm(file(key), { force: true });
    },
  };
}
