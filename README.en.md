# Faculty Publication Audit Tool (Desktop)

[繁體中文](README.md) | **English** | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md)

A desktop app for auditing faculty members' annual publications in Web of Science and the quality of the journals they publish in. The interface is the same as the web version. In addition, users can enter their own Web of Science Starter API key inside the app and retrieve data directly, without using a terminal.

**Interface language**: use the selector at the bottom left of the app to switch between 繁體中文, English, 日本語, 한국어 and Español (default: Traditional Chinese; your choice is remembered). The Help/FAQ and the AI prompt documents remain in Traditional Chinese; user data such as names and departments is never translated.

**Authors**: Chiang Kuei-Hung (Medical Informatics, Year 3, Class A) and Yeh Jui-Ying (Medicine, Year 2, Class B), China Medical University, Taiwan

## Features
- An eight-step guided workflow: audit scope → faculty roster → English names → WoS data → matching → journal quality → manual review → report
- Retrieves Article and Review records from the Web of Science Core Collection, either through the Starter API inside the app or by importing files exported from the WoS website (.xls, .xlsx, .csv, .txt)
- Matches papers to faculty members by name and affiliation, and flags possible same-name authors for manual review
- Adds each journal's Journal Impact Factor (JIF) and JCR quartile (Q1–Q4); an official JCR export can be imported to replace the built-in data
- Exports per-faculty summaries, per-paper lists and journal tables as CSV, and prints an A4 landscape report to PDF
- All data stays on the user's computer; projects can be saved as .json files and opened on Mac or Windows

## Download the latest version

| Computer | Download |
|---|---|
| Windows 10/11 | [**Windows installer**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Windows_Setup.exe) |
| Mac (Apple silicon, M1 or later) | [**Mac (Apple silicon) .dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_AppleSilicon.dmg) |
| Mac (Intel) | [**Mac (Intel) .dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_Intel.dmg) |
| User manual | [**Illustrated manual PDF** (Traditional Chinese)](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf) |

Not sure which Mac you have? Apple menu → "About This Mac": choose Apple silicon if "Chip" starts with Apple M, or Intel if "Processor" says Intel. All versions and change history are on the [Releases](https://github.com/johnsoncg06/teacher-pub-audit/releases) page.

## User manual

- [**Read the illustrated manual online**](docs/%E6%95%99%E5%B8%AB%E8%AB%96%E6%96%87%E7%9B%A4%E9%BB%9E%E5%B7%A5%E5%85%B7_%E5%9C%96%E8%A7%A3%E4%BD%BF%E7%94%A8%E8%AA%AA%E6%98%8E%E6%9B%B8.pdf) (PDF, 30 pages, opens directly on GitHub; Traditional Chinese)
- [**Download the manual (PDF)**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf) (published with each release)
- Inside the app, "說明與常見問題" (Help & FAQ; ⌘? or Ctrl+?, F1) offers the same content with search

The manual covers installation, an illustrated walkthrough of all eight steps, applying for a WoS account and Starter API key, the two ways to get data (API inside the app or WoS web export), report fields, data storage, updating and uninstalling, and 57 FAQs. It is currently available in Traditional Chinese only.

**Workflow**

| Step | What you do |
|---|---|
| 1 Audit scope | Set the school, college, year and document types (Article and Review by default) |
| 2 Faculty roster | Import the roster (.xlsx, .xls, .csv) |
| 3 English names | Confirm each faculty member's English name and search variants |
| 4 WoS data | Retrieve data with your API key inside the app, or import WoS web exports |
| 5 Matching | Papers are matched by author and affiliation; possible same-name authors are flagged |
| 6 Journal quality | JIF and JCR quartile (Q1–Q4) are added by ISSN; an official JCR export can be imported |
| 7 Manual review | Confirm whether each flagged paper belongs to the faculty member |
| 8 Report | Export per-faculty summaries, per-paper lists and journal tables, or print to PDF |

## Building from source (developers)
Every push of app-related files to `main` triggers a GitHub Actions build and publishes it to Releases:
- `TeacherPubAudit-Windows`: Windows installer (教師論文盤點工具_安裝程式.exe)
- `TeacherPubAudit-macOS-AppleSilicon`: .dmg for Macs with Apple silicon (M series)
- `TeacherPubAudit-macOS-Intel`: .dmg for Intel Macs
- Note: you may need to enable Developer Mode or force the installation.

Each build's files are also available under **Actions** → that "編譯桌面版" (desktop build) run → **Artifacts**.

Each build runs automated self-tests on the packaged app (window components, keychain access, HTTPS connection, and opening the interface), and the Windows build is scanned with Microsoft Defender. A build that fails any check produces no installer.

## First launch (unsigned app)
- **Windows**: if "Windows protected your PC" appears, click "More info" → "Run anyway". The installer does not require administrator rights. If Windows Security still blocks it, go to Windows Security → Virus & threat protection → Protection history, select the item, and choose "Allow".
- **macOS**: after dragging the app into Applications, right-click the app the first time and choose "Open" → "Open". If it is still blocked, go to System Settings → Privacy & Security and click "Open Anyway" at the bottom.

## Files
- `main.py`: the desktop shell (pywebview). It calls the WoS Starter API and stores the API key in the operating system's secure storage (Windows Credential Manager / macOS Keychain).
- `app.html`: the app interface (same as the web version, generated from the app source).
- `setup.iss`: the Windows installer script (Inno Setup).
- `version_info.txt`: version information embedded in the Windows executable.
- `docs/`: the illustrated user manual (PDF).
- `.github/workflows/build.yml`: the automated build configuration.

The API key is stored only in the system's secure storage on the user's computer. It is never written to a file or uploaded.

## Data sources
Publication data comes from the Clarivate Web of Science Core Collection. Each user needs their own Web of Science Starter API key (Free Institutional Member Plan). The built-in journal quality data comes from the GitHub project suqingdong/impact_factor and is not an official source; official reports should use the institution's JCR data.
