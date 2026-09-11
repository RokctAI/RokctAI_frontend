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

// That these call sites ISSUE A REQUEST AT ALL — the one thing the bug they
// came from took away. `FrappeApp.call()` takes zero arguments and returns a
// `FrappeCall` builder, so each of them used to discard its argument, touch
// the network never, and hand its caller an SDK object. Nothing threw and
// nothing logged, which is exactly why a test that only checked return
// values could have passed against the broken code.
//
// So the assertions here are about the wire: a request happened, it went to
// the ONE gateway path, it carried the cmd this call site means to send, and
// it carried the payload. The real gateway runs — the vendored kernel in
// .rokct/cache/base/src/services, which is the source the composer installs
// as app/services/base/platform-gateway.ts — and only `fetch` is faked.
//
// Staged the way base_sdk's own tests stage that kernel (and the way
// tests/platform-status.test.mts did in PR #141): the services are copied to
// a temp dir with their extensionless relative imports rewritten to `.ts`,
// session.ts's host seam (`server-only`, `@/app/lib/session`) stood in by a
// null session, and each module under test has its `@/` imports pointed at
// the stage, so node loads everything with type stripping. Run from the
// repository root:
//
//     node --experimental-strip-types --no-warnings --test \
//       tests/gateway-call-sweep.test.mts
//
// Not covered here, deliberately: app/services/public/versions.ts (its
// three-way `Promise.allSettled` needs a GlobalSettings stub of its own) and
// app/test-connection/page.tsx (JSX, which type stripping will not load).
// Every host and value below is invented.

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, before, beforeEach, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const KERNEL = path.join(ROOT, ".rokct", "cache", "base", "src", "services");

// `NEXT_PUBLIC_FRAPPE_URL` is the platform default — the origin
// `getControlClient()` resolved to by deliberately ignoring the session's
// tenant site. The tenant origin comes from the session, as it did through
// `getPaaSClient()`.
const TENANT = "https://tenant.call-sweep.test";
const CONTROL = "https://control.call-sweep.test";
const GATEWAY_PATH = "/api/v1/method/rokct.platform.api";
const RELATIVE_IMPORT = /(from\s+')(\.\/[a-z0-9-]+)(')/g;

/** The modules under test. */
const MODULES = [
  "app/services/tenant/onboarding.ts",
  "app/services/tenant/subscriptions.ts",
  "app/actions/handson/tenant/settings/users.ts",
  "app/actions/handson/all/workspace/calendar.ts",
  "app/actions/handson/all/workspace/communication.ts",
  "app/actions/handson/all/settings/profile.ts",
  "app/actions/handson/control/rpanel/files.ts",
  "app/actions/handson/control/rpanel/dashboard/get-client-usage.ts",
  "app/lib/search.ts",
] as const;

/** `revalidatePath` is Next's, not the gateway's — communication.ts's one seam. */
const NEXT_CACHE_STUB = `export function revalidatePath(_path: string): void {}\n`;

const flatName = (rel: string) => `${rel.replace(/[/.]/g, "_")}.ts`;

/**
 * Copies the kernel into a temp directory plain node can load, adds the one
 * Next.js stub, then copies each module under test in beside it with its
 * `@/` imports rewritten. Returns the staged directory.
 */
