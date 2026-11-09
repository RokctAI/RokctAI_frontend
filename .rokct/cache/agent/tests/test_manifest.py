# Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, version 3.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

"""Contract tests for agent/nextjs's manifest and what it injects into
auth_sdk's register registries and base_sdk's header (agent_sdk 1.12.0),
in auth/nextjs's style.

Run from the repository root:

    python3 -m unittest discover -s agent/nextjs/tests -v

Stdlib only. The behaviour tests are node's own (tests/*.test.mts), run
here against staged copies of the injected modules with the host, auth and
base modules they import replaced by tests/stubs, under
`node --experimental-strip-types --test` (node 22.6+).
"""

import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
MANIFEST = os.path.join(SDK_ROOT, "manifest.json")
TEMPLATES = os.path.join(SDK_ROOT, "templates")
AUTH_GROUP = os.path.join(TEMPLATES, "app", "(auth)")
STUBS = os.path.join(HERE, "stubs")

CONFIG = os.path.join(TEMPLATES, "components", "custom", "auth", "agent-register-config.ts")
PROVISION = os.path.join(AUTH_GROUP, "agent-register-provision.ts")
HELPERS = os.path.join(AUTH_GROUP, "agent-register-helpers.ts")
ACTIONS = os.path.join(AUTH_GROUP, "agent-register-actions.ts")
HEADER_MENU = os.path.join(TEMPLATES, "components", "custom", "landing", "agent-header-menu.ts")
# 1.19.0: /chat is a route - the root chat page under a second path.
CHAT_GROUP = os.path.join(TEMPLATES, "app", "(chat)")
ROOT_CHAT_PAGE = os.path.join(CHAT_GROUP, "page.tsx")
CHAT_ROUTE = os.path.join(CHAT_GROUP, "chat", "page.tsx")
CHAT_ID_PAGE = os.path.join(CHAT_GROUP, "chat", "[id]", "page.tsx")
# 1.13.0: rokct.ai's say over base_sdk 1.23.0's network strip.
NETWORK_STRIP = os.path.join(TEMPLATES, "components", "custom", "landing", "agent-network-strip.ts")
# 1.17.0 to 1.23.0 the logos marquee carried the strip on /landing; 1.24.0
# drew the strip nowhere and removed the section.
CUSTOM = os.path.join(TEMPLATES, "components", "custom")
LANDING = os.path.join(CUSTOM, "landing")
# 1.24.0: the redesign's shared copy, glyphs and stylesheet.
RK_CONTENT = os.path.join(LANDING, "rokct-landing-content.ts")
RK_UI = os.path.join(LANDING, "rokct-ui.tsx")
RK_CSS = os.path.join(LANDING, "rokct-landing.css")
RK_FONTS = os.path.join(LANDING, "rokct-fonts.ts")
RK_FONT_DIR = os.path.join(LANDING, "fonts", "rokct")
# 1.20.0: the chat's message shapes on AI SDK 6.
CHAT_MESSAGES = os.path.join(TEMPLATES, "lib", "agent-chat-messages.ts")
LANDING_CONFIG = os.path.join(TEMPLATES, "components", "custom", "landing", "agent-landing-config.ts")
# 1.15.0: the Chrome Web Store mark on the hero's badge and the header's
# extension button. 1.16.0: the files are base_sdk 1.26.0's, installed
# under public/brand/marks/ on every host; this SDK names their paths and
# ships nothing under templates/public.
HERO_COPY = os.path.join(TEMPLATES, "components", "custom", "landing", "agent-hero-copy.ts")
PUBLIC = os.path.join(TEMPLATES, "public")
MARKS_DIR = os.path.join(PUBLIC, "brand", "marks")
CHROME_MARK_PATH = "/brand/marks/chrome-web-store.svg"
GOOGLE_PLAY_MARK_PATH = "/brand/marks/google-play.svg"
APP_STORE_MARK_PATH = "/brand/marks/app-store.svg"

# The modules the node suites run against, staged into one directory.
STAGED = {
    "agent-register-config.ts": CONFIG,
    "agent-register-provision.ts": PROVISION,
    "agent-register-helpers.ts": HELPERS,
    "agent-header-menu.ts": HEADER_MENU,
    "agent-network-strip.ts": NETWORK_STRIP,
    "agent-hero-copy.ts": HERO_COPY,
    "agent-chat-messages.ts": CHAT_MESSAGES,
    "agent-opportunity-cards.ts": os.path.join(TEMPLATES, "lib", "agent-opportunity-cards.ts"),
}
NODE_SUITES = [
    "register-config.test.mts",
    "register-provision.test.mts",
    "network-strip.test.mts",
    "hero-copy.test.mts",
    "chat-messages.test.mts",
    "opportunity-cards.test.mts",
]

# The two registry lines this SDK injects, exactly as auth_sdk's README
# spells the contract: one self-contained line, a dynamic import, no
# import statement of its own.
REGISTER_LINE = re.compile(
    r'^  \{ id: "agent-register-config", load: \(\) => import\("@/components/custom/auth/agent-register-config"\) \},$'
)
PROVISION_LINE = re.compile(
    r'^  \{ id: "agent-register-provision", load: \(\) => import\("@/app/\(auth\)/agent-register-provision"\) \},$'
)

# Words no copy or comment of this SDK's new files may carry.
FORBIDDEN_WORDS = re.compile(r"\b(lorem|sample|demo|example)\b", re.I)
NEW_FILES = [CONFIG, PROVISION, HELPERS, ACTIONS, NETWORK_STRIP, HERO_COPY, CHAT_ROUTE]

# 1.13.0: the network-strip registry line, in base's one-line contract.
NETWORK_STRIP_LINE = re.compile(
    r'^  \{ id: "agent-network-strip", load: \(\) => import\("@/components/custom/landing/agent-network-strip"\) \},$'
)

# 1.15.0: the hero-copy registry line, in base's one-line contract.
HERO_COPY_LINE = re.compile(
    r'^  \{ id: "agent-hero", load: \(\) => import\("@/components/custom/landing/agent-hero-copy"\) \},$'
)

IMPORT_RE = re.compile(r'(from\s+|import\()\s*"([^"]+)"')

# 1.18.0: a page-sections registry line, and the directive a section ENTRY
# must not start with (base_sdk 1.32.0 reads its `meta` on the server).
PAGE_SECTION_LINE = re.compile(
    r'^  \{ id: "([a-z-]+)", load: \(\) => import\("@/components/custom/\1"\) \},$'
)
USE_CLIENT_RE = re.compile(r'^\s*["\']use client["\'];?\s*$', re.M)
# The sections whose browser half is a .client.tsx sibling, and the ones
# with nothing client-only in them, which stay whole. 1.24.0: the
# redesign's six sections and the live plan cards (pricing); the Merlin-era
# sections are gone.
SPLIT_SECTIONS = (
    "rokct-hero", "rokct-platform", "rokct-funding", "pricing", "rokct-closing",
)
WHOLE_SECTIONS = ("rokct-how", "rokct-plans")


def load_manifest():
    with open(MANIFEST, encoding="utf-8") as f:
        return json.load(f)


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def stage_module(src, dst):
    """Copy a template with its `@/` imports pointed at ./stubs and its
    relative imports given the .ts extension node wants."""
    def rewrite(match):
        prefix, spec = match.group(1), match.group(2)
        if spec.startswith("@/"):
            spec = "./stubs/" + spec[2:] + ".ts"
        elif spec.startswith("./") and not spec.endswith(".ts"):
            spec = spec + ".ts"
        return f'{prefix}"{spec}"'
    with open(dst, "w", encoding="utf-8") as f:
        f.write(IMPORT_RE.sub(rewrite, read(src)))


