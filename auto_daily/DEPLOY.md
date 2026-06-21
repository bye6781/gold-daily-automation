# 黄金文章自动化服务部署指南

> 适用项目：`D:\Codex\黄金文章\auto_daily`
> 主要脚本：
> - `fetch_data.mjs` — 抓取金十数据 + Yahoo Finance 行情
> - `generate_article.mjs` — 基于模板生成 Markdown + HTML 文章
> - `server.js` — HTTP 服务入口（新增）

---

## 一、安装依赖

在 `D:\Codex\黄金文章\auto_daily` 目录下打开终端，执行：

```bash
npm install
npx playwright install chromium
```

说明：
- `npm install` 会安装 `playwright` 等依赖。
- `npx playwright install chromium` 会自动下载或校验 Chromium 浏览器。如果系统中已有 `ms-playwright/chromium-1228`，该命令会识别并跳过重复下载。

---

## 二、启动服务

```bash
node server.js
```

服务默认监听：
- 端口：`3000`
- 地址：`0.0.0.0`（局域网内可访问）
- 本地地址：`http://localhost:3000`

可通过环境变量修改端口/地址：

```bash
set PORT=8080
set HOST=127.0.0.1
node server.js
```

---

## 三、接口说明

| 接口 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查，返回服务状态 |
| `/run` | GET / POST | 手动触发一次完整流水线（抓取 + 生成） |
| `/latest` | GET | 返回最新一次抓取的数据 `latest_data.json` |
| `/` | GET | 显示接口列表 |

`/run` 返回示例：

```json
{
  "success": true,
  "elapsed": "36.3s",
  "mdPath": "D:\\Codex\\黄金文章\\daily_output\\黄金文章_20260622.md",
  "htmlPath": "D:\\Codex\\黄金文章\\daily_output\\黄金文章_20260622.html",
  "logs": []
}
```

---

## 四、Coze 工作流接入

1. 登录 [Coze](https://www.coze.cn/)。
2. 进入工作流管理，选择「导入」。
3. 导入 `coze_workflow.json`。
4. 修改 `HTTP请求` 节点中的 URL：
   - 把 `http://YOUR_SERVER_IP:3000/run` 替换为实际服务器 IP/域名。
   - 如果服务器和 Coze 在同一台机器或内网，使用内网 IP；公网环境需使用公网 IP 或域名，并确保防火墙放行 3000 端口。

> ⚠️ 注意：如果服务器部署在家庭/办公内网，Coze 公网无法直接访问，需要使用内网穿透（如花生壳、frp、ngrok）或部署到云服务器。

---

## 五、定时自动运行（每天 08:00）

`server.js` 内置了定时调度：
- 启动后自动计算距离下一个 08:00 的时间。
- 到点后自动执行一次完整流水线（先抓取数据，再生成文章）。
- 任务完成后重新排期下一天。

可通过环境变量调整时间：

```bash
set SCHEDULE_HOUR=8
set SCHEDULE_MINUTE=0
node server.js
```

### 长期运行建议

为了让服务器在后台持续运行，推荐使用以下方案之一：

#### 方案 A：pm2（推荐）

```bash
npm install -g pm2
pm2 start server.js --name gold-daily
pm2 save
pm2 startup
```

#### 方案 B：Windows 任务计划程序

创建任务，每天 08:00 执行：

```
程序：node
参数：D:\Codex\黄金文章\auto_daily\server.js
起始于：D:\Codex\黄金文章\auto_daily
```

这样即使服务器未启动，任务计划也能直接调用脚本完成一次生成。Coze 定时触发则必须保证服务器一直在线。

---

## 六、目录结构

```
D:\Codex\黄金文章\
├── auto_daily\
│   ├── server.js              # HTTP 服务（本指南新增）
│   ├── package.json           # 依赖声明
│   ├── coze_workflow.json     # Coze 工作流导入模板
│   ├── DEPLOY.md              # 本文件
│   ├── fetch_data.mjs         # 数据抓取（无需修改）
│   ├── generate_article.mjs   # 文章生成（无需修改）
│   ├── template_article.md    # 文章模板（无需修改）
│   └── latest_data.json       # 最新抓取数据（自动生成）
├── daily_output\              # 生成的文章存放目录
│   ├── 黄金文章_20260622.md
│   └── 黄金文章_20260622.html
└── ...
```

---

## 七、常见问题

### 1. `Cannot find module 'playwright'`

未执行 `npm install` 或依赖安装失败。请重新运行：

```bash
npm install
```

### 2. 浏览器启动失败

检查 `C:/Users/10596/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe` 是否存在。如果不存在，执行：

```bash
npx playwright install chromium
```

### 3. 抓取失败（网络超时）

`fetch_data.mjs` 依赖外部网站（金十数据、Yahoo Finance）。如果目标站点反爬或网络波动，可能偶发失败。可稍后重试或调整脚本中的超时参数。

### 4. Coze 调用后无返回

- 检查服务器是否已启动。
- 检查 URL 是否填写正确，IP 是否可访问。
- 检查 `/run` 接口是否能在浏览器或 Postman 中正常返回 JSON。

---

## 八、手动测试流程

```bash
cd D:\Codex\黄金文章\auto_daily
node fetch_data.mjs
node generate_article.mjs
node server.js
```

然后访问：

```
http://localhost:3000/run
```

确认返回成功后再接入 Coze。
