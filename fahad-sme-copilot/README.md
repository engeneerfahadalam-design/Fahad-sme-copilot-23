# Fahad SME Finance Copilot (Bangladesh)

A bilingual (English / বাংলা) finance copilot for Bangladeshi small-business owners. It runs entirely in the browser, works offline once installed, and keeps all business data on the user's own device.

**GitHub repository:** https://github.com/fahad123/fahad-sme-copilot

## What it does

| Area | Features |
|---|---|
| Business analysis | Margins, customer/supplier payment days, cash cycle, debt cover (DSCR), 0-100 health score, next-step tips |
| Cash-flow management | 8-month daily cash forecast, one-off items (Eid bonus, dues, purchases), alerts for shortfalls, VAT deadlines and festival payments |
| Financing match | Ranks 10 Bangladeshi funding routes by fit, shows estimated EMI and repayment cover, lists missing documents, labels every rate by source |
| Risk and planning | Risk check, 7-scenario stress test, improvement levers in taka, 30-day / 90-day / 12-month action plan |
| Tax | Income tax and VAT estimate under the Finance Act 2026: individual slabs by taxpayer category, flat firm and company rates, 1% turnover-tax floor, filing-window savings, monthly VAT; can feed the cash forecast |
| Data safety | Backup file or code (optionally locked with a passphrase), restore on any device, 7 automatic saved versions |
| Copilot chat | Rule-based answers to questions on Eid bonus, loans, VAT, dues, profit, risk, stress test, plan |

Bangladesh specifics: taka with lakh/crore grouping and Bangla digits, monthly VAT return on the 15th (moved to the next working day when it falls on Friday/Saturday), Eid-ul-Fitr and Eid-ul-Adha bonuses, Pohela Boishakh Haal Khata, CMSME refinance schemes, CIB, trade license, TIN/BIN.

## Quick start

No build step and no dependencies.

```bash
git clone https://github.com/fahad123/fahad-sme-copilot.git
cd fahad-sme-copilot
python3 -m http.server 8080      # or: npm start
# open http://localhost:8080
```

Opening `index.html` directly also works, but the install-as-app features need `http://localhost` or HTTPS.

## Run the tests

Requires Node.js 18 or newer. There are no packages to install.

```bash
npm test
```

49 automated tests cover the financial formulas, VAT calendar, forecast, loan matcher, risk engine, stress test, taka/Bangla formatting, HTML escaping, tax calculation, backup and restore, copilot routing and package integrity. They run on every push through GitHub Actions (`.github/workflows/ci.yml`).

## Backup and restore

All data is stored in the user's own browser. To protect it or move it to another phone:

1. Open the Overview tab and scroll to **Backup and restore**.
2. Optional: type a passphrase to lock the backup. Keep it safe; it cannot be recovered.
3. Press **Download backup file** (or **Show backup code** and copy the text).
4. On the new device, open the app, choose the file or paste the code, enter the passphrase if you used one, and press **Restore**.

The app also keeps up to 7 saved versions on the device (about one a day, plus one before every reset or restore) so mistakes can be undone. There is no cloud sync: backups stay wherever you save them. Multi-device sync would need a server, see `docs/TECHNICAL_DOCUMENTATION.md` section 4.4.

## Deployment

The app is static files, so any static host works. It must be served over HTTPS for phone installation.

**Netlify (fastest)**
1. Go to https://app.netlify.com/drop and drag this folder onto the page.
2. In the project settings, change the project name to get a link like `https://fahad-sme-copilot.netlify.app`.
3. `netlify.toml` already sets the security headers.

**GitHub Pages**
1. Push the repository (below).
2. Repository Settings, then Pages, then "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Your link is `https://fahad123.github.io/fahad-sme-copilot/`.

**Cloudflare Pages / Vercel:** import the repository, leave the build command empty and set the output directory to `.`.

**Install on a phone:** open the HTTPS link. Android Chrome: menu, then "Install app". iPhone Safari: Share, then "Add to Home Screen".

After changing any file, bump the cache name in `sw.js` (`sme-copilot-vN`) so users receive the update.

## Publish to GitHub

```bash
cd fahad-sme-copilot
git init -b main
git add .
git commit -m "Fahad SME Finance Copilot v1.0"
# create an empty repo named fahad-sme-copilot on github.com, then:
git remote add origin https://github.com/fahad123/fahad-sme-copilot.git
git push -u origin main
```

## Project structure

```
index.html            page shell and Content-Security-Policy
src/app.js            all logic and UI (state, formulas, forecast, matcher, risk engine, copilot)
src/styles.css        light/dark theme styles
sw.js, manifest.json  offline support and installable-app metadata
icons/                app icons
tests/                harness.js (sandbox) and core.test.js (49 tests)
docs/                 TECHNICAL_DOCUMENTATION.md / .pdf
netlify.toml          host config and security headers
.github/workflows/    CI
```

## Keeping rates current

Loan data lives in the `O` array in `src/app.js` and the dated policy-rate snapshot in the `fin()` function. Each option has a source tag: `bb` official Bangladesh Bank circular, `mk` market rate from Bangladesh Bank data, `es` estimate to confirm with the lender. Tax constants are `TH` (tax-free limits), `SLAB` (bands) and `taxCalc()` in the Tax section of `src/app.js`. Update the numbers, change the "as of" date, run `npm test`, bump `sw.js`, and redeploy.

## Limitations

Rates, limits and eligibility are indicative and change often. The fit score is a rule of thumb, not a lender decision. The forecast uses a steady monthly run-rate plus the one-off items you add. This is planning guidance, not financial, tax or legal advice. Confirm terms with your bank and accountant.

## License

MIT, see `LICENSE`.
