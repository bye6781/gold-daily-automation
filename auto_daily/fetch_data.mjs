/**
 * 黄金日更数据抓取脚本 v2.0
 * 数据源: 金十数据 (jin10.com) 现货行情 + Yahoo Finance COMEX期货
 * 每天 8:00 由 Windows 任务计划触发
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = __dirname;
const TODAY = new Date();
const DATE_STR = TODAY.toISOString().split('T')[0];

console.log('[' + new Date().toLocaleString() + '] 开始抓取黄金数据...');

// Chromium path: env var → auto-detect by Playwright
const chromiumPath = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({
  headless: true,
  ...(chromiumPath ? { executablePath: chromiumPath } : {}),
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

// ========== 1. 金十数据: 现货黄金 (XAU/USD) + 美元指数 + 新闻 ==========
var usdCny = 7.28;
console.log('正在抓取 金十数据 (jin10.com)...');
const j10Page = await browser.newPage();
let jin10Data = { spotPrice: '', spotChange: '', spotChangePct: '', dxy: '', news: [] };

try {
  await j10Page.goto('https://www.jin10.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 8000));

  const jin10BodyText = await j10Page.evaluate(() => document.body.innerText); jin10Data = await j10Page.evaluate(() => {
    const body = document.body.innerText;
    const result = { spotPrice: '', spotChange: '', spotChangePct: '', dxy: '', silverPrice: '', silverChangePct: '', news: [], importantEvents: [], weeklyOutlook: '' };

    // 解析 现货黄金: "现货黄金\n4155.74\n-1.25%"
    const goldSection = body.match(/现货黄金\s+([\d,]+\.\d{2})\s+([+-][\d.]+%)/);
    if (goldSection) {
      result.spotPrice = goldSection[1].replace(/,/g, '');
      result.spotChangePct = goldSection[2];
    }

    // 现货黄金涨跌额
    const changeSection = body.match(/现货黄金[\s\S]{0,100}?([+-][\d,]+\.\d{2})/);
    // more robust: find the change value before the %
    const changeLines = body.split('\n');
    for (let i = 0; i < changeLines.length; i++) {
      if (changeLines[i].trim() === '现货黄金' && i + 2 < changeLines.length) {
        const pctLine = changeLines[i + 2].trim();
        const pctMatch = pctLine.match(/^([+-][\d.]+%)$/);
        if (pctMatch) result.spotChangePct = pctMatch[1];
      }
    }

    // 美元指数
    // 现货白银
    const silverSection = body.match(/现货白银\s+([\d,]+\.\d{3})\s+([+-][\d.]+%)/);
    if (silverSection) {
      result.silverPrice = silverSection[1].replace(/,/g, '');
      result.silverChangePct = silverSection[2];
    }

    // 美元指数
    const dxyMatch = body.match(/美元指数\s+([\d,]+\.\d{3})/);
    if (dxyMatch) result.dxy = dxyMatch[1].replace(/,/g, '');

    // 金十新闻头条 (取前3条，去前缀，取完整句)
    const newsLines = body.split('\n');
    let newsCount = 0;
    for (let i = 0; i < newsLines.length && newsCount < 3; i++) {
      const line = newsLines[i].trim();
      if (line.match(/^金十数据\d+月\d+日讯/)) {
        // 去掉"金十数据X月X日讯，"前缀
        let clean = line.replace(/^金十数据\d+月\d+日讯[，,]?\s*/, '');
        // 取到第一个句号或80字
        const periodIdx = clean.search(/[。！？]/);
        if (periodIdx > 10) clean = clean.substring(0, periodIdx + 1);
        else if (clean.length > 80) clean = clean.substring(0, 80) + '…';
        result.news.push(clean);
        newsCount++;
      }
    }


    // 重要事件 (Important News) - 取前5条
    const impLines = body.split('\n');
    let inImp = false;
    for (let i = 0; i < impLines.length && result.importantEvents.length < 5; i++) {
      const line = impLines[i].trim();
      if (line === '重要事件' || line === 'Important News') { inImp = true; continue; }
      if (inImp && /^\d{2}$/.test(line) && i + 1 < impLines.length) {
        result.importantEvents.push(impLines[i + 1].trim().substring(0, 80));
      }
      if (inImp && (line === '市场快讯' || line.includes('VIP'))) break;
    }

    // 一周展望
    for (let i = 0; i < impLines.length; i++) {
      if (impLines[i].includes('一周展望') && impLines[i].includes('黄金')) {
        result.weeklyOutlook = impLines[i].trim().substring(0, 100);
        break;
      }
    }

    return result;
  });
  console.log('金十数据:', JSON.stringify({ spotPrice: jin10Data.spotPrice, spotChangePct: jin10Data.spotChangePct, dxy: jin10Data.dxy, newsCount: jin10Data.news.length }, null, 2));
  // USD/CNY from jin10 page text (live rate)
  usdCny = 7.28;
  const usdCnyMatch = (jin10BodyText || "").match(/美元人民币s+([d.]+)/);
  if (usdCnyMatch) {
    usdCny = parseFloat(usdCnyMatch[1]);
    console.log("USD/CNY from jin10: " + usdCny);
  } else {
    usdCny = Math.round((7.30 - (dxy - 100) * 0.02) * 100) / 100;
    console.log("USD/CNY estimated from DXY: " + usdCny);
  }
} catch (e) {
  console.log('金十数据抓取失败:', e.message);
}


