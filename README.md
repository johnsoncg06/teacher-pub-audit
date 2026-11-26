# 教師論文盤點工具（桌面版）

**繁體中文** | [English](README.en.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md)

Web of Science 年度論文與期刊品質盤點工具的桌面版。介面與網頁版相同，另外可在 App 內輸入 Web of Science Starter API Key，直接取得資料，不需使用終端機。

**製作**：中國醫藥大學 醫資三甲 江桂宏、醫學二乙 葉睿穎

## 下載最新版本

| 電腦 | 下載 |
|---|---|
| Windows 10／11 | [**Windows 安裝程式**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Windows_Setup.exe) |
| Mac（Apple 晶片，M1 以後） | [**Mac（Apple 晶片）.dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_AppleSilicon.dmg) |
| Mac（Intel 處理器） | [**Mac（Intel）.dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_Intel.dmg) |
| 使用說明書 | [**圖解使用說明書 PDF**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf) |

不確定 Mac 的晶片：蘋果選單 →「關於這台 Mac」，「晶片」為 Apple M 開頭選 Apple 晶片版，「處理器」為 Intel 選 Intel 版。所有版本與更新紀錄見 [Releases](https://github.com/johnsoncg06/teacher-pub-audit/releases)。

## 使用說明書

- [**線上閱讀圖解使用說明書**](docs/%E6%95%99%E5%B8%AB%E8%AB%96%E6%96%87%E7%9B%A4%E9%BB%9E%E5%B7%A5%E5%85%B7_%E5%9C%96%E8%A7%A3%E4%BD%BF%E7%94%A8%E8%AA%AA%E6%98%8E%E6%9B%B8.pdf)（PDF，30 頁，在 GitHub 上直接開啟）
- [**下載說明書 PDF**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf)（隨最新版本發布）
- App 內按「說明與常見問題」（⌘? 或 Ctrl+?、F1）可搜尋相同內容

說明書內容：安裝與開啟、八個操作步驟的圖解、申請 WoS 帳號與 Starter API Key、API 自動取得與網頁匯出兩種取得方式、報表欄位說明、資料儲存、更新與移除，以及 57 則常見問題。

**操作流程**

| 步驟 | 作業內容 |
|---|---|
| 1 盤點範圍 | 設定學校、學院、年度與文獻類型（預設 Article、Review） |
| 2 教師名單 | 匯入名單（.xlsx、.xls、.csv） |
| 3 英文姓名 | 確認每位教師的英文姓名與檢索寫法 |
| 4 WoS 資料 | 在 App 內輸入 API Key 自動取得，或匯入 WoS 網頁匯出檔 |
| 5 比對結果 | 依作者與機構自動比對，標示需審核的同名作者 |
| 6 期刊品質 | 依 ISSN 對應 JIF 與 JCR 分區（Q1–Q4），可匯入 JCR 官方檔 |
| 7 人工審核 | 逐筆確認是否為本人著作 |
| 8 報表 | 匯出教師彙總表、逐篇清單、期刊對照表，或列印 PDF |

## 自行編譯（開發者）
推送程式相關檔案到 `main` 後，GitHub Actions 會自動編譯，並發布到 Releases：
- `TeacherPubAudit-Windows`：Windows 安裝程式（教師論文盤點工具_安裝程式.exe）
- `TeacherPubAudit-macOS-AppleSilicon`：M 系列晶片 Mac 用 .dmg
- `TeacherPubAudit-macOS-Intel`：Intel Mac 用 .dmg
- 注意：記得打開開發者模式或者是強制安裝

每次編譯的檔案也可在 **Actions** → 該次「編譯桌面版」→ **Artifacts** 下載。

## 第一次開啟（未簽章程式）
- **Windows**：出現「Windows 已保護您的電腦」時，按「其他資訊」→「仍要執行」。安裝不需要系統管理員權限。若 Windows 安全性仍攔截：Windows 安全性 → 病毒與威脅防護 → 保護歷程記錄 → 點選該項目 →「允許」。
- **macOS**：將 App 拖到「應用程式」後，第一次請在 App 上按右鍵 →「打開」→「打開」。若仍被阻擋：系統設定 →「隱私權與安全性」→ 下方「仍要打開」。

## 檔案
- `main.py`：桌面外殼（pywebview），負責呼叫 WoS Starter API 與以系統安全儲存區保存 API Key（Windows 認證管理員／macOS 鑰匙圈）。
- `app.html`：工具介面（與網頁版相同，由 app 原始碼 build 產生）。
- `setup.iss`：Windows 安裝程式設定（Inno Setup）。
- `version_info.txt`：Windows 執行檔的版本資訊。
- `docs/`：圖解使用說明書（PDF）。
- `.github/workflows/build.yml`：自動編譯設定。

API Key 只存於使用者本機的系統安全儲存區，不會寫入檔案或上傳。
