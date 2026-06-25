/**
 * 黄金文章生成器 v4.1 — WeChat 安全 HTML 版
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
  RSI_VALUE: "待盘中更新", RSI_STATUS: "待盘中更新",
  WEEKLY_ANALYSIS: "数据积累中", DAILY_ANALYSIS: "数据积累中",
  TECH_SUMMARY: "数据积累中",
  FED_ANALYSIS: "美联储6月维持利率不变，释放鹰派信号。",
  CB_ANALYSIS: "全球央行购金意愿维持高位。",
  GEO_ANALYSIS: "地缘风险溢价阶段性收缩。",
  SUPPORT_LEVELS: "数据积累中", RESISTANCE_LEVELS: "数据积累中",
  DXY_RANGE: "103-104", USDCNY: "7.10",
  BIAS_DIRECTION: "待盘中更新", BIAS_REASON: "待盘中更新",
  BIAS_RANGE: "待盘中更新", BIAS_STRATEGY: "待盘中更新",
  FED_IMPACT: "待盘中更新", GEO_FOCUS: "待盘中更新",
  DXY_VALUE: "待盘中更新", DXY_IMPACT: "待盘中更新",
  MA5_VALUE: "数据积累中", MA10_VALUE: "数据积累中",
  MA20_VALUE: "数据积累中（需20个交易日）",

  EMA5_VALUE: '数据积累中', EMA20_VALUE: '数据积累中', EMA60_VALUE: '数据积累中（需60个交易日）',
  EMA_ALIGNMENT: '数据积累中',
  BOLL_UPPER: '数据积累中', BOLL_MID: '数据积累中', BOLL_LOWER: '数据积累中',
  BOLL_WIDTH: '数据积累中', BOLL_POSITION: '数据积累中', BOLL_ASSESSMENT: '数据积累中',
  MACD_DIF: '数据积累中', MACD_DEA: '数据积累中', MACD_VALUE: '数据积累中', MACD_STATUS: '数据积累中',
  MA_ALIGNMENT: "数据积累中", PRICE_VS_MA20: "数据积累中",
  RANGE_20D_LOW: "数据积累中", RANGE_20D_HIGH: "数据积累中",
};

for (const [k, v] of Object.entries(defaults)) {
  article = article.split("{{" + k + "}}").join(v);
}
article = article.replace(/\\n/g, "\n");

const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const outDir = path.join(__dirname, "..", "daily_output");
fs.mkdirSync(outDir, { recursive: true });

// WeChat-safe inline CSS - light theme, solid colors only
const css = {
  h1: "font-size:20px;font-weight:bold;text-align:center;color:#1a1a1a;margin:12px 0 20px;line-height:1.5",
  h2: "font-size:17px;font-weight:bold;color:#b8860b;margin:28px 0 12px;padding-left:10px;border-left:4px solid #c8963e",
  h3: "font-size:15px;font-weight:bold;color:#444;margin:20px 0 8px",
  p:  "font-size:15px;color:#333;line-height:1.85;margin:8px 0",
  bq: "background-color:#fdf8f0;border-left:4px solid #c8963e;padding:10px 14px;margin:14px 0;font-size:14px;color:#6b5a3e;line-height:1.8",
  strong: "font-weight:bold;color:#c8963e",
  hr: "border:none;border-top:1px solid #eee;margin:24px 0",
  li: "font-size:14px;color:#333;line-height:1.85;margin:4px 0 4px 16px",
  footer: "text-align:center;color:#999;font-size:13px;margin-top:30px;padding-top:18px;border-top:1px solid #eee",
  cardBox: "background-color:#fafaf8;border:1px solid #e8d5a3;padding:18px 14px;margin:18px 0",
  cardTitle: "text-align:center;font-size:16px;font-weight:bold;color:#b8860b;margin:0 0 14px;padding-bottom:10px;border-bottom:2px solid #e8d5a3",
  tbl: "width:100%;border-collapse:collapse;font-size:13px",
  th: "background-color:#fdf8f0;color:#b8860b;font-weight:bold;padding:8px 6px;text-align:center;font-size:12px;border:1px solid #e8d5a3",
  td: "padding:7px 6px;text-align:center;font-size:13px;color:#333;border:1px solid #eee",
  tdName: "padding:7px 6px;text-align:left;font-size:12px;color:#666;border:1px solid #eee;font-weight:bold",
  tdPrice: "padding:7px 6px;text-align:center;font-size:14px;font-weight:bold;color:#1a1a1a;border:1px solid #eee",
  up: "color:#e60012;font-weight:bold",
  down: "color:#009944;font-weight:bold",
  flat: "color:#999",
  cardFooter: "text-align:center;font-size:12px;color:#999;margin-top:12px;padding-top:8px;border-top:1px solid #e8d5a3",
  tag: "display:inline-block;background-color:#fdf8f0;color:#b8860b;padding:3px 10px;margin:3px;font-size:13px",
};

function el(tag, style, text) {
  return "<" + tag + ' style="' + css[style] + '">' + text + "</" + tag + ">";
}
function td(text, style) { return el("td", style, text); }

// Card 1: International
const si = data.SILVER_PRICE ? ("$" + data.SILVER_PRICE) : "—";
const pd = data.PALLADIUM_PRICE ? ("$" + data.PALLADIUM_PRICE) : "—";
const pt = data.PLATINUM_PRICE ? ("$" + data.PLATINUM_PRICE) : "—";
const gcTag = data.SPOT_CHANGE.startsWith("-") ? "down" : data.SPOT_CHANGE.startsWith("+") ? "up" : "flat";
const scTag = data.SILVER_CHANGE.startsWith("-") ? "down" : data.SILVER_CHANGE.startsWith("+") ? "up" : "flat";

const card1 = [
  el("div", "cardBox", "").replace("></div>", ">"),
  el("div", "cardTitle", "国际贵金属行情"),
  '<table style="' + css.tbl + '"><thead><tr>',
  el("th", "th", "品种") + el("th", "th", "最新价") + el("th", "th", "涨跌幅") + el("th", "th", "最高") + el("th", "th", "最低"),
  "</tr></thead><tbody>",
  "<tr>" + td("国际黄金 XAU/USD", "tdName") + td("$" + data.SPOT_PRICE, "tdPrice") + td('<span style="' + css[gcTag] + '">' + data.SPOT_CHANGE + '</span>', "td") + td("$" + data.DAY_HIGH, "td") + td("$" + data.DAY_LOW, "td") + "</tr>",
  "<tr>" + td("国际银价 XAG/USD", "tdName") + td(si, "tdPrice") + td('<span style="' + css[scTag] + '">' + (data.SILVER_CHANGE || "—") + '</span>', "td") + td(data.SILVER_HIGH ? "$" + data.SILVER_HIGH : "—", "td") + td(data.SILVER_LOW ? "$" + data.SILVER_LOW : "—", "td") + "</tr>",
  "<tr>" + td("国际钯金 XPD/USD", "tdName") + td(pd, "tdPrice") + td('<span style="' + css.flat + '">—</span>', "td") + td(data.PD_HIGH ? "$" + data.PD_HIGH : "—", "td") + td(data.PD_LOW ? "$" + data.PD_LOW : "—", "td") + "</tr>",
  "<tr>" + td("国标铂金 XPT/USD", "tdName") + td(pt, "tdPrice") + td('<span style="' + css.flat + '">—</span>', "td") + td(data.PT_HIGH ? "$" + data.PT_HIGH : "—", "td") + td(data.PT_LOW ? "$" + data.PT_LOW : "—", "td") + "</tr>",
  "</tbody></table>",
  el("div", "cardFooter", "数据来源：金十数据 &amp; COMEX | " + (data.QUOTE_TIME || "")),
  "</div>"
].join("");

// Card 2: Domestic
const card2 = [
  el("div", "cardBox", "").replace("></div>", ">"),
  el("div", "cardTitle", "国内金价行情"),
  '<table style="' + css.tbl + '"><thead><tr>',
  el("th", "th", "品种") + el("th", "th", "最新价") + el("th", "th", "说明"),
  "</tr></thead><tbody>",
  "<tr>" + td("国内金价", "tdName") + td((data.DOMESTIC_GOLD || "—") + " 元/克", "tdPrice") + td("人民币计价", "td") + "</tr>",
  "<tr>" + td("国内银价", "tdName") + td((data.DOMESTIC_SILVER || "—") + " 元/克", "tdPrice") + td("人民币计价", "td") + "</tr>",
  "<tr>" + td("投资金条", "tdName") + td((data.INVEST_BAR || "—") + " 元/克", "tdPrice") + td("金店基础价", "td") + "</tr>",
  "<tr>" + td("黄金回收", "tdName") + td((data.RECOVERY_PRICE || "—") + " 元/克", "tdPrice") + td("足金999参考", "td") + "</tr>",
  "</tbody></table>",
  el("div", "cardFooter", "回收价格低于实时金价1%-3%属正常折价"),
  "</div>"
].join("");

// Card 3: Bank Savings Gold
const banks = [
  ["工商银行", data.BANK_ICBC], ["建设银行", data.BANK_CCB], ["农业银行", data.BANK_ABC],
  ["中国银行", data.BANK_BOC], ["招商银行", data.BANK_CMB], ["交通银行", data.BANK_COMM], ["兴业银行", data.BANK_CIB]
];
const bankRows = banks.map(function(b) {
  return "<tr>" + td(b[0] + " 积存金", "tdName") + td((b[1] || "—") + " 元/克", "tdPrice") + td("1克起投", "td") + "</tr>";
}).join("");

const card3 = [
  el("div", "cardBox", "").replace("></div>", ">"),
  el("div", "cardTitle", "银行积存金报价"),
  '<table style="' + css.tbl + '"><thead><tr>',
  el("th", "th", "银行") + el("th", "th", "积存金价格") + el("th", "th", "门槛"),
  "</tr></thead><tbody>",
  bankRows,
  "</tbody></table>",
  el("div", "cardFooter", "各银行积存金价格以网点实时报价为准"),
  "</div>"
].join("");

const priceCards = card1 + card2 + card3;

// MD to WeChat HTML
function md2html(md) {
  var lines = md.split("\n"), h = "", inTbl = false;
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i].trimEnd();
    if (!t) { if (inTbl) { h += "</table>"; inTbl = false; } continue; }
    if (/^### (.+)/.test(t)) { h += el("h3", "h3", RegExp.$1); continue; }
    if (/^## (.+)/.test(t)) { h += el("h2", "h2", RegExp.$1); continue; }
    if (/^# (.+)/.test(t)) { h += el("h1", "h1", RegExp.$1); continue; }
    if (/^---$/.test(t)) { h += '<hr style="' + css.hr + '">'; continue; }
    if (/^> (.+)/.test(t)) { h += el("blockquote", "bq", RegExp.$1.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')); continue; }
    if (/^\|.*\|$/.test(t)) {
      if (/^[\|\s\-:]+$/.test(t)) { inTbl = true; continue; }
      if (!inTbl) { h += '<table style="width:100%;border-collapse:collapse;font-size:14px;margin:14px 0">'; inTbl = true; }
      var cells = t.split("|").filter(function(c){return c;}).map(function(c){ return '<td style="padding:7px 8px;border:1px solid #d5d5d5;text-align:center;font-size:13px;color:#333">' + c.trim().replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</td>'; }).join("");
      h += "<tr>" + cells + "</tr>";
      continue;
    }
    if (inTbl) { h += "</table>"; inTbl = false; }
    if (/^- (.+)/.test(t)) { h += el("li", "li", RegExp.$1.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')); continue; }
    if (/^#/.test(t) && /[\u4e00-\u9fff]/.test(t)) {
      var tags = t.split(/\s+/).filter(function(x){return x.startsWith("#");}).map(function(x){return '<span style="' + css.tag + '">' + x + '</span>';}).join("");
      if (tags) h += '<div style="text-align:center;margin-top:14px">' + tags + '</div>';
      continue;
    }
    if (/^\*.*\*$/.test(t)) h += el("p", "footer", t.replace(/^\*|\*$/g, ""));
    else h += '<p style="' + css.p + '">' + t.replace(/\*\*(.+?)\*\*/g, '<strong style="' + css.strong + '">$1</strong>') + '</p>';
  }
  if (inTbl) h += "</table>";
  return h;
}

var articleHtml = priceCards + md2html(article);
articleHtml = articleHtml.replace("<!--PRICE_CARDS-->", "");

// Write MD
var mdPath = path.join(outDir, "黄金文章_" + today + ".md");
fs.writeFileSync(mdPath, article, "utf-8");
console.log("MD:", mdPath);

// Write WeChat HTML
var htmlPath = path.join(outDir, "黄金文章_" + today + ".html");
fs.writeFileSync(htmlPath, articleHtml, "utf-8");
console.log("HTML:", htmlPath, "(" + Buffer.byteLength(articleHtml, "utf-8") + " bytes)");

// Verify
var v = fs.readFileSync(htmlPath, "utf-8");
console.log("Verify international card:", v.indexOf("国际贵金属行情") > 0 ? "OK" : "FAIL");
console.log("Verify domestic card:", v.indexOf("国内金价行情") > 0 ? "OK" : "FAIL");
console.log("=== OK ===");