function stage(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rokct-callsweep-"));

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
      // A signed-in tenant session, so the two targets stay distinguishable:
      // a tenant-side call resolves to `siteName`, a control-side one to the
      // explicit baseUrl. The credentials let the header assertions below
      // show where they are and are not sent.
      src = src
        .replace("import 'server-only';\n", "")
        .replace(
          "import { getCurrentSession } from '@/app/lib/session';",
          "const getCurrentSession = async (): Promise<unknown> => ({\n" +
            "  user: {\n" +
            "    siteName: process.env.ROKCT_TEST_TENANT,\n" +
            "    apiKey: 'k',\n" +
            "    apiSecret: 's',\n" +
            "  },\n" +
            "});",
        );
    }
    fs.writeFileSync(path.join(dir, name), src);
  }
  fs.writeFileSync(path.join(dir, "next-cache.ts"), NEXT_CACHE_STUB);

  for (const rel of MODULES) {
    const src = fs
      .readFileSync(path.join(ROOT, rel), "utf8")
      .replace(
        '"@/app/services/base/platform-gateway"',
        '"./platform-gateway.ts"',
      )
      .replace('"next/cache"', '"./next-cache.ts"');
    assert.ok(
      !src.includes('from "@/'),
      `${rel} imports something the stage does not cover`,
    );
    // A flat stage, so two modules never collide on a basename.
    fs.writeFileSync(path.join(dir, flatName(rel)), src);
  }
  return dir;
}

/** One observed request: where it went, and what it carried. */
interface Sent {
  url: string;
  method: string;
  cmd: string | null;
  payload: unknown;
  authorization: string | undefined;
}

