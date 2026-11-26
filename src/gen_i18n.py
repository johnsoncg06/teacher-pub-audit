# -*- coding: utf-8 -*-
"""合併五份詞典（i18n_dict_*.py）並寫出 i18n_data.js。每筆為 (繁中, English, 日本語, 한국어, Español)。"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
rows = {}
for mod, var in (('i18n_dict_a', 'A'), ('i18n_dict_b', 'B'), ('i18n_dict_c', 'C'), ('i18n_dict_d', 'D')):
    for e in getattr(__import__(mod), var):
        assert len(e) == 5, e
        rows[e[0]] = e
out = os.path.join(HERE, 'i18n_data.js')
open(out, 'w', encoding='utf-8').write('window.I18N_DICT=' + json.dumps(list(rows.values()), ensure_ascii=False) + ';')
print(len(rows), 'entries')
