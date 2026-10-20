const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const { load } = require('./harness');
const { run, els, store } = load();

const J = x => JSON.parse(JSON.stringify(x));               // cross-realm safe copy
const reset = (patch = {}, lang = 'en') => run(`S=Object.assign(DEF(),${JSON.stringify(patch)});L='${lang}'`);
const close = (a, b, e = 0.01) => assert.ok(Math.abs(a - b) <= e, `${a} is not within ${e} of ${b}`);
const fit = (prefix) => J(run(`fin().find(x=>x.o.n[0].startsWith(${JSON.stringify(prefix)}))`));
const ZERO = { rev: 0, cogs: 0, opex: 0, emi: 0, vat: 0, ev: [] };

// ---------- 1. Core financial maths ----------
test('EMI matches the standard amortisation formula', () => {
  close(run('pmt(1000000,12,36)'), 33214.31);
  close(run('pmt(120000,0,12)'), 10000);          // 0% interest
  assert.equal(run('pmt(500000,10,0)'), 500000);  // zero tenor does not divide by zero
});

test('Ratios for the sample business are exact', () => {
  reset(); const m = J(run('M()'));
  close(m.gm, 1 / 3, 1e-9); close(m.nm, 0.1, 1e-9);
  close(m.op, 150000, 1e-6); close(m.net, 120000, 1e-6);
  close(m.dso, 15, 1e-9); close(m.dpo, 11.25, 1e-9); close(m.dio, 15, 1e-9);
  close(m.ccc, 18.75, 1e-9); close(m.dscr, 5, 1e-9); close(m.cover, 1.25, 1e-9);
  assert.equal(m.h, 90);
});

test('Health score falls for a struggling business', () => {
  reset({ rev: 500000, cogs: 450000, opex: 200000, emi: 50000, cash: 20000, ar: 900000 });
  assert.ok(run('M()').h < 30);
});

test('Zero or empty inputs never produce NaN or Infinity', () => {
  reset({ rev: 0, cogs: 0, opex: 0, emi: 0, cash: 0, ar: 0, ap: 0, inv: 0, vat: 0, need: 0, tenor: 0 });
  const m = J(run('M()'));
  for (const k of ['gm', 'nm', 'dso', 'dpo', 'dio', 'ccc', 'cover', 'dscr', 'h']) assert.ok(Number.isFinite(m[k]), k);
});

// ---------- 2. Bangladesh VAT calendar ----------
test('VAT is due on the 15th and moves off Friday/Saturday', () => {
  assert.equal(run('iso(vday(2026,9))'), '2026-10-15');   // Thursday
  assert.equal(run('iso(vday(2026,10))'), '2026-11-15');  // Sunday
  assert.equal(run('iso(vday(2027,0))'), '2027-01-17');   // 15th is Friday -> Sunday
  assert.equal(run('iso(vday(2026,7))'), '2026-08-16');   // 15th is Saturday -> Sunday
  for (let m = 0; m < 36; m++) { const d = run(`vday(2026,${m}).getDay()`); assert.ok(d !== 5 && d !== 6); }
});

// ---------- 3. Cash-flow forecast ----------
test('Forecast deducts VAT once per due date', () => {
  reset({ ...ZERO, vat: 1000, cash: 100000 });
  const F = run('fc(240)'), end = F[F.length - 1].b;
  const today = run('iso(new Date())'), last = run('iso(new Date(Date.now()+240*864e5))');
  let n = 0;
  for (let m = 0; m < 10; m++) { const d = run(`iso(vday(new Date().getFullYear(),new Date().getMonth()+${m}))`); if (d > today && d <= last) n++; }
  close(end, 100000 - 1000 * n, 0.001);
});

test('One-off events land on their date', () => {
  const d = run('addD(10)');
  reset({ ...ZERO, cash: 50000, ev: [{ d, l: 'x', a: -20000 }] });
  const F = run('fc(30)');
  assert.equal(F[9].b, 50000); assert.equal(F[10].b, 30000);
});

test('Daily run-rate accumulates correctly', () => {
  reset({ ...ZERO, rev: 100000, opex: 70000, cash: 5000 });   // +30,000 a month = +1,000 a day
  close(run('fc(10)')[10].b, 15000, 1e-6);
});

test('A cash shortfall raises a red alert', () => {
  reset({ ...ZERO, rev: 100000, cogs: 60000, opex: 80000, cash: 10000 });
  assert.equal(run('alerts(fc(240),M())[0][0]'), 'r');
});

