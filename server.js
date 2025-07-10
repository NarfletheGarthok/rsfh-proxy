import express from "express";
import fetch from "node-fetch";

const app = express();

app.use("/", async (req, res) => {
  const targetUrl = "https://doctors.rsfh.com" + req.url;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: "doctors.rsfh.com"
      },
    });

    let body = await upstreamRes.text();

    const headers = {};
    upstreamRes.headers.forEach((value, key) => {
      if (!["content-security-policy", "x-frame-options", "content-security-policy-report-only"].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // ✅ Force headers to allow iframe embedding in Genesys
    headers["content-security-policy"] = "frame-ancestors 'self' https://apps.mypurecloud.com;";
    headers["x-frame-options"] = "ALLOW-FROM https://apps.mypurecloud.com";

    res.status(upstreamRes.status).set(headers).send(body);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).send("Error proxying request.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
