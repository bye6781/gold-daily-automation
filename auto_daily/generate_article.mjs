/**
 * 黄金文章生成器 v6.2 — 微信兼容版
 * 设计原则：零渐变 零阴影 零flexbox | 仅纯色+边框+间距
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, "latest_data.json");

if (!fs.existsSync(dataFile)) { console.error("ERROR: no data file"); process.exit(1); }

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
  MA5_VALUE: "数据积累中", MA10_VALUE: "数据积累中", MA20_VALUE: "数据积累中（需20个交易日）",
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

// ====== WECHAT-SAFE CSS ======
// ❌ NO: linear-gradient, box-shadow, display:flex, gap, border-radius>4px
// ✅ YES: solid bg-color, border, padding, margin, text-align, font-*

const css = {
  // Typography
  h1: "font-size:20px;font-weight:bold;text-align:center;color:#1a1a1a;margin:12px 0 20px;line-height:1.5",
  h2: "font-size:17px;font-weight:bold;color:#b8860b;margin:28px 0 12px;padding-left:10px;border-left:4px solid #c8963e",
  h3: "font-size:15px;font-weight:bold;color:#444;margin:20px 0 8px",
  p:  "font-size:15px;color:#333;line-height:1.85;margin:8px 0",
  bq: "background-color:#fdf8f0;border-left:4px solid #c8963e;padding:10px 14px;margin:14px 0;font-size:14px;color:#6b5a3e;line-height:1.8",
  strong: "font-weight:bold;color:#c8963e",
  li: "font-size:14px;color:#333;line-height:1.85;margin:4px 0 4px 16px",
  footer: "text-align:center;color:#999;font-size:13px;margin-top:30px;padding-top:18px;border-top:1px solid #eee",
  
  // Hero section (solid bg only)
  heroBox: "background-color:#2c2416;padding:22px 16px 18px;margin:0 0 18px;text-align:center",
  heroLabel: "font-size:12px;color:#c8963e;letter-spacing:2px;margin:0 0 6px",
  heroPrice: "font-size:34px;font-weight:bold;color:#fff;line-height:1.1;margin:0",
  heroChange: "display:inline-block;padding:3px 12px;font-size:14px;font-weight:bold;margin:8px 0 0",
  heroSub: "font-size:12px;color:#a09070;margin:10px 0 0;line-height:1.5",
  heroTag: "display:inline-block;padding:3px 10px;font-size:12px;color:#a09070;background-color:#3d3220;margin:8px 0 0",
  
  // Cards
  card: "background-color:#fafaf8;border:1px solid #e8d5a3;padding:16px 14px;margin:16px 0",
  cardTitle: "font-size:15px;font-weight:bold;color:#b8860b;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #e8d5a3",
  
  // Tables
  tbl: "width:100%;border-collapse:collapse;font-size:13px",
  th: "background-color:#fdf8f0;color:#b8860b;font-weight:bold;padding:8px 6px;text-align:center;font-size:12px;border:1px solid #e8d5a3",
  td: "padding:7px 6px;text-align:center;font-size:13px;color:#333;border:1px solid #eee",
  tdName: "padding:7px 6px;text-align:left;font-size:12px;color:#666;border:1px solid #eee;font-weight:bold",
  tdPrice: "padding:7px 6px;text-align:center;font-size:14px;font-weight:bold;color:#1a1a1a;border:1px solid #eee",
  trAlt: "background-color:#fefefe",
  
  // Colors
  up: "color:#e60012;font-weight:bold",
  down: "color:#009944;font-weight:bold",
  flat: "color:#999",
  
  // Dashboard
  dashBox: "background-color:#fafaf8;border:1px solid #e0d0a0;padding:16px 12px;margin:16px 0",
  dashTitle: "text-align:center;font-size:15px;font-weight:bold;color:#b8860b;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e8d5a3",
  dashSub: "font-size:14px;font-weight:bold;color:#555;margin:14px 0 6px;padding:4px 8px;background-color:#fdf8f0;border-left:3px solid #c8963e",
  dashTbl: "width:100%;border-collapse:collapse;font-size:12px",
  dashTh: "background-color:#fdf8f0;color:#b8860b;font-weight:bold;padding:6px 4px;text-align:center;font-size:11px;border:1px solid #e8d5a3",
  dashTd: "padding:6px 4px;text-align:center;font-size:12px;color:#333;border:1px solid #eee",
  dashTdN: "padding:6px 4px;text-align:left;font-size:11px;color:#666;border:1px solid #eee;font-weight:bold",
  dashTdV: "padding:6px 4px;text-align:center;font-size:13px;font-weight:bold;color:#1a1a1a;border:1px solid #eee",
  
  // Tags
  tagBull: "display:inline-block;padding:2px 8px;font-size:11px;font-weight:bold;color:#fff;background-color:#009944",
  tagBear: "display:inline-block;padding:2px 8px;font-size:11px;font-weight:bold;color:#fff;background-color:#e60012",
  tagWarn: "display:inline-block;padding:2px 8px;font-size:11px;font-weight:bold;color:#fff;background-color:#e67e22",
  tagNeutral: "display:inline-block;padding:2px 8px;font-size:11px;font-weight:bold;color:#fff;background-color:#888",
  
  // Conclusion
  conclBox: "background-color:#fef9f0;border:2px solid #c8963e;padding:18px 16px;margin:20px 0",
  conclTitle: "text-align:center;font-size:15px;font-weight:bold;color:#b8860b;margin:0 0 14px;padding-bottom:10px;border-bottom:2px dashed #e8d5a3",
  conclLabel: "display:inline-block;min-width:50px;font-size:12px;color:#999",
  conclVal: "font-size:14px;font-weight:bold;color:#1a1a1a",
  conclBull: "font-size:14px;font-weight:bold;color:#009944",
  conclBear: "font-size:14px;font-weight:bold;color:#e60012",
  
  // Dividers
  divider: "border:none;border-top:1px solid #eee;margin:24px 0",
  
  // Tags at bottom
  tag: "display:inline-block;background-color:#fdf8f0;color:#b8860b;padding:3px 10px;margin:3px;font-size:13px",
};

function el(tag, style, text) {
  return "<" + tag + ' style="' + css[style] + '">' + text + "</" + tag + ">";
}
function td(text, style) { return el("td", style, text); }
function stag(text, cls) { return '<span style="' + css[cls] + '">' + text + '</span>'; }
function div(style, text) { return el("div", style, text); }

function isBullish(s) {
  if (!s) return null;
  if (/多头|上涨|反弹|金叉|支撑|偏多|bull|上穿/.test(s) && !/空头|下跌|回调|死叉|压力|偏空|bear|下穿/.test(s)) return true;
  if (/空头|下跌|回调|死叉|压力|偏空|bear|下穿/.test(s) && !/多头|上涨|反弹|金叉|支撑|偏多|bull|上穿/.test(s)) return false;
  return null;
}

// ====== HERO BANNER ======
const gcUp = data.SPOT_CHANGE && data.SPOT_CHANGE.startsWith("+");
const gcDn = data.SPOT_CHANGE && data.SPOT_CHANGE.startsWith("-");
const changeBg = gcUp ? "#009944" : gcDn ? "#e60012" : "#888";
const changeIcon = gcUp ? "\u25B2" : gcDn ? "\u25BC" : "\u2014";

const heroBanner = [
  '<div style="' + css.heroBox + '">',
  '<p style="' + css.heroLabel + '">XAU/USD \u73B0\u8D27\u9EC4\u91D1 \u00B7 ' + (data.DATE_CN || "") + '</p>',
  '<p style="' + css.heroPrice + '">' + D + (data.SPOT_PRICE || "\u2014") + '</p>',
  '<span style="' + css.heroChange + ';background-color:' + changeBg + ';color:#fff">' + changeIcon + ' ' + (data.SPOT_CHANGE || "0.00%") + '</span>',
  '<br>',
  '<span style="' + css.heroTag + '">COMEX ' + (data.COMEX_MONTH || "") + ' ' + D + (data.COMEX_PRICE || "\u2014") + '</span>',
  '<p style="' + css.heroSub + '">\u65E5\u5185 ' + D + (data.DAY_LOW || "\u2014") + ' \u2014 ' + D + (data.DAY_HIGH || "\u2014") + ' | \u62A5\u4EF7 ' + (data.QUOTE_TIME || "") + '</p>',
  '</div>'
].join("");

// ====== PRICE CARDS ======
var priceRowIdx = 0;
function priceRow(name, price, change, high, low, unit, isIntl) {
  var chUp = change && change.startsWith("+");
  var chDn = change && change.startsWith("-");
  var chCls = chUp ? css.up : chDn ? css.down : css.flat;
  var chSym = chUp ? "\u25B2" : chDn ? "\u25BC" : "";
  var trStyle = (priceRowIdx++ % 2 === 0) ? "" : css.trAlt;
  return '<tr style="' + trStyle + '">' +
    td(name, "tdName") +
    '<td style="' + css.tdPrice + '">' + (isIntl ? D : "") + (price || "\u2014") + '</td>' +
    '<td style="' + css.td + '"><span style="' + chCls + '">' + chSym + (change || "\u2014") + '</span></td>' +
    '<td style="' + css.td + '">' + (high || "\u2014") + '</td>' +
    '<td style="' + css.td + '">' + (low || "\u2014") + '</td>' +
    '<td style="' + css.td + '">' + (unit || "") + '</td>' +
    '</tr>';
}

// International card
priceRowIdx = 0;
var intlCard = [
  '<div style="' + css.card + '">',
  '<div style="' + css.cardTitle + '">\u56FD\u9645\u5E02\u573A\u62A5\u4EF7</div>',
  '<table style="' + css.tbl + '">',
  '<tr><th style="' + css.th + '">\u54C1\u79CD</th><th style="' + css.th + '">\u6700\u65B0\u4EF7</th><th style="' + css.th + '">\u6DA8\u8DCC\u5E45</th><th style="' + css.th + '">\u6700\u9AD8\u4EF7</th><th style="' + css.th + '">\u6700\u4F4E\u4EF7</th><th style="' + css.th + '">\u5355\u4F4D</th></tr>',
  priceRow("\u56FD\u9645\u91D1\u4EF7", data.SPOT_PRICE, data.SPOT_CHANGE, data.DAY_HIGH, data.DAY_LOW, "\u7F8E\u5143/\u76CE\u53F8", true),
  priceRow("\u56FD\u9645\u94F6\u4EF7", data.SILVER_PRICE, data.SILVER_CHANGE, data.SILVER_HIGH || data.SILVER_PRICE, data.SILVER_LOW || data.SILVER_PRICE, "\u7F8E\u5143/\u76CE\u53F8", true),
  priceRow("\u56FD\u9645\u94AF\u91D1", data.PALLADIUM_PRICE, "\u2014", data.PD_HIGH, data.PD_LOW, "\u7F8E\u5143/\u76CE\u53F8", true),
  priceRow("\u56FD\u6807\u94C2\u91D1", data.PLATINUM_PRICE, "\u2014", data.PT_HIGH, data.PT_LOW, "\u7F8E\u5143/\u76CE\u53F8", true),
  '</table></div>'
].join("");

// Domestic card
priceRowIdx = 0;
var domCard = [
  '<div style="' + css.card + '">',
  '<div style="' + css.cardTitle + '">\u56FD\u5185\u5E02\u573A\u62A5\u4EF7</div>',
  '<table style="' + css.tbl + '">',
  '<tr><th style="' + css.th + '">\u54C1\u79CD</th><th style="' + css.th + '">\u6700\u65B0\u4EF7</th><th style="' + css.th + '">\u6DA8\u8DCC\u5E45</th><th style="' + css.th + '">\u6700\u9AD8\u4EF7</th><th style="' + css.th + '">\u6700\u4F4E\u4EF7</th><th style="' + css.th + '">\u5355\u4F4D</th></tr>',
  priceRow("\u56FD\u5185\u91D1\u4EF7", data.DOMESTIC_GOLD, "\u2014", data.DOMESTIC_GOLD, data.DOMESTIC_GOLD, "\u5143/\u514B", false),
  priceRow("\u56FD\u5185\u94F6\u4EF7", data.DOMESTIC_SILVER, "\u2014", data.DOMESTIC_SILVER, data.DOMESTIC_SILVER, "\u5143/\u514B", false),
  priceRow("\u6295\u8D44\u91D1\u6761", data.INVEST_BAR, "\u2014", data.INVEST_BAR, data.INVEST_BAR, "\u5143/\u514B", false),
  priceRow("\u9EC4\u91D1\u56DE\u6536(\u8DB3\u91D1999)", data.RECOVERY_PRICE, "\u2014", data.RECOVERY_PRICE, data.RECOVERY_PRICE, "\u5143/\u514B", false),
  priceRow("\u79EF\u5B58\u91D1", data.SAVING_GOLD_HIGH ? (data.SAVING_GOLD_LOW || data.SAVING_GOLD_HIGH) + "\u2014" + (data.SAVING_GOLD_HIGH || "") : "\u2014", "\u2014", data.SAVING_GOLD_HIGH || "\u2014", data.SAVING_GOLD_LOW || "\u2014", "\u5143/\u514B", false),
  '</table></div>'
].join("");

// ====== TECH DASHBOARD ======
function dashRowHTML(cols) {
  var items = [];
  for (var i = 0; i < cols.length; i++) {
    var c = cols[i];
    var tagHtml = c.tagText ? '<br><span style="' + (c.tagStyle || "") + ';font-size:10px">' + c.tagText + '</span>' : "";
    items.push(
      '<td style="' + css.dashTd + ';vertical-align:top">' +
      '<span style="font-size:10px;color:#999">' + c.label + '</span><br>' +
      '<span style="font-size:14px;font-weight:bold;color:#1a1a1a">' + (c.value || "\u2014") + '</span>' +
      tagHtml + '</td>'
    );
  }
  return '<tr>' + items.join("") + '</tr>';
}

var rsiTagStyle = function(s) {
  if (!s || s.indexOf("\u5F85") >= 0) return "color:#888";
  var v = parseFloat(s);
  if (isNaN(v)) return "color:#888";
  if (v >= 70) return "background-color:#ffe0e0;color:#e60012;padding:1px 5px";
  if (v <= 30) return "background-color:#e0ffe0;color:#009944;padding:1px 5px";
  return "color:#888";
};

var macdTagStyle = isBullish(data.MACD_STATUS) === true ? "background-color:#e0ffe0;color:#009944;padding:1px 5px" :
  isBullish(data.MACD_STATUS) === false ? "background-color:#ffe0e0;color:#e60012;padding:1px 5px" : "color:#888";

var techDashboard = [
  '<div style="' + css.dashBox + '">',
  '<div style="' + css.dashTitle + '">\u6280\u672F\u4E00\u89C8\u8868</div>',
  '<table style="' + css.dashTbl + '">',
  dashRowHTML([
    {label: "RSI(14)", value: data.RSI_VALUE || "\u2014", tagText: data.RSI_STATUS || "", tagStyle: rsiTagStyle(data.RSI_VALUE)},
    {label: "MA5", value: data.MA5_VALUE || "\u2014"},
    {label: "MA10", value: data.MA10_VALUE || "\u2014"},
    {label: "MA20", value: data.MA20_VALUE || "\u2014"},
  ]),
  '</table>',
  '<div style="' + css.dashSub + '">\u5E03\u6797\u5E26 BOLL</div>',
  '<table style="' + css.dashTbl + '">',
  dashRowHTML([
    {label: "\u4E0A\u8F68", value: data.BOLL_UPPER || "\u2014"},
    {label: "\u4E2D\u8F68", value: data.BOLL_MID || "\u2014"},
    {label: "\u4E0B\u8F68", value: data.BOLL_LOWER || "\u2014"},
    {label: "\u4F4D\u7F6E", value: data.BOLL_POSITION || "\u2014", tagText: data.BOLL_ASSESSMENT || "", tagStyle: "color:#888"},
  ]),
  '</table>',
  '<div style="' + css.dashSub + '">MACD</div>',
  '<table style="' + css.dashTbl + '">',
  dashRowHTML([
    {label: "DIF", value: data.MACD_DIF || "\u2014", tagText: data.MACD_STATUS || "", tagStyle: macdTagStyle},
    {label: "DEA", value: data.MACD_DEA || "\u2014"},
    {label: "\u67F1\u503C", value: data.MACD_VALUE || "\u2014"},
    {label: "\u5747\u7EBF\u5F62\u6001", value: data.MA_ALIGNMENT || "\u2014"},
  ]),
  '</table></div>'
].join("");

// ====== CONCLUSION CARD ======
var conclDirection = data.BIAS_DIRECTION || "";
var biasBull = conclDirection && (conclDirection.indexOf("\u504F\u591A") >= 0 || conclDirection.indexOf("\u591A") >= 0);
var biasBear = conclDirection && (conclDirection.indexOf("\u504F\u7A7A") >= 0 || conclDirection.indexOf("\u7A7A") >= 0);
var conclTag = biasBull ? stag(conclDirection, "tagBull") : biasBear ? stag(conclDirection, "tagBear") : stag(conclDirection, "tagNeutral");

var conclusionCard = [
  '<div style="' + css.conclBox + '">',
  '<div style="' + css.conclTitle + '">\u270D \u4ECA\u65E5\u89C2\u70B9</div>',
  '<p style="margin:6px 0"><span style="' + css.conclLabel + '">\u65B9\u5411\uFF1A</span>' + conclTag + '</p>',
  '<p style="margin:6px 0"><span style="' + css.conclLabel + '">\u533A\u95F4\uFF1A</span><span style="' + css.conclVal + '">' + (data.BIAS_RANGE || "\u2014") + '</span></p>',
  '<p style="margin:6px 0"><span style="' + css.conclLabel + '">\u4F9D\u636E\uFF1A</span><span style="' + css.conclVal + '">' + (data.BIAS_REASON || "\u2014") + '</span></p>',
  '<p style="margin:6px 0"><span style="' + css.conclLabel + '">\u7B56\u7565\uFF1A</span><span style="' + css.conclVal + '">' + (data.BIAS_STRATEGY || "\u2014") + '</span></p>',
  '</div>'
].join("");

// ====== REPLACE PLACEHOLDERS ======
article = article.split("<!--PRICE_CARDS-->").join(heroBanner + "\n" + intlCard + "\n" + domCard);
article = article.split("<!--TECH_DASHBOARD-->").join(techDashboard);
article = article.split("<!--CONCLUSION_CARD-->").join(conclusionCard);

// ====== MARKDOWN TO HTML (WeChat-safe) ======
function processBold(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong style="' + css.strong + '">$1</strong>');
}

function md2html(md) {
  var outLines = [];
  var rawLines = md.split("\n");
  for (var i = 0; i < rawLines.length; i++) {
    var line = rawLines[i];
    var t = line.trim();
    var m;
    if (/^<[a-zA-Z]/.test(t)) { outLines.push(line); continue; }
    if (/^(?:#\S+\s*)+$/.test(t)) {
      outLines.push(t.replace(/#(\S+)/g, '<span style="' + css.tag + '">#$1</span>'));
      continue;
    }
    if (t === "") { outLines.push(""); continue; }
    if (/^---$/.test(t)) { outLines.push('<hr style="' + css.divider + '">'); continue; }
    if ((m = t.match(/^### (.+)$/))) { outLines.push('<h3 style="' + css.h3 + '">' + processBold(m[1]) + "</h3>"); continue; }
    if ((m = t.match(/^## (.+)$/))) { outLines.push('<h2 style="' + css.h2 + '">' + processBold(m[1]) + "</h2>"); continue; }
    if ((m = t.match(/^# (.+)$/))) { outLines.push('<h1 style="' + css.h1 + '">' + processBold(m[1]) + "</h1>"); continue; }
    if ((m = t.match(/^> (.+)$/))) { outLines.push('<blockquote style="' + css.bq + '">' + processBold(m[1]) + "</blockquote>"); continue; }
    if ((m = t.match(/^[-\\d]+\.?\\s+(.+)$/))) { outLines.push('<li style="' + css.li + '">' + processBold(m[1]) + "</li>"); continue; }
    var proc = processBold(line);
    if (!/^<[a-zA-Z]/.test(proc.trim())) {
      outLines.push('<p style="' + css.p + '">' + proc + "</p>");
    } else {
      outLines.push(proc);
    }
  }
  return outLines.join("\n");
}

var htmlBody = md2html(article);
htmlBody += '<div style="' + css.footer + '">\u6280\u672F\u6790\u91D1 \u00B7 \u6BCF\u65E508:00\u66F4\u65B0 \u00B7 \u6570\u636E\u6765\u6E90\uFF1A\u91D1\u5341\u6570\u636E/COMEX</div>';

// Full HTML wrapper
var fullHtml = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">\n<title>' + (data.SPOT_PRICE ? D + data.SPOT_PRICE + ' ' : '') + '\u4ECA\u65E5\u91D1\u4EF7 | \u6280\u672F\u6790\u91D1</title>\n</head>\n<body style="padding:8px 12px 30px;max-width:100%;background:#fff;font-family:-apple-system,sans-serif">\n' + htmlBody + '\n</body>\n</html>';

var outPath = path.join(outDir, "article_" + today + ".html");
fs.writeFileSync(outPath, fullHtml, "utf-8");
console.log("HTML article written to: " + outPath);

var txtPath = path.join(outDir, "article_" + today + ".txt");
fs.writeFileSync(txtPath, htmlBody.replace(/<[^>]*>/g, ""), "utf-8");
console.log("TXT article written to: " + txtPath);