// ---------- 4. Financing matcher ----------
test('Women-only scheme appears only for women-owned businesses', () => {
  reset({ woman: false }); assert.ok(!run('fin().map(x=>x.o.n[0])').join('|').includes('Women'));
  reset({ woman: true });  assert.ok(run('fin().map(x=>x.o.n[0])').join('|').includes('Women'));
});

test('Sector-specific schemes score far higher for the right sector', () => {
  reset({ type: 'trade', purpose: 'eq', need: 2000000 }); const a = fit('Agro-processing').s;
  reset({ type: 'agro', purpose: 'eq', need: 2000000 });  const b = fit('Agro-processing').s;
  assert.ok(b - a >= 40, `${a} vs ${b}`);
});

test('Missing documents and short history are reported', () => {
  reset({ tl: false, tin: false, years: 1 });
  const bad = JSON.stringify(fit('Commercial').bad);
  assert.ok(bad.includes('Needs a trade license') && bad.includes('Needs a TIN') && bad.includes('Needs 2+ years'));
});

test('Oversized loans are flagged by debt-service cover', () => {
  reset({ need: 50000000, years: 5, coll: true });
  assert.ok(JSON.stringify(fit('Commercial').bad).includes('Profit may not cover installments'));
});

test('Scores are bounded and sorted high to low', () => {
  for (const t of ['trade', 'mfg', 'svc', 'agro', 'rmg', 'tech']) {
    reset({ type: t, woman: true }); const s = J(run('fin().map(x=>x.s)'));
    s.forEach(v => assert.ok(v >= 1 && v <= 99));
    for (let i = 1; i < s.length; i++) assert.ok(s[i - 1] >= s[i]);
  }
});

test('The June 2026 CMSME working-capital fund is tagged official and capped at 9%', () => {
  reset(); const f = fit('CMSME Working Capital');
  assert.equal(f.o.s, 'bb'); assert.deepEqual(f.o.r, [9, 9]); assert.ok(f.o.d[0].includes('CIB'));
});

// ---------- 5. Risk engine, stress test, plan ----------
test('Stress scenarios move in the right direction', () => {
  reset(); const r = J(run('stressRows()'));
  assert.equal(r.length, 7);
  assert.ok(r[0].net > r[1].net && r[1].net > r[2].net && r[2].net > r[3].net);
  close(r[4].net, 120000 - 80000, 1e-6);           // +10% material cost
  assert.ok(r[6].lo < r[0].lo);                    // late payment hurts the cash low point
  assert.equal(r[0].v, 'ok');
});

test('Stress verdict turns tight when cash is below the safety level', () => {
  reset({ cash: 1000 }); assert.equal(run('stressRows()')[0].v, 'tight');
});

test('Risk list is ordered high, medium, info and always carries the CIB note', () => {
  reset(); let r = J(run('risks()')); const o = { r: 0, w: 1, i: 2 };
  for (let i = 1; i < r.length; i++) assert.ok(o[r[i - 1].s] <= o[r[i].s]);
  assert.equal(r[r.length - 1].s, 'i'); assert.ok(r.some(x => x.h.includes('CIB')));
  assert.ok(r.some(x => x.s === 'w'));             // sample cash cover is only 1.25 months
  reset({ rev: 500000, cogs: 450000, opex: 200000, emi: 50000, cash: 20000 });
  assert.ok(J(run('risks()')).some(x => x.s === 'r'));
  reset({ tl: false }); assert.ok(J(run('risks()')).some(x => x.h.includes('trade license')));
});

test('Action plan has three horizons and states the 3-month cash reserve target', () => {
  reset({ cash: 100000 }); run('fin()');
  const P = J(run('plan()')); assert.equal(P.length, 3);
  assert.ok(P[1].join(' ').includes('8.4 lakh'));  // (250,000 + 30,000) x 3 = 840,000
});

test('Improvement levers are positive and sorted', () => {
  reset(); const v = J(run('levers()')); assert.ok(v.length >= 5);
  v.forEach(x => assert.ok(x[1] > 0)); for (let i = 1; i < v.length; i++) assert.ok(v[i - 1][1] >= v[i][1]);
});

// ---------- 6. Bangladesh localisation ----------
test('Taka formatting uses lakh/crore grouping and Bangla digits', () => {
  reset(); assert.equal(run('num(1234567)'), '12,34,567'); assert.equal(run('tk(-5000)'), '-৳5,000');
  assert.equal(run('sh(15000000)'), '৳1.5 crore'); assert.equal(run('sh(250000)'), '৳2.5 lakh');
  reset({}, 'bn'); assert.equal(run('num(1234567)'), '১২,৩৪,৫৬৭'); assert.equal(run('sh(15000000)'), '৳১.৫ কোটি');
});

