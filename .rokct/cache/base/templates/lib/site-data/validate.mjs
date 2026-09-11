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

// The schema of every `data/` kind, as hand-written checks (base_sdk
// 1.35.0). Plain ESM with no dependency so `generate.mjs` can run it at
// build time under any node the shell builds with, before the TypeScript
// toolchain is involved; the types these checks enforce are `./kinds.ts`.
// Every problem is one sentence naming the field, so a bad file fails the
// build as "data/team.json: members[1].role must be a non-empty string".

/** The kinds and where each lives, mirrored from ./kinds.ts. */
export const SITE_DATA_MODES = ["local", "backend", "hybrid"];
export const DEFAULT_SITE_DATA_MODE = "backend";
export const JSON_KINDS = { theme: "theme.json", team: "team.json", stockists: "stockists.json", products: "products.json", network: "network.json" };
export const MARKDOWN_KINDS = { about: "about.md" };
export const LEGAL_DIR = "legal";
export const SITE_DATA_KINDS = ["theme", "team", "stockists", "products", "about", "legal", "network"];

const HEX_COLOUR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function nonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/** Problems with a `data` mode value; [] when it is one of the three. */
export function validateMode(mode) {
  if (mode === undefined) return [];
  if (typeof mode !== "string" || !SITE_DATA_MODES.includes(mode)) {
    return [`"data" must be one of ${SITE_DATA_MODES.map((m) => `"${m}"`).join(", ")}, got ${JSON.stringify(mode)}`];
  }
  return [];
}

function checkString(problems, at, v, { required = false } = {}) {
  if (v === undefined) {
    if (required) problems.push(`${at} is required`);
    return;
  }
  if (!nonEmptyString(v)) problems.push(`${at} must be a non-empty string`);
}

function checkHex(problems, at, v, { required = false } = {}) {
  if (v === undefined) {
    if (required) problems.push(`${at} is required`);
    return;
  }
  if (typeof v !== "string" || !HEX_COLOUR.test(v)) {
    problems.push(`${at} must be a hex colour such as "#e4333b", got ${JSON.stringify(v)}`);
  }
}

function checkItems(problems, at, value, key, each) {
  if (!isPlainObject(value)) {
    problems.push(`the file must be a JSON object with a "${key}" array`);
    return;
  }
  const list = value[key];
  if (!Array.isArray(list)) {
    problems.push(`${key} must be an array`);
    return;
  }
  for (const extra of Object.keys(value).filter((k) => k !== key)) {
    problems.push(`${extra} is not a field of ${at}`);
  }
  list.forEach((item, i) => {
    const here = `${key}[${i}]`;
    if (!isPlainObject(item)) {
      problems.push(`${here} must be an object`);
      return;
    }
    each(here, item);
  });
}

export function validateTheme(value) {
  const problems = [];
  if (!isPlainObject(value)) return ['the file must be a JSON object with a "primary" colour'];
  checkHex(problems, "primary", value.primary, { required: true });
  checkHex(problems, "secondary", value.secondary);
  checkHex(problems, "accent", value.accent);
  for (const extra of Object.keys(value).filter((k) => !["primary", "secondary", "accent"].includes(k))) {
    problems.push(`${extra} is not a theme field (primary, secondary, accent)`);
  }
  return problems;
}

export function validateTeam(value) {
  const problems = [];
  checkItems(problems, "team", value, "members", (at, m) => {
    checkString(problems, `${at}.name`, m.name, { required: true });
    checkString(problems, `${at}.role`, m.role, { required: true });
    checkString(problems, `${at}.photo`, m.photo);
    if (m.links !== undefined) {
      if (!Array.isArray(m.links)) {
        problems.push(`${at}.links must be an array of { label, href }`);
      } else {
        m.links.forEach((l, j) => {
          if (!isPlainObject(l)) {
            problems.push(`${at}.links[${j}] must be an object`);
            return;
          }
          checkString(problems, `${at}.links[${j}].label`, l.label, { required: true });
          checkString(problems, `${at}.links[${j}].href`, l.href, { required: true });
        });
      }
    }
  });
  return problems;
}

export function validateStockists(value) {
  const problems = [];
  checkItems(problems, "stockists", value, "items", (at, s) => {
    checkString(problems, `${at}.name`, s.name, { required: true });
    checkString(problems, `${at}.address`, s.address, { required: true });
    checkString(problems, `${at}.town`, s.town, { required: true });
    for (const [field, min, max] of [["lat", -90, 90], ["lng", -180, 180]]) {
      const v = s[field];
      if (v === undefined) continue;
      if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) {
        problems.push(`${at}.${field} must be a number between ${min} and ${max}`);
      }
    }
    if ((s.lat === undefined) !== (s.lng === undefined)) {
      problems.push(`${at} needs both lat and lng, or neither`);
    }
    checkString(problems, `${at}.mapsUrl`, s.mapsUrl);
  });
  return problems;
}

export function validateProducts(value) {
  const problems = [];
  checkItems(problems, "products", value, "items", (at, p) => {
    checkString(problems, `${at}.name`, p.name, { required: true });
    checkString(problems, `${at}.description`, p.description);
    checkString(problems, `${at}.image`, p.image);
    if (p.sizes !== undefined) {
      if (!Array.isArray(p.sizes) || !p.sizes.every(nonEmptyString)) {
        problems.push(`${at}.sizes must be an array of non-empty strings`);
      }
    }
    if (p.status !== undefined && p.status !== "active" && p.status !== "coming") {
      problems.push(`${at}.status must be "active" or "coming"`);
    }
  });
  return problems;
}

