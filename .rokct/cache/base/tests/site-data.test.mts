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

// base_sdk 1.35.0: the shell's host-owned data/ folder and its explicit
// data mode (Ray, 2026-09-10). Executes the pure pieces straight from the
// templates under node's test runner with type stripping: the validators
// (validate.mjs), the mode rule (kinds.ts: resolveSiteData / hasSiteDataIn)
// in all three modes with a present and a missing file, the theme CSS
// (site-theme.ts), the landing's local-mode action rule, and the
// generator (generate.mjs) end to end against tests/fixtures/site-data/
// and temp shells built here for the bad cases.
//
//   node --experimental-strip-types --no-warnings --test tests/site-data.test.mts

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  EMPTY_SITE_DATA,
  SITE_DATA_FILES,
  SITE_DATA_KINDS,
  hasSiteDataIn,
  missingSiteDataMessage,
  resolveSiteData,
  type SiteDataBundle,
} from "../templates/lib/site-data/kinds.ts";
import {
  contrastForeground,
  hexToHslTriplet,
  parseHex,
  siteThemeCss,
} from "../templates/lib/site-data/site-theme.ts";
import {
  SiteDataError,
  checkRequiredKinds,
  collectSiteData,
  generateSiteData,
  readDataMode,
  renderGeneratedModule,
  requiredKinds,
} from "../templates/lib/site-data/generate.mjs";
import {
  parseLegalMarkdown,
  validateMode,
  validateSiteData,
} from "../templates/lib/site-data/validate.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SDK_ROOT = path.resolve(HERE, "..");
const FIXTURE = path.join(HERE, "fixtures", "site-data", "acme");
const GENERATOR = path.join(SDK_ROOT, "templates", "lib", "site-data", "generate.mjs");
const NEUTRAL = path.join(SDK_ROOT, "templates", "lib", "site-data", "generated.ts");

/** A throwaway shell root: composer.json, data/, optional cached manifests. */
function shell(
  { mode, data = {}, manifests = {} }: {
    mode?: string | null;
    data?: Record<string, string>;
    manifests?: Record<string, object>;
  },
): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "site-data-"));
  if (mode !== null) {
    fs.writeFileSync(
      path.join(root, "composer.json"),
      JSON.stringify(mode === undefined ? { sdks: [] } : { data: mode, sdks: [] }),
    );
  }
  for (const [rel, text] of Object.entries(data)) {
    const file = path.join(root, "data", rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  }
  for (const [name, manifest] of Object.entries(manifests)) {
    const dir = path.join(root, ".rokct", "cache", name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest));
  }
  return root;
}

function copyFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "site-data-acme-"));
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