test('Both languages render every screen without NaN/undefined/Infinity', () => {
  const bad = /NaN|undefined|Infinity|\[object/;
  const cases = [{}, { ...ZERO, cash: 0, ar: 0, ap: 0, inv: 0, need: 0, tenor: 0 }, { woman: true, years: 0, tl: false, tin: false, type: 'agro' }, { type: 'rmg', purpose: 'ex', need: 5000000 }, { ev: [] }];
  for (const L of ['en', 'bn']) for (const c of cases) {
    reset(c, L); run('lang()');
    for (const k of ['#ov', '#al', '#ch', '#evl', '#fm', '#rk', '#nv', '#f_pr', '#f_fn', '#bkbox', '#bklist', '#tx', '#f_tx']) assert.ok(!bad.test(els[k].innerHTML), `${L} ${k}`);
    for (const q of ['risk', 'stress test', 'plan', 'ideas to grow', 'eid bonus', 'loan', 'vat', 'dues', 'profit', 'cash alert', 'hello', 'ঝুঁকি', 'ভ্যাট', 'নগদ']) assert.ok(!bad.test(run(`ask(${JSON.stringify(q)})`)), `${L} ask ${q}`);
  }
});

// ---------- 7. Security ----------
test('User-entered text is HTML-escaped', () => {
  reset({ ev: [{ d: '2030-01-01', l: '<img src=x onerror=alert(1)>', a: -1 }] }); run('cf()');
  assert.ok(!els['#evl'].innerHTML.includes('<img') && els['#evl'].innerHTML.includes('&lt;img'));
  reset({ name: '"><script>x</script>' });
  const f = run(`fld(['name','Name','নাম','t'])`);
  assert.ok(!f.includes('<script>') && f.includes('&quot;&gt;&lt;script'));
});

test('Chat input is escaped before display', () => {
  run('C.length=0;say("<b>hi</b>")'); assert.ok(els['#chat'].innerHTML.includes('&lt;b>hi') || els['#chat'].innerHTML.includes('&lt;b&gt;'));
});

test('Data is stored locally only, with a schema version', () => {
  reset(); run(`sv('rev',{type:'number',value:'777'})`);
  const s = JSON.parse(store.bds); assert.equal(s.rev, 777); assert.equal(s.v, 2);
});

// ---------- 8. Copilot routing ----------
test('Copilot routes questions to the right answer', () => {
  reset(); assert.ok(run('ask("risk")').includes('•'));
  assert.ok(run('ask("explain this")').includes('Try asking'));      // "plan" inside "explain" must not trigger the plan intent
  assert.ok(run('ask("turnover tax")').includes('turnover tax'));
  assert.ok(run('ask("eid bonus")').toLowerCase().includes('bonus'));
  reset({}, 'bn'); assert.ok(run('ask("আদায় করব")').includes('পাওনা'));  // Bangla "করব" must not trigger VAT
  assert.ok(run('ask("ভ্যাট")').includes('ভ্যাট'));
});

// ---------- 9. Package integrity ----------
test('Every file the app and service worker need exists', () => {
  const root = path.join(__dirname, '..');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  for (const f of ['./src/app.js', './src/styles.css', './manifest.json', './icons/icon-192.png', './icons/icon-512.png']) {
    assert.ok(sw.includes(f), `sw.js missing ${f}`); assert.ok(fs.existsSync(path.join(root, f)), `${f} missing`);
  }
  const man = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  assert.ok(man.name && man.short_name && man.icons.length >= 2);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('src/app.js') && html.includes('Content-Security-Policy'));
});

// ---------- 10. Backup, restore and saved versions ----------
const SECRET = 'correct horse battery';
const mine = { rev: 777000, name: 'Rahim Traders', cash: 12345, ev: [{ d: '2027-01-01', l: 'Loan fee', a: -5000 }] };

test('Plain backup round-trips', async () => {
  reset(mine); const text = await run('bkExport("")');
  assert.equal(JSON.parse(text).app, 'fahad-sme-copilot');
  const n = J(await run(`bkImport(${JSON.stringify(text)},"")`));
  assert.equal(n.rev, 777000); assert.equal(n.name, 'Rahim Traders'); assert.equal(n.ev[0].l, 'Loan fee');
});

