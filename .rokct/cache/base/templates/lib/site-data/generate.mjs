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

// The build-time step of the host-owned data/ folder (base_sdk 1.35.0):
//
//     node lib/site-data/generate.mjs
//
// run from the shell root BEFORE `next build` (and before `next dev`),
// after the compose. It reads the shell's own composer.json for the
// top-level `"data"` key (local | backend | hybrid; absent is backend),
// reads and validates every known file under data/, and writes
// lib/site-data/generated.ts - the module `read-site-data.ts` imports - so
// the files are bundled with the app at build time and nothing reads the
// disk at request time (a Vercel function has no data/ to read).
//
// How a shell runs it: the one durable place is the shell's own
// package.json, which no compose rewrites -
//
//     "scripts": { "prebuild": "node lib/site-data/generate.mjs",
//                  "predev":   "node lib/site-data/generate.mjs", ... }
//
// npm runs `prebuild` before `build` on its own, so Vercel's
// `bash scripts/compose.sh && npm run build` composes (which installs this
// script and the neutral generated.ts), generates, then builds. A shell in
// backend mode that never runs it is unchanged: base installs generated.ts
// as "backend mode, no files", which is exactly what this script writes
// for it.
//
// Failures are build failures, on purpose: an unknown mode, a file that is
// not what its kind needs (named down to the field), an unknown file in
// data/ (a typo such as teams.json), and - in local mode - a kind an
// installed SDK's manifest declares it needs (`"site_data": { "requires":
// ["about"] }`) with no file behind it. The message names the file and the
// field; exit status 1.
//
// The pure pieces (collect, render) are exported for the node tests; only a
// direct `node generate.mjs` invocation runs main().

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  DEFAULT_SITE_DATA_MODE,
  JSON_KINDS,
  LEGAL_DIR,
  MARKDOWN_KINDS,
  SITE_DATA_KINDS,
  parseLegalMarkdown,
  validateMode,
  validateSiteData,
} from "./validate.mjs";

export const DATA_DIR = "data";
export const GENERATED_REL = path.join("lib", "site-data", "generated.ts");
/** Entries under data/ that are neither a kind nor a mistake. */
const IGNORED_ENTRIES = new Set(["README.md", ".gitkeep", ".DS_Store"]);

export class SiteDataError extends Error {
  constructor(problems) {
    super(["[site-data] the data/ folder cannot be bundled:", ...problems.map((p) => `  - ${p}`)].join("\n"));
    this.name = "SiteDataError";
    this.problems = problems;
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

/** The `"data"` key of the shell's composer.json; backend when absent. */
export function readDataMode(root) {
  const composer = path.join(root, "composer.json");
  if (!fs.existsSync(composer)) return DEFAULT_SITE_DATA_MODE;
  let config;
  try {
    config = readJson(composer);
  } catch (e) {
    throw new SiteDataError([`composer.json is not valid JSON: ${e.message}`]);
  }
  const problems = validateMode(config?.data);
  if (problems.length) throw new SiteDataError(problems.map((p) => `composer.json: ${p}`));
  return config?.data ?? DEFAULT_SITE_DATA_MODE;
}

/**
 * The kinds the installed SDKs declare they need, from every manifest the
 * compose can see (`.rokct/cache/<sdk>/manifest.json`, `sdk/<name>/manifest.json`):
 * `"site_data": { "requires": ["about", "legal"] }`. Only a `local` build
 * enforces them; a hybrid shell falls back to its backend.
 */
export function requiredKinds(root) {
  const required = new Map();
  for (const dir of [path.join(root, ".rokct", "cache"), path.join(root, "sdk")]) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      const manifest = path.join(dir, entry, "manifest.json");
      if (!fs.existsSync(manifest)) continue;
      let data;
      try {
        data = readJson(manifest);
      } catch {
        continue;
      }
      const kinds = data?.site_data?.requires;
      if (!Array.isArray(kinds)) continue;
      for (const kind of kinds) {
        if (typeof kind !== "string") continue;
        if (!required.has(kind)) required.set(kind, new Set());
        required.get(kind).add(data.name ?? entry);
      }
    }
  }
  return required;
}

/**
 * Every known file under data/, read and validated: `{ mode, files }` (the
 * bundle) plus `sources` (kind -> the files it came from), or a
 * SiteDataError listing every problem at once. `backend` reads nothing.
 */
