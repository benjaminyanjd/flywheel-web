const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = 9000;
const SECRET = process.env.DEPLOY_WEBHOOK_SECRET || '***REMOVED***';
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '***REMOVED***';
const CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID || '5825881638';

function sendTelegram(msg) {
  const https = require('https');
  const body = JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' });
  const req = https.request({
    hostname: 'api.telegram.org',
    path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  });
  req.on('error', () => {});
  req.write(body);
  req.end();
}

function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(payload);
  const expected = 'sha256=' + hmac.digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch { return false; }
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/deploy') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const sig = req.headers['x-hub-signature-256'] || '';
    if (!verifySignature(body, sig)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    let event;
    try { event = JSON.parse(body); } catch { res.writeHead(400); res.end('Bad JSON'); return; }
    
    if (event.ref !== 'refs/heads/main') {
      res.writeHead(200);
      res.end('OK (not main branch)');
      return;
    }

    res.writeHead(200);
    res.end('Deploy triggered');

    const commitMsg = event.head_commit?.message?.split('\n')[0] || 'unknown';
    sendTelegram(`🚀 <b>開始部署</b>\nCommit: <code>${commitMsg}</code>\n時間：${new Date().toLocaleString('zh-CN', {timeZone:'Asia/Shanghai'})}`);

    const deployCmd = `cd /home/benjamin/Projects/flywheel-web && git pull origin main && npm run build && pm2 restart flywheel-web --update-env`;
    
    exec(deployCmd, { timeout: 300000 }, (err, stdout, stderr) => {
      if (err) {
        console.error('[Deploy] Failed:', err.message);
        sendTelegram(`❌ <b>部署失敗</b>\n${err.message}\n時間：${new Date().toLocaleString('zh-CN', {timeZone:'Asia/Shanghai'})}`);
      } else {
        console.log('[Deploy] Success');
        sendTelegram(`✅ <b>部署成功</b>\nCommit: <code>${commitMsg}</code>\n時間：${new Date().toLocaleString('zh-CN', {timeZone:'Asia/Shanghai'})}`);
      }
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Deploy Webhook] Listening on port ${PORT}`);
});