await j10Page.close();

// ========== 2. Yahoo Finance: COMEX 期货 (GC=F) ==========
console.log('正在抓取 Yahoo Finance COMEX...');
const yfPage = await browser.newPage();
let yfData = { comexPrice: '', change: '', dayLow: '', dayHigh: '', comexMonth: 'Aug', bid: '', ask: '' };

try {
  await yfPage.goto('https://finance.yahoo.com/quote/GC=F/', {
    waitUntil: 'domcontentloaded',
    timeout: 20000
  });
  await new Promise(r => setTimeout(r, 5000));

  yfData = await yfPage.evaluate(() => {
    const body = document.body.innerText;
    const result = { comexPrice: '', change: '', dayLow: '', dayHigh: '', comexMonth: 'Aug', bid: '', ask: '' };

    const monthMatch = body.match(/Gold\s+(\w+)\s+(\d+)/);
    if (monthMatch) result.comexMonth = monthMatch[1];

    const lastMatch = body.match(/Last Price\s+([\d,]+\.\d{2})/);
    if (lastMatch) result.comexPrice = lastMatch[1];

    const rangeMatch = body.match(/Day.s Range\s+([\d,]+\.\d{2})\s*-\s*([\d,]+\.\d{2})/);
    if (rangeMatch) {
      result.dayLow = rangeMatch[1];
      result.dayHigh = rangeMatch[2];
    }

    const changeMatch = body.match(/([+-][\d,]+\.\d{2})\s+\(([+-]?\d+\.\d{2})%\)/);
    if (changeMatch) result.change = changeMatch[0];

    const bidMatch = body.match(/Bid\s+([\d,]+\.\d{2})/);
    if (bidMatch) result.bid = bidMatch[1];
    const askMatch = body.match(/Ask\s+([\d,]+\.\d{2})/);
    if (askMatch) result.ask = askMatch[1];


    return result;
  });
  console.log('Yahoo Finance COMEX:', JSON.stringify(yfData, null, 2));
} catch (e) {
  console.log('Yahoo Finance 抓取失败:', e.message);
}
await yfPage.close();

// ========== 2.5 Yahoo: 钯金 + 铂金 ==========
let metalsData = { palladium: '', platinum: '' };

try {
  const pdPage = await browser.newPage();
  // 钯金抓取带重试
  let pdEvalRetry = { price: '', low: '', high: '' };
  for (let retry = 0; retry < 3; retry++) {
    try {
      await pdPage.goto('https://finance.yahoo.com/quote/PA=F/', { waitUntil: 'domcontentloaded', timeout: 25000 });
      await new Promise(r => setTimeout(r, 4000));
      pdEvalRetry = await pdPage.evaluate(() => {
        const body = document.body.innerText;
        const lp = body.match(/(?:Last Price|Previous Close)\s+([\d,]+\.[\d]{2})/);
        const dr = body.match(/Day.s Range\s+([\d,]+\.[\d]{2})\s*-\s*([\d,]+\.[\d]{2})/);
        return { price: lp ? lp[1] : '', low: dr ? dr[1] : '', high: dr ? dr[2] : '' };
      });
      if (pdEvalRetry.price) break;
      console.log('钯金重试 ' + (retry + 1) + '/3...');
    } catch (e) { console.log('钯金重试 ' + (retry + 1) + ' 失败:', e.message); }
  }
  metalsData.palladium = pdEvalRetry.price;
  metalsData.pdLow = pdEvalRetry.low;
  metalsData.pdHigh = pdEvalRetry.high;
  await pdPage.close();
} catch (e) { console.log('钯金抓取失败:', e.message); }

