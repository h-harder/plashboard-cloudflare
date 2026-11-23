// Wallpaper viewer: /d/<link-id>
// URL options: ?interactive=1|0  ?poll=<seconds> (0 = never)  ?scale=<number>
import { renderDashboard } from "./render.js";

const root = document.getElementById("root");
const params = new URLSearchParams(location.search);
const slug = (location.pathname.match(/\/d\/([^/]+)/) || [])[1] || params.get("id") || location.hash.slice(1);
const pollSec = params.has("poll") ? Number(params.get("poll")) : 20;
const cacheKey = "pb:view:" + slug;

let ctrl = null;
let etag = null;
let lastUpdated = 0;

function message(title, text) {
  if (ctrl) return; // keep showing the last good dashboard
  root.innerHTML = `<div class="pb-msg"><div><b></b><span></span></div></div>`;
  root.querySelector("b").textContent = title;
  root.querySelector("span").textContent = text;
}

function show(doc) {
  if (doc.updatedAt && doc.updatedAt === lastUpdated && ctrl) return;
  lastUpdated = doc.updatedAt;
  document.title = doc.name || "Plashboard";
  const interactive = params.has("interactive") ? params.get("interactive") === "1" : !!doc.settings?.interactive;
  if (ctrl && ctrl.interactive === interactive) {
    ctrl.update(doc);
    return;
  }
  if (ctrl) ctrl.destroy();
  root.innerHTML = "";
  ctrl = renderDashboard(root, doc, { mode: "view", interactive, dashKey: slug });
  ctrl.interactive = interactive;
  if (params.has("scale")) root.style.zoom = params.get("scale");
}

async function load() {
  try {
    const res = await fetch("/api/view/" + encodeURIComponent(slug), {
      headers: etag ? { "if-none-match": etag } : {},
      cache: "no-store",
    });
    if (res.status === 304) return;
    if (res.status === 404) {
      try { localStorage.removeItem(cacheKey); } catch {}
      if (ctrl) { ctrl.destroy(); ctrl = null; }
      message("Dashboard not found", "This link may have been changed or deleted. Get a fresh link from your Plashboard.");
      return;
    }
    if (!res.ok) throw new Error("HTTP " + res.status);
    etag = res.headers.get("etag");
    const doc = await res.json();
    try { localStorage.setItem(cacheKey, JSON.stringify(doc)); } catch {}
    show(doc);
  } catch (e) {
    // Offline (e.g. right after the Mac wakes up): fall back to the cached copy.
    if (!ctrl) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
        if (cached) return show(cached);
      } catch {}
      message("Can't reach your Plashboard", "Retrying… (" + e.message + ")");
    }
  }
}

if (!slug) {
  message("No dashboard link", "Open a link that looks like /d/your-link-id");
} else {
  // Show cached copy instantly while we fetch the latest.
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    if (cached) show(cached);
  } catch {}
  load();
  if (pollSec > 0) setInterval(load, Math.max(5, pollSec) * 1000);
  // Reload immediately when the Mac wakes or the page becomes visible again.
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && load());
  window.addEventListener("online", load);
  // Live preview from the editor in another tab of the same browser.
  try {
    const bc = new BroadcastChannel("plashboard");
    bc.onmessage = (e) => e.data && e.data.slug === slug && e.data.doc && show(e.data.doc);
  } catch {}
}
