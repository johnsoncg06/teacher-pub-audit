/* 論文盤點核心邏輯：零外部套件，可在瀏覽器與 Node 執行 */
(function (root) {
'use strict';
const C = {};

/* ---------- 共用 ---------- */
const td16 = new TextDecoder('utf-16le');
const td8 = new TextDecoder('utf-8');
const lat1 = new TextDecoder('latin1');

/* ---------- CFB（舊版 Office 檔容器） ---------- */
function readCFB(buf) {
  const u8 = new Uint8Array(buf);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const sig = [0xD0,0xCF,0x11,0xE0,0xA1,0xB1,0x1A,0xE1];
  for (let i = 0; i < 8; i++) if (u8[i] !== sig[i]) throw new Error('不是 Excel 97-2003 (.xls) 檔');
  const ssz = 1 << dv.getUint16(0x1E, true);
  const mssz = 1 << dv.getUint16(0x20, true);
  const nFat = dv.getUint32(0x2C, true);
  const dirStart = dv.getUint32(0x30, true);
  const miniCut = dv.getUint32(0x38, true);
  const miniFatStart = dv.getUint32(0x3C, true);
  let difatSec = dv.getUint32(0x44, true);
  const off = s => (s + 1) * ssz;
  const fatSecs = [];
  for (let i = 0; i < 109 && fatSecs.length < nFat; i++) fatSecs.push(dv.getUint32(0x4C + i * 4, true));
  while (fatSecs.length < nFat && difatSec < 0xFFFFFFFA) {
    const o = off(difatSec);
    for (let i = 0; i < ssz / 4 - 1 && fatSecs.length < nFat; i++) fatSecs.push(dv.getUint32(o + i * 4, true));
    difatSec = dv.getUint32(o + ssz - 4, true);
  }
  const fat = [];
  for (const s of fatSecs) { const o = off(s); for (let i = 0; i < ssz / 4; i++) fat.push(dv.getUint32(o + i * 4, true)); }
  const chain = (start, table) => { const r = []; let s = start, g = 0; while (s < 0xFFFFFFFA && g++ < 1e7) { r.push(s); s = table[s]; } return r; };
  const readChain = (start, size) => {
    const secs = chain(start, fat); const out = new Uint8Array(secs.length * ssz);
    secs.forEach((s, i) => out.set(u8.subarray(off(s), off(s) + ssz), i * ssz));
    return size == null ? out : out.subarray(0, size);
  };
  const dir = readChain(dirStart);
  const entries = [];
  for (let o = 0; o + 128 <= dir.length; o += 128) {
    const nl = dir[o + 0x40] | (dir[o + 0x41] << 8);
    const type = dir[o + 0x42];
    if (!type) continue;
    const name = td16.decode(dir.subarray(o, o + Math.max(0, nl - 2)));
    const ddv = new DataView(dir.buffer, dir.byteOffset + o, 128);
    entries.push({ name, type, start: ddv.getUint32(0x74, true), size: ddv.getUint32(0x78, true) });
  }
  const rootE = entries.find(e => e.type === 5);
  let mini = null, minifat = null;
  const get = name => {
    const e = entries.find(x => x.name.toLowerCase() === name.toLowerCase() && x.type === 2);
    if (!e) return null;
    if (e.size >= miniCut) return readChain(e.start, e.size);
    if (!mini) { mini = readChain(rootE.start, rootE.size); const mf = readChain(miniFatStart); minifat = []; const mv = new DataView(mf.buffer, mf.byteOffset, mf.byteLength); for (let i = 0; i < mf.length / 4; i++) minifat.push(mv.getUint32(i * 4, true)); }
    const secs = chain(e.start, minifat); const out = new Uint8Array(secs.length * mssz);
    secs.forEach((s, i) => out.set(mini.subarray(s * mssz, s * mssz + mssz), i * mssz));
    return out.subarray(0, e.size);
  };
  return { entries, get };
}

/* ---------- BIFF8（.xls 第一個工作表） ---------- */
function readXLS(buf) {
  const cfb = readCFB(buf);
  const wb = cfb.get('Workbook') || cfb.get('Book');
  if (!wb) throw new Error('.xls 內找不到活頁簿');
  const dv = new DataView(wb.buffer, wb.byteOffset, wb.byteLength);
  const recs = [];
  for (let p = 0; p + 4 <= wb.length;) {
    const t = dv.getUint16(p, true), l = dv.getUint16(p + 2, true);
    recs.push({ t, p: p + 4, l }); p += 4 + l;
  }
  // SST
  const sst = [];
  for (let i = 0; i < recs.length; i++) {
    if (recs[i].t !== 0x00FC) continue;
    const segs = [wb.subarray(recs[i].p, recs[i].p + recs[i].l)];
    for (let j = i + 1; j < recs.length && recs[j].t === 0x003C; j++) segs.push(wb.subarray(recs[j].p, recs[j].p + recs[j].l));
    let si = 0, pos = 8;
    const u8 = () => { if (pos >= segs[si].length) { si++; pos = 0; } return segs[si][pos++]; };
    const u16 = () => u8() | (u8() << 8);
    const u32 = () => (u16() | (u16() << 16)) >>> 0;
    const skip = n => { while (n > 0) { if (pos >= segs[si].length) { si++; pos = 0; } const k = Math.min(n, segs[si].length - pos); pos += k; n -= k; } };
    const total = new DataView(segs[0].buffer, segs[0].byteOffset + 4, 4).getUint32(0, true);
    for (let n = 0; n < total; n++) {
      if (si >= segs.length || (si === segs.length - 1 && pos >= segs[si].length)) break;
      const cch = u16(); const fl = u8(); let high = fl & 1;
      const runs = fl & 8 ? u16() : 0; const ext = fl & 4 ? u32() : 0;
      let left = cch, s = '';
      while (left > 0) {
        if (pos >= segs[si].length) { si++; pos = 0; high = segs[si][pos++] & 1; }
        const avail = segs[si].length - pos;
        const take = Math.min(left, high ? Math.floor(avail / 2) : avail);
        const bytes = segs[si].subarray(pos, pos + take * (high ? 2 : 1));
        s += high ? td16.decode(bytes) : lat1.decode(bytes);
        pos += bytes.length; left -= take;
        if (take === 0 && left > 0) { si++; pos = 0; high = segs[si][pos++] & 1; }
      }
      skip(runs * 4 + ext);
      sst.push(s);
    }
    break;
  }
  const rk = v => { let x; if (v & 2) x = v >> 2; else { const b = new DataView(new ArrayBuffer(8)); b.setUint32(4, v & 0xFFFFFFFC, true); x = b.getFloat64(0, true); } return v & 1 ? x / 100 : x; };
  // 第一個工作表
  let bofCount = 0, inSheet = false; const rows = [];
  const put = (r, c, v) => { (rows[r] || (rows[r] = []))[c] = v; };
  let pendingFormula = null;
  for (const R of recs) {
    const p = R.p;
    if (R.t === 0x0809) { bofCount++; const kind = dv.getUint16(p + 2, true); if (kind === 0x10 && !inSheet && bofCount >= 2) inSheet = true; continue; }
    if (!inSheet) continue;
    if (R.t === 0x000A) break;
    switch (R.t) {
      case 0x00FD: put(dv.getUint16(p, true), dv.getUint16(p + 2, true), sst[dv.getUint32(p + 6, true)]); break;
      case 0x0203: put(dv.getUint16(p, true), dv.getUint16(p + 2, true), dv.getFloat64(p + 6, true)); break;
      case 0x027E: put(dv.getUint16(p, true), dv.getUint16(p + 2, true), rk(dv.getInt32(p + 6, true))); break;
      case 0x00BD: { const r = dv.getUint16(p, true); let c = dv.getUint16(p + 2, true); for (let q = p + 4; q + 6 <= p + R.l - 2; q += 6) put(r, c++, rk(dv.getInt32(q + 2, true))); break; }
      case 0x0204: { const cch = dv.getUint16(p + 6, true), fl = wb[p + 8]; const b = wb.subarray(p + 9, p + 9 + cch * (fl & 1 ? 2 : 1)); put(dv.getUint16(p, true), dv.getUint16(p + 2, true), fl & 1 ? td16.decode(b) : lat1.decode(b)); break; }
      case 0x0006: { const r = dv.getUint16(p, true), c = dv.getUint16(p + 2, true); if (dv.getUint16(p + 12, true) === 0xFFFF) { if (wb[p + 6] === 0) pendingFormula = [r, c]; } else put(r, c, dv.getFloat64(p + 6, true)); break; }
      case 0x0207: if (pendingFormula) { const cch = dv.getUint16(p, true), fl = wb[p + 2]; const b = wb.subarray(p + 3, p + 3 + cch * (fl & 1 ? 2 : 1)); put(pendingFormula[0], pendingFormula[1], fl & 1 ? td16.decode(b) : lat1.decode(b)); pendingFormula = null; } break;
    }
  }
  return rows.map(r => r || []);
}

/* ---------- XLSX（ZIP + XML，需瀏覽器 DecompressionStream） ---------- */
async function inflateRaw(u8) {
  const ds = new DecompressionStream('deflate-raw');
  const s = new Blob([u8]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(s).arrayBuffer());
}
async function readXLSX(buf) {
  const u8 = new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let e = u8.length - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('不是有效的 .xlsx 檔');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
  const files = {};
  for (let i = 0; i < n; i++) {
    const method = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = td8.decode(u8.subarray(p + 46, p + 46 + nl));
    files[name] = { method, csz, lo }; p += 46 + nl + xl + cl;
  }
  const read = async name => { const f = files[name]; if (!f) return null; const lo = f.lo; const ds = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true); const raw = u8.subarray(ds, ds + f.csz); return td8.decode(f.method === 0 ? raw : await inflateRaw(raw)); };
  const parse = s => new DOMParser().parseFromString(s, 'application/xml');
  const ss = []; const sx = await read('xl/sharedStrings.xml');
  if (sx) for (const si of parse(sx).getElementsByTagName('si')) { let t = ''; for (const x of si.getElementsByTagName('t')) t += x.textContent; ss.push(t); }
  const sheetName = Object.keys(files).filter(k => /^xl\/worksheets\/sheet\d+\.xml$/.test(k)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)))[0];
  const doc = parse(await read(sheetName)); const rows = [];
  const col = ref => { let c = 0; for (const ch of ref.replace(/\d/g, '')) c = c * 26 + ch.charCodeAt(0) - 64; return c - 1; };
  for (const r of doc.getElementsByTagName('row')) {
    const ri = parseInt(r.getAttribute('r')) - 1; const arr = [];
    for (const c of r.getElementsByTagName('c')) {
      const t = c.getAttribute('t'); const v = c.getElementsByTagName('v')[0];
      let val = v ? v.textContent : '';
      if (t === 's') val = ss[+val]; else if (t === 'inlineStr') { val = ''; for (const x of c.getElementsByTagName('t')) val += x.textContent; } else if (val !== '' && !isNaN(val)) val = +val;
      arr[col(c.getAttribute('r'))] = val;
    }
    rows[ri] = arr;
  }
  return rows.map(r => r || []);
}

