# Faculty Publication Audit Tool (Desktop)

[繁體中文](README.md) | **English**

A desktop app for auditing faculty members' annual publications in Web of Science and the quality of the journals they publish in. The interface is the same as the web version. In addition, users can enter their own Web of Science Starter API key inside the app and retrieve data directly, without using a terminal.

**Authors**: Chiang Kuei-Hung (Medical Informatics, Year 3, Class A) and Yeh Jui-Ying (Medicine, Year 2, Class B), China Medical University, Taiwan

## Features
- An eight-step guided workflow: audit scope → faculty roster → English names → WoS data → matching → journal quality → manual review → report
- Retrieves Article and Review records from the Web of Science Core Collection, either through the Starter API inside the app or by importing files exported from the WoS website (.xls, .xlsx, .csv, .txt)
- Matches papers to faculty members by name and affiliation, and flags possible same-name authors for manual review
- Adds each journal's Journal Impact Factor (JIF) and JCR quartile (Q1–Q4); an official JCR export can be imported to replace the built-in data
- Exports per-faculty summaries, per-paper lists and journal tables as CSV, and prints an A4 landscape report to PDF
- All data stays on the user's computer; projects can be saved as .json files and opened on Mac or Windows

## Download
Every push to `main` triggers a GitHub Actions build:
- `TeacherPubAudit-Windows`: Windows installer (教師論文盤點工具_安裝程式.exe)
- `TeacherPubAudit-macOS-AppleSilicon`: .dmg for Macs with Apple silicon (M series)
- `TeacherPubAudit-macOS-Intel`: .dmg for Intel Macs
- Note: you may need to enable Developer Mode or force the installation.

Go to the repo's **Actions** tab → the latest "編譯桌面版" (desktop build) run → **Artifacts** at the bottom of the page.

Each build runs automated self-tests on the packaged app (window components, keychain access, HTTPS connection, and opening the interface), and the Windows build is scanned with Microsoft Defender. A build that fails any check produces no installer.

## First launch (unsigned app)
- **Windows**: if "Windows protected your PC" appears, click "More info" → "Run anyway". The installer does not require administrator rights. If Windows Security still blocks it, go to Windows Security → Virus & threat protection → Protection history, select the item, and choose "Allow".
- **macOS**: after dragging the app into Applications, right-click the app the first time and choose "Open" → "Open". If it is still blocked, go to System Settings → Privacy & Security and click "Open Anyway" at the bottom.

## Files
- `main.py`: the desktop shell (pywebview). It calls the WoS Starter API and stores the API key in the operating system's secure storage (Windows Credential Manager / macOS Keychain).
- `app.html`: the app interface (same as the web version, generated from the app source).
- `setup.iss`: the Windows installer script (Inno Setup).
- `version_info.txt`: version information embedded in the Windows executable.
- `.github/workflows/build.yml`: the automated build configuration.

The API key is stored only in the system's secure storage on the user's computer. It is never written to a file or uploaded.

## Data sources
Publication data comes from the Clarivate Web of Science Core Collection. Each user needs their own Web of Science Starter API key (Free Institutional Member Plan). The built-in journal quality data comes from the GitHub project suqingdong/impact_factor and is not an official source; official reports should use the institution's JCR data.
