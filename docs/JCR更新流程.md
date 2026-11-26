# 內建期刊品質資料（JCR）更新流程

App 內建一份期刊品質資料（JIF、JCR 分區 Q1–Q4、中科院分區），來源是 GitHub 專案 [suqingdong/impact_factor](https://github.com/suqingdong/impact_factor)（**非官方整理**）。畫面與報表的「計算條件」都會標示目前的資料版本。

## 正式報告請用官方資料

內建資料只用於快速試算。**要交給系主任或院方的正式數字，請在 App 步驟 6「期刊品質」匯入學校 JCR 的官方匯出檔**，匯入的資料優先於內建資料，報表的「計算條件」會註明「已匯入」。

JCR 官方匯出：Journal Citation Reports → Journals → 依學科篩選 → Export，需包含 `ISSN`、`eISSN`、`JIF`、`JIF Quartile` 欄位；單次最多 600 筆，可分學科多次匯出後一次匯入。

## 何時更新內建資料

Clarivate 每年 6 月左右發布新一年的 JCR。建議每年 7 月檢查一次：

1. 到 suqingdong/impact_factor 確認是否已有新年度資料庫（`if.db`）。
2. 下載後執行：
   ```bash
   python3 tools/build_jcr_data.py if.db 2026        # 年度填資料庫的 JIF 年度
   python3 src/build.py                              # 重新產生 app.html
   npm test                                          # 確認測試通過
   ```
3. 提交 `src/jcr_data.js` 與 `app.html`，推送後 CI 會自動編譯並發布新版。

## 年度對應

論文出版年與 JIF 年度不一定相同。教師評鑑常以「出版當年」或「最新一年」的 JIF 計算，請依學院規定決定，並在報表的計算條件中註明（App 會顯示目前使用的 JIF 年度）。若學院規定逐年對應，需自行匯入各年度的官方匯出檔。
