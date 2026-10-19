---
title: "Fahad SME Finance Copilot: Technical Documentation"
subtitle: "System architecture, core algorithms and security design"
date: "Version 1.0, 16 October 2026"
---

# 1. Purpose and scope

Fahad SME Finance Copilot helps owners of Bangladeshi small and medium businesses (SMEs) do four things: understand the financial health of their business, manage cash flow before problems appear, find the financing route that fits them, and estimate the income tax and VAT they will owe. Everything is localised for Bangladesh: amounts in taka with lakh/crore grouping, Bangla and English interface, the monthly VAT calendar, Eid and Pohela Boishakh cash cycles, and Bangladesh Bank refinance schemes.

The product is a client-side web application (installable as a phone app). It has no server and no user accounts. This document covers the system architecture, the core algorithms and the security design. Section 6 lists the automated tests.

# 2. System architecture

## 2.1 Design principles

| Principle | How it shows up |
|---|---|
| Privacy by design | All business data stays in the user's browser. No backend, no analytics, no accounts. |
| Offline-first | A service worker caches the app so it works without internet after the first visit. |
| Deterministic and explainable | Every number comes from a stated formula on the user's own inputs. Every alert and risk explains its reason and the action to take. No black-box model. |
| Bilingual by construction | Every user-facing string exists in English and Bangla, and the language switches instantly. |
| Zero dependencies | No framework or package is needed to run or test the app, which removes supply-chain risk. |

## 2.2 Component view

```
+---------------------------- User's phone or computer -----------------------------+
|                                                                                     |
|  index.html (shell + Content-Security-Policy)                                       |
|     |                                                                               |
|     +-- src/styles.css      light/dark theme, responsive layout                     |
|     +-- src/app.js                                                                  |
|           +-- State S ----------- inputs, one-off events, schema version            |
|           +-- Analysis engine ---- M(): margins, payment days, DSCR, health score   |
|           +-- Forecast engine ---- fc(): daily cash balance, VAT calendar (vday)    |
|           +-- Alert engine ------- alerts(): shortfall, VAT, Eid, collections       |
|           +-- Financing matcher -- O[] + fin(): eligibility, EMI, fit score         |
|           +-- Risk engine -------- risks(), stressRows(), levers(), plan()          |
|           +-- Copilot router ----- ask(): ordered intent rules, bilingual answers   |
|           +-- Backup/restore ----- bkExport(), bkImport(), clean(), snap()          |
|           +-- Tax engine --------- taxCalc(), vatCalc(), taxWin(), applyTax()       |
|           +-- Localisation ------- t(), num(), tk(), sh(), fd(): taka, Bangla digits|
|           +-- Renderers ---------- ov(), cf(), fin(), rk(): HTML for each tab       |
|                                                                                     |
|  sw.js (service worker)  manifest.json (installable app)                            |
|  localStorage: "bds" inputs, "bdl" language, "bdsnap" saved versions                |
+-------------------------------------------------------------------------------------+
          |  only third-party request: Google Fonts (Hind Siliguri, for Bangla text)
          v
   fonts.googleapis.com / fonts.gstatic.com
```

## 2.3 Data model

The whole application state is one object `S`, saved as JSON under the key `bds` with schema version `v: 2`.

| Group | Fields |
|---|---|
| Business profile | `name`, `type` (trade, mfg, svc, agro, rmg, tech), `years` |
| Monthly figures (Tk) | `rev` sales, `cogs` cost of goods, `opex` rent/wages/utilities, `emi` loan installments, `vat` monthly VAT/tax |
| Balance items (Tk) | `cash`, `ar` customer dues, `ap` supplier dues, `inv` stock, `minbal` safety cash minimum |
| Funding need | `need`, `purpose` (wc, eq, ex, re), `tenor`, `tl` trade license, `tin`, `coll` collateral, `woman` |
| Tax settings | `legal` (sole, firm, pvt), `cat` taxpayer category, `ntp`, `bank`, `tfloor`, `intr` yearly interest, `dep` other deductions, `invest`, `ait` tax already paid, `vmode` (std, tot, none), `vrate`, `vinp` VAT-invoiced purchases, `vfix` fixed turnover tax |
| One-off events | `ev[]`, each `{d: date, l: label, a: signed amount}` |

