// Netlify Blobs store. Works with zero configuration on Netlify.
import { getStore } from "@netlify/blobs";

export function netlifyStore() {
  const s = getStore({ name: "plashboard", consistency: "strong" });
  return {
    get: (key) => s.get(encodeKey(key), { type: "text", consistency: "strong" }),
    put: (key, value) => s.set(encodeKey(key), value),
    delete: (key) => s.delete(encodeKey(key)),
  };
}

// Blob keys may contain "/", but keep them tidy and safe.
function encodeKey(key) {
  return key.replace(/[^a-zA-Z0-9:._-]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"));
}
