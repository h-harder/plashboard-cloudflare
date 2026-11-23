// Self-hosted Plashboard server (Node 18+). No dependencies.
//   node server.js            → http://localhost:8787
// Env: PORT, DATA_DIR (default ./data), REGISTRATION, INVITE_CODE
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { handle } from "./src/core.js";
import { fileStore } from "./src/stores/file.js";

const root = fileURLToPath(new URL("./public/", import.meta.url));
const store = fileStore(process.env.DATA_DIR || fileURLToPath(new URL("./data/", import.meta.url)));
const port = Number(process.env.PORT) || 8787;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

async function serveStatic(pathname, res) {
  if (/^\/d\/[^/]+\/?$/.test(pathname)) pathname = "/d/";
  let p = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, p);
  if (!file.startsWith(root)) return false;
  try {
    let s = await stat(file);
    if (s.isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(301, { location: pathname + "/" });
        res.end();
        return true;
      }
      file = join(file, "index.html");
      s = await stat(file);
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[extname(file)] || "application/octet-stream",
      "cache-control": extname(file) === ".html" ? "no-cache" : "public, max-age=300",
    });
    res.end(body);
    return true;
  } catch {
    return false;
  }
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      const request = new Request(url, {
        method: req.method,
        headers: req.headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
      });
      const response = await handle(request, store, { env: process.env });
      const headers = {};
      response.headers.forEach((v, k) => (headers[k] = v));
      res.writeHead(response.status, headers);
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (!(await serveStatic(url.pathname, res))) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("Not found");
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end("Server error");
  }
}).listen(port, () => console.log(`Plashboard running at http://localhost:${port}`));
