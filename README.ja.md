# 教員論文棚卸しツール（デスクトップ版）

[繁體中文](README.md) | [English](README.en.md) | **日本語** | [한국어](README.ko.md) | [Español](README.es.md)

Web of Science を使って、教員の年間論文数と掲載ジャーナルの質を点検するデスクトップアプリです。画面はウェブ版と同じです。さらに、アプリ内で自分の Web of Science Starter API キーを入力すれば、ターミナルを使わずにデータを直接取得できます。

**制作**：中国医薬大学（台湾）　医療情報学科 3年甲組 江桂宏（Chiang Kuei-Hung）、医学科 2年乙組 葉睿穎（Yeh Jui-Ying）

## 主な機能
- 8 ステップのガイド付きワークフロー：点検範囲 → 教員名簿 → 英語氏名 → WoS データ → 照合 → ジャーナルの質 → 手動確認 → レポート
- Web of Science コアコレクションの Article と Review を取得。アプリ内の Starter API で取得するか、WoS のウェブサイトからエクスポートしたファイル（.xls、.xlsx、.csv、.txt）を取り込めます
- 著者名と所属機関で論文を教員に自動照合し、同姓同名の可能性がある著者には確認用の印を付けます
- 各ジャーナルのジャーナルインパクトファクター（JIF）と JCR 四分位（Q1〜Q4）を付与。JCR の公式エクスポートを取り込めば、内蔵データを置き換えられます
- 教員別の集計表、論文ごとの一覧、ジャーナル対照表を CSV で出力でき、A4 横向きのレポートを PDF に印刷できます
- データはすべて利用者のパソコン内にとどまります。プロジェクトは .json ファイルとして保存でき、Mac と Windows のどちらでも開けます

## 最新版のダウンロード

| お使いのパソコン | ダウンロード |
|---|---|
| Windows 10／11 | [**Windows インストーラー**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Windows_Setup.exe) |
| Mac（Apple シリコン、M1 以降） | [**Mac（Apple シリコン）.dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_AppleSilicon.dmg) |
| Mac（Intel プロセッサ） | [**Mac（Intel）.dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_Intel.dmg) |
| 使用説明書 | [**図解使用説明書 PDF**（繁体字中国語）](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf) |

Mac のチップが分からない場合：アップルメニュー →「このMacについて」を開き、「チップ」が Apple M で始まれば Apple シリコン版、「プロセッサ」が Intel なら Intel 版を選んでください。すべてのバージョンと更新履歴は [Releases](https://github.com/johnsoncg06/teacher-pub-audit/releases) をご覧ください。

## 使用説明書

- [**図解使用説明書をオンラインで読む**](docs/%E6%95%99%E5%B8%AB%E8%AB%96%E6%96%87%E7%9B%A4%E9%BB%9E%E5%B7%A5%E5%85%B7_%E5%9C%96%E8%A7%A3%E4%BD%BF%E7%94%A8%E8%AA%AA%E6%98%8E%E6%9B%B8.pdf)（PDF、30 ページ、GitHub 上でそのまま開けます。繁体字中国語）
- [**説明書 PDF をダウンロード**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf)（最新版のリリースに同梱）
- アプリ内の「説明與常見問題」（ヘルプと FAQ。⌘? または Ctrl+?、F1）から、同じ内容を検索できます

説明書には、インストールと起動、8 つの操作ステップの図解、WoS アカウントと Starter API キーの申請方法、データ取得の 2 つの方法（アプリ内の API またはウェブからのエクスポート）、レポート項目の説明、データの保存先、更新と削除の方法、57 件のよくある質問を収録しています。現在は繁体字中国語版のみです。

**操作の流れ**

| ステップ | 内容 |
|---|---|
| 1 点検範囲 | 大学、学部、年度、文献タイプを設定（既定は Article と Review） |
| 2 教員名簿 | 名簿を取り込む（.xlsx、.xls、.csv） |
| 3 英語氏名 | 各教員の英語氏名と検索用の表記を確認 |
| 4 WoS データ | アプリ内で API キーを入力して取得、または WoS のエクスポートファイルを取り込む |
| 5 照合 | 著者と所属機関で自動照合し、同姓同名の可能性がある著者に印を付ける |
| 6 ジャーナルの質 | ISSN で JIF と JCR 四分位（Q1〜Q4）を付与。JCR 公式ファイルの取り込みも可能 |
| 7 手動確認 | 印の付いた論文が本人のものかを 1 件ずつ確認 |
| 8 レポート | 教員別集計表、論文一覧、ジャーナル対照表を出力、または PDF に印刷 |

## ソースからのビルド（開発者向け）
アプリ関連のファイルを `main` にプッシュすると、GitHub Actions が自動でビルドし、Releases に公開します。
- `TeacherPubAudit-Windows`：Windows インストーラー（教師論文盤點工具_安裝程式.exe）
- `TeacherPubAudit-macOS-AppleSilicon`：Apple シリコン（M シリーズ）搭載 Mac 用の .dmg
- `TeacherPubAudit-macOS-Intel`：Intel Mac 用の .dmg
- 注意：開発者モードを有効にするか、強制的にインストールが必要な場合があります。

各ビルドのファイルは、**Actions** → 該当する「編譯桌面版」（デスクトップ版ビルド）の実行 → **Artifacts** からも取得できます。

ビルドのたびに、パッケージ化したアプリに対して自動セルフテスト（ウィンドウ部品、キーチェーンへのアクセス、HTTPS 接続、画面の起動）を実行し、Windows 版は Microsoft Defender でスキャンします。いずれかのチェックに失敗したビルドからは、インストーラーは生成されません。

## 初回起動（未署名アプリ）
- **Windows**：「Windows によって PC が保護されました」と表示されたら、「詳細情報」→「実行」をクリックします。インストールに管理者権限は不要です。それでも Windows セキュリティにブロックされる場合は、Windows セキュリティ → ウイルスと脅威の防止 → 保護の履歴 → 該当の項目を選択 →「許可」の順に進みます。
- **macOS**：アプリを「アプリケーション」へドラッグしたあと、初回のみアプリを右クリックして「開く」→「開く」を選びます。それでもブロックされる場合は、システム設定 →「プライバシーとセキュリティ」→ 下部の「このまま開く」をクリックします。

## ファイル構成
- `main.py`：デスクトップ用シェル（pywebview）。WoS Starter API の呼び出しと、API キーの OS 標準の安全な保管領域（Windows 資格情報マネージャー／macOS キーチェーン）への保存を担当します。
- `app.html`：アプリの画面（ウェブ版と同じ。アプリのソースから生成）。
- `setup.iss`：Windows インストーラーの設定（Inno Setup）。
- `version_info.txt`：Windows 実行ファイルに埋め込むバージョン情報。
- `docs/`：図解使用説明書（PDF）。
- `.github/workflows/build.yml`：自動ビルドの設定。

API キーは、利用者のパソコン内の OS 標準の安全な保管領域にのみ保存されます。ファイルへの書き込みやアップロードは行いません。

## データの出典
論文データは Clarivate の Web of Science コアコレクションから取得します。利用者ごとに自分の Web of Science Starter API キー（Free Institutional Member Plan）が必要です。内蔵のジャーナル品質データは GitHub プロジェクト suqingdong/impact_factor に由来し、公式のデータではありません。公式のレポートには、所属機関の JCR データをご使用ください。
