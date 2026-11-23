// Plashboard editor.
import { api, h, modal, toast, confirmDialog, copyText, debounce, uploadFile, pickFiles, dashUrl } from "./ui.js";
import {
  renderDashboard,
  WIDGETS,
  WIDGET_GROUPS,
  THEMES,
  FONTS,
  applyTheme,
  gradientCss,
  aspectRatio,
  newWidget,
  uid,
  loadFont,
  defaultSettings,
} from "./render.js";

// Extra one-click presets shown in the "Add" palette.
const PRESETS = [
  { label: "Greeting", icon: "👋", type: "text", over: { w: 50, h: 12, props: { text: "{greeting}, friend." }, style: { size: 56, weight: 700 } } },
  {
    label: "Sticky note",
    icon: "🗒",
    type: "text",
    over: {
      w: 18,
      h: 24,
      rot: -3,
      props: { text: "Remember:\n• call mom\n• water plants" },
      style: { size: 28, font: "Caveat", color: "#3b2f00", bg: "#ffe680", align: "left", valign: "top", padding: 22, radius: 6, shadow: 30, blur: 0 },
    },
  },
  { label: "Emoji / icon", icon: "✨", type: "text", over: { w: 10, h: 16, props: { text: "🌙" }, style: { size: 140 } } },
  { label: "Year progress", icon: "📈", type: "progress", over: { props: { mode: "year" } } },
  { label: "Glow blob", icon: "🫧", type: "shape", over: { w: 30, h: 46, props: { kind: "blob", fill: "#ff3cac", fill2: "#784ba0" } } },
  { label: "Glass panel", icon: "▢", type: "shape", over: { w: 30, h: 30, props: { kind: "rect", fill: "rgba(255,255,255,0.08)" }, style: { radius: 28, blur: 18, borderWidth: 1, borderColor: "rgba(255,255,255,.18)" } } },
  { label: "Spotify / YouTube", icon: "🎵", type: "embed", over: { w: 30, h: 22, props: { url: "" } } },
];

const STYLE_GROUPS = [
  {
    title: "Text",
    open: true,
    fields: [
      { key: "font", label: "Font", type: "font" },
      { key: "size", label: "Size", type: "range", min: 6, max: 400, def: 24 },
      {
        key: "weight",
        label: "Weight",
        type: "select",
        options: [["", "Default"], ...[100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => [String(n), String(n)])],
      },
      { key: "color", label: "Color", type: "color", placeholder: "Theme text color" },
      { key: "align", label: "Align", type: "seg", options: [["left", "Left"], ["center", "Center"], ["right", "Right"]], def: "center" },
      { key: "valign", label: "Vertical", type: "seg", options: [["top", "Top"], ["middle", "Middle"], ["bottom", "Bottom"]], def: "middle" },
      { key: "italic", label: "Italic", type: "toggle" },
      { key: "uppercase", label: "UPPERCASE", type: "toggle" },
      { key: "letterSpacing", label: "Letter spacing", type: "range", min: -20, max: 60, def: 0 },
      { key: "lineHeight", label: "Line height %", type: "range", min: 60, max: 250, def: 115 },
    ],
  },
  {
    title: "Box",
    fields: [
      { key: "card", label: "Glass card (follows theme)", type: "toggle" },
      { key: "bg", label: "Background", type: "color", placeholder: "None" },
      { key: "bg2", label: "Gradient to", type: "color", placeholder: "No gradient" },
      { key: "bgAngle", label: "Gradient angle", type: "range", min: 0, max: 360, def: 135, showIf: (s) => s.bg && s.bg2 },
      { key: "blur", label: "Background blur", type: "range", min: 0, max: 60, def: 0, help: "Frosted-glass blur of what's behind." },
      { key: "radius", label: "Corner radius", type: "range", min: 0, max: 200, def: 0 },
      { key: "padding", label: "Padding", type: "range", min: 0, max: 120, def: 0 },
      { key: "borderWidth", label: "Border", type: "range", min: 0, max: 20, def: 0 },
      { key: "borderColor", label: "Border color", type: "color", showIf: (s) => s.borderWidth > 0 },
    ],
  },
  {
    title: "Effects",
    fields: [
      { key: "opacity", label: "Opacity", type: "range", min: 0, max: 100, def: 100 },
      { key: "shadow", label: "Box shadow", type: "range", min: 0, max: 80, def: 0 },
      { key: "textShadow", label: "Text shadow", type: "range", min: 0, max: 40, def: 0 },
      { key: "glow", label: "Neon glow", type: "range", min: 0, max: 60, def: 0 },
      { key: "className", label: "CSS class (for custom CSS)", type: "text" },
    ],
  },
];

const ASPECTS = [
  ["16:10", "16:10 — most MacBooks & iMacs"],
  ["1512:982", "MacBook Pro 14″ (notch)"],
  ["1728:1117", "MacBook Pro 16″ (notch)"],
  ["1470:956", "MacBook Air (notch)"],
  ["16:9", "16:9 — most external displays"],
  ["64:27", "21:9 — ultrawide"],
  ["32:9", "32:9 — super ultrawide"],
  ["3:2", "3:2"],
  ["4:3", "4:3"],
  ["9:16", "Portrait (vertical monitor)"],
  ["screen", "Match this screen"],
];

