#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 src/ 的原始碼合併成單一 HTML：python3 src/build.py  →  輸出到 repo 根目錄的 app.html。
App 打包（PyInstaller）使用根目錄的 app.html，所以修改 src/ 後必須重新執行本指令並一起提交。"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
subprocess.check_call([sys.executable, os.path.join(HERE, 'gen_i18n.py')])


def rd(n):
    return open(os.path.join(HERE, n), encoding='utf-8').read()


s = rd('app.html')
s = s.replace('<!--CORE-->', '<script>\n' + rd('core.js') + '\n</script>')
s = s.replace('<!--JCR-->', '<script>\n' + rd('jcr_data.js') + '\n</script>')
s = s.replace('<!--I18N-->', '<script>\n' + rd('i18n_data.js') + '\n</script>\n<script>\n' + rd('i18n.js') + '\nI18N.init();\n</script>')
for tag in ('<!--CORE-->', '<!--JCR-->', '<!--I18N-->'):
    assert tag not in s, tag
out = os.path.join(ROOT, 'app.html')
open(out, 'w', encoding='utf-8', newline='\n').write(s)
print('已寫入', out, len(s), '字元')
