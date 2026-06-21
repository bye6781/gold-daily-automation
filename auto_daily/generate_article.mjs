/**
 * 黄金文章生成器 v3.1 — WeChat 内联样式版
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
  TITLE_SUFFIX: "黄金走势迎来关键节点",
  RSI_VALUE: "待盘中更新",
  RSI_STATUS: "待盘中更新",
  WEEKLY_ANALYSIS: "请先运行 fetch_data.mjs 积累历史数据",
  DAILY_ANALYSIS: "请先运行 fetch_data.mjs 积累历史数据",
  TECH_SUMMARY: "黄金走势短期趋势未反转，但超卖区域意味着技术性反弹条件正在积累。",
  FED_ANALYSIS: "美联储6月维持利率不变，释放鹰派信号。高利率环境使持有黄金的机会成本居高不下。",
  CB_ANALYSIS: "全球央行购金意愿维持高位，为金价提供了结构性底部支撑。",
  GEO_ANALYSIS: "地缘风险溢价的阶段性收缩是近期金价回调的催化剂之一，但不确定性远未消除。",
  SUPPORT_LEVELS: "数据积累中",
  RESISTANCE_LEVELS: "数据积累中",
  DXY_RANGE: "103-104",
  USDCNY: "7.10",
  BIAS_DIRECTION: "待盘中更新",
  BIAS_REASON: "待盘中更新",
  BIAS_RANGE: "待盘中更新",
  BIAS_STRATEGY: "待盘中更新",
  FED_IMPACT: "待盘中更新",
  GEO_FOCUS: "待盘中更新",
  DXY_VALUE: "待盘中更新",
  DXY_IMPACT: "待盘中更新",
  MA5_VALUE: "数据积累中",
  MA10_VALUE: "数据积累中",
  MA20_VALUE: "数据积累中（需20个交易日）",
  MA_ALIGNMENT: "数据积累中",
  PRICE_VS_MA20: "数据积累中",
  RANGE_20D_LOW: "数据积累中",
  RANGE_20D_HIGH: "数据积累中",
};

for (const [k, v] of Object.entries(defaults)) {
  article = article.split("{{" + k + "}}").join(v);
}

article = article.replace(/\\n/g, "\n");

const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const outDir = path.join(__dirname, "..", "daily_output");
fs.mkdirSync(outDir, { recursive: true });

// ===== Inline style helpers =====
const S = {
  h1: 'style="font-size:22px;text-align:center;color:#1a1a1a;margin:10px 0 20px;font-weight:700"',
  h2: 'style="font-size:18px;margin:28px 0 14px;padding-left:12px;border-left:4px solid #c8963e;color:#2c3e50;font-weight:600"',
  h3: 'style="font-size:16px;margin:20px 0 10px;color:#34495e;font-weight:600"',
  p: 'style="margin:10px 0;color:#3a3a3a;font-size:15px;line-height:1.85"',
  bq: 'style="background:#fef9f0;border-left:4px solid #c8963e;padding:12px 16px;margin:16px 0;color:#6b5a3e;font-size:14px;line-height:1.8"',
  hr: 'style="border:none;border-top:1px solid #eee;margin:28px 0"',
  li: 'style="margin:6px 0;color:#3a3a3a;font-size:15px;line-height:1.85;padding-left:4px"',
  card: 'style="background:linear-gradient(160deg,#0f1923,#1a2740);border-radius:14px;padding:28px 20px;margin:24px 0;box-shadow:0 4px 20px rgba(0,0,0,.25)"',
  cardH3: 'style="text-align:center;color:#e2b04a;font-size:17px;margin:0 0 16px;padding:0 0 12px;border-bottom:1px solid rgba(226,176,74,.2);font-weight:600;letter-spacing:2px"',
  tbl: 'style="width:100%;border-collapse:collapse;font-size:13px;margin:0"',
  th: 'style="background:rgba(226,176,74,.12);color:#e2b04a;padding:10px 6px;font-size:12px;text-align:center;border-bottom:2px solid rgba(226,176,74,.25)"',
  td: 'style="padding:10px 6px;text-align:center;border-bottom:1px solid rgba(255,255,255,.06);color:#d5dbe3;font-size:13px"',
  tdL: 'style="padding:10px 6px;text-align:left;color:#b0bac8;font-weight:500;font-size:12px;border-bottom:1px solid rgba(255,255,255,.06)"',
  tdPv: 'style="padding:10px 6px;text-align:center;color:#fff;font-weight:700;font-size:14px;border-bottom:1px solid rgba(255,255,255,.06)"',
  tdTime: 'style="padding:10px 6px;text-align:center;color:#8899aa;font-size:11px;border-bottom:1px solid rgba(255,255,255,.06)"',
  up: 'style="background:rgba(0,200,130,.15);color:#00e676;font-weight:700;border-radius:6px;padding:3px 10px;font-size:13px;display:inline-block"',
  down: 'style="background:rgba(255,70,70,.15);color:#ff5252;font-weight:700;border-radius:6px;padding:3px 10px;font-size:13px;display:inline-block"',
  flat: 'style="color:#7b8a9b;font-size:13px"',
  time: 'style="text-align:center;margin-top:14px;font-size:12px;color:#7b8a9b;padding-top:10px;border-top:1px solid rgba(255,255,255,.04)"',
  footer: 'style="text-align:center;color:#999;font-size:13px;margin-top:30px;padding-top:20px;border-top:1px solid #eee"',
  tags: 'style="text-align:center;margin-top:16px"',
  tag: 'style="display:inline-block;background:#fef9f0;color:#b8860b;padding:4px 12px;border-radius:20px;font-size:13px;margin:4px"',
};

function inl(s) { return ' ' + S[s]; }

// ===== Price Card 1: International Metals =====
const si = data.SILVER_PRICE ? ("$" + data.SILVER_PRICE) : "—";
const pd = data.PALLADIUM_PRICE ? ("$" + data.PALLADIUM_PRICE) : "—";
const pt = data.PLATINUM_PRICE ? ("$" + data.PLATINUM_PRICE) : "—";
const gcTag = data.SPOT_CHANGE.startsWith("-") ? "down" : data.SPOT_CHANGE.startsWith("+") ? "up" : "flat";
const scTag = data.SILVER_CHANGE.startsWith("-") ? "down" : data.SILVER_CHANGE.startsWith("+") ? "up" : "flat";

const priceCard1 = [
  '<div' + inl("card") + '>',
  '<h3' + inl("cardH3") + '>?? 国际贵金属行情</h3>',
  '<table' + inl("tbl") + '>',
  '<thead><tr><th' + inl("th") + '>品种</th><th' + inl("th") + '>最新价</th><th' + inl("th") + '>涨跌幅</th><th' + inl("th") + '>最高</th><th' + inl("th") + '>最低</th></tr></thead>',
  '<tbody>',
  '<tr><td' + inl("tdL") + '>XAU/USD 国际黄金</td><td' + inl("tdPv") + '>$' + data.SPOT_PRICE + '</td><td' + inl("td") + '><span' + inl(gcTag) + '>' + data.SPOT_CHANGE + '</span></td><td' + inl("td") + '>$' + data.DAY_HIGH + '</td><td' + inl("td") + '>$' + data.DAY_LOW + '</td></tr>',
  '<tr><td' + inl("tdL") + '>XAG/USD 国际银价</td><td' + inl("tdPv") + '>' + si + '</td><td' + inl("td") + '><span' + inl(scTag) + '>' + data.SILVER_CHANGE + '</span></td><td' + inl("td") + '>' + (data.SILVER_HIGH ? ("$" + data.SILVER_HIGH) : "—") + '</td><td' + inl("td") + '>' + (data.SILVER_LOW ? ("$" + data.SILVER_LOW) : "—") + '</td></tr>',
  '<tr><td' + inl("tdL") + '>XPD/USD 国际钯金</td><td' + inl("tdPv") + '>' + pd + '</td><td' + inl("td") + '><span' + inl("flat") + '>—</span></td><td' + inl("td") + '>' + (data.PD_HIGH ? ("$" + data.PD_HIGH) : "—") + '</td><td' + inl("td") + '>' + (data.PD_LOW ? ("$" + data.PD_LOW) : "—") + '</td></tr>',
  '<tr><td' + inl("tdL") + '>XPT/USD 国标铂金</td><td' + inl("tdPv") + '>' + pt + '</td><td' + inl("td") + '><span' + inl("flat") + '>—</span></td><td' + inl("td") + '>' + (data.PT_HIGH ? ("$" + data.PT_HIGH) : "—") + '</td><td' + inl("td") + '>' + (data.PT_LOW ? ("$" + data.PT_LOW) : "—") + '</td></tr>',
  '</tbody></table>',
  '<div' + inl("time") + '>? 数据：金十数据 &amp; COMEX | ' + data.QUOTE_TIME + '</div>',
  '</div>'
].join("\n");

// ===== Price Card 2: Domestic Prices =====
const priceCard2 = [
  '<div' + inl("card") + '>',
  '<h3' + inl("cardH3") + '>???? 国内金价行情</h3>',
  '<table' + inl("tbl") + '>',
  '<thead><tr><th' + inl("th") + '>品种</th><th' + inl("th") + '>最新价</th><th' + inl("th") + '>单位</th></tr></thead>',
  '<tbody>',
  '<tr><td' + inl("tdL") + '>国内金价</td><td' + inl("tdPv") + '>' + data.DOMESTIC_GOLD + ' 元/克</td><td' + inl("td") + '>人民币</td></tr>',
  '<tr><td' + inl("tdL") + '>国内银价</td><td' + inl("tdPv") + '>' + data.DOMESTIC_SILVER + ' 元/克</td><td' + inl("td") + '>人民币</td></tr>',
  '<tr><td' + inl("tdL") + '>投资金条</td><td' + inl("tdPv") + '>' + data.INVEST_BAR + ' 元/克</td><td' + inl("td") + '>金店基础价</td></tr>',
  '<tr><td' + inl("tdL") + '>黄金回收</td><td' + inl("tdPv") + '>' + data.RECOVERY_PRICE + ' 元/克</td><td' + inl("td") + '>足金999参考</td></tr>',
  '<tr><td' + inl("tdL") + '>品牌金饰</td><td' + inl("tdPv") + '>' + data.JEWELRY_PRICE + ' 元/克</td><td' + inl("td") + '>含品牌溢价</td></tr>',
  '</tbody></table>',
  '<div' + inl("time") + '>?? 回收价格低于实时金价1%-3%属正常折价</div>',
  '</div>'
].join("\n");

// ===== Price Card 3: Bank Savings Gold =====
const banks = [
  ["工商银行", data.BANK_ICBC], ["建设银行", data.BANK_CCB], ["农业银行", data.BANK_ABC],
  ["中国银行", data.BANK_BOC], ["招商银行", data.BANK_CMB], ["交通银行", data.BANK_COMM],
  ["兴业银行", data.BANK_CIB]
];

const bankRows = banks.map(([name, price]) =>
  '<tr><td' + inl("tdL") + '>' + name + ' 积存金</td><td' + inl("tdPv") + '>' + (price || "—") + ' 元/克</td><td' + inl("td") + '>1克起投</td></tr>'
).join("\n");

const priceCard3 = [
  '<div' + inl("card") + '>',
  '<h3' + inl("cardH3") + '>?? 银行积存金报价</h3>',
  '<table' + inl("tbl") + '>',
  '<thead><tr><th' + inl("th") + '>银行</th><th' + inl("th") + '>积存金价格</th><th' + inl("th") + '>门槛</th></tr></thead>',
  '<tbody>',
  bankRows,
  '</tbody></table>',
  '<div' + inl("time") + '>?? 各银行积存金价格以网点实时报价为准</div>',
  '</div>'
].join("\n");

const priceCards = priceCard1 + "\n" + priceCard2 + "\n" + priceCard3;

// ===== Convert MD to WeChat-compatible HTML with inline styles =====
function mdToWechatHtml(md) {
  const lines = md.split("\n");
  let h = "";
  let inTable = false;
  for (const line of lines) {
    const t = line.trimEnd();
    if (!t) { if (inTable) { h += "</table>\n"; inTable = false; } continue; }

    // Headings
    if (/^### (.+)/.test(t)) { h += "<h3 " + S.h3.slice(7, -1) + ">" + t.match(/^### (.+)/)[1] + "</h3>\n"; continue; }
    if (/^## (.+)/.test(t)) { h += "<h2 " + S.h2.slice(7, -1) + ">" + t.match(/^## (.+)/)[1] + "</h2>\n"; continue; }
    if (/^# (.+)/.test(t)) { h += "<h1 " + S.h1.slice(7, -1) + ">" + t.match(/^# (.+)/)[1] + "</h1>\n"; continue; }

    // HR
    if (/^---$/.test(t)) { h += "<hr " + S.hr.slice(7, -1) + ">\n"; continue; }

    // Blockquote
    if (/^> (.+)/.test(t)) {
      h += "<blockquote " + S.bq.slice(7, -1) + ">" + t.replace(/^> /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") + "</blockquote>\n";
      continue;
    }

    // Table
    if (/^\|.*\|$/.test(t)) {
      if (/^[\|\s\-:]+$/.test(t)) { inTable = true; continue; }
      if (!inTable) {
        h += '<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">\n';
        inTable = true;
      }
      const cells = t.split("|").filter(c => c).map(c => '<td style="padding:8px;border:1px solid #e0e0e0;text-align:center;font-size:14px">' + c.trim().replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") + "</td>").join("");
      h += "<tr>" + cells + "</tr>\n";
      continue;
    }
    if (inTable) { h += "</table>\n"; inTable = false; }

    // List items
    if (/^- (.+)/.test(t)) {
      h += "<li " + S.li.slice(7, -1) + ">" + t.replace(/^- /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") + "</li>\n";
      continue;
    }

    // Tags
    if (/^#/.test(t) && /[\u4e00-\u9fff]/.test(t)) {
      const tags = t.split(/\s+/).filter(x => x.startsWith("#")).map(x => '<span ' + S.tag.slice(7, -1) + '>' + x + '</span>').join("");
      if (tags) h += '<div ' + S.tags.slice(7, -1) + '>' + tags + "</div>\n";
      continue;
    }

    // Regular paragraph
    let p = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    if (/^\*.*\*$/.test(p)) h += '<p ' + S.footer.slice(7, -1) + '>' + p.replace(/^\*|\*$/g, "") + "</p>\n";
    else h += '<p ' + S.p.slice(7, -1) + '>' + p + "</p>\n";
  }
  if (inTable) h += "</table>\n";
  return h;
}

let articleHtml = priceCards + "\n" + mdToWechatHtml(article);

// Remove the <!--PRICE_CARDS--> placeholder
articleHtml = articleHtml.replace("<!--PRICE_CARDS-->", "");

// Write MD file
const mdPath = path.join(outDir, "黄金文章_" + today + ".md");
fs.writeFileSync(mdPath, article, "utf-8");
console.log("MD:", mdPath);

// Write WeChat HTML (no html/head/body wrapper — just article content)
const wechatHtml = articleHtml;
const htmlPath = path.join(outDir, "黄金文章_" + today + ".html");
fs.writeFileSync(htmlPath, wechatHtml, "utf-8");
console.log("HTML:", htmlPath);

// Also output a preview version (full HTML for browser viewing)
const previewHtml = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>黄金价格今日金价深度分析</title>\n<style>\nbody{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;background:#f0f2f5;line-height:1.85;font-size:16px;padding:20px;max-width:680px;margin:0 auto}\n</style>\n</head>\n<body>\n' + wechatHtml + '\n</body></html>';
const previewPath = path.join(outDir, "黄金文章_" + today + "_preview.html");
fs.writeFileSync(previewPath, previewHtml, "utf-8");
console.log("预览:", previewPath);
console.log("=== OK ===");