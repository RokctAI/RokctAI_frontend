const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const searchText = process.argv[2];
if (!searchText) {
  console.log("Please provide text to search for.");
  process.exit(1);
}

try {
    const html = fs.readFileSync('wayback_all.html', 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const elements = Array.from(document.querySelectorAll('*'));
    const target = elements.find(el => el.textContent && el.textContent.includes(searchText) && !el.children.length);

    if (target) {
      let section = target.closest('section') || target.closest('div.container') || target.closest('div.max-w-7xl') || target.parentElement.parentElement;
      console.log(section.outerHTML);
    } else {
      console.log(`Text "${searchText}" not found`);
    }
} catch (e) {
    console.error("Error reading wayback_all.html. Make sure you run parse_wayback_all.js first.");
}
