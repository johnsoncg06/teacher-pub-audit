// 測試共用：載入 playwright（CI 用 npm 套件；本機沙箱有全域安裝時退而求其次）
const path = require('path');
// 延遲載入：單元測試不需要 playwright
let pw; const load = () => pw || (pw = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })());
Object.defineProperty(exports, 'chromium', { get: () => load().chromium });
exports.APP = path.resolve(__dirname, '..', 'app.html');
exports.url = () => 'file://' + exports.APP;
let fails = 0;
exports.check = (name, cond, extra) => { if (cond) console.log('  ok   ' + name); else { fails++; console.log('  FAIL ' + name + (extra !== undefined ? '  → ' + JSON.stringify(extra) : '')); } };
exports.done = () => { if (fails) { console.log(`\n${fails} 項失敗`); process.exit(1); } console.log('\n全部通過'); };
