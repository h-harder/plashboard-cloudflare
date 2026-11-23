// Plashboard renderer — shared by the editor and the wallpaper viewer.
// Layout: widget x/y/w/h are percentages of the canvas. Sizes (font, padding,
// radius…) are in "units" where 1 unit = canvas width / 1440, so a dashboard
// looks the same on any screen size.

export const BASE_WIDTH = 1440;

// ---------- fonts ----------

export const FONTS = [
  // [family, google weights or null for system fonts, category]
  ["System", null, "System"],
  ["SF Pro Rounded", null, "System"],
  ["New York", null, "System"],
  ["Menlo", null, "System"],
  ["Helvetica Neue", null, "System"],
  ["Georgia", null, "System"],
  ["Inter", "300;400;500;600;700;800", "Sans"],
  ["Manrope", "300;400;500;600;700;800", "Sans"],
  ["Poppins", "300;400;500;600;700;800", "Sans"],
  ["Montserrat", "300;400;500;600;700;800", "Sans"],
  ["DM Sans", "300;400;500;600;700", "Sans"],
  ["Outfit", "300;400;500;600;700;800", "Sans"],
  ["Space Grotesk", "300;400;500;600;700", "Sans"],
  ["Sora", "300;400;500;600;700;800", "Sans"],
  ["Urbanist", "300;400;500;600;700;800", "Sans"],
  ["Figtree", "300;400;500;600;700;800", "Sans"],
  ["Rubik", "300;400;500;600;700;800", "Sans"],
  ["Nunito", "300;400;500;600;700;800", "Rounded"],
  ["Quicksand", "300;400;500;600;700", "Rounded"],
  ["Comfortaa", "300;400;500;600;700", "Rounded"],
  ["Lexend", "300;400;500;600;700;800", "Sans"],
  ["Bebas Neue", "400", "Display"],
  ["Anton", "400", "Display"],
  ["Oswald", "300;400;500;600;700", "Display"],
  ["Archivo Black", "400", "Display"],
  ["Righteous", "400", "Display"],
  ["Bungee", "400", "Display"],
  ["Monoton", "400", "Display"],
  ["Orbitron", "400;500;600;700;800", "Display"],
  ["Audiowide", "400", "Display"],
  ["Abril Fatface", "400", "Display"],
  ["Playfair Display", "400;500;600;700;800", "Serif"],
  ["DM Serif Display", "400", "Serif"],
  ["Fraunces", "300;400;500;600;700;800", "Serif"],
  ["Lora", "400;500;600;700", "Serif"],
  ["Cormorant Garamond", "300;400;500;600;700", "Serif"],
  ["Libre Baskerville", "400;700", "Serif"],
  ["Instrument Serif", "400", "Serif"],
  ["JetBrains Mono", "300;400;500;600;700;800", "Mono"],
  ["Space Mono", "400;700", "Mono"],
  ["IBM Plex Mono", "300;400;500;600;700", "Mono"],
  ["Fira Code", "300;400;500;600;700", "Mono"],
  ["VT323", "400", "Mono"],
  ["Press Start 2P", "400", "Mono"],
  ["Pacifico", "400", "Handwriting"],
  ["Caveat", "400;500;600;700", "Handwriting"],
  ["Dancing Script", "400;500;600;700", "Handwriting"],
  ["Permanent Marker", "400", "Handwriting"],
  ["Shadows Into Light", "400", "Handwriting"],
  ["Lobster", "400", "Handwriting"],
  ["Satisfy", "400", "Handwriting"],
];

const SYSTEM_STACKS = {
  System: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  "SF Pro Rounded": 'ui-rounded, "SF Pro Rounded", -apple-system, sans-serif',
  "New York": 'ui-serif, "New York", Georgia, serif',
  Menlo: 'ui-monospace, Menlo, Monaco, "Cascadia Mono", monospace',
  "Helvetica Neue": '"Helvetica Neue", Helvetica, Arial, sans-serif',
  Georgia: "Georgia, serif",
};

const loadedFonts = new Set();

export function fontStack(name) {
  if (!name) return "var(--pb-font)";
  if (SYSTEM_STACKS[name]) return SYSTEM_STACKS[name];
  loadFont(name);
  return `"${name}", -apple-system, sans-serif`;
}

export function loadFont(name) {
  if (!name || SYSTEM_STACKS[name] || loadedFonts.has(name)) return;
  loadedFonts.add(name);
  const known = FONTS.find((f) => f[0] === name);
  const fam = encodeURIComponent(name).replace(/%20/g, "+");
  const href =
    "https://fonts.googleapis.com/css2?family=" + fam + (known && known[1] ? ":wght@" + known[1] : "") + "&display=swap";
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

// ---------- themes ----------

export const THEMES = {
  midnight: {
    label: "Midnight",
    font: "Inter",
    textColor: "#f4f6ff",
    accent: "#8ab4ff",
    cardBg: "rgba(255,255,255,0.07)",
    background: { type: "gradient", gradient: { kind: "linear", from: "#0b1023", via: "#1b1f4b", to: "#3a1d5c", angle: 135 } },
  },
  paper: {
    label: "Paper",
    font: "Fraunces",
    textColor: "#2b2620",
    accent: "#c2410c",
    cardBg: "rgba(255,255,255,0.6)",
    background: { type: "color", color: "#f3ede2" },
  },
  sunset: {
    label: "Sunset",
    font: "Poppins",
    textColor: "#fff8f0",
    accent: "#ffd166",
    cardBg: "rgba(255,255,255,0.14)",
    background: { type: "gradient", gradient: { kind: "linear", from: "#ff7e5f", via: "#d4508a", to: "#4b2a7b", angle: 160 } },
  },
  ocean: {
    label: "Ocean",
    font: "Manrope",
    textColor: "#eafcff",
    accent: "#5eead4",
    cardBg: "rgba(255,255,255,0.1)",
    background: { type: "gradient", gradient: { kind: "linear", from: "#0f2027", via: "#203a43", to: "#2c5364", angle: 180 } },
  },
  forest: {
    label: "Forest",
    font: "DM Sans",
    textColor: "#eef5e9",
    accent: "#a3e635",
    cardBg: "rgba(0,0,0,0.22)",
    background: { type: "gradient", gradient: { kind: "linear", from: "#1d3b2a", via: "#264d36", to: "#0e1f16", angle: 200 } },
  },
  synthwave: {
    label: "Synthwave",
    font: "Orbitron",
    textColor: "#ffe8ff",
    accent: "#ff3cac",
    cardBg: "rgba(20,0,40,0.45)",
    background: { type: "gradient", animated: true, gradient: { kind: "linear", from: "#2b0b5a", via: "#7a1fa2", to: "#ff3cac", angle: 180 } },
  },
  nord: {
    label: "Nord",
    font: "Rubik",
    textColor: "#eceff4",
    accent: "#88c0d0",
    cardBg: "rgba(59,66,82,0.75)",
    background: { type: "color", color: "#2e3440" },
  },
  mono: {
    label: "Mono",
    font: "JetBrains Mono",
    textColor: "#e5e5e5",
    accent: "#ffffff",
    cardBg: "rgba(255,255,255,0.05)",
    background: { type: "color", color: "#0a0a0a" },
  },
  pastel: {
    label: "Pastel",
    font: "Quicksand",
    textColor: "#3d3551",
    accent: "#8b5cf6",
    cardBg: "rgba(255,255,255,0.55)",
    background: { type: "gradient", gradient: { kind: "linear", from: "#fbc2eb", via: "#d9c7f5", to: "#a6c1ee", angle: 135 } },
  },
  aurora: {
    label: "Aurora",
    font: "Outfit",
    textColor: "#ffffff",
    accent: "#7cf5c6",
    cardBg: "rgba(255,255,255,0.08)",
    background: { type: "gradient", animated: true, gradient: { kind: "linear", from: "#0f0c29", via: "#1f6f78", to: "#4c2c86", angle: 120 } },
  },
  retro: {
    label: "Retro Terminal",
    font: "VT323",
    textColor: "#39ff88",
    accent: "#39ff88",
    cardBg: "rgba(0,40,10,0.55)",
    background: { type: "color", color: "#031a09" },
  },
  latte: {
    label: "Latte",
    font: "Playfair Display",
    textColor: "#4a3426",
    accent: "#a0522d",
    cardBg: "rgba(255,248,240,0.7)",
    background: { type: "gradient", gradient: { kind: "radial", from: "#f7e7d3", via: "#e9cfb2", to: "#d2b08c", angle: 0 } },
  },
};

export function defaultSettings(themeKey = "midnight") {
  const t = THEMES[themeKey] || THEMES.midnight;
  return {
    theme: themeKey,
    aspect: "16:10",
    interactive: false,
    font: t.font,
    textColor: t.textColor,
    accent: t.accent,
    cardBg: t.cardBg,
    cardRadius: 22,
    cardBlur: 14,
    background: structuredClone(t.background),
    overlay: { color: "#000000", opacity: 0, blur: 0 },
    customCSS: "",
    hideCursor: true,
    snap: true,
  };
}

export function applyTheme(settings, themeKey) {
  const t = THEMES[themeKey];
  if (!t) return settings;
  settings.theme = themeKey;
  settings.font = t.font;
  settings.textColor = t.textColor;
  settings.accent = t.accent;
  settings.cardBg = t.cardBg;
  settings.background = structuredClone(t.background);
  return settings;
}

// ---------- helpers ----------

const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
};
export { h };

