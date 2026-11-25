# 教師論文盤點工具（桌面版）

Web of Science 年度論文與期刊品質盤點工具的桌面版。介面與網頁版相同，另外可在 App 內輸入 Web of Science Starter API Key，直接取得資料，不需使用終端機。

**製作**：醫資三甲 江桂宏、醫學二乙 葉睿穎

## 下載
推送到 `main` 後，GitHub Actions 會自動編譯：
- `TeacherPubAudit-Windows`：教師論文盤點工具.exe
- `TeacherPubAudit-macOS-AppleSilicon`：M 系列晶片 Mac 用 .dmg
- `TeacherPubAudit-macOS-Intel`：Intel Mac 用 .dmg

到 repo 的 **Actions** → 最新一次「編譯桌面版」→ 頁面下方 **Artifacts** 下載。

## 第一次開啟（未簽章程式）
- **Windows**：出現「Windows 已保護您的電腦」時，按「其他資訊」→「仍要執行」。
- **macOS**：將 App 拖到「應用程式」後，第一次請在 App 上按右鍵 →「打開」→「打開」。若仍被阻擋：系統設定 →「隱私權與安全性」→ 下方「仍要打開」。

## 檔案
- `main.py`：桌面外殼（pywebview），負責呼叫 WoS Starter API 與以系統安全儲存區保存 API Key（Windows 認證管理員／macOS 鑰匙圈）。
- `app.html`：工具介面（與網頁版相同，由 app 原始碼 build 產生）。
- `.github/workflows/build.yml`：自動編譯設定。

API Key 只存於使用者本機的系統安全儲存區，不會寫入檔案或上傳。
