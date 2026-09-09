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
# 1.13.0: rokct.ai's say over base_sdk 1.23.0's network strip.
NETWORK_STRIP = os.path.join(TEMPLATES, "components", "custom", "landing", "agent-network-strip.ts")
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
}
NODE_SUITES = [
    "register-config.test.mts",
    "register-provision.test.mts",
    "network-strip.test.mts",
    "hero-copy.test.mts",
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
NEW_FILES = [CONFIG, PROVISION, HELPERS, ACTIONS, NETWORK_STRIP, HERO_COPY]

# 1.13.0: the network-strip registry line, in base's one-line contract.
NETWORK_STRIP_LINE = re.compile(
    r'^  \{ id: "agent-network-strip", load: \(\) => import\("@/components/custom/landing/agent-network-strip"\) \},$'
)

# 1.15.0: the hero-copy registry line, in base's one-line contract.
HERO_COPY_LINE = re.compile(
    r'^  \{ id: "agent-hero", load: \(\) => import\("@/components/custom/landing/agent-hero-copy"\) \},$'
)

IMPORT_RE = re.compile(r'(from\s+|import\()\s*"([^"]+)"')


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

    def test_landing_config_registers_no_logos(self):
        # 1.13.0: the third-party logo wall is off; the section stays.
        config = read(os.path.join(TEMPLATES, "components", "custom", "landing", "agent-landing-config.ts"))
        self.assertIn("  logos: null,", config)
        code = re.sub(r"^\s*//.*$", "", config, flags=re.M)
        self.assertNotIn("getmerlin", code.split("logos: null")[0].split("const AGENT_LANDING_CONFIG")[-1])
        for brand in ("Walmart", "Cisco", "Netflix", "Pinterest", "Zoom", "Sony", "Ebay", "Uber"):
            self.assertNotIn(brand, code)
        logos = os.path.join(TEMPLATES, "components", "custom", "logos.tsx")
        self.assertTrue(os.path.exists(logos), "logos.tsx is flagged, never removed")
        self.assertIn("if (!config || config.logos.length === 0) return null;", read(logos))
        manifest = load_manifest()
        self.assertIn("components/custom/logos.tsx", {i["to"] for i in manifest["installs"]})

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
        self.assertIn("base_sdk >= 1.23.0", manifest["_comment"]["components/custom/landing/network-strip.ts"])

    def test_network_strip_says_where_and_nothing_more(self):
        src = read(NETWORK_STRIP)
        self.assertIn('landing: "afterHero"', src)
        self.assertIn("footer: true", src)
        body = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
        body = re.sub(r"^\s*//.*$", "", body, flags=re.M)
        # No URL, no tracking word: the links are base's list, verbatim.
        self.assertNotIn("http", body)
        for tracker in ("utm", "ref=", "onClick", "gtag", "analytics"):
            self.assertNotIn(tracker, body)
        # Imports nothing, so an older base still compiles the shell.
        self.assertNotIn("import ", body)

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
        self.assertGreaterEqual(int(passed.group(1)), 20)


if __name__ == "__main__":
    unittest.main()
