// 核心邏輯單元測試（不需瀏覽器、不含任何真實資料）：node tests/test_core.js
const C = require('../src/core.js'); const { check, done } = require('./helpers.js');
console.log('姓名變體與鍵值');
check('變體含原寫法與連字號合併寫法', JSON.stringify(C.nameVariants('Wang, Shih-Fan')) === JSON.stringify(['Wang, Shih-Fan', 'Wang, Shihfan']), C.nameVariants('Wang, Shih-Fan'));
check('姓名順序與連字號不影響鍵值', C.nameKey('Wang, Shih-Fan') === C.nameKey('Shih-Fan Wang') && C.nameKey('Wang Shih Fan') === C.nameKey('Wang, Shih-Fan'));
console.log('地址解析');
const ad = C.parseAddresses('[A, B; C, D] X Univ, Y; [E, F] Z Univ');
check('一個地址對應多位作者', ad['A, B'][0] === 'X Univ, Y' && ad['C, D'][0] === 'X Univ, Y' && ad['E, F'][0] === 'Z Univ', ad);
console.log('比對分級與採計規則');
const T = [{ id: 't1', zh: '王示範', en: 'Wang, Shih-Fan', include: true }];
const rec = (ut, names, addr) => ({ 'UT (Unique WOS ID)': ut, 'Author Full Names': names, 'Addresses': addr, 'Article Title': 'x', 'Source Title': 'J', 'Document Type': 'Article', 'Publication Year': '2025', 'ISSN': '1078-8956', 'eISSN': '', 'DOI': '' });
const R = C.matchPapers(T, [
  rec('U1', 'Wang, Shih-Fan; Lee, A', '[Wang, Shih-Fan; Lee, A] Demo Univ, Taichung'),
  rec('U2', 'Wang, Shih-Fan; Lee, A', '[Wang, Shih-Fan] Natl Hosp, Taipei; [Lee, A] Demo Univ, Taichung'),
  rec('U3', 'Wang, Shih-Fan; Lee, A', '[Wang, Shih-Fan] Univ Elsewhere, Boston; [Lee, A] Univ Elsewhere, Boston'),
  rec('U4', 'Wang, Shih-Fan; Lee, A', '[Lee, A] Demo Univ, Taichung'),
  rec('U1', 'Wang, Shih-Fan', '[Wang, Shih-Fan] Demo Univ'),   // 重複 UT 只算一次
], 'Demo Univ');
const tier = ut => (R.find(r => r.ut === ut) || {}).tier;
check('確定掛本校 = 0', tier('U1') === C.TIER.YES);
check('疑似漏掛 = 1', tier('U2') === C.TIER.SUSPECT);
check('同名他人 = 2', tier('U3') === C.TIER.OTHER);
check('無法判定 = 3', tier('U4') === C.TIER.UNKNOWN);
check('同一 UT 不重複', R.length === 4, R.length);
const cnt = d => R.filter(r => C.counted(r, d)).map(r => r.ut).sort().join();
check('預設：確定與疑似採計，其餘不採計', cnt({}) === 'U1,U2', cnt({}));
check('人工審核可覆寫預設', cnt({ 't1|U2': 'no', 't1|U4': 'yes' }) === 'U1,U4', cnt({ 't1|U2': 'no', 't1|U4': 'yes' }));
console.log('JCR 對照與彙總');
global.window = {}; eval(require('fs').readFileSync(require('path').join(__dirname, '../src/jcr_data.js'), 'utf8'));
const J = window.JCR_BUILTIN;
check('內建資料筆數合理（>30000）', Object.keys(J).length > 30000);
check('以 ISSN 查得期刊品質', (C.jcrLookup(R[0], J) || [])[1] === 'Q1');
const sum = C.summarize([{ id: 't1', zh: '王示範', dept: '系', title: '', en: 'Wang, Shih-Fan', include: true }], R, {}, J);
check('彙總：採計 2 篇、Q1 兩篇', sum[0]['採計篇數'] === 2 && sum[0]['Q1'] === 2, sum[0]);
check('彙總：待審核 = 疑似 + 無法判定 = 2', sum[0]['待審核'] === 2, sum[0]['待審核']);
done();