On load, a stored record with a different schema version drops the old events and falls back to current defaults, so updates never crash on old data.

## 2.4 Data flow

1. The user edits a field. `sv(key, element)` coerces the value (numbers become `Number`, text stays text).
2. `save()` writes `S` to `localStorage`.
3. `out()` recomputes and re-renders the Overview, Cash-flow, Financing and Risk views. No server round trip occurs.
4. A chat question goes through `ask()`, which reads the same state and returns text built from the user's numbers.

## 2.5 Bangladesh localisation layer

| Concern | Implementation |
|---|---|
| Currency format | Taka sign, Indian-style digit grouping (12,34,567), shorthand lakh and crore (`sh()`) |
| Language | `t(en, bn)` selects the string; Bangla digits are produced by `bd()` |
| Weekend | Friday and Saturday are non-working days in the VAT due-date rule |
| VAT | Monthly return and payment by the 15th, next working day if that is Friday/Saturday |
| Festivals | Eid-ul-Fitr (expected 10 Mar 2027) and Eid-ul-Adha (expected 17 May 2027) bonus events; Pohela Boishakh (14 April) Haal Khata collection advice |
| Tax | Income tax under the Finance Act 2026 (individual slabs by taxpayer category, flat firm and company rates, 1% turnover-tax floor), the 15th-of-month VAT rule, filing-window rebate and extra tax, advance-tax dates |
| Financing | Bangladesh Bank CMSME refinance schemes, bank and NBFI lending, MFI and mobile-wallet credit, CIB and trade-license/TIN requirements |

## 2.6 Backup, restore and saved versions

Because the data lives only in one browser, the app lets every user protect and move it without any server.

| Feature | How it works |
|---|---|
| Backup file or code | `bkExport()` writes a JSON document `{app, schema, exported, data}`. The user can download it as a file or copy it as text (a fallback for devices that block downloads). |
| Locked backup | With a passphrase, the data is encrypted in the browser using AES-256-GCM. The key is derived with PBKDF2-SHA-256 (600,000 iterations, random 16-byte salt); each backup has a random 12-byte IV. GCM authenticates the data, so a wrong passphrase or any change to the file is detected. The passphrase is never stored or sent anywhere and cannot be recovered. |
| Restore | `bkImport()` checks the size (at most 200,000 characters), the app name, the schema version and, for locked files, the cipher parameters (iterations must be between 100,000 and 1,000,000 so a hostile file cannot freeze the browser). The result passes through `clean()`. |
| Validation | `clean()` accepts only known fields: numbers must be finite and are limited to plus or minus 10^12, enums (business type, purpose) must be known values, text is cut to 80 characters, at most 100 events with valid dates and amounts are kept, and unknown fields are dropped. The same function protects restores from saved versions. |
| Saved versions | `snap()` keeps up to 7 snapshots under the key `bdsnap`: about one a day automatically, plus one before every reset or restore and one when the user presses "Save a version now". Each can be restored from the list, so a mistake can be undone. |

Backups are created only when the user asks for one. The file stays wherever the user saves it, so there is no cloud copy and no multi-device sync. Sync would need a server (see 4.4).

# 3. Core algorithms

## 3.1 Financial analysis

Let monthly sales be R, cost of goods C, overheads O, installments E, cash B, customer dues A, supplier dues P, stock I.

| Metric | Formula |
|---|---|
| Gross profit and margin | GP = R - C; margin = GP / R |
| Operating profit | OP = GP - O |
| Net profit after installments | NP = OP - E; net margin = NP / R |
| Customer payment days (DSO) | A / R x 30 |
| Supplier payment days (DPO) | P / C x 30 |
| Stock days (DIO) | I / C x 30 |
| Cash cycle | DSO + DIO - DPO |
| Cash cover (months) | B / (O + E) |
| Debt cover (DSCR) | OP / E (shown as 99 when there are no installments) |

