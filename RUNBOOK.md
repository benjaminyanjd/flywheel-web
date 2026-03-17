# 嗅鐘 Sniffing Clock — 運維 Runbook

## 進程管理
- 查看狀態：`pm2 list`
- 重啟 web：`pm2 restart flywheel-web`
- 重啟 bot：`pm2 restart flywheel-bot`
- 查看日誌：`pm2 logs flywheel-web --lines 50`

## 緊急故障處理

### 網站無法訪問
1. `pm2 list` — 確認進程在線
2. `curl localhost:3000` — 測試本地
3. `pm2 restart flywheel-web` — 重啟
4. 如果 cloudflared 掛了：`pm2 restart cloudflared-tunnel`

### DB 損壞
1. `ls /home/benjamin/Projects/flywheel-bot/backups/ | tail -5` — 找最新備份
2. `cp /home/benjamin/Projects/flywheel-bot/backups/flywheel-LATEST.db /home/benjamin/Projects/flywheel-bot/flywheel.db`
3. `pm2 restart flywheel-bot flywheel-web`

### 部署回滾
```bash
cd /home/benjamin/Projects/flywheel-web
git log --oneline -5  # 找上一個 commit
git revert HEAD       # 或 git reset --hard COMMIT_HASH
npm run build
pm2 restart flywheel-web
```

## 服務地址
- 生產：https://sniffingclock.club
- API 健康：https://sniffingclock.club/api/health
- Deploy Webhook：http://localhost:9000/deploy (Cloudflare: https://deploy.sniffingclock.club/deploy)
- PostHog：https://us.posthog.com/project/346606
