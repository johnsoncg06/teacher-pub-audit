# -*- coding: utf-8 -*-
"""教師論文盤點工具：桌面版外殼（Windows .exe / macOS .app）

以系統內建瀏覽器元件（Windows：Edge WebView2；macOS：WKWebView）顯示工具介面，
並由本程式直接呼叫 Web of Science Starter API（不受瀏覽器跨網域限制），
API Key 存放於作業系統的安全儲存區（Windows 認證管理員／macOS 鑰匙圈）。
"""
import json
import os
import ssl
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path

APP_TITLE = "教師論文盤點工具"
KEY_SERVICE = "cmu-teacher-pub-audit"
KEY_USER = "wos-starter-api-key"
API_ROOT = os.environ.get("WOS_API_ROOT", "https://api.clarivate.com/apis/wos-starter")

try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:  # pragma: no cover
    SSL_CTX = ssl.create_default_context()

try:
    import keyring
    # 直接指定作業系統內建的鑰匙圈，不靠自動偵測（打包時只需帶這一個後端，體積較小）
    try:
        if sys.platform == "win32":
            from keyring.backends.Windows import WinVaultKeyring
            keyring.set_keyring(WinVaultKeyring())
        elif sys.platform == "darwin":
            from keyring.backends.macOS import Keyring as MacKeyring
            keyring.set_keyring(MacKeyring())
    except Exception:
        pass  # 退回 keyring 預設偵測
except Exception:  # pragma: no cover
    keyring = None

_mem_key = {"v": ""}  # keyring 不可用時的備援（僅存在記憶體，關閉程式即消失）


def resource(name):
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, name)


def _load_key():
    if keyring:
        try:
            return keyring.get_password(KEY_SERVICE, KEY_USER) or ""
        except Exception:
            pass
    return _mem_key["v"]


def _store_key(k):
    _mem_key["v"] = k
    if keyring:
        try:
            if k:
                keyring.set_password(KEY_SERVICE, KEY_USER, k)
            else:
                keyring.delete_password(KEY_SERVICE, KEY_USER)
            return True
        except Exception:
            return False
    return False


def _request(version, params, key, timeout=60):
    url = f"{API_ROOT}/{version}/documents?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"X-ApiKey": key, "Accept": "application/json",
                                                "User-Agent": "CMU-Teacher-Pub-Audit/1.0"})
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode("utf-8", "replace")
        except Exception:
            body = ""
        return e.code, body
    except Exception as e:  # 網路錯誤
        return 0, str(e)


class Api:
    """提供給網頁介面呼叫的功能（window.pywebview.api.*）。API Key 不會回傳給網頁。"""

    def __init__(self):
        self.window = None
        self.version = None

    # ---- 環境 ----
    def info(self):
        return {"desktop": True, "platform": sys.platform, "keyring": bool(keyring)}

    # ---- API Key ----
    def key_status(self):
        k = _load_key()
        return {"hasKey": bool(k), "length": len(k), "secure": bool(keyring)}

    def save_key(self, key):
        k = "".join(str(key or "").split())
        if not k:
            return {"ok": False, "message": "未輸入 API Key。"}
        res = self._check(k)
        if res["ok"]:
            stored = _store_key(k)
            res["stored"] = stored
            if not stored:
                res["message"] = "API Key 有效，但無法存入系統安全儲存區，本次執行期間有效，關閉程式後需重新輸入。"
        return res

    def clear_key(self):
        _store_key("")
        self.version = None
        return True

    def check_key(self):
        k = _load_key()
        if not k:
            return {"ok": False, "message": "尚未設定 API Key。"}
        return self._check(k)

    def _check(self, k):
        last = 0
        for v in ("v2", "v1"):
            code, _ = _request(v, {"q": "PY=2020", "limit": 1}, k, timeout=30)
            if code == 200:
                self.version = v
                return {"ok": True, "version": v}
            last = code
        msg = {
            401: "API Key 未被接受（401）。請確認貼上的是 Application 頁面中的「API Key」（不是 Application ID、Client ID 或 Client Secret），且 Web of Science Starter API 訂閱狀態為 Approved；剛核准的 Key 可能需數分鐘後生效。",
            403: "此 API Key 沒有 Starter API 的使用權限（403）。請確認已訂閱 Web of Science Starter API 並通過審核。",
            0: "無法連線至 Clarivate，請確認網路連線。",
        }.get(last, f"API 回應 HTTP {last}。")
        return {"ok": False, "status": last, "message": msg}

    # ---- 取得資料（一次一頁，由介面控制進度與速率）----
    def fetch_page(self, query, page, edition=""):
        k = _load_key()
        if not k:
            return {"status": -1, "body": "尚未設定 API Key。"}
        if not self.version:
            chk = self._check(k)
            if not chk["ok"]:
                return {"status": chk.get("status", 0), "body": chk["message"]}
        params = {"q": query, "limit": 50, "page": int(page)}
        if edition:
            params["edition"] = edition
        code, body = _request(self.version, params, k)
        return {"status": code, "body": body}

    # ---- 檔案 ----
    def save_file(self, name, content):
        import webview
        try:
            path = self.window.create_file_dialog(webview.SAVE_DIALOG, save_filename=name)
        except Exception as e:
            return {"ok": False, "message": str(e)}
        if not path:
            return {"ok": False, "cancelled": True}
        if isinstance(path, (list, tuple)):
            path = path[0]
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(content)
        return {"ok": True, "path": path}

    def open_print(self, html_text):
        fd, path = tempfile.mkstemp(suffix=".html", prefix="論文盤點報表_")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(html_text)
        webbrowser.open(Path(path).as_uri())
        return {"ok": True, "path": path}

    def open_url(self, url):
        if str(url).startswith(("https://", "http://")):
            webbrowser.open(url)
            return True
        return False