Health score starts at 100 and loses points, with a floor of 5:

| Condition | Points lost |
|---|---|
| Gross margin below 15% | 10 |
| Net margin below 5% | 15 (a further 15 if below 0%) |
| DSO above 45 days | 10 (a further 5 above 60) |
| Cash cover below 2 months | 10 (a further 10 below 1) |
| DSCR below 1.25 | 15 |
| Cash cycle above 75 days | 10 |

All divisions are guarded so empty inputs return 0 or 99 instead of NaN or Infinity.

## 3.2 Cash-flow forecast

The forecast projects the closing cash balance B(t) for each day t over a 240-day horizon (about 8 months):

```
d      = (R - C - O - E) / 30                       daily run-rate
B(0)   = opening cash
B(t)   = B(t-1) + d - VAT * [t is a VAT due date] + sum of one-off events dated t
```

The VAT due date for a month is the 15th, shifted forward day by day while it falls on a Friday or Saturday (`vday`). One-off events (Eid bonuses, expected collections, planned purchases) are added on their dates.

Alerts are derived from the forecast and the metrics:

| Alert | Rule |
|---|---|
| Cash shortfall (red) | First day with B(t) < 0 |
| Below safety level (amber) | First day with B(t) < safety minimum |
| VAT due | Next VAT due date; amber when 7 days or fewer away |
| Eid bonus | Projected balance on the bonus date after paying it |
| Slow collection | DSO above 45 days |
| Monthly loss | Net profit below 0 |

The forecast is a planning tool. It assumes a steady run-rate and does not model seasonality unless the user adds one-off items.

## 3.3 Financing matcher

Ten funding routes are stored in the array `O`. Each has a rate range, amount limits, minimum years in business, document and collateral requirements, allowed purposes, optional sector restriction, and a source tag (`bb` official circular, `mk` market data, `es` estimate).

**Installment.** For loan P, monthly rate i = rate / 1200 and n months: EMI = P x i / (1 - (1 + i)^-n). With zero interest, EMI = P / n.

**Repayment cover after borrowing.** DSCR_after = OP / (E + EMI), using the midpoint of the route's rate range.

**Fit score.** Start at 45, then add or subtract, then clamp to 1..99.

| Factor | Effect |
|---|---|
| Purpose matches | +15, otherwise -25 |
| Amount inside the route's range | +10; below minimum -5; above maximum -25 |
| Years in business at least the minimum | +5, otherwise -25; a route for new businesses only -30 if older |
| Cost | round((13 - midpoint rate) x 0.8), so cheaper credit scores higher; +3 if the rate is from an official circular |
| Trade license required and missing | -20 |
| TIN required and missing | -15 |
| Collateral required and not offered | -20 |
| Sector-restricted route (agro, export) | +10 if the sector matches, -40 if not |
| Women-entrepreneur route | +10; the route is hidden entirely for other owners |
| DSCR_after at least 1.5 | +10; below 1.2 -8; below 1.0 -20 |
| Invoice discounting with customer dues under half the loan need | -15 |

Results are sorted by score. Each card shows reasons for and against, the estimated EMI, DSCR_after, and the source label so users can see which rates are official, market-based or estimates.

## 3.4 Risk engine

`risks()` converts the numbers into plain-language findings, each with severity and a corrective action. The overall rating is High if any red finding exists, Medium if two or more amber findings exist, otherwise Low.

| Finding | Red | Amber | Info |
|---|---|---|---|
| Forecast cash below zero / below safety level | any day below 0 | any day below safety minimum | |
| Cash cover | under 1 month | under 2 months | |
| Gross margin | zero or negative | under 15% | |
| Break-even (fixed costs / gross margin) | sales below break-even | less than 15% above | less than 25% above |
| Debt cover | DSCR under 1 | DSCR under 1.25 | |
| Customer payment days | over 60 | over 45 | |
| Stock days (non-service) | over 90 | over 60 | |
| Net result | loss after installments | | |
| Fixed costs share of sales | | over 30% | |
| Compliance | | no trade license; no TIN | yearly sales of Tk 20 lakh or more: confirm VAT or turnover-tax status |
| CIB record | | | always shown, because defaulters cannot use the CMSME refinance fund |