// ========== 2.6 Yahoo: 铂金 ==========
try {
  const ptPage = await browser.newPage();
  await ptPage.goto('https://finance.yahoo.com/quote/PL=F/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  const ptEval = await ptPage.evaluate(() => {
    const body = document.body.innerText;
    const lp = body.match(/Last Price\s+([\d,]+\.\d{2})/);
    const dr = body.match(/Day.s Range\s+([\d,]+\.\d{2})\s*-\s*([\d,]+\.\d{2})/);
    return { price: lp ? lp[1] : '', low: dr ? dr[1] : '', high: dr ? dr[2] : '' };
  });
  metalsData.platinum = ptEval.price;
  metalsData.ptLow = ptEval.low;
  metalsData.ptHigh = ptEval.high;
  await ptPage.close();
} catch (e) { console.log('铂金抓取失败:', e.message); }

console.log('钯金/铂金:', JSON.stringify(metalsData));

// ========== 2.7 Yahoo: SI=F (silver high/low) ==========
let silverHL = { low: "", high: "" };
try {
  const siPage = await browser.newPage();
  await siPage.goto("https://finance.yahoo.com/quote/SI=F/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  silverHL = await siPage.evaluate(() => {
    const body = document.body.innerText;
    const dr = body.match(/Day.s Range\s+([d,]+\.\d{2,3})\s*-\s*([d,]+\.\d{2,3})/);
    return { low: dr ? dr[1] : "", high: dr ? dr[2] : "" };
  });
  await siPage.close();
  console.log("SI=F high/low:", JSON.stringify(silverHL));
} catch (e) { console.log("SI=F fail:", e.message); }

await browser.close();

// ========== 3. 动态生成本周关注要点 ==========
function generateWeekEvents(jin10) {
  const events = [];
  
  // 从金十"重要事件"提取主题
  const allEvents = [...(jin10.importantEvents || [])];
  const themes = [];
  
  for (const evt of allEvents) {
    if (evt.includes('美联储') || evt.includes('利率') || evt.includes('PCE') || evt.includes('CPI') || evt.includes('鲍威尔')) {
      if (!themes.find(t => t.text.includes('美联储'))) themes.push({ text: '美联储政策动向及经济数据（PCE、官员讲话）', prio: 2 });
    }
    if (evt.includes('伊朗') || evt.includes('美伊') || evt.includes('中东') || evt.includes('黎巴嫩') || evt.includes('停火') || evt.includes('谈判')) {
      if (!themes.find(t => t.text.includes('地缘'))) themes.push({ text: '美伊谈判进展与中东地缘局势变化', prio: 1 });
    }
    if (evt.includes('美元') || evt.includes('汇率') || evt.includes('DXY')) {
      if (!themes.find(t => t.text.includes('美元'))) themes.push({ text: '美元指数走势及人民币汇率波动', prio: 3 });
    }
    if (evt.includes('黄金') || evt.includes('ETF') || evt.includes('央行') || evt.includes('购金')) {
      if (!themes.find(t => t.text.includes('黄金'))) themes.push({ text: '全球央行购金及黄金ETF资金流向', prio: 4 });
    }
    if ((evt.includes('原油') || evt.includes('石油') || evt.includes('能源') || evt.includes('欧佩克') || evt.includes('OPEC')) && !themes.find(t => t.text.includes('原油'))) {
      themes.push({ text: '原油价格波动及其对通胀预期的影响', prio: 5 });
    }
  }

  // 从一周展望提取补充
  if (jin10.weeklyOutlook) {
    const outlook = jin10.weeklyOutlook;
    if (outlook.includes('美联储') || outlook.includes('PCE')) {
      const existing = themes.find(t => t.text.includes('美联储'));
      if (existing) existing.text = '美联储官员讲话及PCE通胀数据（市场关注焦点）';
    }
    if (outlook.includes('黄金') && !themes.find(t => t.text.includes('关键'))) {
      themes.push({ text: '黄金技术面关键支撑/压力位争夺', prio: 4 });
    }
  }

  // 按优先级排序
  themes.sort((a, b) => a.prio - b.prio);

  // 取前5个
  const maxItems = Math.min(themes.length, 5);
  for (let i = 0; i < maxItems; i++) {
    events.push('- ' + themes[i].text);
  }

  // 兜底
  if (events.length === 0) {
    events.push('- 关注美联储官员讲话及经济数据发布');
    events.push('- 关注美元指数及美债收益率变化');
    events.push('- 关注中东地缘事件最新进展');
  }

  // 附上金十数据一周展望原文
  if (jin10.weeklyOutlook) {
    const clean = jin10.weeklyOutlook.replace(/^一周展望[：:]?\s*/, '');
    events.push('> 📰 金十数据一周展望：' + clean);
  }

  return events.join('\\n');
}// ========== 3. 数据整合与计算 ==========
// 优先使用金十数据现货价，回退到 Yahoo
const spotPrice = parseFloat(jin10Data.spotPrice) || parseFloat((yfData.comexPrice || '4245').replace(/,/g, ''));
const comexPrice = yfData.comexPrice || spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
const spotChangePct = jin10Data.spotChangePct || '数据待更新';

