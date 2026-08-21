/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const searchText = process.argv[2];
if (!searchText) {
  console.log("Please provide text to search for.");
  process.exit(1);
}

try {
  const html = fs.readFileSync("wayback_all.html", "utf8");
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const elements = Array.from(document.querySelectorAll("*"));
  const target = elements.find(
    (el) =>
      el.textContent &&
      el.textContent.includes(searchText) &&
      !el.children.length,
  );

  if (target) {
    let section =
      target.closest("section") ||
      target.closest("div.container") ||
      target.closest("div.max-w-7xl") ||
      target.parentElement.parentElement;
    console.log(section.outerHTML);
  } else {
    console.log(`Text "${searchText}" not found`);
  }
} catch (e) {
  console.error(
    "Error reading wayback_all.html. Make sure you run parse_wayback_all.js first.",
  );
}