## 3.5 Stress test

`stressRows()` re-runs the metrics and the 240-day forecast under seven scenarios by temporarily swapping the state: today; sales down 10%, 20%, 30% (cost of goods moves with sales); material cost up 10%; overheads up 10%; and customers paying 15 days late (a one-off outflow of sales / 30 x 15). The verdict is Danger if the lowest cash is below zero or monthly profit is negative, Tight if the lowest cash is under the safety minimum, otherwise Safe.

## 3.6 Improvement levers and action plan

`levers()` quantifies each action in taka: price +2% (R x 0.02 a month), material cost -3% (C x 0.03), overheads -5% (O x 0.05), collect 10 days sooner (R / 30 x 10 once), sell 20% of stock (I x 0.2 once), 10 more days supplier credit (C / 30 x 10 once).

`plan()` builds 30-day, 90-day and 12-month actions from the same numbers, including the cash reserve target of three months of fixed costs, 3 x (O + E), and the monthly saving needed to reach it in 12 months.

## 3.7 Copilot router

The copilot is a deterministic, ordered list of intent rules (regular expressions in English and Bangla) over the user's question. The first match builds an answer from the live state. Rule order matters: Eid, risk, stress test, plan, growth ideas, loans, turnover/registration, VAT, dues, profit, cash alerts, then a help message. Guards prevent false matches, for example `\bplan\b` so that "explain" does not trigger the plan intent, and the Bangla VAT rule uses the full words rather than the short syllable that appears in many verbs. A rule-based design was chosen over a language model so answers are reproducible, work offline, cost nothing to run and never invent figures.

## 3.8 Tax module

The Tax tab estimates income tax for the income year 1 July 2026 to 30 June 2027 under the Finance Act 2026 (effective 1 July 2026), and monthly VAT. All figures are annualised from the monthly numbers (x 12).

**Taxable profit** T = max(0, (R - C - O) x 12 - yearly loan interest - other allowed deductions). Installments mix principal and interest, so the user enters the yearly interest separately.

**Sole proprietorship (individual slabs).** The tax-free limit depends on the category; income above it is taxed in bands.

| Category | Tax-free limit (Tk) |
|---|---|
| General taxpayer | 4,00,000 |
| Woman, or aged 65 or above | 4,50,000 |
| Person with disability or third gender | 5,25,000 |
| Gazetted war-wounded freedom fighter or July warrior | 5,50,000 |

| Band above the limit | Rate |
|---|---|
| Next Tk 3,00,000 | 10% |
| Next Tk 4,00,000 | 15% |
| Next Tk 5,00,000 | 20% |
| Next Tk 20,00,000 | 25% |
| Remainder | 30% |

Investment rebate = the lowest of 3% of T, 10% of the eligible investment and Tk 7,50,000, and never more than the slab tax. If T is above the limit, the tax after rebate is raised to the minimum tax (Tk 5,000, or Tk 1,000 for a first-time taxpayer). Check against the published example: T = Tk 12,00,000 gives 30,000 + 60,000 + 20,000 = Tk 1,10,000.

**Partnership firm and private company.** Flat 27.5% of T. A non-listed company that meets the banking-channel condition can use 25% (the user ticks this).

**Turnover-tax floor.** Where regular tax is lower than 1% of yearly gross receipts, the 1% applies even in a loss year. This is per the Finance Act 2026 guidance; small-business exceptions may exist, so the user can switch the floor off to see the figure without it.

**Result.** Income tax for the year = max(regular tax, floor). Net payable = that figure minus tax already deducted or paid (a negative result is shown as a credit). The screen also shows the effective rate, the monthly set-aside, profit after tax, and the same profit taxed under each legal form (income tax only, with a warning that it is not advice on choosing a form).

