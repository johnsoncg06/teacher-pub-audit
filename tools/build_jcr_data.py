#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""由 suqingdong/impact_factor 的 SQLite 資料庫（if.db）產生內建期刊品質資料 src/jcr_data.js。

用法：python3 tools/build_jcr_data.py <if.db> <年度> [輸出檔，預設 src/jcr_data.js]
例：  python3 tools/build_jcr_data.py if.db 2025

格式：window.JCR_BUILTIN = { "ISSN": [JIF, "Q1~Q4", "中科院分區"], ... }（ISSN 與 eISSN 各一筆）
注意：此資料為非官方整理；正式報告請在 App 內匯入學校的 JCR 官方匯出檔，優先於內建資料。
"""
import json
import sqlite3
import sys


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    db, year = sys.argv[1], sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else 'src/jcr_data.js'
    c = sqlite3.connect(db)
    m = {}
    for nlm, f, jcr, j, ab, i, e, z in c.execute('select * from factor'):
        v = [f, jcr if jcr in ('Q1', 'Q2', 'Q3', 'Q4') else '', z or '']
        for k in (i, e):
            if k and k.strip() and k != 'N/A':
                m.setdefault(k.strip().upper(), v)
    js = 'window.JCR_BUILTIN=' + json.dumps(m, ensure_ascii=False, separators=(',', ':')) + ';'
    js += 'window.JCR_BUILTIN_INFO=' + json.dumps('GitHub suqingdong/impact_factor（%s JIF，非官方）' % year, ensure_ascii=False) + ';'
    open(out, 'w', encoding='utf-8').write(js)
    print('已寫入', out, '共', len(m), '筆 ISSN')


if __name__ == '__main__':
    main()
