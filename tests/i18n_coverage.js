// 翻譯覆蓋檢查：載入範例資料，逐步檢視所有畫面，找出尚未翻譯的繁體中文文字。
// node tests/i18n_coverage.js [en,ja,ko,es]
const { chromium, url, check, done } = require('./helpers.js');
// 這些屬於使用者資料或固定名稱，不算漏譯：語言名稱、預設單位選項、範例人名、檔名
const STRIP = [/Language \/ 語言/g, /繁體中文|日本語/g, /中國醫藥大學/g, /王示範|李樣本|陳虛擬|林測試|張範例|黃練習|吳演示|劉教學/g, /[“«「'"‘][^”»」'"’]*[\u3400-\u9fff][^”»」'"’]*\.(csv|txt|ps1|sh|md)[”»」'"’]/g];
const ZH_ONLY = /[與們嗎說關錄於來點擇訊腦體總]/;   // 日文不用的繁體字：出現就代表漏譯
const clean = t => STRIP.reduce((a, re) => a.replace(re, ''), t);
(async () => {
  const b = await chromium.launch();
  for (const L of (process.argv[2] || 'en,ja,ko,es').split(',')) {
    console.log('語言 ' + L);
    const ctx = await b.newContext({ viewport: { width: 1360, height: 900 } }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
    await p.addInitScript(l => { try { localStorage.setItem('tpa_lang', l); } catch (e) { } }, L);
    await p.goto(url()); await p.waitForTimeout(500);
    await p.click('[data-act="sample"]'); await p.waitForTimeout(400);
    const zhKeys = new Set(await p.evaluate(() => window.I18N_DICT.filter(e => e[2] !== e[0]).map(e => e[0].replace(/\u3000/g, ' ').trim())));
    const bad = new Map();
    const scan = async tag => {
      const r = await p.evaluate(() => {
        const res = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while (n = w.nextNode()) { const t = n.nodeValue.trim(); if (!t || n.parentElement.closest('[translate="no"],script,style,#help')) continue; if (/[㐀-鿿]/.test(t)) res.push(t); }
        document.querySelectorAll('[title],[aria-label],[placeholder]').forEach(e => ['title', 'aria-label', 'placeholder'].forEach(a => { const v = e.getAttribute(a); if (v && /[㐀-鿿]/.test(v) && !e.closest('[translate="no"]')) res.push('@' + a + ':' + v); }));
        return res;
      });
      for (const t of r) {
        if (t.startsWith('@placeholder:')) continue;
        const body = clean(t).replace(/^@[a-z-]+:/, '');
        const miss = L === 'ja' ? (zhKeys.has(body.trim()) || ZH_ONLY.test(body)) : /[㐀-鿿]/.test(body);
        if (miss && !bad.has(t)) bad.set(t, tag);
      }
    };
    for (let i = 0; i < 8; i++) { await p.evaluate(i => go(i), i); await p.waitForTimeout(200); await scan('步驟' + (i + 1)); }
    await p.evaluate(() => { reviewFilter.mode = 'all'; go(6); }); await p.waitForTimeout(200); await scan('審核(全部)');
    await p.evaluate(() => { S.cfg.mode = 'api'; go(3); }); await p.waitForTimeout(200); await scan('API 取得');
    check(`${L} 無漏譯文字`, bad.size === 0, [...bad].slice(0, 10).map(([t, s]) => s + '｜' + t.slice(0, 60)));
    check(`${L} 無頁面錯誤`, errs.length === 0, errs);
    await ctx.close();
  }
  await b.close(); done();
})();