test('Locked backup hides the data and needs the right passphrase', async () => {
  reset(mine); const text = await run(`bkExport(${JSON.stringify(SECRET)})`);
  assert.ok(!text.includes('Rahim') && !text.includes('777000') && text.includes('AES-GCM'));
  const n = J(await run(`bkImport(${JSON.stringify(text)},${JSON.stringify(SECRET)})`));
  assert.equal(n.rev, 777000);
  await assert.rejects(async () => run(`bkImport(${JSON.stringify(text)},"wrong")`), e => e.message === 'badpass');
  await assert.rejects(async () => run(`bkImport(${JSON.stringify(text)},"")`), e => e.message === 'needpass');
  const b = JSON.parse(text); b.ct = (b.ct[0] === 'A' ? 'B' : 'A') + b.ct.slice(1);   // tamper
  await assert.rejects(async () => run(`bkImport(${JSON.stringify(JSON.stringify(b))},${JSON.stringify(SECRET)})`), e => e.message === 'badpass');
});

test('Bad, foreign, oversized or hostile backup files are rejected', async () => {
  const rej = (txt, code) => assert.rejects(async () => run(`bkImport(${JSON.stringify(txt)},"x")`), e => e.message === code);
  await rej('not json', 'format'); await rej('{"app":"other","schema":2,"data":{}}', 'format');
  await rej('{"app":"fahad-sme-copilot","schema":3,"data":{}}', 'version');
  await rej('x'.repeat(200001), 'big');
  const evil = { app: 'fahad-sme-copilot', schema: 2, enc: { alg: 'AES-GCM', kdf: 'PBKDF2-SHA256', iter: 9e9, salt: 'AAAA', iv: 'AAAA' }, ct: 'AAAA' };
  await rej(JSON.stringify(evil), 'format');                       // huge iteration count must not hang the browser
});

test('Imported data is validated and sanitised', () => {
  const ev = Array.from({ length: 150 }, (_, i) => ({ d: '2027-02-01', l: 'e' + i, a: 1 })).concat([{ d: 'bad', l: 'x', a: 1 }, { d: '2027-13-45', l: 'x', a: 1 }, { d: '2027-02-01', l: 'x', a: 'NaN' }]);
  const c = J(run(`clean(${JSON.stringify({ rev: 'abc', cash: 1e30, type: 'evil', purpose: 'zzz', tenor: 99999, years: -4, name: 'x'.repeat(500), tl: 'yes', ev, unknown: 'drop me' })})`));
  assert.equal(c.rev, 1200000);            // not a number: keep default
  assert.equal(c.cash, 1e12);              // clamped
  assert.equal(c.type, 'trade'); assert.equal(c.purpose, 'wc');
  assert.equal(c.tenor, 360); assert.equal(c.years, 0);
  assert.equal(c.name.length, 80); assert.equal(c.tl, true);
  assert.equal(c.ev.length, 100); assert.ok(!('unknown' in c)); assert.equal(c.v, 2);
  assert.throws(() => run('clean(null)'), e => e.message === 'format');
  assert.throws(() => run('clean([1,2])'), e => e.message === 'format');
});

test('Restoring replaces the data and keeps the old data as a saved version', async () => {
  reset(mine); const text = await run('bkExport("")');
  reset({ rev: 1, name: 'Old data' }); delete store.bdsnap;
  await run(`doRestore(${JSON.stringify(text)},"")`);
  assert.equal(run('S.rev'), 777000);
  assert.equal(JSON.parse(store.bds).name, 'Rahim Traders');       // persisted to storage
  const s = J(run('snaps()')); assert.equal(s[0].w, 'restore'); assert.equal(s[0].d.rev, 1);
});

test('Saved versions: gated to one a day, capped at 7, newest first, restorable', () => {
  reset(); delete store.bdsnap;
  run('snap("auto")'); run('snap("auto")'); assert.equal(run('snaps().length'), 1);   // 24-hour gate
  for (let i = 0; i < 10; i++) run('snap("manual",true)');
  assert.equal(run('snaps().length'), 7);
  reset({ rev: 111 }); run('snap("manual",true)'); run('S.rev=222');
  assert.equal(run('snapRestore(0)'), true); assert.equal(run('S.rev'), 111);
  assert.equal(run('snaps()[0].d.rev'), 222);                       // the state before restoring is kept
  assert.equal(run('snapRestore(99)'), false);
});

