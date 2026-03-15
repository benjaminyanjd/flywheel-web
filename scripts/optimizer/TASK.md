# Flywheel 全面優化任務

## 你的身份
你是 Flywheel 系統的全棧優化 agent。項目路徑：`/home/benjamin/Projects/flywheel-web`

## 本次任務流程

### Step 1：讀取狀態
讀取 `/home/benjamin/Projects/flywheel-web/scripts/optimizer/state.json`
- 查看 `completed_items`：這些已完成，**不要重複做**
- 查看 `known_issues`：這些已知問題，優先處理未完成的

### Step 2：全面分析（8個維度）
掃描項目代碼，找出問題，每個維度最多找 3 個最高價值問題：

1. **性能** — bundle size、API 響應、DB 查詢、N+1 問題
2. **用戶體驗** — 加載狀態、空狀態、錯誤處理、移動端
3. **安全** — 輸入驗證、Rate limiting、信息洩露
4. **代碼質量** — 重複代碼、類型安全、錯誤邊界
5. **運維監控** — 日誌記錄、錯誤追蹤、健康檢查
6. **SEO與首次體驗** — meta tags、OG 圖片、首屏加載
7. **數據埋點** — 關鍵事件追蹤缺失
8. **合規** — 隱私政策、Cookie、數據處理

### Step 3：列出待執行項目
- 列出所有 `known_issues` 中 status=pending 的項目
- 加上本輪掃描到的新問題
- **全部執行，不跳過，不只選 TOP 5**
- 唯一跳過條件：已在 `completed_items` 中

### Step 4：逐項實現
每個項目：
1. cat 相關文件確認上下文
2. 實現修改
3. 本地快速驗證

### Step 5：驗收
```bash
cd /home/benjamin/Projects/flywheel-web && npm run build
```
必須零錯誤。如有錯誤，修復後再繼續。

### Step 6：更新狀態文件
將本次完成的項目追加到 `completed_items`，新發現的未處理問題追加到 `known_issues`：

```json
{
  "version": 1,
  "runs": [
    {
      "run_id": "run-N",
      "timestamp": "2026-03-12T...",
      "completed_count": 5,
      "summary": "本次完成了什麼"
    }
  ],
  "completed_items": [
    {
      "id": "唯一ID",
      "category": "性能|UX|安全|代碼|運維|SEO|埋點|合規",
      "description": "做了什麼",
      "file": "改了哪個文件",
      "completed_at": "2026-03-12T..."
    }
  ],
  "known_issues": [
    {
      "id": "唯一ID",
      "category": "分類",
      "description": "問題描述",
      "priority": "P0|P1|P2",
      "status": "pending|completed"
    }
  ]
}
```

### Step 7：pm2 restart
```bash
pm2 restart flywheel-web
```

### Step 8：發送完成事件
```bash
openclaw system event --text "Optimizer Run N 完成：[本次完成的5項摘要]" --mode now
```

### Step 9：發送 Discord 通知給 Benjamin
用 message 工具發送到 Discord channel:1478281363684593715，內容包含本輪完成的5項摘要和下一輪時間。格式：
"**Flywheel Optimizer Run N 完成** ✅\n本輪完成：\n1. ...\n2. ...\n下一輪：[時間]:00"

## 重要規則
- npm run build 零錯誤才算完成
- 不破壞 Clerk 認證
- 不改壞現有功能
- 每次改動都要說明文件和內容
- 狀態文件一定要更新