/**
 * An https origin and nothing more: `https://<host>[:port]`, no path
 * beyond "/", no query string, no fragment (the strip never carries a
 * tracking parameter) - the same line components/custom/landing/network-sites.ts holds.
 */
export function isHttpsOrigin(v) {
  if (typeof v !== "string" || v.trim() !== v || /[?#]/.test(v)) return false;
  let url;
  try {
    url = new URL(v);
  } catch {
    return false;
  }
  return url.protocol === "https:" && url.pathname === "/" && url.username === "" && url.password === "";
}

function checkLogo(problems, at, v) {
  if (v === undefined) return;
  if (!nonEmptyString(v) || /[?#]/.test(v)) {
    problems.push(`${at} must be a public path or an absolute URL with no query string or fragment`);
  }
}

/** `data/network.json` (1.40.0): `{ heading?, sites: [{ key, name, url, logo?, logoDark?, wordmark?, shown? }] }`. */
export function validateNetwork(value) {
  const problems = [];
  if (!isPlainObject(value)) return ['the file must be a JSON object with a "sites" array'];
  const { heading, sites, ...rest } = value;
  for (const extra of Object.keys(rest)) problems.push(`${extra} is not a field of network (heading, sites)`);
  checkString(problems, "heading", heading);
  if (!Array.isArray(sites)) {
    problems.push("sites must be an array");
    return problems;
  }
  const seen = new Set();
  sites.forEach((site, i) => {
    const at = `sites[${i}]`;
    if (!isPlainObject(site)) {
      problems.push(`${at} must be an object`);
      return;
    }
    for (const extra of Object.keys(site).filter((k) => !["key", "name", "url", "logo", "logoDark", "wordmark", "shown"].includes(k))) {
      problems.push(`${at}.${extra} is not a site field (key, name, url, logo, logoDark, wordmark, shown)`);
    }
    checkString(problems, `${at}.key`, site.key, { required: true });
    if (nonEmptyString(site.key)) {
      if (seen.has(site.key)) problems.push(`${at}.key "${site.key}" is used twice`);
      seen.add(site.key);
    }
    checkString(problems, `${at}.name`, site.name, { required: true });
    if (site.url === null) {
      if (site.shown !== false) problems.push(`${at} has no url and must be shown: false`);
    } else if (site.url === undefined) {
      problems.push(`${at}.url is required (an https origin, or null with shown: false)`);
    } else if (!isHttpsOrigin(site.url)) {
      problems.push(`${at}.url must be an https origin with no path, query string or fragment, got ${JSON.stringify(site.url)}`);
    }
    checkLogo(problems, `${at}.logo`, site.logo);
    checkLogo(problems, `${at}.logoDark`, site.logoDark);
    for (const flag of ["wordmark", "shown"]) {
      if (site[flag] !== undefined && typeof site[flag] !== "boolean") problems.push(`${at}.${flag} must be true or false`);
    }
  });
  return problems;
}

export function validateAbout(value) {
  return nonEmptyString(value) ? [] : ["the file must carry some markdown"];
}

/** Front matter `title:` first, else the first `# ` heading (removed from the body). */
export function parseLegalMarkdown(text) {
  if (typeof text !== "string") return { problems: ["the file must carry some markdown"] };
  let body = text.replace(/^\uFEFF/, "");
  let title;
  const front = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (front) {
    body = body.slice(front[0].length);
    const line = front[1].split(/\r?\n/).find((l) => /^title\s*:/.test(l));
    if (line) title = line.replace(/^title\s*:\s*/, "").trim().replace(/^["'](.*)["']$/, "$1");
  }
  if (!title) {
    const heading = body.match(/^\s*#\s+(.+?)\s*$/m);
    if (heading) {
      title = heading[1].trim();
      body = body.replace(heading[0], "").replace(/^\s*\n/, "");
    }
  }
  const problems = [];
  if (!nonEmptyString(title)) problems.push("title is required: a `title:` front-matter line or a first `# ` heading");
  if (!nonEmptyString(body)) problems.push("the page needs some markdown under its title");
  if (problems.length) return { problems };
  return { problems: [], page: { title, markdown: body.trim() + "\n" } };
}

export function validateLegal(value) {
  const problems = [];
  if (!isPlainObject(value)) return ["legal must be a map of slug to { title, markdown }"];
  for (const [slug, page] of Object.entries(value)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      problems.push(`${slug}: a legal slug is lowercase letters, digits and single dashes`);
    }
    if (!isPlainObject(page)) {
      problems.push(`${slug} must be { title, markdown }`);
      continue;
    }
    checkString(problems, `${slug}.title`, page.title, { required: true });
    checkString(problems, `${slug}.markdown`, page.markdown, { required: true });
  }
  return problems;
}

const VALIDATORS = {
  theme: validateTheme,
  team: validateTeam,
  stockists: validateStockists,
  products: validateProducts,
  about: validateAbout,
  legal: validateLegal,
  network: validateNetwork,
};

/** Problems with a parsed value of `kind`; [] when it fits the kind's shape. */
export function validateSiteData(kind, value) {
  const check = VALIDATORS[kind];
  if (!check) return [`unknown data kind "${kind}" (known: ${SITE_DATA_KINDS.join(", ")})`];
  return check(value);
}
