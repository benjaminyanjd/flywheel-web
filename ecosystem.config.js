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
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
