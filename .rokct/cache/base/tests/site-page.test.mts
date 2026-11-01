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


// base_sdk 1.53.0: the site-page kinds (site, sections, pricing, order,
// css) and the theme's palette and fonts - the data a local-data site's
// home SDK draws a whole page from. Runs the validators, the cross-kind
// rule (checkSitePage), the home block's site_data.requires and the
// generator end to end against tests/fixtures/site-data/site-page/ (a
// made-up bakery) and broken copies of it.
//
//   node --experimental-strip-types --no-warnings --test tests/site-page.test.mts

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  SiteDataError,
  collectSiteData,
  generateSiteData,
  homeSdkName,
  requiredKinds,
} from "../templates/lib/site-data/generate.mjs";
import { validateSiteData } from "../templates/lib/site-data/validate.mjs";
import {
  checkSitePage,
  validateOrder,
  validatePricing,
  validateSections,
  validateSite,
  validateSiteCss,
} from "../templates/lib/site-data/validate-site.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(HERE, "fixtures", "site-data", "site-page");
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(FIXTURE, "data", name), "utf8"));

function copyFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "site-page-"));
  fs.cpSync(FIXTURE, root, { recursive: true });
  return root;
}

function problemsOf(fn: () => unknown): string[] {
  try {
    fn();
  } catch (e) {
    if (e instanceof SiteDataError) return e.problems;
    throw e;
  }
  assert.fail("expected a SiteDataError");
}

const HOME_MANIFEST = {
  name: "corporate_sdk",
  home: { site_data: { requires: ["theme", "site", "sections"] } },
};

describe("site-page validators", () => {
  it("accept every fixture file", () => {
    for (const [kind, file] of [["theme", "theme.json"], ["site", "site.json"], ["sections", "sections.json"], ["pricing", "pricing.json"]]) {
      assert.deepEqual(validateSiteData(kind, read(file)), [], file);
    }
    assert.deepEqual(validateSiteCss(fs.readFileSync(path.join(FIXTURE, "data", "site.css"), "utf8")), []);
  });

  it("hold the theme's fonts and palette to the allowed sets", () => {
    const theme = read("theme.json");
    assert.ok(validateSiteData("theme", { ...theme, fonts: { display: "comic-sans" } }).some((p: string) => p.includes("fonts.display")));
    assert.ok(validateSiteData("theme", { ...theme, palette: { ...theme.palette, glow: "#fff" } }).some((p: string) => p.includes("glow")));
    assert.ok(validateSiteData("theme", { ...theme, palette: { ...theme.palette, paper: "beige" } }).some((p: string) => p.includes("palette.paper")));
  });

  it("name the field of a bad site", () => {
    const site = read("site.json");
    assert.ok(validateSite({ ...site, name: "" }).some((p: string) => p.startsWith("name")));
    assert.ok(validateSite({ ...site, whatsapp: { number: "+27 abc", display: "x" } }).some((p: string) => p.includes("whatsapp.number")));
    assert.ok(validateSite({ ...site, footer: { legal: 7 } }).some((p: string) => p.includes("footer.legal")));
    assert.ok(validateSite({ ...site, extra: true }).some((p: string) => p.includes("extra")));
  });

  it("put the hero first, keep ids unique and give a nav label an id", () => {
    const { sections } = read("sections.json");
    const [hero, intro, ...rest] = sections;
    assert.ok(validateSections({ sections: [intro, hero, ...rest] }).some((p: string) => p.includes("a hero section must come first")));
    assert.ok(validateSections({ sections: [hero, intro, { ...intro }] }).some((p: string) => p.includes('"story" is used twice')));
    const { id: _id, ...noId } = rest.find((s: { nav?: string }) => s.nav)!;
    assert.ok(validateSections({ sections: [hero, noId] }).some((p: string) => p.includes("nav label but no id")));
    assert.ok(validateSections({ sections: [{ ...hero, variant: "diagonal" }] }).some((p: string) => p.includes("variant")));
    assert.ok(validateSections({ sections: [hero, { type: "carousel" }] }).some((p: string) => p.includes(".type must be one of")));
    assert.deepEqual(validateSections({ sections: [] }), ["sections must be a non-empty array"]);
  });

  it("hold art to public paths and an image to its alt text", () => {
    const { sections } = read("sections.json");
    const hero = sections[0];
    const art = (front: object) => validateSections({ sections: [{ ...hero, art: { front } }] });
    assert.ok(art({ kind: "image", src: "/art/loaf.svg" }).some((p: string) => p.includes("art.front.alt")));
    assert.ok(art({ kind: "image", src: "javascript:alert(1)", alt: "x" }).some((p: string) => p.includes("art.front.src")));
    assert.ok(art({ kind: "bottle", size: "2 L", label: { name: "x" } }).some((p: string) => p.includes("size")));
    assert.ok(art({ kind: "bottle", label: {} }).some((p: string) => p.includes("needs a name or an art image")));
  });

  it("check pricing tiers, the order form and the site css", () => {
    assert.deepEqual(validatePricing({ tiers: [] }), ["tiers must be a non-empty array"]);
    assert.ok(validatePricing({ tiers: [{ name: "A", price: "R1", minQty: -1 }] }).some((p: string) => p.includes("minQty")));
    assert.ok(validateOrder({ intro: "Hi", fields: {}, message: {}, submit: "Go" }).some((p: string) => p.includes("fields.business")));
    assert.deepEqual(validateSiteCss("@import url(x.css);"), ["@import is not allowed: put the rules in the file itself"]);
    assert.deepEqual(validateSiteCss("</style><script>x</script>"), ["the file must be plain CSS, with no <style> or <script> tag"]);
  });
});

