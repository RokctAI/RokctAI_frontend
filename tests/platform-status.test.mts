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

// What the footer's status pill is allowed to claim: the three states of
// VersionsService.getPlatformStatus(), driven through the REAL gateway
// (the vendored kernel in .rokct/cache/base/src/services, which is the
// source the composer installs as app/services/base/platform-gateway.ts)
// with only `fetch` faked. So "a 200 whose body is JSON null" is an
// actual 200 whose body is JSON null, not a stubbed return value.
//
// Staged the way base_sdk's own tests/test_manifest.py stages that
// kernel: the services are copied to a temp dir with their extensionless
// relative imports rewritten to `.ts`, session.ts's host seam
// (`server-only`, `@/app/lib/session`) stood in by a null session, and
// versions.ts's two `@/` imports pointed at the stage, so node loads
// them with type stripping. Run from the repository root:
//
//     node --experimental-strip-types --no-warnings --test \
//       tests/platform-status.test.mts
//
// Every host here is invented.

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, before, beforeEach, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const KERNEL = path.join(ROOT, ".rokct", "cache", "base", "src", "services");
const SERVICE = path.join(ROOT, "app", "services", "public", "versions.ts");

const CONTROL = "https://control.status-pill.test";
const RELATIVE_IMPORT = /(from\s+')(\.\/[a-z0-9-]+)(')/g;

/** GlobalSettings is getPublicVersions' dependency, not the probe's. */
const GLOBAL_SETTINGS_STUB = `export const GlobalSettingsService = {
  getGlobalSettings: async () => ({ isDebugMode: false }),
};
`;

/**
 * Copies the kernel and the service under test into a temp directory that
 * plain node can load, and returns the staged versions.ts.
 */
function stage(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rokct-status-"));

  for (const name of fs.readdirSync(KERNEL)) {
    if (!name.endsWith(".ts")) continue;
    let src = fs
      .readFileSync(path.join(KERNEL, name), "utf8")
      .replace(RELATIVE_IMPORT, "$1$2.ts$3");
    if (name === "session.ts") {
      for (const needle of [
        "import 'server-only';\n",
        "import { getCurrentSession } from '@/app/lib/session';",
      ]) {
        assert.ok(
          src.includes(needle),
          "session.ts no longer carries the seam the stage replaces",
        );
      }
      src = src
        .replace("import 'server-only';\n", "")
        .replace(
          "import { getCurrentSession } from '@/app/lib/session';",
          "const getCurrentSession = async (): Promise<unknown> => null;",
        );
    }
    fs.writeFileSync(path.join(dir, name), src);
  }
  fs.writeFileSync(path.join(dir, "global_settings.ts"), GLOBAL_SETTINGS_STUB);

  const service = fs
    .readFileSync(SERVICE, "utf8")
    .replace(
      '"@/app/services/base/platform-gateway"',
      '"./platform-gateway.ts"',
    )
    .replace(
      '"@/app/services/control/global_settings"',
      '"./global_settings.ts"',
    );
  assert.ok(
    !service.includes('from "@/'),
    "versions.ts imports something the stage does not cover",
  );
  const staged = path.join(dir, "versions.ts");
  fs.writeFileSync(staged, service);
  return staged;
}

/** One scripted answer from the gateway door, or a transport failure. */
type Answer = Response | "network";

interface FakeFetch {
  calls: string[];
  fetch: typeof fetch;
}

function fakeFetch(answers: Answer[]): FakeFetch {
  const remaining = [...answers];
  const fake: FakeFetch = {
    calls: [],
    fetch: (async (input: string | URL | Request) => {
      fake.calls.push(String(input));
      const next = remaining.shift();
      if (next === undefined) throw new Error(`unscripted call: ${input}`);
      if (next === "network") throw new TypeError("fetch failed");
      return next;
    }) as typeof fetch,
  };
  return fake;
}

const json = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "application/json" },
  });

let getPlatformStatus: () => Promise<"online" | "offline" | "hidden">;
const realFetch = globalThis.fetch;
const realError = console.error;

before(async () => {
  const mod = await import(pathToFileURL(stage()).href);
  getPlatformStatus = mod.VersionsService.getPlatformStatus;
});

beforeEach(() => {
  process.env.ROKCT_BASE_URL = CONTROL;
  delete process.env.ROKCT_STATUS_SOURCE;
  console.error = () => {};
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
});

describe("getPlatformStatus", () => {
  it('is "online" when the platform answers with a value', async () => {
    const fake = fakeFetch([
      json('{"message": {"rcore": {"version": "1.0.0"}}}'),
    ]);
    globalThis.fetch = fake.fetch;

    assert.equal(await getPlatformStatus(), "online");
    assert.equal(fake.calls.length, 1);
    // Through the one gateway door, as the control-prefixed cmd.
    assert.match(fake.calls[0], /\/api\/v1\/method\/rokct\.platform\.api\?/);
    assert.match(fake.calls[0], /cmd=control%3Aget_versions/);
  });

  it('is "offline" when a 200 carries a null body', async () => {
    // The gap this test exists for: `throwOnError` cannot catch this one,
    // because there is no error — the gateway returns `null` from a
    // perfectly good 200. A green pill may not rest on it.
    const fake = fakeFetch([json("null")]);
    globalThis.fetch = fake.fetch;

    assert.equal(await getPlatformStatus(), "offline");
    assert.equal(fake.calls.length, 1, "it still asked, and still got a 200");
  });

  it('is "offline" when the probe throws', async () => {
    globalThis.fetch = fakeFetch(["network"]).fetch;
    assert.equal(await getPlatformStatus(), "offline");
  });

  it('is "offline" on a non-2xx', async () => {
    globalThis.fetch = fakeFetch([json('{"message": "nope"}', 503)]).fetch;
    assert.equal(await getPlatformStatus(), "offline");
  });

  it('is "hidden" only for the explicit off switch', async () => {
    for (const source of ["off", "none", "OFF", " off "]) {
      process.env.ROKCT_STATUS_SOURCE = source;
      const fake = fakeFetch([]);
      globalThis.fetch = fake.fetch;

      assert.equal(await getPlatformStatus(), "hidden", source);
      assert.equal(fake.calls.length, 0, "told not to ask, so it did not ask");
    }
  });

  it('never hides a pill because a probe came back empty', async () => {
    // Deliberate silence and accidental silence stay distinguishable: with
    // the switch unset, nothing the platform does can return "hidden".
    for (const answer of [json("null"), json("", 500), "network" as const]) {
      globalThis.fetch = fakeFetch([answer]).fetch;
      assert.equal(await getPlatformStatus(), "offline");
    }
  });
});
