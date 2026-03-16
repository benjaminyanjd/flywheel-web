module.exports = {
  apps: [
    {
      name: 'flywheel-web',
      script: 'npm',
      args: 'start -- -p 3000',
      cwd: '/home/benjamin/Projects/flywheel-web',
      // 防止 build 期間 crash 導致無限重啟循環
      max_restarts: 10,        // 最多重啟 10 次，超過就停下來
      min_uptime: '10s',       // 10s 內崩潰算不穩定重啟
      restart_delay: 3000,     // 重啟前等 3s
      // 記憶體超過 1G 自動重啟
      max_memory_restart: '1G',
      // 環境變數
      // ⚠️ SECURITY: Keys below were exposed in code history on 2026-03-16.
      // Benjamin 需要登入 https://openapi.infini.money 後台：
      //   1. 刪除所有「非」G27R6CJZBUD44SGUCL3D 的舊 API key
      //   2. 如果 G27R6CJZBUD44SGUCL3D 也已洩漏，輪換此 key 並更新下方值
      //   3. 完成後將這些值移至 .env.local（不進 git）
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        INFINI_KEY_ID: 'G27R6CJZBUD44SGUCL3D',
        INFINI_SECRET_KEY: 'UPsE8qzPlRPuUgv_tShjYJtEufiHu6BPzUsbe_e4_5o=',
        INFINI_BASE_URL: 'https://openapi.infini.money',
        INFINI_WEBHOOK_PUBLIC_KEY: 'u-gUWxs3wAL55bgH3jWEHjJeQ_CJmq9XXMa52pPZdP0=',
      },
    },
  ],
};