export function openEditor(host, id, { onExit }) {
  let doc = null;
  let ctrl = null;
  let sel = null; // selected widget id
  let clipboard = null;
  let history = [];
  let future = [];
  let lastSnap = "";
  let destroyed = false;
  let editingText = null;
  let bc = null;
  try {
    bc = new BroadcastChannel("plashboard");
  } catch {}

  // ---------- layout ----------
  const nameInput = h("input", { class: "name", spellcheck: "false", "aria-label": "Dashboard name" });
  const saveState = h("span", { class: "save-state" }, "");
  const undoBtn = h("button", { class: "icon-btn", title: "Undo (⌘Z)", onclick: () => undo() }, "↶");
  const redoBtn = h("button", { class: "icon-btn", title: "Redo (⇧⌘Z)", onclick: () => redo() }, "↷");
  const top = h(
    "div",
    { class: "ed-top" },
    h("button", { class: "btn ghost sm", onclick: () => exit() }, "← Dashboards"),
    nameInput,
    saveState,
    h("div", { class: "grow" }),
    undoBtn,
    redoBtn,
    h("button", { class: "btn sm hide-sm", onclick: () => select(null) }, "⚙ Dashboard settings"),
    h("button", { class: "btn sm hide-sm", onclick: () => preview() }, "▶ Preview"),
    h("button", { class: "btn primary sm", onclick: () => share() }, "Get Plash link")
  );
  const left = h("aside", { class: "ed-left" });
  const right = h("aside", { class: "ed-right" });
  const stage = h("main", { class: "ed-stage" });
  const frame = h("div", { class: "frame" });
  const overlay = h("div", { style: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 40 } });
  const hint = h("div", { class: "stage-hint" }, "Click to select · drag to move · double-click text to edit · drop or paste images");
  stage.append(frame, hint);
  const root = h("div", { class: "editor" }, top, left, stage, right);
  host.append(root);

  // ---------- load ----------
  api("/dashboards/" + id)
    .then((r) => {
      if (destroyed) return;
      doc = r.dashboard;
      doc.settings = { ...defaultSettings(doc.settings?.theme || "midnight"), ...(doc.settings || {}) };
      doc.widgets = doc.widgets || [];
      lastSnap = snapshot();
      nameInput.value = doc.name;
      ctrl = renderDashboard(frame, doc, { mode: "edit", dashKey: doc.slug });
      frame.append(overlay);
      fit();
      renderLeft();
      renderRight();
      setSaved("Saved");
      document.title = doc.name + " — Plashboard";
    })
    .catch((e) => {
      if (e.status === 401) return location.replace("/");
      stage.innerHTML = "";
      stage.append(h("div", { class: "empty-state" }, e.message, h("br"), h("a", { href: "#/" }, "Back to dashboards")));
    });

  // ---------- geometry ----------
  function fit() {
    if (!doc) return;
    const pad = 36;
    const sw = stage.clientWidth - pad * 2;
    const sh = stage.clientHeight - pad * 2 - 20;
    const r = aspectRatio(doc.settings);
    let fw = sw,
      fh = sw / r;
    if (fh > sh) (fh = sh), (fw = sh * r);
    frame.style.width = fw + "px";
    frame.style.height = fh + "px";
    frame.style.left = (stage.clientWidth - fw) / 2 + "px";
    frame.style.top = (stage.clientHeight - fh) / 2 - 10 + "px";
    drawOverlay();
  }
  const ro = new ResizeObserver(fit);
  ro.observe(stage);

  const byId = (wid) => doc.widgets.find((w) => w.id === wid);
  const selected = () => (sel ? byId(sel) : null);

  // ---------- change pipeline ----------
  function snapshot() {
    return JSON.stringify({ name: doc.name, settings: doc.settings, widgets: doc.widgets });
  }

  function refresh() {
    ctrl && ctrl.update(doc);
    drawOverlay();
    broadcast();
  }

  // Immediate visual update + debounced history/save.
  function change({ panel = false, layers = false } = {}) {
    refresh();
    commitSoon();
    if (panel) renderRight();
    if (layers) renderLayers();
  }

  function commit() {
    commitSoon.cancel();
    const snap = snapshot();
    if (snap === lastSnap) return;
    history.push(lastSnap);
    if (history.length > 200) history.shift();
    future = [];
    lastSnap = snap;
    updateUndo();
    save();
  }
  const commitSoon = debounce(commit, 450);

  function restore(snap) {
    const s = JSON.parse(snap);
    doc.name = s.name;
    doc.settings = s.settings;
    doc.widgets = s.widgets;
    nameInput.value = doc.name;
    lastSnap = snap;
    if (sel && !byId(sel)) sel = null;
    refresh();
    fit();
    renderLeft();
    renderRight();
    updateUndo();
    save();
  }
  function undo() {
    commit();
    if (!history.length) return;
    future.push(lastSnap);
    restore(history.pop());
  }
  function redo() {
    if (!future.length) return;
    history.push(lastSnap);
    restore(future.pop());
  }
  function updateUndo() {
    undoBtn.disabled = !history.length;
    redoBtn.disabled = !future.length;
    undoBtn.style.opacity = history.length ? 1 : 0.35;
    redoBtn.style.opacity = future.length ? 1 : 0.35;
  }

  let saving = false;
  let pendingSave = false;
  function setSaved(text, err) {
    saveState.textContent = text;
    saveState.classList.toggle("err", !!err);
  }
  const save = debounce(async () => {
    if (!doc) return;
    if (saving) {
      pendingSave = true;
      return;
    }
    saving = true;
    setSaved("Saving…");
    try {
      const r = await api("/dashboards/" + doc.id, {
        method: "PUT",
        body: { dashboard: { name: doc.name, settings: doc.settings, widgets: doc.widgets } },
      });
      doc.updatedAt = r.dashboard.updatedAt;
      setSaved("Saved");
    } catch (e) {
      setSaved("Not saved — " + e.message, true);
      if (e.status !== 413 && e.status !== 401) setTimeout(() => save(), 4000);
    } finally {
      saving = false;
      if (pendingSave) {
        pendingSave = false;
        save();
      }
    }
  }, 600);

  function broadcast() {
    if (!bc || !doc) return;
    try {
      bc.postMessage({ slug: doc.slug, doc: { ...JSON.parse(JSON.stringify(doc)), owner: undefined, updatedAt: Date.now() } });
    } catch {}
  }

  nameInput.addEventListener("input", () => {
    doc.name = nameInput.value || "Untitled";
    document.title = doc.name + " — Plashboard";
    commitSoon();
  });
  nameInput.addEventListener("keydown", (e) => e.key === "Enter" && nameInput.blur());

  // ---------- selection overlay ----------
  function drawOverlay() {
    overlay.innerHTML = "";
    const w = selected();
    if (!w || w.hidden) return;
    const box = h(
      "div",
      {
        class: "sel-box" + (w.locked ? " locked" : ""),
        style: {
          left: w.x + "%",
          top: w.y + "%",
          width: w.w + "%",
          height: w.h + "%",
          transform: w.rot ? `rotate(${w.rot}deg)` : "",
        },
      },
      h("div", { class: "tag" }, (w.locked ? "🔒 " : "") + widgetLabel(w))
    );
    for (const d of ["nw", "n", "ne", "e", "se", "s", "sw", "w"]) box.append(h("div", { class: "hd", "data-h": d }));
    overlay.append(box);
  }

  function showGuides(gx, gy) {
    overlay.querySelectorAll(".guide").forEach((g) => g.remove());
    if (gx != null) overlay.append(h("div", { class: "guide v", style: { left: gx + "%" } }));
    if (gy != null) overlay.append(h("div", { class: "guide h", style: { top: gy + "%" } }));
  }

  function select(wid) {
    if (editingText) finishTextEdit();
    sel = wid;
    drawOverlay();
    renderRight();
    renderLayers();
  }

  // ---------- pointer interactions ----------
  function snapTargets(exclude) {
    const xs = [0, 50, 100],
      ys = [0, 50, 100];
    for (const o of doc.widgets) {
      if (o.id === exclude || o.hidden) continue;
      xs.push(o.x, o.x + o.w / 2, o.x + o.w);
      ys.push(o.y, o.y + o.h / 2, o.y + o.h);
    }
    return { xs, ys };
  }
  function bestSnap(values, targets, thr) {
    let best = null;
    for (const v of values)
      for (const t of targets) {
        const d = t - v;
        if (Math.abs(d) <= thr && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, t };
      }
    return best;
  }

  frame.addEventListener("pointerdown", (e) => {
    if (!doc || e.button !== 0) return;
    if (editingText && editingText.contains(e.target)) return;
    const rect = frame.getBoundingClientRect();
    const handle = e.target.closest(".hd");
    const wEl = e.target.closest(".pb-w");
    let w;
    if (handle) w = selected();
    else if (wEl) w = byId(wEl.dataset.id);
    if (!w) {
      select(null);
      return;
    }
    if (sel !== w.id) select(w.id);
    if (w.locked) return;
    e.preventDefault();
    frame.setPointerCapture(e.pointerId);
    const sx = e.clientX,
      sy = e.clientY;
    const orig = { x: w.x, y: w.y, w: w.w, h: w.h };
    const dir = handle ? handle.dataset.h : null;
    const targets = snapTargets(w.id);
    const thrX = (6 / rect.width) * 100;
    const thrY = (6 / rect.height) * 100;
    const ratio = (orig.w * rect.width) / (orig.h * rect.height);
    let moved = false;

    const onMove = (ev) => {
      const dx = ((ev.clientX - sx) / rect.width) * 100;
      const dy = ((ev.clientY - sy) / rect.height) * 100;
      if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 3) return;
      moved = true;
      const snap = doc.settings.snap !== false && !ev.altKey;
      let gx = null,
        gy = null;
      if (!dir) {
        let nx = orig.x + dx,
          ny = orig.y + dy;
        if (snap) {
          const bx = bestSnap([nx, nx + w.w / 2, nx + w.w], targets.xs, thrX);
          const by = bestSnap([ny, ny + w.h / 2, ny + w.h], targets.ys, thrY);
          if (bx) (nx += bx.d), (gx = bx.t);
          if (by) (ny += by.d), (gy = by.t);
        }
        w.x = round(nx);
        w.y = round(ny);
      } else {
        let { x, y, w: ww, h: hh } = orig;
        if (dir.includes("e")) ww = orig.w + dx;
        if (dir.includes("s")) hh = orig.h + dy;
        if (dir.includes("w")) (x = orig.x + dx), (ww = orig.w - dx);
        if (dir.includes("n")) (y = orig.y + dy), (hh = orig.h - dy);
        if (snap) {
          if (dir.includes("e")) {
            const b = bestSnap([x + ww], targets.xs, thrX);
            if (b) (ww += b.d), (gx = b.t);
          }
          if (dir.includes("w")) {
            const b = bestSnap([x], targets.xs, thrX);
            if (b) (x += b.d), (ww -= b.d), (gx = b.t);
          }
          if (dir.includes("s")) {
            const b = bestSnap([y + hh], targets.ys, thrY);
            if (b) (hh += b.d), (gy = b.t);
          }
          if (dir.includes("n")) {
            const b = bestSnap([y], targets.ys, thrY);
            if (b) (y += b.d), (hh -= b.d), (gy = b.t);
          }
        }
        if (ev.shiftKey && dir.length === 2) {
          // keep proportions
          const hFromW = (ww * rect.width) / ratio / rect.height;
          if (dir.includes("n")) y += hh - hFromW;
          hh = hFromW;
          gx = gy = null;
        }
        if (ww < 1) {
          if (dir.includes("w")) x -= 1 - ww;
          ww = 1;
        }
        if (hh < 1) {
          if (dir.includes("n")) y -= 1 - hh;
          hh = 1;
        }
        Object.assign(w, { x: round(x), y: round(y), w: round(ww), h: round(hh) });
      }
      refresh();
      showGuides(gx, gy);
    };
    const onUp = () => {
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerup", onUp);
      frame.removeEventListener("pointercancel", onUp);
      showGuides(null, null);
      if (moved) {
        commit();
        renderRight();
      }
    };
    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerup", onUp);
    frame.addEventListener("pointercancel", onUp);
  });

  // Double-click text to edit inline
  frame.addEventListener("dblclick", (e) => {
    // Pointer capture retargets the event to the frame, so hit-test the point.
    const wEl = document.elementsFromPoint(e.clientX, e.clientY).map((el) => el.closest(".pb-w")).find(Boolean);
    const w = wEl && byId(wEl.dataset.id);
    if (!w || w.locked) return;
    if (w.type !== "text") {
      // focus the first field in the inspector
      right.querySelector("input:not([type=checkbox]), textarea")?.focus();
      return;
    }
    const box = wEl.querySelector(".pb-text");
    if (!box) return;
    editingText = box;
    box.textContent = w.props.text || "";
    box.contentEditable = "plaintext-only";
    if (box.contentEditable !== "plaintext-only") box.contentEditable = "true";
    box.classList.add("inline-edit");
    box.focus();
    const range = document.createRange();
    range.selectNodeContents(box);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    box.addEventListener("blur", finishTextEdit, { once: true });
    box.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" || (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey))) {
        ev.preventDefault();
        box.blur();
      }
    });
  });

  function finishTextEdit() {
    const box = editingText;
    if (!box) return;
    editingText = null;
    const wEl = box.closest(".pb-w");
    const w = wEl && byId(wEl.dataset.id);
    box.contentEditable = "false";
    box.classList.remove("inline-edit");
    if (w) {
      w.props.text = box.innerText.replace(/\n$/, "");
      ctrl.remount();
      change({ panel: true, layers: true });
    }
  }

  // ---------- keyboard ----------
  function onKey(e) {
    if (!doc) return;
    const t = e.target;
    const typing = t.closest && (t.closest("input, textarea, select, [contenteditable=true], [contenteditable=plaintext-only]") || t.isContentEditable);
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "z" && !typing) {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
      return;
    }
    if (mod && e.key.toLowerCase() === "y" && !typing) {
      e.preventDefault();
      redo();
      return;
    }
    if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      commit();
      save.flush();
      return;
    }
    if (typing) return;
    const w = selected();
    if (e.key === "Escape") return select(null);
    if (!w) return;
    if (mod && e.key.toLowerCase() === "d") {
      e.preventDefault();
      duplicate(w);
    } else if (mod && e.key.toLowerCase() === "c") {
      clipboard = JSON.stringify(w);
    } else if (mod && e.key.toLowerCase() === "x") {
      clipboard = JSON.stringify(w);
      removeWidget(w);
    } else if ((e.key === "Delete" || e.key === "Backspace") && !w.locked) {
      e.preventDefault();
      removeWidget(w);
    } else if (e.key.startsWith("Arrow") && !w.locked) {
      e.preventDefault();
      const step = e.shiftKey ? 2 : 0.25;
      if (e.key === "ArrowLeft") w.x = round(w.x - step);
      if (e.key === "ArrowRight") w.x = round(w.x + step);
      if (e.key === "ArrowUp") w.y = round(w.y - step);
      if (e.key === "ArrowDown") w.y = round(w.y + step);
      change();
    }
  }
  function onKeyPaste(e) {
    if (!doc) return;
    const t = e.target;
    if (t.closest && t.closest("input, textarea, [contenteditable]")) return;
    const files = [...(e.clipboardData?.files || [])].filter((f) => /^image\//.test(f.type));
    if (files.length) {
      e.preventDefault();
      files.forEach((f) => addImageFile(f));
      return;
    }
    const text = e.clipboardData?.getData("text") || "";
    if (/^https?:\/\/\S+\.(png|jpe?g|gif|webp|svg|avif)(\?\S*)?$/i.test(text.trim())) {
      e.preventDefault();
      addWidget("image", { props: { src: text.trim() } });
      return;
    }
    if (/^https?:\/\/\S+$/.test(text.trim())) {
      e.preventDefault();
      addWidget("embed", { props: { url: text.trim() } });
      toast("Added the link as a web page embed");
      return;
    }
    if (clipboard) {
      e.preventDefault();
      const w = JSON.parse(clipboard);
      w.id = uid();
      w.x = round(w.x + 2);
      w.y = round(w.y + 2);
      w.z = maxZ() + 1;
      doc.widgets.push(w);
      clipboard = JSON.stringify(w);
      select(w.id);
      change({ layers: true });
    }
  }
  document.addEventListener("keydown", onKey);
  document.addEventListener("paste", onKeyPaste);

  // drag & drop images onto the canvas
  stage.addEventListener("dragover", (e) => {
    if ([...(e.dataTransfer?.items || [])].some((i) => i.kind === "file")) e.preventDefault();
  });
  stage.addEventListener("drop", (e) => {
    const files = [...(e.dataTransfer?.files || [])].filter((f) => /^(image|video)\//.test(f.type));
    if (!files.length) return;
    e.preventDefault();
    const rect = frame.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    files.forEach((f, i) => addImageFile(f, { x: px + i * 2, y: py + i * 2 }));
  });

  async function addImageFile(file, at) {
    const isVideo = file.type.startsWith("video/");
    toast("Uploading " + (file.name || "image") + "…");
    try {
      const url = await uploadFile(file);
      const w = addWidget(isVideo ? "video" : "image", { props: { src: url } }, at);
      if (!isVideo) {
        // match the image's aspect ratio
        const img = new Image();
        img.onload = () => {
          const rect = frame.getBoundingClientRect();
          const ar = img.naturalWidth / img.naturalHeight;
          w.h = round(((w.w / 100) * rect.width) / ar / rect.height * 100);
          change();
        };
        img.src = url;
      }
    } catch (e) {
      toast(e.message, "error", 5000);
    }
  }

  // ---------- widget ops ----------
  function maxZ() {
    return doc.widgets.reduce((m, w) => Math.max(m, w.z || 0), 0);
  }
  function minZ() {
    return doc.widgets.reduce((m, w) => Math.min(m, w.z || 0), 0);
  }
  function addWidget(type, over = {}, at) {
    const w = newWidget(type, over);
    if (over.w) w.w = over.w;
    if (over.h) w.h = over.h;
    if (at) {
      w.x = round(at.x - w.w / 2);
      w.y = round(at.y - w.h / 2);
    } else {
      // cascade new widgets so they don't stack exactly
      const n = doc.widgets.filter((o) => Math.abs(o.x - (50 - w.w / 2)) < 0.01).length;
      w.x = round(50 - w.w / 2 + n * 2);
      w.y = round(50 - w.h / 2 + n * 2);
    }
    w.z = maxZ() + 1;
    doc.widgets.push(w);
    select(w.id);
    change({ layers: true });
    return w;
  }
  function duplicate(w) {
    const c = JSON.parse(JSON.stringify(w));
    c.id = uid();
    c.x = round(c.x + 2);
    c.y = round(c.y + 2);
    c.z = maxZ() + 1;
    c.locked = false;
    doc.widgets.push(c);
    select(c.id);
    change({ layers: true });
  }
  function removeWidget(w) {
    doc.widgets = doc.widgets.filter((o) => o.id !== w.id);
    sel = null;
    refresh();
    commit();
    renderRight();
    renderLayers();
  }

  function widgetLabel(w) {
    if (w.name) return w.name;
    const t = WIDGETS[w.type];
    let label = t ? t.label : w.type;
    if (w.type === "text" && w.props.text) label = w.props.text.split("\n")[0].slice(0, 24);
    if (w.type === "countdown" && w.props.title) label = "⏳ " + w.props.title;
    if (w.type === "clock" && w.props.label) label = "Clock · " + w.props.label;
    return label;
  }

  // ---------- left panel ----------
  const layersList = h("ul", { class: "layers" });
  function renderLeft() {
    left.innerHTML = "";
    const add = h("div", { class: "sec" }, h("h3", {}, "Add"));
    for (const g of WIDGET_GROUPS) {
      const items = Object.entries(WIDGETS).filter(([, t]) => t.group === g);
      if (!items.length) continue;
      add.append(h("div", { class: "palette-group" }, g));
      add.append(
        h(
          "div",
          { class: "palette" },
          items.map(([type, t]) => h("button", { onclick: () => addWidget(type), title: "Add " + t.label }, h("i", {}, t.icon), t.label))
        )
      );
    }
    add.append(h("div", { class: "palette-group" }, "Presets"));
    add.append(
      h(
        "div",
        { class: "palette" },
        PRESETS.map((p) => h("button", { onclick: () => addWidget(p.type, structuredClone(p.over)) }, h("i", {}, p.icon), p.label))
      )
    );
    const layers = h("div", { class: "sec" }, h("h3", {}, "Layers"), layersList);
    left.append(add, layers);
    renderLayers();
  }

  function renderLayers() {
    if (!doc) return;
    layersList.innerHTML = "";
    const list = doc.widgets.map((w, i) => ({ w, i })).sort((a, b) => (b.w.z || 0) - (a.w.z || 0) || b.i - a.i);
    if (!list.length) layersList.append(h("li", { class: "muted", style: { cursor: "default" } }, "Nothing here yet — add something above."));
    for (const { w } of list) {
      const li = h(
        "li",
        { class: w.id === sel ? "sel" : "", onclick: () => select(w.id) },
        h("i", {}, WIDGETS[w.type]?.icon || "?"),
        h("span", { class: "nm", style: { opacity: w.hidden ? 0.45 : 1 } }, widgetLabel(w)),
        h(
          "button",
          {
            class: "icon-btn" + (w.locked ? " on" : ""),
            title: w.locked ? "Unlock" : "Lock",
            onclick: (e) => {
              e.stopPropagation();
              w.locked = !w.locked;
              change({ layers: true, panel: w.id === sel });
            },
          },
          w.locked ? "🔒" : "🔓"
        ),
        h(
          "button",
          {
            class: "icon-btn",
            title: w.hidden ? "Show" : "Hide",
            onclick: (e) => {
              e.stopPropagation();
              w.hidden = !w.hidden;
              change({ layers: true });
            },
          },
          w.hidden ? "◌" : "◉"
        )
      );
      layersList.append(li);
    }
  }

  // ---------- right panel (inspector) ----------
  function renderRight() {
    if (!doc) return;
    const scroll = right.scrollTop;
    const openState = {};
    right.querySelectorAll("details[data-k]").forEach((d) => (openState[d.dataset.k] = d.open));
    right.innerHTML = "";
    const w = selected();
    if (w) widgetPanel(w, openState);
    else settingsPanel(openState);
    right.scrollTop = scroll;
  }

  function section(title, children, { key, open = true, openState = {} } = {}) {
    const k = key || title;
    const d = h("details", { class: "sec", "data-k": k }, h("summary", {}, title), children);
    d.open = k in openState ? openState[k] : open;
    return d;
  }

  function widgetPanel(w, openState) {
    const type = WIDGETS[w.type];
    const head = h(
      "div",
      { class: "sec" },
      h(
        "h3",
        {},
        h("span", {}, (type?.icon || "") + "  " + (type?.label || w.type)),
        h("button", { class: "icon-btn", title: "Deselect (Esc)", onclick: () => select(null) }, "✕")
      ),
      type?.note ? h("div", { class: "note" }, type.note) : null
    );
    right.append(head);

    // content props
    const content = h("div");
    for (const f of type?.fields || []) {
      if (f.showIf && !f.showIf(w.props)) continue;
      content.append(fieldEl(f, w.props, { onChange: (discrete) => (ctrlRemountIfNeeded(), change({ panel: discrete, layers: true })) }));
    }
    if ((type?.fields || []).length) right.append(section("Content", content, { openState }));

    // style groups
    for (const g of STYLE_GROUPS) {
      const box = h("div");
      for (const f of g.fields) {
        if (f.showIf && !f.showIf(w.style)) continue;
        box.append(fieldEl(f, w.style, { onChange: (discrete) => change({ panel: discrete }) }));
      }
      right.append(section(g.title, box, { open: !!g.open, openState }));
    }

    // arrange
    const num = (key, label, step = 0.5) =>
      h(
        "label",
        { class: "field" },
        h("span", {}, label),
        h("input", {
          class: "input",
          type: "number",
          step,
          value: w[key] ?? 0,
          oninput: (e) => {
            w[key] = Number(e.target.value) || 0;
            change();
          },
        })
      );
    const arrange = h(
      "div",
      {},
      h("div", { class: "grid2" }, num("x", "X %"), num("y", "Y %"), num("w", "Width %"), num("h", "Height %")),
      fieldEl({ key: "rot", label: "Rotation°", type: "range", min: -180, max: 180, def: 0 }, w, { onChange: () => change() }),
      h(
        "div",
        { class: "grid4", style: { marginBottom: "10px" } },
        h("button", { class: "btn sm", title: "Bring to front", onclick: () => ((w.z = maxZ() + 1), change({ layers: true })) }, "⤒"),
        h("button", { class: "btn sm", title: "Forward", onclick: () => ((w.z = (w.z || 0) + 1), change({ layers: true })) }, "↑"),
        h("button", { class: "btn sm", title: "Backward", onclick: () => ((w.z = (w.z || 0) - 1), change({ layers: true })) }, "↓"),
        h("button", { class: "btn sm", title: "Send to back", onclick: () => ((w.z = minZ() - 1), change({ layers: true })) }, "⤓")
      ),
      h(
        "div",
        { class: "grid2", style: { marginBottom: "10px" } },
        h("button", { class: "btn sm", onclick: () => ((w.x = round(50 - w.w / 2)), change({ panel: true })) }, "Center ↔"),
        h("button", { class: "btn sm", onclick: () => ((w.y = round(50 - w.h / 2)), change({ panel: true })) }, "Center ↕")
      ),
      h(
        "div",
        { class: "grid2", style: { marginBottom: "10px" } },
        h("button", { class: "btn sm", onclick: () => ((w.x = 0), (w.y = 0), (w.w = 100), (w.h = 100), change({ panel: true })) }, "Fill screen"),
        h("button", { class: "btn sm", onclick: () => ((w.locked = !w.locked), change({ panel: true, layers: true })) }, w.locked ? "🔒 Unlock" : "🔓 Lock")
      ),
      fieldEl({ key: "name", label: "Layer name", type: "text" }, w, { onChange: () => change({ layers: true }) }),
      h(
        "div",
        { class: "grid2", style: { marginBottom: "14px" } },
        h("button", { class: "btn sm", onclick: () => duplicate(w) }, "Duplicate"),
        h("button", { class: "btn sm danger", onclick: () => removeWidget(w) }, "Delete")
      )
    );
    right.append(section("Arrange", arrange, { openState }));
  }

  function ctrlRemountIfNeeded() {
    /* renderer diffing handles prop changes */
  }

  function settingsPanel(openState) {
    const s = doc.settings;
    const onChange = (discrete) => change({ panel: discrete });

    right.append(h("div", { class: "sec" }, h("h3", {}, "Dashboard settings"), h("p", { class: "help", style: { marginTop: "-4px", marginBottom: "12px" } }, "Select something on the canvas to edit it. These settings apply to the whole dashboard.")));

    // themes
    const themes = h("div", { class: "themes" });
    for (const [k, t] of Object.entries(THEMES)) {
      loadFont(t.font);
      const bg = t.background.type === "gradient" ? gradientCss(t.background.gradient) : t.background.color;
      themes.append(
        h(
          "button",
          {
            class: s.theme === k ? "on" : "",
            style: { background: bg, color: t.textColor, fontFamily: `"${t.font}"` },
            title: t.label,
            onclick: () => {
              applyTheme(s, k);
              change({ panel: true });
            },
          },
          h("span", {}, t.label)
        )
      );
    }
    right.append(section("Theme", h("div", {}, themes, h("p", { class: "help", style: { marginBottom: "12px" } }, "A theme sets the background, font and colors. Anything you style by hand on a widget stays as you set it.")), { openState }));

    // background
    const bg = s.background || (s.background = { type: "color", color: "#111" });
    const bgBox = h("div");
    bgBox.append(
      fieldEl(
        {
          key: "type",
          label: "Type",
          type: "seg",
          options: [
            ["color", "Color"],
            ["gradient", "Gradient"],
            ["image", "Image"],
            ["video", "Video"],
            ["embed", "Web"],
          ],
        },
        bg,
        {
          onChange: () => {
            if (bg.type === "gradient" && !bg.gradient) bg.gradient = { kind: "linear", from: "#1e3c72", to: "#2a5298", angle: 135 };
            onChange(true);
          },
        }
      )
    );
    if (bg.type === "color") bgBox.append(fieldEl({ key: "color", label: "Color", type: "color" }, bg, { onChange }));
    if (bg.type === "gradient") {
      const g = bg.gradient || (bg.gradient = { kind: "linear", from: "#1e3c72", to: "#2a5298", angle: 135 });
      bgBox.append(
        fieldEl({ key: "kind", label: "Style", type: "seg", options: [["linear", "Linear"], ["radial", "Radial"], ["conic", "Conic"]] }, g, { onChange }),
        h(
          "div",
          { class: "grid2" },
          fieldEl({ key: "from", label: "From", type: "color" }, g, { onChange }),
          fieldEl({ key: "to", label: "To", type: "color" }, g, { onChange })
        ),
        fieldEl({ key: "via", label: "Middle color (optional)", type: "color", placeholder: "None" }, g, { onChange }),
        g.kind !== "radial" ? fieldEl({ key: "angle", label: "Angle", type: "range", min: 0, max: 360, def: 135 }, g, { onChange }) : null,
        fieldEl({ key: "animated", label: "Slowly animate", type: "toggle" }, bg, { onChange })
      );
    }
    if (bg.type === "image") {
      bgBox.append(
        fieldEl({ key: "image", label: "Image", type: "image" }, bg, { onChange }),
        fieldEl({ key: "fit", label: "Fit", type: "select", options: [["cover", "Fill screen (crop)"], ["contain", "Fit (letterbox)"], ["tile", "Tile"]] }, bg, { onChange }),
        fieldEl({ key: "color", label: "Color behind image", type: "color" }, bg, { onChange })
      );
    }
    if (bg.type === "video") {
      bgBox.append(
        fieldEl({ key: "video", label: "Video (.mp4/.webm link, upload, or YouTube/Vimeo)", type: "video" }, bg, { onChange }),
        h("p", { class: "help", style: { marginBottom: "12px" } }, "Videos play muted and loop. Keep files small to save battery.")
      );
    }
    if (bg.type === "embed") {
      bgBox.append(
        fieldEl({ key: "embed", label: "Web page URL", type: "text", help: "Shown full-screen behind your widgets. The site must allow embedding." }, bg, { onChange })
      );
    }
    right.append(section("Background", bgBox, { openState }));

    // overlay
    const ov = s.overlay || (s.overlay = { color: "#000000", opacity: 0, blur: 0 });
    right.append(
      section(
        "Background tint & blur",
        h(
          "div",
          {},
          fieldEl({ key: "opacity", label: "Tint amount", type: "range", min: 0, max: 95, def: 0 }, ov, { onChange }),
          fieldEl({ key: "color", label: "Tint color", type: "color" }, ov, { onChange }),
          fieldEl({ key: "blur", label: "Blur background", type: "range", min: 0, max: 40, def: 0 }, ov, { onChange })
        ),
        { open: false, openState }
      )
    );

    // type & color
    right.append(
      section(
        "Fonts & colors",
        h(
          "div",
          {},
          fieldEl({ key: "font", label: "Default font", type: "font", noDefault: true }, s, { onChange }),
          fieldEl({ key: "textColor", label: "Text color", type: "color" }, s, { onChange }),
          fieldEl({ key: "accent", label: "Accent color", type: "color" }, s, { onChange })
        ),
        { openState }
      )
    );
    right.append(
      section(
        "Glass cards",
        h(
          "div",
          {},
          fieldEl({ key: "cardBg", label: "Card color", type: "color" }, s, { onChange }),
          fieldEl({ key: "cardRadius", label: "Corner radius", type: "range", min: 0, max: 80, def: 22 }, s, { onChange }),
          fieldEl({ key: "cardBlur", label: "Frosted blur", type: "range", min: 0, max: 60, def: 14 }, s, { onChange })
        ),
        { open: false, openState }
      )
    );

    // behaviour
    right.append(
      section(
        "Screen & behavior",
        h(
          "div",
          {},
          fieldEl({ key: "aspect", label: "Screen shape", type: "select", options: ASPECTS }, s, {
            onChange: () => {
              fit();
              onChange(true);
            },
          }),
          fieldEl(
            {
              key: "interactive",
              label: "Interactive",
              type: "toggle",
              help: "On: you can click links, tick to-dos, type in search, and use embeds (turn on “Browsing Mode” in Plash). Off: a pure wallpaper that ignores the mouse.",
            },
            s,
            { onChange }
          ),
          !s.interactive ? fieldEl({ key: "hideCursor", label: "Hide mouse cursor over wallpaper", type: "toggle" }, s, { onChange }) : null,
          fieldEl({ key: "snap", label: "Snap to guides while dragging", type: "toggle", help: "Hold ⌥ Option while dragging to skip snapping." }, s, { onChange })
        ),
        { openState }
      )
    );

    right.append(
      section(
        "Custom CSS",
        h(
          "div",
          {},
          fieldEl(
            {
              key: "customCSS",
              label: "Advanced: CSS applied to the whole dashboard",
              type: "code",
              help: "Target .pb-canvas, .pb-w, .pb-t-clock, or your own class names from a widget's Effects section.",
            },
            s,
            { onChange }
          )
        ),
        { open: false, openState }
      )
    );
  }

  // ---------- field builder ----------
  function fieldEl(f, obj, { onChange }) {
    const val = obj[f.key];
    const set = (v, discrete = false) => {
      if (v === "" || v == null) delete obj[f.key];
      else obj[f.key] = v;
      onChange(discrete);
    };
    const wrap = (control, extra) =>
      h("label", { class: "field" }, f.label ? h("span", {}, f.label) : null, control, extra, f.help ? h("div", { class: "help" }, f.help) : null);

    switch (f.type) {
      case "text":
        return wrap(h("input", { class: "input", value: val ?? "", placeholder: f.placeholder || "", oninput: (e) => set(e.target.value) }));
      case "textarea":
      case "code": {
        const ta = h("textarea", { class: "input" + (f.type === "code" ? " code" : ""), spellcheck: f.type === "code" ? "false" : "true" });
        ta.value = val ?? "";
        ta.oninput = () => set(ta.value);
        if (f.type === "code") {
          ta.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              ta.setRangeText("  ", ta.selectionStart, ta.selectionEnd, "end");
              set(ta.value);
            }
          });
        }
        return wrap(ta);
      }
      case "number":
        return wrap(
          h("input", {
            class: "input",
            type: "number",
            min: f.min,
            max: f.max,
            step: f.step || 1,
            value: val ?? "",
            oninput: (e) => set(e.target.value === "" ? "" : Number(e.target.value)),
          })
        );
      case "range": {
        const cur = val ?? f.def ?? f.min ?? 0;
        const num = h("input", { class: "input", type: "number", value: cur, min: f.min, max: f.max, step: f.step || 1 });
        const rng = h("input", { type: "range", min: f.min, max: f.max, step: f.step || 1, value: cur });
        rng.oninput = () => {
          num.value = rng.value;
          set(Number(rng.value));
        };
        num.oninput = () => {
          rng.value = num.value;
          set(num.value === "" ? "" : Number(num.value));
        };
        return wrap(h("div", { class: "range-field" }, rng, num));
      }
      case "toggle": {
        const cb = h("input", { type: "checkbox" });
        cb.checked = !!val;
        cb.onchange = () => set(cb.checked ? true : f.keepFalse ? false : false, true);
        return h(
          "div",
          {},
          h("label", { class: "switch" }, h("span", {}, f.label), cb, h("i")),
          f.help ? h("div", { class: "help", style: { marginTop: "-8px", marginBottom: "12px" } }, f.help) : null
        );
      }
      case "select": {
        const sel = h("select", { class: "input" });
        const opts = f.options.map((o) => (Array.isArray(o) ? o : [o, o]));
        if (val != null && val !== "" && !opts.some(([v]) => String(v) === String(val))) opts.push([val, String(val)]);
        for (const [v, l] of opts) sel.append(h("option", { value: v }, l));
        sel.value = val ?? opts[0][0];
        sel.onchange = () => set(sel.value, true);
        if (f.allowCustom) {
          const custom = h("button", {
            type: "button",
            class: "btn sm ghost",
            onclick: (e) => {
              e.preventDefault();
              const v = prompt("Enter an IANA time zone, e.g. Europe/Lisbon", val || "");
              if (v) {
                try {
                  new Intl.DateTimeFormat("en", { timeZone: v });
                  set(v, true);
                } catch {
                  toast("That time zone wasn't recognized", "error");
                }
              }
            },
          }, "Other…");
          return wrap(h("div", { class: "row" }, h("div", { class: "grow" }, sel), custom));
        }
        return wrap(sel);
      }
      case "seg": {
        const cur = val ?? f.def ?? f.options[0][0];
        const seg = h(
          "div",
          { class: "seg" },
          f.options.map(([v, l]) =>
            h("button", { type: "button", class: String(cur) === String(v) ? "on" : "", onclick: (e) => (e.preventDefault(), set(v, true)) }, l)
          )
        );
        return h("div", { class: "field" }, h("span", { class: "field-label" }, f.label), seg);
      }
      case "color": {
        const text = h("input", { class: "input", value: val ?? "", placeholder: f.placeholder || "Default", spellcheck: "false" });
        const chip = h("span", { style: { background: val || "transparent" } });
        const picker = h("input", { type: "color", value: toHex(val) || "#ffffff" });
        picker.oninput = () => {
          // keep existing alpha if the current value has one
          const a = alphaOf(text.value);
          const v = a < 1 ? hexToRgba(picker.value, a) : picker.value;
          text.value = v;
          chip.style.background = v;
          set(v);
        };
        text.oninput = () => {
          chip.style.background = text.value;
          const hx = toHex(text.value);
          if (hx) picker.value = hx;
          set(text.value.trim());
        };
        const clear = h("button", {
          type: "button",
          class: "icon-btn",
          title: "Reset to default",
          onclick: (e) => {
            e.preventDefault();
            set("", true);
          },
        }, "↺");
        return wrap(h("div", { class: "color-field" }, h("div", { class: "swatch" }, chip, picker), text, clear));
      }
      case "datetime": {
        const input = h("input", { class: "input", type: "datetime-local", value: val ?? "" });
        input.onchange = () => set(input.value);
        return wrap(input);
      }
      case "font": {
        const sel = h("select", { class: "input" });
        if (!f.noDefault) sel.append(h("option", { value: "" }, "Theme default"));
        const cats = [...new Set(FONTS.map((x) => x[2]))];
        for (const c of cats) {
          const og = h("optgroup", { label: c });
          FONTS.filter((x) => x[2] === c).forEach((x) => og.append(h("option", { value: x[0] }, x[0])));
          sel.append(og);
        }
        if (val && !FONTS.some((x) => x[0] === val)) sel.append(h("option", { value: val }, val + " (custom)"));
        sel.append(h("option", { value: "__custom" }, "Any Google Font…"));
        sel.value = val || "";
        sel.onchange = () => {
          if (sel.value === "__custom") {
            const name = prompt("Type the exact name of any font from fonts.google.com, e.g. “Bricolage Grotesque”", "");
            if (name && name.trim()) set(name.trim(), true);
            else sel.value = val || "";
            return;
          }
          set(sel.value, true);
        };
        return wrap(sel);
      }
      case "image":
      case "video": {
        const isVideo = f.type === "video";
        const preview = isVideo
          ? null
          : h("div", { class: "preview", style: val ? { backgroundImage: `url("${String(val).replace(/"/g, "")}")` } : {} }, val ? "" : "No image yet");
        const url = h("input", { class: "input", value: val ?? "", placeholder: isVideo ? "https://…/clip.mp4" : "Paste an image link…" });
        url.onchange = () => set(url.value.trim(), true);
        const up = h("button", {
          type: "button",
          class: "btn sm",
          onclick: async (e) => {
            e.preventDefault();
            const [file] = await pickFiles({ accept: isVideo ? "video/mp4,video/webm" : "image/*" });
            if (!file) return;
            up.textContent = "Uploading…";
            up.disabled = true;
            try {
              set(await uploadFile(file), true);
            } catch (err) {
              toast(err.message, "error", 5000);
              up.textContent = "Upload";
              up.disabled = false;
            }
          },
        }, "Upload");
        const rm = val ? h("button", { type: "button", class: "btn sm ghost", onclick: (e) => (e.preventDefault(), set("", true)) }, "Remove") : null;
        return h(
          "div",
          { class: "field img-field" },
          h("span", { class: "field-label" }, f.label),
          preview,
          url,
          h("div", { class: "row", style: { marginTop: "6px" } }, up, rm, isVideo ? null : h("a", { class: "small", href: "https://unsplash.com/wallpapers/desktop", target: "_blank", rel: "noopener" }, "Find photos")),
          f.help ? h("div", { class: "help" }, f.help) : null
        );
      }
      case "images": {
        const list = Array.isArray(val) ? [...val] : [];
        const thumbs = h(
          "div",
          { class: "thumbs" },
          list.map((src, i) =>
            h(
              "div",
              { style: { backgroundImage: `url("${String(src).replace(/"/g, "")}")` } },
              h("button", { type: "button", title: "Remove", onclick: () => (list.splice(i, 1), set(list, true)) }, "×")
            )
          )
        );
        const url = h("input", { class: "input", placeholder: "Paste an image link and press Enter" });
        url.onkeydown = (e) => {
          if (e.key === "Enter" && url.value.trim()) {
            e.preventDefault();
            list.push(url.value.trim());
            set(list, true);
          }
        };
        const up = h("button", {
          type: "button",
          class: "btn sm",
          onclick: async (e) => {
            e.preventDefault();
            const files = await pickFiles({ accept: "image/*", multiple: true });
            if (!files.length) return;
            up.textContent = "Uploading…";
            up.disabled = true;
            for (const file of files) {
              try {
                list.push(await uploadFile(file));
              } catch (err) {
                toast(err.message, "error", 5000);
              }
            }
            set(list, true);
          },
        }, "Upload images");
        return h("div", { class: "field" }, h("span", { class: "field-label" }, f.label), thumbs, url, h("div", { class: "row", style: { marginTop: "6px" } }, up));
      }
      default:
        return h("div");
    }
  }

  // ---------- share / preview ----------
  async function flush() {
    commit();
    await save.flush();
  }

  async function preview() {
    await flush();
    window.open(dashUrl(doc.slug), "_blank");
  }

  async function share() {
    await flush();
    const link = dashUrl(doc.slug);
    const linkInput = h("input", { class: "input", value: link, readonly: true, onclick: (e) => e.target.select() });
    const plashUrl = "plash:add?url=" + encodeURIComponent(link) + "&title=" + encodeURIComponent(doc.name || "Plashboard");
    const interactiveCb = h("input", { type: "checkbox" });
    interactiveCb.checked = !!doc.settings.interactive;
    interactiveCb.onchange = () => {
      doc.settings.interactive = interactiveCb.checked;
      change({ panel: !sel });
      commit();
      browsingTip.classList.toggle("hidden", !interactiveCb.checked);
    };
    const browsingTip = h(
      "div",
      { class: "note" + (doc.settings.interactive ? "" : " hidden") },
      "Interactive dashboards: in Plash's menu bar menu, turn on ",
      h("b", {}, "Browsing Mode"),
      " so clicks reach your wallpaper. Turn it off again to click your desktop icons."
    );
    const m = modal({
      title: "Your wallpaper link",
      body: h(
        "div",
        {},
        h("p", { class: "muted" }, "This is the unique link for “" + doc.name + "”. Paste it into Plash and it becomes your full-screen wallpaper."),
        h(
          "div",
          { class: "share-link" },
          linkInput,
          h(
            "button",
            {
              class: "btn primary",
              onclick: () => copyText(link).then(() => toast("Copied!", "ok")),
            },
            "Copy"
          )
        ),
        h(
          "div",
          { class: "row", style: { marginBottom: "16px", flexWrap: "wrap" } },
          h("a", { class: "btn", href: plashUrl }, "＋ Add to Plash"),
          h("a", { class: "btn", href: link, target: "_blank", rel: "noopener" }, "Open in browser")
        ),
        h("label", { class: "switch" }, h("span", {}, h("b", {}, "Interactive"), h("span", { class: "muted" }, " — clickable links, to-dos, search")), interactiveCb, h("i")),
        browsingTip,
        h("h3", { style: { fontSize: "14px", margin: "16px 0 8px" } }, "Set it up in Plash"),
        h(
          "ol",
          { class: "steps" },
          h("li", {}, "Install ", h("a", { href: "https://sindresorhus.com/plash", target: "_blank", rel: "noopener" }, "Plash"), " (free, Mac App Store)."),
          h("li", {}, "Click “Add to Plash” above — or open Plash's menu bar icon → ", h("b", {}, "Add Website…"), " and paste the link."),
          h("li", {}, "That's it. Edits you make here appear on your wallpaper automatically within about 20 seconds.")
        ),
        h(
          "p",
          { class: "small muted", style: { marginTop: "14px" } },
          "Anyone with this link can view the dashboard (but not edit it). ",
          h(
            "a",
            {
              href: "#",
              onclick: async (e) => {
                e.preventDefault();
                if (!(await confirmDialog("Make a new link?", "The old link will stop working, so you'll need to paste the new one into Plash.", { ok: "Make new link", danger: true })))
                  return;
                const r = await api("/dashboards/" + doc.id + "/regenerate-link", { method: "POST", body: {} });
                doc.slug = r.dashboard.slug;
                m.close();
                share();
              },
            },
            "Make a new link"
          )
        )
      ),
    });
  }

  // ---------- exit / cleanup ----------
  async function exit() {
    try {
      await flush();
    } catch {}
    onExit();
  }

  const beforeUnload = (e) => {
    if (!doc) return;
    if (snapshot() !== lastSnap || saveState.textContent === "Saving…" || saveState.classList.contains("err")) {
      commit();
      // best-effort save while leaving
      fetch("/api/dashboards/" + doc.id, {
        method: "PUT",
        keepalive: true,
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dashboard: { name: doc.name, settings: doc.settings, widgets: doc.widgets } }),
      }).catch(() => {});
      e.preventDefault();
      e.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", beforeUnload);

  return () => {
    destroyed = true;
    if (doc) {
      commit();
      save.flush();
    }
    ro.disconnect();
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("paste", onKeyPaste);
    window.removeEventListener("beforeunload", beforeUnload);
    ctrl && ctrl.destroy();
    bc && bc.close();
    document.title = "Plashboard";
  };
}

// ---------- utils ----------
function round(n) {
  return Math.round(n * 100) / 100;
}

function toHex(c) {
  if (!c) return "";
  c = String(c).trim();
  if (/^#[0-9a-f]{6}$/i.test(c)) return c.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(c)) return "#" + c.slice(1).split("").map((x) => x + x).join("").toLowerCase();
  const m = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(c);
  if (m) return "#" + [m[1], m[2], m[3]].map((x) => Math.min(255, +x).toString(16).padStart(2, "0")).join("");
  return "";
}
function alphaOf(c) {
  const m = /^rgba\([^)]*,\s*([\d.]+)\s*\)$/i.exec(String(c || "").trim());
  return m ? Number(m[1]) : 1;
}
function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
