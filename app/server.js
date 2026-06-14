"use strict";

// Express web app based on the suggested starter gist, modified to display a
// configurable value read from the GREETING environment variable. Pulumi sets
// GREETING from `pulumi config` when it defines the Container App.

const express = require("express");

const PORT = process.env.PORT || 8080;
const GREETING = process.env.GREETING || "Hello World";

const app = express();

app.get("/", (req, res) => {
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Pulumi on Azure Container Apps</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        background: #0a0f1f;
        color: #e6edf6;
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
      }
      h1 { font-size: 2.5rem; }
    </style>
  </head>
  <body>
    <h1>${GREETING}</h1>
  </body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Listening on :${PORT} with greeting "${GREETING}"`);
});