const u = (n) => `calc(var(--u) * ${Number(n) || 0})`;

export function resolveUrl(src) {
  if (!src) return "";
  return src;
}

function cssUrl(src) {
  return `url("${String(resolveUrl(src)).replace(/["\\\n]/g, "")}")`;
}

export function gradientCss(g) {
  if (!g) return "none";
  const stops = [g.from || "#000", g.via, g.to || "#333"].filter(Boolean).join(", ");
  if (g.kind === "radial") return `radial-gradient(circle at center, ${stops})`;
  if (g.kind === "conic") return `conic-gradient(from ${g.angle || 0}deg at 50% 50%, ${stops}, ${g.from || "#000"})`;
  return `linear-gradient(${g.angle ?? 135}deg, ${stops})`;
}

function tzOpt(tz) {
  return tz && tz !== "local" ? { timeZone: tz } : {};
}

function partsIn(date, tz) {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      ...tzOpt(tz),
      hour12: false,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      weekday: "short",
    });
    const p = {};
    for (const x of fmt.formatToParts(date)) p[x.type] = x.value;
    return {
      y: +p.year,
      mo: +p.month,
      d: +p.day,
      h: +p.hour % 24,
      m: +p.minute,
      s: +p.second,
      wd: p.weekday,
    };
  } catch {
    return partsIn(date, "local");
  }
}

export function greeting(hour) {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Good night";
}

function fmtTime(date, { hour12 = true, seconds = false, ampm = true, tz } = {}) {
  try {
    let s = date.toLocaleTimeString(undefined, {
      ...tzOpt(tz),
      hour: "numeric",
      minute: "2-digit",
      second: seconds ? "2-digit" : undefined,
      hour12,
    });
    if (hour12 && !ampm) s = s.replace(/\s?[AP]\.?M\.?/i, "");
    return s;
  } catch {
    return date.toLocaleTimeString();
  }
}

const DATE_FORMATS = {
  full: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  long: { weekday: "long", month: "long", day: "numeric" },
  medium: { weekday: "short", month: "short", day: "numeric" },
  short: { month: "numeric", day: "numeric", year: "2-digit" },
  weekday: { weekday: "long" },
  monthday: { month: "long", day: "numeric" },
  monthyear: { month: "long", year: "numeric" },
};

function fmtDate(date, format = "long", tz) {
  try {
    return date.toLocaleDateString(undefined, { ...tzOpt(tz), ...(DATE_FORMATS[format] || DATE_FORMATS.long) });
  } catch {
    return date.toDateString();
  }
}

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

export function fillTokens(text, now = new Date()) {
  if (!text || text.indexOf("{") < 0) return text;
  const year = now.getFullYear();
  const endOfYear = new Date(year + 1, 0, 1);
  const map = {
    time: () => fmtTime(now),
    time24: () => fmtTime(now, { hour12: false }),
    seconds: () => String(now.getSeconds()).padStart(2, "0"),
    date: () => fmtDate(now, "long"),
    weekday: () => fmtDate(now, "weekday"),
    month: () => now.toLocaleDateString(undefined, { month: "long" }),
    day: () => String(now.getDate()),
    year: () => String(year),
    greeting: () => greeting(now.getHours()),
    dayofyear: () => String(dayOfYear(now)),
    daysleft: () => String(Math.ceil((endOfYear - now) / 86400000)),
    week: () => {
      const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const y0 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return String(Math.ceil(((d - y0) / 86400000 + 1) / 7));
    },
  };
  return text.replace(/\{(\w+)\}/g, (m, k) => (map[k.toLowerCase()] ? map[k.toLowerCase()]() : m));
}

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function embedUrl(url, { autoplay = true } = {}) {
  if (!url) return "";
  try {
    const x = new URL(url, location.href);
    // YouTube
    let yt = null;
    if (/(^|\.)youtube\.com$/.test(x.hostname)) {
      if (x.pathname === "/watch") yt = x.searchParams.get("v");
      else if (x.pathname.startsWith("/shorts/") || x.pathname.startsWith("/live/")) yt = x.pathname.split("/")[2];
      else if (x.pathname.startsWith("/embed/")) return url;
      const list = x.searchParams.get("list");
      if (!yt && list) return `https://www.youtube.com/embed/videoseries?list=${list}&autoplay=${+autoplay}&mute=1&loop=1`;
    }
    if (x.hostname === "youtu.be") yt = x.pathname.slice(1);
    if (yt) {
      return `https://www.youtube.com/embed/${yt}?autoplay=${+autoplay}&mute=1&loop=1&playlist=${yt}&controls=0&modestbranding=1&playsinline=1`;
    }
    // Spotify
    if (x.hostname === "open.spotify.com" && !x.pathname.startsWith("/embed")) {
      return "https://open.spotify.com/embed" + x.pathname;
    }
    // Vimeo
    if (/(^|\.)vimeo\.com$/.test(x.hostname) && /^\/\d+/.test(x.pathname)) {
      return `https://player.vimeo.com/video${x.pathname}?autoplay=${+autoplay}&muted=1&loop=1&background=1`;
    }
    // Google Calendar share links already work as embeds.
    return x.href;
  } catch {
    return url;
  }
}

// ---------- widget types ----------
// Each type: { label, icon, group, defaults, fields, mount(el, w, ctx) -> { tick?(now), destroy?() } }
// Field: { key, label, type, options?, min?, max?, step?, help?, showIf?(props) }

const TZ_OPTIONS = [
  ["local", "This computer's time zone"],
  ["UTC", "UTC"],
  ["America/Los_Angeles", "Los Angeles"],
  ["America/Denver", "Denver"],
  ["America/Chicago", "Chicago"],
  ["America/New_York", "New York"],
  ["America/Toronto", "Toronto"],
  ["America/Mexico_City", "Mexico City"],
  ["America/Sao_Paulo", "São Paulo"],
  ["Europe/London", "London"],
  ["Europe/Dublin", "Dublin"],
  ["Europe/Paris", "Paris"],
  ["Europe/Berlin", "Berlin"],
  ["Europe/Madrid", "Madrid"],
  ["Europe/Rome", "Rome"],
  ["Europe/Amsterdam", "Amsterdam"],
  ["Europe/Stockholm", "Stockholm"],
  ["Europe/Istanbul", "Istanbul"],
  ["Europe/Moscow", "Moscow"],
  ["Africa/Cairo", "Cairo"],
  ["Africa/Lagos", "Lagos"],
  ["Africa/Johannesburg", "Johannesburg"],
  ["Asia/Dubai", "Dubai"],
  ["Asia/Kolkata", "India"],
  ["Asia/Bangkok", "Bangkok"],
  ["Asia/Singapore", "Singapore"],
  ["Asia/Hong_Kong", "Hong Kong"],
  ["Asia/Shanghai", "Shanghai"],
  ["Asia/Seoul", "Seoul"],
  ["Asia/Tokyo", "Tokyo"],
  ["Australia/Perth", "Perth"],
  ["Australia/Sydney", "Sydney"],
  ["Pacific/Auckland", "Auckland"],
  ["Pacific/Honolulu", "Honolulu"],
];

function inYMD(dateStr) {
  // "2026-12-25T00:00" (local) → Date
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
}

