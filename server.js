const express = require("express");
const request = require("request");
const app = express();

app.use("/", (req, res) => {
  const targetUrl = "https://doctors.rsfh.com" + req.url;
  
  const proxy = request({
    url: targetUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: "doctors.rsfh.com"
    },
    gzip: true,
  });

  proxy.on("response", (response) => {
    delete response.headers["content-security-policy"];
    delete response.headers["content-security-policy-report-only"];
    delete response.headers["x-frame-options"];
    response.headers["content-security-policy"] = "frame-ancestors 'self' https://apps.mypurecloud.com;";
  });

  req.pipe(proxy).pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