test('Corrupted saved versions cannot break the app', () => {
  reset(); store.bdsnap = '{not json'; assert.equal(run('snaps().length'), 0);
  store.bdsnap = JSON.stringify([{ t: Date.now(), w: 'auto', d: 'garbage' }]);
  assert.equal(run('snapRestore(0)'), false); run('snapList()');
});

// ---------- 11. Tax (Finance Act 2026) ----------
const slab = (T, cat = 'gen') => run(`slabTax(${T},'${cat}')`);
const tx = (patch) => J(run(`taxCalc(Object.assign({},S,${JSON.stringify(patch)}))`));
const profitOnly = T => ({ rev: T / 12, cogs: 0, opex: 0, tfloor: false });   // isolates income-tax slabs

test('Individual slabs match the published worked example and boundaries', () => {
  assert.equal(slab(1200000), 110000);        // guide example: 30,000 + 60,000 + 20,000
  assert.equal(slab(400000), 0); assert.equal(slab(700000), 30000);
  assert.equal(slab(1100000), 90000); assert.equal(slab(2000000), 290000); assert.equal(slab(3000000), 540000);
  assert.equal(slab(0), 0); assert.equal(slab(-5), 0);
});

test('Tax-free limits differ by taxpayer category', () => {
  assert.equal(slab(1200000, 'woman'), 100000); assert.equal(slab(450000, 'woman'), 0);
  assert.equal(slab(600000, 'dis'), 7500); assert.equal(slab(550000, 'ff'), 0); assert.equal(slab(650000, 'ff'), 10000);
});

test('Minimum tax applies above the threshold, with a lower figure for new taxpayers', () => {
  reset(); assert.equal(tx(profitOnly(400000)).gross, 0);               // not above the limit
  assert.equal(tx(profitOnly(405000)).gross, 5000);                     // slab 500 -> minimum 5,000
  assert.equal(tx({ ...profitOnly(405000), ntp: true }).gross, 1000);
});

test('Investment rebate is the lowest of 3% of profit, 10% of investment and Tk 7.5 lakh', () => {
  reset(); const b = profitOnly(1200000);
  assert.equal(tx(b).gross, 110000);
  assert.equal(tx({ ...b, invest: 500000 }).gross, 74000);              // 3% of profit = 36,000 is lowest
  assert.equal(tx({ ...b, invest: 100000 }).gross, 100000);             // 10% of investment = 10,000 is lowest
});

test('Firms and companies pay a flat rate; the banking-channel condition lowers the company rate', () => {
  reset(); const b = profitOnly(1000000);
  assert.equal(tx({ ...b, legal: 'firm' }).gross, 275000);
  assert.equal(tx({ ...b, legal: 'pvt' }).gross, 275000);
  assert.equal(tx({ ...b, legal: 'pvt', bank: true }).gross, 250000);
  assert.equal(tx({ ...b, legal: 'sole' }).gross, 75000);
});

test('The 1% turnover-tax floor applies only when regular tax is lower, and can be switched off', () => {
  reset(); assert.equal(tx({}).gross, 240000); assert.equal(tx({}).fl, false);   // sample business: regular tax is higher
  const loss = { rev: 500000, cogs: 450000, opex: 200000 };
  assert.equal(tx(loss).gross, 60000); assert.equal(tx(loss).fl, true);          // loss year: 1% of 6,000,000
  assert.equal(tx({ ...loss, tfloor: false }).gross, 0);
  const thin = tx({ rev: 800000, cogs: 560000, opex: 200000 });                  // profit 480,000: slab tax 8,000
  assert.equal(thin.gross, 96000); assert.equal(thin.fl, true);
});

test('Tax already paid creates a credit', () => {
  reset(); const x = tx({ ait: 300000 });
  assert.equal(x.net, -60000); close(x.eff, 240000 / 1800000, 1e-9); close(x.mo, 20000, 1e-9);
});

test('VAT: output less input credit, simplified turnover tax, and not registered', () => {
  reset(); let v = J(run('vatCalc()')); assert.equal(v.out, 180000); assert.equal(v.inp, 90000); assert.equal(v.net, 90000);
  assert.equal(J(run(`vatCalc(Object.assign({},S,{vmode:'tot',vfix:5000}))`)).net, 5000);
  assert.equal(J(run(`vatCalc(Object.assign({},S,{vmode:'none'}))`)).net, 0);
  assert.equal(J(run(`vatCalc(Object.assign({},S,{vinp:2000000}))`)).net, -120000);   // credit carried forward
});

