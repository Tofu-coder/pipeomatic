# PipeOmatiC.io

An original BME 100 Group 2 showcase. Vite, React, TypeScript, Tailwind CSS, and GSAP. Static files only; no server, analytics, accounts, or robot connection.

## Run locally

Requires Node.js 22.12+ (Node 22 LTS recommended) and npm.

```sh
npm ci
npm run dev
```

Open the Local address printed by Vite. To verify the production version:

```sh
npm run build
npm run preview
```

## Publish free with GitHub Pages

Create an empty **public** GitHub repository named `pipeomatic` (do not initialize it with a README). In Terminal, from this project folder, replace `YOUR_USERNAME` with your GitHub account:

```sh
git init -b main
git add .
git commit -m "Build PipeOmatiC showcase"
git remote add origin https://github.com/YOUR_USERNAME/pipeomatic.git
git push -u origin main
```

In the repository, choose **Settings → Pages → Build and deployment → Source → GitHub Actions**. Open **Actions → Deploy to GitHub Pages → Run workflow** if the first push happened before Pages was enabled. The workflow’s environment link shows the published address, normally `https://YOUR_USERNAME.github.io/pipeomatic/`.

Every future push to `main` rebuilds and publishes the site. `npm ci` uses the committed lockfile. The workflow gets the base path from GitHub’s `configure-pages` action, supporting project repositories, account sites, and configured custom domains. PDF links use the same base path.

To manually test a project path on macOS:

```sh
BASE_PATH=/pipeomatic/ npm run build
BASE_PATH=/pipeomatic/ npm run preview
```

Open the preview URL with `/pipeomatic/` appended. Ordinary local development uses `/`.

The name PipeOmatiC.io does not require a custom domain. GitHub Pages provides the free `github.io` address. No CNAME is included; configure a custom domain only if you own it.

## Content and implementation boundaries

- All nine team members follow the elevator pitch. No roles were inferred.
- Original SVG gantry schematics interpret the slide concepts; they are not fabricated hardware, engineering CAD, or a validated model.
- Studio implements a selectable 8 × 12 plate, distinct-well checks, a 1–200 µL demo input range, four-step preview, reset, and clipboard JSON export. The range is illustrative, not a hardware specification.
- Selection and volume remain locked during playback. The preview reports completion without implying physical execution. Clipboard failure produces an on-page message.
- Python execution, OT-2 integration, Isaac Sim work, cost analysis, and bench validation are future work. No measured performance is claimed.
- Motion respects the operating system’s reduced-motion preference. Navigation, inputs, and wells support keyboard interaction, visible focus, labels, and completion announcements.

## Files

`src/main.tsx`: story, source links, team, schematic, Studio interaction.

`src/style.css`: responsive visual system and reduced-motion rules.

`.github/workflows/deploy.yml`: GitHub Pages build and deployment.

## Checks performed

Production TypeScript/Vite build; root and `/pipeomatic/` base-path builds; browser selection and volume validation; transfer completion; desktop/mobile visual review. See `QA.md` for details.
