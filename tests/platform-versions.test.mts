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

// What the platform version read is allowed to state, and that coming back
// empty-handed is a VALUE rather than a fault.
//
// Three outcomes, all driven through the REAL gateway - the vendored kernel
// in .rokct/cache/base/src/services, which is the source the composer
// installs as app/services/base/platform-gateway.ts - with only `fetch`
// faked. So "a 2xx that carries nothing" is an actual 2xx that carries
// nothing, and "the hub did not answer" is an actual non-2xx off the wire,
// not a stubbed return value:
//
//   1. a real version answer is reported,
//   2. a hub that answers but names no version reports nothing,
//   3. a hub that does not answer at all reports nothing - quietly, with
//      nothing thrown and nothing logged.
//
// (3) is asserted as the ABSENCE OF AN ERROR PATH, not merely the absence
// of text: console.error and console.warn are counted, and a count above
// zero fails. The gateway logs on its own account for a transport failure
// (`platform-gateway.ts`, the catch), so the unavailability asserted as
// silent is the non-2xx one, and the transport case is asserted separately
// for its return value alone.
//
// Staged the way tests/gateway-call-sweep.test.mts stages that kernel: the
// services are copied to a temp dir with their extensionless relative
// imports rewritten to `.ts`, session.ts's host seam (`server-only`,
// `@/app/lib/session`) stood in by a null session, GlobalSettings stood in
// by a plain object (it is Postgres-backed, not a gateway call), and
// versions.ts's `@/` imports pointed at the stage, so node loads everything
// with type stripping. Run from the repository root:
//
//     node --experimental-strip-types --no-warnings --test \
//       tests/platform-versions.test.mts
//
// Every host and every version number below is invented.

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

const CONTROL = "https://control.versions-read.test";
const GATEWAY_PATH = "/api/v1/method/rokct.platform.api";
const RELATIVE_IMPORT = /(from\s+')(\.\/[a-z0-9-]+)(')/g;

/** GlobalSettings is Postgres-backed, so the stage stands it in wholesale. */
const GLOBAL_SETTINGS_STUB = `export const GlobalSettingsService = {
  getGlobalSettings: async () => ({ isBetaMode: true, isDebugMode: false }),
};
`;

/**
 * Copies the kernel and the service under test into a temp directory that
 * plain node can load, and returns the staged versions.ts.
 */