export function collectSiteData(root, mode) {
  const files = {};
  const sources = {};
  if (mode === "backend") return { mode, files, sources };
  const dataDir = path.join(root, DATA_DIR);
  if (!fs.existsSync(dataDir)) return { mode, files, sources };
  const problems = [];
  const known = new Set([...Object.values(JSON_KINDS), ...Object.values(MARKDOWN_KINDS), LEGAL_DIR]);
  for (const entry of fs.readdirSync(dataDir)) {
    if (known.has(entry) || IGNORED_ENTRIES.has(entry) || entry.startsWith(".")) continue;
    if (entry.endsWith(".json") || entry.endsWith(".md") || fs.statSync(path.join(dataDir, entry)).isDirectory()) {
      problems.push(
        `${DATA_DIR}/${entry} is not a data kind; the folder holds ` +
          `${[...Object.values(JSON_KINDS), ...Object.values(MARKDOWN_KINDS)].join(", ")} and ${LEGAL_DIR}/<slug>.md`,
      );
    }
  }
  for (const [kind, name] of Object.entries(JSON_KINDS)) {
    const file = path.join(dataDir, name);
    if (!fs.existsSync(file)) continue;
    const rel = `${DATA_DIR}/${name}`;
    let value;
    try {
      value = readJson(file);
    } catch (e) {
      problems.push(`${rel}: not valid JSON (${e.message})`);
      continue;
    }
    const found = validateSiteData(kind, value);
    if (found.length) {
      problems.push(...found.map((p) => `${rel}: ${p}`));
      continue;
    }
    files[kind] = value;
    sources[kind] = [rel];
  }
  for (const [kind, name] of Object.entries(MARKDOWN_KINDS)) {
    const file = path.join(dataDir, name);
    if (!fs.existsSync(file)) continue;
    const rel = `${DATA_DIR}/${name}`;
    const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    const found = validateSiteData(kind, text);
    if (found.length) {
      problems.push(...found.map((p) => `${rel}: ${p}`));
      continue;
    }
    files[kind] = text;
    sources[kind] = [rel];
  }
  const legalDir = path.join(dataDir, LEGAL_DIR);
  if (fs.existsSync(legalDir)) {
    const legal = {};
    const from = [];
    for (const entry of fs.readdirSync(legalDir).sort()) {
      const rel = `${DATA_DIR}/${LEGAL_DIR}/${entry}`;
      if (!entry.endsWith(".md")) {
        if (!entry.startsWith(".")) problems.push(`${rel}: only <slug>.md files belong in ${DATA_DIR}/${LEGAL_DIR}/`);
        continue;
      }
      const slug = entry.slice(0, -3);
      const parsed = parseLegalMarkdown(fs.readFileSync(path.join(legalDir, entry), "utf8"));
      if (parsed.problems.length) {
        problems.push(...parsed.problems.map((p) => `${rel}: ${p}`));
        continue;
      }
      legal[slug] = parsed.page;
      from.push(rel);
    }
    const found = validateSiteData("legal", legal);
    if (found.length) {
      problems.push(...found.map((p) => `${DATA_DIR}/${LEGAL_DIR}/: ${p}`));
    } else if (from.length) {
      files.legal = legal;
      sources.legal = from;
    }
  }
  if (problems.length) throw new SiteDataError(problems);
  return { mode, files, sources };
}

/** In local mode, every kind an installed SDK requires must have a file. */
export function checkRequiredKinds(bundle, required) {
  if (bundle.mode !== "local") return [];
  const problems = [];
  for (const [kind, by] of required) {
    if (!SITE_DATA_KINDS.includes(kind)) {
      problems.push(`${[...by].join(", ")} requires an unknown data kind "${kind}"`);
    } else if (bundle.files[kind] === undefined) {
      const where = kind === "legal" ? `${DATA_DIR}/${LEGAL_DIR}/<slug>.md` : `${DATA_DIR}/${JSON_KINDS[kind] ?? MARKDOWN_KINDS[kind]}`;
      problems.push(`data mode is "local" and ${[...by].join(", ")} requires "${kind}", but ${where} is missing`);
    }
  }
  return problems;
}

/** The TypeScript module read-site-data.ts imports, as text. */
export function renderGeneratedModule(bundle) {
  const files = Object.fromEntries(SITE_DATA_KINDS.filter((k) => bundle.files[k] !== undefined).map((k) => [k, bundle.files[k]]));
  const body = JSON.stringify({ mode: bundle.mode, files }, null, 2);
  return [
    "// Generated by lib/site-data/generate.mjs from composer.json \"data\" and the",
    "// data/ folder at build time. Do not edit and do not commit: the next build",
    "// rewrites it. base_sdk installs the neutral form (backend mode, no files).",
    "",
    'import type { SiteDataBundle } from "./kinds";',
    "",
    `export const SITE_DATA: SiteDataBundle = ${body};`,
    "",
  ].join("\n");
}

/** Read, validate, write; the summary lines to print. Throws SiteDataError. */
export function generateSiteData(root, { out = path.join(root, GENERATED_REL) } = {}) {
  const mode = readDataMode(root);
  const bundle = collectSiteData(root, mode);
  const problems = checkRequiredKinds(bundle, requiredKinds(root));
  if (problems.length) throw new SiteDataError(problems);
  const text = renderGeneratedModule(bundle);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const unchanged = fs.existsSync(out) && fs.readFileSync(out, "utf8") === text;
  if (!unchanged) fs.writeFileSync(out, text, "utf8");
  const kinds = Object.keys(bundle.files);
  const lines = [
    `[site-data] mode ${mode}: ${kinds.length ? kinds.map((k) => `${k} (${bundle.sources[k].join(", ")})`).join(", ") : "no data/ file bundled"}`,
    `[site-data] ${path.relative(root, out)} ${unchanged ? "unchanged" : "written"}`,
  ];
  return { mode, kinds, out, lines };
}

export function main(argv = process.argv.slice(2)) {
  let root = process.cwd();
  let out;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--root") root = path.resolve(argv[++i]);
    else if (argv[i] === "--out") out = path.resolve(argv[++i]);
    else {
      console.error(`[site-data] unknown argument ${argv[i]} (usage: node lib/site-data/generate.mjs [--root <shell>] [--out <file>])`);
      return 2;
    }
  }
  try {
    const result = generateSiteData(root, out ? { out } : {});
    for (const line of result.lines) console.log(line);
    return 0;
  } catch (e) {
    if (e instanceof SiteDataError) {
      console.error(e.message);
      return 1;
    }
    throw e;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