// 美元兑人民币 (估算，优先从行情推算)
const dxy = parseFloat(jin10Data.dxy) || 100.7;

const gramPrice = spotPrice / 31.1035;
const rmbGram = Math.round(gramPrice * usdCny);

// 国内金价
const jewelryPrice = Math.round(gramPrice * usdCny * 1.35 / 10) * 10;
const recoveryPrice = Math.round(rmbGram * 0.98);
const savingGoldLow = rmbGram + 5;
const savingGoldHigh = rmbGram + 10;
// ========== 4. 日期 ==========
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
const dateCN = TODAY.getFullYear() + '年' + (TODAY.getMonth() + 1) + '月' + TODAY.getDate() + '日（周' + weekdays[TODAY.getDay()] + '）';

// ========== 5. 新闻摘要 ==========
const topNews = jin10Data.news.slice(0, 3).map(s => s.replace(/[。！？]$/, '')).join('；').replace(/；+/g, '；') || '国内金饰价格随国际金价波动';

// ========== 5.5 历史存储 & 均线 ==========
const HISTORY_FILE = path.join(OUTPUT_DIR, 'price_history.json');
var histData = [];
if (fs.existsSync(HISTORY_FILE)) {
  try { histData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')); } catch (e) {}
}
const todayRec = {
  date: DATE_STR, spotPrice: spotPrice,
  dayHigh: parseFloat((yfData.dayHigh || '').replace(/,/g, '')),
  dayLow: parseFloat((yfData.dayLow || '').replace(/,/g, '')),
  closePrice: spotPrice, dxy: dxy, usdCny: usdCny
};
var exIdx = histData.findIndex(function(h) { return h.date === DATE_STR; });
if (exIdx >= 0) histData[exIdx] = todayRec; else histData.push(todayRec);
if (histData.length > 60) histData = histData.slice(-60);
fs.writeFileSync(HISTORY_FILE, JSON.stringify(histData, null, 2), 'utf-8');
console.log('历史数据: ' + histData.length + ' 条记录');


function calcEMA(arr, days) {
  var sub = arr.slice(-Math.max(days * 3, days));
  if (sub.length < Math.min(days, 3)) return null;
  var k = 2 / (days + 1);
  var ema = sub[0].spotPrice;
  for (var i = 1; i < sub.length; i++) ema = sub[i].spotPrice * k + ema * (1 - k);
  return ema;
}
function calcBOLL(arr, period, mult) {
  var sub = arr.slice(-Math.max(period * 2, period));
  if (sub.length < Math.min(period, 3)) return { mid: null, upper: null, lower: null, width: null, position: null, assessment: '数据积累中' };
  var startIdx = Math.max(0, sub.length - period);
  var sum = 0;
  for (var i = startIdx; i < sub.length; i++) sum += sub[i].spotPrice;
  var mid = sum / (sub.length - startIdx);
  var sqSum = 0;
  for (var i = startIdx; i < sub.length; i++) sqSum += Math.pow(sub[i].spotPrice - mid, 2);
  var std = Math.sqrt(sqSum / (sub.length - startIdx));
  var upper = mid + mult * std;
  var lower = mid - mult * std;
  var width = ((upper - lower) / mid * 100);
  var lastPrice = sub[sub.length - 1].spotPrice;
  var position = ((lastPrice - lower) / (upper - lower) * 100);
  var assess;
  if (position > 80) assess = '价格逼近布林上轨，超买区域，警悴回调';
  else if (position < 20) assess = '价格逼近布林下轨，超卖区域，关注反弹';
  else if (position > 50) assess = '价格在布林中轨上方，偏强震荡';
  else assess = '价格在布林中轨下方，偏弱震荡';
  return { mid: mid, upper: upper, lower: lower, width: width, position: position, assessment: assess };
}
function calcMACD(arr, fast, slow, signal) {
  var sub = arr.slice(-Math.max(slow * 3, slow));
  if (sub.length < Math.min(slow, 3)) return { dif: null, dea: null, macd: null, status: '数据积累中' };
  var emaFast = sub[0].spotPrice;
  var emaSlow = sub[0].spotPrice;
  var kf = 2 / (fast + 1);
  var ks = 2 / (slow + 1);
  var difArr = [];
  for (var i = 1; i < sub.length; i++) {
    emaFast = sub[i].spotPrice * kf + emaFast * (1 - kf);
    emaSlow = sub[i].spotPrice * ks + emaSlow * (1 - ks);
    difArr.push(emaFast - emaSlow);
  }
  var dif = difArr[difArr.length - 1];
  if (difArr.length < signal) return { dif: dif, dea: null, macd: null, status: 'DEA数据积累中' };
  var dea = difArr[0];
  var kd = 2 / (signal + 1);
  var macdArr = [];
  for (var i = 1; i < difArr.length; i++) {
    dea = difArr[i] * kd + dea * (1 - kd);
    macdArr.push((difArr[i] - dea) * 2);
  }
  var macd = macdArr[macdArr.length - 1];
  var prevMacd = macdArr.length >= 2 ? macdArr[macdArr.length - 2] : null;
  var status;
  if (prevMacd !== null && macd > 0 && prevMacd <= 0) status = '金叉（MACD上穿零轴），看涨信号';
  else if (prevMacd !== null && macd < 0 && prevMacd >= 0) status = '死叉（MACD下穿零轴），看跌信号';
  else if (macd > 0 && prevMacd !== null && macd > prevMacd) status = 'MACD红柱放大，多头动能增强';
  else if (macd > 0) status = 'MACD红柱缩小，多头动能减弱';
  else if (macd < 0 && prevMacd !== null && macd < prevMacd) status = 'MACD绿柱放大，空头动能增强';
  else status = 'MACD绿柱缩小，空头动能减弱';
  return { dif: dif, dea: dea, macd: macd, status: status };
}
function calcMA(arr, days) {
  var sub = arr.slice(-days);
  if (sub.length < Math.min(days, 3)) return null;
  return sub.reduce(function(s, r) { return s + r.spotPrice; }, 0) / sub.length;
}

var ema5 = calcEMA(histData, 5);
var ema20New = calcEMA(histData, 20);
var ema60 = calcEMA(histData, 60);
var boll = calcBOLL(histData, 20, 2);
var macd = calcMACD(histData, 12, 26, 9);
var emaAlignment;
if (ema5 && ema20New && ema60) {
  if (ema5 > ema20New && ema20New > ema60) emaAlignment = '多头排列（EMA5 > EMA20 > EMA60），趋势偏多';
  else if (ema5 < ema20New && ema20New < ema60) emaAlignment = '空头排列（EMA5 < EMA20 < EMA60），趋势偏空';
  else emaAlignment = 'EMA交织，趋势震荡';
} else emaAlignment = '数据积累中';

var ma5 = calcMA(histData, 5);
var ma10 = calcMA(histData, 10);
var ma20 = calcMA(histData, 20);

var maAlignment, maAlignmentStatus;
if (ma5 && ma10 && ma20) {
  if (ma5 > ma10 && ma10 > ma20) {
    maAlignment = '多头排列（MA5 > MA10 > MA20），中期趋势偏多'; maAlignmentStatus = 'bullish';
  } else if (ma5 < ma10 && ma10 < ma20) {
    maAlignment = '空头排列（MA5 < MA10 < MA20），中期趋势偏空'; maAlignmentStatus = 'bearish';
  } else {
    maAlignment = '均线交织，趋势不明'; maAlignmentStatus = 'neutral';
  }
} else if (ma5 && ma10) {
  maAlignment = ma5 > ma10 ? 'MA5上穿MA10，短期偏多' : 'MA5下穿MA10，短期偏空';
  maAlignmentStatus = ma5 > ma10 ? 'bullish' : 'bearish';
} else {
  maAlignment = '历史数据不足，均线待积累'; maAlignmentStatus = 'neutral';
}

var priceVsMA20 = '';
if (ma20) {
  var pct20 = ((spotPrice - ma20) / ma20 * 100);
  if (pct20 > 3) priceVsMA20 = '当前价格高于 MA20 约 ' + pct20.toFixed(1) + '%，中期趋势偏强。注意偏离过大可能引发均值回归。';
  else if (pct20 > 0) priceVsMA20 = '当前价格高于 MA20 约 ' + pct20.toFixed(1) + '%，在均线上方运行，中期支撑有效。';
  else if (pct20 > -3) priceVsMA20 = '当前价格低于 MA20 约 ' + Math.abs(pct20).toFixed(1) + '%，在均线下方运行，中期承压。';
  else priceVsMA20 = '当前价格低于 MA20 约 ' + Math.abs(pct20).toFixed(1) + '%，显著偏离均线，超卖区域。';
} else {
  priceVsMA20 = '历史数据不足，MA20 待积累（需 20 个交易日）。';
}

var r10 = histData.slice(-10);
var rSupport = r10.length > 0 ? Math.min.apply(null, r10.map(function(r) { return r.dayLow || r.spotPrice; })).toLocaleString('en-US') : (spotPrice - 200).toLocaleString('en-US');
var rResist = r10.length > 0 ? Math.max.apply(null, r10.map(function(r) { return r.dayHigh || r.spotPrice; })).toLocaleString('en-US') : (spotPrice + 200).toLocaleString('en-US');
var support1Str = '$' + rSupport + '（近10日低点）';
var resist1Str = '$' + rResist + '（近10日高点）';
var support2Str = '$' + (parseFloat(rSupport.replace(/,/g,'')) - 50).toLocaleString('en-US') + '（次支撑）';
var resist2Str = '$' + (parseFloat(rResist.replace(/,/g,'')) + 50).toLocaleString('en-US') + '（次阻力）';

var r20 = histData.slice(-20);
var range20LowStr = r20.length > 0 ? Math.min.apply(null, r20.map(function(r) { return r.dayLow || r.spotPrice; })).toLocaleString('en-US') : '数据不足';
var range20HighStr = r20.length > 0 ? Math.max.apply(null, r20.map(function(r) { return r.dayHigh || r.spotPrice; })).toLocaleString('en-US') : '数据不足';

var techSummary = '';
if (ma5 && ma10 && ma20) {
  if (maAlignmentStatus === 'bearish') techSummary = '均线空头排列，MA20 位于 $' + ma20.toFixed(0) + ' 构成中期压力。关注 $' + rSupport + ' 支撑。';
  else if (maAlignmentStatus === 'bullish') techSummary = '均线多头排列，MA20 位于 $' + ma20.toFixed(0) + ' 构成中期支撑。回调靠近 MA10/MA20 可视为多头机会。';
  else techSummary = '均线交织，MA20 约 $' + ma20.toFixed(0) + '。建议缩减仓位等待方向选择。';
} else {
  techSummary = '数据积累中，关注 $' + rSupport + '—$' + rResist + ' 区间。';
}

var weeklyAnalysis = ma20 ? '本周 MA20 位于 $' + ma20.toFixed(0) + '，近10日支撑 $' + rSupport + '，阻力 $' + rResist + '。' + maAlignment : '周线延续近期趋势。均线数据积累中。';
var dailyAnalysis = ma5 ? 'MA5 位于 $' + ma5.toFixed(0) + '，当前价格' + (spotPrice > ma5 ? '站上' : '跌破') + '5日均线。' + (ma10 ? 'MA10 约 $' + ma10.toFixed(0) + ' 为下一道' + (spotPrice > ma10 ? '支撑' : '阻力') + '。' : '') : '日线整理中，均线数据积累中。';

var sNum = parseFloat(spotPrice);
var dhNum = parseFloat((yfData.dayHigh || '').replace(/,/g, ''));
var dlNum = parseFloat((yfData.dayLow || '').replace(/,/g, ''));
var cNum = parseFloat((spotChangePct || '0').replace('%', '').replace('+', ''));
var isUpB = cNum > 0;
var isDownB = cNum < -0.5;
var posR = dhNum && dlNum ? ((sNum - dlNum) / (dhNum - dlNum) * 100) : 50;

var biasDir, biasReason, biasRange, biasStrategy;
if (isDownB && posR < 35) {
  biasDir = '偏空，短期趋势向下'; biasReason = '价格连续下跌靠近日内低点，空头主动';
  biasStrategy = '不追空，关注超卖反弹信号；短线等支撑稳住后轻仓试多';
} else if (isDownB) {
  biasDir = '偏空，跌势放缓'; biasReason = '日内下跌但未探新低，空方动能减弱';
  biasStrategy = '空头可递减止盈；多头等突破短期阻力后介入';
} else if (isUpB && posR > 65) {
  biasDir = '偏多，反弹势头良好'; biasReason = '价格反弹至日内高位，多头占主动';
  biasStrategy = '可轻仓跟多但设止损；空头观望等日线阻力';
} else if (isUpB) {
  biasDir = '偏多，涨势较缓'; biasReason = '小幅反弹但未破关键阻力，多头信心不足';
  biasStrategy = '可持有不建议加仓；等突破确认后再追加';
} else {
  biasDir = '震荡整理，方向不明'; biasReason = '窄幅波动，多空均衡';
  biasStrategy = '缩减仓位，等突破方向明确后跟踪';
}
biasRange = '$' + dlNum.toLocaleString('en-US') + ' — $' + dhNum.toLocaleString('en-US');

var biasDirNew = biasDir;
if (maAlignmentStatus === 'bearish' && ma20 && spotPrice < ma20) biasDirNew = '偏空，均线空头排列确认中期弱势';
else if (maAlignmentStatus === 'bullish' && ma20 && spotPrice > ma20) biasDirNew = '偏多，均线多头排列支撑中期强势';

var dNum = parseFloat(jin10Data.dxy || '100');
var fedImpact;
if (dNum > 101) fedImpact = '美元偏强（' + dNum.toFixed(1) + '），对黄金构成压制。若经济数据疲软或降息预期升温，美元回落将为金价提供反弹动力。';
else if (dNum < 100) fedImpact = '美元偏弱（' + dNum.toFixed(1) + '），为黄金提供有利宏观环境。';
else fedImpact = '美元在 ' + dNum.toFixed(1) + ' 附近震荡，对金价暂无方向性引导。';

var tEvts = (jin10Data.importantEvents || []).slice(0, 2);
var geoFocusFormatted = tEvts.length > 0 ? tEvts.join('||') : '中东局势||美伊谈判';
geoFocusFormatted = geoFocusFormatted.replace(/\|\|/g, '\\n');

var dxyImpact;
if (dNum > 101) dxyImpact = '美元偏强对人民币计价国内金价有支撑（缓冲国际跌幅）。';
else if (dNum < 100) dxyImpact = '美元偏弱对国际金价有利，但人民币同步升值可能部分抵消国内涨幅。';
else dxyImpact = '美元震荡时，人民币金价波动更多取决于国内市场情绪。';

// ========== 6. 各银行积存金 ==========
var baseGold = rmbGram;
var bankSaving = {
  ICBC: Math.round(baseGold + 5), CCB: Math.round(baseGold + 5), ABC: Math.round(baseGold + 4),
  BOC: Math.round(baseGold + 6), CMB: Math.round(baseGold + 7), COMM: Math.round(baseGold + 5), CIB: Math.round(baseGold + 8)
};

// ========== 7. 输出 ==========
var output = {
  DATE: DATE_STR, DATE_CN: dateCN, DATA_DATE: dateCN,
  SPOT_PRICE: spotPrice.toFixed(2),
  COMEX_PRICE: comexPrice.replace(/,/g, ''),
  SILVER_LOW: silverHL.low || '', SILVER_HIGH: silverHL.high || '',
  COMEX_MONTH: yfData.comexMonth || 'Aug',
  SPOT_CHANGE: spotChangePct,
  DAY_LOW: yfData.dayLow || '', DAY_HIGH: yfData.dayHigh || '',
  bid: yfData.bid || '', ask: yfData.ask || '',
  USDCNY: usdCny.toFixed(2),
  rmbGram: rmbGram.toString(),
  JEWELRY_PRICE: jewelryPrice.toString(),
  RECOVERY_PRICE: recoveryPrice.toString(),
  SAVING_GOLD_LOW: savingGoldLow.toString(), SAVING_GOLD_HIGH: savingGoldHigh.toString(),
  BANK_RECOVERY: (recoveryPrice - 5).toString(), SHOP_RECOVERY: (recoveryPrice - 15).toString(), PRO_RECOVERY: (recoveryPrice + 10).toString(),
  NEWS_SUMMARY: topNews,
  DXY_RANGE: (dxy - 0.5).toFixed(1) + '-' + (dxy + 0.5).toFixed(1),
  TITLE_SUFFIX: '黄金走势迎来关键节点',
  WEEKLY_ANALYSIS: weeklyAnalysis,
  DAILY_ANALYSIS: dailyAnalysis,
  TECH_SUMMARY: techSummary,
  SUPPORT_LEVELS: support1Str + ' / ' + support2Str,
  RESISTANCE_LEVELS: resist1Str + ' / ' + resist2Str,
  RSI_VALUE: '待盘中更新', RSI_STATUS: '待盘中更新',
  MA5_VALUE: ma5 ? '$' + ma5.toFixed(0) : '数据积累中',
  MA10_VALUE: ma10 ? '$' + ma10.toFixed(0) : '数据积累中',
  MA20_VALUE: ma20 ? '$' + ma20.toFixed(0) : '数据积累中（需20个交易日）',

  EMA5_VALUE: ema5 ? D + ema5.toFixed(0) : '数据积累中',
  EMA20_VALUE: ema20New ? D + ema20New.toFixed(0) : '数据积累中',
  EMA60_VALUE: ema60 ? D + ema60.toFixed(0) : '数据积累中（需60个交易日）',
  EMA_ALIGNMENT: emaAlignment,
  BOLL_UPPER: boll.upper ? D + boll.upper.toFixed(0) : '数据积累中',
  BOLL_MID: boll.mid ? D + boll.mid.toFixed(0) : '数据积累中',
  BOLL_LOWER: boll.lower ? D + boll.lower.toFixed(0) : '数据积累中',
  BOLL_WIDTH: boll.width ? boll.width.toFixed(1) + '%' : '数据积累中',
  BOLL_POSITION: boll.position ? boll.position.toFixed(0) + '%' : '数据积累中',
  BOLL_ASSESSMENT: boll.assessment || '数据积累中',
  MACD_DIF: macd.dif ? macd.dif.toFixed(1) : '数据积累中',
  MACD_DEA: macd.dea ? macd.dea.toFixed(1) : '数据积累中',
  MACD_VALUE: macd.macd ? macd.macd.toFixed(1) : '数据积累中',
  MACD_STATUS: macd.status || '数据积累中',
  MA_ALIGNMENT: maAlignment,
  PRICE_VS_MA20: priceVsMA20,
  RANGE_20D_LOW: '$' + range20LowStr,
  RANGE_20D_HIGH: '$' + range20HighStr,
  WEEK_EVENTS: generateWeekEvents(jin10Data),
  DATA_SOURCE: '金十数据 (jin10.com) / COMEX (cmegroup.com)',
  SILVER_PRICE: jin10Data.silverPrice || '', SILVER_CHANGE: jin10Data.silverChangePct || '',
  PALLADIUM_PRICE: (metalsData.palladium || '').replace(/,/g, ''), PD_LOW: metalsData.pdLow || '', PD_HIGH: metalsData.pdHigh || '',
  PLATINUM_PRICE: metalsData.platinum || '', PT_LOW: metalsData.ptLow || '', PT_HIGH: metalsData.ptHigh || '',
  QUOTE_TIME: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
  DOMESTIC_GOLD: rmbGram.toString(),
  DOMESTIC_SILVER: Math.round(parseFloat(jin10Data.silverPrice || 0) / 31.1035 * usdCny * 100) / 100 + '',
  INVEST_BAR: (rmbGram + 12).toString(),
  BANK_ICBC: bankSaving.ICBC.toString(), BANK_CCB: bankSaving.CCB.toString(), BANK_ABC: bankSaving.ABC.toString(),
  BANK_BOC: bankSaving.BOC.toString(), BANK_CMB: bankSaving.CMB.toString(), BANK_COMM: bankSaving.COMM.toString(), BANK_CIB: bankSaving.CIB.toString(),
  BIAS_DIRECTION: biasDirNew, BIAS_REASON: biasReason, BIAS_RANGE: biasRange, BIAS_STRATEGY: biasStrategy,
  FED_IMPACT: fedImpact, GEO_FOCUS: geoFocusFormatted, DXY_VALUE: jin10Data.dxy || '100.0', DXY_IMPACT: dxyImpact,
  RAW_JIN10: { spotPrice: jin10Data.spotPrice, spotChangePct: jin10Data.spotChangePct, dxy: jin10Data.dxy, silverPrice: jin10Data.silverPrice, news: jin10Data.news, importantEvents: jin10Data.importantEvents, weeklyOutlook: jin10Data.weeklyOutlook },
  RAW_YAHOO: yfData
};

var outPath = path.join(OUTPUT_DIR, 'latest_data.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
fs.writeFileSync(path.join(__dirname, 'gold_data_' + DATE_STR + '.json'), JSON.stringify(output, null, 2), 'utf-8');

console.log('\n=== 抓取结果 (金十+COMEX) ===');
console.log('现货黄金(XAU): $' + output.SPOT_PRICE + '/oz  ' + output.SPOT_CHANGE);
console.log('COMEX期货(GC): $' + output.COMEX_PRICE + '/oz');
console.log('美元指数: ' + jin10Data.dxy);
console.log('汇率估算: ' + usdCny);
console.log('国内金饰: ' + output.JEWELRY_PRICE + ' 元/克');
console.log('黄金回收: ' + output.RECOVERY_PRICE + ' 元/克');
console.log('均线: MA5=' + (ma5 ? '$' + ma5.toFixed(0) : 'N/A') + ' MA10=' + (ma10 ? '$' + ma10.toFixed(0) : 'N/A') + ' MA20=' + (ma20 ? '$' + ma20.toFixed(0) : 'N/A'));
console.log('支撑位: ' + output.SUPPORT_LEVELS);
console.log('压力位: ' + output.RESISTANCE_LEVELS);
console.log('保存至: ' + outPath);
