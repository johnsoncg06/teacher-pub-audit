[Setup]
AppId={{6E8B2C1A-4F3D-4C7B-9A15-2D8E7F0B3C41}
AppName=教師論文盤點工具
AppVersion=1.0.0
AppPublisher=醫資三甲 江桂宏、醫學二乙 葉睿穎
AppComments=中國醫藥大學醫學院 教師年度論文盤點（Web of Science）
DefaultDirName={localappdata}\Programs\TeacherPubAudit
DefaultGroupName=教師論文盤點工具
DisableProgramGroupPage=yes
DisableDirPage=yes
PrivilegesRequired=lowest
OutputDir=out
OutputBaseFilename=TeacherPubAudit_Setup
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\TeacherPubAudit.exe
UninstallDisplayName=教師論文盤點工具
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
VersionInfoVersion=1.0.0
VersionInfoProductName=教師論文盤點工具
VersionInfoDescription=教師論文盤點工具 安裝程式
CloseApplications=yes

[Languages]
Name: "zh"; MessagesFile: "{#LangFile}"

[Tasks]
Name: "desktopicon"; Description: "在桌面建立捷徑"; GroupDescription: "捷徑："

[Files]
Source: "dist\TeacherPubAudit\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\教師論文盤點工具"; Filename: "{app}\TeacherPubAudit.exe"
Name: "{autodesktop}\教師論文盤點工具"; Filename: "{app}\TeacherPubAudit.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\TeacherPubAudit.exe"; Description: "開啟教師論文盤點工具"; Flags: nowait postinstall skipifsilent