class TestManifest(unittest.TestCase):
    def setUp(self):
        self.manifest = load_manifest()

    def test_identity_and_version(self):
        self.assertEqual(self.manifest["name"], "agent_sdk")
        self.assertRegex(self.manifest["version"], r"^\d+\.\d+\.\d+$")

    def test_every_install_source_exists(self):
        for entry in self.manifest["installs"]:
            src = os.path.join(SDK_ROOT, entry["from"])
            self.assertTrue(os.path.exists(src), f"missing install source {entry['from']}")

    def test_install_targets_are_unique(self):
        targets = [e["to"] for e in self.manifest["installs"]]
        self.assertEqual(len(targets), len(set(targets)), "duplicate install target")

    def test_requires_are_not_installed(self):
        targets = {e["to"] for e in self.manifest["installs"]}
        for req in self.manifest["requires"]:
            self.assertNotIn(req, targets, f"{req} is both required and installed")

    def test_register_modules_are_installed(self):
        by_from = {e["from"]: e["to"] for e in self.manifest["installs"]}
        expected = {
            "templates/components/custom/auth/agent-register-config.ts": "components/custom/auth/agent-register-config.ts",
            "templates/app/(auth)/agent-register-provision.ts": "app/(auth)/agent-register-provision.ts",
            "templates/app/(auth)/agent-register-helpers.ts": "app/(auth)/agent-register-helpers.ts",
            "templates/app/(auth)/agent-register-actions.ts": "app/(auth)/agent-register-actions.ts",
        }
        for src, dst in expected.items():
            self.assertEqual(by_from.get(src), dst, src)

    def test_register_integrations_target_auth_registries(self):
        by_target = {}
        for entry in self.manifest["integrations"]:
            by_target.setdefault(entry["target"], []).append(entry)
        config = by_target.get("components/custom/auth/register-registry.ts", [])
        self.assertEqual(len(config), 1)
        self.assertEqual(config[0]["placeholder"], "// @rokct-sdk-register-start")
        self.assertRegex(config[0]["replacement"], REGISTER_LINE)
        provision = by_target.get("app/(auth)/register-provision.ts", [])
        self.assertEqual(len(provision), 1)
        self.assertEqual(provision[0]["placeholder"], "// @rokct-sdk-register-provision-start")
        self.assertRegex(provision[0]["replacement"], PROVISION_LINE)
        # The header menu registration is unchanged: one line, same id.
        header = by_target.get("components/custom/landing/header-menu.ts", [])
        self.assertEqual(len(header), 1)
        self.assertIn('id: "agent-header-menu"', header[0]["replacement"])

    def test_auth_contract_files_are_declared_prerequisites(self):
        for req in (
            "app/(auth)/tenant-link.ts",
            "app/(auth)/register-provision.ts",
            "components/custom/auth/register-registry.ts",
            "lib/actions/getSubscriptionPlans.ts",
            "app/services/base/platform-gateway.ts",
            "components/custom/landing/header-menu.ts",
            "app/lib/i18n/index.ts",
            "app/config/platform.ts",
        ):
            self.assertIn(req, self.manifest["requires"])

    def test_floors_are_stated(self):
        comment = self.manifest["_comment"]
        self.assertIn("base_sdk >= 1.20.0", comment["about"])
        # 1.13.0: the network-strip registry raises the floor.
        self.assertIn("base_sdk >= 1.23.0", read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.12.0")[0])
        self.assertIn("1.23.0", comment["about"])
        self.assertIn("auth_sdk >= 1.7.0", comment["about"])
        self.assertIn("base_sdk >= 1.23.0", comment["components/custom/landing/header-menu.ts"])
        # 1.14.0: the brand declaration and the secondary variant raise it again.
        self.assertIn("base_sdk >= 1.24.0", read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.13.0")[0])
        self.assertIn("1.24.0", comment["about"])
        self.assertIn("1.24.0", comment["components/custom/landing/header-menu.ts"])
        # 1.15.0: an image icon on a header action raises it to base_sdk 1.25.0.
        self.assertIn("base_sdk >= 1.25.0", read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.14.0")[0])
        self.assertIn("1.25.0", comment["about"])
        self.assertIn("1.25.0", comment["components/custom/landing/header-menu.ts"])
        self.assertIn("1.25.0", comment["components/custom/header-menu.tsx"])
        self.assertIn("base_sdk >= 1.23.0", comment["components/custom/landing/hero-config.ts"])
        self.assertIn("base_sdk >= 1.23.0", comment["components/custom/landing/hero-copy.ts"])
        # 1.16.0: the marks are base_sdk 1.26.0's files, so the floor is 1.26.0.
        self.assertIn("base_sdk >= 1.26.0", read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.15.0")[0])
        self.assertIn("1.26.0", comment["about"])
        for key in (
            "components/custom/landing/header-menu.ts",
            "components/custom/header-menu.tsx",
            "components/custom/landing/hero-config.ts",
            "components/custom/landing/hero-copy.ts",
        ):
            self.assertIn("base_sdk >= 1.26.0", comment[key], key)
        self.assertIn("auth_sdk >= 1.7.0", comment["components/custom/auth/register-registry.ts"])
        self.assertIn("auth_sdk >= 1.7.0", comment["app/(auth)/register-provision.ts"])
        self.assertIn("auth_sdk >= 1.6.0", comment["app/(auth)/tenant-link.ts"])
        # 1.17.0: the "section" placement is base_sdk 1.27.0's.
        self.assertIn("base_sdk >= 1.27.0", read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.16.0")[0])
        self.assertIn("1.27.0", comment["about"])
        self.assertIn("base_sdk >= 1.27.0", comment["components/custom/landing/network-strip.ts"])
        for key in ("components/custom/network-strip.tsx", "components/custom/landing/network-sites.ts"):
            self.assertIn(key, self.manifest["requires"], key)
            self.assertIn("base_sdk >= 1.23.0", comment[key], key)
        # 1.18.0: the server-rendered landing reads each entry's meta, base_sdk 1.32.0.
        self.assertIn("base_sdk >= 1.32.0", read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.17.0")[0])
        self.assertIn("1.32.0", comment["about"])
        self.assertIn("base_sdk >= 1.32.0", comment["components/custom/landing/page-sections.ts"])
        self.assertIn("base_sdk >= 1.32.0", comment["components/custom/landing/hero-config.ts"])
        # 1.19.0: `sites` on the registration is base_sdk 1.40.0's.
        self.assertIn("base_sdk >= 1.40.0", read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.18.2")[0])
        self.assertIn("1.40.0", comment["about"])
        self.assertIn("base_sdk >= 1.40.0", comment["components/custom/landing/network-strip.ts"])
        self.assertIn("1.40.0", comment["components/custom/landing/network-sites.ts"])

    def test_changelog_leads_with_the_manifest_version(self):
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        heads = re.findall(r"^## (\d+\.\d+\.\d+)$", changelog, re.M)
        self.assertTrue(heads, "CHANGELOG.md has no version heading")
        self.assertEqual(heads[0], self.manifest["version"])

    def test_new_files_carry_no_placeholder_words(self):
        for path in NEW_FILES:
            with self.subTest(file=os.path.relpath(path, SDK_ROOT)):
                self.assertIsNone(FORBIDDEN_WORDS.search(read(path)))


class TestRegisterInjection(unittest.TestCase):
    """What the two registered modules are made of."""

    def test_config_is_client_safe(self):
        src = read(CONFIG)
        self.assertIn("export default AGENT_REGISTER_CONFIG;", src)
        self.assertIn("enabled: true,", src)
        specs = [m.group(2) for m in IMPORT_RE.finditer(src)]
        self.assertEqual(
            sorted(specs),
            sorted([
                "@/components/custom/auth/register-registry",
                "@/app/lib/i18n",
                "@/app/config/platform",
                "@/lib/actions/getSubscriptionPlans",
                "@/app/(auth)/agent-register-actions",
            ]),
        )
        # The registry is reached for its types only; the two server
        # modules are "use server" files, references on the client.
        self.assertRegex(src, r'import type \{[^}]*\} from "@/components/custom/auth/register-registry";')
        for server in (ACTIONS,):
            self.assertRegex(read(server), re.compile(r'^"use server";$', re.M))
        # No server-only module is imported.
        for spec in specs:
            for gone in ("platform-gateway", "tenant-link", "agent-register-helpers", "agent-register-provision", "@/db"):
                self.assertNotIn(gone, spec, f"config imports {spec}")

    def test_config_declares_the_fields_and_the_copy(self):
        src = read(CONFIG)
        for name in ("plan", "industry", "company_name", "country", "voucher_code", "domain"):
            self.assertIn(f'name: "{name}"', src)
        self.assertIn('fromQuery: "plan"', src)
        self.assertIn('t("auth.selected_plan")', src)
        self.assertIn('t("auth.label_industry")', src)
        self.assertIn('t("auth.label_company_name")', src)
        self.assertIn('t("auth.label_country")', src)
        self.assertIn('t("auth.label_voucher_code")', src)
        self.assertIn('t("auth.label_domain")', src)
        self.assertIn('title: "Create Account"', src)
        self.assertIn('cta: "Get Started"', src)
        self.assertIn("steps: [],", src)

    def test_provisioner_is_the_removed_control_flow(self):
        provision = read(PROVISION)
        helpers = read(HELPERS)
        self.assertIn("export default agentRegisterProvisioner;", provision)
        self.assertIn("provision(submission: RegisterSubmission): Promise<RegisterOutcome>", provision)
        self.assertIn("loadTenantLink()", provision)
        self.assertIn("adminCredentials()", provision)
        self.assertIn("System not initialized. Administrator must login first.", provision)
        self.assertIn('extra: { is_onboarding: "true" }', provision)
        self.assertIn('"control:provision_service_subscription"', helpers)
        self.assertIn('"control:provision_new_tenant"', helpers)
        self.assertIn('PRICING_METADATA_CMD = "control:get_pricing_metadata"', helpers)
        # The pricing read rides the platform gateway as a guest cmd; no
        # client call bypasses rokct.platform.api here.
        self.assertIn("requireAuth: false", helpers)
        self.assertNotIn("fetch(", helpers)
        self.assertNotIn("/api/method/", helpers)
        self.assertIn("PROVISIONING_TIMEOUT_MS = 60000", helpers)
        self.assertIn('"frappe.client.get_list"', read(ACTIONS))
        self.assertIn('doctype: "Industry Type"', read(ACTIONS))

    def test_provisioner_touches_no_database_and_writes_no_credential(self):
        for path in (PROVISION, HELPERS, ACTIONS):
            src = read(path)
            with self.subTest(file=os.path.basename(path)):
                for gone in ("@/db", "drizzle", "linkRegistration", "rememberLogin"):
                    self.assertNotIn(gone, src)
                # Keys arrive through the tenant link and leave as a header.
                self.assertNotRegex(src, r'api(Key|Secret)\s*[:=]\s*"')
                self.assertNotRegex(src, r'token [A-Za-z0-9]+:[A-Za-z0-9]+')
                envs = set(re.findall(r"process\.env\.([A-Z_]+)", src))
                self.assertLessEqual(envs, {"ROKCT_BASE_URL"})

    def test_header_draws_the_redesign_mark_and_one_action(self):
        # 1.24.0 (Ray approved the rokct.ai redesign on 2026-11-01): the
        # header draws the yellow R tile this SDK ships, and its one action
        # is "Start with ROKCT" to sign-up. The Chrome Web Store button
        # (the Merlin extension's, 1.12.0 to 1.23.0) and its mark are gone.
        src = read(HEADER_MENU)
        self.assertIn('export const RK_MARK = "/landing/agent/rk-mark.svg";', src)
        self.assertIn("    logo: RK_MARK,", src)
        code = re.sub(r"^\s*//.*$", "", src, flags=re.M)
        for gone in ("CHROME_WEB_STORE_MARK", "add-extension", "chromewebstore", "/brand/marks/", "Chrome"):
            self.assertNotIn(gone, code)
        start = src.index('id: "start",')
        end = src.index("}", start)
        self.assertIn('label: word("header.start_with_rokct", "Start with ROKCT"),', src[start:end])
        self.assertIn('href: "/register",', src[start:end])
        self.assertIn('variant: "primary",', src[start:end])
        self.assertEqual(code.count('id: "'), 1, "one action, and no link or group")
        self.assertTrue(os.path.isfile(os.path.join(PUBLIC, "landing", "agent", "rk-mark.svg")))

    def test_marks_are_base_sdks_not_this_sdks(self):
        # 1.16.0: base_sdk 1.26.0 installs the platform marks under
        # public/brand/marks/ on every host, so this SDK ships none of them
        # - no templates/public at all - and installs nothing under public/.
        # The 1.15.0 copies (chrome-web-store.svg, google-play.svg) and the
        # public/brand mapping that carried them are gone. 1.23.0: the one
        # thing this SDK puts under public/ is its own landing pictures,
        # public/landing/agent/ (TestLandingPictures) - still no mark.
        self.assertFalse(os.path.exists(MARKS_DIR), MARKS_DIR)
        self.assertEqual(sorted(os.listdir(PUBLIC)), ["landing"])
        self.assertEqual(sorted(os.listdir(os.path.join(PUBLIC, "landing"))), ["agent"])
        manifest = load_manifest()
        public = [e for e in manifest["installs"] if e["from"].startswith("templates/public") or e["to"].startswith("public")]
        self.assertEqual(public, [{"from": "templates/public/landing/agent", "to": "public/landing/agent"}])

    def test_hero_copy_is_registered_where_base_looks(self):
        # 1.15.0: registered through base's HeroCopy override. 1.24.0: base's
        # hero frame is not drawn on rokct.ai (rokct-hero.tsx is the hero),
        # so the copy empties what the frame would add - no store badge
        # (the Chrome Web Store badge was the Merlin extension's) and no
        # trust line - and restates no word of base's.
        manifest = load_manifest()
        targets = {i["to"] for i in manifest["installs"]}
        self.assertIn("components/custom/landing/agent-hero-copy.ts", targets)
        lines = [
            i for i in manifest["integrations"]
            if i["target"] == "components/custom/landing/hero-copy.ts"
        ]
        self.assertEqual(len(lines), 1)
        self.assertEqual(lines[0]["placeholder"], "// @rokct-sdk-hero-copy-start")
        self.assertRegex(lines[0]["replacement"], HERO_COPY_LINE)
        self.assertIn("components/custom/landing/hero-copy.ts", manifest["requires"])
        src = read(HERO_COPY)
        self.assertIn('import type { HeroCopy } from "@/components/custom/landing/hero-copy";', src)
        body = src[src.index("const AGENT_HERO_COPY"):src.index("export default")]
        self.assertIn("  badges: [],", body)
        self.assertIn("  trustLine: [],", body)
        for field in ("headlineWords", "headlineSuffix", "placeholders", "backgroundImage", "src:"):
            self.assertNotIn(field, body)
        # The frame is kept off the page by the one stylesheet this SDK
        # ships, scoped to the landing root.
        css = [i for i in manifest["installs"] if i["from"].endswith(".css")]
        self.assertEqual(css, [{"from": "templates/components/custom/landing/rokct-landing.css",
                                "to": "components/custom/landing/rokct-landing.css"}])
        self.assertIn(".rk-landing #hero {\n  display: none;", read(RK_CSS))

    def test_header_and_hero_surfaces_name_no_third_party_host(self):
        # The header menu and the hero copy name no host but the store the
        # button opens; cdn.getmerlin.in, which the old header hot-linked
        # the mark from, appears nowhere in them.
        # (Since 1.23.0 agent-landing-config.ts names no picture host at
        # all: TestLandingPictures holds that.)
        # The store the button opens, the SVG namespace, the licence header.
        allowed = {"chromewebstore.google.com", "www.w3.org", "www.gnu.org"}
        for path in (HEADER_MENU, HERO_COPY):
            with self.subTest(file=os.path.relpath(path, SDK_ROOT)):
                src = read(path)
                self.assertNotIn("getmerlin", src)
                self.assertNotIn("cdn.", src)
                for host in re.findall(r"https?://([A-Za-z0-9.-]+)", src):
                    self.assertIn(host, allowed, host)

    def test_header_menu_keeps_the_collapsing_brand(self):
        # 1.14.0 (Ray, 2026-09-09: "header lost functions the old rokct
        # header had"): the collapsing brand with the country code, through
        # base_sdk 1.24.0's HeaderMenu.brand. 1.24.0 keeps every mechanic
        # (Ray, 2026-11-01: "if country code is not fixed i cant approve")
        # and swaps the BETA tile for the redesign's R tile.
        src = read(HEADER_MENU)
        brand = src[src.index("  brand: {"):src.index("  anchors: [...RK_HEADER_ANCHORS],")]
        self.assertIn("collapse: { delayMs: 1500, code: brandingCode },", brand)
        self.assertNotIn("badge: true", brand)
        self.assertIn('export const RK_HEADER_ANCHORS = ["ask", "platform", "how", "funding", "plans"] as const;', src)
        # The code comes from the shell's branding cache, as the old header
        # read it, then the visitor's time zone; never a network call.
        self.assertIn("getBrandingSync,", src)
        resolver = src[src.index("export function brandingCode("):src.index("const AGENT_HEADER_MENU")]
        self.assertIn("getBrandingSync()", resolver)
        self.assertIn("branding?.code?.trim()", resolver)
        self.assertIn("if (text) return { text, style: branding?.style };", resolver)
        self.assertIn("codeForTimeZone(visitorTimeZone())", resolver)
        self.assertIn("style: BRANDING_CODE_STYLE", resolver)
        self.assertNotIn("fetch(", src)
        self.assertNotIn("localStorage", src)
        # The superscript style is the shell's own constants, not restated.
        self.assertIn("fontSize: BRANDING_COUNTRY_SCALE,", src)
        self.assertIn("top: BRANDING_COUNTRY_Y_OFFSET,", src)
        # Each anchor is a section this SDK registers, with the header label.
        anchors = {}
        for name in ("rokct-hero", "rokct-platform", "rokct-how", "rokct-funding", "rokct-plans"):
            anchors[name] = read(os.path.join(CUSTOM, f"{name}.tsx"))
        content = read(RK_CONTENT)
        for key in ("ask", "platform", "how", "funding", "plans"):
            self.assertRegex(content, rf'\b{key}: "{key}"', key)
        self.assertIn('nav: [{ id: RK_ANCHORS.ask, label: "Ask ROK" }],', anchors["rokct-hero"])

    def test_product_plan_categories_leave_rokct(self):
        # 1.13.0: Telephony joins Hosting and paas in the one server-side
        # filter, and the client-side belt names it too.
        query = read(os.path.join(TEMPLATES, "components", "custom", "landing", "agent-plans-query.ts"))
        self.assertIn('const TELEPHONY_CATEGORY = "Telephony";', query)
        self.assertRegex(query, re.compile(
            r"EXCLUDED_CATEGORIES: readonly string\[\] = \[\s*HOSTING_CATEGORY,\s*PAAS_CATEGORY,\s*TELEPHONY_CATEGORY,\s*\]", re.S))
        self.assertIn('"not in"', query)
        config = read(os.path.join(TEMPLATES, "components", "custom", "landing", "agent-landing-config.ts"))
        self.assertIn('hiddenCategories: ["lms", "hosting", "paas", "telephony"],', config)
        # The unused tab style is flagged, never removed.
        self.assertIn("      telephony: `", config)

    def test_the_merlin_sections_are_gone(self):
        """1.24.0 (Ray approved the rokct.ai redesign on 2026-11-01): the
        landing's Merlin-era sections - the floating nav, the "Use OpenAI
        o1" chat card, the client logos, the social proof, the feature
        grid, the workflow, the copied pricing, the FAQ and the testimonials
        - and the hero's search form are replaced by the redesign's
        sections, so none is installed or registered, and no file of this
        SDK names the Merlin extension's words any more."""
        manifest = load_manifest()
        targets = {i["to"] for i in manifest["installs"]}
        replacements = " ".join(i["replacement"] for i in manifest["integrations"])
        for gone in ("floating-nav", "chat-section", "logos", "social-section", "all-features-section",
                     "workflow-section", "copied-pricing", "faq-section", "testimonials-section"):
            with self.subTest(section=gone):
                self.assertFalse(os.path.exists(os.path.join(CUSTOM, f"{gone}.tsx")))
                self.assertFalse(os.path.exists(os.path.join(CUSTOM, f"{gone}.client.tsx")))
                self.assertNotIn(f"components/custom/{gone}.tsx", targets)
                self.assertNotIn(f'"@/components/custom/{gone}"', replacements)
        for gone in ("agent-hero-form.tsx", "agent-logos.ts", "agent-card-row.ts"):
            self.assertFalse(os.path.exists(os.path.join(LANDING, gone)), gone)
            self.assertNotIn(f"components/custom/landing/{gone}", targets)
        self.assertNotIn("agent-hero-form", replacements)
        config = read(LANDING_CONFIG)
        code = re.sub(r"/\*.*?\*/", "", config, flags=re.S)
        code = re.sub(r"^\s*//.*$", "", code, flags=re.M)
        for word in (r"\bsocial\b", r"\bfeatures\b", r"Chrome Web Store", r"\bo1\b", r"\blogos:"):
            self.assertNotRegex(code, word)
        for dirpath, _, files in os.walk(CUSTOM):
            for fname in files:
                if fname.startswith("rokct-"):
                    text = read(os.path.join(dirpath, fname)) if not fname.endswith(".woff2") else ""
                    for word in ("getmerlin", "Merlin", "OpenAI", "Chrome Web Store", "extension"):
                        self.assertNotIn(word, text, f"{fname} names {word}")

    def test_the_plan_scroller_hides_its_scrollbar(self):
        """1.18.2: the plan row asked for a hidden scrollbar with a
        `no-scrollbar` class defined nowhere in this SDK or the shell, so
        the rule never existed and webkit drew base_sdk's thumb under the
        row. The row states the three declarations itself, as
        AGENT_CARD_ROW already does, and nothing hides the scroll."""
        row = read(os.path.join(TEMPLATES, "components", "custom", "pricing.client.tsx"))
        # The inert class is gone from the SDK entirely.
        self.assertNotIn("no-scrollbar", row)
        # All three engines, in the className rather than half of them in an
        # inline style: Firefox, legacy Edge/IE and webkit.
        for utility in ("[scrollbar-width:none]",
                        "[-ms-overflow-style:none]",
                        "[&::-webkit-scrollbar]:hidden"):
            self.assertIn(utility, row)
        # Stated once: no inline style repeating what the classes declare.
        self.assertNotIn("scrollbarWidth", row)
        self.assertNotIn("msOverflowStyle", row)
        # Hiding the bar must not hide the scroll.
        self.assertIn("overflow-x-auto", row)
        self.assertNotIn("overflow-x-hidden", row)

    def test_section_entries_are_server_safe(self):
        """1.18.0 (base_sdk 1.32.0 renders the landing on the server and
        reads each registered module's `meta` there): every page-sections
        ENTRY this SDK registers carries no "use client" directive while
        exporting `meta` and a default; what needs the browser is the
        sibling <name>.client.tsx, which starts with the directive, holds
        no `meta`, and is installed beside its entry."""
        manifest = load_manifest()
        targets = {i["to"]: i["from"] for i in manifest["installs"]}
        entries = []
        for integration in manifest["integrations"]:
            if integration["target"] != "components/custom/landing/page-sections.ts":
                continue
            match = PAGE_SECTION_LINE.match(integration["replacement"])
            self.assertIsNotNone(match, integration["replacement"])
            entries.append(match.group(1))
        self.assertEqual(sorted(entries), sorted(SPLIT_SECTIONS + WHOLE_SECTIONS))
        for name in entries:
            with self.subTest(section=name):
                entry_path = os.path.join(CUSTOM, f"{name}.tsx")
                sibling_path = os.path.join(CUSTOM, f"{name}.client.tsx")
                self.assertEqual(targets.get(f"components/custom/{name}.tsx"),
                                 f"templates/components/custom/{name}.tsx")
                entry = read(entry_path)
                # No directive: the server reads `meta` as data, not as a proxy.
                self.assertIsNone(USE_CLIENT_RE.search(entry), f"{name}.tsx starts with \"use client\"")
                self.assertIn("export const meta: PageSectionMeta = {", entry)
                # 1.18.1: the logos entry resolves its strip on the server, so
                # its default export is async; a server component may be.
                self.assertRegex(entry, re.compile(r"^export default (async )?(function \w+\(|\w+;)", re.M), "a default export")
                # meta stays pure: nothing in the entry reaches the browser.
                for word in ("window.", "document.", "localStorage", "sessionStorage", "navigator."):
                    self.assertNotIn(word, entry, f"{name}.tsx must not read {word}")
                self.assertNotIn("useState", entry)
                self.assertNotIn("useEffect", entry)
                self.assertNotIn("framer-motion", entry)
                if name in SPLIT_SECTIONS:
                    self.assertTrue(os.path.isfile(sibling_path), f"{name}.client.tsx")
                    sibling = read(sibling_path)
                    self.assertIsNotNone(USE_CLIENT_RE.search(sibling), f"{name}.client.tsx must start with \"use client\"")
                    self.assertNotIn("export const meta", sibling)
                    self.assertNotIn("export default", sibling)
                    self.assertIn(f'from "@/components/custom/{name}.client";', entry)
                    # Installed beside its entry, from the template of the same name.
                    self.assertEqual(targets.get(f"components/custom/{name}.client.tsx"),
                                     f"templates/components/custom/{name}.client.tsx")
                else:
                    self.assertFalse(os.path.exists(sibling_path), f"{name} has nothing client-only; no sibling")
                    self.assertNotIn(f"components/custom/{name}.client.tsx", targets)
        # The opportunities section is drawn by the funding band's client
        # finder (1.24.0), never read by the server: it keeps the directive.
        self.assertIsNotNone(USE_CLIENT_RE.search(read(os.path.join(LANDING, "agent-opportunities.tsx"))))
        # The two registry modules the server does read never carried it.
        for server_read in (HEADER_MENU, HERO_COPY):
            self.assertIsNone(USE_CLIENT_RE.search(read(server_read)), server_read)

    def test_network_strip_is_registered_where_base_looks(self):
        manifest = load_manifest()
        targets = {i["to"] for i in manifest["installs"]}
        self.assertIn("components/custom/landing/agent-network-strip.ts", targets)
        lines = [
            i for i in manifest["integrations"]
            if i["target"] == "components/custom/landing/network-strip.ts"
        ]
        self.assertEqual(len(lines), 1)
        self.assertEqual(lines[0]["placeholder"], "// @rokct-sdk-network-strip-start")
        self.assertRegex(lines[0]["replacement"], NETWORK_STRIP_LINE)
        self.assertIn("components/custom/landing/network-strip.ts", manifest["requires"])
        # 1.17.0: the registry note names the "section" floor, 1.27.0.
        self.assertIn("base_sdk >= 1.27.0", manifest["_comment"]["components/custom/landing/network-strip.ts"])

    def test_network_strip_says_where_and_which(self):
        src = read(NETWORK_STRIP)
        # 1.17.0 to 1.23.0 the logos section carried the strip on /landing
        # and the footer row everywhere else. 1.24.0 (the redesign has no
        # client showcase): drawn nowhere, the sites still declared. Never
        # afterHero: that was the two "Trusted by" rows.
        self.assertIn('landing: "none"', src)
        self.assertIn("footer: false", src)
        self.assertNotIn('landing: "afterHero"', src)
        self.assertIn('landing?: "afterHero" | "beforeFooter" | "section" | "none";', src)
        body = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
        body = re.sub(r"^\s*//.*$", "", body, flags=re.M)
        # 1.19.0: the URLs in the module are the sites' own origins and
        # their own logo files, and nothing else - no tracking word, no
        # parameter (base never draws an entry with one).
        urls = re.findall(r"https?://[^\s\"']+", body)
        self.assertTrue(urls, "the registration names the sites' origins")
        for url in urls:
            self.assertRegex(url, r"^https://(rokct\.ai|supacharge\.school|juvo\.app)(/images/logo(_dark)?\.svg)?$", url)
        for tracker in ("utm", "ref=", "onClick", "gtag", "analytics", "?u", "&"):
            self.assertNotIn(tracker, body)
        # Imports nothing, so an older base still compiles the shell.
        self.assertNotIn("import ", body)

    def test_network_sites_are_declared_here_and_nowhere_else(self):
        """1.19.0 (base_sdk 1.40.0; Ray, 2026-09-11: a shell with no
        declaration shows no strip): the five entries base_sdk carried
        until 1.39.0 - rokct, supacharge, juvo, and the hidden hosting and
        telephony place-holders - are `sites` on this SDK's registration,
        and no other file of this SDK restates the list. Executed by
        tests/network-strip.test.mts; the shape is held here. 1.19.1: the
        juvo entry is named "juvo platforms" - Ray, 2026-09-11 07:43Z:
        "and juvo is still juvo while i told you its juvo platforms" -
        the string as he typed it; the bare "juvo" is refused as a name."""
        src = read(NETWORK_STRIP)
        self.assertIn("  sites?: AgentNetworkSite[];", src)
        self.assertIn("export interface AgentNetworkSite {", src)
        keys = re.findall(r'key: "([a-z]+)"', src)
        self.assertEqual(keys, ["rokct", "supacharge", "juvo", "hosting", "telephony"])
        for key, name, url in (
            ("rokct", "rokct.ai", "https://rokct.ai"),
            ("supacharge", "supacharge.school", "https://supacharge.school"),
            ("juvo", "juvo platforms", "https://juvo.app"),
        ):
            self.assertRegex(src, re.compile(rf'key: "{key}",\s*name: "{re.escape(name)}",\s*url: "{re.escape(url)}",', re.S), key)
        for wrong in ('name: "juvo",', 'name: "Juvo",', 'name: "Juvo Platforms",', 'name: "JUVO PLATFORMS",'):
            self.assertNotIn(wrong, src, wrong)
        # 1.23.0: juvo.app's glyphs are blocked cross-origin; the name is drawn.
        self.assertIn('name: "juvo platforms",\n      url: "https://juvo.app",\n      wordmark: true,', src)
        self.assertNotIn("juvo.app/images", src)
        self.assertIn('name: "supacharge.school",\n      url: "https://supacharge.school",\n      wordmark: true,', src)
        for pending, name in (("hosting", "Hosting"), ("telephony", "Telephony")):
            self.assertIn(f'{{ key: "{pending}", name: "{name}", url: null, shown: false }},', src)
        self.assertIn("// No domain yet (Ray, 2026-09-09): listed so the entry has a place, hidden", src)
        self.assertLess(src.index("  sites: ["), src.index("  placement: {"))
        # The list is stated once: no other template of this SDK names an
        # entry of the network by key and origin.
        for dirpath, _, files in os.walk(TEMPLATES):
            for fname in files:
                path = os.path.join(dirpath, fname)
                if path == NETWORK_STRIP or not fname.endswith((".ts", ".tsx")):
                    continue
                text = read(path)
                for origin in ("https://supacharge.school", "https://juvo.app", 'key: "juvo"', 'key: "supacharge"'):
                    self.assertNotIn(origin, text, f"{os.path.relpath(path, SDK_ROOT)} restates the network list")
        # The manifest says where the list went, and the floor it needs.
        comment = load_manifest()["_comment"]
        self.assertIn("base carries no site", comment["components/custom/landing/network-sites.ts"])
        self.assertIn("base_sdk >= 1.40.0", comment["components/custom/landing/network-strip.ts"])
        head = read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.18.2", 1)[0]
        self.assertIn("## 1.19.0", head)
        for word in ("`sites`", "base_sdk >= 1.40.0", "hosting", "telephony"):
            self.assertIn(word, head)
        latest = head.split("## 1.19.0", 1)[0]
        self.assertIn("## 1.19.1", latest)
        for word in ('"juvo platforms"', "use caps in logos", "`uppercase`"):
            self.assertIn(word, latest)
        self.assertEqual(load_manifest()["version"], "1.26.0")

    def test_behaviour_under_node(self):
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute the register modules")
        with tempfile.TemporaryDirectory() as tmp:
            for name, path in STAGED.items():
                stage_module(path, os.path.join(tmp, name))
            shutil.copytree(STUBS, os.path.join(tmp, "stubs"))
            for suite in NODE_SUITES:
                shutil.copy(os.path.join(HERE, suite), os.path.join(tmp, suite))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 *[os.path.join(tmp, suite) for suite in NODE_SUITES]],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 25)


# 1.19.0: frappe-js-sdk's `call()` takes no argument, so a `client.call({
# method, args })` sends nothing and resolves to a FrappeCall object; every
# tenant call of this SDK goes through base's gatewayCall(client, cmd,
# payload) (or platformCall/paasCall), which POSTs {cmd, payload} to the
# gateway. Tenant cmds are the prefix-free manifest keys - never
# app-prefixed (no `rcore.`, no retired `paas.`), never a per-method
# dotted URL; a control cmd carries the `control:` prefix.
OBJECT_ARGUMENT_CALL = re.compile(r"\.call\(\s*\{", re.S)
DESK_FRAPPE_CALL = re.compile(r"\bfrappe\.call\(")
UNTYPED_CALL = re.compile(r"as any\)\.call\(")
APP_PREFIXED_CMD = re.compile(r"[\"'`](rcore|paas)\.")
TEMPLATE_SUFFIXES = (".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs")
TENANT_CMDS = {
    "api.plan_builder.summarize_chat_session": (
        os.path.join(TEMPLATES, "app", "(chat)", "api", "chat", "route.ts"),
        os.path.join(TEMPLATES, "app", "(chat)", "api", "summarize", "route.ts"),
        os.path.join(TEMPLATES, "app", "(chat)", "page.tsx"),
    ),
    "tenant.api.log_frontend_error": (
        os.path.join(TEMPLATES, "app", "(chat)", "api", "error", "route.ts"),
    ),
}


# 1.19.2: a control-site cmd is the verbatim `control:<name>` key. On a
# control site the platform gateway routes ONLY a cmd carrying that prefix
# (control/hooks.py states the rule above its override_whitelisted_methods;
# base's platform-gateway.ts repeats it), so the dotted per-method alias
# `control.api.<name>` never routed through ControlBaseService.call, however
# the frappe manifest spelt it. Every `control:` literal a template carries
# must be a key some frappe manifest registers under
# app_type.control.hooks.whitelisted_methods: this SDK's own (agent/frappe),
# or one of the sibling modules named here.
FRAPPE_MANIFEST = os.path.join(SDK_ROOT, os.pardir, "frappe", "manifest.json")
FRAPPE_SRC = os.path.join(SDK_ROOT, os.pardir, "frappe", "src")
CONTROL_CMD_LITERAL = re.compile(r"[\"'`](control:[A-Za-z0-9_]+)[\"'`]")
DOTTED_CONTROL_CMD = re.compile(r"\.call\(\s*[\"'`]control\.(?:control\.)?api\.")
CONTROL_CMDS = {
    "control:summarize_chat_session": (
        os.path.join(TEMPLATES, "app", "(chat)", "api", "chat", "route.ts"),
        os.path.join(TEMPLATES, "app", "(chat)", "api", "summarize", "route.ts"),
        os.path.join(TEMPLATES, "app", "(chat)", "page.tsx"),
    ),
}
CONTROL_CMDS_OF_OTHER_MODULES = {
    "control:log_frontend_error": "core telemetry/frappe manifest",
    "control:get_public_opportunities": "corporate tender/frappe manifest",
    "control:provision_service_subscription": "control/hooks.py override_whitelisted_methods",
    "control:provision_new_tenant": "control/hooks.py override_whitelisted_methods",
    "control:get_pricing_metadata": "control/hooks.py override_whitelisted_methods (allow_guest)",
}


def control_whitelist():
    with open(FRAPPE_MANIFEST, encoding="utf-8") as f:
        return json.load(f)["app_type"]["control"]["hooks"]["whitelisted_methods"]


def template_sources():
    for root, _dirs, files in os.walk(TEMPLATES):
        for name in sorted(files):
            if name.endswith(TEMPLATE_SUFFIXES):
                yield os.path.join(root, name)


class TestGatewayCalls(unittest.TestCase):
    """The six sites that still handed frappe-js-sdk an object (chat, error,
    reminders and summarize routes, the chat page, control.ts) call the
    gateway, and nothing of that class comes back."""

    def test_no_template_hands_call_an_object(self):
        for path in template_sources():
            with self.subTest(file=os.path.relpath(path, SDK_ROOT)):
                src = read(path)
                self.assertIsNone(OBJECT_ARGUMENT_CALL.search(src), "`.call({` sends nothing: use gatewayCall(client, cmd, payload)")
                self.assertIsNone(DESK_FRAPPE_CALL.search(src), "desk-style frappe.call({...}) has no place in a Next.js template")
                self.assertIsNone(UNTYPED_CALL.search(src), "`(client as any).call(` hides the missing argument")

    def test_no_template_carries_an_app_prefixed_cmd(self):
        # A tenant cmd is the manifest key minus `{app_name}.`; the gateway
        # rejects app-prefixed names (`rcore.`, the retired `paas.`) on
        # tenant sites.
        for path in template_sources():
            with self.subTest(file=os.path.relpath(path, SDK_ROOT)):
                self.assertIsNone(APP_PREFIXED_CMD.search(read(path)), "app-prefixed cmd")

    def test_the_converted_sites_name_the_manifest_keys(self):
        for cmd, paths in TENANT_CMDS.items():
            for path in paths:
                with self.subTest(cmd=cmd, file=os.path.relpath(path, SDK_ROOT)):
                    src = read(path)
                    self.assertIn(f'gatewayCall(client, "{cmd}", {{', src)
                    self.assertIn("@/app/lib/gateway-rpc", src)
        # The three summaries read the target's return under Frappe's
        # `message` envelope, which gatewayCall keeps.
        for path in TENANT_CMDS["api.plan_builder.summarize_chat_session"]:
            with self.subTest(file=os.path.relpath(path, SDK_ROOT)):
                self.assertRegex(read(path), r"(sumRes|tenantRes)\?\.message")
        # summarize_chat_session is this SDK's own tenant endpoint: the key
        # the cmd is cut from is in the frappe half's manifest.
        with open(os.path.join(SDK_ROOT, os.pardir, "frappe", "manifest.json"), encoding="utf-8") as f:
            frappe_manifest = f.read()
        self.assertIn('"{app_name}.api.plan_builder.summarize_chat_session"', frappe_manifest)
        self.assertNotIn("/api/method/rcore.", "".join(read(p) for p in template_sources()))
        # The agent services build their cmds from a prefix-free namespace.
        for name, ns in (("plan.ts", "api.plan_builder"), ("memory.ts", "api"), ("tasks.ts", "api")):
            with self.subTest(file=name):
                self.assertIn(f'const NS = "{ns}";', read(os.path.join(TEMPLATES, "app", "services", "all", "agent", name)))
        # The control-side error sink is a `control:` cmd (core's telemetry
        # manifest key), on the control client.
        error_route = read(TENANT_CMDS["tenant.api.log_frontend_error"][0])
        self.assertIn('ControlBaseService.call("control:log_frontend_error", {', error_route)
        self.assertNotIn("control.api.log_frontend_error", error_route)
        self.assertNotIn("OnboardingService", error_route)

    def test_no_template_hands_the_control_client_a_dotted_cmd(self):
        # `control.api.<name>` / `control.control.api.<name>` is a per-method
        # alias; the control gateway refuses it, so it is never a cmd.
        for path in template_sources():
            with self.subTest(file=os.path.relpath(path, SDK_ROOT)):
                self.assertIsNone(DOTTED_CONTROL_CMD.search(read(path)), "a control cmd is `control:<name>`")

    def test_every_control_cmd_is_a_registered_control_key(self):
        registered = {k for k in control_whitelist() if k.startswith("control:")}
        registered |= set(CONTROL_CMDS_OF_OTHER_MODULES)
        for path in template_sources():
            for cmd in CONTROL_CMD_LITERAL.findall(read(path)):
                with self.subTest(cmd=cmd, file=os.path.relpath(path, SDK_ROOT)):
                    self.assertIn(cmd, registered, "not a key any manifest registers")

    def test_the_control_sites_name_the_control_key(self):
        for cmd, paths in CONTROL_CMDS.items():
            for path in paths:
                with self.subTest(cmd=cmd, file=os.path.relpath(path, SDK_ROOT)):
                    src = read(path)
                    self.assertIn(f'ControlBaseService.call("{cmd}", {{', src)
                    self.assertNotIn(cmd.replace("control:", "control.api."), src)

    def test_own_control_keys_resolve_to_the_legacy_aliases_handlers(self):
        # Each `control:<name>` key agent/frappe registers points at the same
        # target as its dotted `control.api.<name>` alias (kept, unused), and
        # that target is a @frappe.whitelist function under frappe/src.
        whitelist = control_whitelist()
        own = {k: v for k, v in whitelist.items() if k.startswith("control:")}
        self.assertEqual(set(own) & set(CONTROL_CMDS), set(CONTROL_CMDS))
        self.assertIn("control:chat_with_rok", own)
        for key, target in own.items():
            with self.subTest(key=key):
                self.assertEqual(target, whitelist[key.replace("control:", "control.api.")])
                self.assertTrue(target.startswith("{app_name}.agent.control."), target)
                parts = target[len("{app_name}.agent."):].split(".")
                module = os.path.join(FRAPPE_SRC, *parts[:-1]) + ".py"
                self.assertTrue(os.path.isfile(module), module)
                self.assertRegex(read(module), rf"@frappe\.whitelist\([^)]*\)\ndef {re.escape(parts[-1])}\(")


class TestLandingPictures(unittest.TestCase):
    """1.23.0 (Ray, 2026-11-01: "we can have our own"): every picture the
    landing sections draw is a file this SDK installs under
    public/landing/agent/, never a third party's URL - Merlin's CDN and
    juvo.app refuse cross-origin loads, so a hot-link is a broken image."""

    PUBLIC_FROM = "templates/public/landing/agent"
    # 1.24.0: the redesign's pictures are named in its copy (RK_MAKES) and
    # its mark in the header menu; the 1.23.0 pictures went with the
    # Merlin-era sections that drew them.
    SURFACES = (LANDING_CONFIG, NETWORK_STRIP, HEADER_MENU, HERO_COPY, RK_CONTENT)

    def setUp(self):
        self.manifest = load_manifest()
        self.public_dir = os.path.join(SDK_ROOT, self.PUBLIC_FROM)

    def test_the_pictures_are_installed_into_public(self):
        self.assertIn({"from": self.PUBLIC_FROM, "to": "public/landing/agent"}, self.manifest["installs"])
        self.assertTrue(os.path.isdir(self.public_dir))

    def test_no_template_names_a_borrowed_picture_host(self):
        for dirpath, _, files in os.walk(TEMPLATES):
            for fname in files:
                if not fname.endswith((".ts", ".tsx")):
                    continue
                path = os.path.join(dirpath, fname)
                src = read(path)
                for host in ("getmerlin", "images.unsplash.com", "juvo.app/images"):
                    self.assertFalse(host in src, f"{os.path.relpath(path, SDK_ROOT)} names {host}")

    def test_every_landing_picture_path_is_a_file_this_sdk_ships(self):
        shipped = set(os.listdir(self.public_dir))
        named = set()
        for path in self.SURFACES:
            src = read(path)
            named.update(re.findall(r'"/landing/agent/([^"]+)"', src))
            if 'export const RK_PICTURES = "/landing/agent";' in src:
                named.update(re.findall(r'\bfile: "([^"]+)"', src))
        self.assertEqual(len(named), 12)
        self.assertEqual(named - shipped, set(), "named but not shipped")
        self.assertEqual(shipped - named, set(), "shipped but never drawn")

    def test_the_pictures_are_small_self_contained_files(self):
        for fname in os.listdir(self.public_dir):
            path = os.path.join(self.public_dir, fname)
            self.assertRegex(fname, r"^[a-z0-9-]+\.(svg|webp)$")
            self.assertLess(os.path.getsize(path), 64 * 1024, fname)
            if fname.endswith(".svg"):
                svg = read(path)
                self.assertTrue(svg.startswith("<svg "), fname)
                # Nothing fetched from inside a picture: no external href,
                # no script, no foreign font.
                self.assertNotRegex(svg, r"(?:href|src)=\"(?:https?:)?//", fname)
                self.assertNotIn("<script", svg)
                self.assertNotIn("@import", svg)
                self.assertIn('role="img"', svg)

    def test_header_draws_no_link_to_a_missing_page(self):
        src = read(HEADER_MENU)
        self.assertIn("  links: [],", src)
        for route in ('"/affiliate"', '"/teams"'):
            self.assertNotIn(route, src)


class TestRedesign(unittest.TestCase):
    """1.24.0 (Ray approved the rokct.ai redesign on 2026-11-01): the six
    sections, their order on the page, the one stylesheet and the three
    bundled faces."""

    ORDER = (("rokct-hero", -1), ("rokct-platform", 10), ("rokct-how", 20), ("rokct-funding", 30),
             ("rokct-plans", 40), ("pricing", 45), ("rokct-closing", 50))

    def test_sections_are_registered_in_page_order(self):
        manifest = load_manifest()
        registered = [PAGE_SECTION_LINE.match(i["replacement"]).group(1)
                      for i in manifest["integrations"]
                      if i["target"] == "components/custom/landing/page-sections.ts"]
        self.assertEqual(registered, [name for name, _ in self.ORDER])
        for name, order in self.ORDER:
            with self.subTest(section=name):
                self.assertIn(f"  order: {order},", read(os.path.join(CUSTOM, f"{name}.tsx")))
        # The live plan cards stay, under the ladder, only when there are plans.
        pricing = read(os.path.join(CUSTOM, "pricing.tsx"))
        self.assertIn('  anchor: "prices",', pricing)
        self.assertIn("  renders: (ctx) => ctx.plans.length > 0,", pricing)

    def test_the_stylesheet_is_scoped_and_self_contained(self):
        css = read(RK_CSS)
        self.assertNotIn("@import", css)
        self.assertNotRegex(css, r"url\(\s*['\"]?(?:https?:)?//")
        # Every rule is the landing root's: nothing styles another page.
        flat = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        for selector in re.findall(r"(?:^|})\s*([^{}@][^{}]*?)\s*\{", flat):
            for part in selector.split(","):
                part = part.strip()
                if not part or part.startswith("@") or re.fullmatch(r"(from|to|\d+%)", part):
                    continue
                with self.subTest(selector=part):
                    self.assertRegex(part, r"^(:where\()?(\.dark )?(div)?\.rk-|^section\.rk-", part)
        # The client hero imports it once; nothing else does.
        importers = [f for f in os.listdir(CUSTOM) if f.endswith(".tsx")
                     and 'import "@/components/custom/landing/rokct-landing.css";' in read(os.path.join(CUSTOM, f))]
        # 1.26.0: the auth frame (site-shell.tsx) wears the landing too.
        self.assertEqual(sorted(importers), ["rokct-hero.client.tsx", "site-shell.tsx"])

    def test_the_faces_are_bundled_with_their_licence(self):
        files = sorted(os.listdir(RK_FONT_DIR))
        self.assertEqual(files, ["OFL.txt", "bricolage-grotesque-latin-opsz-wdth-wght.woff2",
                                 "instrument-sans-latin-wght.woff2", "jetbrains-mono-latin-wght.woff2"])
        licence = read(os.path.join(RK_FONT_DIR, "OFL.txt"))
        self.assertIn("SIL OPEN FONT LICENSE Version 1.1", licence)
        for name in ("Bricolage Grotesque", "Instrument Sans", "JetBrains Mono"):
            self.assertIn(name, licence)
        fonts = read(RK_FONTS)
        self.assertIn('import localFont from "next/font/local";', fonts)
        self.assertNotIn("next/font/google", fonts)
        for fname in files[1:]:
            self.assertIn(f'"./fonts/rokct/{fname}"', fonts)
            with open(os.path.join(RK_FONT_DIR, fname), "rb") as f:
                self.assertEqual(f.read(4), b"wOF2", fname)
        self.assertIn({"from": "templates/components/custom/landing/fonts/rokct",
                       "to": "components/custom/landing/fonts/rokct"}, load_manifest()["installs"])

    def test_the_glyphs_are_remixicon_and_nothing_is_hot_linked(self):
        paths = [os.path.join(CUSTOM, f) for f in os.listdir(CUSTOM) if f.startswith("rokct-")]
        paths += [os.path.join(LANDING, f) for f in os.listdir(LANDING) if f.startswith("rokct-")]
        for path in paths:
            with self.subTest(file=os.path.basename(path)):
                src = read(path)
                self.assertNotIn("lucide", src)
                self.assertNotIn("framer-motion", src)
                for host in re.findall(r"https?://([A-Za-z0-9.-]+)", src):
                    self.assertIn(host, {"www.gnu.org", "www.w3.org"}, host)


if __name__ == "__main__":
    unittest.main()


# 1.19.0: every href the landing header authors is an anchor, an https URL
# or a route an install of this manifest puts under app/ on the host. /chat
# is such a route since 1.19.0 (the chat surface is app/(chat)/page.tsx at
# `/`, and chat/[id]/page.tsx was the only file under chat/, so /chat
# matched nothing and 404'd on the composed shell). The three below are the
# header's remaining links to nothing: rokctai_frontend's app/ has no
# affiliate, teams or dashboard route and no SDK of this repository installs
# one, and /portal - the one candidate for the Product group's "Web App"
# entry - is the host's Client Portal (telephony and hosting subscriptions,
# balance, quotes), not the chat web app, so the href is left rather than
# pointed at the wrong page. This set may only shrink: a fixed link comes
# out of it, and a new dead one fails the test.
# 1.23.0: /affiliate and /teams came out - the header no longer draws them.
# 1.24.0: /dashboard came out with the Product panel; the set is empty.
KNOWN_DEAD_HREFS = frozenset()
# The identifier form must not be a type annotation (`href: string;`).
HREF_RE = re.compile(r'\bhref:\s*(?:"([^"]*)"|([A-Za-z_][A-Za-z0-9_]*)\b(?!\s*;))')
CONST_RE = re.compile(r'^const ([A-Z_][A-Z0-9_]*)\s*=\s*"([^"]*)";', re.M)
ROUTE_FILES = ("page.tsx", "route.ts")
ROUTE_GROUP_RE = re.compile(r"^\(.*\)$")


def authored_hrefs(path):
    """Every `href:` a module authors, a string literal or a string constant
    of the same file; any other form fails, so an href cannot slip past."""
    src = read(path)
    consts = dict(CONST_RE.findall(src))
    hrefs = []
    for literal, name in HREF_RE.findall(src):
        if name:
            if name not in consts:
                raise AssertionError(f"{os.path.basename(path)}: href {name} is not a string constant of the file")
            hrefs.append(consts[name])
        else:
            hrefs.append(literal)
    return hrefs


def installed_routes(manifest):
    """The URL paths the manifest's installs put under app/: a page.tsx or
    route.ts per route, route groups dropped, a dynamic segment kept as
    [name]."""
    routes = set()
    for entry in manifest["installs"]:
        src = os.path.join(SDK_ROOT, entry["from"])
        targets = []
        if os.path.isdir(src):
            for root, _dirs, files in os.walk(src):
                for name in files:
                    rel = os.path.relpath(os.path.join(root, name), src).replace(os.sep, "/")
                    targets.append(entry["to"] + "/" + rel)
        else:
            targets.append(entry["to"])
        for target in targets:
            parts = target.split("/")
            if parts[0] != "app" or parts[-1] not in ROUTE_FILES:
                continue
            segments = [p for p in parts[1:-1] if not ROUTE_GROUP_RE.match(p)]
            routes.add("/" + "/".join(segments))
    # 1.24.0: a page another SDK installs that this one declares it needs
    # (`requires`) is a route on every host this SDK composes into.
    for required in manifest.get("requires", []):
        parts = required.split("/")
        if parts[0] == "app" and parts[-1] in ROUTE_FILES:
            segments = [p for p in parts[1:-1] if not ROUTE_GROUP_RE.match(p)]
            routes.add("/" + "/".join(segments))
    return routes


def resolves(href, routes):
    """Whether a site-relative href (query and fragment ignored) matches an
    installed route, a [name] segment matching any one segment."""
    path = href.split("?", 1)[0].split("#", 1)[0].rstrip("/") or "/"
    want = path.split("/")[1:] if path != "/" else []
    for route in routes:
        have = route.split("/")[1:] if route != "/" else []
        if len(have) == len(want) and all(h.startswith("[") or h == w for h, w in zip(have, want)):
            return True
    return False


class TestNavLinks(unittest.TestCase):
    """1.19.0: no href the landing header or the landing config authors
    leads to a 404 this SDK could have prevented."""

    def setUp(self):
        self.routes = installed_routes(load_manifest())

    def dead_hrefs(self, hrefs):
        """The site-relative hrefs among `hrefs` that no installed route
        answers; an anchor or an https URL is never dead."""
        dead = set()
        for href in hrefs:
            if href.startswith("#") or href.startswith("https://"):
                continue
            self.assertTrue(href.startswith("/"), f"unrecognised href {href!r}")
            if not resolves(href, self.routes):
                dead.add(href)
        return dead

    def test_chat_is_a_route_and_is_the_root_chat_page(self):
        # The (chat) directory install carries all three, as it always
        # carried chat/[id]/page.tsx.
        for route in ("/", "/chat", "/chat/[id]"):
            self.assertIn(route, self.routes)
        code = "\n".join(
            line for line in read(CHAT_ROUTE).splitlines()
            if line.strip() and not line.lstrip().startswith(("//", "/*", "*"))
        )
        # Nothing of its own: the page's logic lives in ../page.tsx alone.
        self.assertEqual(code.strip(), 'export { default } from "../page";')
        root = read(ROOT_CHAT_PAGE)
        # The guest rule the re-export inherits, and the one export it forwards.
        self.assertIn('redirect("/landing")', root)
        self.assertEqual(len(re.findall(r"^export\b", root, re.M)), 1, "the root page exports more than its default; forward it")

    def test_every_header_href_is_an_anchor_an_https_url_or_an_installed_route(self):
        # 1.24.0: the one href is the call to action, sign-up; the five
        # in-page links are `anchors`, resolved by base against the page.
        hrefs = authored_hrefs(HEADER_MENU)
        self.assertEqual(hrefs, ["/register"])
        self.assertIn("/register", self.routes)
        dead = self.dead_hrefs(hrefs)
        self.assertEqual(
            dead, set(KNOWN_DEAD_HREFS),
            f"new header links to nothing: {sorted(dead - KNOWN_DEAD_HREFS)}; "
            f"fixed, take out of KNOWN_DEAD_HREFS: {sorted(KNOWN_DEAD_HREFS - dead)}",
        )

    def test_every_landing_href_is_an_anchor_or_sign_up(self):
        # 1.24.0: the landing config authors no href any more (it holds
        # the plan cards' words alone), and the redesign's sections link
        # to an anchor of the page or to base's sign-up URL - never to a
        # route this SDK cannot vouch for (the old compare block's /pricing).
        self.assertEqual(authored_hrefs(LANDING_CONFIG), [])
        anchors = set(re.findall(r'^\s+(\w+): "([a-z]+)",$', read(RK_CONTENT), re.M))
        names = {k for k, _ in anchors}
        for name in ("rokct-hero", "rokct-how", "rokct-plans", "rokct-closing"):
            src = read(os.path.join(CUSTOM, f"{name}.tsx"))
            for href in re.findall(r"href=\{(`[^`]*`|\w+)\}", src):
                with self.subTest(section=name, href=href):
                    ok = href in ("signupUrl", "pricesHref", "target") or re.fullmatch(r"`#\$\{RK_ANCHORS\.(\w+)\}`", href)
                    self.assertTrue(ok, href)
                    m = re.fullmatch(r"`#\$\{RK_ANCHORS\.(\w+)\}`", href)
                    if m:
                        self.assertIn(m.group(1), names)
            self.assertNotIn('href="/', src)
        self.assertIn('pricesHref = plans.length > 0 ? `#${RK_ANCHORS.prices}` : signupUrl', read(os.path.join(CUSTOM, "rokct-plans.tsx")).replace("\n", " ").replace("  ", " "))


class TestChatIdPage(unittest.TestCase):
    """1.19.0: chat/[id]/page.tsx reads its params, knows the session
    before it reads the chat, and turns a failed read into a 404."""

    def setUp(self):
        self.page = read(CHAT_ID_PAGE)

    def test_params_are_awaited(self):
        # Next 15+ hands a route segment its params as a Promise: read
        # without awaiting, `id` is undefined and the query runs on NULL.
        self.assertIn("params: Promise<{ id: string }>", self.page)
        self.assertIn("const { id } = await params;", self.page)
        self.assertNotIn("= params;", self.page)
        self.assertNotIn("params: any", self.page)

    def test_session_is_known_before_the_read(self):
        # No static import of the query: the only mention of getChatById
        # is the guarded read, and it follows `await auth()`.
        self.assertNotIn("import { getChatById }", self.page)
        self.assertLess(self.page.index("await auth()"), self.page.index("getChatById"))
        self.assertIn('await import("@/db/queries")', self.page)

    def test_read_is_guarded_and_a_failure_is_a_404(self):
        guard = re.search(r"\n  try \{\n(.*?)\n  \} catch \(\w+\) \{\n(.*?)\n  \}\n", self.page, re.S)
        self.assertIsNotNone(guard, "the page has no try/catch")
        self.assertIn("chatFromDb = await getChatById({ id });", guard.group(1))
        self.assertIn("console.error(", guard.group(2))
        self.assertIn("notFound();", guard.group(2))
        self.assertIn("if (!session || !session.user) {\n    return notFound();", self.page)
        # 1.20.0: someone else's chat is still a 404, but an id with no row
        # yet is the new chat the root page redirected to: it renders empty.
        self.assertIn("if (chatFromDb && session.user.id !== chatFromDb.userId) {\n    return notFound();", self.page)
        self.assertNotIn("if (!chatFromDb) {\n    notFound();", self.page)
        self.assertIn("chatFromDb ? storedToUIMessages(chatFromDb.messages) : []", self.page)
