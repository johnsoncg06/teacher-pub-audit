// 桌面版 API 取得：中斷後保留進度、可「繼續取得」。以頁面內的假 API 模擬，不連網、不含真實資料。node tests/e2e_api_resume.js
const { chromium, url, check, done } = require('./helpers.js');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(() => {
    window.__RETRY_MS = 5; window.__calls = 0; window.__fail = true;
    const hits = (page, n) => Array.from({ length: n }, (_, i) => ({ uid: 'WOS:T' + page + '_' + i, title: 't', types: ['Article'], source: { sourceTitle: 'J', publishYear: 2025 }, names: { authors: [{ displayName: 'Wang, Shih-Fan' }] }, identifiers: { issn: '1078-8956' } }));
    window.pywebview = { api: {
      info: async () => ({ desktop: true, platform: 'darwin', keyring: true }), key_status: async () => ({ hasKey: true, length: 7, secure: true }), check_key: async () => ({ ok: true, version: 'v2' }),
      fetch_page: async (q, page) => { window.__calls++; if (window.__fail && window.__calls >= 2 && window.__calls <= 5) return { status: 0, body: '' };
        return { status: 200, body: JSON.stringify({ metadata: { total: 120, page, limit: 50 }, hits: hits(page, page < 3 ? 50 : 20) }) }; },
      save_file: async () => ({ ok: true, path: '/x' }), open_print: async () => ({ ok: true }), open_url: async () => ({ ok: true }), clear_key: async () => true, save_key: async () => ({ ok: true }) } };
    window.addEventListener('load', () => window.dispatchEvent(new Event('pywebviewready')));
  });
  await p.goto(url()); await p.waitForTimeout(600);
  await p.click('[data-act="sample"]'); await p.waitForTimeout(300);
  await p.evaluate(() => { S.cfg.mode = 'api'; S.files = []; recompute(); go(3); }); await p.waitForTimeout(300);
  await p.click('[data-act="apiRun"]');
  await p.waitForFunction(() => FETCH && !FETCH.running, null, { timeout: 20000 });
  const s1 = await p.evaluate(() => ({ done: S.fetchProg && S.fetchProg.done, files: S.files.length, msg: FETCH.msg, calls: window.__calls }));
  check('連線中斷後停下並保留進度（已完成 1 次請求）', s1.done === 1 && s1.files === 0, s1);
  check('訊息說明可繼續', s1.msg.includes('繼續取得'), s1.msg);
  check('按鈕變成「繼續取得」與「重新開始」', (await p.textContent('#main')).includes('繼續取得（已完成 1 次請求）') && (await p.$('[data-act="apiFresh"]')) !== null);
  await p.click('[data-act="apiRun"]');
  await p.waitForFunction(() => FETCH && !FETCH.running && !S.fetchProg, null, { timeout: 20000 });
  const s2 = await p.evaluate(() => ({ recs: REC.length, files: S.files.length, prog: S.fetchProg }));
  check('續抓完成：120 篇、進度清除', s2.recs === 120 && s2.files === 1 && s2.prog === null, s2);
  check('無頁面錯誤', errs.length === 0, errs);
  await b.close(); done();
})();
