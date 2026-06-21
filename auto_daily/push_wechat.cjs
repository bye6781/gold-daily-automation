const https = require("https");
const fs = require("fs");
const path = require("path");

const APPID = process.env.WX_APPID;
const APPSECRET = process.env.WX_APPSECRET;

async function getAccessToken() {
  return new Promise((resolve, reject) => {
    https.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const json = JSON.parse(data);
        if (json.access_token) resolve(json.access_token);
        else reject(new Error(`Token failed: ${JSON.stringify(json)}`));
      });
    });
  });
}

async function uploadImage(token, filePath) {
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const header =
    `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([Buffer.from(header), fileBuffer, Buffer.from(footer)]);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.weixin.qq.com",
        path: `/cgi-bin/material/add_material?access_token=${token}&type=image`,
        method: "POST",
        headers: { "Content-Type": `multipart/form-data; boundary=${boundary}`, "Content-Length": body.length },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function postJson(token, path, jsonBody) {
  const body = JSON.stringify(jsonBody);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.weixin.qq.com",
        path: `${path}?access_token=${token}`,
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("正在获取 access_token...");
  const token = await getAccessToken();
  console.log("access_token 获取成功");

  // Find article
  const dailyDir = path.resolve(__dirname, "..", "daily_output");
  const files = fs.readdirSync(dailyDir).filter((f) => f.endsWith(".html")).sort();
  const latest = files[files.length - 1];
  const articlePath = path.join(dailyDir, latest);
  console.log(`Found article: ${articlePath}`);
  const content = fs.readFileSync(articlePath, "utf-8");

  // Upload cover (or try to use existing)
  const coverPath = path.resolve(__dirname, "cover.png");
  let thumbMediaId = "";
  if (fs.existsSync(coverPath)) {
    console.log("正在上传封面图...");
    const uploadResp = await uploadImage(token, coverPath);
    console.log("Upload response:", JSON.stringify(uploadResp));
    thumbMediaId = uploadResp.media_id || "";
    if (thumbMediaId) console.log(`封面上传成功, media_id: ${thumbMediaId}`);
  }

  // Push draft
  console.log("正在推送草稿...");
  const article = {
    title: "【技术析金】黄金价格今日金价深度分析",
    author: "技术析金",
    digest: "今日黄金实时价格、技术面分析、均线系统及基本面深度解读。数据来源：金十数据 & COMEX",
    content: content,
    content_source_url: "",
    need_open_comment: 0,
    only_fans_can_comment: 0,
  };
  if (thumbMediaId) article.thumb_media_id = thumbMediaId;

  const draftResp = await postJson(token, "/cgi-bin/draft/add", { articles: [article] });
  console.log("Draft push response:", JSON.stringify(draftResp));

  if (draftResp.errcode === 0) {
    console.log("? 公众号草稿推送成功！请登录微信公众平台 → 草稿箱 查看。");
  } else {
    console.log(`?? 草稿推送失败: errcode=${draftResp.errcode} errmsg=${draftResp.errmsg}`);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e.message);
  process.exit(0);
});