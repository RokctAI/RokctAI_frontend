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
# 1.17.0: the logos marquee carries the strip on /landing; its pure track rule.
LOGOS = os.path.join(TEMPLATES, "components", "custom", "logos.tsx")
LOGOS_CLIENT = os.path.join(TEMPLATES, "components", "custom", "logos.client.tsx")
CUSTOM = os.path.join(TEMPLATES, "components", "custom")
LOGOS_TRACK = os.path.join(TEMPLATES, "components", "custom", "landing", "agent-logos.ts")
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
    "agent-logos.ts": LOGOS_TRACK,
}
NODE_SUITES = [
    "register-config.test.mts",
    "register-provision.test.mts",
    "network-strip.test.mts",
    "hero-copy.test.mts",
    "logos-track.test.mts",
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
NEW_FILES = [CONFIG, PROVISION, HELPERS, ACTIONS, NETWORK_STRIP, HERO_COPY, LOGOS_TRACK, CHAT_ROUTE]

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
# The sections whose browser half moved to a .client.tsx sibling, and the
# two with nothing client-only in them, which stay whole.
SPLIT_SECTIONS = (
    "floating-nav", "chat-section", "logos", "social-section",
    "workflow-section", "pricing", "copied-pricing", "faq-section",
)
WHOLE_SECTIONS = ("all-features-section", "testimonials-section")


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
        self.assertIn("get_pricing_metadata", helpers)
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

    def test_header_action_carries_the_local_chrome_mark(self):
        # 1.15.0 (Ray, 2026-09-09, on the mark the old header hot-linked
        # from a third party's CDN: "use it but bring it local"): the
        # extension action draws the SVG this SDK installs, through base_sdk
        # 1.25.0's image icon; lucide's "chrome" glyph (1.12.0) is gone.
        src = read(HEADER_MENU)
        self.assertIn(f'src: "{CHROME_MARK_PATH}",', src)
        self.assertIn('alt: "Chrome Web Store",', src)
        self.assertNotIn('icon: "chrome"', src)
        start = src.index('id: "add-extension"')
        end = src.index("}", start)
        self.assertIn("icon: CHROME_WEB_STORE_MARK,", src[start:end])
        # Only the action carries the mark; the group cards keep their glyphs.
        self.assertEqual(src.count("icon: CHROME_WEB_STORE_MARK"), 1)
        self.assertEqual(src.count('icon: "box"'), 1)
        self.assertEqual(src.count('icon: "globe"'), 1)
        self.assertEqual(src.count('icon: "smartphone"'), 1)
        # The header and the hero name the same file.
        self.assertEqual(read(HERO_COPY).count(f'src: "{CHROME_MARK_PATH}",'), 1)

    def test_marks_are_base_sdks_not_this_sdks(self):
        # 1.16.0: base_sdk 1.26.0 installs the platform marks under
        # public/brand/marks/ on every host, so this SDK ships none of them
        # - no templates/public at all - and installs nothing under public/.
        # The 1.15.0 copies (chrome-web-store.svg, google-play.svg) and the
        # public/brand mapping that carried them are gone.
        self.assertFalse(os.path.exists(MARKS_DIR), MARKS_DIR)
        self.assertFalse(os.path.exists(PUBLIC), PUBLIC)
        manifest = load_manifest()
        for entry in manifest["installs"]:
            self.assertFalse(entry["from"].startswith("templates/public"), entry["from"])
            self.assertFalse(entry["to"].startswith("public"), entry["to"])

    def test_hero_copy_is_registered_where_base_looks(self):
        # 1.15.0: the same mark on the hero's Chrome Web Store badge, as
        # data through base's HeroCopy override, one field over the defaults.
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
        self.assertIn("components/custom/landing/hero-config.ts", manifest["requires"])
        src = read(HERO_COPY)
        self.assertIn('import type { HeroCopy } from "@/components/custom/landing/hero-copy";', src)
        self.assertIn("HERO_CONFIG,", src)
        self.assertIn("badges: withLocalMarks(HERO_CONFIG.badges),", src)
        # Only the badges' icons change; the words are not restated.
        body = src[src.index("const AGENT_HERO_COPY"):src.index("export default")]
        for field in ("headlineWords", "headlineSuffix", "placeholders", "trustLine", "backgroundImage"):
            self.assertNotIn(field, body)
        marks = src[src.index("export const LOCAL_MARKS"):src.index("};", src.index("export const LOCAL_MARKS"))]
        self.assertIn("chrome: CHROME_WEB_STORE_MARK,", marks)
        self.assertIn('"google-play": GOOGLE_PLAY_MARK,', marks)
        # 1.16.0: the App Store badge draws base's official file too, in
        # place of base's built-in Apple glyph.
        self.assertIn('"app-store": APP_STORE_MARK,', marks)
        self.assertIn(f'src: "{GOOGLE_PLAY_MARK_PATH}",', src)
        self.assertIn('alt: "Google Play",', src)
        self.assertIn(f'src: "{APP_STORE_MARK_PATH}",', src)
        self.assertIn('alt: "App Store",', src)
        self.assertIn("return mark ? { ...badge, icon: mark } : badge;", src)
        # Every mark the hero and the header name is one of base_sdk
        # 1.26.0's files under /brand/marks/, never a file of this SDK's
        # and never a host.
        for path in (HERO_COPY, HEADER_MENU):
            for value in re.findall(r'src: "([^"]+)"', read(path)):
                self.assertRegex(value, r"^/brand/marks/[a-z-]+\.svg$", path)
        self.assertEqual(
            sorted(set(re.findall(r'src: "([^"]+)"', src))),
            [APP_STORE_MARK_PATH, CHROME_MARK_PATH, GOOGLE_PLAY_MARK_PATH],
        )
        # Multi-colour marks: no dark-mode inversion, and this SDK ships no CSS.
        self.assertNotIn("invert", src)
        self.assertFalse([i for i in manifest["installs"] if i["from"].endswith(".css")])

    def test_header_and_hero_surfaces_name_no_third_party_host(self):
        # The header menu and the hero copy name no host but the store the
        # button opens; cdn.getmerlin.in, which the old header hot-linked
        # the mark from, appears nowhere in them.
        # (agent-landing-config.ts still hot-links its section images from
        # that CDN - known placeholders under Ray's 15:02Z ruling, out of
        # this release's scope and not asserted here.)
        # The store the button opens, the SVG namespace, the licence header.
        allowed = {"chromewebstore.google.com", "www.w3.org", "www.gnu.org"}
        for path in (HEADER_MENU, HERO_COPY):
            with self.subTest(file=os.path.relpath(path, SDK_ROOT)):
                src = read(path)
                self.assertNotIn("getmerlin", src)
                self.assertNotIn("cdn.", src)
                for host in re.findall(r"https?://([A-Za-z0-9.-]+)", src):
                    self.assertIn(host, allowed, host)

    def test_header_menu_declares_the_old_brand(self):
        # 1.14.0 (Ray, 2026-09-09: "header lost functions the old rokct
        # header had"): the BETA-badged, collapsing brand and the filled
        # "Chat with ROK" the old header had, declared through base_sdk
        # 1.24.0's HeaderMenu.brand and the secondary variant.
        src = read(HEADER_MENU)
        brand = src[src.index("  brand: {"):src.index('  anchors: ["pricing"],')]
        self.assertIn("badge: true,", brand)
        self.assertIn("collapse: { delayMs: 1500, code: brandingCode },", brand)
        # The code comes from the shell's branding cache, as the old header
        # read it, and never from a network call of this module's own.
        self.assertIn('import { getBrandingSync } from "@/app/config/platform";', src)
        resolver = src[src.index("function brandingCode("):src.index("const AGENT_HEADER_MENU")]
        self.assertIn("getBrandingSync()", resolver)
        self.assertIn("branding?.code?.trim()", resolver)
        self.assertIn("return { text, style: branding?.style };", resolver)
        self.assertNotIn("fetch(", src)
        self.assertNotIn("localStorage", src)
        start = src.index('id: "chat-rokct",\n      label: word("features.chat_rokct", "Chat with ROK"),\n      href: "/chat",')
        end = src.index("}", start)
        self.assertIn('variant: "secondary"', src[start:end])
        self.assertNotIn('variant: "ghost"', src)

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

    def test_logos_section_draws_the_network_sites(self):
        """1.17.0 (Ray, 2026-09-09: "we now have two trusted by instead of
        using the logos section rokct had"; "logos should not lose function
        and its look"): logos.tsx keeps its marquee and draws base's
        resolved network sites, each a link, under base's heading."""
        # 1.18.0: the marquee (the fallback) is the client half; the entry
        # holds `meta` where base_sdk 1.32.0's server reads it.
        logos = read(LOGOS_CLIENT)
        entry = read(LOGOS)
        self.assertIn('"use client";', logos)
        self.assertIsNone(USE_CLIENT_RE.search(entry))
        self.assertIn('import { Logos } from "@/components/custom/logos.client";', entry)
        # 1.18.1: the items and the heading are base's, resolved by the
        # ENTRY on the server (the pure registry, the shell's own host) and
        # handed to the marquee as data, so the row is in the served HTML;
        # the client half reads no effect-loaded strip any more.
        for needle in (
            'import { networkSiteHost } from "@/components/custom/landing/network-sites";',
            "loadNetworkStrip,",
            "networkStripRendersAt,",
            "resolveNetworkStrip,",
            'import { loadSiteMetadata } from "@/components/custom/landing/site-metadata";',
            "networkSiteHost(process.env.NEXT_PUBLIC_SITE_URL)",
            "networkSiteHost((await loadSiteMetadata()).url)",
            "export async function loadLogosStrip(): Promise<ResolvedNetworkStrip | null> {",
            "const strip = resolveNetworkStrip(config, selfHost);",
            'return networkStripRendersAt(strip, "section") ? strip : null;',
            "export default async function LogosEntry({ id }: PageSectionProps) {",
            "const strip = await loadLogosStrip();",
            "<Logos id={id} strip={strip} />",
        ):
            self.assertIn(needle, entry, needle)
        self.assertNotIn("useEffect(() => {\n    let live", logos)
        self.assertIn("strip: ResolvedNetworkStrip;", logos)
        self.assertIn("const track = logosTrack(strip.sites);", logos)
        entry_body = re.sub(r"/\*.*?\*/", "", entry, flags=re.S)
        entry_body = re.sub(r"^\s*//.*$", "", entry_body, flags=re.M)
        self.assertNotIn("http", entry_body, "the entry names no URL of its own")
        # Neither half calls base's client-only resolver any more.
        for half in (entry_body, re.sub(r"^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", logos, flags=re.S), flags=re.M)):
            self.assertNotIn("loadResolvedNetworkStrip", half)
        self.assertIn("{strip.heading}", logos)
        self.assertIn('data-network-strip="section"', logos)
        # Each box is a link to the site's origin and nothing more.
        self.assertIn("href={site.url}", logos)
        self.assertIn('target="_blank"', logos)
        self.assertIn('rel="noopener"', logos)
        self.assertIn("data-network-site={site.key}", logos)
        body = re.sub(r"/\*.*?\*/", "", logos, flags=re.S)
        body = re.sub(r"^\s*//.*$", "", body, flags=re.M)
        body = re.sub(r"\{/\*.*?\*/\}", "", body, flags=re.S)
        self.assertNotIn("http", body, "no URL of its own: the links are base's list")
        for tracker in ("utm_", "?ref", "&ref", "onClick", "sendBeacon", "gtag", "dataLayer", "fbq", "analytics"):
            self.assertNotIn(tracker, body, f"the section must not carry {tracker}")
        for brand in ("Walmart", "Cisco", "Netflix", "Pinterest", "Zoom", "Sony", "Ebay", "Uber", "getmerlin", "cdn."):
            self.assertNotIn(brand, body)
        # The look and the function: the same section, eyebrow, track and box.
        for needle in (
            "py-12 border-y border-zinc-100 dark:border-zinc-900 overflow-hidden",
            "text-sm font-semibold uppercase tracking-widest text-zinc-500",
            "mask-image-linear-gradient group",
            "opacity-70 grayscale hover:grayscale-0 transition-all duration-500 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]",
            'style={{ animationDuration: "20s" }}',
            "h-8 w-24 md:h-12 md:w-40 flex items-center justify-center",
            "object-contain",
        ):
            self.assertIn(needle, logos, needle)
        # 1.18.1 (Ray, 2026-09-10: "lost sizings and feel old one had"): a
        # mark keeps the old picture box exactly; a wordmark is drawn AS a
        # mark - the box's height as its type size, the old box's width as
        # its minimum, as wide as the name is - and the name verbatim.
        self.assertIn('const ITEM =\n  "relative flex-shrink-0 h-8 w-24 md:h-12 md:w-40 flex items-center justify-center";', logos)
        self.assertIn('const MARK = "absolute inset-0 h-full w-full object-contain";', logos)
        self.assertIn('const WORDMARK_ITEM =\n  "relative flex-shrink-0 h-8 min-w-[6rem] md:h-12 md:min-w-[10rem] px-2 flex items-center justify-center";', logos)
        self.assertIn('const WORDMARK =\n  "text-2xl md:text-4xl font-bold tracking-tight leading-none text-zinc-700 dark:text-zinc-300";', logos)
        self.assertIn("className={drawLogo ? ITEM : WORDMARK_ITEM}", logos)
        self.assertIn("<span className={WORDMARK}>{site.name}</span>", logos)
        self.assertIn("aria-label={site.name}", logos)
        self.assertIn("alt={site.name}", logos)
        wordmark_line = re.search(r'const WORDMARK =\n  "([^"]+)";', logos).group(1)
        for transform in ("uppercase", "lowercase", "capitalize", "truncate", "text-lg", "text-sm"):
            self.assertNotIn(transform, wordmark_line, transform)
        for rewrite in ("toLowerCase(", "toUpperCase(", "site.name.replace(", "site.name.slice(", "site.name.split("):
            self.assertNotIn(rewrite, logos, rewrite)
        self.assertIn("export const meta: PageSectionMeta = { order: 20, nav: [] };", entry)
        self.assertNotIn("export const meta", logos)
        # A logo draws with its dark twin, a wordmark or a broken image draws the name.
        self.assertIn("const drawLogo = Boolean(site.logo) && !site.wordmark && !broken;", logos)
        self.assertIn("{site.name}", logos)
        # The config holds no logo list any more; the third-party wall is gone.
        config = read(LANDING_CONFIG)
        self.assertNotIn("LogosConfig", config)
        self.assertNotIn("logos:", config.split("const AGENT_LANDING_CONFIG")[-1].replace("// No `logos` block", ""))
        code = re.sub(r"^\s*//.*$", "", config, flags=re.M)
        for brand in ("Walmart", "Cisco", "Netflix", "Pinterest", "Zoom", "Sony", "Ebay", "Uber"):
            self.assertNotIn(brand, code)
        # Installed: the section, its pure track rule, and base's files required.
        manifest = load_manifest()
        targets = {i["to"] for i in manifest["installs"]}
        self.assertIn("components/custom/logos.tsx", targets)
        self.assertIn("components/custom/logos.client.tsx", targets)
        self.assertIn("components/custom/landing/agent-logos.ts", targets)
        for req in ("components/custom/network-strip.tsx", "components/custom/landing/network-sites.ts",
                    "components/custom/landing/network-strip.ts"):
            self.assertIn(req, manifest["requires"])
        # The track rule imports nothing, so node executes it as it is.
        self.assertNotIn("import ", re.sub(r"^\s*//.*$", "", read(LOGOS_TRACK), flags=re.M))

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
        # The hero form and the opportunities section are loaded by base's
        # client hero-view.tsx, never read by the server: they keep the directive.
        for client_only in ("landing/agent-hero-form.tsx", "landing/agent-opportunities.tsx"):
            self.assertIsNotNone(USE_CLIENT_RE.search(read(os.path.join(CUSTOM, client_only))), client_only)
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
        # 1.17.0: the logos section carries the strip on /landing; the
        # footer row everywhere else. Never afterHero beside footer: that
        # was the two "Trusted by" rows.
        self.assertIn('landing: "section"', src)
        self.assertIn("footer: true", src)
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
        tests/network-strip.test.mts; the shape is held here."""
        src = read(NETWORK_STRIP)
        self.assertIn("  sites?: AgentNetworkSite[];", src)
        self.assertIn("export interface AgentNetworkSite {", src)
        keys = re.findall(r'key: "([a-z]+)"', src)
        self.assertEqual(keys, ["rokct", "supacharge", "juvo", "hosting", "telephony"])
        for key, name, url in (
            ("rokct", "rokct.ai", "https://rokct.ai"),
            ("supacharge", "supacharge.school", "https://supacharge.school"),
            ("juvo", "juvo", "https://juvo.app"),
        ):
            self.assertRegex(src, re.compile(rf'key: "{key}",\s*name: "{re.escape(name)}",\s*url: "{re.escape(url)}",', re.S), key)
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
KNOWN_DEAD_HREFS = frozenset({"/affiliate", "/teams", "/dashboard"})
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
        hrefs = authored_hrefs(HEADER_MENU)
        self.assertIn("/chat", hrefs)
        self.assertGreaterEqual(len(hrefs), 17)
        dead = self.dead_hrefs(hrefs)
        self.assertEqual(
            dead, set(KNOWN_DEAD_HREFS),
            f"new header links to nothing: {sorted(dead - KNOWN_DEAD_HREFS)}; "
            f"fixed, take out of KNOWN_DEAD_HREFS: {sorted(KNOWN_DEAD_HREFS - dead)}",
        )

    def test_every_landing_config_href_is_an_anchor_an_https_url_or_a_route(self):
        # The compare block's "Buy now" / "Explore plans" pointed at
        # /pricing, a route nothing installs: the plans are the `pricing`
        # section the block renders in, the id the header's `anchors`
        # names, so they are that anchor. The same known-dead set covers
        # this file; a new dead href here fails, as in the header.
        hrefs = authored_hrefs(LANDING_CONFIG)
        self.assertIn("/chat", hrefs)
        self.assertEqual(hrefs.count("#pricing"), 2)
        self.assertNotIn("/pricing", hrefs)
        self.assertIn('anchors: ["pricing"]', read(HEADER_MENU))
        dead = self.dead_hrefs(hrefs)
        self.assertEqual(
            dead - KNOWN_DEAD_HREFS, set(),
            f"new landing-config links to nothing: {sorted(dead - KNOWN_DEAD_HREFS)}",
        )


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
        # The existing checks stand, unchanged.
        self.assertIn("if (!chatFromDb) {\n    notFound();", self.page)
        self.assertIn("if (!session || !session.user) {\n    return notFound();", self.page)
        self.assertIn("if (session.user.id !== chat.userId) {\n    return notFound();", self.page)
