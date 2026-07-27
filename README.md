# Files

Holding files for website publication.

## Local checks before pushing to GitHub

To avoid broken commits and extra fix-up pushes, run automated checks on this machine first:

```bash
npm test
```

That runs `node scripts/verify.mjs`, which:

- Runs `node --check` on every `*.js` file in the project root (syntax errors).
- Parses `gallery-data.json` and checks required `sections` keys and picture fields (`id`, `name`, `imageUrl`).

No install step is required (no npm dependencies). You need **Node.js** installed (v18+ recommended).

Optional — preview the site locally before deploy:

```bash
npm run serve
```

Then open the URL it prints (port **3333**). This uses `npx serve` once; it may download the `serve` package on first run.