export const WIDGETS = {
  text: {
    label: "Text",
    icon: "T",
    group: "Basics",
    defaults: { w: 40, h: 14, props: { text: "Double-click to edit me" }, style: { size: 48, weight: 600 } },
    fields: [
      {
        key: "text",
        label: "Text",
        type: "textarea",
        help: "Live tokens: {time} {date} {weekday} {greeting} {month} {day} {year} {week} {daysleft}",
      },
      { key: "autofit", label: "Shrink text to fit box", type: "toggle" },
    ],
    mount(el, w) {
      const box = h("div", { class: "pb-text" });
      el.append(box);
      const hasTokens = /\{\w+\}/.test(w.props.text || "");
      const render = () => {
        box.textContent = fillTokens(w.props.text || "");
        if (w.props.autofit) autofit(el, box);
      };
      render();
      return { tick: hasTokens ? render : null, resize: w.props.autofit ? render : null };
    },
  },

  clock: {
    label: "Clock",
    icon: "◷",
    group: "Time",
    defaults: {
      w: 40,
      h: 22,
      props: { hour12: true, seconds: false, ampm: true, tz: "local", label: "", showDate: false, dateFormat: "long", blink: false },
      style: { size: 120, weight: 700, letterSpacing: -2 },
    },
    fields: [
      { key: "hour12", label: "12-hour clock", type: "toggle" },
      { key: "ampm", label: "Show AM/PM", type: "toggle", showIf: (p) => p.hour12 },
      { key: "seconds", label: "Show seconds", type: "toggle" },
      { key: "blink", label: "Blinking colon", type: "toggle" },
      { key: "tz", label: "Time zone", type: "select", options: TZ_OPTIONS, allowCustom: true },
      { key: "label", label: "Label (e.g. city name)", type: "text" },
      { key: "showDate", label: "Show date under time", type: "toggle" },
      {
        key: "dateFormat",
        label: "Date format",
        type: "select",
        options: Object.keys(DATE_FORMATS).map((k) => [k, k]),
        showIf: (p) => p.showDate,
      },
    ],
    mount(el, w) {
      const p = w.props;
      const time = h("div", { class: "pb-clock-time" });
      const label = p.label ? h("div", { class: "pb-sub" }, p.label) : null;
      const date = p.showDate ? h("div", { class: "pb-sub" }) : null;
      el.append(h("div", { class: "pb-stack" }, label, time, date));
      const tick = (now) => {
        let t = fmtTime(now, { hour12: p.hour12, seconds: p.seconds, ampm: p.ampm, tz: p.tz });
        if (p.blink) {
          time.innerHTML = "";
          const parts = t.split(":");
          parts.forEach((part, i) => {
            if (i) time.append(h("span", { class: "pb-colon" + (now.getSeconds() % 2 ? " off" : "") }, ":"));
            time.append(part);
          });
        } else time.textContent = t;
        if (date) date.textContent = fmtDate(now, p.dateFormat, p.tz);
      };
      tick(new Date());
      return { tick };
    },
  },

  analog: {
    label: "Analog clock",
    icon: "◴",
    group: "Time",
    defaults: {
      w: 18,
      h: 28,
      props: { tz: "local", seconds: true, numbers: false, ticks: true, face: "", hands: "", second: "", label: "" },
      style: { size: 20 },
    },
    fields: [
      { key: "tz", label: "Time zone", type: "select", options: TZ_OPTIONS, allowCustom: true },
      { key: "seconds", label: "Second hand", type: "toggle" },
      { key: "ticks", label: "Tick marks", type: "toggle" },
      { key: "numbers", label: "Numbers", type: "toggle" },
      { key: "face", label: "Face color", type: "color" },
      { key: "hands", label: "Hand color", type: "color" },
      { key: "second", label: "Second hand color", type: "color" },
      { key: "label", label: "Label", type: "text" },
    ],
    mount(el, w) {
      const p = w.props;
      const NS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 200 200");
      svg.classList.add("pb-analog");
      const mk = (tag, attrs) => {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        svg.append(e);
        return e;
      };
      mk("circle", { cx: 100, cy: 100, r: 96, fill: p.face || "var(--pb-card)", stroke: "currentColor", "stroke-opacity": 0.15, "stroke-width": 2 });
      if (p.ticks) {
        for (let i = 0; i < 60; i++) {
          const big = i % 5 === 0;
          const a = (i * 6 * Math.PI) / 180;
          const r1 = big ? 80 : 86;
          mk("line", {
            x1: 100 + Math.sin(a) * r1,
            y1: 100 - Math.cos(a) * r1,
            x2: 100 + Math.sin(a) * 90,
            y2: 100 - Math.cos(a) * 90,
            stroke: "currentColor",
            "stroke-opacity": big ? 0.8 : 0.3,
            "stroke-width": big ? 3 : 1.2,
            "stroke-linecap": "round",
          });
        }
      }
      if (p.numbers) {
        for (let i = 1; i <= 12; i++) {
          const a = (i * 30 * Math.PI) / 180;
          const t = mk("text", {
            x: 100 + Math.sin(a) * 66,
            y: 100 - Math.cos(a) * 66 + 6,
            "text-anchor": "middle",
            "font-size": 17,
            fill: "currentColor",
            "font-weight": 600,
          });
          t.textContent = i;
        }
      }
      const hand = (len, width, color) =>
        mk("line", { x1: 100, y1: 112, x2: 100, y2: 100 - len, stroke: color, "stroke-width": width, "stroke-linecap": "round" });
      const hh = hand(48, 7, p.hands || "currentColor");
      const mh = hand(70, 4.5, p.hands || "currentColor");
      const sh = p.seconds ? hand(78, 1.8, p.second || "var(--pb-accent)") : null;
      mk("circle", { cx: 100, cy: 100, r: 5, fill: p.second || "var(--pb-accent)" });
      const wrap = h("div", { class: "pb-stack" }, svg, p.label ? h("div", { class: "pb-sub" }, p.label) : null);
      el.append(wrap);
      const tick = (now) => {
        const t = partsIn(now, p.tz);
        hh.setAttribute("transform", `rotate(${(t.h % 12) * 30 + t.m * 0.5} 100 100)`);
        mh.setAttribute("transform", `rotate(${t.m * 6 + t.s * 0.1} 100 100)`);
        if (sh) sh.setAttribute("transform", `rotate(${t.s * 6} 100 100)`);
      };
      tick(new Date());
      return { tick };
    },
  },

  date: {
    label: "Date",
    icon: "▦",
    group: "Time",
    defaults: { w: 40, h: 8, props: { format: "long", tz: "local", uppercase: false }, style: { size: 30, weight: 500 } },
    fields: [
      { key: "format", label: "Format", type: "select", options: Object.keys(DATE_FORMATS).map((k) => [k, k]) },
      { key: "tz", label: "Time zone", type: "select", options: TZ_OPTIONS, allowCustom: true },
    ],
    mount(el, w) {
      const box = h("div", { class: "pb-text" });
      el.append(box);
      const tick = (now) => (box.textContent = fmtDate(now, w.props.format, w.props.tz));
      tick(new Date());
      return { tick };
    },
  },

  countdown: {
    label: "Countdown",
    icon: "⏳",
    group: "Time",
    defaults: {
      w: 46,
      h: 26,
      props: {
        title: "New Year",
        target: `${new Date().getFullYear() + 1}-01-01T00:00`,
        layout: "blocks",
        seconds: true,
        doneText: "It's here! 🎉",
        countUp: false,
        repeat: "none",
      },
      style: { size: 64, weight: 700, card: true },
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "target", label: "Count down to", type: "datetime" },
      {
        key: "repeat",
        label: "Repeat",
        type: "select",
        options: [
          ["none", "Don't repeat"],
          ["yearly", "Every year (birthdays, holidays)"],
          ["monthly", "Every month"],
          ["weekly", "Every week"],
          ["daily", "Every day"],
        ],
      },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          ["blocks", "Blocks (days · hours · minutes)"],
          ["inline", "Inline (3d 4h 12m)"],
          ["days", "Days only"],
          ["sentence", "Sentence (“12 days until …”)"],
        ],
      },
      { key: "seconds", label: "Show seconds", type: "toggle" },
      { key: "countUp", label: "Count up after it passes", type: "toggle" },
      { key: "doneText", label: "Text when finished", type: "text", showIf: (p) => !p.countUp },
    ],
    mount(el, w) {
      const p = w.props;
      const title = p.title ? h("div", { class: "pb-sub" }, p.title) : null;
      const body = h("div", { class: "pb-cd" });
      el.append(h("div", { class: "pb-stack" }, title, body));
      let lastKey = "";
      const tick = (now) => {
        let target = inYMD(p.target);
        if (!target) {
          body.textContent = "Pick a date";
          return;
        }
        if (p.repeat && p.repeat !== "none") target = nextOccurrence(target, p.repeat, now);
        let diff = target - now;
        let past = diff <= 0;
        if (past && !p.countUp) {
          if (lastKey !== "done") {
            body.textContent = p.doneText || "Done";
            body.className = "pb-cd pb-cd-done";
            lastKey = "done";
          }
          return;
        }
        diff = Math.abs(diff);
        const d = Math.floor(diff / 86400000);
        const hh = Math.floor((diff % 86400000) / 3600000);
        const mm = Math.floor((diff % 3600000) / 60000);
        const ss = Math.floor((diff % 60000) / 1000);
        const units = [
          [d, "days"],
          [hh, "hours"],
          [mm, "min"],
        ];
        if (p.seconds) units.push([ss, "sec"]);
        body.className = "pb-cd pb-cd-" + p.layout;
        if (p.layout === "blocks") {
          const key = units.map((x) => x[0]).join(":");
          if (key === lastKey) return;
          lastKey = key;
          body.innerHTML = "";
          units.forEach(([n, l], i) => {
            body.append(
              h("div", { class: "pb-cd-unit" }, h("div", { class: "pb-cd-n" }, i && n < 10 ? "0" + n : n), h("div", { class: "pb-cd-l" }, l))
            );
          });
        } else if (p.layout === "inline") {
          body.textContent = units
            .filter(([n], i) => n || i > 0 || d)
            .map(([n, l]) => n + l[0])
            .join(" ");
        } else if (p.layout === "days") {
          const days = Math.ceil(diff / 86400000);
          body.innerHTML = "";
          body.append(h("div", { class: "pb-cd-n" }, days), h("div", { class: "pb-cd-l" }, days === 1 ? "day" : "days"));
        } else {
          const days = Math.ceil(diff / 86400000);
          body.textContent = past
            ? `${days} ${days === 1 ? "day" : "days"} since ${p.title || "then"}`
            : `${days} ${days === 1 ? "day" : "days"} until ${p.title || "then"}`;
        }
        if (past) body.classList.add("pb-cd-up");
      };
      tick(new Date());
      return { tick };
    },
  },

  progress: {
    label: "Progress bar",
    icon: "▰",
    group: "Time",
    defaults: {
      w: 40,
      h: 10,
      props: { mode: "year", start: "", end: "", label: "{auto}", percent: true, decimals: 1, barColor: "", thickness: 10 },
      style: { size: 22, weight: 600 },
    },
    fields: [
      {
        key: "mode",
        label: "Track",
        type: "select",
        options: [
          ["day", "Today"],
          ["week", "This week"],
          ["month", "This month"],
          ["year", "This year"],
          ["custom", "Custom dates"],
        ],
      },
      { key: "start", label: "Start", type: "datetime", showIf: (p) => p.mode === "custom" },
      { key: "end", label: "End", type: "datetime", showIf: (p) => p.mode === "custom" },
      { key: "label", label: "Label", type: "text", help: "{auto} = “2026 is 64.2% complete”" },
      { key: "percent", label: "Show percentage", type: "toggle" },
      { key: "decimals", label: "Decimals", type: "number", min: 0, max: 4 },
      { key: "thickness", label: "Bar thickness", type: "range", min: 2, max: 60 },
      { key: "barColor", label: "Bar color", type: "color" },
    ],
    mount(el, w) {
      const p = w.props;
      const label = h("div", { class: "pb-prog-label" });
      const fill = h("div", { class: "pb-prog-fill", style: { background: p.barColor || "var(--pb-accent)" } });
      const bar = h("div", { class: "pb-prog-bar", style: { height: u(p.thickness || 10) } }, fill);
      el.append(h("div", { class: "pb-stack pb-prog" }, label, bar));
      const tick = (now) => {
        let s, e, name;
        const y = now.getFullYear(),
          m = now.getMonth(),
          d = now.getDate();
        if (p.mode === "day") (s = new Date(y, m, d)), (e = new Date(y, m, d + 1)), (name = "Today");
        else if (p.mode === "week") {
          const wd = (now.getDay() + 6) % 7;
          (s = new Date(y, m, d - wd)), (e = new Date(y, m, d - wd + 7)), (name = "This week");
        } else if (p.mode === "month")
          (s = new Date(y, m, 1)), (e = new Date(y, m + 1, 1)), (name = now.toLocaleDateString(undefined, { month: "long" }));
        else if (p.mode === "custom") (s = inYMD(p.start)), (e = inYMD(p.end)), (name = "Progress");
        else (s = new Date(y, 0, 1)), (e = new Date(y + 1, 0, 1)), (name = String(y));
        let pct = s && e && e > s ? Math.min(1, Math.max(0, (now - s) / (e - s))) : 0;
        fill.style.width = pct * 100 + "%";
        const pctText = (pct * 100).toFixed(Math.max(0, Math.min(4, p.decimals ?? 1))) + "%";
        let text = (p.label || "").replace("{auto}", `${name} is ${pctText} complete`);
        text = fillTokens(text, now);
        if (p.percent && !(p.label || "").includes("{auto}")) text = (text ? text + " · " : "") + pctText;
        label.textContent = text;
      };
      tick(new Date());
      return { tick };
    },
  },

  calendar: {
    label: "Calendar",
    icon: "📅",
    group: "Time",
    defaults: { w: 24, h: 34, props: { weekStart: "sun", showTitle: true }, style: { size: 18, weight: 500, card: true, padding: 18 } },
    fields: [
      { key: "weekStart", label: "Week starts on", type: "select", options: [["sun", "Sunday"], ["mon", "Monday"]] },
      { key: "showTitle", label: "Show month name", type: "toggle" },
    ],
    mount(el, w) {
      const wrap = h("div", { class: "pb-cal" });
      el.append(wrap);
      let lastDay = -1;
      const tick = (now) => {
        if (now.getDate() === lastDay) return;
        lastDay = now.getDate();
        wrap.innerHTML = "";
        const mon = w.props.weekStart === "mon";
        if (w.props.showTitle)
          wrap.append(h("div", { class: "pb-cal-title" }, now.toLocaleDateString(undefined, { month: "long", year: "numeric" })));
        const grid = h("div", { class: "pb-cal-grid" });
        const names = [];
        for (let i = 0; i < 7; i++) {
          const dd = new Date(2024, 0, 7 + i + (mon ? 1 : 0)); // Jan 7 2024 is a Sunday
          names.push(dd.toLocaleDateString(undefined, { weekday: "narrow" }));
        }
        names.forEach((n) => grid.append(h("div", { class: "pb-cal-dow" }, n)));
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        let offset = first.getDay();
        if (mon) offset = (offset + 6) % 7;
        const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 0; i < offset; i++) grid.append(h("div"));
        for (let d = 1; d <= days; d++) grid.append(h("div", { class: "pb-cal-d" + (d === now.getDate() ? " today" : "") }, d));
        wrap.append(grid);
      };
      tick(new Date());
      return { tick };
    },
  },

  image: {
    label: "Image",
    icon: "🖼",
    group: "Media",
    defaults: { w: 30, h: 30, props: { src: "", fit: "cover", position: "center", link: "" }, style: { radius: 16 } },
    fields: [
      { key: "src", label: "Image", type: "image" },
      {
        key: "fit",
        label: "Fit",
        type: "select",
        options: [
          ["cover", "Fill (crop)"],
          ["contain", "Fit (no crop)"],
          ["fill", "Stretch"],
        ],
      },
      { key: "position", label: "Focus", type: "select", options: ["center", "top", "bottom", "left", "right"].map((x) => [x, x]) },
      { key: "link", label: "Link when clicked (interactive)", type: "text" },
    ],
    mount(el, w, ctx) {
      const p = w.props;
      if (!p.src) {
        el.append(h("div", { class: "pb-empty" }, "Choose an image →"));
        return {};
      }
      const img = h("img", {
        class: "pb-img",
        src: resolveUrl(p.src),
        alt: "",
        draggable: "false",
        style: { objectFit: p.fit || "cover", objectPosition: p.position || "center" },
      });
      if (p.link && ctx.mode === "view") el.append(h("a", { href: p.link, target: "_blank", rel: "noopener", class: "pb-fill" }, img));
      else el.append(img);
      return {};
    },
  },

  slideshow: {
    label: "Slideshow",
    icon: "🎞",
    group: "Media",
    defaults: { w: 34, h: 34, props: { images: [], interval: 8, fit: "cover", shuffle: false, kenburns: true }, style: { radius: 16 } },
    fields: [
      { key: "images", label: "Images", type: "images" },
      { key: "interval", label: "Seconds per image", type: "number", min: 2, max: 3600 },
      { key: "fit", label: "Fit", type: "select", options: [["cover", "Fill (crop)"], ["contain", "Fit (no crop)"]] },
      { key: "shuffle", label: "Shuffle", type: "toggle" },
      { key: "kenburns", label: "Slow zoom effect", type: "toggle" },
    ],
    mount(el, w) {
      const p = w.props;
      const list = (p.images || []).filter(Boolean);
      if (!list.length) {
        el.append(h("div", { class: "pb-empty" }, "Add images →"));
        return {};
      }
      const order = list.map((_, i) => i);
      if (p.shuffle) order.sort(() => Math.random() - 0.5);
      const box = h("div", { class: "pb-slides" + (p.kenburns ? " kb" : "") });
      el.append(box);
      let i = 0;
      const show = () => {
        const img = h("img", { src: resolveUrl(list[order[i % order.length]]), alt: "", style: { objectFit: p.fit } });
        img.onload = () => {
          box.append(img);
          requestAnimationFrame(() => img.classList.add("on"));
          const old = [...box.children].slice(0, -1);
          setTimeout(() => old.forEach((o) => o.remove()), 1600);
        };
        i++;
      };
      show();
      const t = setInterval(show, Math.max(2, p.interval || 8) * 1000);
      return { destroy: () => clearInterval(t) };
    },
  },

  video: {
    label: "Video",
    icon: "▶",
    group: "Media",
    defaults: { w: 36, h: 30, props: { src: "", fit: "cover", loop: true, muted: true }, style: { radius: 16 } },
    fields: [
      { key: "src", label: "Video file URL (.mp4/.webm) or YouTube/Vimeo link", type: "video" },
      { key: "fit", label: "Fit", type: "select", options: [["cover", "Fill (crop)"], ["contain", "Fit (no crop)"]] },
      { key: "loop", label: "Loop", type: "toggle" },
      { key: "muted", label: "Muted", type: "toggle", help: "Browsers only autoplay muted videos." },
    ],
    mount(el, w, ctx) {
      const p = w.props;
      if (!p.src) {
        el.append(h("div", { class: "pb-empty" }, "Add a video link →"));
        return {};
      }
      if (/youtu\.?be|vimeo\.com/.test(p.src)) {
        el.append(h("iframe", { class: "pb-frame", src: embedUrl(p.src), allow: "autoplay; encrypted-media; picture-in-picture", frameborder: 0 }));
        return {};
      }
      const v = h("video", {
        class: "pb-img",
        src: resolveUrl(p.src),
        autoplay: true,
        playsinline: true,
        muted: p.muted !== false,
        loop: p.loop !== false,
        style: { objectFit: p.fit },
      });
      v.muted = p.muted !== false;
      el.append(v);
      v.play().catch(() => {});
      return {};
    },
  },

  embed: {
    label: "Web page / embed",
    icon: "⧉",
    group: "Media",
    defaults: { w: 36, h: 40, props: { url: "", zoom: 100, refresh: 0, transparent: false }, style: { radius: 16 } },
    fields: [
      {
        key: "url",
        label: "URL",
        type: "text",
        help: "Any page that allows embedding. YouTube, Spotify and Vimeo links are converted automatically.",
      },
      { key: "zoom", label: "Zoom %", type: "range", min: 25, max: 200 },
      { key: "refresh", label: "Reload every N minutes (0 = never)", type: "number", min: 0, max: 1440 },
      { key: "transparent", label: "Transparent background", type: "toggle" },
    ],
    mount(el, w) {
      const p = w.props;
      if (!p.url) {
        el.append(h("div", { class: "pb-empty" }, "Paste a URL →"));
        return {};
      }
      const z = (p.zoom || 100) / 100;
      const frame = h("iframe", {
        class: "pb-frame",
        src: embedUrl(p.url),
        allow: "autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write",
        referrerpolicy: "strict-origin-when-cross-origin",
        frameborder: 0,
        style: {
          width: 100 / z + "%",
          height: 100 / z + "%",
          transform: `scale(${z})`,
          transformOrigin: "0 0",
          background: p.transparent ? "transparent" : "#fff",
        },
      });
      if (p.transparent) frame.setAttribute("allowtransparency", "true");
      el.append(frame);
      let t = null;
      if (p.refresh > 0) t = setInterval(() => (frame.src = frame.src), p.refresh * 60000);
      return { destroy: () => t && clearInterval(t) };
    },
  },

  weather: {
    label: "Weather",
    icon: "☀",
    group: "Info",
    defaults: {
      w: 26,
      h: 22,
      props: { location: "San Francisco", units: "f", days: 0, showCity: true, details: true },
      style: { size: 26, weight: 500, card: true, padding: 22 },
    },
    fields: [
      { key: "location", label: "City", type: "text", help: "Uses the free Open-Meteo API — no key needed." },
      { key: "units", label: "Units", type: "select", options: [["f", "°F"], ["c", "°C"]] },
      { key: "days", label: "Forecast days (0–7)", type: "number", min: 0, max: 7 },
      { key: "showCity", label: "Show city name", type: "toggle" },
      { key: "details", label: "Show high / low", type: "toggle" },
    ],
    mount(el, w) {
      const p = w.props;
      const box = h("div", { class: "pb-weather" }, h("div", { class: "pb-sub" }, "Loading weather…"));
      el.append(box);
      let alive = true;
      const load = async () => {
        try {
          const data = await getWeather(p.location, p.units);
          if (!alive) return;
          renderWeather(box, data, p);
        } catch (e) {
          if (alive) box.innerHTML = "", box.append(h("div", { class: "pb-sub" }, "Weather unavailable: " + e.message));
        }
      };
      load();
      const t = setInterval(load, 15 * 60000);
      return { destroy: () => ((alive = false), clearInterval(t)) };
    },
  },

  rotator: {
    label: "Rotating quotes",
    icon: "❝",
    group: "Info",
    defaults: {
      w: 50,
      h: 14,
      props: {
        lines:
          "The best way out is always through. — Robert Frost\nWell done is better than well said. — Benjamin Franklin\nWhat we think, we become. — Buddha\nStay hungry, stay foolish. — Stewart Brand",
        interval: 30,
        shuffle: true,
        daily: false,
      },
      style: { size: 28, weight: 400, italic: true },
    },
    fields: [
      { key: "lines", label: "One quote / message per line", type: "textarea" },
      { key: "interval", label: "Seconds between changes", type: "number", min: 3, max: 86400 },
      { key: "daily", label: "One per day instead", type: "toggle" },
      { key: "shuffle", label: "Shuffle", type: "toggle" },
    ],
    mount(el, w) {
      const p = w.props;
      const lines = (p.lines || "").split("\n").map((s) => s.trim()).filter(Boolean);
      const box = h("div", { class: "pb-text pb-rot" });
      el.append(box);
      if (!lines.length) return {};
      const order = lines.map((_, i) => i);
      if (p.shuffle) {
        // deterministic shuffle so reloads don't jump around too much
        let seed = lines.length * 9301 + 49297;
        for (let i = order.length - 1; i > 0; i--) {
          seed = (seed * 9301 + 49297) % 233280;
          const j = Math.floor((seed / 233280) * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
      }
      let cur = -1;
      const tick = (now) => {
        const step = p.daily ? 86400 : Math.max(3, p.interval || 30);
        const n = p.daily ? dayOfYear(now) + now.getFullYear() * 366 : Math.floor(now.getTime() / 1000 / step);
        const idx = order[n % order.length];
        if (idx === cur) return;
        cur = idx;
        box.classList.remove("on");
        setTimeout(() => {
          box.textContent = fillTokens(lines[idx], now);
          box.classList.add("on");
        }, box.textContent ? 400 : 0);
      };
      tick(new Date());
      return { tick };
    },
  },

  todo: {
    label: "To-do list",
    icon: "☑",
    group: "Interactive",
    defaults: {
      w: 24,
      h: 34,
      props: { title: "Today", items: "Drink water\nStretch\nShip something", allowAdd: true },
      style: { size: 22, weight: 500, card: true, padding: 22 },
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Starting items (one per line)", type: "textarea" },
      { key: "allowAdd", label: "Allow adding items from the wallpaper", type: "toggle" },
    ],
    note: "Checking items works when the dashboard is interactive. Ticks are saved on that Mac.",
    mount(el, w, ctx) {
      const p = w.props;
      const key = `pb:todo:${ctx.dashKey}:${w.id}`;
      const base = (p.items || "").split("\n").map((s) => s.trim()).filter(Boolean);
      const state = lsGet(key, { done: {}, extra: [], removed: {} });
      const root = h("div", { class: "pb-todo" });
      el.append(root);
      const save = () => lsSet(key, state);
      const render = () => {
        root.innerHTML = "";
        if (p.title) root.append(h("div", { class: "pb-todo-title" }, p.title));
        const ul = h("ul");
        const all = [...base, ...state.extra].filter((t) => !state.removed[t]);
        for (const t of all) {
          const done = !!state.done[t];
          const li = h(
            "li",
            { class: done ? "done" : "" },
            h("button", {
              class: "pb-check",
              "aria-label": done ? "Mark not done" : "Mark done",
              onclick: () => {
                state.done[t] = !done;
                save();
                render();
              },
            }),
            h("span", {}, t)
          );
          if (ctx.interactive && state.extra.includes(t)) {
            li.append(
              h("button", {
                class: "pb-x",
                "aria-label": "Remove",
                onclick: () => {
                  state.extra = state.extra.filter((x) => x !== t);
                  delete state.done[t];
                  save();
                  render();
                },
              }, "×")
            );
          }
          ul.append(li);
        }
        root.append(ul);
        if (p.allowAdd && ctx.interactive) {
          const input = h("input", { class: "pb-input", placeholder: "Add an item…" });
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && input.value.trim()) {
              state.extra.push(input.value.trim());
              save();
              render();
              root.querySelector(".pb-input")?.focus();
            }
          });
          root.append(input);
        }
        if (ctx.interactive && Object.values(state.done).some(Boolean)) {
          root.append(
            h("button", {
              class: "pb-link-btn",
              onclick: () => {
                state.done = {};
                save();
                render();
              },
            }, "Clear ticks")
          );
        }
      };
      render();
      return {};
    },
  },

  links: {
    label: "Links",
    icon: "🔗",
    group: "Interactive",
    defaults: {
      w: 40,
      h: 12,
      props: {
        links: "GitHub | https://github.com\nGmail | https://mail.google.com\nCalendar | https://calendar.google.com\nYouTube | https://youtube.com",
        layout: "row",
        icons: true,
        newWindow: true,
      },
      style: { size: 18, weight: 600 },
    },
    fields: [
      { key: "links", label: "Links — one per line as “Label | URL”", type: "textarea" },
      { key: "layout", label: "Layout", type: "select", options: [["row", "Row"], ["column", "Column"], ["grid", "Grid of tiles"]] },
      { key: "icons", label: "Show site icons", type: "toggle" },
      { key: "newWindow", label: "Open in a new window", type: "toggle" },
    ],
    note: "Links are clickable when the dashboard is interactive.",
    mount(el, w) {
      const p = w.props;
      const items = (p.links || "")
        .split("\n")
        .map((l) => l.split("|").map((s) => s.trim()))
        .filter((x) => x[0]);
      const box = h("div", { class: "pb-links pb-links-" + (p.layout || "row") });
      for (const [label, href0] of items) {
        const href = href0 || label;
        let host = "";
        try {
          host = new URL(href).hostname;
        } catch {}
        box.append(
          h(
            "a",
            { href, target: p.newWindow ? "_blank" : null, rel: "noopener" },
            p.icons && host ? h("img", { src: `https://icons.duckduckgo.com/ip3/${host}.ico`, alt: "", loading: "lazy" }) : null,
            h("span", {}, label)
          )
        );
      }
      el.append(box);
      return {};
    },
  },

  search: {
    label: "Search bar",
    icon: "⌕",
    group: "Interactive",
    defaults: { w: 40, h: 8, props: { engine: "google", custom: "", placeholder: "Search the web…" }, style: { size: 22, card: true } },
    fields: [
      {
        key: "engine",
        label: "Search with",
        type: "select",
        options: [
          ["google", "Google"],
          ["duckduckgo", "DuckDuckGo"],
          ["bing", "Bing"],
          ["kagi", "Kagi"],
          ["perplexity", "Perplexity"],
          ["custom", "Custom…"],
        ],
      },
      { key: "custom", label: "Custom URL (use %s for the query)", type: "text", showIf: (p) => p.engine === "custom" },
      { key: "placeholder", label: "Placeholder", type: "text" },
    ],
    note: "Typing works when the dashboard is interactive.",
    mount(el, w) {
      const p = w.props;
      const engines = {
        google: "https://www.google.com/search?q=%s",
        duckduckgo: "https://duckduckgo.com/?q=%s",
        bing: "https://www.bing.com/search?q=%s",
        kagi: "https://kagi.com/search?q=%s",
        perplexity: "https://www.perplexity.ai/search?q=%s",
      };
      const input = h("input", { class: "pb-search-input", placeholder: p.placeholder || "Search…", type: "search" });
      const form = h(
        "form",
        {
          class: "pb-search",
          onsubmit: (e) => {
            e.preventDefault();
            if (!input.value.trim()) return;
            const tpl = (p.engine === "custom" ? p.custom : engines[p.engine]) || engines.google;
            window.open(tpl.replace("%s", encodeURIComponent(input.value.trim())), "_blank");
            input.value = "";
          },
        },
        h("span", { class: "pb-search-icon" }, "⌕"),
        input
      );
      el.append(form);
      return {};
    },
  },

  timer: {
    label: "Timer / Pomodoro",
    icon: "⏱",
    group: "Interactive",
    defaults: { w: 24, h: 24, props: { minutes: 25, title: "Focus", mode: "timer" }, style: { size: 56, weight: 700, card: true } },
    fields: [
      { key: "mode", label: "Mode", type: "select", options: [["timer", "Countdown timer"], ["stopwatch", "Stopwatch"]] },
      { key: "minutes", label: "Minutes", type: "number", min: 1, max: 600, showIf: (p) => p.mode !== "stopwatch" },
      { key: "title", label: "Title", type: "text" },
    ],
    note: "Start/stop buttons work when the dashboard is interactive.",
    mount(el, w, ctx) {
      const p = w.props;
      const key = `pb:timer:${ctx.dashKey}:${w.id}`;
      const total = (p.minutes || 25) * 60000;
      const st = lsGet(key, { running: false, startedAt: 0, elapsed: 0 });
      const disp = h("div", { class: "pb-timer-n" });
      const btn = h("button", { class: "pb-btn" });
      const reset = h("button", { class: "pb-btn ghost" }, "Reset");
      el.append(
        h("div", { class: "pb-stack" }, p.title ? h("div", { class: "pb-sub" }, p.title) : null, disp, h("div", { class: "pb-row" }, btn, reset))
      );
      const elapsed = () => st.elapsed + (st.running ? Date.now() - st.startedAt : 0);
      const fmt = (ms) => {
        ms = Math.max(0, ms);
        const s = Math.floor(ms / 1000);
        const hh = Math.floor(s / 3600);
        const mm = Math.floor((s % 3600) / 60);
        const ss = s % 60;
        return (hh ? hh + ":" + String(mm).padStart(2, "0") : mm) + ":" + String(ss).padStart(2, "0");
      };
      const tick = () => {
        const e = elapsed();
        const left = p.mode === "stopwatch" ? e : total - e;
        disp.textContent = fmt(left);
        btn.textContent = st.running ? "Pause" : e ? "Resume" : "Start";
        if (p.mode !== "stopwatch" && st.running && left <= 0) {
          st.running = false;
          st.elapsed = total;
          lsSet(key, st);
          el.classList.add("pb-flash");
          setTimeout(() => el.classList.remove("pb-flash"), 4000);
        }
      };
      btn.onclick = () => {
        if (st.running) {
          st.elapsed = elapsed();
          st.running = false;
        } else {
          if (p.mode !== "stopwatch" && elapsed() >= total) st.elapsed = 0;
          st.running = true;
          st.startedAt = Date.now();
        }
        lsSet(key, st);
        tick();
      };
      reset.onclick = () => {
        st.running = false;
        st.elapsed = 0;
        lsSet(key, st);
        tick();
      };
      tick();
      return { tick };
    },
  },

  shape: {
    label: "Shape",
    icon: "■",
    group: "Basics",
    defaults: {
      w: 20,
      h: 20,
      props: { kind: "rect", fill: "", fill2: "", angle: 135, borderWidth: 0, borderColor: "" },
      style: { radius: 24 },
    },
    fields: [
      {
        key: "kind",
        label: "Shape",
        type: "select",
        options: [
          ["rect", "Rectangle"],
          ["circle", "Circle / ellipse"],
          ["line", "Line"],
          ["blob", "Glow blob"],
        ],
      },
      { key: "fill", label: "Fill color", type: "color" },
      { key: "fill2", label: "Second color (makes a gradient)", type: "color" },
      { key: "angle", label: "Gradient angle", type: "range", min: 0, max: 360, showIf: (p) => p.fill2 },
      { key: "borderWidth", label: "Outline width", type: "range", min: 0, max: 40 },
      { key: "borderColor", label: "Outline color", type: "color", showIf: (p) => p.borderWidth > 0 },
    ],
    mount(el, w) {
      const p = w.props;
      const fill = p.fill || "var(--pb-accent)";
      const bg = p.fill2 ? `linear-gradient(${p.angle ?? 135}deg, ${fill}, ${p.fill2})` : fill;
      const s = h("div", { class: "pb-shape pb-shape-" + p.kind, style: { background: bg } });
      if (p.borderWidth > 0) s.style.border = `${u(p.borderWidth)} solid ${p.borderColor || "currentColor"}`;
      if (p.kind === "rect") s.style.borderRadius = u(w.style.radius ?? 0);
      if (p.kind === "line") s.style.borderRadius = "999px";
      el.append(s);
      return {};
    },
  },

  html: {
    label: "Custom HTML",
    icon: "</>",
    group: "Advanced",
    defaults: {
      w: 30,
      h: 20,
      props: {
        code: '<div style="font:600 32px system-ui;color:white;display:grid;place-items:center;height:100vh">\n  Hello from HTML ✨\n</div>',
      },
      style: {},
    },
    fields: [
      {
        key: "code",
        label: "HTML, CSS & JavaScript",
        type: "code",
        help: "Runs in a sandboxed frame with a transparent background. Anything goes.",
      },
    ],
    mount(el, w) {
      const doc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent;overflow:hidden}</style></head><body>${w.props.code || ""}</body></html>`;
      const frame = h("iframe", {
        class: "pb-frame",
        sandbox: "allow-scripts allow-popups allow-forms",
        allowtransparency: "true",
        frameborder: 0,
        style: { background: "transparent" },
      });
      frame.srcdoc = doc;
      el.append(frame);
      return {};
    },
  },
};

export const WIDGET_GROUPS = ["Basics", "Time", "Media", "Info", "Interactive", "Advanced"];

function nextOccurrence(target, repeat, now) {
  const t = new Date(target);
  let guard = 0;
  while (t <= now && guard++ < 100000) {
    if (repeat === "yearly") t.setFullYear(t.getFullYear() + 1);
    else if (repeat === "monthly") t.setMonth(t.getMonth() + 1);
    else if (repeat === "weekly") t.setDate(t.getDate() + 7);
    else if (repeat === "daily") t.setDate(t.getDate() + 1);
    else break;
  }
  // jump quickly if very far in the past
  return t;
}

function autofit(outer, box) {
  box.style.fontSize = "";
  const max = 60;
  let i = 0;
  let scale = 1;
  while (i++ < max && (box.scrollHeight > outer.clientHeight + 1 || box.scrollWidth > outer.clientWidth + 1)) {
    scale *= 0.94;
    box.style.fontSize = scale + "em";
  }
}

// ---------- weather ----------

const WMO = {
  0: ["Clear", "☀️", "🌙"],
  1: ["Mostly clear", "🌤", "🌙"],
  2: ["Partly cloudy", "⛅️", "☁️"],
  3: ["Cloudy", "☁️", "☁️"],
  45: ["Fog", "🌫", "🌫"],
  48: ["Fog", "🌫", "🌫"],
  51: ["Drizzle", "🌦", "🌧"],
  53: ["Drizzle", "🌦", "🌧"],
  55: ["Drizzle", "🌧", "🌧"],
  56: ["Freezing drizzle", "🌧", "🌧"],
  57: ["Freezing drizzle", "🌧", "🌧"],
  61: ["Light rain", "🌦", "🌧"],
  63: ["Rain", "🌧", "🌧"],
  65: ["Heavy rain", "🌧", "🌧"],
  66: ["Freezing rain", "🌧", "🌧"],
  67: ["Freezing rain", "🌧", "🌧"],
  71: ["Light snow", "🌨", "🌨"],
  73: ["Snow", "🌨", "🌨"],
  75: ["Heavy snow", "❄️", "❄️"],
  77: ["Snow grains", "🌨", "🌨"],
  80: ["Showers", "🌦", "🌧"],
  81: ["Showers", "🌧", "🌧"],
  82: ["Heavy showers", "⛈", "⛈"],
  85: ["Snow showers", "🌨", "🌨"],
  86: ["Snow showers", "🌨", "🌨"],
  95: ["Thunderstorm", "⛈", "⛈"],
  96: ["Thunderstorm", "⛈", "⛈"],
  99: ["Thunderstorm", "⛈", "⛈"],
};

async function getWeather(location, units) {
  const cacheKey = `pb:wx:${location}:${units}`;
  const cached = lsGet(cacheKey, null);
  if (cached && Date.now() - cached.at < 10 * 60000) return cached.data;
  try {
    const geoKey = "pb:geo:" + location.toLowerCase();
    let geo = lsGet(geoKey, null);
    if (!geo) {
      const r = await fetch(
        "https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=" + encodeURIComponent(location.split(",")[0])
      );
      const j = await r.json();
      if (!j.results || !j.results.length) throw new Error("couldn't find “" + location + "”");
      geo = { lat: j.results[0].latitude, lon: j.results[0].longitude, name: j.results[0].name, tz: j.results[0].timezone };
      lsSet(geoKey, geo);
    }
    const q = new URLSearchParams({
      latitude: geo.lat,
      longitude: geo.lon,
      current: "temperature_2m,weather_code,is_day,apparent_temperature,wind_speed_10m,relative_humidity_2m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      timezone: "auto",
      forecast_days: 8,
      temperature_unit: units === "c" ? "celsius" : "fahrenheit",
      wind_speed_unit: units === "c" ? "kmh" : "mph",
    });
    const r = await fetch("https://api.open-meteo.com/v1/forecast?" + q);
    if (!r.ok) throw new Error("service error");
    const data = { ...(await r.json()), city: geo.name };
    lsSet(cacheKey, { at: Date.now(), data });
    return data;
  } catch (e) {
    if (cached) return cached.data;
    throw e;
  }
}

function renderWeather(box, d, p) {
  box.innerHTML = "";
  const c = d.current;
  const [desc, dayIcon, nightIcon] = WMO[c.weather_code] || ["", "🌡", "🌡"];
  const deg = "°";
  box.append(
    h(
      "div",
      { class: "pb-wx-now" },
      h("div", { class: "pb-wx-icon" }, c.is_day ? dayIcon : nightIcon),
      h(
        "div",
        {},
        h("div", { class: "pb-wx-temp" }, Math.round(c.temperature_2m) + deg),
        h("div", { class: "pb-sub" }, [p.showCity ? d.city : null, desc].filter(Boolean).join(" · "))
      )
    )
  );
  if (p.details && d.daily) {
    box.append(
      h(
        "div",
        { class: "pb-sub pb-wx-hl" },
        `H ${Math.round(d.daily.temperature_2m_max[0])}${deg}  L ${Math.round(d.daily.temperature_2m_min[0])}${deg}  · Feels ${Math.round(c.apparent_temperature)}${deg}`
      )
    );
  }
  const n = Math.min(7, Math.max(0, p.days | 0));
  if (n && d.daily) {
    const row = h("div", { class: "pb-wx-days" });
    for (let i = 1; i <= n; i++) {
      const date = new Date(d.daily.time[i] + "T12:00");
      row.append(
        h(
          "div",
          { class: "pb-wx-day" },
          h("div", { class: "pb-sub" }, date.toLocaleDateString(undefined, { weekday: "short" })),
          h("div", {}, (WMO[d.daily.weather_code[i]] || ["", "🌡"])[1]),
          h("div", {}, Math.round(d.daily.temperature_2m_max[i]) + deg),
          h("div", { class: "pb-sub" }, Math.round(d.daily.temperature_2m_min[i]) + deg)
        )
      );
    }
    box.append(row);
  }
}

// ---------- canvas ----------

function backgroundLayer(bg) {
  const layer = h("div", { class: "pb-bg" });
  bg = bg || { type: "color", color: "#111" };
  switch (bg.type) {
    case "gradient":
      layer.style.background = gradientCss(bg.gradient);
      if (bg.animated) layer.classList.add("pb-bg-animated");
      break;
    case "image":
      layer.style.backgroundColor = bg.color || "#000";
      if (bg.image) {
        layer.style.backgroundImage = cssUrl(bg.image);
        layer.style.backgroundSize = bg.fit === "contain" ? "contain" : bg.fit === "tile" ? "auto" : "cover";
        layer.style.backgroundRepeat = bg.fit === "tile" ? "repeat" : "no-repeat";
        layer.style.backgroundPosition = "center";
      }
      break;
    case "video":
      layer.style.backgroundColor = bg.color || "#000";
      if (bg.video) {
        if (/youtu\.?be|vimeo\.com/.test(bg.video)) {
          layer.append(h("iframe", { class: "pb-bg-frame pb-bg-yt", src: embedUrl(bg.video), allow: "autoplay; encrypted-media", frameborder: 0 }));
        } else {
          const v = h("video", { src: resolveUrl(bg.video), autoplay: true, muted: true, loop: true, playsinline: true });
          v.muted = true;
          layer.append(v);
          v.play().catch(() => {});
        }
      }
      break;
    case "embed":
      layer.style.backgroundColor = bg.color || "#000";
      if (bg.embed) layer.append(h("iframe", { class: "pb-bg-frame", src: embedUrl(bg.embed), allow: "autoplay; encrypted-media", frameborder: 0 }));
      break;
    default:
      layer.style.background = bg.color || "#111";
  }
  return layer;
}

export function aspectRatio(settings) {
  const a = (settings && settings.aspect) || "16:10";
  if (a === "screen") return window.screen.width / window.screen.height;
  const [x, y] = a.split(":").map(Number);
  return x && y ? x / y : 16 / 10;
}

function applyStyle(outer, inner, w, settings) {
  const s = w.style || {};
  outer.style.left = w.x + "%";
  outer.style.top = w.y + "%";
  outer.style.width = w.w + "%";
  outer.style.height = w.h + "%";
  outer.style.zIndex = 10 + (w.z || 0);
  outer.style.transform = w.rot ? `rotate(${w.rot}deg)` : "";
  outer.style.opacity = s.opacity != null && s.opacity !== "" ? s.opacity / 100 : "";
  outer.style.display = w.hidden ? "none" : "";

  const st = inner.style;
  st.fontFamily = s.font ? fontStack(s.font) : "";
  st.fontSize = u(s.size || 24);
  st.fontWeight = s.weight || "";
  st.color = s.color || "";
  st.fontStyle = s.italic ? "italic" : "";
  st.textTransform = s.uppercase ? "uppercase" : "";
  st.letterSpacing = s.letterSpacing ? `calc(var(--u) * ${s.letterSpacing / 10})` : "";
  st.lineHeight = s.lineHeight ? s.lineHeight / 100 : "";
  st.textAlign = s.align || "center";
  inner.dataset.align = s.align || "center";
  st.justifyContent = { left: "flex-start", right: "flex-end" }[s.align] || "center";
  st.alignItems = { top: "flex-start", bottom: "flex-end" }[s.valign] || "center";
  st.padding = s.padding != null && s.padding !== "" ? u(s.padding) : "";
  const radius = s.radius != null && s.radius !== "" ? u(s.radius) : s.card ? `calc(var(--u) * var(--pb-radius))` : "";
  st.borderRadius = radius;
  let bg = s.bg || (s.card ? "var(--pb-card)" : "");
  if (s.bg && s.bg2) bg = `linear-gradient(${s.bgAngle ?? 135}deg, ${s.bg}, ${s.bg2})`;
  st.background = bg;
  const blur = s.blur != null && s.blur !== "" ? s.blur : s.card ? null : 0;
  const bf = blur == null ? "blur(calc(var(--pb-blur) * 1px)) saturate(1.4)" : blur ? `blur(${blur}px) saturate(1.4)` : "";
  st.backdropFilter = bf;
  st.webkitBackdropFilter = bf;
  st.border = s.borderWidth ? `${u(s.borderWidth)} solid ${s.borderColor || "rgba(255,255,255,.25)"}` : "";
  const shadows = [];
  if (s.shadow) shadows.push(`0 calc(var(--u) * ${s.shadow / 3}) calc(var(--u) * ${s.shadow}) rgba(0,0,0,${Math.min(0.6, 0.15 + s.shadow / 120)})`);
  st.boxShadow = shadows.join(",");
  st.textShadow = s.textShadow ? `0 calc(var(--u) * 2) calc(var(--u) * ${s.textShadow}) rgba(0,0,0,.45)` : "";
  if (s.glow) st.textShadow = `0 0 calc(var(--u) * ${s.glow}) ${s.color || "var(--pb-accent)"}`;
  st.overflow = w.type === "shape" ? "visible" : "hidden";
  inner.className = "pb-in" + (s.card ? " pb-card" : "") + (s.className ? " " + s.className : "");
  inner.dataset.align = s.align || "center";
}

/**
 * Render a dashboard into `host`. Returns a controller.
 * ctx: { mode: "view" | "edit", interactive?: bool, dashKey: string }
 */
export function renderDashboard(host, doc, ctx = {}) {
  ctx = { mode: "view", ...ctx };
  const instances = new Map(); // widget id -> { el, inner, inst, w }
  let settings = doc.settings || defaultSettings();
  let currentWidgets = doc.widgets || [];
  ctx.interactive = ctx.mode === "view" && (ctx.interactive ?? !!settings.interactive);

  const canvas = h("div", { class: "pb-canvas" + (ctx.mode === "edit" ? " pb-editing" : "") });
  const bgHost = h("div", { class: "pb-bg-host" });
  const overlay = h("div", { class: "pb-overlay" });
  const layer = h("div", { class: "pb-layer" });
  const customStyle = h("style");
  canvas.append(bgHost, overlay, layer, customStyle);
  host.append(canvas);

  const ro = new ResizeObserver(() => {
    canvas.style.setProperty("--u", canvas.clientWidth / BASE_WIDTH + "px");
    for (const it of instances.values()) it.inst && it.inst.resize && it.inst.resize();
  });
  ro.observe(canvas);
  canvas.style.setProperty("--u", (canvas.clientWidth || host.clientWidth || 1440) / BASE_WIDTH + "px");

  let lastBg = "";
  let settingsKey = "";
  function applySettings(s) {
    settings = s;
    settingsKey = JSON.stringify(s);
    loadFont(s.font);
    const cs = canvas.style;
    cs.setProperty("--pb-font", fontStack(s.font || "System"));
    cs.setProperty("--pb-text", s.textColor || "#fff");
    cs.setProperty("--pb-accent", s.accent || "#8ab4ff");
    cs.setProperty("--pb-card", s.cardBg || "rgba(255,255,255,.08)");
    cs.setProperty("--pb-radius", s.cardRadius ?? 22);
    cs.setProperty("--pb-blur", s.cardBlur ?? 14);
    canvas.classList.toggle("pb-static", ctx.mode === "view" && !ctx.interactive);
    canvas.classList.toggle("pb-hide-cursor", ctx.mode === "view" && !ctx.interactive && s.hideCursor !== false);
    const bgKey = JSON.stringify(s.background);
    if (bgKey !== lastBg) {
      lastBg = bgKey;
      bgHost.innerHTML = "";
      const bg = ctx.thumb && /^(video|embed)$/.test(s.background?.type) ? { type: "color", color: s.background.color || "#111" } : s.background;
      bgHost.append(backgroundLayer(bg));
    }
    const o = s.overlay || {};
    overlay.style.background = o.color || "#000";
    overlay.style.opacity = (o.opacity || 0) / 100;
    const ob = o.blur ? `blur(${o.blur}px)` : "";
    bgHost.style.filter = ob;
    bgHost.style.inset = o.blur ? `-${o.blur * 2}px` : "0";
    customStyle.textContent = s.customCSS || "";
  }

  function mountWidget(w) {
    const type = WIDGETS[w.type];
    const outer = h("div", { class: `pb-w pb-t-${w.type}`, "data-id": w.id });
    const inner = h("div", { class: "pb-in" });
    outer.append(inner);
    applyStyle(outer, inner, w, settings);
    let inst = {};
    if (ctx.thumb && /^(embed|html|video)$/.test(w.type)) {
      inner.append(h("div", { class: "pb-empty", style: { fontSize: u(40), border: 0 } }, type.icon));
    } else if (type) {
      try {
        inst = type.mount(inner, w, ctx) || {};
      } catch (e) {
        console.error(e);
        inner.append(h("div", { class: "pb-empty" }, "Widget error"));
      }
    } else inner.append(h("div", { class: "pb-empty" }, "Unknown widget: " + w.type));
    return { el: outer, inner, inst, w, key: JSON.stringify(w) };
  }

  function setWidgets(widgets) {
    currentWidgets = widgets;
    const seen = new Set();
    widgets.forEach((w) => {
      seen.add(w.id);
      const key = JSON.stringify(w);
      const cur = instances.get(w.id);
      if (cur && cur.key === key) return;
      if (cur) {
        // Only geometry/visibility changed → no need to remount.
        const prev = JSON.parse(cur.key);
        const strip = (o) => JSON.stringify({ ...o, x: 0, y: 0, w: 0, h: 0, z: 0, rot: 0, hidden: 0, locked: 0, name: 0, style: { ...o.style, opacity: 0 } });
        const geomOnly = prev.type === w.type && strip(prev) === strip(w);
        if (geomOnly) {
          applyStyle(cur.el, cur.inner, w, settings);
          cur.w = w;
          cur.key = key;
          cur.inst.resize && requestAnimationFrame(() => cur.inst.resize());
          return;
        }
        cur.inst.destroy && cur.inst.destroy();
        const next = mountWidget(w);
        cur.el.replaceWith(next.el);
        instances.set(w.id, next);
        return;
      }
      const next = mountWidget(w);
      layer.append(next.el);
      instances.set(w.id, next);
    });
    for (const [id, it] of instances) {
      if (!seen.has(id)) {
        it.inst.destroy && it.inst.destroy();
        it.el.remove();
        instances.delete(id);
      }
    }
  }

  // one shared, second-aligned ticker
  let timer = null;
  const tickAll = () => {
    const now = new Date();
    for (const it of instances.values()) {
      if (it.inst.tick) {
        try {
          it.inst.tick(now);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };
  const schedule = () => {
    timer = setTimeout(() => {
      tickAll();
      schedule();
    }, 1000 - (Date.now() % 1000) + 5);
  };
  schedule();

  applySettings(settings);
  setWidgets(doc.widgets || []);

  return {
    canvas,
    layer,
    update(next) {
      const nextKey = JSON.stringify(next.settings || {});
      if (nextKey !== settingsKey) {
        // Theme values are CSS variables, so widgets pick them up automatically.
        applySettings(next.settings || {});
        requestAnimationFrame(() => {
          for (const it of instances.values()) it.inst.resize && it.inst.resize();
        });
      }
      setWidgets(next.widgets || []);
    },
    remount() {
      for (const it of instances.values()) {
        it.inst.destroy && it.inst.destroy();
        it.el.remove();
      }
      instances.clear();
      setWidgets(currentWidgets);
    },
    element(id) {
      return instances.get(id)?.el;
    },
    destroy() {
      clearTimeout(timer);
      ro.disconnect();
      for (const it of instances.values()) it.inst.destroy && it.inst.destroy();
      canvas.remove();
    },
  };
}

// ---------- new widget factory ----------

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function newWidget(type, overrides = {}) {
  const t = WIDGETS[type];
  const d = structuredClone(t.defaults);
  return {
    id: uid(),
    type,
    x: overrides.x ?? 50 - d.w / 2,
    y: overrides.y ?? 50 - d.h / 2,
    w: d.w,
    h: d.h,
    z: 0,
    rot: 0,
    ...overrides,
    props: { ...d.props, ...(overrides.props || {}) },
    style: { ...d.style, ...(overrides.style || {}) },
  };
}
