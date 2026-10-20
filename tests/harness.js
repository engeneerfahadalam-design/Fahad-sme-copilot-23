// Loads src/app.js in a sandbox with a minimal fake DOM so the pure logic can be tested in Node.
const fs = require('fs'), vm = require('vm'), path = require('path');
function load() {
  const els = {}, store = {};
  const mk = () => ({ innerHTML: '', textContent: '', value: '', placeholder: '', onclick: null, onkeydown: null, classList: { toggle() {} }, dataset: {} });
  const ctx = {
    document: { querySelector: s => els[s] || (els[s] = mk()), querySelectorAll: () => [], documentElement: {} },
    navigator: {},
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } },
    console, crypto: require('node:crypto').webcrypto, TextEncoder, TextDecoder, btoa, atob, URL, Blob
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8'), ctx, { filename: 'app.js' });
  return { run: c => vm.runInContext(c, ctx), els, store };
}
module.exports = { load };
