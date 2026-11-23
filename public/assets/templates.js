// Starter dashboards.
import { defaultSettings, newWidget } from "./render.js";

const W = (type, x, y, w, h, props = {}, style = {}) => newWidget(type, { x, y, w, h, props, style });

export const TEMPLATES = [
  {
    key: "blank",
    name: "Blank canvas",
    desc: "Start from nothing.",
    make: () => ({ name: "My dashboard", settings: defaultSettings("midnight"), widgets: [] }),
  },
  {
    key: "minimal",
    name: "Minimal clock",
    desc: "A big clock, the date and a greeting.",
    make: () => ({
      name: "Minimal",
      settings: defaultSettings("midnight"),
      widgets: [
        W("clock", 20, 30, 60, 26, { hour12: true, ampm: false }, { size: 220, weight: 700, letterSpacing: -6 }),
        W("date", 25, 56, 50, 7, { format: "long" }, { size: 34, weight: 500, opacity: 80 }),
        W("text", 25, 66, 50, 7, { text: "{greeting}." }, { size: 26, weight: 400, opacity: 60 }),
      ],
    }),
  },
  {
    key: "countdown",
    name: "Big countdown",
    desc: "Count down to something you're excited about.",
    make: () => ({
      name: "Countdown",
      settings: defaultSettings("sunset"),
      widgets: [
        W("text", 20, 24, 60, 10, { text: "Until the holidays" }, { size: 44, weight: 600 }),
        W(
          "countdown",
          15,
          36,
          70,
          32,
          { title: "", target: `${new Date().getFullYear()}-12-25T00:00`, layout: "blocks", seconds: true, repeat: "yearly" },
          { size: 130, weight: 800, card: false }
        ),
        W("progress", 30, 76, 40, 8, { mode: "year", label: "{auto}" }, { size: 18 }),
      ],
    }),
  },
  {
    key: "productivity",
    name: "Productivity",
    desc: "Clock, weather, to-dos, calendar and quotes.",
    make: () => ({
      name: "Workspace",
      settings: { ...defaultSettings("ocean"), interactive: true, hideCursor: false },
      widgets: [
        W("clock", 4, 6, 40, 20, { hour12: true, showDate: true, dateFormat: "long" }, { size: 120, weight: 700, align: "left", letterSpacing: -3 }),
        W("weather", 72, 6, 24, 22, { location: "New York", units: "f", days: 0 }, { size: 22, card: true, padding: 22, align: "left" }),
        W("todo", 4, 36, 24, 40, {}, { size: 20, card: true, padding: 24 }),
        W("calendar", 72, 34, 24, 36, {}, { size: 17, card: true, padding: 20 }),
        W("search", 32, 42, 36, 8, {}, { size: 22, card: true }),
        W("links", 30, 54, 40, 9, {}, { size: 16 }),
        W("rotator", 15, 84, 70, 8, {}, { size: 22, italic: true, opacity: 80 }),
        W("progress", 72, 76, 24, 8, { mode: "day", label: "Today", percent: true, decimals: 0 }, { size: 16, align: "left" }),
      ],
    }),
  },
  {
    key: "world",
    name: "World clocks",
    desc: "Analog clocks for the places your people are.",
    make: () => {
      const cities = [
        ["America/Los_Angeles", "San Francisco"],
        ["America/New_York", "New York"],
        ["Europe/London", "London"],
        ["Asia/Tokyo", "Tokyo"],
      ];
      return {
        name: "World clocks",
        settings: defaultSettings("nord"),
        widgets: cities.map(([tz, label], i) =>
          W("analog", 8 + i * 22, 30, 18, 36, { tz, label, seconds: true, ticks: true }, { size: 26, weight: 600 })
        ),
      };
    },
  },
  {
    key: "retro",
    name: "Retro terminal",
    desc: "Green-screen vibes with a live status readout.",
    make: () => ({
      name: "Terminal",
      settings: { ...defaultSettings("retro"), customCSS: ".pb-canvas::after{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.25) 0 2px,transparent 2px 4px);z-index:99}" },
      widgets: [
        W(
          "text",
          6,
          8,
          60,
          30,
          { text: "> SYSTEM ONLINE\n> {weekday}, {date}\n> DAY {dayofyear} — {daysleft} DAYS REMAIN\n> {greeting}, OPERATOR_" },
          { size: 40, align: "left", valign: "top", lineHeight: 130, glow: 12 }
        ),
        W("clock", 60, 70, 36, 20, { hour12: false, seconds: true }, { size: 110, align: "right", glow: 18 }),
      ],
    }),
  },
];
