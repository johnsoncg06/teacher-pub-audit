# 교원 논문 점검 도구 (데스크톱 버전)

[繁體中文](README.md) | [English](README.en.md) | [日本語](README.ja.md) | **한국어** | [Español](README.es.md)

Web of Science를 이용해 교원의 연간 논문 수와 게재 학술지의 품질을 점검하는 데스크톱 앱입니다. 화면은 웹 버전과 같습니다. 또한 앱 안에서 본인의 Web of Science Starter API 키를 입력하면 터미널 없이 데이터를 바로 가져올 수 있습니다.

**제작**: 중국의약대학교(대만) 의료정보학과 3학년 갑반 장궤이훙(Chiang Kuei-Hung, 江桂宏), 의학과 2학년 을반 예루이잉(Yeh Jui-Ying, 葉睿穎)

## 주요 기능
- 8단계 안내형 작업 흐름: 점검 범위 → 교원 명단 → 영문 이름 → WoS 데이터 → 대조 → 학술지 품질 → 수동 검토 → 보고서
- Web of Science Core Collection의 Article과 Review 기록을 가져옵니다. 앱 안의 Starter API로 가져오거나, WoS 웹사이트에서 내보낸 파일(.xls, .xlsx, .csv, .txt)을 불러올 수 있습니다
- 저자 이름과 소속 기관으로 논문을 교원과 자동 대조하고, 동명이인일 가능성이 있는 저자는 수동 검토 대상으로 표시합니다
- 각 학술지의 저널 영향력 지수(JIF)와 JCR 사분위(Q1~Q4)를 붙입니다. JCR 공식 내보내기 파일을 불러오면 내장 데이터를 대체할 수 있습니다
- 교원별 요약표, 논문별 목록, 학술지 대조표를 CSV로 내보내고, A4 가로 보고서를 PDF로 인쇄할 수 있습니다
- 모든 데이터는 사용자의 컴퓨터 안에만 남습니다. 프로젝트는 .json 파일로 저장해 Mac과 Windows 어디서나 열 수 있습니다

## 최신 버전 다운로드

| 컴퓨터 | 다운로드 |
|---|---|
| Windows 10/11 | [**Windows 설치 프로그램**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Windows_Setup.exe) |
| Mac (Apple 실리콘, M1 이후) | [**Mac (Apple 실리콘) .dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_AppleSilicon.dmg) |
| Mac (Intel 프로세서) | [**Mac (Intel) .dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_Intel.dmg) |
| 사용 설명서 | [**그림으로 보는 사용 설명서 PDF** (중국어 번체)](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf) |

