// Plashboard app: dashboards list + routing. The editor lives in editor.js.
import { api, h, modal, toast, confirmDialog, promptDialog, copyText, timeAgo, dashUrl } from "./ui.js";
import { renderDashboard } from "./render.js";
import { TEMPLATES } from "./templates.js";
import { openEditor } from "./editor.js";

const app = document.getElementById("app");
let me = null;
let cleanup = null;

async function boot() {
  try {
    const r = await api("/auth/me");
    me = r.user;
  } catch (e) {
    app.append(h("div", { class: "empty-state" }, "Couldn't reach the server: " + e.message));
    return;
  }
  if (!me) return location.replace("/");
  window.addEventListener("hashchange", route);
  route();
}

function route() {
  if (cleanup) {
    const c = cleanup;
    cleanup = null;
    c();
  }
  app.innerHTML = "";
  const hash = location.hash.replace(/^#\/?/, "");
  const [view, id] = hash.split("/");
  if (view === "edit" && id) {
    cleanup = openEditor(app, id, { onExit: () => (location.hash = "#/") });
  } else {
    cleanup = listView(view === "new");
  }
}

// ---------- menus ----------

export function popMenu(anchor, items) {
  document.querySelectorAll(".menu").forEach((m) => m.remove());
  const r = anchor.getBoundingClientRect();
  const menu = h(
    "div",
    { class: "menu" },
    items.map((it) =>
      it === "-"
        ? h("hr")
        : h(
            "button",
            {
              class: it.danger ? "danger" : "",
              onclick: () => {
                menu.remove();
                it.onClick();
              },
            },
            it.label
          )
    )
  );
  document.body.append(menu);
  const mw = menu.offsetWidth;
  menu.style.top = Math.min(r.bottom + 6, innerHeight - menu.offsetHeight - 8) + "px";
  menu.style.left = Math.max(8, Math.min(r.right - mw, innerWidth - mw - 8)) + "px";
  const off = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener("mousedown", off, true);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", off, true));
}

function accountMenu(anchor) {
  popMenu(anchor, [
    { label: "Change password", onClick: changePassword },
    "-",
    {
      label: "Sign out",
      onClick: async () => {
        await api("/auth/logout", { method: "POST", body: {} }).catch(() => {});
        location.replace("/");
      },
    },
  ]);
}

function changePassword() {
  const cur = h("input", { class: "input", type: "password", autocomplete: "current-password" });
  const next = h("input", { class: "input", type: "password", autocomplete: "new-password", minlength: 8 });
  modal({
    title: "Change password",
    body: h(
      "div",
      {},
      h("label", { class: "field" }, h("span", {}, "Current password"), cur),
      h("label", { class: "field" }, h("span", {}, "New password (8+ characters)"), next)
    ),
    actions: [
      { label: "Cancel", kind: "ghost" },
      {
        label: "Change password",
        kind: "primary",
        onClick: async () => {
          try {
            await api("/auth/password", { method: "POST", body: { current: cur.value, next: next.value } });
            toast("Password changed", "ok");
          } catch (e) {
            toast(e.message, "error");
            return false;
          }
        },
      },
    ],
  });
}

export function topbar(extra) {
  return h(
    "header",
    { class: "topbar" },
    h("a", { class: "brand", href: "#/" }, h("img", { src: "/assets/favicon.svg", alt: "" }), "Plashboard"),
    h(
      "div",
      { class: "row" },
      extra,
      h("button", { class: "btn ghost", onclick: (e) => accountMenu(e.currentTarget) }, "👤 " + me.username + " ▾")
    )
  );
}

// ---------- list ----------

function listView(openNew) {
  const previews = [];
  const grid = h("div", { class: "cards" });
  const page = h(
    "div",
    {},
    topbar(),
    h(
      "main",
      { class: "list-page" },
      h(
        "div",
        { class: "list-head" },
        h("div", {}, h("h1", {}, "Your dashboards"), h("p", { class: "muted", style: { margin: "6px 0 0" } }, "Each one gets its own link to paste into Plash.")),
        h("button", { class: "btn primary", onclick: newDashboard }, "＋ New dashboard")
      ),
      grid
    )
  );
  app.append(page);

  async function load() {
    grid.innerHTML = "";
    grid.append(h("div", { class: "muted" }, "Loading…"));
    let list;
    try {
      list = (await api("/dashboards")).dashboards;
    } catch (e) {
      if (e.status === 401) return location.replace("/");
      grid.innerHTML = "";
      grid.append(h("div", { class: "muted" }, e.message));
      return;
    }
    grid.innerHTML = "";
    previews.splice(0).forEach((p) => p.destroy());
    for (const d of list) grid.append(card(d));
    grid.append(
      h("div", { class: "card new", onclick: newDashboard }, h("div", {}, h("div", { class: "plus" }, "＋"), h("div", {}, "New dashboard")))
    );
    if (!list.length && !openNew) newDashboard();
  }

  function card(d) {
    const thumb = h("div", { class: "thumb", onclick: () => (location.hash = "#/edit/" + d.id) });
    // load the full doc for a live mini preview
    api("/dashboards/" + d.id)
      .then((r) => previews.push(renderDashboard(thumb, r.dashboard, { mode: "edit", thumb: true, dashKey: d.slug })))
      .catch(() => {});
    const more = h("button", { class: "icon-btn", "aria-label": "More", onclick: (e) => cardMenu(e.currentTarget, d) }, "•••");
    return h(
      "div",
      { class: "card" },
      thumb,
      h(
        "div",
        { class: "meta" },
        h(
          "div",
          { style: { minWidth: 0 } },
          h("b", {}, d.name),
          h("span", { class: "muted" }, "Edited " + timeAgo(d.updatedAt) + " "),
          h("span", { class: "pill" + (d.interactive ? " on" : "") }, d.interactive ? "Interactive" : "Static")
        ),
        h(
          "div",
          { class: "row" },
          h(
            "button",
            {
              class: "btn sm",
              onclick: () => copyText(dashUrl(d.slug)).then(() => toast("Link copied — paste it into Plash", "ok")),
            },
            "Copy link"
          ),
          more
        )
      )
    );
  }

  function cardMenu(anchor, d) {
    popMenu(anchor, [
      { label: "Edit", onClick: () => (location.hash = "#/edit/" + d.id) },
      { label: "Open wallpaper view", onClick: () => window.open(dashUrl(d.slug), "_blank") },
      {
        label: "Rename",
        onClick: async () => {
          const name = await promptDialog("Rename dashboard", d.name);
          if (!name) return;
          const full = (await api("/dashboards/" + d.id)).dashboard;
          full.name = name;
          await api("/dashboards/" + d.id, { method: "PUT", body: { dashboard: full } });
          load();
        },
      },
      {
        label: "Duplicate",
        onClick: async () => {
          const full = (await api("/dashboards/" + d.id)).dashboard;
          await api("/dashboards", {
            method: "POST",
            body: { dashboard: { name: full.name + " copy", settings: full.settings, widgets: full.widgets } },
          });
          toast("Duplicated", "ok");
          load();
        },
      },
      {
        label: "Export JSON",
        onClick: async () => {
          const full = (await api("/dashboards/" + d.id)).dashboard;
          const blob = new Blob([JSON.stringify({ name: full.name, settings: full.settings, widgets: full.widgets }, null, 2)], {
            type: "application/json",
          });
          const a = h("a", { href: URL.createObjectURL(blob), download: (full.name || "dashboard").replace(/[^\w-]+/g, "-") + ".plashboard.json" });
          a.click();
        },
      },
      "-",
      {
        label: "Delete…",
        danger: true,
        onClick: async () => {
          if (!(await confirmDialog("Delete “" + d.name + "”?", "Its link will stop working in Plash. This can't be undone.", { ok: "Delete", danger: true })))
            return;
          await api("/dashboards/" + d.id, { method: "DELETE" });
          toast("Deleted");
          load();
        },
      },
    ]);
  }

  function newDashboard() {
    const tplGrid = h("div", { class: "templates" });
    const tplPreviews = [];
    const m = modal({
      title: "New dashboard",
      wide: true,
      body: h(
        "div",
        {},
        h("p", { class: "muted" }, "Pick a starting point — you can change everything afterwards."),
        tplGrid,
        h(
          "p",
          { class: "small muted", style: { marginTop: "14px" } },
          "Have a ",
          h("code", {}, ".plashboard.json"),
          " file? ",
          h("a", { href: "#", onclick: (e) => (e.preventDefault(), importJson()) }, "Import it")
        )
      ),
      onClose: () => tplPreviews.forEach((p) => p.destroy()),
    });
    for (const t of TEMPLATES) {
      const doc = t.make();
      const thumb = h("div", { class: "thumb" });
      const btn = h(
        "button",
        {
          class: "tpl",
          onclick: async () => {
            btn.disabled = true;
            try {
              const r = await api("/dashboards", { method: "POST", body: { dashboard: t.make() } });
              m.close();
              location.hash = "#/edit/" + r.dashboard.id;
            } catch (e) {
              toast(e.message, "error");
              btn.disabled = false;
            }
          },
        },
        thumb,
        h("div", { class: "t" }, h("b", {}, t.name), h("span", {}, t.desc))
      );
      tplGrid.append(btn);
      requestAnimationFrame(() => tplPreviews.push(renderDashboard(thumb, doc, { mode: "edit", thumb: true, dashKey: "tpl" })));
    }

    async function importJson() {
      const input = h("input", { type: "file", accept: ".json,application/json" });
      input.onchange = async () => {
        try {
          const doc = JSON.parse(await input.files[0].text());
          const r = await api("/dashboards", {
            method: "POST",
            body: { dashboard: { name: doc.name || "Imported", settings: doc.settings || {}, widgets: doc.widgets || [] } },
          });
          m.close();
          location.hash = "#/edit/" + r.dashboard.id;
        } catch (e) {
          toast("Couldn't import: " + e.message, "error");
        }
      };
      input.click();
    }
  }

  load().then(() => {
    if (openNew) {
      history.replaceState(null, "", "#/");
      newDashboard();
    }
  });

  return () => previews.forEach((p) => p.destroy());
}

boot();
