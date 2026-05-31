# Deploying Joyous Living

This is your runbook for taking the redesigned site live at **www.joyousliving.org** and setting up the browser-based admin so you can edit Q&As without touching code.

The path: **GitHub repo → Netlify deploy → custom domain → admin panel**. Total time: ~30–45 min the first time.

---

## What you'll need

- A free **GitHub** account ([github.com/signup](https://github.com/signup))
- A free **Netlify** account ([app.netlify.com/signup](https://app.netlify.com/signup)) — sign in with GitHub for the smoothest setup
- Access to **Squarespace Domains** ([domains.squarespace.com](https://domains.squarespace.com)) where `joyousliving.org` is registered
- Git installed locally (you already have it on this machine)

---

## Step 1 — Put the site on GitHub

From this folder (`C:\AccenturePresentation\joyous-living-redesign`):

```powershell
git init
git add .
git commit -m "Initial Joyous Living redesign"
```

Then create a new empty repo on github.com (call it `joyous-living`, keep it Public or Private — either works). Don't add a README or .gitignore on creation.

GitHub will show you commands. Run the two lines under **"…or push an existing repository from the command line"** — they'll look like:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/joyous-living.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub.

---

## Step 2 — Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com), click **Add new site → Import an existing project**.
2. Choose **GitHub**, authorize Netlify, and pick your `joyous-living` repo.
3. Build settings: leave everything blank (no build command, publish directory is the repo root). Click **Deploy site**.
4. Within ~30 seconds you'll get a URL like `dreamy-tesla-9b2c4f.netlify.app`. Open it — your site is live.
5. (Optional) **Site settings → Change site name** → something like `joyous-living`.

✅ Site is live at a Netlify URL.

---

## Step 3 — Turn on the admin panel (Decap CMS + Netlify Identity)

This is what lets you edit Q&As at `yoursite.com/admin/` instead of editing JSON.

1. In your Netlify site dashboard, go to **Integrations → Identity** (older accounts: **Site configuration → Identity**) and click **Enable Identity**.
2. Under **Registration**, set it to **Invite only** (so randoms can't sign up).
3. Scroll to **Services → Git Gateway** and click **Enable Git Gateway**. (This is what lets the CMS save changes back to GitHub on your behalf.)
4. Still in Identity, click **Invite users**, enter your email, and click Send.
5. You'll get an invite email. Click the link — it'll take you to `yoursite.netlify.app/#invite_token=...`. Set your password.
6. After setting your password, you should be redirected to `/admin/`. If not, go to `https://yoursite.netlify.app/admin/` and log in.

✅ You can now edit Q&As at `/admin/`. Try it: add a question, change an answer, hit **Publish**. Within ~30 seconds the live site updates (Netlify rebuilds automatically when the CMS commits to GitHub).

---

## Step 4 — Point joyousliving.org at Netlify

Right now `joyousliving.org` points to Google Sites. You'll switch the DNS to Netlify.

### 4a. Add the domain in Netlify

1. Netlify site dashboard → **Domain management → Add custom domain** → enter `joyousliving.org`.
2. Netlify will say "Check DNS configuration". It'll show you records to add (an `A` record for the apex, a `CNAME` for `www`).

### 4b. Update DNS at Squarespace Domains

Your nameservers are currently `ns-cloud-a*.googledomains.com` (legacy from Google Domains). You have two options:

**Option A — Easiest: change nameservers to Netlify's** (Netlify manages DNS for you)

1. Log into [domains.squarespace.com](https://domains.squarespace.com).
2. Click `joyousliving.org` → **DNS** or **Advanced DNS settings**.
3. Find **Nameservers** and switch from "Squarespace nameservers / custom" to Netlify's:
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - `dns3.p01.nsone.net`
   - `dns4.p01.nsone.net`
   (Netlify will show you the exact four to use in **Domain management → Set up Netlify DNS**.)
4. Save.

**Option B — Keep DNS at Squarespace, add records pointing to Netlify**

1. Same panel, but instead of changing nameservers, add records:
   - **A record** — Host: `@`, Value: `75.2.60.5` (Netlify's load balancer IP)
   - **CNAME record** — Host: `www`, Value: `yoursite.netlify.app`
2. Remove the existing A/CNAME records pointing to Google Sites.

### 4c. Wait for propagation

DNS changes take 15 minutes to a few hours (rarely up to 48). You can check progress at [dnschecker.org](https://dnschecker.org).

### 4d. HTTPS

Once DNS resolves, Netlify auto-provisions a free Let's Encrypt SSL cert. After ~5 minutes, `https://www.joyousliving.org` works.

✅ Your domain now points to the new site.

---

## Step 5 — Unpublish the Google Site

In Google Sites, open the old site → **Publish dropdown → Unpublish**. This prevents the old version from appearing if anyone has a direct Google Sites link.

---

## How to make content changes from now on

### Editing Q&As (via admin panel)

1. Go to `https://www.joyousliving.org/admin/`
2. Log in with the email you were invited with.
3. Click **Q&A → Questions & Answers**.
4. Add, edit, or delete questions. Drag to reorder.
5. Click **Publish → Publish now**.
6. The live site updates in ~30 seconds.

Behind the scenes: the CMS commits the change to `content/qa.json` on GitHub, Netlify sees the new commit, redeploys, and you're done.

### Editing other text (hero, mission, seminars, etc.)

Currently these are in `index.html`. Two options:
- **Quick edits**: edit the file on GitHub (github.com → your repo → `index.html` → pencil icon → Commit) — site rebuilds automatically.
- **Want them in the admin panel too?** Tell me and I'll add them to `admin/config.yml` as additional collections (same approach as Q&A — extract the text into a data file, render with JS).

### Inviting other editors

Netlify dashboard → **Identity → Invite users**. They get the same `/admin/` access.

---

## Troubleshooting

**"The admin panel says 'config error' or won't load"**
Check that `admin/config.yml` was pushed to GitHub. The CMS reads it from your repo.

**"Identity widget says Git Gateway not configured"**
Confirm Step 3.3 — Git Gateway must be enabled separately from Identity.

**"DNS isn't resolving after a few hours"**
Use [dnschecker.org](https://dnschecker.org/#A/joyousliving.org) to see if propagation finished. If records look correct but Netlify still shows "Awaiting external DNS", give it another hour.

**"I want to test locally before pushing"**
The Q&A loads from `content/qa.json` via `fetch()`. `fetch()` doesn't work from `file://` URLs in most browsers, so to test locally serve the folder with:
```powershell
npx serve .
```
Then open `http://localhost:3000`.

---

## File map

```
joyous-living-redesign/
├── index.html              ← main page
├── styles.css              ← design system
├── script.js               ← interactions + Q&A renderer
├── content/
│   └── qa.json             ← Q&A data (edited via CMS)
├── admin/
│   ├── index.html          ← CMS entry point
│   └── config.yml          ← CMS schema
└── DEPLOY.md               ← this file
```

---

Ping me anytime if you hit a snag in any step.
