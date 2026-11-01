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

// The site-page kinds of the data/ folder (base_sdk 1.53.0): what a site
// whose whole page is data needs beyond the 1.35.0 kinds - its identity
// (data/site.json), its ordered page (data/sections.json), its prices
// (data/pricing.json), its WhatsApp order form (data/order.json), its own
// stylesheet (data/site.css), and the extended theme fields (palette,
// paletteDark, fonts) validated by ./validate.mjs's validateTheme.
//
// base_sdk owns the SCHEMA only: the section types are a closed library
// so a typo fails the build, and every field is checked here, named down
// to the path ("sections[2].steps[0].title is required"). base renders
// none of it. The home SDK of a local-data site (corporate_sdk) renders
// it; the types the renderer reads are ./kinds.ts. Plain ESM, no
// dependency, like ./validate.mjs.

/** The section types a data/sections.json page may use, in no order. */
export const SECTION_TYPES = ["hero", "intro", "steps", "pricing", "gallery", "facts", "order", "contact"];

/** Layout variants per section type; the first is the default. */
export const SECTION_VARIANTS = {
  hero: ["poster", "split"],
  intro: ["stamp", "plain"],
  steps: ["band", "cards"],
  pricing: ["cards"],
  gallery: ["shelf", "grid"],
  facts: ["band", "plain"],
  order: ["card"],
  contact: ["band", "plain"],
};

/** The ground a section is drawn on. */
export const SECTION_TONES = ["paper", "alt", "ink", "brand"];

/** The glyphs a step may name. */
export const STEP_ICONS = ["upload", "label", "truck", "chat", "star", "check"];

/** The bottle sizes the product art draws. */
export const BOTTLE_SIZES = ["500 ml", "1.25 L"];

/** The fonts a theme may choose from (theme.json `fonts`). */
export const DISPLAY_FONTS = ["montserrat", "fraunces", "space-grotesk", "playfair-display"];
export const TEXT_FONTS = ["figtree", "inter", "dm-sans"];

/** The palette tokens theme.json `palette` / `paletteDark` may set. */
export const PALETTE_TOKENS = [
  "paper",
  "card",
  "alt",
  "stroke",
  "sub",
  "ink",
  "sec",
  "faint",
  "brand",
  "brandHi",
  "brandDeep",
  "brandDark",
  "brandText",
  "bandInk",
  "highlight",
  "highlightInk",
  "ok",
  "onBrand",
  "heroTop",
  "heroLow",
  "shade",
  "primary",
  "shadow",
];

