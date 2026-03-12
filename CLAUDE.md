# Flywheel Web — 项目上下文

## 项目定位
Flywheel 是一个 AI 驱动的「市场机会雷达」，每天早 8 点把全球信号提炼成可执行的行动清单，推送到用户 Telegram。

## 技术栈
- **框架**：Next.js 15（App Router）+ TypeScript
- **样式**：Tailwind CSS
- **认证**：Clerk
- **数据库**：SQLite（better-sqlite3）
- **消息推送**：Telegram Bot API

## 项目路径
- 代码：`/home/benjamin/Projects/flywheel-web`
- 数据库：`/home/benjamin/Projects/flywheel-bot/flywheel.db`（在 bot 项目里）
- 相关 bot：`/home/benjamin/Projects/flywheel-bot`

## 关键文件
- `app/page.tsx` — 落地页（公开访问）
- `app/(dashboard)/` — 登录后的主应用
- `app/api/` — 所有 API 路由
- `lib/db.ts` — 数据库连接 + Schema
- `middleware.ts` — 路由保护（公开路由白名单在这里）
- `components/waitlist-form.tsx` — 落地页申请表单（client component）

## 数据库 Schema 要点
- `invite_codes` — 邀请码
- `user_subscriptions` — 订阅状态（plan: pending/trial/active）
- `user_settings` — 用户设置，含 `telegram_chat_id`、`email`
- `signal_bookmarks` — 信号收藏
- `waitlist` — 落地页申请记录（telegram, email, created_at）
- `opportunity_actions` 的 `confidence` 和 `why_now` 存在 `opp_embed` JSON 字段内（不是顶层列）

## 验收标准
1. **TypeScript 不报错**：改完必须跑 `npm run build` 验证
2. **不破坏现有功能**：Clerk 认证流程、Dashboard 路由保护、Telegram 推送
3. **繁体中文界面**：落地页用繁体，dashboard 用繁体，不要混用简体
4. **Dark theme**：全站 `slate-950` 背景，不引入浅色元素
5. **API 路由**：无认证的公开接口（如 waitlist）不加 Clerk auth guard

## 常见坑
- `middleware.ts` 的 `isPublicRoute` 白名单忘记加新页面会导致 307 重定向
- Telegram 消息用 `parse_mode: "Markdown"` 时特殊字符需要转义，否则 400；不确定就去掉 parse_mode
- `getDb()` 在 serverless/Edge 环境里不可用，必须用 Node.js runtime
- `isolated session` 里用 Edit 工具容易失败，用 Write 覆写更可靠

## 当前状态
- pm2 进程：`flywheel-web`（port 3000）
- 落地页：flywheelsea.club
- 已上线功能：邀请码注册、7 天试用、Telegram 绑定、机会雷达、顾问对话、信号收藏、待办清单

## 部署
```bash
npm run build && pm2 restart flywheel-web
```
