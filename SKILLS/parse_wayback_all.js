/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.route("**/*", (route) => {
    if (
      ["image", "stylesheet", "font"].includes(route.request().resourceType())
    ) {
      route.abort();
    } else {
      route.continue();
    }
  });

  const url =
    process.argv[2] ||
    "http://web.archive.org/web/20260405182426/https://www.getmerlin.in/";
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(5000);

  const data = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync("wayback_all.html", data);
  console.log("Saved DOM to wayback_all.html");
  await browser.close();
})();
