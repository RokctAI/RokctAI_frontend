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

// base_sdk 1.45.0: the public terms list falls back to the shell's bundled
// data/legal/ pages when the backend publishes nothing. Executes the real
// app/actions/base/legal.ts under node's test runner with type stripping,
// staged beside the real legal-links.ts, kinds.ts and read-site-data.ts,
// a stub platform gateway whose answer each case sets, and a generated.ts
// the real generator wrote from tests/fixtures/site-data/acme (hybrid
// mode, two legal pages) - or the neutral module for the backend case.
//
//   node --experimental-strip-types --no-warnings --test tests/legal-fallback.test.mts

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import { generateSiteData } from "../templates/lib/site-data/generate.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SDK_ROOT = path.resolve(HERE, "..");
const TEMPLATES = path.join(SDK_ROOT, "templates");
const FIXTURE = path.join(HERE, "fixtures", "site-data", "acme");
const SITE_DATA = path.join(TEMPLATES, "lib", "site-data");
const LANDING = path.join(TEMPLATES, "components", "custom", "landing");
const LEGAL_ACTION = path.join(TEMPLATES, "app", "actions", "base", "legal.ts");

/** What the stage stands in for the platform gateway: one settable answer. */
const GATEWAY_STUB = `
export interface GatewayCall { cmd: string; payload: unknown; options: unknown }
export const calls: GatewayCall[] = [];
let answer: unknown = null;
let failure: Error | null = null;
export function answerWith(value: unknown): void { answer = value; failure = null; }
export function failWith(error: Error): void { failure = error; }
export async function platformCall<T = unknown>(cmd: string, payload?: unknown, options?: unknown): Promise<T | null> {
  calls.push({ cmd, payload, options });
  if (failure) throw failure;
  return answer as T | null;
}
`;

interface Stage {
  legal: typeof import("../templates/app/actions/base/legal.ts");
  gateway: {
    calls: { cmd: string; payload: unknown; options: unknown }[];
    answerWith(value: unknown): void;
    failWith(error: Error): void;
  };
  links: typeof import("../templates/components/custom/landing/legal-links.ts");
}

function rewrite(file: string, rewrites: Record<string, string>): string {
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of Object.entries(rewrites)) {
    assert.ok(text.includes(from), `${path.basename(file)} no longer carries ${from}`);
    text = text.replaceAll(from, to);
  }
  const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.ok(!code.includes('from "@/'), `${path.basename(file)} imports something the stage does not cover`);
  return text;
}

/**
 * A stage: the real modules with their `@/` imports pointed at each
 * other, plus a generated.ts built by the real generator from a copy of
 * the fixture with `compose` applied to it (or the neutral module when
 * `compose` is null).
 */
async function stage(compose: ((root: string) => void) | null): Promise<Stage> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "legal-fallback-"));
  fs.writeFileSync(
    path.join(dir, "legal.ts"),
    rewrite(LEGAL_ACTION, {
      'from "@/app/services/base/platform-gateway"': 'from "./platform-gateway.ts"',
      'from "@/components/custom/landing/legal-links"': 'from "./legal-links.ts"',
      'from "@/lib/site-data/read-site-data"': 'from "./read-site-data.ts"',
    }),
  );
  fs.writeFileSync(
    path.join(dir, "legal-links.ts"),
    rewrite(path.join(LANDING, "legal-links.ts"), {
      'from "@/components/custom/landing/footer-chrome-config"': 'from "./footer-chrome-config.ts"',
    }),
  );
  // footer-chrome-config.ts imports only a type from brand-marks; type
  // stripping erases it, as the legal-links suite already relies on.
  fs.copyFileSync(path.join(LANDING, "footer-chrome-config.ts"), path.join(dir, "footer-chrome-config.ts"));
  fs.writeFileSync(
    path.join(dir, "read-site-data.ts"),
    rewrite(path.join(SITE_DATA, "read-site-data.ts"), {
      'import "server-only";\n': "",
      'from "./generated";': 'from "./generated.ts";',
      'from "./kinds";': 'from "./kinds.ts";',
    }),
  );
  fs.writeFileSync(
    path.join(dir, "kinds.ts"),
    rewrite(path.join(SITE_DATA, "kinds.ts"), {}),
  );
  fs.writeFileSync(path.join(dir, "platform-gateway.ts"), GATEWAY_STUB);
  if (compose) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "legal-fallback-acme-"));
    fs.cpSync(FIXTURE, root, { recursive: true });
    compose(root);
    const result = generateSiteData(root, { out: path.join(dir, "generated.ts") });
    assert.match(result.lines[1], /generated\.ts written$/);
  } else {
    fs.copyFileSync(path.join(SITE_DATA, "generated.ts"), path.join(dir, "generated.ts"));
  }
  const load = (name: string) => import(pathToFileURL(path.join(dir, name)).href);
  return {
    legal: await load("legal.ts"),
    gateway: await load("platform-gateway.ts"),
    links: await load("legal-links.ts"),
  };
}

/** The two fixture pages, in slug order, as the public shape. */
const FIXTURE_TERMS = [
  { name: "privacy", title: "Privacy notice", disabled: false },
  { name: "terms", title: "Terms of use", disabled: false },
];