/** Answers in order with 2xx `{message: body}`, recording what was sent. */
function install(...bodies: unknown[]): Sent[] {
  const sent: Sent[] = [];
  const queue = bodies.length ? [...bodies] : [{ ok: true }];
  globalThis.fetch = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = String(input);
    const method = String(init?.method ?? "GET").toUpperCase();
    let cmd: string | null = null;
    let payload: unknown;
    if (method === "GET") {
      const params = new URL(url).searchParams;
      cmd = params.get("cmd");
      const raw = params.get("payload");
      payload = raw === null ? undefined : JSON.parse(raw);
    } else if (typeof init?.body === "string") {
      const body = JSON.parse(init.body) as { cmd?: string; payload?: unknown };
      cmd = body.cmd ?? null;
      payload = body.payload;
    }
    const headers = (init?.headers ?? {}) as Record<string, string>;
    sent.push({
      url,
      method,
      cmd,
      payload,
      authorization: headers.Authorization,
    });
    const next = queue.length > 1 ? queue.shift() : queue[0];
    return new Response(JSON.stringify({ message: next }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return sent;
}

/**
 * Asserts the cmds that reached the wire, that each rode the one gateway
 * door on the expected origin, and where the session's credentials went.
 *
 * The kernel's credential guard only lets a session authenticate calls to
 * its own site, so a tenant-side call carries `token k:s` and a call steered
 * at the control plane carries none — one behavioural difference from
 * `getControlClient()`, which sent them to both.
 */
function assertWire(sent: Sent[], cmds: string[], origin = TENANT) {
  assert.deepEqual(
    sent.map((s) => s.cmd),
    cmds,
    "the cmds that reached the wire, in order",
  );
  for (const s of sent) {
    assert.equal(
      s.url,
      `${origin}${GATEWAY_PATH}`,
      "every call rides the one gateway path, never a per-method URL",
    );
    assert.equal(s.method, "POST", "the canonical `{cmd, payload}` POST");
    assert.equal(
      s.authorization,
      origin === TENANT ? "token k:s" : undefined,
      "the session's credentials go to the session's own site only",
    );
  }
}

const mods: Record<string, any> = {};
const realFetch = globalThis.fetch;
const realError = console.error;

before(async () => {
  // Set before the kernel is imported: tenant-host-control registers its
  // resolver at module load, and nothing here should reach for a host map.
  process.env.ROKCT_BASE_URL = CONTROL;
  process.env.NEXT_PUBLIC_FRAPPE_URL = CONTROL;
  process.env.ROKCT_TEST_TENANT = TENANT;
  process.env.ROKCT_TENANT_HOST_LOOKUP = "off";

  const dir = stage();
  for (const rel of MODULES) {
    mods[rel] = await import(pathToFileURL(path.join(dir, flatName(rel))).href);
  }
});

beforeEach(() => {
  console.error = () => {};
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
});

describe("every converted call site issues a real gateway request", () => {
  it("onboarding: commit_onboarding_answers, with its payload", async () => {
    const { OnboardingService } = mods["app/services/tenant/onboarding.ts"];
    const sent = install({ status: "success" });

    await OnboardingService.commitOnboardingAnswers({
      profile_type: "business",
      instance_name: "acme",
      answers: { q1: "a1" },
      milestones: [{ title: "m1" }],
    });

    assertWire(sent, ["api.plan_builder.commit_onboarding_answers"]);
    // The kwargs the old `args:` object meant to send, intact.
    assert.deepEqual(sent[0].payload, {
      profile_type: "business",
      instance_name: "acme",
      answers: '{"q1":"a1"}',
      milestones: '[{"title":"m1"}]',
    });
  });

  it("onboarding: chat_with_rok, and its reply is unwrapped", async () => {
    const { OnboardingService } = mods["app/services/tenant/onboarding.ts"];
    const sent = install({ status: "success", message: "hello from ROK" });

    const res = await OnboardingService.chatWithRok("hi", "s1", "m1");

    assertWire(sent, ["api.plan_builder.chat_with_rok"]);
    assert.deepEqual(sent[0].payload, {
      message: "hi",
      session_id: "s1",
      model: "m1",
    });
    // The chat consumer reads `res.message`. With the envelope hop gone that
    // is the reply text, not the envelope — and not a `FrappeCall`.
    assert.equal(res.message, "hello from ROK");
  });

  it("subscriptions: get_subscription_details, prefix-free", async () => {
    const { SubscriptionService } =
      mods["app/services/tenant/subscriptions.ts"];
    const sent = install({ plan_name: "Growth", status: "Active" });

    const status = await SubscriptionService.getSubscriptionStatus();

    assertWire(sent, ["tenant.api.get_subscription_details"]);
    // It used to be impossible to see anything but the fallback below.
    assert.deepEqual(status, { plan_name: "Growth", status: "Active" });
  });

  it("subscriptions: still falls back when the gateway refuses", async () => {
    globalThis.fetch = (async () =>
      new Response("nope", { status: 503 })) as typeof fetch;
    const { SubscriptionService } =
      mods["app/services/tenant/subscriptions.ts"];

    assert.deepEqual(await SubscriptionService.getSubscriptionStatus(), {
      plan_name: "Simple",
      status: "Active",
    });
  });

  it("settings/users: get_list", async () => {
    const users = mods["app/actions/handson/tenant/settings/users.ts"];
    const sent = install([{ name: "a@b.test" }]);

    assert.deepEqual(await users.getUsers(), [{ name: "a@b.test" }]);

    assertWire(sent, ["frappe.client.get_list"]);
    assert.equal((sent[0].payload as any).doctype, "User");
  });

  it("settings/users: insert then set_value for the roles", async () => {
    const users = mods["app/actions/handson/tenant/settings/users.ts"];
    const sent = install({ name: "a@b.test" });

    const created = await users.createUser({
      email: "a@b.test",
      first_name: "A",
      role: "Viewer",
    });

    assertWire(sent, ["frappe.client.insert", "frappe.client.set_value"]);
    assert.equal(created.success, true);
    // `userRes` is the inserted doc, which the old `.message` read wanted.
    assert.deepEqual(created.message, { name: "a@b.test" });
    assert.deepEqual((sent[1].payload as any).fieldname, {
      roles: [{ role: "System User" }, { role: "Viewer" }],
    });
  });

  it("workspace/calendar: get_list", async () => {
    const calendar = mods["app/actions/handson/all/workspace/calendar.ts"];
    const sent = install([{ name: "EV-1" }]);

    const res = await calendar.getCalendarEvents("2026-01-01", "2026-01-31");

    assertWire(sent, ["frappe.client.get_list"]);
    assert.deepEqual(res, { success: true, events: [{ name: "EV-1" }] });
    assert.deepEqual((sent[0].payload as any).filters, {
      starts_on: [">=", "2026-01-01"],
      ends_on: ["<=", "2026-01-31"],
    });
  });

  it("workspace/communication: get_list", async () => {
    const comms = mods["app/actions/handson/all/workspace/communication.ts"];
    const sent = install([{ name: "C-1" }]);

    assert.deepEqual(await comms.getCommunications("Issue", "ISS-1"), [
      { name: "C-1" },
    ]);

    assertWire(sent, ["frappe.client.get_list"]);
  });

  it("workspace/communication: insert for a comment", async () => {
    const comms = mods["app/actions/handson/all/workspace/communication.ts"];
    const sent = install({ name: "C-2" });

    assert.equal(
      (await comms.addComment("Issue", "ISS-1", "hi")).success,
      true,
    );

    assertWire(sent, ["frappe.client.insert"]);
    assert.equal((sent[0].payload as any).doc.content, "hi");
  });

  it("settings/profile: set_value", async () => {
    const profile = mods["app/actions/handson/all/settings/profile.ts"];
    const sent = install({ first_name: "A" });

    const res = await profile.updateUserProfile("a@b.test", {
      first_name: "A",
    });

    assertWire(sent, ["frappe.client.set_value"]);
    assert.deepEqual(res, { success: true, message: { first_name: "A" } });
  });

  it("lib/search: an exact hit needs one get_value", async () => {
    const { findFuzzyMatch } = mods["app/lib/search.ts"];
    const sent = install({ name: "Acme Supplies" });

    assert.deepEqual(await findFuzzyMatch("Supplier", "Acme Supplies"), {
      success: true,
      value: "Acme Supplies",
    });

    assertWire(sent, ["frappe.client.get_value"]);
  });

  it("lib/search: a miss falls through to the fuzzy get_list", async () => {
    const { findFuzzyMatch } = mods["app/lib/search.ts"];
    // No exact hit, then one suggestion. The broken version made neither
    // request and answered "not found" for a document that exists.
    const sent = install({}, [{ name: "Acme Supplies" }]);

    const res = await findFuzzyMatch("Supplier", "Acme");

    assertWire(sent, ["frappe.client.get_value", "frappe.client.get_list"]);
    assert.equal(res.success, false);
    assert.match(String(res.error), /Did you mean 'Acme Supplies'/);
    assert.deepEqual(res.suggestions, ["Acme Supplies"]);
  });

  it("rpanel/files: get_file_list, on the control plane", async () => {
    const files = mods["app/actions/handson/control/rpanel/files.ts"];
    const sent = install({ files: [] });

    assert.deepEqual(await files.getFiles("site.test", "/"), {
      success: true,
      data: { files: [] },
    });

    // The explicit baseUrl keeps it off the tenant, as getControlClient did.
    assertWire(sent, ["rpanel.hosting.file_manager.get_file_list"], CONTROL);
  });

  it("rpanel/files: delete_file, on the control plane", async () => {
    const files = mods["app/actions/handson/control/rpanel/files.ts"];
    const sent = install({});

    assert.deepEqual(await files.deleteFile("site.test", "/a.txt"), {
      success: true,
    });

    assertWire(sent, ["rpanel.hosting.file_manager.delete_file"], CONTROL);
    assert.deepEqual(sent[0].payload, {
      website_name: "site.test",
      file_path: "/a.txt",
    });
  });

  it("rpanel/dashboard: get_client_usage, on the control plane", async () => {
    const usage =
      mods["app/actions/handson/control/rpanel/dashboard/get-client-usage.ts"];
    const sent = install({ success: true, usage: {} });

    assert.deepEqual(await usage.getClientUsage(), {
      success: true,
      usage: {},
    });

    assertWire(
      sent,
      ["rpanel.hosting.doctype.hosting_client.hosting_client.get_client_usage"],
      CONTROL,
    );
  });
});
