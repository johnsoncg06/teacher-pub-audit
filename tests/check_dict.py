# -*- coding: utf-8 -*-
"""詞典靜態檢查：每筆五欄皆非空、各語言的 {n} 變數集合與繁中一致、無重複的繁中鍵。python3 tests/check_dict.py"""
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src'))
seen, bad = {}, []
for mod, var in (('i18n_dict_a', 'A'), ('i18n_dict_b', 'B'), ('i18n_dict_c', 'C'), ('i18n_dict_d', 'D')):
    for e in getattr(__import__(mod), var):
        if len(e) != 5:
            bad.append(('欄位數不是 5', e[0][:40]))
            continue
        ph = sorted(re.findall(r'\{\d+\}', e[0]))
        for i, lang in enumerate(('en', 'ja', 'ko', 'es'), 1):
            if not e[i].strip():
                bad.append((lang + ' 空白', e[0][:40]))
            elif sorted(re.findall(r'\{\d+\}', e[i])) != ph:
                bad.append((lang + ' 變數不一致', e[0][:40]))
        if e[0] in seen and seen[e[0]] != e:
            bad.append(('重複鍵且內容不同', e[0][:40]))
        seen[e[0]] = e
print(len(seen), '筆詞條')
for b in bad:
    print('FAIL', *b)
sys.exit(1 if bad else 0)