const PUBLISHED_ROWS = [
  { name: "cookie-policy", title: "Cookie Policy", disabled: 0 },
  { name: "terms", title: "Terms of Service", disabled: "0" },
  { name: "old", title: "Old Terms", disabled: 1 },
];

const PUBLISHED_TERMS = [
  { name: "cookie-policy", title: "Cookie Policy", disabled: false },
  { name: "terms", title: "Terms of Service", disabled: false },
];

/** Keeps the soft-fail's console.error out of the runner's output. */
async function quietly<T>(fn: () => Promise<T>): Promise<T> {
  const original = console.error;
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.error = original;
  }
}

describe("listPublicTerms on a hybrid shell that bundles data/legal", () => {
  let s: Stage;
  before(async () => {
    s = await stage(() => {});
  });

  it("asks the backend first, as a guest, for the enabled documents", async () => {
    s.gateway.answerWith(null);
    await s.legal.listPublicTerms();
    const call = s.gateway.calls.at(-1)!;
    assert.equal(call.cmd, "frappe.client.get_list");
    assert.deepEqual(call.options, { requireAuth: false });
    assert.equal((call.payload as { doctype: string }).doctype, s.links.LEGAL_DOCTYPE);
    assert.deepEqual((call.payload as { filters: unknown }).filters, { disabled: 0 });
  });

  it("answers the bundled pages when the gateway answers null (no backend, a refused read)", async () => {
    s.gateway.answerWith(null);
    assert.deepEqual(await s.legal.listPublicTerms(), FIXTURE_TERMS);
  });

  it("answers the bundled pages when the backend has published nothing", async () => {
    s.gateway.answerWith([]);
    assert.deepEqual(await s.legal.listPublicTerms(), FIXTURE_TERMS);
    s.gateway.answerWith({ message: [] });
    assert.deepEqual(await s.legal.listPublicTerms(), FIXTURE_TERMS);
    s.gateway.answerWith([{ name: "gone", title: "Gone", disabled: 1 }]);
    assert.deepEqual(await s.legal.listPublicTerms(), FIXTURE_TERMS);
  });

  it("answers the bundled pages, never a throw, when the call fails", async () => {
    s.gateway.failWith(new Error("connection refused"));
    assert.deepEqual(await quietly(() => s.legal.listPublicTerms()), FIXTURE_TERMS);
  });

  it("returns the backend's rows unchanged when it publishes any: the bundled pages are never merged in", async () => {
    s.gateway.answerWith(PUBLISHED_ROWS);
    assert.deepEqual(await s.legal.listPublicTerms(), PUBLISHED_TERMS);
    s.gateway.answerWith({ message: PUBLISHED_ROWS });
    assert.deepEqual(await s.legal.listPublicTerms(), PUBLISHED_TERMS);
  });

  it("hands the footer one Legal group with a /legal/<slug> link per bundled page", async () => {
    s.gateway.answerWith(null);
    const groups = s.links.legalFooterLinks(await s.legal.listPublicTerms());
    assert.equal(groups.length, 1);
    assert.deepEqual(groups[0].items, [
      { id: "legal-privacy", label: "Privacy notice", href: "/legal/privacy" },
      { id: "legal-terms", label: "Terms of use", href: "/legal/terms" },
    ]);
  });

  it("answers a fresh list each time", async () => {
    s.gateway.answerWith(null);
    const first = await s.legal.listPublicTerms();
    first.push({ name: "extra", title: "Extra", disabled: false });
    assert.deepEqual(await s.legal.listPublicTerms(), FIXTURE_TERMS);
  });
});

describe("listPublicTerms on a local shell that bundles data/legal", () => {
  it("answers the bundled pages with no backend", async () => {
    const s = await stage((root) => {
      fs.writeFileSync(path.join(root, "composer.json"), JSON.stringify({ data: "local", sdks: [] }));
    });
    s.gateway.answerWith(null);
    assert.deepEqual(await s.legal.listPublicTerms(), FIXTURE_TERMS);
  });
});

describe("listPublicTerms on a shell that bundles no legal pages", () => {
  it("is empty on a backend-mode shell (the neutral generated.ts), whatever data/ holds", async () => {
    const s = await stage(null);
    s.gateway.answerWith(null);
    assert.deepEqual(await s.legal.listPublicTerms(), []);
    s.gateway.answerWith([]);
    assert.deepEqual(await s.legal.listPublicTerms(), []);
    s.gateway.answerWith(PUBLISHED_ROWS);
    assert.deepEqual(await s.legal.listPublicTerms(), PUBLISHED_TERMS);
  });

  it("is empty on a hybrid shell whose data/ has no legal folder", async () => {
    const s = await stage((root) => {
      fs.rmSync(path.join(root, "data", "legal"), { recursive: true });
    });
    s.gateway.answerWith(null);
    assert.deepEqual(await s.legal.listPublicTerms(), []);
    s.gateway.failWith(new Error("connection refused"));
    assert.deepEqual(await quietly(() => s.legal.listPublicTerms()), []);
    s.gateway.answerWith(PUBLISHED_ROWS);
    assert.deepEqual(await s.legal.listPublicTerms(), PUBLISHED_TERMS);
  });
});
