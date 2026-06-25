/**
 * 黄金文章生成器 v6.0 — 美学升级版
 * 深蓝+金色配色 · Hero报价区 · 阴影卡片 · 渐变分隔
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

// ====== MODERN DESIGN SYSTEM ======
// Palette: Deep navy headers, gold accents, white cards, subtle shadows
const css = {
  // Page-level
  body: "max-width:100%;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  
  // Hero section
  heroBox: "background:linear-gradient(135deg,#1a2332 0%,#2d3f54 100%);padding:24px 18px 20px;margin:0 0 20px;text-align:center",
  heroLabel: "font-size:12px;color:#8899aa;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px",
  heroPrice: "font-size:36px;font-weight:800;color:#fff;line-height:1.1;margin:0",
  heroChange: "display:inline-block;padding:3px 12px;border-radius:12px;font-size:14px;font-weight:600;margin:8px 0 0",
  heroSub: "font-size:12px;color:#8899aa;margin:10px 0 0;line-height:1.6",
  
  // Section headers
  h2: "font-size:17px;font-weight:700;color:#1a2332;margin:28px 0 14px;padding-bottom:10px;border-bottom:3px solid #c8963e;display:flex;align-items:center;gap:8px",
  h2Icon: "display:inline-block;width:6px;height:18px;background:#c8963e;border-radius:3px;margin-right:2px",
  h3: "font-size:15px;font-weight:600;color:#2d3f54;margin:18px 0 8px",
  
  // Cards
  card: "background:#fff;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.06);padding:18px 16px;margin:16px 0",
  cardTitle: "font-size:14px;font-weight:700;color:#1a2332;margin:0 0 14px;padding-bottom:10px;border-bottom:2px solid #f0f0f0;display:flex;align-items:center;gap:6px",
  cardTitleAccent: "display:inline-block;width:4px;height:14px;background:#c8963e;border-radius:2px",
  
  // Tables
  tbl: "width:100%;border-collapse:collapse;font-size:13px",
  th: "background:#f5f6f8;color:#5a6a7a;font-weight:600;padding:9px 6px;text-align:center;font-size:11px;border-bottom:2px solid #e8eaed",
  td: "padding:10px 6px;text-align:center;font-size:13px;color:#333;border-bottom:1px solid #f0f1f3",
  tdName: "padding:10px 6px;text-align:left;font-size:12px;color:#5a6a7a;font-weight:600;border-bottom:1px solid #f0f1f3",
  tdPrice: "padding:10px 6px;text-align:center;font-size:15px;font-weight:700;color:#1a2332;border-bottom:1px solid #f0f1f3",
  trAlt: "background:#fafbfc",
  
  // Colors
  up: "color:#00a854;font-weight:700",
  down: "color:#e60012;font-weight:700",
  flat: "color:#999",
  
  // Dashboard
  dashBox: "background:#fff;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.06);padding:18px 16px;margin:16px 0",
  dashTitle: "font-size:14px;font-weight:700;color:#1a2332;margin:0 0 16px;padding-bottom:10px;border-bottom:2px solid #f0f0f0",
  dashRow: "display:flex;gap:10px;margin:0 0 14px",
  dashCol: "flex:1;background:#f8f9fb;border-radius:8px;padding:10px 8px;text-align:center",
  dashColLabel: "font-size:10px;color:#8899aa;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px",
  dashColValue: "font-size:16px;font-weight:700;color:#1a2332;margin:0",
  dashColTag: "display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-top:6px",
  dashSub: "font-size:13px;font-weight:600;color:#2d3f54;margin:16px 0 8px;padding:4px 8px;border-left:3px solid #c8963e",
  dashTbl: "width:100%;border-collapse:collapse;font-size:12px;margin:0 0 6px",
  dashTh: "background:#f5f6f8;color:#5a6a7a;font-weight:600;padding:7px 4px;text-align:center;font-size:10px;border-bottom:2px solid #e8eaed",
  dashTd: "padding:8px 4px;text-align:center;font-size:12px;color:#333;border-bottom:1px solid #f0f1f3",
  dashTdN: "padding:8px 4px;text-align:left;font-size:11px;color:#5a6a7a;font-weight:600;border-bottom:1px solid #f0f1f3",
  dashTdV: "padding:8px 4px;text-align:center;font-size:14px;font-weight:700;color:#1a2332;border-bottom:1px solid #f0f1f3",
  
  // Tags
  tagBull: "display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700;color:#fff;background:#00a854",
  tagBear: "display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700;color:#fff;background:#e60012",
  tagWarn: "display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700;color:#fff;background:#e67e22",
  tagNeutral: "display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700;color:#fff;background:#8899aa",
  
  // Conclusion
  conclBox: "background:linear-gradient(135deg,#f8f9fb,#eef1f5);border-left:4px solid #c8963e;border-radius:0 10px 10px 0;padding:18px 16px;margin:20px 0",
  conclTitle: "font-size:14px;font-weight:700;color:#1a2332;margin:0 0 12px",
  conclRow: "display:flex;align-items:baseline;margin:6px 0;gap:8px",
  conclLabel: "font-size:11px;color:#8899aa;min-width:36px;flex-shrink:0",
  conclVal: "font-size:14px;font-weight:600;color:#1a2332",
  conclBull: "font-size:14px;font-weight:700;color:#00a854",
  conclBear: "font-size:14px;font-weight:700;color:#e60012",
  
  // Dividers
  divider: "height:1px;background:linear-gradient(90deg,transparent,#e8eaed,transparent);margin:24px 0",
  
  // Misc
  p: "font-size:15px;color:#333;line-height:1.85;margin:10px 0",
  bq: "background:#f8f9fb;border-left:4px solid #c8963e;padding:12px 16px;margin:14px 0;font-size:14px;color:#5a6a7a;line-height:1.8;border-radius:0 8px 8px 0",
  strong: "font-weight:700;color:#c8963e",
  li: "font-size:14px;color:#333;line-height:1.85;margin:6px 0 6px 16px;position:relative",
  footer: "text-align:center;color:#8899aa;font-size:12px;margin-top:30px;padding-top:18px",
  tag: "display:inline-block;background:#f5f6f8;color:#5a6a7a;padding:3px 10px;margin:3px;font-size:12px;border-radius:12px",
};

function el(tag, style, text) {
  return "<" + tag + ' style="' + css[style] + '">' + text + "</" + tag + ">";
}
function td(text, style) { return el("td", style, text); }
function stag(text, cls) { return '<span style="' + css[cls] + '">' + text + '</span>'; }
function div(style, text) { return el("div", style, text); }

function isBullish(s) {
  if (!s) return null;
  if (/多|涨|反弹|金叉|支撑|偏多|bull|上穿/.test(s) && !/空|跌|回调|死叉|压力|偏空|bear|下穿/.test(s)) return true;
  if (/空|跌|回调|死叉|压力|偏空|bear|下穿/.test(s) && !/多|涨|反弹|金叉|支撑|偏多|bull|上穿/.test(s)) return false;
  return null;
}


// ====== PHASE 2: HERO BANNER ======
const gcUp = data.SPOT_CHANGE && data.SPOT_CHANGE.startsWith("+");
const gcDn = data.SPOT_CHANGE && data.SPOT_CHANGE.startsWith("-");
const changeBg = gcUp ? "#00a854" : gcDn ? "#e60012" : "#8899aa";
const changeIcon = gcUp ? "\u25B2" : gcDn ? "\u25BC" : "\u2014";

const heroBanner = [
  '<div style="' + css.heroBox + '">',
  '<p style="' + css.heroLabel + '">XAU/USD \u73B0\u8D27\u9EC4\u91D1 \u00B7 ' + (data.DATE_CN || "") + '</p>',
  '<p style="' + css.heroPrice + '">' + D + (data.SPOT_PRICE || "\u2014") + '</p>',
  '<div style="margin:8px 0">',
    '<span style="' + css.heroChange + ';background:' + changeBg + '">' + changeIcon + ' ' + (data.SPOT_CHANGE || "0.00%") + '</span>',
    '&nbsp;',
    '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;color:#8899aa;background:#f5f5f5">COMEX ' + (data.COMEX_MONTH || "") + ' ' + D + (data.COMEX_PRICE || "\u2014") + '</span>',
  '</div>',
  '<p style="' + css.heroSub + '">\u65E5\u5185 ' + D + (data.DAY_LOW || "\u2014") + ' \u2014 ' + D + (data.DAY_HIGH || "\u2014") + ' | \u62A5\u4EF7\u65F6\u95F4 ' + (data.QUOTE_TIME || "") + '</p>',
  '</div>'
].join("");

// ====== PHASE 2: PRICE CARDS ======

// --- International Card ---
function priceRow(name, price, change, high, low, unit, isIntl) {
  const chUp = change && change.startsWith("+");
  const chDn = change && change.startsWith("-");
  const chCls = chUp ? css.up : chDn ? css.down : css.flat;
  const chSym = chUp ? "\u25B2" : chDn ? "\u25BC" : "";
  return '<tr style="' + (priceRow._idx++ % 2 === 0 ? "" : css.trAlt) + '">' +
    td(name, "tdName") +
    '<td style="' + css.tdPrice + '">' + (isIntl ? D : "") + (price || "\u2014") + '</td>' +
    '<td style="' + css.td + '"><span style="' + chCls + '">' + chSym + (change || "\u2014") + '</span></td>' +
    '<td style="' + css.td + '">' + (high || "\u2014") + '</td>' +
    '<td style="' + css.td + '">' + (low || "\u2014") + '</td>' +
    '<td style="' + css.td + '">' + (unit || "") + '</td>' +
    '</tr>';
}
priceRow._idx = 0;

const intlCard = [
  '<div style="' + css.card + '">',
  '<div style="' + css.cardTitle + '"><span style="' + css.cardTitleAccent + '"></span>\u56FD\u9645\u5E02\u573A\u62A5\u4EF7</div>',
  '<table style="' + css.tbl + '">',
  '<tr><th style="' + css.th + '">\u54C1\u79CD</th><th style="' + css.th + '">\u6700\u65B0\u4EF7</th><th style="' + css.th + '">\u6DA8\u8DCC\u5E45</th><th style="' + css.th + '">\u6700\u9AD8\u4EF7</th><th style="' + css.th + '">\u6700\u4F4E\u4EF7</th><th style="' + css.th + '">\u5355\u4F4D</th></tr>',
  priceRow("\u56FD\u9645\u91D1\u4EF7", data.SPOT_PRICE, data.SPOT_CHANGE, data.DAY_HIGH, data.DAY_LOW, "\u7F8E\u5143/\u76CE\u53F8", true),
  priceRow("\u56FD\u9645\u94F6\u4EF7", data.SILVER_PRICE, data.SILVER_CHANGE, data.SILVER_HIGH || data.SILVER_PRICE, data.SILVER_LOW || data.SILVER_PRICE, "\u7F8E\u5143/\u76CE\u53F8", true),
  priceRow("\u56FD\u9645\u94AF\u91D1", data.PALLADIUM_PRICE, data.PD_CHANGE || "\u2014", data.PD_HIGH, data.PD_LOW, "\u7F8E\u5143/\u76CE\u53F8", true),
  priceRow("\u56FD\u6807\u94C2\u91D1", data.PLATINUM_PRICE, data.PT_CHANGE || "\u2014", data.PT_HIGH, data.PT_LOW, "\u7F8E\u5143/\u76CE\u53F8", true),
  '</table></div>'
].join("");

priceRow._idx = 0;

// --- Domestic Card ---
const domCard = [
  '<div style="' + css.card + '">',
  '<div style="' + css.cardTitle + '"><span style="' + css.cardTitleAccent + '"></span>\u56FD\u5185\u5E02\u573A\u62A5\u4EF7</div>',
  '<table style="' + css.tbl + '">',
  '<tr><th style="' + css.th + '">\u54C1\u79CD</th><th style="' + css.th + '">\u6700\u65B0\u4EF7</th><th style="' + css.th + '">\u6DA8\u8DCC\u5E45</th><th style="' + css.th + '">\u6700\u9AD8\u4EF7</th><th style="' + css.th + '">\u6700\u4F4E\u4EF7</th><th style="' + css.th + '">\u5355\u4F4D</th></tr>',
  priceRow("\u56FD\u5185\u91D1\u4EF7", data.DOMESTIC_GOLD, data.DOMESTIC_CHANGE || "\u2014", data.DOMESTIC_GOLD, data.DOMESTIC_GOLD, "\u4EBA\u6C11\u5E01/\u514B", false),
  priceRow("\u56FD\u5185\u94F6\u4EF7", data.DOMESTIC_SILVER, "\u2014", data.DOMESTIC_SILVER, data.DOMESTIC_SILVER, "\u4EBA\u6C11\u5E01/\u514B", false),
  priceRow("\u6295\u8D44\u91D1\u6761", data.INVEST_BAR, "\u2014", data.INVEST_BAR, data.INVEST_BAR, "\u4EBA\u6C11\u5E01/\u514B", false),
  priceRow("\u9EC4\u91D1\u56DE\u6536", data.RECOVERY_PRICE, "\u2014", data.RECOVERY_PRICE, data.RECOVERY_PRICE, "\u4EBA\u6C11\u5E01/\u514B(\u8DB3\u91D1999)", false),
  priceRow("\u79EF\u5B58\u91D1", data.SAVING_GOLD_HIGH ? (data.SAVING_GOLD_LOW || data.SAVING_GOLD_HIGH) + "\u2014" + (data.SAVING_GOLD_HIGH || "") : "\u2014", "\u2014", data.SAVING_GOLD_HIGH || "\u2014", data.SAVING_GOLD_LOW || "\u2014", "\u4EBA\u6C11\u5E01/\u514B", false),
  '</table></div>'
].join("");

// ====== PHASE 3: TECH DASHBOARD ======
const dash = data;

function dashRowHTML(cols) {
  return '<div style="' + css.dashRow + '">' + cols.map(function(c) {
    var tagHtml = c.tagText ? '<div style="' + css.dashColTag + ';' + (c.tagStyle || "") + '">' + c.tagText + '</div>' : "";
    return '<div style="' + css.dashCol + '">' +
      '<p style="' + css.dashColLabel + '">' + c.label + '</p>' +
      '<p style="' + css.dashColValue + '">' + c.value + '</p>' +
      tagHtml +
      '</div>';
  }).join("") + '</div>';
}

const rsiTagStyle = function(s) {
  if (!s || s.indexOf("\u5F85")>=0) return "background:#f0f0f0;color:#8899aa";
  var v = parseFloat(s);
  if (isNaN(v)) return "background:#f0f0f0;color:#8899aa";
  if (v >= 70) return "background:#fff0f0;color:#e60012";
  if (v <= 30) return "background:#f0fff0;color:#00a854";
  return "background:#f5f6f8;color:#5a6a7a";
};

const techDashboard = [
  '<div style="' + css.dashBox + '">',
  '<div style="' + css.dashTitle + '">\u6280\u672F\u4E00\u89C8\u8868</div>',
  
  // Row 1: RSI + MA5 + MA10 + MA20
  dashRowHTML([
    {label:"RSI(14)", value:data.RSI_VALUE||"\u2014", tagText:data.RSI_STATUS||"", tagStyle:rsiTagStyle(data.RSI_VALUE)},
    {label:"MA5", value:data.MA5_VALUE||"\u2014", tagText:parseFloat(data.MA5_VALUE)>parseFloat(data.SPOT_PRICE)?"\u4EF7\u4E0BMA5":parseFloat(data.MA5_VALUE)<parseFloat(data.SPOT_PRICE)?"\u4EF7\u4E0AMA5":"", tagStyle:"background:#fff0f0;color:#e60012"},
    {label:"MA10", value:data.MA10_VALUE||"\u2014"},
    {label:"MA20", value:data.MA20_VALUE||"\u2014"},
  ]),
  
  // Row 2: BOLL
  '<div style="' + css.dashSub + '">\u5E03\u6797\u5E26\uff08BOLL\uff09</div>',
  dashRowHTML([
    {label:"\u4E0A\u8F68", value:data.BOLL_UPPER||"\u2014", tagText:data.BOLL_ASSESSMENT||"", tagStyle:"background:#f5f6f8;color:#5a6a7a"},
    {label:"\u4E2D\u8F68", value:data.BOLL_MID||"\u2014"},
    {label:"\u4E0B\u8F68", value:data.BOLL_LOWER||"\u2014"},
    {label:"\u4F4D\u7F6E", value:data.BOLL_POSITION||"\u2014"},
  ]),
  
  // Row 3: MACD
  '<div style="' + css.dashSub + '">MACD</div>',
  dashRowHTML([
    {label:"DIF", value:data.MACD_DIF||"\u2014", tagText:data.MACD_STATUS||"", tagStyle:isBullish(data.MACD_STATUS)===true?"background:#e6f9f0;color:#00a854":isBullish(data.MACD_STATUS)===false?"background:#fff0f0;color:#e60012":"background:#f5f6f8;color:#5a6a7a"},
    {label:"DEA", value:data.MACD_DEA||"\u2014"},
    {label:"\u67F1\u503C", value:data.MACD_VALUE||"\u2014"},
    {label:"\u5747\u7EBF\u5F62\u6001", value:data.MA_ALIGNMENT||"\u2014"},
  ]),
  '</div>'
].join("");

// ====== CONCLUSION CARD ======
const conclDirection = data.BIAS_DIRECTION || "";
const biasBull = conclDirection && (conclDirection.indexOf("\u504F\u591A")>=0 || conclDirection.indexOf("\u591A")>=0);
const biasBear = conclDirection && (conclDirection.indexOf("\u504F\u7A7A")>=0 || conclDirection.indexOf("\u7A7A")>=0);
const conclTag = biasBull ? stag(conclDirection, "tagBull") : biasBear ? stag(conclDirection, "tagBear") : stag(conclDirection, "tagNeutral");

const conclusionCard = [
  '<div style="' + css.conclBox + '">',
  '<div style="' + css.conclTitle + '">\u270D \u4ECA\u65E5\u89C2\u70B9</div>',
  '<div style="' + css.conclRow + '"><span style="' + css.conclLabel + '">\u65B9\u5411</span>' + conclTag + '</div>',
  '<div style="' + css.conclRow + '"><span style="' + css.conclLabel + '">\u533A\u95F4</span><span style="' + css.conclVal + '">' + (data.BIAS_RANGE || "\u2014") + '</span></div>',
  '<div style="' + css.conclRow + '"><span style="' + css.conclLabel + '">\u4F9D\u636E</span><span style="' + css.conclVal + '">' + (data.BIAS_REASON || "\u2014") + '</span></div>',
  '<div style="' + css.conclRow + '"><span style="' + css.conclLabel + '">\u7B56\u7565</span><span style="' + css.conclVal + '">' + (data.BIAS_STRATEGY || "\u2014") + '</span></div>',
  '</div>'
].join("");

// ====== PHASE 4: REPLACE PLACEHOLDERS + OUTPUT ======
article = article.split("<!--PRICE_CARDS-->").join(heroBanner + "\n" + intlCard + "\n" + domCard);
article = article.split("<!--TECH_DASHBOARD-->").join(techDashboard);
article = article.split("<!--CONCLUSION_CARD-->").join(conclusionCard);

// Simple markdown-to-HTML conversion for the remaining markdown in the article
// Smart markdown-to-HTML: line-by-line to avoid CSS # collision
// Smart markdown-to-HTML: bold processed first, then block-level elements
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
    // Skip already-HTML lines
    if (/^<[a-zA-Z]/.test(t)) { outLines.push(line); continue; }
    // SEO hashtag line
    if (/^(?:#\S+\s*)+$/.test(t)) {
      outLines.push(t.replace(/#(\S+)/g, '<span style="' + css.tag + '">#$1</span>'));
      continue;
    }
    // Empty line
    if (t === "") { outLines.push(""); continue; }
    // HR
    if (/^---$/.test(t)) { outLines.push('<div style="' + css.divider + '"></div>'); continue; }
    // Headers (with bold processed)
    if ((m = t.match(/^### (.+)$/))) { outLines.push('<h3 style="' + css.h3 + '">' + processBold(m[1]) + "</h3>"); continue; }
    if ((m = t.match(/^## (.+)$/))) { outLines.push('<h2 style="' + css.h2 + '">' + processBold(m[1]) + "</h2>"); continue; }
    if ((m = t.match(/^# (.+)$/))) { outLines.push('<h1 style="font-size:20px;font-weight:800;color:#1a2332;margin:20px 0 14px;text-align:center">' + processBold(m[1]) + "</h1>"); continue; }
    // Blockquote (bold processed inside)
    if ((m = t.match(/^> (.+)$/))) { outLines.push('<blockquote style="' + css.bq + '">' + processBold(m[1]) + "</blockquote>"); continue; }
    // List items (both - and numbered)
    if ((m = t.match(/^[-\d]+\.?\s+(.+)$/))) {
      outLines.push('<li style="' + css.li + '">' + processBold(m[1]) + "</li>");
      continue;
    }
    // Regular paragraph with bold
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

// Footer
var footer = '<div style="' + css.footer + '">\u6280\u672F\u6790\u91D1 \u00B7 \u6BCF\u65E508:00\u66F4\u65B0 \u00B7 \u6570\u636E\u6765\u6E90\uFF1A\u91D1\u5341\u6570\u636E/COMEX</div>';
htmlBody += footer;

// Full HTML document wrapper
var fullHtml = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">\n<title>' + (data.SPOT_PRICE ? D + data.SPOT_PRICE + ' ' : '') + '\u4ECA\u65E5\u91D1\u4EF7 | \u6280\u672F\u6790\u91D1</title>\n<style>\nbody{margin:0;padding:0;' + css.body + '}\nimg{max-width:100%;height:auto}\n</style>\n</head>\n<body style="padding:0 16px 30px">\n' + htmlBody + '\n</body>\n</html>';

var outPath = path.join(outDir, "article_" + today + ".html");
fs.writeFileSync(outPath, fullHtml, "utf-8");
console.log("HTML article written to: " + outPath);

// Also output plain text version for WeChat
var txtPath = path.join(outDir, "article_" + today + ".txt");
fs.writeFileSync(txtPath, htmlBody, "utf-8");
console.log("TXT article written to: " + txtPath);