const HEX_COLOUR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
/** A CSS box-shadow made of numbers, units, rgba()/hsla() and hex: no url(), no braces, no semicolons. */
const SAFE_SHADOW = /^[0-9a-z.,%#()\s-]+$/i;

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function nonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/** A small checker bound to one problem list, so every check is one line. */
function checker(problems) {
  const c = {
    str(at, v, required = false) {
      if (v === undefined) {
        if (required) problems.push(`${at} is required`);
        return false;
      }
      if (!nonEmptyString(v)) {
        problems.push(`${at} must be a non-empty string`);
        return false;
      }
      return true;
    },
    hex(at, v, required = false) {
      if (v === undefined) {
        if (required) problems.push(`${at} is required`);
        return;
      }
      if (typeof v !== "string" || !HEX_COLOUR.test(v)) {
        problems.push(`${at} must be a hex colour such as "#e4333b", got ${JSON.stringify(v)}`);
      }
    },
    bool(at, v) {
      if (v !== undefined && typeof v !== "boolean") problems.push(`${at} must be true or false`);
    },
    int(at, v, min = 0) {
      if (v === undefined) return;
      if (!Number.isInteger(v) || v < min) problems.push(`${at} must be a whole number of at least ${min}`);
    },
    oneOf(at, v, list, required = false) {
      if (v === undefined) {
        if (required) problems.push(`${at} is required`);
        return;
      }
      if (!list.includes(v)) problems.push(`${at} must be one of ${list.map((x) => `"${x}"`).join(", ")}, got ${JSON.stringify(v)}`);
    },
    strings(at, v, required = false) {
      if (v === undefined) {
        if (required) problems.push(`${at} is required`);
        return;
      }
      if (!Array.isArray(v) || !v.every(nonEmptyString)) problems.push(`${at} must be an array of non-empty strings`);
    },
    object(at, v, required = false) {
      if (v === undefined) {
        if (required) problems.push(`${at} is required`);
        return false;
      }
      if (!isPlainObject(v)) {
        problems.push(`${at} must be an object`);
        return false;
      }
      return true;
    },
    list(at, v, each, required = false) {
      if (v === undefined) {
        if (required) problems.push(`${at} is required`);
        return;
      }
      if (!Array.isArray(v)) {
        problems.push(`${at} must be an array`);
        return;
      }
      v.forEach((item, i) => {
        const here = `${at}[${i}]`;
        if (!isPlainObject(item)) {
          problems.push(`${here} must be an object`);
          return;
        }
        each(here, item);
      });
    },
    only(at, v, fields) {
      for (const extra of Object.keys(v).filter((k) => !fields.includes(k))) {
        problems.push(`${at ? `${at}.` : ""}${extra} is not a field here (${fields.join(", ")})`);
      }
    },
    path(at, v, required = false) {
      if (!c.str(at, v, required)) return;
      if (!/^(\/|https:\/\/)/.test(v) || /[\s"'<>]/.test(v)) {
        problems.push(`${at} must be a public path ("/brand/logo.svg") or an https URL`);
      }
    },
    link(at, v, required = false) {
      if (!c.object(at, v, required)) return;
      c.only(at, v, ["label", "href"]);
      c.str(`${at}.label`, v.label, true);
      if (c.str(`${at}.href`, v.href, true) && !isLinkHref(v.href)) {
        problems.push(`${at}.href must be "whatsapp", a #anchor, a /path or an http(s) URL, got ${JSON.stringify(v.href)}`);
      }
    },
  };
  return c;
}

/** "whatsapp" (the site's WhatsApp chat), an in-page #anchor, a /path, or an http(s) URL. */
export function isLinkHref(href) {
  return href === "whatsapp" || /^#[a-z0-9][a-z0-9-]*$/i.test(href) || /^\/(?!\/)/.test(href) || /^https?:\/\//.test(href);
}

// ------------------------------------------------------------------ theme --

/** The 1.53.0 theme fields: palette, paletteDark, fonts. Called by validateTheme. */
export function validateThemeExtras(problems, value) {
  const c = checker(problems);
  for (const key of ["palette", "paletteDark"]) {
    const palette = value[key];
    if (!c.object(key, palette)) continue;
    for (const [token, v] of Object.entries(palette)) {
      if (!PALETTE_TOKENS.includes(token)) {
        problems.push(`${key}.${token} is not a palette token (${PALETTE_TOKENS.join(", ")})`);
      } else if (token === "shadow") {
        if (!nonEmptyString(v) || !SAFE_SHADOW.test(v)) problems.push(`${key}.shadow must be a CSS box-shadow such as "0 30px 70px -36px rgba(0, 0, 0, 0.35)"`);
      } else {
        c.hex(`${key}.${token}`, v);
      }
    }
  }
  if (c.object("fonts", value.fonts)) {
    c.only("fonts", value.fonts, ["display", "text", "displayWeight", "displayItalic", "displayUppercase"]);
    c.oneOf("fonts.display", value.fonts.display, DISPLAY_FONTS);
    c.oneOf("fonts.text", value.fonts.text, TEXT_FONTS);
    c.oneOf("fonts.displayWeight", value.fonts.displayWeight, [400, 500, 600, 700, 800, 900]);
    c.bool("fonts.displayItalic", value.fonts.displayItalic);
    c.bool("fonts.displayUppercase", value.fonts.displayUppercase);
  }
  if (value.backToTop !== undefined) validateBackToTop(problems, "backToTop", value.backToTop);
}

// ------------------------------------------------------------- backToTop --

// data/theme.json `backToTop` (1.56.0): the shell's own settings for the
// floating Back to top button, laid over the home SDK's registered style.
// Mirrors BackToTopConfig in components/custom/landing/back-to-top.ts.
export const BACK_TO_TOP_POSITIONS = ["bottom-right", "bottom-left", "bottom-center"];
export const BACK_TO_TOP_ICONS = ["arrow-up", "arrow-up-circle", "chevron-up", "rocket"];
export const BACK_TO_TOP_SHAPES = ["circle", "rounded-square", "pill-with-label", "text-arrow"];
export const BACK_TO_TOP_COLOURS = ["background", "foreground", "hoverBackground", "hoverForeground", "border", "ring", "halo"];
export const BACK_TO_TOP_CSS = ["radius", "size", "fontFamily", "letterSpacing", "fontSize", "borderWidth", "shadow", "duration", "easing"];
export const BACK_TO_TOP_FIELDS = [
  "enabled", "position", "icon", "shape", "label", ...BACK_TO_TOP_COLOURS, "offset", "showAfter",
  ...BACK_TO_TOP_CSS, "fontWeight", "textTransform", "borderStyle",
];
const SAFE_CSS = /^[^;{}<>\\]{1,160}$/;
const CSS_COLOUR = /^(#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgba?|hsla?|oklch|oklab|color-mix|var)\(.*\)|transparent|currentColor)$/i;

export function validateBackToTop(problems, at, value) {
  const c = checker(problems);
  if (!c.object(at, value)) return;
  c.only(at, value, BACK_TO_TOP_FIELDS);
  c.bool(`${at}.enabled`, value.enabled);
  c.oneOf(`${at}.position`, value.position, BACK_TO_TOP_POSITIONS);
  c.oneOf(`${at}.icon`, value.icon, BACK_TO_TOP_ICONS);
  c.oneOf(`${at}.shape`, value.shape, BACK_TO_TOP_SHAPES);
  if (c.str(`${at}.label`, value.label) && value.label.length > 40) problems.push(`${at}.label must be at most 40 characters`);
  for (const key of BACK_TO_TOP_COLOURS) {
    const v = value[key];
    if (v === undefined) continue;
    if (typeof v !== "string" || /\/\*/.test(v) || !SAFE_CSS.test(v) || !CSS_COLOUR.test(v.trim())) {
      problems.push(`${at}.${key} must be a CSS colour such as "#e4333b" or "hsl(var(--primary))", got ${JSON.stringify(v)}`);
    }
  }
  for (const key of BACK_TO_TOP_CSS) {
    const v = value[key];
    if (v === undefined) continue;
    if (typeof v !== "string" || /\/\*/.test(v) || !SAFE_CSS.test(v)) problems.push(`${at}.${key} must be a short CSS value with no ; { } < > or comments`);
  }
  if (value.fontWeight !== undefined && !(typeof value.fontWeight === "number" ? [100, 200, 300, 400, 500, 600, 700, 800, 900].includes(value.fontWeight) : typeof value.fontWeight === "string" && SAFE_CSS.test(value.fontWeight))) {
    problems.push(`${at}.fontWeight must be 100..900 in steps of 100, or a CSS value`);
  }
  c.oneOf(`${at}.textTransform`, value.textTransform, ["none", "uppercase", "lowercase", "capitalize"]);
  c.oneOf(`${at}.borderStyle`, value.borderStyle, ["solid", "dashed", "dotted", "double", "none"]);
  c.int(`${at}.offset`, value.offset, 0);
  c.int(`${at}.showAfter`, value.showAfter, 0);
}

// ------------------------------------------------------------------- site --

export function validateSite(value) {
  const problems = [];
  if (!isPlainObject(value)) return ['the file must be a JSON object with a "name" and "metadata"'];
  const c = checker(problems);
  c.only("", value, ["name", "wordmark", "motto", "place", "since", "whatsapp", "email", "header", "metadata", "footer"]);
  c.str("name", value.name, true);
  if (c.object("wordmark", value.wordmark)) {
    c.only("wordmark", value.wordmark, ["lead", "mark", "rest"]);
    c.str("wordmark.lead", value.wordmark.lead, true);
    c.str("wordmark.mark", value.wordmark.mark);
    c.str("wordmark.rest", value.wordmark.rest);
  }
  c.str("motto", value.motto);
  c.str("place", value.place);
  c.str("since", value.since);
  if (c.object("whatsapp", value.whatsapp)) {
    c.only("whatsapp", value.whatsapp, ["number", "display"]);
    if (c.str("whatsapp.number", value.whatsapp.number, true) && !/^\+?[0-9]{8,15}$/.test(value.whatsapp.number)) {
      problems.push('whatsapp.number must be the international number in digits, such as "27150006069"');
    }
    c.str("whatsapp.display", value.whatsapp.display, true);
  }
  if (c.object("email", value.email)) {
    c.only("email", value.email, ["orders", "domain", "orderVia"]);
    if (c.str("email.orders", value.email.orders) && value.email.orders !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.orders)) {
      problems.push('email.orders must be an email address such as "orders@example.com"');
    }
    if (c.str("email.domain", value.email.domain) && value.email.domain !== undefined && !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(value.email.domain)) {
      problems.push('email.domain must be a bare domain such as "example.com"');
    }
  }
  if (value.email?.orderVia !== undefined && !["email", "whatsapp", "both"].includes(value.email.orderVia)) {
    problems.push('email.orderVia must be "email", "whatsapp" or "both"');
  }
  if (c.object("header", value.header)) {
    c.only("header", value.header, ["logo", "wordmark", "action"]);
    if (value.header.logo !== undefined && value.header.logo !== "none" && value.header.logo !== "auto") c.path("header.logo", value.header.logo);
    // 1.59.0: false when the header logo image already spells the name.
    c.bool("header.wordmark", value.header.wordmark);
    c.link("header.action", value.header.action);
  }
  if (c.object("metadata", value.metadata, true)) {
    const m = value.metadata;
    c.only("metadata", m, ["title", "tagline", "description", "keywords", "themeColor", "locale", "icon"]);
    c.str("metadata.title", m.title, true);
    c.str("metadata.tagline", m.tagline);
    c.str("metadata.description", m.description, true);
    c.strings("metadata.keywords", m.keywords);
    c.hex("metadata.themeColor", m.themeColor);
    if (m.locale !== undefined && !/^[a-z]{2}(_[A-Z]{2})?$/.test(m.locale)) problems.push('metadata.locale must look like "en_ZA"');
    c.path("metadata.icon", m.icon);
  }
  if (c.object("footer", value.footer)) {
    c.only("footer", value.footer, ["links", "line", "legal", "logo"]);
    // 1.59.0: the footer draws this image in place of the type wordmark.
    c.path("footer.logo", value.footer.logo);
    c.list("footer.links", value.footer.links, (at, l) => c.link(at, l, true));
    c.str("footer.line", value.footer.line);
    c.str("footer.legal", value.footer.legal);
  }
  if (value.whatsapp === undefined && JSON.stringify(value).includes('"href":"whatsapp"')) {
    problems.push('a link names "whatsapp" but the site declares no whatsapp number');
  }
  return problems;
}

// --------------------------------------------------------------- sections --

function checkLabel(c, problems, at, v, required = false, needsFace = true) {
  if (!c.object(at, v, required)) return;
  c.only(at, v, ["bg", "fg", "name", "sub", "footer", "art", "mark"]);
  c.hex(`${at}.bg`, v.bg, true);
  c.hex(`${at}.fg`, v.fg);
  // 1.59.0: a monogram of one or two characters, drawn in a ring above the name.
  if (c.str(`${at}.mark`, v.mark) && v.mark !== undefined && [...v.mark].length > 2) problems.push(`${at}.mark must be one or two characters`);
  c.str(`${at}.name`, v.name);
  c.str(`${at}.sub`, v.sub);
  c.str(`${at}.footer`, v.footer);
  c.path(`${at}.art`, v.art);
  if (needsFace && v.art === undefined && v.name === undefined) problems.push(`${at} needs a name or an art image`);
}

function checkArt(c, problems, at, v, required = false) {
  if (!c.object(at, v, required)) return;
  c.oneOf(`${at}.kind`, v.kind, ["bottle", "image"], true);
  if (v.kind === "bottle") {
    c.only(at, v, ["kind", "size", "label", "labels", "cap"]);
    c.oneOf(`${at}.size`, v.size, BOTTLE_SIZES);
    checkLabel(c, problems, `${at}.label`, v.label, true);
    // 1.59.0: more labels the bottle rolls through after `label`.
    c.list(`${at}.labels`, v.labels, (here, l) => checkLabel(c, problems, here, l, true));
    c.hex(`${at}.cap`, v.cap);
  } else if (v.kind === "image") {
    c.only(at, v, ["kind", "src", "alt", "width", "height"]);
    c.path(`${at}.src`, v.src, true);
    c.str(`${at}.alt`, v.alt, true);
    c.int(`${at}.width`, v.width, 1);
    c.int(`${at}.height`, v.height, 1);
  }
}

const COMMON = ["type", "id", "nav", "variant", "tone"];

const SECTION_CHECKS = {
  hero(c, p, at, s) {
    c.only(at, s, [...COMMON, "eyebrow", "lines", "accentLine", "lede", "cta", "secondary", "facts", "tag", "art"]);
    c.str(`${at}.eyebrow`, s.eyebrow);
    c.strings(`${at}.lines`, s.lines, true);
    c.int(`${at}.accentLine`, s.accentLine, 0);
    if (Array.isArray(s.lines) && Number.isInteger(s.accentLine) && s.accentLine >= s.lines.length) p.push(`${at}.accentLine must index one of the lines`);
    c.str(`${at}.lede`, s.lede);
    c.link(`${at}.cta`, s.cta);
    c.link(`${at}.secondary`, s.secondary);
    c.strings(`${at}.facts`, s.facts);
    if (c.object(`${at}.tag`, s.tag)) {
      c.only(`${at}.tag`, s.tag, ["price", "text"]);
      c.str(`${at}.tag.price`, s.tag.price, true);
      c.str(`${at}.tag.text`, s.tag.text);
    }
    if (c.object(`${at}.art`, s.art)) {
      c.only(`${at}.art`, s.art, ["back", "front"]);
      checkArt(c, p, `${at}.art.back`, s.art.back);
      checkArt(c, p, `${at}.art.front`, s.art.front);
    }
  },
  intro(c, p, at, s) {
    c.only(at, s, [...COMMON, "year", "text", "stamp"]);
    c.str(`${at}.year`, s.year);
    c.str(`${at}.text`, s.text, true);
    if (c.object(`${at}.stamp`, s.stamp)) {
      c.only(`${at}.stamp`, s.stamp, ["lines", "center"]);
      c.strings(`${at}.stamp.lines`, s.stamp.lines, true);
      c.str(`${at}.stamp.center`, s.stamp.center);
    }
  },
  steps(c, p, at, s) {
    c.only(at, s, [...COMMON, "eyebrow", "heading", "steps"]);
    c.str(`${at}.eyebrow`, s.eyebrow);
    c.str(`${at}.heading`, s.heading, true);
    c.list(`${at}.steps`, s.steps, (here, st) => {
      c.only(here, st, ["title", "text", "icon"]);
      c.str(`${here}.title`, st.title, true);
      c.str(`${here}.text`, st.text);
      c.oneOf(`${here}.icon`, st.icon, STEP_ICONS);
    }, true);
  },
  pricing(c, p, at, s) {
    c.only(at, s, [...COMMON, "eyebrow", "heading", "note", "own"]);
    c.str(`${at}.eyebrow`, s.eyebrow);
    c.str(`${at}.heading`, s.heading, true);
    c.str(`${at}.note`, s.note);
    if (c.object(`${at}.own`, s.own)) {
      c.only(`${at}.own`, s.own, ["eyebrow", "heading", "text", "art"]);
      c.str(`${at}.own.eyebrow`, s.own.eyebrow);
      c.str(`${at}.own.heading`, s.own.heading, true);
      c.str(`${at}.own.text`, s.own.text);
      checkArt(c, p, `${at}.own.art`, s.own.art);
    }
  },
  gallery(c, p, at, s) {
    c.only(at, s, [...COMMON, "eyebrow", "heading", "blurb", "items"]);
    c.str(`${at}.eyebrow`, s.eyebrow);
    c.str(`${at}.heading`, s.heading, true);
    c.str(`${at}.blurb`, s.blurb);
    c.list(`${at}.items`, s.items, (here, it) => {
      c.only(here, it, ["title", "text", "art"]);
      c.str(`${here}.title`, it.title, true);
      c.str(`${here}.text`, it.text);
      checkArt(c, p, `${here}.art`, it.art, true);
    }, true);
  },
  facts(c, p, at, s) {
    c.only(at, s, [...COMMON, "eyebrow", "heading", "blurb", "stats", "table", "chain"]);
    c.str(`${at}.eyebrow`, s.eyebrow);
    c.str(`${at}.heading`, s.heading, true);
    c.str(`${at}.blurb`, s.blurb);
    const pair = (here, x) => {
      c.only(here, x, ["label", "value"]);
      c.str(`${here}.label`, x.label, true);
      c.str(`${here}.value`, x.value, true);
    };
    c.list(`${at}.stats`, s.stats, pair);
    c.list(`${at}.chain`, s.chain, pair);
    if (c.object(`${at}.table`, s.table)) {
      c.only(`${at}.table`, s.table, ["heading", "note", "rows"]);
      c.str(`${at}.table.heading`, s.table.heading, true);
      c.str(`${at}.table.note`, s.table.note);
      c.list(`${at}.table.rows`, s.table.rows, (here, r) => {
        c.only(here, r, ["name", "symbol", "value"]);
        c.str(`${here}.name`, r.name, true);
        c.str(`${here}.symbol`, r.symbol);
        c.str(`${here}.value`, r.value, true);
      }, true);
    }
  },
  order(c, p, at, s) {
    c.only(at, s, [...COMMON, "eyebrow", "heading", "blurb"]);
    c.str(`${at}.eyebrow`, s.eyebrow);
    c.str(`${at}.heading`, s.heading, true);
    c.str(`${at}.blurb`, s.blurb);
  },
  contact(c, p, at, s) {
    c.only(at, s, [...COMMON, "eyebrow", "heading", "blurb", "note", "card"]);
    c.str(`${at}.eyebrow`, s.eyebrow);
    c.str(`${at}.heading`, s.heading, true);
    c.str(`${at}.blurb`, s.blurb);
    c.str(`${at}.note`, s.note);
    if (c.object(`${at}.card`, s.card)) {
      c.only(`${at}.card`, s.card, ["label", "action"]);
      c.str(`${at}.card.label`, s.card.label, true);
      c.str(`${at}.card.action`, s.card.action, true);
    }
  },
};

/** `data/sections.json`: `{ sections: [{ type, id?, nav?, variant?, tone?, ...fields of the type }] }`. */
export function validateSections(value) {
  const problems = [];
  if (!isPlainObject(value)) return ['the file must be a JSON object with a "sections" array'];
  const c = checker(problems);
  c.only("", value, ["sections"]);
  if (!Array.isArray(value.sections) || value.sections.length === 0) {
    problems.push("sections must be a non-empty array");
    return problems;
  }
  const ids = new Set();
  value.sections.forEach((s, i) => {
    const at = `sections[${i}]`;
    if (!isPlainObject(s)) {
      problems.push(`${at} must be an object`);
      return;
    }
    if (!SECTION_TYPES.includes(s.type)) {
      problems.push(`${at}.type must be one of ${SECTION_TYPES.map((t) => `"${t}"`).join(", ")}, got ${JSON.stringify(s.type)}`);
      return;
    }
    if (s.type === "hero" && i !== 0) problems.push(`${at}: a hero section must come first`);
    if (s.id !== undefined) {
      if (typeof s.id !== "string" || !/^[a-z][a-z0-9-]*$/.test(s.id)) problems.push(`${at}.id must be lowercase letters, digits and dashes, starting with a letter`);
      else if (ids.has(s.id)) problems.push(`${at}.id "${s.id}" is used twice`);
      else ids.add(s.id);
    }
    c.str(`${at}.nav`, s.nav);
    if (s.nav !== undefined && s.id === undefined) problems.push(`${at} has a nav label but no id to scroll to`);
    c.oneOf(`${at}.variant`, s.variant, SECTION_VARIANTS[s.type]);
    c.oneOf(`${at}.tone`, s.tone, SECTION_TONES);
    SECTION_CHECKS[s.type](c, problems, at, s);
  });
  return problems;
}

// ---------------------------------------------------------------- pricing --

/** The first number in a price ("R150" -> 150, "R1,500.50" -> 1500.5), or null. */
export function priceAmount(price) {
  const m = typeof price === "string" ? price.match(/[0-9][0-9,]*(\.[0-9]+)?/) : null;
  return m ? Number(m[0].replace(/,/g, "")) : null;
}

/**
 * `data/pricing.json`: `{ tiers: [{ name, price, unit?, detail?, best?, minQty?, previewNote?, fine?, art?, slider? }], perCase?, ctaLabel?, bestLabel? }`.
 * 1.59.0: `perCase` (units in one case), a tier's `fine` line, its `art`
 * (drawn in the card) and its `slider` (a quantity range with a running
 * total). Templates may use `{n}`, `{units}`, `{price}`, `{each}` and `{total}`.
 */
export function validatePricing(value) {
  const problems = [];
  if (!isPlainObject(value)) return ['the file must be a JSON object with a "tiers" array'];
  const c = checker(problems);
  c.only("", value, ["tiers", "perCase", "ctaLabel", "bestLabel"]);
  c.int("perCase", value.perCase, 1);
  if (!Array.isArray(value.tiers) || value.tiers.length === 0) problems.push("tiers must be a non-empty array");
  else {
    c.list("tiers", value.tiers, (at, t) => {
      c.only(at, t, ["name", "price", "unit", "detail", "best", "minQty", "previewNote", "fine", "art", "slider"]);
      c.str(`${at}.name`, t.name, true);
      c.str(`${at}.price`, t.price, true);
      c.str(`${at}.unit`, t.unit);
      c.str(`${at}.detail`, t.detail);
      c.bool(`${at}.best`, t.best);
      c.int(`${at}.minQty`, t.minQty, 0);
      c.str(`${at}.previewNote`, t.previewNote);
      if (c.object(`${at}.fine`, t.fine)) {
        c.only(`${at}.fine`, t.fine, ["strong", "text"]);
        c.str(`${at}.fine.strong`, t.fine.strong);
        c.str(`${at}.fine.text`, t.fine.text, true);
      }
      checkArt(c, problems, `${at}.art`, t.art);
      if (c.object(`${at}.slider`, t.slider)) {
        const sl = t.slider;
        c.only(`${at}.slider`, sl, ["min", "max", "step", "label", "count", "total", "breakdown"]);
        c.int(`${at}.slider.min`, sl.min, 1);
        c.int(`${at}.slider.max`, sl.max, 1);
        c.int(`${at}.slider.step`, sl.step, 1);
        if (sl.min === undefined || sl.max === undefined) problems.push(`${at}.slider needs min and max`);
        else if (Number.isInteger(sl.min) && Number.isInteger(sl.max) && sl.max <= sl.min) problems.push(`${at}.slider.max must be above min`);
        c.str(`${at}.slider.label`, sl.label, true);
        c.str(`${at}.slider.count`, sl.count);
        c.str(`${at}.slider.total`, sl.total);
        c.str(`${at}.slider.breakdown`, sl.breakdown);
        if (typeof t.price === "string" && priceAmount(t.price) === null) problems.push(`${at}.price needs a number for the slider's total`);
      }
      const words = JSON.stringify([t.fine, t.slider]);
      if (value.perCase === undefined && /\{(units|each)\}/.test(words)) problems.push(`${at} uses {units} or {each} but the file declares no perCase`);
    });
  }
  c.str("ctaLabel", value.ctaLabel);
  c.str("bestLabel", value.bestLabel);
  return problems;
}

// ------------------------------------------------------------------ order --

const ORDER_FIELDS = ["business", "quantity", "phone", "area", "file"];
const ORDER_MESSAGE = ["business", "quantity", "quantityPrice", "area", "phone", "fileSent", "fileLater"];

/**
 * `data/order.json`: the WhatsApp order form. It sends nothing itself: the
 * fields become a message (`intro`, then one `message` line per filled
 * field, `{value}` / `{price}` / `{file}` filled in) and the form opens
 * wa.me with it, to the number in data/site.json.
 */
export function validateOrder(value) {
  const problems = [];
  if (!isPlainObject(value)) return ['the file must be a JSON object with "intro", "fields", "message" and "submit"'];
  const c = checker(problems);
  c.only("", value, ["intro", "fields", "message", "submit", "fine", "preview"]);
  c.str("intro", value.intro, true);
  if (c.object("fields", value.fields, true)) {
    c.only("fields", value.fields, ORDER_FIELDS);
    for (const name of ORDER_FIELDS) {
      const f = value.fields[name];
      if (!c.object(`fields.${name}`, f, name !== "file")) continue;
      c.only(`fields.${name}`, f, ["label", "placeholder", "button"]);
      c.str(`fields.${name}.label`, f.label, true);
      c.str(`fields.${name}.placeholder`, f.placeholder);
      c.str(`fields.${name}.button`, f.button);
    }
  }
  if (c.object("message", value.message, true)) {
    c.only("message", value.message, ORDER_MESSAGE);
    for (const name of ORDER_MESSAGE) c.str(`message.${name}`, value.message[name], name !== "fileSent" && name !== "fileLater" && name !== "quantityPrice");
  }
  c.str("submit", value.submit, true);
  c.str("fine", value.fine);
  if (c.object("preview", value.preview)) {
    c.only("preview", value.preview, ["heading", "placeholderName", "label"]);
    c.str("preview.heading", value.preview.heading);
    c.str("preview.placeholderName", value.preview.placeholderName, true);
    // The preview's name is what the visitor types (placeholderName until then).
    checkLabel(c, problems, "preview.label", value.preview.label, true, false);
  }
  return problems;
}

// -------------------------------------------------------------------- css --

/** `data/site.css`: the site's own stylesheet, drawn after the home SDK's. */
export function validateSiteCss(value) {
  if (!nonEmptyString(value)) return ["the file must carry some CSS"];
  if (/<\/?style|<script/i.test(value)) return ["the file must be plain CSS, with no <style> or <script> tag"];
  if (/@import\b/i.test(value)) return ["@import is not allowed: put the rules in the file itself"];
  return [];
}

// ------------------------------------------------------------ cross-kind --

/**
 * What one kind needs of another, once every file is read: a page with a
 * pricing section needs data/pricing.json, an order section needs
 * data/order.json, and either needs data/site.json's WhatsApp number (the
 * order form and the pricing buttons open a chat); a page needs
 * data/site.json at all. [] when the files agree (or there is no page).
 */
export function checkSitePage(files) {
  const problems = [];
  const sections = files.sections?.sections;
  if (!Array.isArray(sections)) return problems;
  const types = new Set(sections.map((s) => s?.type));
  if (files.site === undefined) problems.push("data/sections.json needs data/site.json (the site's name, metadata and contact)");
  if (types.has("pricing") && files.pricing === undefined) problems.push("data/sections.json has a pricing section but data/pricing.json is missing");
  if (types.has("order") && files.order === undefined) problems.push("data/sections.json has an order section but data/order.json is missing");
  // The order form goes by email (1.57.0), so it no longer needs the WhatsApp number.
  // Unset orderVia offers every channel the site has (a site without a WhatsApp number offers email only), so only an explicit choice needs the number.
  const via = files.site?.email?.orderVia;
  const needsWhatsApp = (types.has("order") && (via === "whatsapp" || via === "both")) || types.has("pricing") || types.has("contact") || JSON.stringify(sections).includes('"href":"whatsapp"');
  if (needsWhatsApp && files.site !== undefined && files.site.whatsapp === undefined) {
    problems.push("data/sections.json opens WhatsApp (an order, pricing or contact section, or a \"whatsapp\" link) but data/site.json has no whatsapp number");
  }
  return problems;
}
