// Small UI toolkit for the Plashboard app (no framework).
export { h } from "./render.js";
import { h } from "./render.js";

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: body !== undefined ? { "content-type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- toast ----------
let toastHost;
export function toast(msg, kind = "info", ms = 2600) {
  if (!toastHost) {
    toastHost = h("div", { class: "toasts" });
    document.body.append(toastHost);
  }
  const t = h("div", { class: "toast " + kind }, msg);
  toastHost.append(t);
  requestAnimationFrame(() => t.classList.add("in"));
  setTimeout(() => {
    t.classList.remove("in");
    setTimeout(() => t.remove(), 300);
  }, ms);
}

// ---------- modal ----------
export function modal({ title, body, actions = [], wide = false, onClose } = {}) {
  const close = () => {
    back.classList.remove("in");
    setTimeout(() => back.remove(), 180);
    document.removeEventListener("keydown", onKey);
    onClose && onClose();
  };
  const onKey = (e) => e.key === "Escape" && close();
  const footer = actions.length
    ? h(
        "div",
        { class: "modal-actions" },
        actions.map((a) =>
          h(
            "button",
            {
              class: "btn " + (a.kind || ""),
              onclick: async () => {
                if (a.onClick) {
                  const r = await a.onClick();
                  if (r === false) return;
                }
                close();
              },
            },
            a.label
          )
        )
      )
    : null;
  const box = h(
    "div",
    { class: "modal" + (wide ? " wide" : ""), role: "dialog", "aria-modal": "true" },
    h("div", { class: "modal-head" }, h("h2", {}, title || ""), h("button", { class: "icon-btn", "aria-label": "Close", onclick: close }, "✕")),
    h("div", { class: "modal-body" }, body),
    footer
  );
  const back = h("div", { class: "modal-back", onmousedown: (e) => e.target === back && close() }, box);
  document.body.append(back);
  document.addEventListener("keydown", onKey);
  requestAnimationFrame(() => back.classList.add("in"));
  setTimeout(() => box.querySelector("input, textarea, select")?.focus(), 50);
  return { close, box };
}

export function confirmDialog(title, text, { ok = "OK", danger = false } = {}) {
  return new Promise((resolve) => {
    let done = false;
    modal({
      title,
      body: h("p", { class: "muted" }, text),
      actions: [
        { label: "Cancel", kind: "ghost" },
        {
          label: ok,
          kind: danger ? "danger" : "primary",
          onClick: () => {
            done = true;
            resolve(true);
          },
        },
      ],
      onClose: () => !done && resolve(false),
    });
  });
}

export function promptDialog(title, value = "", { ok = "Save", placeholder = "" } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const input = h("input", { class: "input", value, placeholder });
    const m = modal({
      title,
      body: input,
      actions: [
        { label: "Cancel", kind: "ghost" },
        {
          label: ok,
          kind: "primary",
          onClick: () => {
            done = true;
            resolve(input.value);
          },
        },
      ],
      onClose: () => !done && resolve(null),
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        done = true;
        resolve(input.value);
        m.close();
      }
    });
    setTimeout(() => input.select(), 60);
  });
}

// ---------- uploads ----------

function readAsDataUrl(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}

async function compressImage(file, maxDim = 2880) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return file; // keep gifs/svg/avif as-is
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise((res) => c.toBlob(res, type, 0.86));
    return blob && blob.size < file.size ? blob : file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadFile(file) {
  const isVideo = file.type.startsWith("video/");
  const blob = isVideo ? file : await compressImage(file);
  if (blob.size > 8 * 1024 * 1024) throw new Error("That file is over 8 MB. Try a smaller one, or paste a link to it instead.");
  const dataUrl = await readAsDataUrl(blob);
  const r = await api("/assets", { method: "POST", body: { dataUrl } });
  return r.url;
}

export function pickFiles({ accept = "image/*", multiple = false } = {}) {
  return new Promise((resolve) => {
    const input = h("input", { type: "file", accept, multiple, style: { display: "none" } });
    input.onchange = () => {
      resolve([...input.files]);
      input.remove();
    };
    document.body.append(input);
    input.click();
  });
}

export function copyText(text) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  fallbackCopy(text);
  return Promise.resolve();
}
function fallbackCopy(text) {
  const ta = h("textarea", { style: { position: "fixed", opacity: 0 } });
  ta.value = text;
  document.body.append(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

export function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return m + " min ago";
  const hr = Math.round(m / 60);
  if (hr < 24) return hr + " hr ago";
  const d = Math.round(hr / 24);
  if (d < 30) return d + (d === 1 ? " day ago" : " days ago");
  return new Date(ts).toLocaleDateString();
}

export function debounce(fn, ms) {
  let t;
  const d = (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
  d.flush = (...a) => {
    clearTimeout(t);
    return fn(...a);
  };
  d.cancel = () => clearTimeout(t);
  return d;
}

export function dashUrl(slug) {
  return location.origin + "/d/" + slug;
}
