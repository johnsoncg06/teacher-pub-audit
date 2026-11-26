/* 多語系：執行時翻譯層。原始介面文字為繁體中文，字典鍵即中文原文；{0}{1}… 為依出現順序編號的變數。
   zh-TW 時完全不介入。其他語言：翻譯畫面文字節點與 title/aria-label/placeholder/alt，並接管 confirm/alert。 */
(function () {
  const LANGS = [['zh-TW', '繁體中文', 'zh-Hant'], ['en', 'English', 'en'], ['ja', '日本語', 'ja'], ['ko', '한국어', 'ko'], ['es', 'Español', 'es']];
  const COL = { en: 1, ja: 2, ko: 3, es: 4 };
  const CJK = /[㐀-鿿　-〿＀-￯]/;
  const norm = s => s.replace(/　/g, ' ');
  const DICT = window.I18N_DICT || [];
  let lang = 'zh-TW', exact = new Map(), pats = [], frag = [], cache = new Map(), obs = null;
  const orig = new WeakMap();        // 文字節點 → 原始中文
  const origAttr = new WeakMap();    // 元素 → {屬性: 原始中文}
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function build(l) {
    exact = new Map(); pats = []; frag = []; cache = new Map();
    if (l === 'zh-TW') return;
    const c = COL[l];
    for (const e of DICT) {
      const key = norm(e[0]).trim(), val = e[c];
      if (!val) continue;
      if (/\{\d+\}/.test(key)) {
        const re = new RegExp('^' + key.split(/\{\d+\}/).map(esc).join('([\\s\\S]*?)') + '$');
        const weak = /^\{\d+\}/.test(key) || /\{\d+\}$/.test(key);
        const lit = key.replace(/\{\d+\}/g, '');
        pats.push({ re, reG: lit.replace(/\s/g, '').length >= 2 ? new RegExp(key.split(/\{\d+\}/).map(esc).join('([^。；\\n]*?)'), 'g') : null, val, len: key.length, weak });
      } else { exact.set(key, val); if (key.length >= 3) frag.push([key, val]); }
    }
    pats.sort((a, b) => b.len - a.len);
    frag.sort((a, b) => b[0].length - a[0].length);
  }

  function tr(s) {
    if (lang === 'zh-TW' || typeof s !== 'string' || !CJK.test(s)) return s;
    const lead = s.match(/^\s*/)[0], trail = s.slice(lead.length).match(/\s*$/)[0];
    const core = s.slice(lead.length, s.length - trail.length);
    if (!core) return s;
    const hit = cache.get(core); if (hit !== undefined) return lead + hit + trail;
    const out = core1(core); cache.set(core, out); return lead + out + trail;
  }
  function core1(core) {
    const n = norm(core);
    let v = exact.get(core) ?? exact.get(n); if (v !== undefined) return v;
    const flat = n.replace(/\s+/g, ' ');
    v = exact.get(flat); if (v !== undefined) return v;
    for (const p of pats) {
      const m = p.re.exec(n) || p.re.exec(flat);
      if (m && !(p.weak && m.slice(1).some(g => { const k = g.indexOf('。'); return k >= 0 && k < g.length - 1; }))) return p.val.replace(/\{(\d+)\}/g, (_, i) => tr(m[+i + 1] ?? ''));
    }
    // 備援：以已知詞句逐一取代（長的優先）
    let t = n, changed = false;
    for (const [k, val] of frag) { if (t.includes(k)) { t = t.split(k).join(val); changed = true; } }
    for (const p of pats) {
      if (!p.reG || !CJK.test(t)) continue;
      t = t.replace(p.reG, (...a) => { changed = true; return p.val.replace(/\{(\d+)\}/g, (_, i) => tr(a[+i + 1] ?? '')); });
    }
    return changed ? t : core;
  }

  const skipEl = el => !el || /^(SCRIPT|STYLE|TEXTAREA|CODE)$/.test(el.tagName) || (el.closest && el.closest('[translate="no"]'));
  function doText(node) {
    const cur = node.nodeValue;
    if (!CJK.test(cur) && !orig.has(node)) return;
    if (skipEl(node.parentElement)) return;
    let o = orig.get(node);
    if (o === undefined || (CJK.test(cur) && cur !== o && cur !== node.__tr)) { o = cur; orig.set(node, o); }
    const t = lang === 'zh-TW' ? o : tr(o);
    node.__tr = t;
    if (t !== cur) node.nodeValue = t;
  }
  const ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
  function doAttrs(el) {
    if (!el.getAttribute || skipEl(el)) return;
    for (const a of ATTRS) {
      const cur = el.getAttribute(a); if (cur === null) continue;
      let m = origAttr.get(el); if (!m) { m = {}; origAttr.set(el, m); }
      if (m[a] === undefined || (CJK.test(cur) && cur !== m[a] && cur !== m['_t' + a])) { if (!CJK.test(cur) && m[a] === undefined) continue; m[a] = cur; }
      const t = lang === 'zh-TW' ? m[a] : tr(m[a]);
      m['_t' + a] = t;
      if (t !== cur) el.setAttribute(a, t);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1) return;
    doAttrs(root);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n; while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }
  let titleOrig = null;
  function doTitle() { if (titleOrig === null) titleOrig = document.title; document.title = lang === 'zh-TW' ? titleOrig : tr(titleOrig); }

  function watch() {
    if (obs) return;
    obs = new MutationObserver(recs => {
      for (const r of recs) {
        if (r.type === 'childList') r.addedNodes.forEach(walk);
        else if (r.type === 'characterData') doText(r.target);
        else if (r.type === 'attributes') doAttrs(r.target);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function setLang(l, persist) {
    if (!LANGS.some(x => x[0] === l)) l = 'zh-TW';
    lang = l; build(l);
    document.documentElement.lang = LANGS.find(x => x[0] === l)[2];
    document.documentElement.dataset.lang = l;
    if (persist !== false) { try { localStorage.setItem('tpa_lang', l); } catch (e) {} }
    const sel = document.getElementById('langSel'); if (sel) sel.value = l;
    if (obs) { obs.disconnect(); obs = null; }
    if (typeof render === 'function') { try { render(); } catch (e) {} }
    walk(document.body); doTitle();
    const hd = document.getElementById('help'); if (hd && hd.open && typeof renderHelp === 'function') renderHelp(document.getElementById('hq').value);
    if (l !== 'zh-TW') watch(); else watch();   // zh-TW 也保留觀察，以便從其他語言切回時還原新節點
  }

  const nativeConfirm = window.confirm.bind(window), nativeAlert = window.alert.bind(window);
  window.confirm = m => nativeConfirm(tr(String(m)));
  window.alert = m => nativeAlert(tr(String(m)));

  /* CSV：非中文時翻譯欄位名稱與固定值（教師姓名等資料不動） */
  function parseCSV(t) {
    const rows = []; let r = [], f = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { r.push(f); f = ''; }
      else if (c === '\n') { r.push(f.replace(/\r$/, '')); rows.push(r); r = []; f = ''; }
      else f += c;
    }
    if (f !== '' || r.length) { r.push(f.replace(/\r$/, '')); rows.push(r); }
    return rows;
  }
  const q = v => /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  const VALUE_KEYS = new Set(['是', '否', '本人', '非本人', '確定掛本校', '疑似漏掛（待抽查）', '同名他人（本篇無本校）', '無法判定', '機構相符（API）', '採計', '不採計', '未審核', '無分區/查無']);
  function csv(text) {
    if (lang === 'zh-TW' || typeof text !== 'string') return text;
    const bom = text.charCodeAt(0) === 0xfeff ? '﻿' : '';
    const rows = parseCSV(bom ? text.slice(1) : text); if (!rows.length) return text;
    rows[0] = rows[0].map(h => tr(h));
    for (let i = 1; i < rows.length; i++) rows[i] = rows[i].map(v => VALUE_KEYS.has(v) ? tr(v) : v);
    return bom + rows.map(r => r.map(q).join(',')).join('\r\n') + '\r\n';
  }

  function init() {
    const sel = document.getElementById('langSel');
    if (sel) { sel.innerHTML = LANGS.map(x => `<option value="${x[0]}">${x[1]}</option>`).join(''); sel.onchange = () => setLang(sel.value); }
    let saved = 'zh-TW'; try { saved = localStorage.getItem('tpa_lang') || 'zh-TW'; } catch (e) {}
    setLang(saved, false);
  }
  window.I18N = { t: tr, csv, setLang, get lang() { return lang; }, LANGS, init };
})();