/* ---------- CSV / TSV ---------- */
function decodeText(buf) {
  const u8 = new Uint8Array(buf);
  if (u8[0] === 0xFF && u8[1] === 0xFE) return td16.decode(u8.subarray(2));
  let s = td8.decode(u8); if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1); return s;
}
function parseDelimited(text, delim) {
  if (!delim) { const first = text.split(/\r?\n/)[0] || ''; delim = (first.split('\t').length > first.split(',').length) ? '\t' : ','; }
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
    else if (ch === '"' && f === '') q = true;
    else if (ch === delim) { row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += ch;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(x => String(x).trim() !== ''));
}
function toCSV(rows, cols) {
  const esc = v => { v = v == null ? '' : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  return '﻿' + [cols.map(esc).join(',')].concat(rows.map(r => cols.map(c => esc(r[c])).join(','))).join('\r\n');
}

/* 讀任何表格檔 → 二維陣列 */
async function readTable(name, buf) {
  const low = name.toLowerCase();
  const u8 = new Uint8Array(buf);
  if (u8[0] === 0xD0 && u8[1] === 0xCF) return readXLS(buf);
  if (u8[0] === 0x50 && u8[1] === 0x4B) return readXLSX(buf);
  return parseDelimited(decodeText(buf), low.endsWith('.csv') ? ',' : null);
}

/* ---------- WoS 記錄 ---------- */
const TAGS = { AU: 'Authors', AF: 'Author Full Names', TI: 'Article Title', SO: 'Source Title', DT: 'Document Type', PY: 'Publication Year', C1: 'Addresses', SN: 'ISSN', EI: 'eISSN', DI: 'DOI', UT: 'UT (Unique WOS ID)', EA: 'Early Access Date' };
const REQUIRED = ['Author Full Names', 'Article Title', 'Source Title', 'Document Type', 'Publication Year', 'Addresses', 'UT (Unique WOS ID)', 'ISSN', 'eISSN', 'DOI'];
function wosRecords(table) {
  let hi = table.findIndex(r => r.some(x => x === 'UT (Unique WOS ID)' || x === 'UT'));
  if (hi < 0) throw new Error('看不出是 WoS 匯出檔（找不到 UT 欄位）');
  const head = table[hi].map(h => TAGS[h] || String(h || '').trim());
  const missing = REQUIRED.filter(c => !head.includes(c));
  const recs = [];
  for (const r of table.slice(hi + 1)) {
    const o = {}; head.forEach((h, i) => { o[h] = r[i] == null ? '' : r[i]; });
    if (!o['UT (Unique WOS ID)']) continue;
    for (const k of ['ISSN', 'eISSN', 'DOI']) if (o[k] == null) o[k] = '';
    recs.push(o);
  }
  return { records: recs, missing, columns: head };
}
function expectedFromFilename(name) { const m = name.match(/_(\d+)(?:\s*\(\d+\))?\.(?:xls|xlsx|csv|txt)$/i); return m ? +m[1] : null; }

/* ---------- 姓名 ---------- */
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
function parseEnglishName(raw) {
  let s = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  let sur, given, ordered;
  if (s.includes(',')) { [sur, given] = s.split(',').map(x => x.trim()); ordered = true; }
  else {
    const t = s.split(' ');
    if (t.length === 1) return null;
    const hy = t.findIndex(x => x.includes('-'));
    if (hy >= 0 && t.length === 2) { given = t[hy]; sur = t[1 - hy]; }
    else if (s === s.toUpperCase()) { sur = t[0]; given = t.slice(1).join(' '); }
    else { sur = t[t.length - 1]; given = t.slice(0, -1).join(' '); }
    ordered = false;
  }
  sur = sur.split(/[\s]+/).map(cap).join(' ');
  given = given.split(/\s+/).join('-').split('-').filter(Boolean).map(cap).join('-');
  return { sur, given, ordered };
}
function nameVariants(raw) {
  const s = String(raw || '').replace(/\s+/g, ' ').trim(); if (!s) return [];
  const capH = x => x.split('-').filter(Boolean).map(cap).join('-');
  const forms = new Set();
  const add = (sur, given) => {
    sur = sur.split(' ').map(capH).join(' '); given = given.split(/[\s-]+/).filter(Boolean).map(cap).join('-');
    if (!sur || !given) return;
    forms.add(`${sur}, ${given}`);
    if (given.includes('-')) forms.add(`${sur}, ${cap(given.replace(/-/g, ''))}`);
  };
  if (s.includes(',')) { const [a, b] = s.split(',').map(x => x.trim()); add(a, b); }
  else {
    const t = s.split(' '); if (t.length < 2) return [];
    add(t[t.length - 1], t.slice(0, -1).join(' '));   // 西式：名在前、姓在後
    add(t[0], t.slice(1).join(' '));                    // 護照式：姓在前
  }
  return [...forms].sort();
}
const nameKey = n => String(n || '').toLowerCase().replace(/[^a-z]/g, '').split('').sort().join('');

/* ---------- 檢索式 ---------- */
function buildQueries(teachers, opt) {
  const size = opt.groupSize || 40, maxLen = opt.maxLen || 3500;
  const tail = ` AND PY=${opt.year} AND DT=(${(opt.docTypes || ['Article', 'Review']).join(' OR ')})`;
  const parts = teachers.filter(t => t.include && t.en).map(t => ({ t, clause: 'AU=(' + nameVariants(t.en).map(x => `"${x}"`).join(' OR ') + ')' })).filter(x => x.clause !== 'AU=()');
  const groups = []; let cur = [];
  const len = g => ('(' + g.map(x => x.clause).join(' OR ') + ')' + tail).length;
  for (const x of parts) { if (cur.length && (cur.length >= size || len(cur.concat([x])) > maxLen)) { groups.push(cur); cur = []; } cur.push(x); }
  if (cur.length) groups.push(cur);
  return groups.map((g, i) => ({ no: i + 1, teachers: g.map(x => x.t.zh), query: '(' + g.map(x => x.clause).join(' OR ') + ')' + tail }));
}

/* ---------- 比對與判斷 ---------- */
function parseAddresses(a) {
  const d = {}; if (typeof a !== 'string') return d;
  const re = /\[([^\]]+)\]\s*([^\[]+)/g; let m;
  while ((m = re.exec(a))) for (const au of m[1].split(';').map(x => x.trim())) (d[au] || (d[au] = [])).push(m[2].trim().replace(/;\s*$/, '').trim());
  return d;
}
const TIER = { YES: 0, SUSPECT: 1, OTHER: 2, UNKNOWN: 3, ORG: 4 };
const TIER_LABEL = ['確定掛本校', '疑似漏掛（待抽查）', '同名他人（本篇無本校）', '無法判定', '機構相符（API）'];
function matchPapers(teachers, records, affRegex) {
  const AFF = new RegExp(affRegex, 'i');
  const T = {};
  teachers.filter(t => t.include && t.en).forEach(t => (T[nameKey(t.en)] || (T[nameKey(t.en)] = [])).push(t));
  const seen = new Set(), rows = [];
  for (const p of records) {
    const ut = p['UT (Unique WOS ID)']; if (seen.has(ut)) continue; seen.add(ut);
    const fn = p['Author Full Names']; if (typeof fn !== 'string' || !fn) continue;
    const authors = fn.split(';').map(x => x.trim());
    const ad = parseAddresses(p['Addresses']);
    authors.forEach((a, i) => {
      const ts = T[nameKey(a)]; if (!ts) return;
      const addrs = ad[a] || [];
      let tier;
      if (p._org) tier = TIER.ORG;
      else if (!addrs.length) tier = TIER.UNKNOWN;
      else if (addrs.some(x => AFF.test(x))) tier = TIER.YES;
      else if (AFF.test(String(p['Addresses']))) tier = TIER.SUSPECT;
      else tier = TIER.OTHER;
      for (const t of ts) rows.push({ id: t.id + '|' + ut, tid: t.id, wosName: a, pos: `${i + 1}/${authors.length}`, tier, aff: addrs.join(' | ').slice(0, 300),
        title: p['Article Title'], journal: p['Source Title'], dtype: p['Document Type'], year: p['Publication Year'], issn: String(p['ISSN'] || ''), eissn: String(p['eISSN'] || ''), doi: p['DOI'], ut });
    });
  }
  return rows;
}

/* ---------- 期刊品質 ---------- */
function jcrLookup(row, jcr) {
  for (const k of [row.issn, row.eissn]) { const key = String(k || '').trim().toUpperCase(); if (key && jcr[key]) return jcr[key]; }
  return null;
}
function parseJCRExport(table) {
  const hi = table.findIndex(r => r.some(x => /^ISSN$/i.test(String(x).trim())));
  if (hi < 0) throw new Error('找不到 ISSN 欄位');
  const h = table[hi].map(x => String(x).trim());
  const ci = re => h.findIndex(x => re.test(x));
  const iI = ci(/^ISSN$/i), iE = ci(/^eISSN$/i), iJ = ci(/^\d{4}\s*JIF$|^JIF$|Impact Factor$/i), iQ = ci(/JIF Quartile|Quartile/i);
  if (iJ < 0 && iQ < 0) throw new Error('找不到 JIF 或 JIF Quartile 欄位，請確認匯出時包含這兩個欄位');
  const out = {}; let n = 0;
  for (const r of table.slice(hi + 1)) {
    const jif = iJ >= 0 ? parseFloat(r[iJ]) : NaN; const q = iQ >= 0 ? String(r[iQ] || '').trim() : '';
    const v = [isNaN(jif) ? null : jif, /^Q[1-4]$/.test(q) ? q : '', ''];
    if (v[0] == null && !v[1]) continue;
    for (const k of [r[iI], iE >= 0 ? r[iE] : '']) { const key = String(k || '').trim().toUpperCase(); if (key && key !== 'N/A') { out[key] = v; n++; } }
  }
  return { map: out, n };
}

/* ---------- 審核後採計與彙總 ---------- */
function counted(row, decisions) {
  const d = decisions[row.id];
  if (d === 'yes') return true; if (d === 'no') return false;
  return row.tier <= TIER.SUSPECT || row.tier === TIER.ORG;
}
function summarize(teachers, rows, decisions, jcr) {
  const by = {}; rows.forEach(r => (by[r.tid] || (by[r.tid] = [])).push(r));
  return teachers.filter(t => t.include).map(t => {
    const L = by[t.id] || []; const seen = new Set(); const u = [];
    L.filter(r => counted(r, decisions)).forEach(r => { if (!seen.has(r.ut)) { seen.add(r.ut); u.push(r); } });
    const q = u.map(r => (jcrLookup(r, jcr) || [null, ''])[1]);
    const jif = u.map(r => (jcrLookup(r, jcr) || [null])[0]).filter(x => x != null);
    const cnt = k => q.filter(x => x === k).length;
    return { '系所/學科': t.dept, '職稱': t.title, '中文姓名': t.zh, '英文姓名': t.en,
      '採計篇數': u.length,
      '其中確定掛本校': u.filter(r => r.tier === TIER.YES && decisions[r.id] !== 'yes').length,
      '其中機構相符(API)': u.filter(r => r.tier === TIER.ORG && decisions[r.id] !== 'yes').length,
      '其中人工確認': u.filter(r => decisions[r.id] === 'yes').length,
      '其中疑似漏掛未審': u.filter(r => r.tier === TIER.SUSPECT && !decisions[r.id]).length,
      Q1: cnt('Q1'), Q2: cnt('Q2'), Q3: cnt('Q3'), Q4: cnt('Q4'), '無分區/查無': q.filter(x => !x).length,
      'Q1+Q2占比': u.length ? Math.round((cnt('Q1') + cnt('Q2')) / u.length * 100) + '%' : '',
      '平均JIF': jif.length ? Math.round(jif.reduce((a, b) => a + b, 0) / jif.length * 100) / 100 : '',
      '最高JIF': jif.length ? Math.max(...jif) : '',
      'JIF總和': jif.length ? Math.round(jif.reduce((a, b) => a + b, 0) * 10) / 10 : '',
      '未採計(同名/排除)': L.filter(r => !counted(r, decisions)).length,
      '待審核': L.filter(r => (r.tier === TIER.SUSPECT || r.tier === TIER.UNKNOWN) && !decisions[r.id]).length };
  });
}

/* ---------- 名單匯入 ---------- */
function rosterFromTable(table) {
  const hi = table.findIndex(r => r.some(x => /中文姓名|姓名/.test(String(x))));
  if (hi < 0) throw new Error('名單需要「中文姓名」欄位（可下載範本）');
  const h = table[hi].map(x => String(x || '').trim());
  const ci = (...res) => { for (const re of res) { const i = h.findIndex(x => re.test(x)); if (i >= 0) return i; } return -1; };
  const iZ = ci(/^中文姓名$/, /姓名/), iE = ci(/英文/), iD = ci(/系所|學科|單位|系/), iT = ci(/職稱/), iC = ci(/學院/), iN = ci(/備註/), iConf = ci(/可信度|信心/);
  const out = [];
  table.slice(hi + 1).forEach((r, k) => {
    const zh = String(r[iZ] || '').trim(); if (!zh) return;
    const conf = iConf >= 0 ? String(r[iConf] || '') : '';
    const en = iE >= 0 ? String(r[iE] || '').trim() : '';
    out.push({ id: 't' + (k + 1), college: iC >= 0 ? String(r[iC] || '') : '', dept: iD >= 0 ? String(r[iD] || '') : '', title: iT >= 0 ? String(r[iT] || '') : '', zh, en, note: iN >= 0 ? String(r[iN] || '') : '', conf, include: !!en && !/^低/.test(conf) });
  });
  return out;
}


/* ---------- WoS Starter API ---------- */
const API_BASE = 'https://api.clarivate.com/apis/wos-starter/v2/documents';
function buildApiQueries(teachers, opt) {
  const q = buildQueries(teachers, Object.assign({}, opt, { groupSize: opt.apiGroupSize || 20, maxLen: 2600 }));
  const og = String(opt.apiOrg || '').trim();
  if (!og) return q;
  return q.map(x => Object.assign({}, x, { query: x.query.replace(/ AND PY=/, ` AND OG=("${og.replace(/"/g, '')}") AND PY=`) }));
}
function shQuote(s) { return "'" + String(s).replace(/'/g, "'\\''") + "'"; }
function psQuote(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
function apiScriptMac(qs, opt) {
  const out = `WoS_API結果_${opt.college}_${opt.year}.txt`;
  return `#!/bin/bash
# 教師論文盤點工具：WoS Starter API 取得程式（Mac）
# 使用方式：開啟「終端機」，輸入 bash 加一個空格，把本檔拖進視窗，按 Return。
cd "$(dirname "$0")" || exit 1
OUT=${shQuote(out)}
EDITION=${shQuote(opt.edition || '')}
QUERIES=(
${qs.map(q => '  ' + shQuote(q.query)).join('\n')}
)
echo ""
echo "WoS Starter API 資料取得（共 \${#QUERIES[@]} 組檢索）"
echo "API Key 只用於本次執行，不會被儲存。"
if [ -n "$WOS_API_KEY" ]; then KEY="$WOS_API_KEY"; else read -rsp "請貼上 API Key 後按 Return（輸入時不會顯示）：" KEY; echo ""; fi
KEY="$(printf '%s' "$KEY" | tr -d '[:space:]')"
[ -z "$KEY" ] && { echo "未輸入 API Key，已結束。"; exit 1; }
echo "正在確認 API Key（長度 \${#KEY} 字元）…"
API=""
for V in v2 v1; do
  T="\${WOS_API_ROOT:-https://api.clarivate.com/apis/wos-starter}/$V/documents"
  c=$(curl -s -o /dev/null -w '%{http_code}' --get "$T" -H "X-ApiKey: $KEY" --data-urlencode "q=PY=2020" --data-urlencode "limit=1")
  echo "  $V：HTTP $c"
  if [ "$c" = "200" ]; then API="$T"; break; fi
  LAST="$c"
done
if [ -z "$API" ]; then
  echo ""
  case "$LAST" in
    401) echo "API Key 未被接受（401 Unauthorized）。請確認："
         echo "  1. 貼上的是 Application 頁面中的「API Key」，不是 Application ID、Client ID 或 Client Secret。"
         echo "  2. Web of Science Starter API 的訂閱狀態為 Approved／Active（Pending 表示仍在審核）。"
         echo "  3. 剛核准的 Key 可能需要數分鐘後才生效。"
         echo "  查看位置：developer.clarivate.com → 右上角帳號 → Applications → 您的 Application。";;
    403) echo "此 API Key 沒有 Starter API 的使用權限（403）。請確認已訂閱 Web of Science Starter API 並通過審核。";;
    000) echo "無法連線至 Clarivate（網路錯誤）。請確認網路連線，或改用其他網路再試。";;
    *)   echo "API 回應 HTTP $LAST，請將此訊息提供給維護人員。";;
  esac
  exit 1
fi
echo "API Key 確認通過，開始取得資料。"
echo ""
: > "$OUT"
n=0
i=0
for Q in "\${QUERIES[@]}"; do
  i=$((i+1)); page=1; total=0
  while true; do
    if [ -n "$EDITION" ]; then
      resp=$(curl -sS -w $'\\n%{http_code}' --get "$API" -H "X-ApiKey: $KEY" --data-urlencode "q=$Q" --data-urlencode "limit=50" --data-urlencode "page=$page" --data-urlencode "edition=$EDITION")
    else
      resp=$(curl -sS -w $'\\n%{http_code}' --get "$API" -H "X-ApiKey: $KEY" --data-urlencode "q=$Q" --data-urlencode "limit=50" --data-urlencode "page=$page")
    fi
    code="\${resp##*$'\\n'}"; body="\${resp%$'\\n'*}"
    if [ "$code" = "429" ]; then echo "  請求太頻繁，等待 5 秒後重試…"; sleep 5; continue; fi
    if [ "$code" != "200" ]; then echo ""; echo "第 $i 組第 $page 頁失敗（HTTP $code）："; printf '%s\\n' "$body" | head -c 400; echo ""; echo "已取得的資料仍保存在 $OUT。"; exit 1; fi
    printf '%s\\n---PAGE---\\n' "$body" >> "$OUT"
    total=$(printf '%s' "$body" | grep -o '"total" *: *[0-9]*' | head -1 | grep -o '[0-9]*$'); total=\${total:-0}
    echo "  第 $i 組：第 $page 頁完成（本組共 $total 篇）"
    n=$((n+1))
    if [ $((page * 50)) -ge "$total" ]; then break; fi
    page=$((page+1)); sleep 1
  done
  sleep 1
done
echo ""
echo "完成，共 $n 次請求。請將「$OUT」拖回教師論文盤點工具的「WoS 資料」步驟。"
`;
}
function apiScriptWin(qs, opt) {
  const out = `WoS_API結果_${opt.college}_${opt.year}.txt`;
  return `# 教師論文盤點工具：WoS Starter API 取得程式（Windows）
# 使用方式：在本檔按右鍵 →「用 PowerShell 執行」。
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Set-Location -LiteralPath $PSScriptRoot
$out = Join-Path $PSScriptRoot ${psQuote(out)}
$edition = ${psQuote(opt.edition || '')}
$queries = @(
${qs.map(q => '  ' + psQuote(q.query)).join(",\n")}
)
Write-Host ""
Write-Host "WoS Starter API 資料取得（共 $($queries.Count) 組檢索）"
Write-Host "API Key 只用於本次執行，不會被儲存。"
$sec = Read-Host "請貼上 API Key 後按 Enter（輸入時不會顯示）" -AsSecureString
$key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
$key = ($key -replace '\s', '')
if (-not $key) { Write-Host "未輸入 API Key，已結束。"; Read-Host "按 Enter 關閉"; exit 1 }
Write-Host "正在確認 API Key（長度 $($key.Length) 字元）…"
$api = $null; $last = 0
foreach ($v in @('v2', 'v1')) {
  $t = "https://api.clarivate.com/apis/wos-starter/$v/documents"
  try { $null = Invoke-WebRequest -Uri ($t + '?q=PY%3D2020&limit=1') -Headers @{ 'X-ApiKey' = $key } -UseBasicParsing; Write-Host "  $($v)：HTTP 200"; $api = $t; break }
  catch { $last = 0; try { $last = [int]$_.Exception.Response.StatusCode } catch {}; Write-Host "  $($v)：HTTP $last" }
}
if (-not $api) {
  Write-Host ""
  switch ($last) {
    401 { Write-Host "API Key 未被接受（401 Unauthorized）。請確認："
          Write-Host "  1. 貼上的是 Application 頁面中的「API Key」，不是 Application ID、Client ID 或 Client Secret。"
          Write-Host "  2. Web of Science Starter API 的訂閱狀態為 Approved／Active（Pending 表示仍在審核）。"
          Write-Host "  3. 剛核准的 Key 可能需要數分鐘後才生效。"
          Write-Host "  查看位置：developer.clarivate.com → 右上角帳號 → Applications → 您的 Application。" }
    403 { Write-Host "此 API Key 沒有 Starter API 的使用權限（403）。請確認已訂閱 Web of Science Starter API 並通過審核。" }
    0   { Write-Host "無法連線至 Clarivate（網路錯誤）。請確認網路連線，或改用其他網路再試。" }
    default { Write-Host "API 回應 HTTP $last，請將此訊息提供給維護人員。" }
  }
  Read-Host "按 Enter 關閉"; exit 1
}
Write-Host "API Key 確認通過，開始取得資料。"; Write-Host ""
[IO.File]::WriteAllText($out, '', (New-Object Text.UTF8Encoding $false))
$n = 0; $i = 0
foreach ($q in $queries) {
  $i++; $page = 1; $total = 0
  while ($true) {
    $u = $api + "?q=" + [uri]::EscapeDataString($q) + "&limit=50&page=$page"
    if ($edition) { $u += "&edition=" + [uri]::EscapeDataString($edition) }
    try { $r = Invoke-WebRequest -Uri $u -Headers @{ 'X-ApiKey' = $key } -UseBasicParsing }
    catch {
      $code = 0; try { $code = [int]$_.Exception.Response.StatusCode } catch {}
      if ($code -eq 429) { Write-Host "  請求太頻繁，等待 5 秒後重試…"; Start-Sleep 5; continue }
      Write-Host ""; Write-Host "第 $i 組第 $page 頁失敗（HTTP $code）：$($_.Exception.Message)"
      Write-Host "已取得的資料仍保存在 $out。"; Read-Host "按 Enter 關閉"; exit 1
    }
    $content = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
    [IO.File]::AppendAllText($out, $content + "\`n---PAGE---\`n", (New-Object Text.UTF8Encoding $false))
    $total = [int](($content | ConvertFrom-Json).metadata.total)
    Write-Host "  第 $i 組：第 $page 頁完成（本組共 $total 篇）"
    $n++
    if (($page * 50) -ge $total) { break }
    $page++; Start-Sleep -Seconds 1
  }
  Start-Sleep -Seconds 1
}
Write-Host ""
Write-Host "完成，共 $n 次請求。請將「$out」拖回教師論文盤點工具的「WoS 資料」步驟。"
Read-Host "按 Enter 關閉"
`;
}
/* 解析 API 結果檔 → 與 wosRecords 相同格式（無地址；_org 表示檢索已含機構條件） */
function parseApiResult(text, orgFiltered) {
  const chunks = text.split(/\r?\n---PAGE---\r?\n?/).map(s => s.trim()).filter(Boolean);
  const recs = []; let pages = 0, total = 0;
  for (const ch of chunks) {
    let j; try { j = JSON.parse(ch); } catch (e) { continue; }
    if (!j || !Array.isArray(j.hits)) continue; pages++;
    if (j.metadata && j.metadata.page === 1) total += j.metadata.total || 0;
    for (const h of j.hits) {
      const s = h.source || {}, id = h.identifiers || {}, au = (h.names && h.names.authors) || [];
      recs.push({ 'UT (Unique WOS ID)': h.uid, 'Author Full Names': au.map(a => a.displayName || a.wosStandard || '').join('; '), 'Addresses': '',
        'Article Title': h.title || '', 'Source Title': s.sourceTitle || '', 'Document Type': (h.types || []).join('; '), 'Publication Year': s.publishYear || '',
        'ISSN': id.issn || '', 'eISSN': id.eissn || '', 'DOI': id.doi || '', _org: !!orgFiltered });
    }
  }
  if (!pages) throw new Error('看不出是 WoS API 結果檔');
  return { records: recs, pages, total };
}

Object.assign(C, { buildApiQueries, apiScriptMac, apiScriptWin, parseApiResult, API_BASE, readCFB, readXLS, readXLSX, readTable, parseDelimited, decodeText, toCSV, wosRecords, expectedFromFilename, REQUIRED,
  parseEnglishName, nameVariants, nameKey, buildQueries, parseAddresses, matchPapers, TIER, TIER_LABEL, jcrLookup, parseJCRExport, counted, summarize, rosterFromTable });
if (typeof module !== 'undefined') module.exports = C; else root.Core = C;
})(typeof window !== 'undefined' ? window : globalThis);