function stage(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rokct-versions-"));

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
      // Signed out: this read is a guest read, and the explicit control
      // baseUrl means no session is consulted for the origin either.
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

function fakeFetch(...answers: Answer[]): FakeFetch {
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

interface PlatformVersion {
  title: string;
  version: string;
}
type PlatformVersions = Record<string, PlatformVersion>;

let getPublicVersions: () => Promise<PlatformVersions>;
let readVersionMap: (answer: unknown) => PlatformVersions;
let PUBLIC_VERSIONS_CMD: string;

const realFetch = globalThis.fetch;
const realError = console.error;
const realWarn = console.warn;

/** Everything the read said on the way past, so silence can be asserted. */
let logged: string[] = [];

before(async () => {
  const mod = await import(pathToFileURL(stage()).href);
  getPublicVersions = mod.VersionsService.getPublicVersions;
  readVersionMap = mod.readVersionMap;
  PUBLIC_VERSIONS_CMD = mod.PUBLIC_VERSIONS_CMD;
});

beforeEach(() => {
  process.env.ROKCT_BASE_URL = CONTROL;
  logged = [];
  console.error = (...args: unknown[]) => {
    logged.push(`error: ${args.map(String).join(" ")}`);
  };
  console.warn = (...args: unknown[]) => {
    logged.push(`warn: ${args.map(String).join(" ")}`);
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
  console.warn = realWarn;
});

describe("the platform version read", () => {
  it("reports a version the hub actually answered", async () => {
    const fake = fakeFetch(
      json('{"message": {"alpha": {"title": "Alpha", "version": "3.2.1"}}}'),
    );
    globalThis.fetch = fake.fetch;

    const versions = await getPublicVersions();

    assert.deepEqual(versions, { alpha: { title: "Alpha", version: "3.2.1" } });
    assert.equal(fake.calls.length, 1);
    // Through the ONE gateway door, as the control-prefixed cmd. An
    // app-prefixed cmd would be routable nowhere, so assert what went out.
    assert.ok(fake.calls[0].startsWith(`${CONTROL}${GATEWAY_PATH}?`));
    assert.match(fake.calls[0], /cmd=control%3Aget_versions/);
    assert.equal(PUBLIC_VERSIONS_CMD, "control:get_versions");
    assert.deepEqual(logged, []);
  });

  it("names an entry by its key when the hub gave it no title", async () => {
    globalThis.fetch = fakeFetch(
      json('{"message": {"beta": {"version": "0.9.0"}}}'),
    ).fetch;

    assert.deepEqual(await getPublicVersions(), {
      beta: { title: "beta", version: "0.9.0" },
    });
    assert.deepEqual(logged, []);
  });

  it("reports nothing when a reachable hub names no version", async () => {
    // Answered, and with a well-formed 2xx - there is simply no version in
    // it. Each of these is a shape the gateway can hand back from a 200.
    const nothings = [
      json("null"), // body parses to JSON null
      json('{"message": null}'), // the envelope with nothing inside it
      json("{}"), // an empty map
      json('{"gamma": {"version": null}}'), // a key, but no version
      json('{"delta": {"version": ""}}'), // a version that says nothing
      json('{"epsilon": {"version": 7}}'), // a number where a string belongs
      json('{"zeta": "1.0.0"}'), // a bare string where an entry belongs
      json('{"eta": {}}'), // an entry with nothing in it
    ];

    for (const answer of nothings) {
      const fake = fakeFetch(answer);
      globalThis.fetch = fake.fetch;

      assert.deepEqual(await getPublicVersions(), {});
      assert.equal(fake.calls.length, 1, "it asked, and it got a 2xx");
      assert.deepEqual(logged, [], "a hub with nothing to say is not an error");
    }
  });

  it("reports nothing, quietly, when the hub does not answer", async () => {
    // The case the read exists for: unavailable is ordinary. Nothing is
    // thrown and NOTHING IS LOGGED - the absence of an error path, not
    // merely the absence of a version string.
    for (const status of [404, 417, 500, 502, 503]) {
      const fake = fakeFetch(json('{"exc": "nope"}', status));
      globalThis.fetch = fake.fetch;

      const versions = await getPublicVersions();

      assert.deepEqual(versions, {}, `HTTP ${status}`);
      assert.equal(fake.calls.length, 1, `HTTP ${status}: it did ask`);
      assert.deepEqual(
        logged,
        [],
        `HTTP ${status} is an unavailable hub, not an error to report`,
      );
    }
  });

  it("reports nothing when there is no origin to ask", async () => {
    delete process.env.ROKCT_BASE_URL;
    const fake = fakeFetch();
    globalThis.fetch = fake.fetch;

    assert.deepEqual(await getPublicVersions(), {});
    assert.equal(fake.calls.length, 0, "nothing to ask, so it did not ask");
    assert.deepEqual(logged, []);
  });

  it("reports nothing rather than throwing on a transport failure", async () => {
    // The gateway logs this one on its own account (platform-gateway.ts's
    // catch), which is base_sdk's call, not this read's - so only the
    // return value is asserted here: still a value, still not a throw.
    globalThis.fetch = fakeFetch("network").fetch;
    assert.deepEqual(await getPublicVersions(), {});
  });

  it("never lets a non-version reach a version slot", async () => {
    // The shape of the old bug: `FrappeApp.call()` returned a builder
    // object and it landed where a version string belongs. Only a string
    // is a version, whatever else arrives.
    const notVersions: unknown[] = [
      null,
      undefined,
      "1.0.0",
      42,
      [{ version: "1.0.0" }],
      { theta: { version: { toString: () => "1.0.0" } } },
      { iota: { version: ["1.0.0"] } },
    ];

    for (const answer of notVersions) {
      assert.deepEqual(readVersionMap(answer), {}, JSON.stringify(answer));
    }
  });

  it("keeps every entry the hub did put a version on", async () => {
    globalThis.fetch = fakeFetch(
      json(
        '{"message": {"kappa": {"title": "Kappa", "version": "2.0.0"},' +
          ' "lambda": {"version": "1.1.0"}, "mu": {"version": null}}}',
      ),
    ).fetch;

    assert.deepEqual(await getPublicVersions(), {
      kappa: { title: "Kappa", version: "2.0.0" },
      lambda: { title: "lambda", version: "1.1.0" },
    });
    assert.deepEqual(logged, []);
  });
});
