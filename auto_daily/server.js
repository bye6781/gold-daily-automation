import http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const SCHEDULE_HOUR = parseInt(process.env.SCHEDULE_HOUR ?? '8', 10);
const SCHEDULE_MINUTE = parseInt(process.env.SCHEDULE_MINUTE ?? '0', 10);

let running = false;

function logWithTime(msg) {
  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  console.log(`[${time}] ${msg}`);
}

function sendJSON(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(obj, null, 2));
}

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, shell: false });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('close', code => {
      if (code !== 0) reject({ code, stdout, stderr });
      else resolve({ stdout, stderr });
    });
  });
}

async function runPipeline() {
  if (running) throw new Error('已有任务正在运行');
  running = true;
  const start = Date.now();
  const logs = [];

  function log(msg) {
    logs.push(msg);
    logWithTime(msg);
  }

  try {
    log('=== 开始执行黄金文章流水线 ===');
    log('Step 1/2: 抓取数据 (fetch_data.mjs)');
    const fetchResult = await runCommand('node', ['fetch_data.mjs'], __dirname);
    fetchResult.stdout.split('\n').filter(Boolean).forEach(l => log(l));
    fetchResult.stderr.split('\n').filter(Boolean).forEach(l => log(`[fetch_data stderr] ${l}`));

    log('Step 2/2: 生成文章 (generate_article.mjs)');
    const genResult = await runCommand('node', ['generate_article.mjs'], __dirname);
    genResult.stdout.split('\n').filter(Boolean).forEach(l => log(l));
    genResult.stderr.split('\n').filter(Boolean).forEach(l => log(`[generate_article stderr] ${l}`));

    const elapsed = ((Date.now() - start) / 1000).toFixed(1) + 's';
    const mdMatch = genResult.stdout.match(/MD:\s*(.+)/);
    const htmlMatch = genResult.stdout.match(/HTML:\s*(.+)/);
    const mdPath = mdMatch ? mdMatch[1].trim() : null;
    const htmlPath = htmlMatch ? htmlMatch[1].trim() : null;

    return { success: true, elapsed, mdPath, htmlPath, logs };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1) + 's';
    if (err.stdout) err.stdout.split('\n').filter(Boolean).forEach(l => log(l));
    if (err.stderr) err.stderr.split('\n').filter(Boolean).forEach(l => log(`[stderr] ${l}`));
    throw { success: false, elapsed, error: err.message || `命令退出码 ${err.code}`, code: err.code, logs };
  } finally {
    running = false;
  }
}

function scheduleNextRun() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(SCHEDULE_HOUR, SCHEDULE_MINUTE, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next - now;
  logWithTime(`下一次定时任务：${next.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}（约 ${Math.round(delay / 1000 / 60)} 分钟后）`);
  setTimeout(async () => {
    try {
      const result = await runPipeline();
      logWithTime(`定时任务成功：${JSON.stringify({ htmlPath: result.htmlPath, elapsed: result.elapsed })}`);
    } catch (err) {
      logWithTime(`定时任务失败：${err.error || err.message}`);
    } finally {
      scheduleNextRun();
    }
  }, delay);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (url.pathname === '/health') {
    sendJSON(res, 200, { status: 'ok', running, time: new Date().toISOString() });
    return;
  }

  if (url.pathname === '/run' && (req.method === 'GET' || req.method === 'POST')) {
    runPipeline()
      .then(result => sendJSON(res, 200, result))
      .catch(err => sendJSON(res, 500, err));
    return;
  }

  if (url.pathname === '/latest') {
    const dataFile = path.join(__dirname, 'latest_data.json');
    if (!fs.existsSync(dataFile)) {
      sendJSON(res, 404, { error: 'latest_data.json 不存在' });
      return;
    }
    try {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      sendJSON(res, 200, data);
    } catch (e) {
      sendJSON(res, 500, { error: '解析 latest_data.json 失败', message: e.message });
    }
    return;
  }

  if (url.pathname === '/') {
    sendJSON(res, 200, {
      name: '黄金文章自动化服务',
      version: '3.0',
      endpoints: {
        '/health': 'GET 健康检查',
        '/run': 'GET/POST 手动触发完整流水线',
        '/latest': 'GET 最新抓取数据'
      }
    });
    return;
  }

  sendJSON(res, 404, { error: 'Not Found' });
});

server.listen(PORT, HOST, () => {
  logWithTime(`Server running on http://${HOST}:${PORT}`);
  logWithTime(`访问 http://localhost:${PORT}/run 可手动触发一次生成`);
  scheduleNextRun();
});
