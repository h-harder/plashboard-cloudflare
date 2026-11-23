<p align="center">
  <img src="public/assets/favicon.svg" width="72" alt="Plashboard logo" />
</p>

<h1 align="center">Plashboard</h1>

<p align="center">
  <b>Design a living desktop wallpaper — then show it with <a href="https://sindresorhus.com/plash">Plash</a>.</b><br />
  Clocks, countdowns, weather, to-dos, photos, web pages, custom HTML… drag them anywhere, style everything,<br />
  and get one link to paste into Plash. Self-hosted, free, and deployed in one click.
</p>

---

## How it works

1. **Deploy your own Plashboard** with one of the buttons below (takes about a minute, free tier is plenty).
2. **Open your new site and create your login** — just a username and password.
3. **Design your dashboard** in the drag-and-drop editor.
4. **Click “Get Plash link”**, then paste the link into Plash (or click **Add to Plash**).
5. Your dashboard is now your full-screen wallpaper. Edit it any time — your wallpaper updates by itself within ~20 seconds.

## One-click deploy

Pick any one host:

| Host | Button | Storage | Setup after clicking |
| --- | --- | --- | --- |
| **Cloudflare** (recommended) | [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/h-harder/plashboard) | Workers KV (created for you) | None |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/h-harder/plashboard) | Netlify Blobs (built in) | None |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fh-harder%2Fplashboard&project-name=plashboard&repository-name=plashboard&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22upstash-kv%22%2C%22integrationSlug%22%3A%22upstash%22%7D%5D) | Upstash Redis (free) | Add the Upstash Redis store if prompted ([details](#vercel)) |
| **Docker / any server** | — | Files on disk | `docker run` ([details](#self-hosting-docker--node)) |

Each button copies this repo into your own GitHub account and deploys it. You get your own private URL like `https://plashboard.<you>.workers.dev`.

> **Tip:** once you've created your login, you can lock the door so nobody else can sign up — see [Sign-ups](#sign-ups).

## What you can put on your dashboard

**Widgets**

| | |
| --- | --- |
| **Text** | Any text, with live tokens like `{time}`, `{date}`, `{weekday}`, `{greeting}`, `{daysleft}`. Double-click to type right on the canvas. |
| **Clock** | Digital, 12/24h, seconds, blinking colon, any time zone, optional date & label. |
| **Analog clock** | Ticks, numbers, custom face/hand colors, any time zone — great for world clocks. |
| **Date** | Seven formats, any time zone. |
| **Countdown** | Days/hours/minutes/seconds to any date. Repeats yearly/monthly/weekly/daily (birthdays!), counts up afterwards, or shows a “done” message. |
| **Progress bar** | How far through today, this week, month, year — or any custom date range. |
| **Calendar** | Month view with today highlighted. |
| **Image** | Upload or link. Fill, fit or stretch. Paste or drag images straight onto the canvas. |
| **Slideshow** | Rotate through photos with crossfades and a slow zoom. |
| **Video** | MP4/WebM files or YouTube/Vimeo links, muted & looping. |
| **Web page / embed** | Any embeddable page — YouTube, Spotify, Google Calendar, a stock chart, your Home Assistant… with zoom and auto-refresh. |
| **Weather** | Current conditions + up to 7-day forecast, °F/°C. No API key (uses [Open-Meteo](https://open-meteo.com)). |
| **Rotating quotes** | A list of quotes/messages that rotate on a timer or once per day. |
| **To-do list** | Tick things off right on your wallpaper (interactive mode). |
| **Links** | A row, column or grid of bookmarks with site icons. |
| **Search bar** | Google, DuckDuckGo, Bing, Kagi, Perplexity or your own. |
| **Timer / Pomodoro** | Countdown timer or stopwatch with start/pause/reset. |
| **Shape** | Rectangles, circles, lines, gradient glow blobs, glass panels. |
| **Custom HTML** | Write any HTML/CSS/JS — it runs in a sandboxed frame. Anything goes. |

**Styling — on every widget:** any font (50 built in + any Google Font by name), size, weight, color, alignment, italics, uppercase, letter spacing, line height, background color or gradient, frosted-glass blur, corner radius, padding, border, shadow, text shadow, neon glow, opacity, rotation, layering, lock/hide.

**Dashboard-wide:** 12 themes (Midnight, Paper, Sunset, Ocean, Forest, Synthwave, Nord, Mono, Pastel, Aurora, Retro Terminal, Latte), backgrounds (color, linear/radial/conic gradient, animated gradient, image, video, YouTube, or a whole web page), background tint & blur, default font & colors, glass-card style, screen shape (MacBook notch sizes, 16:9, ultrawide, portrait…), and your own custom CSS.

**Editor:** drag to move, handles to resize (⇧ keeps proportions), smart alignment guides (hold ⌥ to skip), arrow keys to nudge, ⌘Z / ⇧⌘Z undo/redo, ⌘C/⌘V/⌘D copy/paste/duplicate, ⌫ delete, layers panel, autosave, starter templates, duplicate/export/import dashboards as JSON.

## Interactive vs. static

Every dashboard has an **Interactive** switch (in **Get Plash link** or **Dashboard settings**):

- **Static (default)** — a pure wallpaper. It ignores the mouse and hides the cursor over it, so it never gets in the way.
- **Interactive** — links, to-do checkboxes, search bars, timers and embedded pages respond to clicks and typing. In Plash, turn on **Browsing Mode** from its menu bar icon so clicks reach the wallpaper (turn it off to use your desktop icons again).

## Using it with Plash

1. Install [Plash](https://sindresorhus.com/plash) (free on the Mac App Store).
2. In Plashboard, open your dashboard and click **Get Plash link**.
3. Click **Add to Plash** — or copy the link, then choose **Add Website…** from Plash's menu bar icon and paste it.

Good to know:

- Each dashboard has its own unique, unguessable link (`/d/…`). Anyone with the link can *view* it but not edit it. You can **Make a new link** at any time, which turns off the old one.
- The wallpaper checks for changes every 20 seconds and also refreshes when your Mac wakes. If the Mac is offline at login, it shows the last version it saw.
- You can make several dashboards (e.g. one per monitor, or “work” and “weekend”) and add each one to Plash.
- Viewer link options: `?interactive=1` / `?interactive=0` to override the setting, `?poll=60` to change the refresh interval in seconds (`0` turns it off).

## Sign-ups

By default anyone who finds your Plashboard URL can create a login (they only ever see their own dashboards). To restrict that, set the `REGISTRATION` environment variable:

| Value | Meaning |
| --- | --- |
| `open` | Anyone can sign up (default). |
| `invite` | Sign-up needs the code in `INVITE_CODE`. Setting `INVITE_CODE` alone also turns this on. |
| `closed` | Nobody new can sign up. Existing logins keep working. |

Where to set it:

- **Cloudflare:** Workers & Pages → your worker → Settings → Variables and Secrets (or edit `vars` in `wrangler.jsonc`).
- **Netlify:** Site configuration → Environment variables, then redeploy.
- **Vercel:** Project → Settings → Environment Variables, then redeploy.
- **Docker / Node:** `-e REGISTRATION=closed`.

## Host-specific notes

### Cloudflare

The **Deploy to Cloudflare** button forks the repo, creates the `PLASHBOARD_KV` namespace automatically, and deploys a Worker that serves both the app and the API. Every push to your fork redeploys it.

Prefer **Cloudflare Pages** with a Git connection instead? That works too: create a Pages project from your fork with **no build command** and build output directory **`public`**. Then go to Settings → Bindings → add a **KV namespace** binding named **`PLASHBOARD_KV`** and redeploy. (The `functions/` folder provides the API on Pages.)

To run the Worker locally: `npm install && npm run dev:cf`.

### Netlify

Nothing to configure — the API runs as a Netlify Function and data is stored in Netlify Blobs, which every site gets automatically.

### Vercel

The API runs as a Vercel Function and stores data in an Upstash Redis database (free tier). The deploy button tries to add one for you. If it didn't, open your project → **Storage** → **Create Database** → **Upstash for Redis** (Upstash KV), connect it to the project, and redeploy. The project needs the variables `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`), which the integration adds for you.

### Self-hosting (Docker / Node)

Works on any server, Raspberry Pi, Railway, Fly.io, Render (with a disk), etc. Data is saved as files in `DATA_DIR`.

```bash
docker build -t plashboard .
```

```bash
docker run -d --name plashboard -p 8787:8787 -v plashboard-data:/data plashboard
```

Or without Docker (Node 18+):

```bash
npm install && npm start
```

Then open <http://localhost:8787>. Environment variables: `PORT` (default `8787`), `DATA_DIR` (default `./data`), `REGISTRATION`, `INVITE_CODE`.

> If you self-host, put it behind HTTPS (e.g. Caddy, Cloudflare Tunnel or Tailscale) so your login cookie is sent securely. Plash itself runs on your Mac, so even `http://` on your home network works for the wallpaper.

## Security & privacy

- Passwords are hashed with PBKDF2-SHA256 and a per-user salt; sessions are random tokens stored hashed, in `HttpOnly`, `SameSite=Lax` cookies that last 30 days.
- Login and sign-up are rate-limited. All writes require JSON, which blocks cross-site form attacks.
- Dashboard links are 16 random characters. Viewing never reveals who owns a dashboard.
- Custom HTML widgets run in a sandboxed iframe, separate from the app.
- Uploaded files (images up to 8 MB; big photos are shrunk in your browser first) are stored in your own deployment.
- Weather lookups go from the viewer directly to Open-Meteo; site icons in Links come from DuckDuckGo; fonts come from Google Fonts. Nothing else leaves your deployment.

## Project layout

```
public/            static front end — no build step
  index.html       sign in / create login
  app/             the editor app (dashboards list + editor)
  d/               the wallpaper viewer used by Plash (/d/<link>)
  assets/
    render.js      renders dashboards; defines every widget type and theme
    editor.js      the drag-and-drop editor
    app.js, ui.js, templates.js, *.css
src/
  core.js          the API (auth, dashboards, uploads) — one web-standard handler
  worker.js        Cloudflare Workers entry
  stores/          storage adapters: Cloudflare KV, Netlify Blobs, Upstash Redis, files
functions/         Cloudflare Pages entry
netlify/functions/ Netlify entry
api/               Vercel entry
server.js          Node/Docker server
test/              API tests (npm test)
```

### Adding your own widget

Widgets live in the `WIDGETS` object in [`public/assets/render.js`](public/assets/render.js). Each one declares a label, icon, default size/props, the fields shown in the editor, and a `mount(element, widget, ctx)` function that draws it (optionally returning `tick(now)` to update every second and `destroy()` to clean up). The editor builds its settings panel from the `fields` list automatically — no other changes needed.

## Development

```bash
npm install
```

```bash
npm run dev
```

That starts the Node server with auto-reload on <http://localhost:8787>. Run the API tests with `npm test`.

## License

MIT