test('Return-filing windows: rebate, no change, 2% extra, 5% extra', () => {
  reset();
  assert.equal(run('taxWin(new Date(2026,7,10)).k'), 'early');   assert.equal(run('iso(taxWin(new Date(2026,7,10)).end)'), '2026-09-30');
  assert.equal(run('taxWin(new Date(2026,9,19)).k'), 'plain');   assert.equal(run('iso(taxWin(new Date(2026,9,19)).end)'), '2026-12-31');
  assert.equal(run('taxWin(new Date(2027,1,10)).k'), 'late2');   assert.equal(run('taxWin(new Date(2027,4,10)).k'), 'late5');
});

test('Advance-tax dates are 15 Mar, 15 Jun, 15 Sep and 15 Dec', () => {
  assert.equal(run('advDates(new Date(2026,9,19),4).map(iso).join()'), '2026-12-15,2027-03-15,2027-06-15,2027-09-15');
});

test('Applying tax to the forecast sets VAT, adds the payment once and does not duplicate', () => {
  reset({ ait: 40000 }); run('applyTax()');
  assert.equal(run('S.vat'), 90000);
  let ev = J(run('S.ev.filter(e=>TXE.test(e.l))')); assert.equal(ev.length, 1);
  assert.equal(ev[0].a, -(240000 - 40000));
  run('applyTax()'); assert.equal(run('S.ev.filter(e=>TXE.test(e.l)).length'), 1);
  reset({ legal: 'pvt', rev: 500000, cogs: 200000, opex: 100000 }); run('applyTax()');
  ev = J(run('S.ev.filter(e=>TXE.test(e.l))')); assert.ok(ev.length >= 1 && ev.length <= 4);
  const q = ev[0].a; ev.forEach(e => assert.equal(e.a, q));
});

test('Tax screens render without NaN in both languages and for every legal form and VAT status', () => {
  const bad = /NaN|undefined|Infinity|\[object/;
  const cases = [{}, { legal: 'pvt', bank: true }, { legal: 'firm' }, { vmode: 'tot', vfix: 5000 }, { vmode: 'none' }, { rev: 0, cogs: 0, opex: 0, cash: 0 }, { cat: 'dis', ntp: true, invest: 90000, ait: 1e6 }];
  for (const L of ['en', 'bn']) for (const c of cases) {
    reset(c, L); run('lang()');
    for (const k of ['#tx', '#f_tx', '#al', '#rk']) assert.ok(!bad.test(els[k].innerHTML), `${L} ${k} ${JSON.stringify(c)}`);
    assert.ok(!bad.test(run('ask("how much income tax will I pay")')));
  }
});

test('Tax alerts: individuals get filing-window advice, companies get advance-tax dates', () => {
  reset(); assert.ok(/return|filing/i.test(run('alerts(fc(240),M()).map(a=>a[1]).join(" | ")')));
  reset({ legal: 'pvt' }); assert.ok(run('alerts(fc(240),M()).map(a=>a[1]).join(" | ")').includes('Advance income tax'));
});

test('Copilot answers tax questions without hijacking the turnover and VAT answers', () => {
  reset(); assert.ok(run('ask("how much income tax do I owe")').includes('Estimated income tax'));
  assert.ok(run('ask("turnover tax")').includes('turnover tax'));
  assert.ok(!run('ask("turnover tax")').includes('Estimated income tax'));
  assert.ok(run('ask("when is vat due")').includes('15th'));
  reset({}, 'bn'); assert.ok(run('ask("আয়কর")').includes('আয়কর'));
});

test('New tax fields survive a backup and hostile values are sanitised', async () => {
  reset({ legal: 'pvt', cat: 'woman', vrate: 7.5, bank: true });
  const n = J(await run(`bkImport(${JSON.stringify(await run('bkExport("")'))},"")`));
  assert.equal(n.legal, 'pvt'); assert.equal(n.cat, 'woman'); assert.equal(n.vrate, 7.5); assert.equal(n.bank, true);
  const c = J(run(`clean(${JSON.stringify({ legal: 'evil', cat: 'x', vmode: 'y', vrate: 500, tfloor: 'no', ait: 'abc', invest: 1e30 })})`));
  assert.equal(c.legal, 'sole'); assert.equal(c.cat, 'gen'); assert.equal(c.vmode, 'std'); assert.equal(c.vrate, 100);
  assert.equal(c.tfloor, true); assert.equal(c.ait, 0); assert.equal(c.invest, 1e12);
});
