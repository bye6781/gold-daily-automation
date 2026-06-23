const https = require("https");
const fs = require("fs");
const path = require("path");

const APPID = process.env.WX_APPID;
const APPSECRET = process.env.WX_APPSECRET;

if (!APPID || !APPSECRET) {
  console.error("ERROR: WX_APPID or WX_APPSECRET not set");
  process.exit(1);
}

// ===== Get access_token =====
function getAccessToken() {
  return new Promise((resolve, reject) => {
    const url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + APPSECRET;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) resolve(json.access_token);
          else reject(new Error("Token failed: " + JSON.stringify(json)));
        } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

// ===== Upload image as permanent material =====
function uploadImage(token, filePath) {
  return new Promise((resolve, reject) => {
    const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const header = Buffer.from(
      "--" + boundary + "\r\n" +
      "Content-Disposition: form-data; name=\"media\"; filename=\"" + fileName + "\"\r\n" +
      "Content-Type: image/png\r\n\r\n"
    );
    const footer = Buffer.from("\r\n--" + boundary + "--\r\n");
    const body = Buffer.concat([header, fileBuffer, footer]);

    const req = https.request({
      hostname: "api.weixin.qq.com",
      path: "/cgi-bin/material/add_material?access_token=" + token + "&type=image",
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data; boundary=" + boundary,
        "Content-Length": body.length,
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ===== POST JSON with explicit UTF-8 Buffer =====
function postJson(token, path, jsonBody) {
  const bodyStr = JSON.stringify(jsonBody);
  const bodyBuf = Buffer.from(bodyStr, "utf-8");
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.weixin.qq.com",
      path: path + "?access_token=" + token,
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": bodyBuf.length,
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(bodyBuf);
    req.end();
  });
}

// ===== Main =====
async function main() {
  console.log("[1/4] Getting access_token...");
  const token = await getAccessToken();
  console.log("[1/4] access_token OK");

  // Find article HTML (prefer WX version)
  const dailyDir = path.resolve(__dirname, "..", "daily_output");
  const allHtml = fs.readdirSync(dailyDir).filter(function(f) { return f.endsWith(".html"); }).sort();
  let wxFiles = allHtml.filter(function(f) { return f.includes("wx_"); });
  if (wxFiles.length === 0) wxFiles = allHtml.slice(-1);
  const articleFile = wxFiles[wxFiles.length - 1];
  const articlePath = path.join(dailyDir, articleFile);
  console.log("[2/4] Article: " + articleFile);
  const content = fs.readFileSync(articlePath, "utf-8");

  // Upload cover
  const coverPath = path.resolve(__dirname, "cover.png");
  let thumbMediaId = "";
  if (fs.existsSync(coverPath)) {
    console.log("[3/4] Uploading cover...");
    try {
      const uploadResp = await uploadImage(token, coverPath);
      console.log("[3/4] Cover upload response: " + JSON.stringify(uploadResp));
      thumbMediaId = uploadResp.media_id || "";
      if (thumbMediaId) console.log("[3/4] Cover OK: " + thumbMediaId);
    } catch (e) {
      console.log("[3/4] Cover upload failed: " + e.message);
    }
  } else {
    console.log("[3/4] No cover.png, skipping");
  }

  // Create draft
  console.log("[4/4] Creating draft...");
  const article = {
    title: "黄金价格今日金价 | 技术析金深度分析",
    author: "技术析金",
    digest: "国际金价实时报价 + 技术面解读 + 本周关注要点 | 数据来源：金十数据 & COMEX",
    content: content,
    content_source_url: "",
    need_open_comment: 0,
    only_fans_can_comment: 0,
  };
  if (thumbMediaId) article.thumb_media_id = thumbMediaId;

  const draftResp = await postJson(token, "/cgi-bin/draft/add", { articles: [article] });
  console.log("[4/4] Response: " + JSON.stringify(draftResp));

  if (!draftResp.errcode || draftResp.errcode === 0) {
    console.log("SUCCESS: Draft created, media_id=" + (draftResp.media_id || "N/A"));
  } else {
    console.log("FAILED: errcode=" + draftResp.errcode + " errmsg=" + draftResp.errmsg);
    process.exit(1);
  }
}

main().catch(function(e) {
  console.error("FATAL: " + e.message);
  process.exit(0);
});