describe("the cross-kind rule", () => {
  it("passes the fixture and names what a page is missing", () => {
    const files = { site: read("site.json"), sections: read("sections.json"), pricing: read("pricing.json") };
    assert.deepEqual(checkSitePage(files), []);
    assert.deepEqual(checkSitePage({ ...files, pricing: undefined }), [
      "data/sections.json has a pricing section but data/pricing.json is missing",
    ]);
    const { whatsapp: _w, ...noChat } = files.site;
    assert.ok(checkSitePage({ ...files, site: noChat })[0].includes("has no whatsapp number"));
    assert.deepEqual(checkSitePage({ sections: files.sections, pricing: files.pricing }), [
      "data/sections.json needs data/site.json (the site's name, metadata and contact)",
    ]);
    assert.deepEqual(checkSitePage({}), [], "no page, no rule");
  });
});

describe("the home block's required kinds", () => {
  it("count only where that SDK is home", () => {
    const root = copyFixture();
    const dir = path.join(root, ".rokct", "cache", "corporate");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(HOME_MANIFEST));
    assert.equal(homeSdkName(root), "corporate_sdk");
    assert.deepEqual([...requiredKinds(root).keys()].sort(), ["sections", "site", "theme"]);

    fs.writeFileSync(path.join(root, "composer.json"), JSON.stringify({ data: "local", sdks: [{ name: "corporate_sdk" }] }));
    assert.equal(homeSdkName(root), null);
    assert.deepEqual([...requiredKinds(root).keys()], [], "not home: the block is ignored");
  });

  it("prefer the compose's recorded home over composer.json", () => {
    const root = copyFixture();
    fs.mkdirSync(path.join(root, ".rokct", "cache"), { recursive: true });
    fs.writeFileSync(path.join(root, ".rokct", "cache", "install_state.json"), JSON.stringify({ home_sdk: "lms_sdk" }));
    assert.equal(homeSdkName(root), "lms_sdk");
  });
});

describe("the generator on a site page", () => {
  it("bundles the fixture in local mode", () => {
    const root = copyFixture();
    const bundle = collectSiteData(root, "local");
    assert.deepEqual(Object.keys(bundle.files).sort(), ["css", "pricing", "sections", "site", "theme"]);
    const result = generateSiteData(root);
    assert.equal(result.mode, "local");
    assert.match(fs.readFileSync(result.out, "utf8"), /Example Bakehouse/);
  });

  it("fails loudly when a required file is missing", () => {
    const root = copyFixture();
    const dir = path.join(root, ".rokct", "cache", "corporate");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(HOME_MANIFEST));
    fs.rmSync(path.join(root, "data", "sections.json"));
    assert.deepEqual(problemsOf(() => generateSiteData(root)), [
      'data mode is "local" and corporate_sdk requires "sections", but data/sections.json is missing',
    ]);
  });

  it("fails when the page names a file that is not there", () => {
    const root = copyFixture();
    fs.rmSync(path.join(root, "data", "pricing.json"));
    assert.deepEqual(problemsOf(() => generateSiteData(root)), [
      "data/sections.json has a pricing section but data/pricing.json is missing",
    ]);
  });
});