Mac의 칩을 모르겠다면: Apple 메뉴 → "이 Mac에 관하여"에서 "칩"이 Apple M으로 시작하면 Apple 실리콘 버전, "프로세서"가 Intel이면 Intel 버전을 선택하세요. 모든 버전과 변경 내역은 [Releases](https://github.com/johnsoncg06/teacher-pub-audit/releases) 페이지에서 볼 수 있습니다.

## 사용 설명서

- [**그림으로 보는 사용 설명서 온라인으로 읽기**](docs/%E6%95%99%E5%B8%AB%E8%AB%96%E6%96%87%E7%9B%A4%E9%BB%9E%E5%B7%A5%E5%85%B7_%E5%9C%96%E8%A7%A3%E4%BD%BF%E7%94%A8%E8%AA%AA%E6%98%8E%E6%9B%B8.pdf) (PDF, 30쪽, GitHub에서 바로 열림, 중국어 번체)
- [**설명서 PDF 다운로드**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf) (최신 릴리스와 함께 배포)
- 앱 안의 "說明與常見問題"(도움말 및 FAQ, ⌘? 또는 Ctrl+?, F1)에서 같은 내용을 검색할 수 있습니다

설명서에는 설치와 실행, 8단계 작업의 그림 설명, WoS 계정 및 Starter API 키 신청 방법, 데이터를 가져오는 두 가지 방법(앱 안의 API 또는 웹 내보내기), 보고서 항목 설명, 데이터 저장 위치, 업데이트와 삭제 방법, 57개의 자주 묻는 질문이 담겨 있습니다. 현재는 중국어 번체판만 제공됩니다.

**작업 흐름**

| 단계 | 하는 일 |
|---|---|
| 1 점검 범위 | 대학, 단과대학, 연도, 문헌 유형 설정 (기본값은 Article, Review) |
| 2 교원 명단 | 명단 불러오기 (.xlsx, .xls, .csv) |
| 3 영문 이름 | 각 교원의 영문 이름과 검색용 표기 확인 |
| 4 WoS 데이터 | 앱 안에서 API 키를 입력해 가져오거나, WoS 웹 내보내기 파일 불러오기 |
| 5 대조 | 저자와 소속 기관으로 자동 대조하고, 동명이인 가능성이 있는 저자 표시 |
| 6 학술지 품질 | ISSN으로 JIF와 JCR 사분위(Q1~Q4) 부여, JCR 공식 파일 불러오기 가능 |
| 7 수동 검토 | 표시된 논문이 본인의 저작인지 한 건씩 확인 |
| 8 보고서 | 교원별 요약표, 논문 목록, 학술지 대조표를 내보내거나 PDF로 인쇄 |

## 소스에서 빌드하기 (개발자용)
앱 관련 파일을 `main`에 푸시하면 GitHub Actions가 자동으로 빌드하고 Releases에 게시합니다.
- `TeacherPubAudit-Windows`: Windows 설치 프로그램 (教師論文盤點工具_安裝程式.exe)
- `TeacherPubAudit-macOS-AppleSilicon`: Apple 실리콘(M 시리즈) Mac용 .dmg
- `TeacherPubAudit-macOS-Intel`: Intel Mac용 .dmg
- 참고: 개발자 모드를 켜거나 강제로 설치해야 할 수 있습니다.

각 빌드의 파일은 **Actions** → 해당 "編譯桌面版"(데스크톱 버전 빌드) 실행 → **Artifacts**에서도 받을 수 있습니다.

빌드할 때마다 패키징된 앱에 대해 자동 자체 테스트(창 구성 요소, 키체인 접근, HTTPS 연결, 화면 열기)를 실행하며, Windows 빌드는 Microsoft Defender로 검사합니다. 검사 중 하나라도 실패한 빌드에서는 설치 프로그램이 만들어지지 않습니다.

## 처음 실행할 때 (서명되지 않은 앱)
- **Windows**: "Windows의 PC 보호" 화면이 나타나면 "추가 정보" → "실행"을 클릭합니다. 설치에는 관리자 권한이 필요하지 않습니다. 그래도 Windows 보안이 차단하면 Windows 보안 → 바이러스 및 위협 방지 → 보호 기록 → 해당 항목 선택 → "허용" 순서로 진행합니다.
- **macOS**: 앱을 "응용 프로그램" 폴더로 끌어다 놓은 뒤, 처음 한 번은 앱을 마우스 오른쪽 버튼으로 클릭해 "열기" → "열기"를 선택합니다. 그래도 차단되면 시스템 설정 → "개인정보 보호 및 보안" → 아래쪽의 "그래도 열기"를 클릭합니다.

## 파일 구성
- `main.py`: 데스크톱 셸(pywebview). WoS Starter API 호출과, API 키를 운영체제의 보안 저장소(Windows 자격 증명 관리자 / macOS 키체인)에 보관하는 일을 맡습니다.
- `app.html`: 앱 화면 (웹 버전과 동일하며 앱 소스에서 빌드해 생성).
- `setup.iss`: Windows 설치 프로그램 설정 (Inno Setup).
- `version_info.txt`: Windows 실행 파일에 내장되는 버전 정보.
- `docs/`: 그림으로 보는 사용 설명서 (PDF).
- `.github/workflows/build.yml`: 자동 빌드 설정.

API 키는 사용자 컴퓨터의 운영체제 보안 저장소에만 저장됩니다. 파일에 기록하거나 업로드하지 않습니다.

## 데이터 출처
논문 데이터는 Clarivate의 Web of Science Core Collection에서 가져옵니다. 사용자마다 본인의 Web of Science Starter API 키(Free Institutional Member Plan)가 필요합니다. 내장된 학술지 품질 데이터는 GitHub 프로젝트 suqingdong/impact_factor에서 가져온 것으로 공식 자료가 아닙니다. 공식 보고서에는 소속 기관의 JCR 데이터를 사용하세요.