describe("validators", () => {
  it("accept every fixture file", () => {
    const data = path.join(FIXTURE, "data");
    for (const kind of ["theme", "team", "stockists", "products"] as const) {
      const value = JSON.parse(fs.readFileSync(path.join(data, `${kind}.json`), "utf8"));
      assert.deepEqual(validateSiteData(kind, value), [], kind);
    }
    assert.deepEqual(validateSiteData("about", fs.readFileSync(path.join(data, "about.md"), "utf8")), []);
  });

  it("name the field of a bad value", () => {
    assert.deepEqual(validateSiteData("theme", { primary: "red" }), [
      'primary must be a hex colour such as "#e4333b", got "red"',
    ]);
    assert.deepEqual(validateSiteData("theme", { secondary: "#fff" }), ["primary is required"]);
    assert.deepEqual(validateSiteData("theme", { primary: "#fff", tertiary: "#000" }), [
      "tertiary is not a theme field (primary, secondary, accent)",
    ]);
    assert.deepEqual(validateSiteData("team", { members: [{ name: "A. Acme" }] }), [
      "members[0].role is required",
    ]);
    assert.deepEqual(validateSiteData("team", { members: [{ name: "A. Acme", role: "" }] }), [
      "members[0].role must be a non-empty string",
    ]);
    assert.deepEqual(validateSiteData("team", { members: [{ name: "A", role: "B", links: [{ label: "x" }] }] }), [
      "members[0].links[0].href is required",
    ]);
    assert.deepEqual(validateSiteData("team", { people: [] }), ["members must be an array"]);
    assert.deepEqual(validateSiteData("team", []), ['the file must be a JSON object with a "members" array']);
    assert.deepEqual(
      validateSiteData("stockists", { items: [{ name: "A", address: "B", town: "C", lat: 91, lng: 0 }] }),
      ["items[0].lat must be a number between -90 and 90"],
    );
    assert.deepEqual(validateSiteData("stockists", { items: [{ name: "A", address: "B", town: "C", lat: 1 }] }), [
      "items[0] needs both lat and lng, or neither",
    ]);
    assert.deepEqual(validateSiteData("products", { items: [{ name: "A", status: "retired" }] }), [
      'items[0].status must be "active" or "coming"',
    ]);
    assert.deepEqual(validateSiteData("products", { items: [{ name: "A", sizes: ["1 L", ""] }] }), [
      "items[0].sizes must be an array of non-empty strings",
    ]);
    assert.deepEqual(validateSiteData("about", "   "), ["the file must carry some markdown"]);
    assert.deepEqual(validateSiteData("legal", { "Bad Slug": { title: "T", markdown: "m" } }), [
      "Bad Slug: a legal slug is lowercase letters, digits and single dashes",
    ]);
    assert.deepEqual(validateSiteData("legal", { terms: { markdown: "m" } }), ["terms.title is required"]);
    assert.equal(validateSiteData("menu", {}).length, 1);
  });

  it("know the three modes", () => {
    for (const mode of ["local", "backend", "hybrid"]) assert.deepEqual(validateMode(mode), []);
    assert.deepEqual(validateMode(undefined), []);
    assert.equal(validateMode("static").length, 1);
    assert.match(validateMode("static")[0], /"local", "backend", "hybrid"/);
    assert.equal(validateMode(true).length, 1);
  });

  it("take a legal title from the front matter, else the first heading", () => {
    const front = parseLegalMarkdown("---\ntitle: Terms of use\n---\n\nBody text.\n");
    assert.deepEqual(front, { problems: [], page: { title: "Terms of use", markdown: "Body text.\n" } });
    const heading = parseLegalMarkdown("# Privacy notice\n\nWe keep nothing.\n\n## Cookies\n\nNone.\n");
    assert.equal(heading.page?.title, "Privacy notice");
    assert.equal(heading.page?.markdown, "We keep nothing.\n\n## Cookies\n\nNone.\n");
    assert.doesNotMatch(heading.page?.markdown ?? "", /^# Privacy/m);
    const quoted = parseLegalMarkdown('---\ntitle: "Refunds"\n---\n# Kept heading\n\nText.\n');
    assert.equal(quoted.page?.title, "Refunds");
    assert.match(quoted.page?.markdown ?? "", /^# Kept heading/m);
    assert.deepEqual(parseLegalMarkdown("No heading here.\n").problems, [
      "title is required: a `title:` front-matter line or a first `# ` heading",
    ]);
    assert.deepEqual(parseLegalMarkdown("# Only a title\n").problems, [
      "the page needs some markdown under its title",
    ]);
  });
});

describe("the mode rule", () => {
  const team = { members: [{ name: "A. Acme", role: "Founder" }] };
  const present = (mode: SiteDataBundle["mode"]): SiteDataBundle => ({ mode, files: { team } });
  const missing = (mode: SiteDataBundle["mode"]): SiteDataBundle => ({ mode, files: {} });

  it("backend answers undefined whatever the folder holds", () => {
    assert.equal(resolveSiteData(present("backend"), "team"), undefined);
    assert.equal(resolveSiteData(missing("backend"), "team"), undefined);
    assert.equal(hasSiteDataIn(present("backend"), "team"), false);
    assert.equal(resolveSiteData(EMPTY_SITE_DATA, "theme"), undefined);
  });

  it("hybrid answers the file, else undefined", () => {
    assert.deepEqual(resolveSiteData(present("hybrid"), "team"), team);
    assert.equal(resolveSiteData(missing("hybrid"), "team"), undefined);
    assert.equal(hasSiteDataIn(present("hybrid"), "team"), true);
    assert.equal(hasSiteDataIn(present("hybrid"), "about"), false);
  });

  it("local answers the file, or throws naming the missing one", () => {
    assert.deepEqual(resolveSiteData(present("local"), "team"), team);
    assert.throws(() => resolveSiteData(missing("local"), "team"), {
      message: missingSiteDataMessage("team"),
    });
    assert.match(missingSiteDataMessage("team"), /data\/team\.json is missing/);
    assert.match(missingSiteDataMessage("legal"), /data\/legal\/<slug>\.md is missing/);
    assert.equal(hasSiteDataIn(missing("local"), "team"), false, "has never throws");
  });

  it("names every kind and its file", () => {
    assert.deepEqual([...SITE_DATA_KINDS], ["theme", "team", "stockists", "products", "about", "legal"]);
    for (const kind of SITE_DATA_KINDS) assert.match(SITE_DATA_FILES[kind], /^data\//);
  });
});

describe("theme css", () => {
  it("parses short and long hex", () => {
    assert.deepEqual(parseHex("#fff"), [255, 255, 255]);
    assert.deepEqual(parseHex("#E4333B"), [228, 51, 59]);
    assert.equal(parseHex("red"), null);
  });

  it("writes the shadcn triplet", () => {
    assert.equal(hexToHslTriplet("#ffffff"), "0 0% 100%");
    assert.equal(hexToHslTriplet("#000"), "0 0% 0%");
    assert.equal(hexToHslTriplet("#ff6600"), "24 100% 50%");
    assert.equal(hexToHslTriplet("#e4333b"), "357.3 76.6% 54.7%");
  });

  it("picks a readable foreground", () => {
    assert.equal(contrastForeground("#ffffff"), "240 10% 3.9%");
    assert.equal(contrastForeground("#f6d32d"), "240 10% 3.9%");
    assert.equal(contrastForeground("#e4333b"), "0 0% 100%");
    assert.equal(contrastForeground("#ff6600"), "0 0% 100%", "the shells' own orange keeps white");
    assert.equal(contrastForeground("#1a5fb4"), "0 0% 100%");
  });

  it("emits only the colours the file names, on :root", () => {
    const css = siteThemeCss({ primary: "#E4333B" });
    assert.match(css, /^:root \{ /);
    assert.match(css, /--primary: 357\.3 76\.6% 54\.7%;/);
    assert.match(css, /--primary-foreground: 0 0% 100%;/);
    assert.match(css, /--site-primary: #e4333b;/);
    assert.match(css, /--ring: 357\.3 76\.6% 54\.7%;/);
    assert.doesNotMatch(css, /--secondary|--accent/);
    const full = siteThemeCss({ primary: "#1a5fb4", secondary: "#ffffff", accent: "#f6d32d" });
    for (const token of ["--secondary: 0 0% 100%;", "--secondary-foreground: 240 10% 3.9%;", "--site-accent: #f6d32d;"]) {
      assert.ok(full.includes(token), token);
    }
  });
});

describe("the generator", () => {
  it("reads the mode from composer.json, backend when absent", () => {
    assert.equal(readDataMode(FIXTURE), "hybrid");
    assert.equal(readDataMode(shell({ mode: undefined })), "backend");
    assert.equal(readDataMode(shell({ mode: null })), "backend");
    assert.deepEqual(problemsOf(() => readDataMode(shell({ mode: "static" }))), [
      'composer.json: "data" must be one of "local", "backend", "hybrid", got "static"',
    ]);
  });

  it("bundles the whole fixture folder in hybrid mode", () => {
    const { mode, files, sources } = collectSiteData(FIXTURE, "hybrid");
    assert.equal(mode, "hybrid");
    assert.deepEqual(Object.keys(files).sort(), ["about", "legal", "products", "stockists", "team", "theme"]);
    assert.equal(files.theme.primary, "#1a5fb4");
    assert.equal(files.team.members.length, 2);
    assert.equal(files.stockists.items[0].town, "Acme Town");
    assert.equal(files.products.items[1].status, "coming");
    assert.match(files.about, /^# About acme\.school/);
    assert.deepEqual(Object.keys(files.legal).sort(), ["privacy", "terms"]);
    assert.equal(files.legal.terms.title, "Terms of use");
    assert.equal(files.legal.privacy.title, "Privacy notice");
    assert.doesNotMatch(files.legal.privacy.markdown, /^# /m);
    assert.deepEqual(sources.legal, ["data/legal/privacy.md", "data/legal/terms.md"]);
    assert.deepEqual(sources.theme, ["data/theme.json"]);
  });

  it("reads nothing in backend mode, even with the folder present", () => {
    const { files } = collectSiteData(FIXTURE, "backend");
    assert.deepEqual(files, {});
  });

  it("bundles nothing when there is no folder", () => {
    assert.deepEqual(collectSiteData(shell({ mode: "local" }), "local").files, {});
  });

  it("fails naming the file and the field", () => {
    const root = shell({
      mode: "local",
      data: {
        "team.json": JSON.stringify({ members: [{ name: "A. Acme", role: "Founder" }, { name: "B. Acme" }] }),
        "theme.json": "{ not json",
        "teams.json": "{}",
        "legal/terms.md": "no heading\n",
        "legal/notes.txt": "x",
      },
    });
    const problems = problemsOf(() => collectSiteData(root, "local"));
    assert.ok(problems.includes("data/team.json: members[1].role is required"), problems.join("\n"));
    assert.ok(problems.some((p) => p.startsWith("data/theme.json: not valid JSON")), problems.join("\n"));
    assert.ok(problems.some((p) => p.startsWith("data/teams.json is not a data kind")), problems.join("\n"));
    assert.ok(problems.includes("data/legal/terms.md: title is required: a `title:` front-matter line or a first `# ` heading"));
    assert.ok(problems.includes("data/legal/notes.txt: only <slug>.md files belong in data/legal/"));
  });

  it("holds a local shell to the kinds its SDKs require", () => {
    const root = shell({
      mode: "local",
      data: { "about.md": "# About\n\nText.\n" },
      manifests: {
        corporate: { name: "corporate_sdk", site_data: { requires: ["about", "legal"] } },
        lms: { name: "lms_sdk" },
      },
    });
    const required = requiredKinds(root);
    assert.deepEqual([...required.keys()].sort(), ["about", "legal"]);
    assert.deepEqual([...required.get("legal")!], ["corporate_sdk"]);
    const bundle = collectSiteData(root, "local");
    assert.deepEqual(checkRequiredKinds(bundle, required), [
      'data mode is "local" and corporate_sdk requires "legal", but data/legal/<slug>.md is missing',
    ]);
    assert.deepEqual(checkRequiredKinds({ ...bundle, mode: "hybrid" }, required), [], "hybrid falls back");
    assert.deepEqual(checkRequiredKinds({ mode: "local", files: {} }, new Map([["menu", new Set(["x_sdk"])]])), [
      'x_sdk requires an unknown data kind "menu"',
    ]);
    assert.deepEqual(problemsOf(() => generateSiteData(root)), [
      'data mode is "local" and corporate_sdk requires "legal", but data/legal/<slug>.md is missing',
    ]);
  });

  it("renders the neutral module byte for byte", () => {
    assert.equal(renderGeneratedModule({ mode: "backend", files: {} }), fs.readFileSync(NEUTRAL, "utf8"));
  });

  it("renders a typed module the reader can import", () => {
    const text = renderGeneratedModule({ mode: "hybrid", files: { theme: { primary: "#1a5fb4" } } });
    assert.match(text, /^import type \{ SiteDataBundle \} from "\.\/kinds";$/m);
    assert.match(text, /^export const SITE_DATA: SiteDataBundle = \{/m);
    assert.match(text, /"mode": "hybrid"/);
    assert.match(text, /"primary": "#1a5fb4"/);
  });

  it("writes generated.ts for the fixture and is idempotent", () => {
    const root = copyFixture();
    const first = generateSiteData(root);
    const out = path.join(root, "lib", "site-data", "generated.ts");
    assert.equal(first.out, out);
    assert.ok(fs.existsSync(out));
    assert.deepEqual(first.kinds.sort(), ["about", "legal", "products", "stockists", "team", "theme"]);
    assert.match(first.lines[0], /^\[site-data\] mode hybrid: /);
    assert.match(first.lines[1], /generated\.ts written$/);
    const second = generateSiteData(root);
    assert.match(second.lines[1], /generated\.ts unchanged$/);
    // The module evaluates: import it beside a copy of kinds.ts.
    fs.copyFileSync(path.join(SDK_ROOT, "templates", "lib", "site-data", "kinds.ts"), path.join(root, "lib", "site-data", "kinds.ts"));
    const probe = path.join(root, "lib", "site-data", "probe.mts");
    fs.writeFileSync(
      probe,
      'import { SITE_DATA } from "./generated.ts";\nimport { resolveSiteData, hasSiteDataIn } from "./kinds.ts";\n' +
        'console.log(JSON.stringify({ mode: SITE_DATA.mode, team: resolveSiteData(SITE_DATA, "team")?.members.length, has: hasSiteDataIn(SITE_DATA, "legal"), legal: Object.keys(resolveSiteData(SITE_DATA, "legal") ?? {}) }));\n',
    );
    const out2 = execFileSync(process.execPath, ["--experimental-strip-types", "--no-warnings", probe], { encoding: "utf8" });
    assert.deepEqual(JSON.parse(out2.trim()), { mode: "hybrid", team: 2, has: true, legal: ["privacy", "terms"] });
  });

  it("runs as a command: exit 0 with a summary, exit 1 with the problems", () => {
    const ok = spawnSync(process.execPath, [GENERATOR, "--root", copyFixture()], { encoding: "utf8" });
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /^\[site-data\] mode hybrid: theme \(data\/theme\.json\), .*about \(data\/about\.md\), legal \(data\/legal\/privacy\.md, data\/legal\/terms\.md\)$/m);
    const bad = spawnSync(
      process.execPath,
      [GENERATOR, "--root", shell({ mode: "hybrid", data: { "theme.json": JSON.stringify({ primary: "blue" }) } })],
      { encoding: "utf8" },
    );
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /^\[site-data\] the data\/ folder cannot be bundled:/m);
    assert.match(bad.stderr, /data\/theme\.json: primary must be a hex colour/);
    const backend = spawnSync(process.execPath, [GENERATOR, "--root", copyFixture(), "--out", path.join(os.tmpdir(), "x.ts")], {
      encoding: "utf8",
    });
    assert.equal(backend.status, 0);
    const usage = spawnSync(process.execPath, [GENERATOR, "--bogus"], { encoding: "utf8" });
    assert.equal(usage.status, 2);
  });

  it("writes the neutral module for a backend shell with a data folder", () => {
    const root = copyFixture();
    fs.writeFileSync(path.join(root, "composer.json"), JSON.stringify({ sdks: [] }));
    const result = generateSiteData(root);
    assert.equal(result.mode, "backend");
    assert.deepEqual(result.kinds, []);
    assert.equal(fs.readFileSync(result.out, "utf8"), fs.readFileSync(NEUTRAL, "utf8"));
  });
});