def data_dir():
    if sys.platform == "win32":
        base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~")
    elif sys.platform == "darwin":
        base = os.path.expanduser("~/Library/Application Support")
    else:
        base = os.path.expanduser("~/.local/share")
    p = os.path.join(base, "TeacherPubAudit")
    os.makedirs(p, exist_ok=True)
    return p


def main():
    import webview
    api = Api()
    try:
        webview.settings["OPEN_EXTERNAL_LINKS_IN_BROWSER"] = True
        webview.settings["ALLOW_DOWNLOADS"] = True
    except Exception:
        pass
    url = Path(resource("app.html")).as_uri()
    win = webview.create_window(APP_TITLE, url, js_api=api, width=1320, height=880, min_size=(1000, 680))
    api.window = win
    webview.start(private_mode=False, storage_path=data_dir())


def selftest(out_path):
    """編譯後自我檢查：確認刪減體積後，所有功能需要的元件都還在。結果寫成 JSON。"""
    r = {}

    def chk(name, fn):
        try:
            v = fn()
            r[name] = {"ok": True, "detail": v}
        except Exception as e:  # noqa: BLE001
            r[name] = {"ok": False, "detail": f"{type(e).__name__}: {e}"}

    def gui():
        import webview  # noqa: F401
        if sys.platform == "win32":
            import webview.platforms.winforms  # noqa: F401
            import webview.platforms.edgechromium  # noqa: F401
            return "winforms+edgechromium"
        if sys.platform == "darwin":
            import webview.platforms.cocoa  # noqa: F401
            return "cocoa"
        return "skip"

    def kr():
        if not keyring:
            raise RuntimeError("keyring 無法載入")
        name = type(keyring.get_keyring()).__name__
        if sys.platform == "win32":  # Windows 認證管理員可在 CI 實測寫入/讀取/刪除
            keyring.set_password("cmu-selftest", "u", "x1")
            assert keyring.get_password("cmu-selftest", "u") == "x1"
            keyring.delete_password("cmu-selftest", "u")
        return name

    def net():
        req = urllib.request.Request(API_ROOT + "/v1/documents?q=PY%3D2025&limit=1", headers={"X-ApiKey": "invalid"})
        try:
            urllib.request.urlopen(req, context=SSL_CTX, timeout=20)
            return "200"
        except urllib.error.HTTPError as e:  # 401 代表 HTTPS 與憑證都正常
            return f"HTTP {e.code}"

    def html():
        p = Path(resource("app.html"))
        return p.stat().st_size

    chk("gui", gui)
    chk("keyring", kr)
    chk("https", net)
    chk("app_html", html)
    chk("save_dialog_const", lambda: __import__("webview").SAVE_DIALOG is not None)
    Path(out_path).write_text(json.dumps(r, ensure_ascii=False, indent=1), encoding="utf-8")
    return all(v["ok"] for v in r.values())


def selftest_gui(out_path):
    """實際開啟視窗、載入介面，確認網頁和 Python 之間的橋接可用，然後自動關閉。"""
    import threading
    import time
    import webview
    res = {}
    done = {"v": False}

    def finish():
        if done["v"]:
            return
        done["v"] = True
        Path(out_path).write_text(json.dumps(res or {"err": "timeout"}, ensure_ascii=False), encoding="utf-8")
        try:
            w.destroy()
        except Exception:
            pass

    def on_loaded():
        try:
            time.sleep(2)
            res["bridge"] = w.evaluate_js(
                "typeof window.pywebview!=='undefined' && window.pywebview.api ? typeof window.pywebview.api.key_status : 'missing'")
            res["title"] = w.evaluate_js("document.title")
            res["steps"] = w.evaluate_js("document.querySelectorAll('[data-step], .step').length")
        except Exception as e:  # noqa: BLE001
            res["err"] = f"{type(e).__name__}: {e}"
        finish()

    w = webview.create_window("selftest", Path(resource("app.html")).as_uri(), js_api=Api(), width=1000, height=700)
    w.events.loaded += on_loaded
    threading.Timer(90, finish).start()
    webview.start(private_mode=True)
    finish()
    return res.get("bridge") == "function"


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--selftest-gui":
        sys.exit(0 if selftest_gui(sys.argv[2]) else 1)
    if len(sys.argv) >= 3 and sys.argv[1] == "--selftest":
        sys.exit(0 if selftest(sys.argv[2]) else 1)
    main()