**Filing windows (individual returns).** Returns can be filed all year: 1 Jul to 30 Sep earns a 5% rebate on the tax (maximum Tk 25,000); 1 Oct to 31 Dec has no rebate and no extra tax; 1 Jan to 31 Mar adds 2% (at least Tk 3,000); 1 Apr to 30 Jun adds 5% (at least Tk 5,000). `taxWin()` finds the current window, shows the amounts and raises an alert. For companies, `advDates()` gives the advance-tax dates 15 Mar, 15 Jun, 15 Sep and 15 Dec.

**VAT.** Standard mode: monthly VAT = sales x rate - VAT-invoiced purchases x rate, assuming sales are quoted before VAT; a negative result is a credit carried forward. Simplified turnover-tax mode uses the fixed monthly amount entered by the user (the schemes' amounts vary by category and location and are not stored in the app). A third mode counts no VAT.

**Link to the forecast.** "Use in my cash-flow forecast" (`applyTax()`) sets the monthly VAT used by the forecast, and adds the income tax payment as a one-off event: a single payment on the end date of the current filing window (individual or firm), or up to four advance instalments (company). Pressing it again replaces these events, so nothing is duplicated.

**Not modelled:** surcharge on net wealth, employment income and its exemption, other income sources, dividend tax, withholding-tax rules, depreciation schedules, loss carry-forward, sector incentives and tax holidays.

# 4. Security design

## 4.1 Assets and trust boundaries

The only asset is the owner's business data (sales, costs, cash, dues, loan needs). It lives in the browser's `localStorage` on one device. There is no server component, so there is no server-side data store to breach. The trust boundaries are the user's device, the static host that serves the files, and Google Fonts.

## 4.2 Threats and controls

| Threat | Control | Residual risk |
|---|---|---|
| Business data leaves the device | No backend, no analytics, no third-party scripts. The Content-Security-Policy sets `connect-src 'self'`, so the page cannot send data to other sites. | Google Fonts sees the visitor's IP address when loading the font. Can be removed by self-hosting the font. |
| Cross-site scripting through user text (business name, event labels, chat) | User text is HTML-escaped before it is placed in the page (`esc()`), chat input has `<` neutralised, numeric inputs are coerced to numbers, and the app uses no `eval` or dynamic code. Tests verify escaping. | The policy still allows inline scripts (see 4.4). |
| Malicious or tampered files at the host | Served over HTTPS; security headers in `netlify.toml` (`nosniff`, frame denial, no referrer, restricted permissions, CSP). | Depends on the host account being secured with a strong password and two-factor sign-in. |
| Clickjacking | `X-Frame-Options: DENY` and `frame-ancestors 'none'`. | None expected. |
| Supply-chain attack through dependencies | The app has zero runtime or build dependencies. | None for the app. |
| Stale or poisoned cache | Service worker is same-origin and network-first, with a versioned cache name that is bumped on every release; `sw.js` is served with `no-cache`. | Users offline keep the last cached version. |
| Another person using the same device | Data is not encrypted at rest. | See 4.4: use a device lock; encryption is on the roadmap. |
| Wrong or outdated financial data misleads a user | Each loan route carries a source label (official, market, estimate) and date; every screen carries a not-advice notice; the Tax tab names the law and date it follows and lets the user switch off the turnover-tax floor; the README gives the update procedure. | Rates change; the data must be reviewed regularly. |
| Corrupt or old stored data crashes the app | Schema version check on load; parsing wrapped in `try/catch`; all storage calls guarded. | None expected. |
| Malicious or corrupted backup file | Size limit, format and version checks, cipher-parameter limits, full field-by-field sanitising in `clean()`, and escaping on display. Tests cover each case. | A restore replaces the current data, so the app saves the previous data as a version first. |
| Data lost (browser cleared, phone lost or changed) | Backup file or code, optionally locked with a passphrase; up to 7 saved versions on the device. | Saved versions live in the same browser, so only an exported backup survives losing the device. A forgotten passphrase cannot be recovered. |

## 4.3 Privacy

The app collects no personal data, sets no cookies, and has no accounts. Data stays on the device until the user clears the browser data, restores a backup or uses the Reset button (the app saves a version before either). Backups are created only on request and are stored wherever the user chooses. The user can use the app without a name or any identifying detail; only figures are needed.

## 4.4 Known limitations and roadmap

1. **Inline scripts are allowed by the policy.** The interface uses inline event handlers, so the policy contains `'unsafe-inline'` for scripts. Moving to event listeners would allow a strict policy.
2. **Live data is not encrypted at rest.** `localStorage` is readable by anyone with access to the unlocked browser profile. Exported backups can be locked with a passphrase (AES-256-GCM, section 2.6), but a locked live store is still a planned improvement. Use a device lock.
3. **Fonts are loaded from Google.** Self-hosting the Bangla font would remove the only third-party request.
4. **If a backend is added later** (for example bank statement upload or multi-device sync), it must add authentication, TLS, encryption at rest, explicit user consent, data minimisation, retention limits and an access log, and its compliance with Bangladesh's data protection requirements should be reviewed with a qualified adviser.

# 5. Data sources and update procedure

The Bangladesh figures below were checked against news and official-circular reporting on 16 October 2026. They are indicative, can change without notice, and must be confirmed with the lender or NBR.

| Item | Value used | Source tag |
|---|---|---|
| Bangladesh Bank policy rate | 9.50%, cut from 10% on 2 Aug 2026, held in the October policy | Bangladesh Bank, reported |
| Average lending rate (June 2026) | Banks 11.86%, NBFIs 13.75% | Bangladesh Bank data (market) |
| CMSME Working Capital Refinance Fund (June 2026) | Tk 5,000 crore revolving fund; customer rate at most 9%; 3 or 6 month grace; CIB-classified borrowers not eligible | Official circular (bb) |
| Women entrepreneur small-enterprise refinance | Up to 5%; limits by size, up to Tk 1 crore for small enterprises | Earlier circular (bb); confirm |
| New-entrepreneur refinance | 7%, up to Tk 30 lakh | Earlier circular (bb); confirm |
| Agro-processing industry refinance | 7%, up to Tk 10 crore | Earlier circular (bb); confirm |
| Commercial bank SME loan | 12 to 14% | Market (mk), above the all-bank average |
| NBFI term loan or lease | 13 to 16% | Market (mk) |
| Invoice discounting, back-to-back LC, microfinance, mobile-wallet credit | Ranges shown | Estimate (es) |
| VAT returns | Monthly, by the 15th; July-September 2026 returns extended to 25 Oct 2026 | NBR announcement, reported |
| VAT registration | Tk 30 lakh yearly turnover; budget proposed Tk 20 lakh; simplified turnover tax for small businesses | Budget FY2026-27, reported; confirm |
| Individual tax-free limit (AY 2026-27 and 2027-28) | Tk 4,00,000 general; 4,50,000 woman or 65+; 5,25,000 disability or third gender; 5,50,000 gazetted war-wounded freedom fighter or July warrior | Finance Act 2026, per a legal guide reviewed against NBR texts on 23 Aug 2026 |
| Individual slab rates | 10% next Tk 3 lakh, 15% next 4 lakh, 20% next 5 lakh, 25% next 20 lakh, 30% above; the 5% band was abolished | Same |
| Minimum tax | Tk 5,000; Tk 1,000 for a first-time taxpayer | Same |
| Investment rebate | Lowest of 3% of taxable income, 10% of investment, Tk 7.5 lakh | Same; other sources differ, so confirm |
| Firm and company rates | 27.5%; 25% for a non-listed company meeting the banking-channel condition | Same |
| Turnover tax | 1% of gross receipts when regular tax is lower (higher for tobacco, beverages, telecom) | Same |
| Return filing windows | 5% rebate (max Tk 25,000) Jul-Sep; none Oct-Dec; +2% (min Tk 3,000) Jan-Mar; +5% (min Tk 5,000) Apr-Jun | Same |
| Company advance tax dates | 15 Mar, 15 Jun, 15 Sep, 15 Dec | Same |
| VAT standard rate | 15% (7.5% for some local appliances) | Budget FY2026-27, reported |
| Simplified turnover tax (VAT side) | Fixed amount by business category and location, no VAT returns; amounts not stored in the app | Budget FY2026-27 summary |
| Eid dates | Eid-ul-Fitr about 10 Mar 2027, Eid-ul-Adha about 17 May 2027 | Expected, depends on moon sighting |

**Update procedure.** Edit the `O` array and the snapshot text in `fin()` in `src/app.js`, change the source tag and the as-of date, run `npm test`, increase the cache name in `sw.js`, then redeploy.

# 6. Testing and validation

`npm test` runs 49 automated tests with the built-in Node.js test runner (no packages). The app code is loaded into a sandbox with a fake page, so formulas and rendering are tested exactly as shipped.

| Area | What is verified |
|---|---|
| Maths | EMI against a known value (Tk 10 lakh, 12%, 36 months = Tk 33,214.31), zero-interest and zero-tenor cases; every ratio for the sample business; no NaN or Infinity with empty inputs |
| VAT calendar | 15th rule, Friday and Saturday shift, never a weekend over 36 months |
| Forecast | Daily run-rate, one-off events on their date, VAT deducted once per due date, shortfall alert |
| Loan matcher | Women-only route hidden unless applicable; sector routes score at least 40 points higher for the right sector; missing documents and short history reported; oversized loans flagged; scores bounded and sorted; official fund tagged and capped at 9% |
| Risk and planning | Stress scenarios move in the right direction; verdict logic; risk ordering and CIB note; plan reserve target; levers positive and sorted |
| Localisation | Lakh/crore grouping, Bangla digits, shorthand in both languages |
| Rendering | All screens and 14 chat questions in both languages across 5 business scenarios contain no NaN, undefined or Infinity |
| Security | HTML escaping of events, names and chat; local storage with schema version |
| Copilot | Intent routing, including the "explain" and Bangla VAT false-match guards |
| Backup and versions | Plain and locked round-trips; wrong passphrase, missing passphrase and tampered data rejected; foreign, oversized, wrong-version and hostile-iteration files rejected; sanitising of hostile values; restore keeps the old data as a version; 24-hour gate, 7-version cap and restore of saved versions; corrupted saved versions cannot break the app |
| Tax | Slabs against the published worked example and every boundary; limits by category; minimum tax and the first-time rate; investment rebate caps; firm and company rates; turnover-tax floor and its switch; credit for tax already paid; VAT in all three modes; filing windows and advance-tax dates; applying tax to the forecast without duplicates; no NaN in any language or legal form; alerts; copilot routing; new fields in backups and sanitising |
| Package | Service worker lists every file; manifest valid; page references the script |

To check that the tests are meaningful, the suite was also run against deliberately broken copies of the code (weekend shift removed, wrong interest divisor, iteration-limit guard removed, value clamping removed, slab rate changed, minimum tax removed, turnover floor removed); each run failed as expected.

A manual checklist before each release: open the app in English and Bangla on a phone; replace the sample numbers with real figures; confirm the forecast chart, alerts and loan cards update; install the app and test offline mode.

# 7. Deployment summary

The app is static files. Deploy to Netlify, GitHub Pages or Cloudflare Pages over HTTPS. Step-by-step instructions, the GitHub publishing commands and the phone install steps are in `README.md`. Bump the cache name in `sw.js` on each release.

# 8. Limitations and disclaimer

Rates, limits and eligibility are indicative. The fit score and health score are rules of thumb, not lender or credit-bureau decisions. The forecast is a steady-run-rate projection plus the one-off items the user adds. The business-type watch-outs and the rule-of-thumb targets (three-month reserve, about 30% maximum from one customer) are general good practice, not predictions. The application provides planning guidance and is not financial, tax or legal advice.
