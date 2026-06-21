/**
 * 黄金文章生成器 v3.0 — Node.js 版
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, "latest_data.json");

if (!fs.existsSync(dataFile)) {
  console.error("ERROR: no data file");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
const templateFile = path.join(__dirname, "template_article.md");
let article = fs.readFileSync(templateFile, "utf-8");

for (const [key, val] of Object.entries(data)) {
  if (typeof val === "string") article = article.split("{{" + key + "}}").join(val);
}

const defaults = {
  "TITLE_SUFFIX": "黄金走势迎来关键节点",
  "RSI_VALUE": "待盘中更新",
  "RSI_STATUS": "待盘中更新",
  "WEEKLY_ANALYSIS": "请先运行 fetch_data.mjs 积累历史数据",
  "DAILY_ANALYSIS": "请先运行 fetch_data.mjs 积累历史数据",
  "TECH_SUMMARY": "黄金走势短期趋势未反转，但超卖区域意味着技术性反弹条件正在积累。",
  "FED_ANALYSIS": "美联储6月维持利率不变，释放鹰派信号。高利率环境使持有黄金的机会成本居高不下。",
  "CB_ANALYSIS": "全球央行购金意愿维持高位，为金价提供了结构性底部支撑。",
  "GEO_ANALYSIS": "地缘风险溢价的阶段性收缩是近期金价回调的催化剂之一，但不确定性远未消除。",
  "SUPPORT_LEVELS": "数据积累中",
  "RESISTANCE_LEVELS": "数据积累中",
  "DXY_RANGE": "103-104",
  "USDCNY": "7.10",
"USDCNY": "7.10",
  "BIAS_DIRECTION": "待盘中更新，请运行 fetch_data.mjs 后重新生成",
  "BIAS_REASON": "待盘中更新",
  "BIAS_RANGE": "待盘中更新",
  "BIAS_STRATEGY": "待盘中更新",
  "FED_IMPACT": "待盘中更新",
  "GEO_FOCUS": "待盘中更新",
  "DXY_VALUE": "待盘中更新",
  "DXY_IMPACT": "待盘中更新",
  "MA5_VALUE": "数据积累中",
  "MA10_VALUE": "数据积累中",
  "MA20_VALUE": "数据积累中（需20个交易日）",
  "MA_ALIGNMENT": "数据积累中",
  "PRICE_VS_MA20": "数据积累中，MA20 需 20 个交易日。请连续运行 fetch_data.mjs。",
  "RANGE_20D_LOW": "数据积累中",
  "RANGE_20D_HIGH": "数据积累中",
};

for (const [k, v] of Object.entries(defaults)) {
  article = article.split("{{" + k + "}}").join(v);
}

article = article.replace(/\\n/g, "\n");

const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const outDir = path.join(__dirname, "..", "daily_output");
fs.mkdirSync(outDir, { recursive: true });
const mdPath = path.join(outDir, "黄金文章_" + today + ".md");
fs.writeFileSync(mdPath, article, "utf-8");
console.log("MD:", mdPath);
// ===== Price Card 1: International Metals =====
const si = data.SILVER_PRICE ? ("$" + data.SILVER_PRICE) : "—";
const pd = data.PALLADIUM_PRICE ? ("$" + data.PALLADIUM_PRICE) : "—";
const pt = data.PLATINUM_PRICE ? ("$" + data.PLATINUM_PRICE) : "—";
const gc = data.SPOT_CHANGE.startsWith("-") ? "price-down" : data.SPOT_CHANGE.startsWith("+") ? "price-up" : "price-flat";
const sc = data.SILVER_CHANGE.startsWith("-") ? "price-down" : data.SILVER_CHANGE.startsWith("+") ? "price-up" : "price-flat";

const priceCard1 = [
  "<div class=\"price-card\">",
  "<h3>🌍 国际贵金属行情</h3>",
  "<table class=\"price-tbl\"><thead><tr><th>品种</th><th>最新价</th><th>涨跌幅度</th><th>最高价</th><th>最低价</th><th>报价时间</th></tr></thead><tbody>",
  "<tr><td>XAU/USD 国际黄金</td><td class=\"pv\">$" + data.SPOT_PRICE + "</td><td class=\"" + gc + "\">" + data.SPOT_CHANGE + "</td><td>$" + data.DAY_HIGH + "</td><td>$" + data.DAY_LOW + "</td><td rowspan=\"4\" class=\"pt\">" + data.QUOTE_TIME + "</td></tr>",
  "<tr><td>XAG/USD 国际银价</td><td class=\"pv\">" + si + "</td><td class=\"" + sc + "\">" + data.SILVER_CHANGE + "</td><td>" + (data.SILVER_HIGH ? ("$" + data.SILVER_HIGH) : "—") + "</td><td>" + (data.SILVER_LOW ? ("$" + data.SILVER_LOW) : "—") + "</td></tr>",
  "<tr><td>XPD/USD 国际钯金</td><td class=\"pv\">" + pd + "</td><td class=\"price-flat\">—</td><td>" + (data.PD_HIGH ? ("$" + data.PD_HIGH) : "—") + "</td><td>" + (data.PD_LOW ? ("$" + data.PD_LOW) : "—") + "</td></tr>",
  "<tr><td>XPT/USD 国标铂金</td><td class=\"pv\">" + pt + "</td><td class=\"price-flat\">—</td><td>" + (data.PT_HIGH ? ("$" + data.PT_HIGH) : "—") + "</td><td>" + (data.PT_LOW ? ("$" + data.PT_LOW) : "—") + "</td></tr>",
  "</tbody></table>",
  "<div class=\"price-time\">⏱ 数据来源：金十数据 (jin10.com) &amp; COMEX (cmegroup.com)</div>",
  "</div>"
].join("\n");

// ===== Price Card 2: Domestic Prices =====
const priceCard2 = [
  "<div class=\"price-card\">",
  "<h3>🇨🇳 国内金价行情</h3>",
  "<table class=\"price-tbl\"><thead><tr><th>品种</th><th>最新价</th><th>涨跌幅度</th><th>最高价</th><th>最低价</th><th>报价时间</th></tr></thead><tbody>",
  "<tr><td>国内金价</td><td class=\"pv\">" + data.DOMESTIC_GOLD + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td><td rowspan=\"4\" class=\"pt\">" + data.QUOTE_TIME + "</td></tr>",
  "<tr><td>国内银价</td><td class=\"pv\">" + data.DOMESTIC_SILVER + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td></tr>",
  "<tr><td>投资金条</td><td class=\"pv\">" + data.INVEST_BAR + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td></tr>",
  "<tr><td>黄金回收</td><td class=\"pv\">" + data.RECOVERY_PRICE + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td></tr>",
  "<tr><td>工商银行·积存金</td><td class=\"pv\">" + (data.BANK_ICBC || "—") + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td><td>—</td></tr>",
  "<tr><td>建设银行·积存金</td><td class=\"pv\">" + (data.BANK_CCB || "—") + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td><td>—</td></tr>",
  "<tr><td>农业银行·积存金</td><td class=\"pv\">" + (data.BANK_ABC || "—") + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td><td>—</td></tr>",
  "<tr><td>中国银行·积存金</td><td class=\"pv\">" + (data.BANK_BOC || "—") + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td><td>—</td></tr>",
  "<tr><td>招商银行·积存金</td><td class=\"pv\">" + (data.BANK_CMB || "—") + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td><td>—</td></tr>",
  "<tr><td>交通银行·积存金</td><td class=\"pv\">" + (data.BANK_COMM || "—") + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td><td>—</td></tr>",
  "<tr><td>兴业银行·积存金</td><td class=\"pv\">" + (data.BANK_CIB || "—") + " 元/克</td><td class=\"price-flat\">—</td><td>—</td><td>—</td><td>—</td></tr>",
  "</tbody></table>",
  "<div class=\"price-time\">💡 积存金价格参考各行官网，实际以柜台为准。回收价参考足金999</div>",
  "</div>"
].join("\n");

// ===== Combine =====
const priceCards = priceCard1 + "\n" + priceCard2;

// ===== Generate HTML =====
const marker = "<!--PRICE_CARDS-->";
const markerIdx = article.indexOf(marker);
let articleHtml;
if (markerIdx > 0) {
  const before = article.substring(0, markerIdx);
  const after = article.substring(markerIdx + marker.length);
  articleHtml = mdToHtml(before) + "\n" + priceCards + "\n" + mdToHtml(after);
} else {
  articleHtml = priceCards + "\n" + mdToHtml(article);
}

function mdToHtml(md) {
  const lines = md.split("\n");
  let h = "";
  for (const line of lines) {
    const t = line.trimEnd();
    if (/^### (.+)/.test(t)) { h += "<h3>" + t.match(/^### (.+)/)[1] + "</h3>\n"; continue; }
    if (/^## (.+)/.test(t)) { h += "<h2>" + t.match(/^## (.+)/)[1] + "</h2>\n"; continue; }
    if (/^# (.+)/.test(t)) { h += "<h1>" + t.match(/^# (.+)/)[1] + "</h1>\n"; continue; }
    if (/^---$/.test(t)) { h += "<hr>\n"; continue; }
    if (/^> (.+)/.test(t)) {
      h += "<blockquote>" + t.replace(/^> /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") + "</blockquote>\n";
      continue;
    }
    if (/^\|.*\|$/.test(t)) {
      if (/^[\|\s\-:]+$/.test(t)) continue;
      const cells = t.split("|").filter(c => c).map(c => "<td>" + c.trim().replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") + "</td>").join("");
      h += "<tr>" + cells + "</tr>\n";
      continue;
    }
    if (/^- (.+)/.test(t)) {
      h += "<li>" + t.replace(/^- /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") + "</li>\n";
      continue;
    }
    if (/^#/.test(t) && /[\u4e00-\u9fff]/.test(t)) {
      const tags = t.split(/\s+/).filter(x => x.startsWith("#")).map(x => '<span class="tag">' + x + '</span>').join("");
      if (tags) h += '<div class="tags">' + tags + "</div>\n";
      continue;
    }
    if (/^\s*$/.test(t)) continue;
    let p = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    if (/^\*.*\*$/.test(p)) h += '<p class="footer">' + p.replace(/^\*|\*$/g, "") + "</p>\n";
    else h += "<p>" + p + "</p>\n";
  }
  return h;
}

const style = '<style>\n*{margin:0;padding:0;box-sizing:border-box}\nbody{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;background:#f0f2f5;color:#2c3e50;line-height:1.85;font-size:16px}\n.article{max-width:680px;margin:0 auto;background:#fff;padding:28px 20px 48px;box-shadow:0 2px 12px rgba(0,0,0,.06)}\nh1{font-size:21px;text-align:center;margin-bottom:18px;color:#1a1a1a}\nh2{font-size:18px;margin:30px 0 14px;padding-left:12px;border-left:4px solid #c8963e;color:#2c3e50}\nh3{font-size:16px;margin:22px 0 10px;color:#34495e}\np{margin:10px 0;color:#3a3a3a}\nblockquote{background:#fef9f0;border-left:4px solid #c8963e;padding:12px 16px;margin:16px 0;color:#6b5a3e;font-size:15px}\n\n/* === Price Cards - Professional Dark === */\n.price-card{background:linear-gradient(160deg,#0f1923,#1a2740);border-radius:14px;padding:24px 28px;margin:24px 0;color:#e8ecf1;box-shadow:0 4px 20px rgba(0,0,0,.25);border:1px solid rgba(200,150,62,.12)}\n.price-card h3{color:#e2b04a;font-size:17px;margin:0 0 18px;padding:0 0 12px;border:none;text-align:center;letter-spacing:3px;border-bottom:1px solid rgba(226,176,74,.15);font-weight:600}\n\n.price-tbl{width:100%;border-collapse:collapse;font-size:14px;margin:0}\n.price-tbl thead th{background:rgba(226,176,74,.12);color:#e2b04a;padding:10px 8px;font-size:12px;font-weight:500;text-align:center;border-bottom:2px solid rgba(226,176,74,.25);letter-spacing:1px}\n.price-tbl tbody td{padding:11px 8px;text-align:center;border-bottom:1px solid rgba(255,255,255,.06);color:#d5dbe3;font-size:14px}\n.price-tbl tbody tr:nth-child(even){background:rgba(255,255,255,.025)}\n.price-tbl tbody tr:hover{background:rgba(226,176,74,.06)}\n.price-tbl td:first-child{text-align:left;color:#b0bac8;font-weight:500;white-space:nowrap;font-size:13px}\n.price-tbl td.pv{color:#ffffff;font-weight:700;font-size:15px;letter-spacing:.5px;text-shadow:0 0 20px rgba(255,255,255,.1)}\n.price-tbl td.pt{color:#8899aa;font-size:12px;vertical-align:middle;line-height:1.4}\n\n.price-up{background:rgba(0,200,130,.15);color:#00e676;font-weight:700;border-radius:6px;padding:2px 10px !important;font-size:13px}\n.price-down{background:rgba(255,70,70,.15);color:#ff5252;font-weight:700;border-radius:6px;padding:2px 10px !important;font-size:13px}\n.price-flat{color:#7b8a9b;font-size:13px}\n\n.price-time{text-align:center;margin-top:14px;font-size:12px;color:#7b8a9b;padding-top:10px;border-top:1px solid rgba(255,255,255,.04)}\n\n.footer{text-align:center;color:#999;font-size:14px;margin-top:36px;padding-top:22px;border-top:1px solid #eee}\n.tags{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:16px}\n.tag{background:#fef9f0;color:#b8860b;padding:4px 12px;border-radius:20px;font-size:13px}\nhr{border:none;border-top:1px solid #eee;margin:28px 0}\n</style>';


const html = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>黄金价格今日金价深度分析</title>\n' + style + '\n</head>\n<body><div class="article">\n' + articleHtml + '\n</div></body></html>';
const htmlPath = path.join(outDir, "黄金文章_" + today + ".html");
fs.writeFileSync(htmlPath, html, "utf-8");
console.log("HTML:", htmlPath);
console.log("=== OK ===");
