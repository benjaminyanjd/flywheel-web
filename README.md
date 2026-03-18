# Flywheel Web

個人加密貨幣情報儀表板 — 整合信號雷達、機會管理、AI 顧問、訂閱管理。

線上地址：[flywheelsea.club](https://flywheelsea.club)

## 技術棧

- **框架**：Next.js 15 (App Router)
- **語言**：TypeScript
- **樣式**：Tailwind CSS v4 + shadcn/ui（dark theme / slate-950）
- **認證**：Clerk
- **資料庫**：SQLite（via flywheel-bot）
- **支付**：Infini
- **分析**：PostHog
- **部署**：PM2 + Nginx

## 本地開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env.local
# 編輯 .env.local，填入真實值
```

所有必要的環境變數說明見 `.env.example`。

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

### 4. 建構

```bash
npm run build
npm start
```

## 環境變數說明

| 變數 | 說明 | 必填 |
|------|------|------|
| `FLYWHEEL_DB_PATH` | flywheel-bot SQLite DB 路徑 | ✅ |
| `FLYWHEEL_AUTH_SECRET` | JWT 簽名密鑰（≥32 字元隨機字串） | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 公鑰 | ✅ |
| `CLERK_SECRET_KEY` | Clerk 私鑰 | ✅ |
| `CLERK_WEBHOOK_SECRET` | Clerk Webhook 驗證密鑰 | ✅ |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | ✅ |
| `ADMIN_TELEGRAM_CHAT_ID` | 管理員 Telegram Chat ID | ✅ |
| `INFINI_KEY_ID` | Infini API Key ID | ✅ |
| `INFINI_SECRET_KEY` | Infini API Secret Key | ✅ |
| `INFINI_BASE_URL` | Infini API 地址 | ✅ |
| `INFINI_WEBHOOK_PUBLIC_KEY` | Infini Webhook 公鑰 | ✅ |
| `ANTHROPIC_API_KEY` | Anthropic API Key（AI 顧問功能） | ✅ |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog Project API Key | 可選 |
| `DEPLOY_WEBHOOK_SECRET` | 部署 Webhook 簽名密鑰 | 可選 |
| `FLYWHEEL_SCAN_SCRIPT` | flywheel-bot web-scan 腳本路徑 | 可選 |
| `FLYWHEEL_OPP_SCRIPT` | flywheel-bot web-opportunity 腳本路徑 | 可選 |

完整說明見 `.env.example`。

## 生產部署（PM2）

```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
```

> ⚠️ 確保 `.env.local` 存在並包含所有必要環境變數。`ecosystem.config.js` 不儲存任何 secrets。

## 專案結構

```
flywheel-web/
├── app/                    # Next.js App Router 頁面
│   ├── (auth)/             # 認證頁面（sign-in/up）
│   ├── (dashboard)/        # 登入後頁面
│   │   ├── radar/          # 信號雷達
│   │   ├── opportunities/  # 機會管理
│   │   ├── advisor/        # AI 顧問
│   │   └── settings/       # 設定
│   └── api/                # API Routes
├── components/             # React 元件
├── lib/                    # 工具函式
├── ecosystem.config.js     # PM2 設定
└── .env.example            # 環境變數範本
```

## 相關專案

- **flywheel-bot**：Node.js 後端，負責信號掃描、機會分析、Telegram 推送
