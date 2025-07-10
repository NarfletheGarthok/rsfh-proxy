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
      const lowerKey = key.toLowerCase();
      // Strip security headers
      if (
        lowerKey !== "content-security-policy" &&
        lowerKey !== "x-frame-options" &&
        lowerKey !== "content-security-policy-report-only"
      ) {
        headers[key] = value;
      }
    });

    // ✅ Allow Genesys iframe embedding via CSP
    headers["Content-Security-Policy"] = "frame-ancestors 'self' https://apps.usw2.pure.cloud";

    res.status(upstreamRes.status).set(headers).send(body);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).send("Error proxying request.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
