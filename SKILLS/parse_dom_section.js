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
