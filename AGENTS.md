# solar-dashboard

Static HTML demo hub for Globaltronic Intertrade's solar business (GitHub org
`globaltronic-intertrade`, repo `solar-dashboard`). GitHub Pages publishes `main` — `main` is prod,
so every change goes branch → PR → merge. Layout and page list: `README.md`.

## Commands

- `bun run serve` — local preview at http://127.0.0.1:8765
- `bun run format` / `bun run verify` — Prettier + `scripts/check-links.mjs` (no broken local src/href)

## Conventions

- One folder per page, entry file `index.html`, kebab-case folder names; shared assets in `assets/`.
- **No customer work here** — this repo is public. Customer project dashboards live in their own
  private repos; only generic templates with sample data belong in this site.
- Dashboards load `assets/fit-screen.js` as the first element in `<body>` (scale-to-fit, no scroll on
  landscape screens ≥1201 px; `?fit=0` turns it off). Sample data and Globaltronic names only.
- Landing page copy lives in the `MESSAGES` dictionary in `index.html` (i18n layer, locale `th`).
- Known debt: the moved pages still hardcode their copy and colors; the calculator formats money inline.
