/**
 * 黄金文章生成器 v5.0 — 技术仪表盘 + 结论卡片 + 色彩编码
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
  EMA5_VALUE: "数据积累中", EMA20_VALUE: "数据积累中", EMA60_VALUE: "数据积累中（需60个交易日）",
  EMA_ALIGNMENT: "数据积累中",
  BOLL_UPPER: "数据积累中", BOLL_MID: "数据积累中", BOLL_LOWER: "数据积累中",
  BOLL_WIDTH: "数据积累中", BOLL_POSITION: "数据积累中", BOLL_ASSESSMENT: "数据积累中",
  MACD_DIF: "数据积累中", MACD_DEA: "数据积累中", MACD_VALUE: "数据积累中", MACD_STATUS: "数据积累中",
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

const D = String.fromCharCode(36);

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
  dashBox: "background-color:#fafaf8;border:1px solid #e0d0a0;padding:16px 12px;margin:16px 0",
  dashTitle: "text-align:center;font-size:15px;font-weight:bold;color:#b8860b;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e8d5a3",
  dashSub: "font-size:14px;font-weight:bold;color:#555;margin:14px 0 6px;padding:4px 8px;background:#fdf8f0;border-left:3px solid #c8963e",
  dashTbl: "width:100%;border-collapse:collapse;font-size:12px",
  dashTh: "background:#fdf8f0;color:#b8860b;font-weight:bold;padding:6px 4px;text-align:center;font-size:11px;border:1px solid #e8d5a3",
  dashTd: "padding:6px 4px;text-align:center;font-size:12px;color:#333;border:1px solid #eee",
  dashTdN: "padding:6px 4px;text-align:left;font-size:11px;color:#666;border:1px solid #eee;font-weight:bold",
  dashTdV: "padding:6px 4px;text-align:center;font-size:13px;font-weight:bold;color:#1a1a1a;border:1px solid #eee",
  dashTagBull: "display:inline-block;padding:2px 8px;border-radius:2px;font-size:11px;font-weight:bold;color:#fff;background-color:#009944",
  dashTagBear: "display:inline-block;padding:2px 8px;border-radius:2px;font-size:11px;font-weight:bold;color:#fff;background-color:#e60012",
  dashTagWarn: "display:inline-block;padding:2px 8px;border-radius:2px;font-size:11px;font-weight:bold;color:#fff;background-color:#e67e22",
  dashTagNeutral: "display:inline-block;padding:2px 8px;border-radius:2px;font-size:11px;font-weight:bold;color:#fff;background-color:#888",
  conclBox: "background:linear-gradient(135deg,#fef9f0,#fdf3e0);border:2px solid #c8963e;border-radius:6px;padding:18px 16px;margin:20px 0",
  conclTitle: "text-align:center;font-size:15px;font-weight:bold;color:#b8860b;margin:0 0 14px;padding-bottom:10px;border-bottom:2px dashed #e8d5a3",
  conclLabel: "display:inline-block;min-width:50px;font-size:12px;color:#999",
  conclVal: "font-size:14px;font-weight:bold;color:#1a1a1a",
  conclBull: "font-size:14px;font-weight:bold;color:#009944",
  conclBear: "font-size:14px;font-weight:bold;color:#e60012",
};

function el(tag, style, text) {
  return "<" + tag + ' style="' + css[style] + '">' + text + "</" + tag + ">";
}
function td(text, style) { return el("td", style, text); }
function tag(text, cls) { return '<span style="' + css[cls] + '">' + text + '</span>'; }

function isBullish(s) {
  if (!s) return null;
  if (/多|涨|反弹|金叉|支撑|偏多|bull|上穿/.test(s) && !/空|跌|回调|死叉|压力|偏空|bear|下穿/.test(s)) return true;
  if (/空|跌|回调|死叉|压力|偏空|bear|下穿/.test(s) && !/多|涨|反弹|金叉|支撑|偏多|bull|上穿/.test(s)) return false;
  return null;
}

// ===== Card 1: International Metals =====
const gcUp = data.SPOT_CHANGE.startsWith("+");
const gcDn = data.SPOT_CHANGE.startsWith("-");
const scUp = data.SILVER_CHANGE.startsWith("+");
const scDn = data.SILVER_CHANGE.startsWith("-");

const card1Rows = [
  ["国际黄金", D + (data.SPOT_PRICE || "—"), data.SPOT_CHANGE || "—", gcUp ? css.up : gcDn ? css.down : css.flat, D + (data.DAY_HIGH || "—"), D + (data.DAY_LOW || "—")],
  ["国际银价", D + (data.SILVER_PRICE || "—"), data.SILVER_CHANGE || "—", scUp ? css.up : scDn ? css.down : css.flat, "—", "—"],
  ["国际钯金", D + (data.PALLADIUM_PRICE || "—"), "—", css.flat, D + (data.PD_HIGH || "—"), D + (data.PD_LOW || "—")],
  ["国标铂金", D + (data.PLATINUM_PRICE || "—"), "—", css.flat, D + (data.PT_HIGH || "—"), D + (data.PT_LOW || "—")],
].map(function(r) {
  return "<tr>" + td(r[0], "dashTdN") + td(r[1], "dashTdV") + td('<span style="' + r[3] + '">' + r[2] + '</span>', "dashTd") + td(r[4], "dashTd") + td(r[5], "dashTd") + "</tr>";
}).join("");

const card1 = [
  el("div", "cardBox", "").replace("></div>", ">"),
  el("div", "cardTitle", "国际贵金属行情"),
  '<table style="' + css.dashTbl + '"><thead><tr>',
  el("th", "dashTh", "品种") + el("th", "dashTh", "最新价") + el("th", "dashTh", "涨跌") + el("th", "dashTh", "最高") + el("th", "dashTh", "最低"),
  "</tr></thead><tbody>",
  card1Rows,
  "</tbody></table>",
  el("div", "cardFooter", "数据来源：金十数据 & COMEX | " + (data.QUOTE_TIME || "")),
  "</div>"
].join("");

// ===== Card 2: Domestic =====
const card2Rows = [
  ["国内金价", (data.DOMESTIC_GOLD || "—") + " 元/克", "人民币计价"],
  ["国内银价", (data.DOMESTIC_SILVER || "—") + " 元/克", "人民币计价"],
  ["投资金条", (data.INVEST_BAR || "—") + " 元/克", "金店基础价"],
  ["黄金回收", (data.RECOVERY_PRICE || "—") + " 元/克", "足金999参考"],
].map(function(r) { return "<tr>" + td(r[0], "tdName") + td(r[1], "tdPrice") + td(r[2], "td") + "</tr>"; }).join("");

const card2 = [
  el("div", "cardBox", "").replace("></div>", ">"),
  el("div", "cardTitle", "国内金价行情"),
  '<table style="' + css.tbl + '"><thead><tr>',
  el("th", "th", "品种") + el("th", "th", "最新价") + el("th", "th", "说明"),
  "</tr></thead><tbody>",
  card2Rows,
  "</tbody></table>",
  el("div", "cardFooter", "回收价低于实时金价1%-3%属正常折价"),
  "</div>"
].join("");

// ===== Card 3: Bank Savings (top 4) =====
const banks = [
  ["工商银行", data.BANK_ICBC], ["建设银行", data.BANK_CCB],
  ["农业银行", data.BANK_ABC], ["中国银行", data.BANK_BOC],
];
const bankRows = banks.map(function(b) {
  return "<tr>" + td(b[0], "dashTdN") + td((b[1] || "—") + " 元/克", "dashTdV") + td("1克起", "dashTd") + "</tr>";
}).join("");

const card3 = [
  el("div", "cardBox", "").replace("></div>", ">"),
  el("div", "cardTitle", "银行积存金（部分）"),
  '<table style="' + css.dashTbl + '"><thead><tr>',
  el("th", "dashTh", "银行") + el("th", "dashTh", "价格") + el("th", "dashTh", "门槛"),
  "</tr></thead><tbody>",
  bankRows,
  "</tbody></table>",
  el("div", "cardFooter", "各银行网点实时报价为准"),
  "</div>"
].join("");

const priceCards = card1 + card2 + card3;

// ===== TECH DASHBOARD =====
function buildTechDashboard() {
  var emaBull = isBullish(data.EMA_ALIGNMENT);
  var emaTag = emaBull === true ? tag("多头", "dashTagBull") : emaBull === false ? tag("空头", "dashTagBear") : tag("震荡", "dashTagNeutral");

  var bollBull = data.BOLL_ASSESSMENT && /超卖|反弹/.test(data.BOLL_ASSESSMENT) ? true :
                 data.BOLL_ASSESSMENT && /超买|回调/.test(data.BOLL_ASSESSMENT) ? false : null;
  var bollTag = bollBull === true ? tag("超卖", "dashTagWarn") :
                 bollBull === false ? tag("超买", "dashTagBear") : tag("震荡", "dashTagNeutral");

  var macdBull = data.MACD_STATUS && /金叉|红柱放大|多头/.test(data.MACD_STATUS) ? true :
                  data.MACD_STATUS && /死叉|绿柱放大|空头/.test(data.MACD_STATUS) ? false : null;
  var macdTag = macdBull === true ? tag("偏多", "dashTagBull") :
                 macdBull === false ? tag("偏空", "dashTagBear") : tag("积累中", "dashTagNeutral");

  return [
    el("div", "dashBox", "").replace("></div>", ">"),
    el("div", "dashTitle", "技术指标仪表盘"),

    el("div", "dashSub", "EMA 价格结构"),
    '<table style="' + css.dashTbl + '"><thead><tr>',
    el("th", "dashTh", "EMA5") + el("th", "dashTh", "EMA20") + el("th", "dashTh", "EMA60") + el("th", "dashTh", "排列"),
    "</tr></thead><tbody><tr>",
    td(data.EMA5_VALUE, "dashTdV") + td(data.EMA20_VALUE, "dashTdV") + td(data.EMA60_VALUE, "dashTdV") + td(emaTag, "dashTd"),
    "</tr></tbody></table>",
    '<p style="font-size:13px;color:#555;margin:4px 0">' + (data.EMA_ALIGNMENT || "—") + '</p>',

    el("div", "dashSub", "BOLL 波动区间"),
    '<table style="' + css.dashTbl + '"><thead><tr>',
    el("th", "dashTh", "上轨") + el("th", "dashTh", "中轨") + el("th", "dashTh", "下轨") + el("th", "dashTh", "位置") + el("th", "dashTh", "带宽"),
    "</tr></thead><tbody><tr>",
    td(data.BOLL_UPPER, "dashTdV") + td(data.BOLL_MID, "dashTdV") + td(data.BOLL_LOWER, "dashTdV") + td(bollTag, "dashTd") + td(data.BOLL_WIDTH, "dashTd"),
    "</tr></tbody></table>",
    '<p style="font-size:13px;color:#555;margin:4px 0">' + (data.BOLL_ASSESSMENT || "—") + '</p>',

    el("div", "dashSub", "MACD 动能结构"),
    '<table style="' + css.dashTbl + '"><thead><tr>',
    el("th", "dashTh", "DIF") + el("th", "dashTh", "DEA") + el("th", "dashTh", "MACD柱") + el("th", "dashTh", "信号"),
    "</tr></thead><tbody><tr>",
    td(data.MACD_DIF, "dashTdV") + td(data.MACD_DEA, "dashTdV") + td(data.MACD_VALUE, "dashTdV") + td(macdTag, "dashTd"),
    "</tr></tbody></table>",
    '<p style="font-size:13px;color:#555;margin:4px 0">' + (data.MACD_STATUS || "—") + '</p>',

    "</div>"
  ].join("");
}

// ===== CONCLUSION CARD =====
function buildConclusion() {
  var dirBull = isBullish(data.BIAS_DIRECTION);
  var dirColor = dirBull === true ? css.conclBull : dirBull === false ? css.conclBear : css.conclVal;
  return [
    el("div", "conclBox", "").replace("></div>", ">"),
    el("div", "conclTitle", "今日观点"),
    '<table style="width:100%;border-collapse:collapse"><tbody>',
    '<tr><td style="' + css.conclLabel + '">方向</td><td style="' + dirColor + '">' + (data.BIAS_DIRECTION || "—") + '</td></tr>',
    '<tr><td style="' + css.conclLabel + '">依据</td><td style="' + css.conclVal + '">' + (data.BIAS_REASON || "—") + '</td></tr>',
    '<tr><td style="' + css.conclLabel + '">区间</td><td style="' + css.conclVal + '">' + (data.BIAS_RANGE || "—") + '</td></tr>',
    '<tr><td style="' + css.conclLabel + '">策略</td><td style="' + css.conclVal + '">' + (data.BIAS_STRATEGY || "—") + '</td></tr>',
    "</tbody></table>",
    "</div>"
  ].join("");
}

// ===== MD to WeChat HTML =====
function md2html(md) {
  var lines = md.split("\n"), h = "", inTbl = false;
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i].trimEnd();
    if (!t) { if (inTbl) { h += "</table>"; inTbl = false; } continue; }
    if (/^### (.+)/.test(t)) { h += el("h3", "h3", RegExp["$1"]); continue; }
    if (/^## (.+)/.test(t)) { h += el("h2", "h2", RegExp["$1"]); continue; }
    if (/^# (.+)/.test(t)) { h += el("h1", "h1", RegExp["$1"]); continue; }
    if (/^---$/.test(t)) { h += '<hr style="' + css.hr + '">'; continue; }
    if (/^> (.+)/.test(t)) { h += el("blockquote", "bq", RegExp["$1"].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')); continue; }
    if (/^\|.*\|$/.test(t)) {
      if (/^[\|\s\-:]+$/.test(t)) { inTbl = true; continue; }
      if (!inTbl) { h += '<table style="width:100%;border-collapse:collapse;font-size:14px;margin:14px 0">'; inTbl = true; }
      var cells = t.split("|").filter(function(c){return c;}).map(function(c){ return '<td style="padding:7px 8px;border:1px solid #d5d5d5;text-align:center;font-size:13px;color:#333">' + c.trim().replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</td>'; }).join("");
      h += "<tr>" + cells + "</tr>";
      continue;
    }
    if (inTbl) { h += "</table>"; inTbl = false; }
    if (/^- (.+)/.test(t)) { h += el("li", "li", RegExp["$1"].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')); continue; }
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

var articleHtml = md2html(article);
articleHtml = articleHtml.replace("<!--PRICE_CARDS-->", priceCards);
articleHtml = articleHtml.replace("<!--TECH_DASHBOARD-->", buildTechDashboard());
articleHtml = articleHtml.replace("<!--CONCLUSION_CARD-->", buildConclusion());

// Write MD
var mdPath = path.join(outDir, "黄金文章_" + today + ".md");
fs.writeFileSync(mdPath, article, "utf-8");
console.log("MD:", mdPath);

// Write HTML
var htmlPath = path.join(outDir, "黄金文章_" + today + ".html");
var htmlBuf = Buffer.from(articleHtml, "utf-8");
fs.writeFileSync(htmlPath, htmlBuf);
console.log("HTML:", htmlPath, "(" + htmlBuf.length + " bytes)");

// Verify
var v = fs.readFileSync(htmlPath, "utf-8");
console.log("Dashboard:", v.indexOf("技术指标仪表盘") > 0 ? "OK" : "FAIL");
console.log("Conclusion:", v.indexOf("今日观点") > 0 ? "OK" : "FAIL");
console.log("Intl card:", v.indexOf("国际贵金属行情") > 0 ? "OK" : "FAIL");
console.log("=== OK ===");
