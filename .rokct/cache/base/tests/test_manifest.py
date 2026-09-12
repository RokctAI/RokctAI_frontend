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

"""Contract tests for base/nextjs's manifest and its one-marker registries.

Run from the repository root:

    python3 -m unittest discover -s base/nextjs/tests -v

The Next.js half of the kernel reaches a host by file copy (manifest.json
`installs`) and a home SDK contributes to it by one-line injection at a
`// @rokct-sdk-<name>-start` marker (sdk_installer_base.update_integrations),
so the two things that must never silently break are: every install source
exists, and every registry carries exactly ONE marker pair. Stdlib only.
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
LANDING = os.path.join(SDK_ROOT, "templates", "components", "custom", "landing")

MARKER_RE = re.compile(r"^\s*// @rokct-sdk-([a-z0-9-]+?)-(start|end)\s*$", re.M)

# The registries a home SDK injects into, each carrying exactly one marker
# whose name is the file's own. A new registry is added here AND to
# manifest.json installs; the tests below tie the two together.
REGISTRIES = {
    "hero-sections.ts": "hero-sections",
    "page-sections.ts": "page-sections",
    "hero-copy.ts": "hero-copy",
    "hero-form.ts": "hero-form",
    "plans-query.ts": "plans-query",
    "header-menu.ts": "header-menu",
    "site-metadata.ts": "site-metadata",
}

# base_sdk 1.15.0: the link-preview shell, installed as a set.
SITE_METADATA_INSTALLS = {
    "templates/components/custom/landing/site-metadata.ts": "components/custom/landing/site-metadata.ts",
    "templates/app/lib/site-metadata.ts": "app/lib/site-metadata.ts",
    "templates/app/opengraph-image.tsx": "app/opengraph-image.tsx",
    "templates/app/twitter-image.tsx": "app/twitter-image.tsx",
}

# base_sdk 1.17.0: the fallback favicon, the first letter of the domain in
# the shell's primary colour.
BRAND_ICON_INSTALL = ("templates/app/brand-icon/route.tsx", "app/brand-icon/route.tsx")

# The kernel's services surface, installed as a directory (ADR-005).
KERNEL = os.path.join(SDK_ROOT, "src", "services")
KERNEL_TENANT_HOSTS = os.path.join(KERNEL, "tenant-hosts.ts")
KERNEL_TENANT_HOST_CONTROL = os.path.join(KERNEL, "tenant-host-control.ts")
TENANT_HOST_CONTROL_TESTS = os.path.join(HERE, "tenant-host-control.test.mts")
# base_sdk 1.30.0: platformCall's one retry on the tenant's other origin.
KERNEL_PLATFORM_GATEWAY = os.path.join(KERNEL, "platform-gateway.ts")
PLATFORM_GATEWAY_TESTS = os.path.join(HERE, "platform-gateway.test.mts")
SITE_METADATA_LIB = os.path.join(SDK_ROOT, "templates", "app", "lib", "site-metadata.ts")
SITE_METADATA_ICONS_TESTS = os.path.join(HERE, "site-metadata-icons.test.mts")
HEADER_MENU_REGISTRY = os.path.join(LANDING, "header-menu.ts")
HEADER = os.path.join(SDK_ROOT, "templates", "components", "custom", "header.tsx")
HEADER_BRAND_TESTS = os.path.join(HERE, "header-brand.test.mts")

# base_sdk 1.32.0: the landing renders server-side (Ray, 2026-09-10: "hero
# i think should be server side if not the whole landing").
HERO_VIEW = os.path.join(SDK_ROOT, "templates", "components", "custom", "hero-view.tsx")
LANDING_PAGE_RESOLVER = os.path.join(LANDING, "landing-page.ts")
LANDING_PAGE = os.path.join(SDK_ROOT, "templates", "app", "landing", "page.tsx")
LANDING_PAGE_TESTS = os.path.join(HERE, "landing-page.test.mts")
LANDING_SSR_INSTALLS = {
    "templates/components/custom/hero-view.tsx": "components/custom/hero-view.tsx",
    "templates/components/custom/landing/landing-page.ts": "components/custom/landing/landing-page.ts",
}

# base_sdk 1.23.0: the network strip - the other sites of the Rokct network
# under "Trusted by", on every shell minus itself.
NETWORK_SITES = os.path.join(LANDING, "network-sites.ts")
NETWORK_STRIP_REGISTRY = os.path.join(LANDING, "network-strip.ts")
NETWORK_STRIP = os.path.join(SDK_ROOT, "templates", "components", "custom", "network-strip.tsx")
FOOTER_CHROME = os.path.join(SDK_ROOT, "templates", "components", "custom", "footer-chrome.tsx")
LANDING_CONTENT = os.path.join(SDK_ROOT, "templates", "components", "custom", "landing-content.tsx")
NETWORK_STRIP_TESTS = os.path.join(HERE, "network-strip.test.mts")
# base_sdk 1.37.0: the footer links seam and the legal documents (Ray,
# 2026-09-10: "supa has no terms pages or about page"; the pages are
# corporate_sdk's, base carries the links and the guest read).
FOOTER_CHROME_CONFIG = os.path.join(LANDING, "footer-chrome-config.ts")
LEGAL_LINKS = os.path.join(LANDING, "legal-links.ts")
LEGAL_ACTION = os.path.join(SDK_ROOT, "templates", "app", "actions", "base", "legal.ts")
LEGAL_LINKS_TESTS = os.path.join(HERE, "legal-links.test.mts")
LEGAL_LINKS_INSTALL = (
    "templates/components/custom/landing/legal-links.ts",
    "components/custom/landing/legal-links.ts",
)
LEGAL_ACTION_INSTALL = ("templates/app/actions/base/legal.ts", "app/actions/base/legal.ts")
# base_sdk 1.45.0: the public terms list falls back to the bundled data/legal pages.
LEGAL_FALLBACK_TESTS = os.path.join(HERE, "legal-fallback.test.mts")
# base_sdk 1.37.0: the footer status probes the tenant only by default
# (Ray, 2026-09-09: every shell reads its footer status from its own tenant
# backend, never from control); control is opt-in via ROKCT_STATUS_SOURCE.
STATUS_ACTION = os.path.join(SDK_ROOT, "templates", "app", "actions", "base", "status.ts")
STATUS_PROBES_TESTS = os.path.join(HERE, "status-probes.test.mts")
# 1.40.0: the action itself, against a stub gateway.
STATUS_ACTION_TESTS = os.path.join(HERE, "status.test.mts")
# base_sdk 1.41.0: the footer's download icon buttons and the install
# offer (Ray, 2026-09-11: "footer has  download links let them be platform
# icons buttons"; "it should check the platform and offer app of that
# platform"), pure rules beside the row and the client component.
DOWNLOAD_PLATFORM = os.path.join(LANDING, "download-platform.ts")
INSTALL_OFFER_RULES = os.path.join(LANDING, "install-offer.ts")
PLATFORM_GLYPHS = os.path.join(LANDING, "platform-glyphs.tsx")
INSTALL_OFFER = os.path.join(SDK_ROOT, "templates", "components", "custom", "install-offer.tsx")
DOWNLOAD_PLATFORM_TESTS = os.path.join(HERE, "download-platform.test.mts")
INSTALL_OFFER_TESTS = os.path.join(HERE, "install-offer.test.mts")
DOWNLOADS_DOC = os.path.join(SDK_ROOT, "docs", "downloads-and-install.md")
DOWNLOADS_INSTALLS = {
    "templates/components/custom/install-offer.tsx": "components/custom/install-offer.tsx",
    "templates/components/custom/landing/download-platform.ts": "components/custom/landing/download-platform.ts",
    "templates/components/custom/landing/install-offer.ts": "components/custom/landing/install-offer.ts",
    "templates/components/custom/landing/platform-glyphs.tsx": "components/custom/landing/platform-glyphs.tsx",
}
# base_sdk 1.42.0: the floating "Back to top" button (Ray, 2026-09-11
# 12:32Z: "whats missing is floating push to home, that button you press
# and it get you to top i just forgot what it says"), pure rules beside the
# client component, mounted once by the landing shell.
BACK_TO_TOP = os.path.join(SDK_ROOT, "templates", "components", "custom", "back-to-top.tsx")
BACK_TO_TOP_RULES = os.path.join(LANDING, "back-to-top.ts")
BACK_TO_TOP_TESTS = os.path.join(HERE, "back-to-top.test.mts")
LANDING_CONTENT = os.path.join(SDK_ROOT, "templates", "components", "custom", "landing-content.tsx")
BACK_TO_TOP_INSTALLS = {
    "templates/components/custom/back-to-top.tsx": "components/custom/back-to-top.tsx",
    "templates/components/custom/landing/back-to-top.ts": "components/custom/landing/back-to-top.ts",
}

# base_sdk 1.26.0: the platform marks base serves itself (Ray, 2026-09-09:
# "move to base, home sdk can choose to use them or not"), installed as a
# directory to public/brand/marks/, and the registry with the one dark-mode
# rule for the monochrome ones.
BRAND_MARKS_INSTALL = ("templates/public/brand/marks", "public/brand/marks")
BRAND_MARKS_REGISTRY_INSTALL = (
    "templates/components/custom/landing/brand-marks.ts",
    "components/custom/landing/brand-marks.ts",
)
BRAND_MARKS_DIR = os.path.join(SDK_ROOT, "templates", "public", "brand", "marks")
BRAND_MARKS_REGISTRY = os.path.join(LANDING, "brand-marks.ts")
BRAND_MARKS_TESTS = os.path.join(HERE, "brand-marks.test.mts")
HERO = os.path.join(SDK_ROOT, "templates", "components", "custom", "hero.tsx")
HEADER_MENU_PARTIALS = os.path.join(SDK_ROOT, "templates", "components", "custom", "header-menu.tsx")
# name -> (bytes, mono): the five files, byte-exact as fetched from
# agent_sdk 1.15.0 (chrome-web-store) and lms_sdk 1.16.0 (the rest).
BRAND_MARKS = {
    "chrome-web-store.svg": (4353, False),
    "google-play.svg": (1181, False),
    "app-gallery.svg": (1342, False),
    "app-store.svg": (687, True),
    "windows.svg": (218, True),
}

# The kernel writes `from './x'`; node's ESM loader wants `from './x.ts'`.
RELATIVE_IMPORT_RE = re.compile(r"(from\s+')(\./[a-z0-9-]+)(')")

BLOCK_COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)
LINE_COMMENT_RE = re.compile(r"^\s*//.*$", re.M)

# The shells' tsconfig, as far as a staged file needs it: strict and
# isolatedModules are the two that catch a missing type import.
TSC_STAGE_CONFIG = {
    "compilerOptions": {
        "target": "ESNext",
        "lib": ["esnext", "dom"],
        "module": "esnext",
        "moduleResolution": "bundler",
        "strict": True,
        "isolatedModules": True,
        "noEmit": True,
        "skipLibCheck": True,
        "types": [],
    },
    "include": ["*.ts"],
}

# What the stage stands in for `next` and node: the shapes the file uses.
TSC_STAGE_STUBS = """
declare module "next" {
  export interface Metadata {
    metadataBase?: URL | null;
    title?: string | { default: string; template?: string } | { absolute: string };
    description?: string;
    applicationName?: string;
    keywords?: string[];
    alternates?: { canonical?: string };
    openGraph?: Record<string, unknown>;
    twitter?: Record<string, unknown>;
    icons?: string | { icon?: unknown; apple?: unknown; shortcut?: unknown };
    [key: string]: unknown;
  }
}
declare module "node:fs" {
  export function existsSync(path: string): boolean;
}
declare module "node:path" {
  export function join(...parts: string[]): string;
}
declare const process: { env: Record<string, string | undefined>; cwd(): string };
"""


# base_sdk 1.22.0: the theme seam base ships, defaulting to dark (Ray,
# 2026-09-09: "default to dark mode").
THEME_PROVIDER_TEMPLATE = os.path.join(
    SDK_ROOT, "templates", "components", "custom", "theme-provider.tsx"
)
THEME_PROVIDER_TARGET = "components/custom/theme-provider.tsx"
# base_sdk 1.35.0: the seam is a server entry over its client half, so it
# can paint the shell's data/theme.json colours.
THEME_PROVIDER_CLIENT_TEMPLATE = os.path.join(
    SDK_ROOT, "templates", "components", "custom", "theme-provider.client.tsx"
)
SITE_THEME_COMPONENT = os.path.join(SDK_ROOT, "templates", "components", "custom", "site-theme.tsx")

# base_sdk 1.35.0: the shell's host-owned data/ folder and its explicit
# data mode (Ray, 2026-09-10: "do you think we need a data folder for non
# backend shells? so if the folder exist sdks read it?", "but dont the
# shell need to anounce im local so it look for data/ first?", "what we
# cant give sdk we can give data/").
SITE_DATA_DIR = os.path.join(SDK_ROOT, "templates", "lib", "site-data")
SITE_DATA_INSTALLS = {
    "templates/lib/site-data/kinds.ts": "lib/site-data/kinds.ts",
    "templates/lib/site-data/validate.mjs": "lib/site-data/validate.mjs",
    "templates/lib/site-data/generate.mjs": "lib/site-data/generate.mjs",
    "templates/lib/site-data/generated.ts": "lib/site-data/generated.ts",
    "templates/lib/site-data/read-site-data.ts": "lib/site-data/read-site-data.ts",
    "templates/lib/site-data/site-theme.ts": "lib/site-data/site-theme.ts",
    "templates/components/custom/site-theme.tsx": "components/custom/site-theme.tsx",
    "templates/components/custom/theme-provider.client.tsx": "components/custom/theme-provider.client.tsx",
}
SITE_DATA_TESTS = os.path.join(HERE, "site-data.test.mts")
SITE_DATA_FIXTURE = os.path.join(HERE, "fixtures", "site-data", "acme")
SITE_DATA_DOC = os.path.join(SDK_ROOT, "docs", "site-data.md")

# What the theme-provider stage stands in for `react` and `next-themes`: the
# prop shape next-themes 0.4.x exports from its package root, and just enough
# JSX for a function component to type-check under `jsx: preserve`.
TSC_THEME_STAGE_STUBS = """
declare namespace JSX {
  interface Element {}
  interface ElementChildrenAttribute { children: {} }
  interface IntrinsicElements { [name: string]: unknown }
}
declare module "react" {
  export type ReactNode = unknown;
  export function createElement(...args: unknown[]): JSX.Element;
}
declare module "server-only" {}
declare module "next-themes" {
  import type { ReactNode } from "react";
  export type Attribute = `data-${string}` | "class";
  export interface ThemeProviderProps {
    children?: ReactNode;
    themes?: string[];
    forcedTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
    enableColorScheme?: boolean;
    storageKey?: string;
    defaultTheme?: string;
    attribute?: Attribute | Attribute[];
    nonce?: string;
  }
  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
}
"""

TSC_THEME_STAGE_CONFIG = {
    "compilerOptions": dict(TSC_STAGE_CONFIG["compilerOptions"], jsx="preserve"),
    "include": ["*.tsx", "*.d.ts"],
}


def load_manifest():
    with open(MANIFEST, encoding="utf-8") as f:
        return json.load(f)


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


class TestManifest(unittest.TestCase):
    def setUp(self):
        self.manifest = load_manifest()

    def test_identity_and_version(self):
        self.assertEqual(self.manifest["name"], "base_sdk")
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

    def test_every_registry_is_installed(self):
        by_from = {e["from"]: e["to"] for e in self.manifest["installs"]}
        for fname in REGISTRIES:
            rel = f"templates/components/custom/landing/{fname}"
            self.assertIn(rel, by_from, f"registry {fname} is not in installs")
            self.assertEqual(by_from[rel], f"components/custom/landing/{fname}")

    def test_site_metadata_shell_is_installed(self):
        by_from = {e["from"]: e["to"] for e in self.manifest["installs"]}
        for src, dst in SITE_METADATA_INSTALLS.items():
            self.assertIn(src, by_from, f"{src} is not in installs")
            self.assertEqual(by_from[src], dst)

    def test_brand_icon_route_is_installed(self):
        # base_sdk 1.17.0: the generated favicon tile is SDK-owned and
        # overwritable, so it ships through installs like the og routes.
        by_from = {e["from"]: e["to"] for e in self.manifest["installs"]}
        src, dst = BRAND_ICON_INSTALL
        self.assertIn(src, by_from, f"{src} is not in installs")
        self.assertEqual(by_from[src], dst)
        self.assertNotIn(dst, self.manifest["requires"])
        route = read(os.path.join(SDK_ROOT, src))
        self.assertIn("export async function GET(", route)
        self.assertIn('export const runtime = "nodejs";', route)
        self.assertIn("public, max-age=86400", route)

    def test_brand_icon_letter_takes_the_primary_colour(self):
        # Ray, 2026-09-09: "that letter should take color of primary
        # color" - the registered themeColor first, else the host's
        # --primary token, never a hard-coded brand.
        route = read(os.path.join(SDK_ROOT, BRAND_ICON_INSTALL[0]))
        self.assertIn("copy.themeColor", route)
        self.assertIn("--primary", route)
        self.assertIn("app/globals.css", route)

    def test_brand_icon_primary_is_found_in_any_root_block(self):
        # base_sdk 1.19.1: rokctai_frontend's app/globals.css opens with a
        # `:root` of unrelated variables and keeps `--primary: 48 96% 53%`
        # in a SECOND `:root` under `@layer base`; 1.17.0 read only the
        # first `:root {` and drew a white R. Ray, 2026-09-09: the letter
        # takes the primary colour. Every `:root` block is scanned in
        # order and the first one that declares `--primary` wins.
        route = read(os.path.join(SDK_ROOT, BRAND_ICON_INSTALL[0]))
        self.assertIn("function rootBlocksOf(css: string)", route)
        self.assertIn("for (const { selector, body } of rootBlocksOf(css))", route)
        self.assertIn("text.matchAll(ROOT_SELECTOR_RE)", route)
        # The old shape - one search, one slice to the first `}` - is gone.
        self.assertNotIn('const close = css.indexOf("}", open);', route)
        # Executed for real: the three pure helpers are lifted out of the
        # route verbatim (they import nothing) and run under node, which
        # strips the type annotations itself (22.6+).
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute rootPrimaryOf")
        start = route.index("/** A `:root` selector head")
        end = route.index("let cachedGlobalsPrimary")
        helpers = route[start:end]
        cases = {
            # rokctai_frontend: theme tokens in the second :root, under @layer base.
            "later_layer": (
                ":root { --foreground-rgb: 0, 0, 0; }\n"
                "@media (prefers-color-scheme: dark) { :root { --foreground-rgb: 255, 255, 255; } }\n"
                "@layer base { :root { --background: 0 0% 100%; --primary: 48 96% 53%;"
                " --primary-foreground: 0 0% 0%; } .dark { --primary: 0 0% 98%; } }\n",
                "48 96% 53%",
            ),
            # supacharge-web: the first :root already carries it, unchanged.
            "first_block": (
                "@layer base { :root { --primary: 24 100% 50%; } .dark { --primary: 0 0% 98%; } }\n",
                "24 100% 50%",
            ),
            # A .dark override of :root is not the theme's primary.
            "dark_root_skipped": (
                ":root.dark { --primary: 0 0% 98%; }\n.dark :root { --primary: 0 0% 90%; }\n"
                ":root { --primary: #ff6600; }\n",
                "#ff6600",
            ),
            # Only .dark blocks define it: nothing, so the route falls back.
            "only_dark": (".dark { --primary: 0 0% 98%; }\n:root { --background: 0 0% 100%; }\n", None),
            # A brace inside a comment does not unbalance the scan.
            "comment_brace": (
                ":root { /* { */ --foreground-rgb: 0, 0, 0; }\n@layer base { :root { --primary: 24 100% 50%; } }\n",
                "24 100% 50%",
            ),
            # --primary-foreground is not --primary.
            "foreground_only": (":root { --primary-foreground: 0 0% 0%; }\n", None),
        }
        script = (
            helpers
            + "\nconst cases: Record<string, string> = "
            + json.dumps({k: v[0] for k, v in cases.items()})
            + ";\nconst out: Record<string, string | null> = {};\n"
            + "for (const [k, css] of Object.entries(cases)) out[k] = rootPrimaryOf(css);\n"
            + "console.log(JSON.stringify(out));\n"
        )
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "root-primary.mts")
            with open(path, "w", encoding="utf-8") as f:
                f.write(script)
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", path],
                capture_output=True, text=True, timeout=60,
            )
        self.assertEqual(run.returncode, 0, run.stderr)
        got = json.loads(run.stdout.strip().splitlines()[-1])
        for name, (_, want) in cases.items():
            with self.subTest(case=name):
                self.assertEqual(got[name], want)

    def test_kernel_services_are_installed_as_a_directory(self):
        by_from = {e["from"]: e["to"] for e in self.manifest["installs"]}
        self.assertEqual(by_from.get("src/services"), "app/services/base")
        self.assertTrue(os.path.exists(KERNEL_TENANT_HOST_CONTROL))

    def test_tenant_host_control_contract(self):
        # base_sdk 1.20.0: the control site answers which tenant a request
        # host belongs to. Guest, cached both ways, never thrown, never
        # asked for a non-public host or the shell's own, and edge-safe so
        # auth_sdk's middleware can call it.
        src = read(KERNEL_TENANT_HOST_CONTROL)
        self.assertIn(
            "export const TENANT_HOST_RESOLVE_METHOD =\n  'control.control.api.subscription.resolve_site_by_host';",
            src,
        )
        self.assertIn("export const TENANT_SITE_HEADER = 'x-rokct-tenant-site';", src)
        self.assertIn("export const TENANT_HOST_POSITIVE_TTL_MS = 5 * 60 * 1000;", src)
        self.assertIn("export const TENANT_HOST_NEGATIVE_TTL_MS = 60 * 1000;", src)
        # 1.30.0: stale-while-error keeps the last answer for a day.
        self.assertIn("export const TENANT_HOST_STALE_TTL_MS = 24 * 60 * 60 * 1000;", src)
        for env in ("ROKCT_TENANT_HOST_TTL_MS", "ROKCT_TENANT_HOST_NEGATIVE_TTL_MS",
                    "ROKCT_TENANT_HOST_STALE_TTL_MS",
                    "ROKCT_TENANT_HOST_TIMEOUT_MS", "ROKCT_TENANT_HOST_LOOKUP",
                    "NEXT_PUBLIC_SITE_URL"):
            self.assertIn(f"'{env}'", src, f"{env} is not read")
        self.assertIn("export async function resolveTenantSiteForRequest(", src)
        self.assertIn("export async function resolveTenantSiteByHost(", src)
        self.assertIn("export function registerControlTenantHostResolver(): boolean", src)
        self.assertIn("if (!isPublicHost(name)) return null;", src)
        # 1.30.0: the pair (site name + backend origin) and its two helpers
        # the gateway retries and guards credentials with. The identity
        # half keeps answering the site name only.
        self.assertIn("export interface TenantHostSite {", src)
        self.assertIn("export async function resolveTenantHost(", src)
        self.assertIn("export function alternateTenantOrigin(", src)
        self.assertIn("export function sameTenantOrigin(", src)
        self.assertIn("return (await resolveTenantHost(host))?.siteName ?? null;", src)
        self.assertIn("return found.backendUrl ?? found.siteName;", src)
        # Edge-safe: only the pure kernel modules, no session, no next/headers.
        imports = re.findall(r"^(?:import .*|\}) from '([^']+)';$", src, re.M)
        self.assertEqual(sorted(set(imports)), ["./gateway-constants", "./telemetry", "./tenant-hosts"])
        self.assertNotIn("next/headers", src)
        self.assertNotIn("./session", src)
        self.assertNotIn("Authorization", src)
        # The gateway registers it at load, so resolveTenantBaseUrl's
        # per-host step keeps working with no host wiring.
        gateway = read(KERNEL_PLATFORM_GATEWAY)
        self.assertRegex(
            gateway,
            re.compile(r"^import \{\n(?:  \w+,\n)*  registerControlTenantHostResolver,\n(?:  \w+,\n)*\} from './tenant-host-control';$", re.M),
        )
        self.assertIn("\nregisterControlTenantHostResolver();\n", gateway)
        # 1.30.0: one retry on the other origin of the pair, guarded.
        self.assertIn("const RETRY_STATUSES = new Set([502, 503, 504]);", gateway)
        self.assertIn("const res = await fetchWithAlternate(cmd, baseUrl, alternate, send);", gateway)
        self.assertIn("const credentialsApply = !sessionSite || sameTenantOrigin(sessionSite, baseUrl);", gateway)
        self.assertNotIn("sameSite(", gateway, "the plain same-site guard was replaced by the pair-aware one")
        index = read(os.path.join(KERNEL, "index.ts"))
        self.assertIn("} from './tenant-host-control';", index)
        for name in ("resolveTenantSiteForRequest", "TENANT_SITE_HEADER", "requestHost", "isPublicHost"):
            self.assertIn(f"  {name},", index, f"index.ts does not export {name}")

    def test_tenant_host_control_behaviour_under_node(self):
        # Executed for real: the kernel's services are staged into a temp
        # dir with their relative imports given the `.ts` node's loader
        # wants, and tests/tenant-host-control.test.mts runs against them
        # under node's own test runner (22.6+, type stripping).
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute tenant-host-control")
        with tempfile.TemporaryDirectory() as tmp:
            for fname in os.listdir(KERNEL):
                if not fname.endswith(".ts"):
                    continue
                staged = RELATIVE_IMPORT_RE.sub(r"\1\2.ts\3", read(os.path.join(KERNEL, fname)))
                with open(os.path.join(tmp, fname), "w", encoding="utf-8") as f:
                    f.write(staged)
            shutil.copy(TENANT_HOST_CONTROL_TESTS, os.path.join(tmp, "tenant-host-control.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "tenant-host-control.test.mts")],
                capture_output=True, text=True, timeout=120,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 29)

    def test_platform_gateway_behaviour_under_node(self):
        # base_sdk 1.30.0, executed for real like the resolver: the kernel
        # is staged with `.ts` imports, session.ts's host seam
        # (`server-only`, `@/app/lib/session`) stood in by a null session
        # (the tests pass their session explicitly), and
        # tests/platform-gateway.test.mts runs under node's test runner.
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute platform-gateway")
        with tempfile.TemporaryDirectory() as tmp:
            for fname in os.listdir(KERNEL):
                if not fname.endswith(".ts"):
                    continue
                staged = RELATIVE_IMPORT_RE.sub(r"\1\2.ts\3", read(os.path.join(KERNEL, fname)))
                if fname == "session.ts":
                    for needle in ("import 'server-only';\n",
                                   "import { getCurrentSession } from '@/app/lib/session';"):
                        self.assertIn(needle, staged, "session.ts no longer carries the seam the stage replaces")
                    staged = staged.replace("import 'server-only';\n", "").replace(
                        "import { getCurrentSession } from '@/app/lib/session';",
                        "const getCurrentSession = async (): Promise<unknown> => null;",
                    )
                with open(os.path.join(tmp, fname), "w", encoding="utf-8") as f:
                    f.write(staged)
            shutil.copy(PLATFORM_GATEWAY_TESTS, os.path.join(tmp, "platform-gateway.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "platform-gateway.test.mts")],
                capture_output=True, text=True, timeout=120,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 19)

    def test_page_metadata_carries_no_icons(self):
        # base_sdk 1.20.0 (Ray, 2026-09-09: "rokct got a letter favicon and
        # lost its own image"): Next replaces `icons` per segment wholesale,
        # so a page that emitted the generated set overrode the root
        # layout's own override. Only the layout scope resolves icons.
        lib = read(SITE_METADATA_LIB)
        self.assertIn(
            'options.scope === "page" || overrides?.icons !== undefined\n      ? undefined\n      : await resolveIcons(copy);',
            lib,
        )
        self.assertNotIn("overrides?.icons === undefined ? await resolveIcons(copy) : undefined", lib)
        self.assertIn("Known limitation: hostIconExists() is a runtime check", lib)
        # Executed for real: the lib is staged next to the kernel with its
        # registry import stubbed (one copy, no icon) and run under node.
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute buildPageMetadata")
        with tempfile.TemporaryDirectory() as tmp:
            for fname in os.listdir(KERNEL):
                if fname.endswith(".ts"):
                    staged = RELATIVE_IMPORT_RE.sub(r"\1\2.ts\3", read(os.path.join(KERNEL, fname)))
                    with open(os.path.join(tmp, fname), "w", encoding="utf-8") as f:
                        f.write(staged)
            staged = lib.replace(
                'from "@/app/services/base/tenant-hosts"', 'from "./tenant-hosts.ts"'
            ).replace(
                'from "@/components/custom/landing/site-metadata"', 'from "./landing-site-metadata.ts"'
            )
            self.assertNotIn('from "@/', staged, "site-metadata.ts imports something the stage does not cover")
            with open(os.path.join(tmp, "site-metadata.ts"), "w", encoding="utf-8") as f:
                f.write(staged)
            with open(os.path.join(tmp, "landing-site-metadata.ts"), "w", encoding="utf-8") as f:
                f.write(
                    "export async function loadSiteMetadata() {\n"
                    '  return { title: "Shell", siteName: "Shell", url: "https://shell.platform-shell.co" };\n'
                    "}\n"
                )
            shutil.copy(SITE_METADATA_ICONS_TESTS, os.path.join(tmp, "site-metadata-icons.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "site-metadata-icons.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)

    def test_site_metadata_imports_every_kernel_name_it_uses(self):
        """1.21.0: `resolveDisplayHost` takes a `HeaderReader`, but 1.20.0's
        import from the kernel brought only the three functions; the
        `export { ... type HeaderReader }` re-export at the bottom does not
        put the name in scope, so `next build` in a shell without
        ignoreBuildErrors failed with TS2304. Every name the re-export
        forwards that the file's own code also uses must be imported."""
        lib = read(SITE_METADATA_LIB)
        imported = re.search(
            r'^import \{([^}]*)\} from "@/app/services/base/tenant-hosts";', lib, re.M
        )
        self.assertIsNotNone(imported, "no import from the kernel's tenant-hosts")
        forwarded = re.search(
            r'^export \{([^}]*)\} from "@/app/services/base/tenant-hosts";', lib, re.M
        )
        self.assertIsNotNone(forwarded, "no re-export from the kernel's tenant-hosts")
        names_in = {n.replace("type ", "").strip() for n in imported.group(1).split(",") if n.strip()}
        names_out = {n.replace("type ", "").strip() for n in forwarded.group(1).split(",") if n.strip()}
        body = lib.replace(imported.group(0), "").replace(forwarded.group(0), "")
        body = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", body))
        self.assertIn("HeaderReader", names_in)
        for name in sorted(names_out):
            if re.search(rf"\b{re.escape(name)}\b", body):
                with self.subTest(name=name):
                    self.assertIn(name, names_in, f"{name} is used in site-metadata.ts but not imported")

    def test_site_metadata_type_checks_under_tsc(self):
        """The same miss, caught the way a shell build catches it: tsc over a
        staged app/lib/site-metadata.ts, strict and isolatedModules as the
        shells' tsconfig is, with the kernel's tenant-hosts.ts and the
        landing registry beside it and `next`/`node:*` stubbed to their
        shapes. Runs when a TypeScript compiler is reachable - `ROKCT_TSC`
        (a path to tsc), else `tsc` on PATH - and skips otherwise, so the
        stdlib-only run above still guards the import."""
        tsc = os.environ.get("ROKCT_TSC") or shutil.which("tsc")
        if not tsc or not os.path.exists(tsc):
            raise unittest.SkipTest("no tsc reachable (set ROKCT_TSC to a tsc binary)")
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(KERNEL_TENANT_HOSTS, os.path.join(tmp, "tenant-hosts.ts"))
            staged = read(SITE_METADATA_LIB).replace(
                'from "@/app/services/base/tenant-hosts"', 'from "./tenant-hosts"'
            ).replace(
                'from "@/components/custom/landing/site-metadata"', 'from "./landing-site-metadata"'
            )
            self.assertNotIn('from "@/', staged, "site-metadata.ts imports something the stage does not cover")
            with open(os.path.join(tmp, "site-metadata.ts"), "w", encoding="utf-8") as f:
                f.write(staged)
            registry = read(os.path.join(LANDING, "site-metadata.ts")).replace(
                'from "@/app/config/platform"', 'from "./platform"'
            )
            self.assertNotIn('from "@/', registry)
            with open(os.path.join(tmp, "landing-site-metadata.ts"), "w", encoding="utf-8") as f:
                f.write(registry)
            with open(os.path.join(tmp, "platform.ts"), "w", encoding="utf-8") as f:
                f.write('export const PLATFORM_NAME = "Shell";\n')
            with open(os.path.join(tmp, "stubs.d.ts"), "w", encoding="utf-8") as f:
                f.write(TSC_STAGE_STUBS)
            with open(os.path.join(tmp, "tsconfig.json"), "w", encoding="utf-8") as f:
                json.dump(TSC_STAGE_CONFIG, f)
            run = subprocess.run(
                [tsc, "-p", tmp], capture_output=True, text=True, timeout=300, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)

    def test_host_layout_is_a_declared_prerequisite(self):
        self.assertIn("app/layout.tsx", self.manifest["requires"])
        note = self.manifest["_comment"].get("app/layout.tsx", "")
        self.assertIn("buildSiteMetadata", note)
        self.assertIn("@rokct-sdk-site-metadata-start", note)

    def test_changelog_leads_with_the_manifest_version(self):
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        heads = re.findall(r"^## (\d+\.\d+\.\d+)$", changelog, re.M)
        self.assertTrue(heads, "CHANGELOG.md has no version heading")
        self.assertEqual(heads[0], self.manifest["version"])


    def test_theme_provider_is_installed_and_defaults_to_dark(self):
        """1.22.0 (Ray, 2026-09-09: "default to dark mode"): base ships the
        theme seam, and its default is dark. The install lands on the path
        both shells already import from their root layout; since 1.35.0 the
        template is a directive-free SERVER entry that renders the
        data/theme.json colour block and then the client half,
        theme-provider.client.tsx, a client wrapper over next-themes whose
        `defaultTheme` falls back to "dark" and whose `attribute` falls back
        to "class" (Tailwind's darkMode signal); next-themes is a declared
        dependency, and the host layout note states the contract."""
        installs = {e["from"]: e["to"] for e in self.manifest["installs"]}
        self.assertEqual(
            installs.get("templates/components/custom/theme-provider.tsx"),
            THEME_PROVIDER_TARGET,
        )
        self.assertEqual(
            installs.get("templates/components/custom/theme-provider.client.tsx"),
            "components/custom/theme-provider.client.tsx",
        )
        self.assertNotIn(THEME_PROVIDER_TARGET, self.manifest["requires"])
        self.assertIn("next-themes", self.manifest["dependencies"])

        entry = read(THEME_PROVIDER_TEMPLATE)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", entry)).lstrip()
        self.assertFalse(code.startswith(('"use client"', "'use client'")), "the entry is a server component")
        self.assertNotIn('"use client"', code)
        self.assertIn('from "@/components/custom/theme-provider.client";', entry)
        self.assertIn('from "@/components/custom/site-theme";', entry)
        self.assertIn("<SiteTheme />", entry)
        self.assertIn("<ThemeProviderClient {...props}>{children}</ThemeProviderClient>", entry)
        self.assertIn("export { DEFAULT_THEME, THEME_ATTRIBUTE };", entry)
        self.assertIn("export default ThemeProvider;", entry)
        self.assertNotRegex(entry, r'defaultTheme = "(light|system)"')
        self.assertNotRegex(entry, r'defaultTheme="(light|system)"')

        src = read(THEME_PROVIDER_CLIENT_TEMPLATE)
        self.assertRegex(src, re.compile(r'^"use client";$', re.M), "the client half is a client component")
        self.assertRegex(src, re.compile(r'^export const DEFAULT_THEME = "dark";$', re.M))
        self.assertRegex(src, re.compile(r'^export const THEME_ATTRIBUTE = "class";$', re.M))
        self.assertRegex(src, r"\bdefaultTheme = DEFAULT_THEME\b", "defaultTheme must fall back to DEFAULT_THEME")
        self.assertRegex(src, r"\battribute = THEME_ATTRIBUTE\b", "attribute must fall back to THEME_ATTRIBUTE")
        self.assertNotRegex(src, r'defaultTheme = "(light|system)"')
        self.assertNotRegex(src, r'defaultTheme="(light|system)"')
        self.assertIn('from "next-themes";', src)
        self.assertNotIn("next-themes/dist/types", src, "0.4.x exports the props type from the package root")
        self.assertIn("export function ThemeProviderClient(", src)
        self.assertIn("export default ThemeProviderClient;", src)

        note = self.manifest["_comment"].get("app/layout.tsx", "")
        self.assertIn("theme-provider", note)
        self.assertIn("dark", note)
        self.assertIn("server component", note)

    def test_theme_provider_type_checks_under_tsc(self):
        """The staged seam under tsc, strict and isolatedModules with
        `jsx: preserve`, against next-themes 0.4.x's prop shape: the entry,
        its client half, the site-theme component and the lib/site-data
        modules it reads, with the `@/` imports pointed at the stage and
        `server-only` stood in by an empty module. The client half's
        destructured defaults must fit `ThemeProviderProps` (an `attribute`
        that is not an Attribute, or a props type imported from a path the
        package does not export, fails here the way a shell build would).
        Skips when no tsc is reachable."""
        tsc = os.environ.get("ROKCT_TSC") or shutil.which("tsc")
        if not tsc or not os.path.exists(tsc):
            raise unittest.SkipTest("no tsc reachable (set ROKCT_TSC to a tsc binary)")
        rewrites = {
            'from "@/components/custom/theme-provider.client"': 'from "./theme-provider.client"',
            'from "@/components/custom/site-theme"': 'from "./site-theme"',
            'from "@/lib/site-data/read-site-data"': 'from "./read-site-data"',
            'from "@/lib/site-data/site-theme"': 'from "./site-theme-css"',
            'from "@/lib/site-data/kinds"': 'from "./kinds"',
        }
        staged = {
            "theme-provider.tsx": THEME_PROVIDER_TEMPLATE,
            "theme-provider.client.tsx": THEME_PROVIDER_CLIENT_TEMPLATE,
            "site-theme.tsx": SITE_THEME_COMPONENT,
            "site-theme-css.ts": os.path.join(SITE_DATA_DIR, "site-theme.ts"),
            "read-site-data.ts": os.path.join(SITE_DATA_DIR, "read-site-data.ts"),
            "kinds.ts": os.path.join(SITE_DATA_DIR, "kinds.ts"),
            "generated.ts": os.path.join(SITE_DATA_DIR, "generated.ts"),
        }
        with tempfile.TemporaryDirectory() as tmp:
            for name, src in staged.items():
                text = read(src)
                for old, new in rewrites.items():
                    text = text.replace(old, new)
                with open(os.path.join(tmp, name), "w", encoding="utf-8") as f:
                    f.write(text)
            with open(os.path.join(tmp, "stubs.d.ts"), "w", encoding="utf-8") as f:
                f.write(TSC_THEME_STAGE_STUBS)
            config = dict(TSC_THEME_STAGE_CONFIG, include=["*.tsx", "*.ts", "*.d.ts"])
            with open(os.path.join(tmp, "tsconfig.json"), "w", encoding="utf-8") as f:
                json.dump(config, f)
            run = subprocess.run(
                [tsc, "-p", tmp], capture_output=True, text=True, timeout=300, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)

    # -- 1.35.0: the host-owned data/ folder and the explicit data mode --------

    def test_site_data_files_are_installed(self):
        """Every file of the seam is installed to lib/site-data/ (and the two
        components beside the theme seam), the manifest is 1.35.0 and says
        so, the CHANGELOG leads with it, and the docs exist."""
        by_from = {e["from"]: e["to"] for e in self.manifest["installs"]}
        for src, dst in SITE_DATA_INSTALLS.items():
            self.assertEqual(by_from.get(src), dst, f"{src} must install to {dst}")
            self.assertTrue(os.path.exists(os.path.join(SDK_ROOT, src)), src)
            self.assertNotIn(dst, self.manifest["requires"])
        about = self.manifest["_comment"]["about"]
        for text in ("Since 1.35.0", '"data": "local" | "backend" | "hybrid"', "lib/site-data/generate.mjs",
                     "readSiteData(kind)", "hasSiteData(kind)", "@/lib/site-data/read-site-data",
                     "site_data", "The brand name is never in data/", "docs/site-data.md"):
            self.assertIn(text, about)
        self.assertTrue(os.path.exists(SITE_DATA_DOC))
        doc = read(SITE_DATA_DOC)
        for text in ("@/lib/site-data/read-site-data", "@/lib/site-data/kinds", "prebuild",
                     "corporate_sdk 1.1.0", "The brand name is never in `data/`"):
            self.assertIn(text, doc)
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("## 1.35.0", changelog)
        self.assertNotRegex(changelog, re.compile(r"^#[^#\s]", re.M), "no CHANGELOG line starts with # and text")

    def test_neutral_generated_module_is_what_the_generator_writes(self):
        """base installs generated.ts as "backend, no files" and the generator
        writes exactly that text for a backend shell, so a shell that never
        runs the script and one that does agree byte for byte."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node is needed to execute generate.mjs")
        neutral = read(os.path.join(SITE_DATA_DIR, "generated.ts"))
        self.assertIn('"mode": "backend"', neutral)
        self.assertIn('import type { SiteDataBundle } from "./kinds";', neutral)
        with tempfile.TemporaryDirectory() as tmp:
            run = subprocess.run(
                [node, os.path.join(SITE_DATA_DIR, "generate.mjs"), "--root", tmp],
                capture_output=True, text=True, timeout=60,
            )
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            self.assertIn("[site-data] mode backend: no data/ file bundled", run.stdout)
            self.assertEqual(read(os.path.join(tmp, "lib", "site-data", "generated.ts")), neutral)

    def test_site_data_reader_is_server_only_and_typed(self):
        reader = read(os.path.join(SITE_DATA_DIR, "read-site-data.ts"))
        self.assertRegex(reader, re.compile(r'^import "server-only";$', re.M))
        self.assertIn('import { SITE_DATA } from "./generated";', reader)
        for fn in ("export function siteDataMode(): SiteDataMode",
                   "export function hasSiteData(kind: SiteDataKind): boolean",
                   "export function readSiteData<K extends SiteDataKind>(kind: K): SiteDataKinds[K] | undefined"):
            self.assertIn(fn, reader)
        kinds = read(os.path.join(SITE_DATA_DIR, "kinds.ts"))
        self.assertNotIn('import "server-only"', kinds, "the types are importable from client code")
        self.assertIn('export type SiteDataMode = "local" | "backend" | "hybrid";', kinds)
        self.assertIn('export const DEFAULT_SITE_DATA_MODE: SiteDataMode = "backend";', kinds)
        for kind in ("theme", "team", "stockists", "products", "about", "legal", "network"):
            self.assertRegex(kinds, re.compile(rf"^  {kind}: Site\w+;$", re.M), f"{kind} is a kind")
        self.assertIn("export interface SiteLegalPage {", kinds)
        # No brand string anywhere in the seam.
        for name in os.listdir(SITE_DATA_DIR):
            text = read(os.path.join(SITE_DATA_DIR, name)).lower()
            for brand in ("rokct.ai", "supacharge", "south river", "southriver"):
                self.assertNotIn(brand, text, f"{name} names a brand")

    def test_site_data_behaviour_under_node(self):
        """tests/site-data.test.mts, run in place: it imports the templates
        by relative path (the generator and validators are plain ESM, the
        rule and the theme CSS are stripped TypeScript) and drives the
        generator against tests/fixtures/site-data/acme and temp shells."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute the site-data suite")
        self.assertTrue(os.path.isdir(SITE_DATA_FIXTURE))
        run = subprocess.run(
            [node, "--experimental-strip-types", "--no-warnings", "--test", SITE_DATA_TESTS],
            capture_output=True, text=True, timeout=180, cwd=HERE,
        )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 23)

    def test_fixture_data_folder_names_no_real_thing(self):
        """The fixture data/ is acme.school's: no brand, nobody real."""
        for root, _, files in os.walk(SITE_DATA_FIXTURE):
            for name in files:
                text = read(os.path.join(root, name)).lower()
                for word in ("rokct", "supacharge", "south river", "southriver", "demo", "sample", "lorem"):
                    self.assertNotIn(word, text, f"{name} carries {word}")
                if name != "theme.json":
                    self.assertIn("acme", text, f"{name} is not an acme.school fixture")

    def test_local_mode_switches_off_backend_only_surface(self):
        """A local shell has no backend: the landing page reads the mode
        through the reader, prefetches no plans in local mode and hands
        `dataMode` to the arrangement, to every section and (1.38.0) to
        the client wrapper; the arrangement drops the header actions that
        lead to the sign-in / sign-up routes; the section types carry the
        field."""
        page = read(LANDING_PAGE)
        self.assertIn('import { siteDataMode } from "@/lib/site-data/read-site-data";', page)
        self.assertIn("const dataMode = siteDataMode();", page)
        self.assertIn('if (dataMode !== "local") {', page)
        self.assertLess(page.index('if (dataMode !== "local") {'), page.index("plans = await getLandingPlans();"))
        self.assertIn("resolveLandingPage({ plans, session, dataMode })", page)
        # Two RegisteredSections renders and, since 1.38.0, LandingContent.
        self.assertEqual(page.count("dataMode={dataMode}"), 4)
        resolver = read(LANDING_PAGE_RESOLVER)
        self.assertIn("export function dropBackendOnlyActions(", resolver)
        self.assertIn('if (dataMode !== "local") return actions;', resolver)
        self.assertIn("new Set([LANDING_CONFIG.loginUrl, LANDING_CONFIG.signupUrl])", resolver)
        self.assertIn("actions: dropBackendOnlyActions(menu.actions, ctx.dataMode)", resolver)
        sections = read(os.path.join(LANDING, "page-sections.ts"))
        self.assertIn('import type { SiteDataMode } from "@/lib/site-data/kinds";', sections)
        self.assertEqual(sections.count("dataMode?: SiteDataMode;"), 2)
        # The panel partials are not touched by this rule.
        self.assertNotIn("site-data", read(HEADER_MENU_PARTIALS))

    def test_header_skips_its_own_auth_pair_on_a_local_shell(self):
        """1.38.0: the TODO 1.35.0 left on dropBackendOnlyActions. The
        header's OWN Log in / Sign up pair - not a declared action - follows
        the same `local` rule: the page hands the mode it read to the
        client wrapper, the wrapper to the header as `dataMode`, and the
        header draws no pair for a visitor with no session when
        showsHeaderAuth(dataMode) (header-menu.ts, pure) answers false, on
        the bar and in the burger panel. A caller that passes no mode draws
        what it drew. The "use client" files import only the TYPE from
        lib/site-data/kinds, never the server-only reader."""
        registry = read(HEADER_MENU_REGISTRY)
        self.assertIn('import type { SiteDataMode } from "@/lib/site-data/kinds";', registry)
        self.assertIn("export function showsHeaderAuth(dataMode: SiteDataMode | undefined): boolean {", registry)
        self.assertIn('return dataMode !== "local";', registry)
        header = read(HEADER)
        self.assertIn('import type { SiteDataMode } from "@/lib/site-data/kinds";', header)
        self.assertIn("  showsHeaderAuth,\n", header)
        self.assertIn("dataMode?: SiteDataMode;", header)
        self.assertIn("const hasAuth = !!user || showsHeaderAuth(dataMode);", header)
        self.assertEqual(header.count("!hasAuth ? null :"), 2, "the desktop element and the stacked panel")
        content = read(LANDING_CONTENT)
        self.assertIn('import type { SiteDataMode } from "@/lib/site-data/kinds";', content)
        self.assertIn("dataMode?: SiteDataMode;", content)
        self.assertIn("dataMode={dataMode}", content)
        self.assertIn("dataMode={dataMode}", read(LANDING_PAGE))
        for path in (HEADER, LANDING_CONTENT, HEADER_MENU_REGISTRY):
            self.assertNotIn("read-site-data", read(path), path)
        resolver = read(LANDING_PAGE_RESOLVER)
        self.assertNotIn("TODO", resolver, "the 1.35.0 TODO is done")
        self.assertIn("showsHeaderAuth(dataMode)", resolver)
        doc = read(SITE_DATA_DOC)
        self.assertNotIn("Not yet switched", doc)
        self.assertIn("showsHeaderAuth", doc)

    def test_sections_may_name_a_company_page(self):
        """1.38.0 (Ray, 2026-09-10: corporate_sdk owns /about and /team as
        renderers; a home SDK's cards reach them through the one section
        registry). PageSectionMeta.page is "landing" | "about" | "team",
        absent meaning landing; the landing arrangement keeps only landing
        sections (so a company-page section is neither drawn nor a nav
        stop there), and pageSectionsFor(page) is what a company page
        awaits - the same loader, renders and order rules, filtered. No
        brand, no route and no host is named by either module."""
        sections = read(os.path.join(LANDING, "page-sections.ts"))
        self.assertIn('export type PageSlot = "landing" | "about" | "team";', sections)
        self.assertIn('export const PAGE_SLOTS: readonly PageSlot[] = ["landing", "about", "team"];', sections)
        self.assertIn('export const DEFAULT_PAGE_SLOT: PageSlot = "landing";', sections)
        self.assertIn("  page?: PageSlot;", sections)
        self.assertIn("export function sectionPageOf(meta: PageSectionMeta | undefined): PageSlot {", sections)
        self.assertIn("return meta?.page ?? DEFAULT_PAGE_SLOT;", sections)
        resolver = read(LANDING_PAGE_RESOLVER)
        self.assertIn("export function presentSectionsFor(", resolver)
        self.assertIn(".filter((s) => sectionPageOf(s.meta) === page)", resolver)
        self.assertIn(".filter((s) => s.meta.renders?.(ctx) ?? true)", resolver)
        self.assertIn(".sort((a, b) => a.order - b.order)", resolver)
        self.assertIn("const present = presentSectionsFor(DEFAULT_PAGE_SLOT, loaded, ctx);", resolver)
        self.assertIn("export async function pageSectionsFor(", resolver)
        self.assertIn("  page: PageSlot,\n  ctx: PageSectionContext = { plans: [], session: null },\n"
                      "  entries: PageSectionEntry[] = PAGE_SECTIONS,\n): Promise<LoadedSection[]> {", resolver)
        self.assertIn("return presentSectionsFor(page, loaded, ctx);", resolver)
        for path in (os.path.join(LANDING, "page-sections.ts"), LANDING_PAGE_RESOLVER):
            code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(path))).lower()
            for word in ("rokct.ai", "supacharge", "/about", "/team", "#"):
                self.assertNotIn(word, code, f"{os.path.basename(path)} names {word}")
        self.assertIn("pageSectionsFor", read(SITE_DATA_DOC))
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("## 1.38.0", changelog)
        self.assertIn("`PageSectionMeta.page?:", changelog)
        self.assertNotRegex(changelog, re.compile(r"^#[^#\s]", re.M), "no CHANGELOG line starts with # and text")


class TestRegistryMarkers(unittest.TestCase):
    def markers(self, fname):
        return MARKER_RE.findall(read(os.path.join(LANDING, fname)))

    def test_each_registry_has_exactly_one_marker_pair(self):
        for fname, name in REGISTRIES.items():
            with self.subTest(registry=fname):
                found = self.markers(fname)
                self.assertEqual(
                    found,
                    [(name, "start"), (name, "end")],
                    f"{fname} must carry exactly one // @rokct-sdk-{name}-start/-end pair",
                )

    def test_no_registry_carries_another_registrys_marker(self):
        for fname, name in REGISTRIES.items():
            with self.subTest(registry=fname):
                others = {n for n, _ in self.markers(fname)} - {name}
                self.assertFalse(others, f"{fname} also carries markers {sorted(others)}")

    def test_site_metadata_marker_sits_inside_the_array_literal(self):
        src = read(os.path.join(LANDING, "site-metadata.ts"))
        start = src.index("// @rokct-sdk-site-metadata-start")
        end = src.index("// @rokct-sdk-site-metadata-end")
        opened = src.rindex("export const SITE_METADATA: SiteMetadataEntry[] = [", 0, start)
        closed = src.index("];", end)
        self.assertLess(opened, start)
        self.assertLess(start, end)
        self.assertLess(end, closed)
        self.assertEqual(src.count("@rokct-sdk-site-metadata-start"), 1)
        self.assertEqual(src.count("@rokct-sdk-site-metadata-end"), 1)

    def test_site_metadata_declares_the_tour_still(self):
        # base_sdk 1.16.0: the generated card draws a registered still of the
        # app in a phone frame; the registry declares the two fields and the
        # route reads them.
        src = read(os.path.join(LANDING, "site-metadata.ts"))
        self.assertIn("still?: string;", src)
        self.assertIn('stillAnchor?: "top" | "bottom";', src)
        route = read(os.path.join(SDK_ROOT, "templates", "app", "opengraph-image.tsx"))
        self.assertIn("copy.still", route)
        self.assertIn("copy.stillAnchor", route)

    def test_header_menu_declares_the_brand(self):
        """1.21.0 (Ray, 2026-09-09: "let home sdk declare if it needs logo
        there or not"): the registry carries the declaration, the header
        renders through it, and neither ever draws the generated tile."""
        src = read(HEADER_MENU_REGISTRY)
        self.assertIn('export type HeaderBrandLogo = "auto" | "none" | (string & {});', src)
        self.assertIn("export interface HeaderBrand {", src)
        self.assertIn("  brand?: HeaderBrand;", src)
        self.assertIn("export function resolveHeaderBrand(", src)
        self.assertIn("export async function loadHeaderBrand(): Promise<ResolvedHeaderBrand>", src)
        header = read(HEADER)
        self.assertIn("loadHeaderBrand", header)
        # 1.24.0: the brand slot takes the collapse state; a still brand ignores it.
        self.assertIn("<HeaderBrand collapsed={collapsed} />", header)
        self.assertIn("<BrandLogo width={32} height={32} />", header)
        self.assertIn('<Branding className="text-xl" />', header)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", header))
        self.assertNotIn("/brand-icon", code)
        self.assertNotIn("GENERATED_BRAND_ICON", code)
        # The header is a client bundle; app/lib/site-metadata.ts reaches
        # for node:fs and must stay out of it.
        self.assertNotIn("@/app/lib/site-metadata", header)

    def test_header_brand_behaviour_under_node(self):
        """resolveHeaderBrand and loadHeaderBrand executed: "none" draws no
        image, a path draws that src, "auto" with no real icon draws the
        host's mark (no src, never /brand-icon), "auto" with a registered
        copy.icon draws that src."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute header-menu.ts")
        with tempfile.TemporaryDirectory() as tmp:
            staged = read(HEADER_MENU_REGISTRY).replace(
                'from "@/components/custom/landing/landing-config"', 'from "./landing-config.ts"'
            ).replace(
                'from "@/components/custom/landing/site-metadata"', 'from "./landing-site-metadata.ts"'
            ).replace(
                'from "@/lib/site-data/kinds"', 'from "./site-data-kinds.ts"'
            )
            self.assertNotIn('from "@/', staged, "header-menu.ts imports something the stage does not cover")
            with open(os.path.join(tmp, "header-menu.ts"), "w", encoding="utf-8") as f:
                f.write(staged)
            with open(os.path.join(tmp, "landing-config.ts"), "w", encoding="utf-8") as f:
                f.write("export type LandingNavBadge = 'new' | 'soon';\n"
                        "export interface LandingNavItem { id: string; label: string; badge?: LandingNavBadge }\n")
            # 1.38.0: showsHeaderAuth takes the shell's data mode.
            with open(os.path.join(tmp, "site-data-kinds.ts"), "w", encoding="utf-8") as f:
                f.write('export type SiteDataMode = "local" | "backend" | "hybrid";\n')
            with open(os.path.join(tmp, "landing-site-metadata.ts"), "w", encoding="utf-8") as f:
                f.write(
                    "let icon: string | undefined;\n"
                    "export function setRegisteredIcon(value: string | undefined) { icon = value; }\n"
                    "export async function loadSiteMetadata() {\n"
                    '  return { title: "Shell", siteName: "Shell", description: "", tagline: "", icon };\n'
                    "}\n"
                )
            shutil.copy(HEADER_BRAND_TESTS, os.path.join(tmp, "header-brand.test.mts"))
            # 1.29.0: the node test reads the header's stem wordmark markup
            # (its responsive size) as text; the copy is not imported.
            shutil.copy(HEADER, os.path.join(tmp, "header.tsx"))
            # 1.36.0: and the panel partials (the row layout markup).
            shutil.copy(HEADER_MENU_PARTIALS, os.path.join(tmp, "header-menu.tsx"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "header-brand.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 12)

    def test_header_menu_declares_the_mega_panel_fields(self):
        # base_sdk 1.18.0: the groups open as ONE panel under the first
        # group's label; an item may carry a blurb and a named icon, and the
        # header resolves the icon from a closed set.
        src = read(os.path.join(LANDING, "header-menu.ts"))
        self.assertIn("export type HeaderMenuIcon =", src)
        self.assertIn("description?: string;", src)
        self.assertIn("icon?: HeaderMenuIcon;", src)
        for icon in ("box", "globe", "smartphone", "message-square", "zap", "wrench", "file-text", "chrome"):
            self.assertIn(f'| "{icon}"', src)
        # Both resolvers carry the two fields onto HeaderMenuItem.
        self.assertEqual(src.count("description: link.description,"), 1)
        self.assertEqual(src.count("description: entry.description,"), 1)
        partials = read(os.path.join(SDK_ROOT, "templates", "components", "custom", "header-menu.tsx"))
        self.assertIn("function DesktopMegaMenu(", partials)
        self.assertIn("const MENU_ICONS: Record<HeaderMenuIcon, LucideIcon>", partials)
        self.assertIn("{groups.length > 0 && <DesktopMegaMenu groups={groups} megaLabel={megaLabel} />}", partials)
        self.assertNotIn("function DesktopGroup(", partials)
        for hard_coded in ("yellow-", "zinc-", "gray-", "#0a0a0a"):
            self.assertNotIn(hard_coded, partials, f"header-menu.tsx paints a hard-coded colour: {hard_coded}")

    def test_header_menu_hover_intent(self):
        # base_sdk 1.24.0 (Ray, on supacharge.app: "it is impossible to
        # choose links if mega menu is open, it leaves no moment to move
        # mouse"): the pointer's leave is debounced, and the desktop nav is
        # as tall as the bar so the hover wrapper meets the panel edge to
        # edge - no dead strip between the trigger and the panel.
        partials = read(os.path.join(SDK_ROOT, "templates", "components", "custom", "header-menu.tsx"))
        self.assertIn("const HOVER_CLOSE_DELAY_MS = 200;", partials)
        menu = partials[partials.index("function DesktopMegaMenu("):partials.index("export interface HeaderMenuNavProps")]
        # Leave arms the timer; enter, focus and click disarm it.
        self.assertIn("onMouseLeave={closeSoon}", menu)
        self.assertIn("onMouseEnter={openNow}", menu)
        self.assertIn("onFocus={openNow}", menu)
        self.assertIn("onClick={toggle}", menu)
        self.assertNotIn("onMouseLeave={() => setOpen(false)}", menu)
        self.assertIn("closeTimer.current = setTimeout(", menu)
        self.assertIn("}, HOVER_CLOSE_DELAY_MS);", menu)
        self.assertIn("clearTimeout(closeTimer.current);", menu)
        # A pending close is cleared on unmount.
        self.assertIn("useEffect(() => cancelClose, [cancelClose]);", menu)
        # Escape focuses the trigger BEFORE closing: the trigger's onFocus
        # opens, and the other order re-opened the panel.
        escape = menu[menu.index('if (event.key === "Escape")'):]
        escape = escape[:escape.index("}\n")]
        self.assertLess(escape.index("buttonRef.current?.focus();"), escape.index("close();"))
        # The wrapper still carries the pointer handlers and fills the nav,
        # and the nav fills the bar.
        self.assertIn('className="flex h-full items-center"', menu)
        nav = partials[partials.index("export function HeaderMenuNav("):partials.index("export interface HeaderMenuListProps")]
        self.assertIn('className={cn("h-full items-center gap-5 text-sm", className)}', nav)

    def test_header_brand_badge_and_collapse(self):
        # base_sdk 1.24.0 (Ray, 2026-09-09: "header lost functions the old
        # rokct header had"): the brand declaration may badge the host's
        # mark and collapse the wordmark the way rokct.ai's old header did,
        # an action may be `secondary`, and a shell that declares nothing
        # keeps the still brand's literal markup.
        src = read(HEADER_MENU_REGISTRY)
        brand = src[src.index("export interface HeaderBrand {"):src.index("export interface HeaderBrandCollapse {")]
        self.assertIn("  badge?: boolean;", brand)
        self.assertIn("  collapse?: boolean | HeaderBrandCollapse;", brand)
        collapse = src[src.index("export interface HeaderBrandCollapse {"):src.index("export interface HeaderBrandCode {")]
        self.assertIn("  delayMs?: number;", collapse)
        self.assertIn("  code?: () => HeaderBrandCode | string | null | undefined;", collapse)
        self.assertIn("export const DEFAULT_BRAND_COLLAPSE_DELAY_MS = 1500;", src)
        self.assertIn("export function resolveHeaderBrandCollapse(", src)
        resolved = src[src.index("export interface ResolvedHeaderBrand {"):src.index("export interface ResolvedHeaderBrandCollapse {")]
        self.assertIn("  badge: boolean;", resolved)
        self.assertIn("  collapse: ResolvedHeaderBrandCollapse | null;", resolved)
        # Every branch of the resolver carries both fields.
        self.assertEqual(src.count("wordmark, badge, collapse }"), 4)
        action = src[src.index("export interface HeaderMenuAction {"):]
        action = action[:action.index("}")]
        self.assertIn('variant?: "primary" | "ghost" | "secondary";', action)
        header = read(HEADER)
        # The still brand is untouched: the 1.21.0 literals stay, and the
        # collapse machinery is reached only through a declaration.
        self.assertIn("<BrandLogo width={32} height={32} />", header)
        self.assertIn('<Branding className="text-xl" />', header)
        self.assertIn("function CollapsingBrand(", header)
        self.assertIn("function useBrandCollapse(", header)
        self.assertIn("if (brand.collapse) return <CollapsingBrand brand={brand} collapsed={collapsed} />;", header)
        self.assertIn("showBadge={brand.badge}", header)
        self.assertIn('<Branding className="text-[60px] tracking-tighter leading-none" />', header)
        self.assertIn("navVisible: !collapse || !collapsed || hovered || scrolled,", header)
        self.assertIn("setTimeout(() => setCollapsed(true), collapse.delayMs)", header)
        self.assertIn("window.scrollY > 10", header)
        self.assertIn("<HeaderBrand collapsed={collapsed} />", header)
        # The chevron and the fading nav wrapper exist only for a collapsing brand.
        self.assertIn("{collapse ? (", header)
        self.assertIn("<ChevronRight", header)
        self.assertRegex(header, r"import \{[^}]*\bChevronRight\b[^}]*\} from \"lucide-react\";")
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", header))
        for hard_coded in ("yellow-", "zinc-", "gray-", "#0a0a0a", "#4f46e5"):
            self.assertNotIn(hard_coded, code, f"header.tsx paints a hard-coded colour: {hard_coded}")
        partials = read(os.path.join(SDK_ROOT, "templates", "components", "custom", "header-menu.tsx"))
        actions = partials[partials.index("export function HeaderMenuActions("):partials.index("export interface HeaderMenuRowProps")]
        self.assertIn('const variant = action.variant ?? "primary";', actions)
        self.assertIn('"bg-secondary text-secondary-foreground hover:bg-secondary/80"', actions)

    def test_header_folds_to_a_letter_tile_for_an_icon_less_shell(self):
        """base_sdk 1.28.0 (Ray, 2026-09-10, on supacharge.app: "since
        supacharge has not icon cant it fold and only leave the first
        letter as its icon?"): a collapsing brand with `logo: "none"`
        folds into a CSS letter tile - the platform name's first letter in
        the primary token on the tab tile's ground - and nothing else
        moves: the still brand's literals, the declared-image and host-mark
        branches and the 1.24.0 collapse machinery are as they were."""
        src = read(HEADER_MENU_REGISTRY)
        self.assertIn("export function brandLetterOf(name: string | null | undefined): string {", src)
        self.assertIn("export function brandFoldsToLetter(brand: ResolvedHeaderBrand): boolean {", src)
        self.assertIn('return brand.collapse !== null && brand.logo === "none";', src)
        header = read(HEADER)
        self.assertRegex(
            header,
            r"import \{[^}]*\bbrandFoldsToLetter\b[^}]*\bbrandLetterOf\b[^}]*\} from \"@/components/custom/landing/header-menu\";",
        )
        self.assertIn("function BrandLetterTile(", header)
        tile = header[header.index("function BrandLetterTile("):header.index("function BrandBlock(")]
        # The letter is text in the primary token; the tile is never an image.
        self.assertIn("const letter = brandLetterOf(name);", tile)
        self.assertIn("if (!letter) return null;", tile)
        self.assertIn("{letter}", tile)
        self.assertIn("text-primary", tile)
        self.assertIn('role="img"', tile)
        self.assertIn("aria-label={name}", tile)
        self.assertNotIn("<img", tile)
        self.assertNotIn("BrandLogo", tile)
        self.assertNotIn("fetch(", tile)
        # 44px like a mark, the tab tile's corners and ground.
        self.assertIn("h-11 w-11", tile)
        self.assertIn("rounded-[22%]", tile)
        self.assertIn("backgroundColor: BRAND_TILE_GROUND", tile)
        self.assertIn('const BRAND_TILE_GROUND = "#0b0b0b";', header)
        route = read(os.path.join(SDK_ROOT, "templates", "app", "brand-icon", "route.tsx"))
        self.assertIn('const GROUND = "#0b0b0b";', route)
        self.assertIn("const BRAND_TILE_FONT_PX = Math.round(BRAND_TILE_SIZE * 0.84);", header)
        self.assertIn("const FONT_RATIO = 0.84;", route)
        # Opens with the collapse, like the code's slot: hidden until then.
        self.assertIn("aria-hidden={!collapsed}", tile)
        self.assertIn('maxWidth: collapsed ? `${BRAND_TILE_SIZE}px` : "0px"', tile)
        # Reached only inside the collapsing brand, only through the pure rule,
        # from the same name the wordmark shows.
        collapsing = header[header.index("function CollapsingBrand("):header.index("const UNDECLARED_BRAND")]
        # 1.29.0: the stem rule is asked first; the tile is the branch after it.
        self.assertIn(") : brandFoldsToLetter(brand) ? (", collapsing)
        self.assertIn("<BrandLetterTile name={PLATFORM_NAME} collapsed={collapsed} />", collapsing)
        self.assertIn("<BrandMark brand={brand} size={44} />", collapsing)
        self.assertEqual(header.count("<BrandLetterTile "), 1)
        # The still brand is untouched, literal for literal.
        still = header[header.index("function BrandBlock("):header.index("function toBrandCode(")]
        self.assertIn("if (brand.collapse) return <CollapsingBrand brand={brand} collapsed={collapsed} />;", still)
        self.assertIn("<BrandMark brand={brand} size={32} />", still)
        self.assertIn('{brand.wordmark && <Branding className="text-xl" />}', still)
        self.assertNotIn("BrandLetterTile", still)
        mark = header[header.index("function BrandMark("):header.index("const BRAND_TILE_GROUND")]
        self.assertIn('if (brand.logo === "none") return null;', mark)
        self.assertIn("<BrandLogo width={32} height={32} />", mark)
        self.assertNotIn("BrandLetterTile", mark)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", header))
        self.assertNotIn("/brand-icon", code)

    def test_header_folds_a_dotted_name_to_its_stem(self):
        """base_sdk 1.29.0 (Ray, 2026-09-10: "if sitename has a dot, fold
        dot and what comes after so they s will never show anymore unless
        there is icon, if there is icon it fold further to leave only
        icon"): an icon-less collapsing brand whose platform name has a
        dot keeps the text before the dot as its wordmark and never draws
        the letter tile; a brand with an image still folds to the image;
        an undotted icon-less name still folds to the 1.28.0 tile. No
        brand string is named in base."""
        src = read(HEADER_MENU_REGISTRY)
        self.assertIn("export function brandStemOf(name: string | null | undefined): string | null {", src)
        self.assertIn("export function brandFoldsToStem(", src)
        self.assertIn('return brandFoldsToLetter(brand) && brand.wordmark && brandStemOf(name) !== null;', src)
        stem_of = src[src.index("export function brandStemOf("):src.index("export function brandFoldsToStem(")]
        self.assertIn('const dot = trimmed.indexOf(".");', stem_of)
        self.assertIn("if (dot <= 0) return null;", stem_of)
        header = read(HEADER)
        self.assertRegex(
            header,
            r"import \{[^}]*\bbrandFoldsToStem\b[^}]*\bbrandStemOf\b[^}]*\} from \"@/components/custom/landing/header-menu\";",
        )
        self.assertIn("function BrandStemWordmark(", header)
        wordmark = header[header.index("function BrandStemWordmark("):header.index("function BrandBlock(")]
        # Text only: the stem stays, the dot and the rest close with the collapse.
        self.assertIn("const suffix = name.trim().slice(stem.length);", wordmark)
        # 1.39.0: the span shows the capitalised label of that same stem.
        self.assertIn("<span>{label}</span>", wordmark)
        # 1.41.0: the suffix span is in the primary colour, with its own hook.
        self.assertIn('<span data-brand-wordmark="tld" className="min-w-0 overflow-hidden pr-[0.12em] -mr-[0.12em] text-primary">', wordmark)
        self.assertNotIn('<span className="min-w-0 overflow-hidden">{suffix}</span>', wordmark)
        self.assertIn("aria-hidden={collapsed}", wordmark)
        # The suffix SLIDES into the stem (Ray: "not as a back type but like
        # sliding into what gets left"): its slot's width closes over hidden
        # overflow from the suffix's own width, with the wordmark slot's own
        # duration and easing, while the stem span before it never moves.
        self.assertIn('gridTemplateColumns: collapsed ? "0fr" : "1fr"', wordmark)
        self.assertIn('className="grid transition-all duration-500 ease-in-out"', wordmark)
        self.assertNotIn("maxWidth", wordmark)
        self.assertNotIn("setTimeout", wordmark)
        self.assertNotIn("useEffect", wordmark)
        self.assertNotIn("useState", wordmark)
        # The large wordmark's classes (the 1.24.0 Branding slot's) but its
        # size, bold like the host wordmarks: the size is responsive
        # (BRAND_STEM_FONT_SIZE with --brand-chars, the FULL name's length),
        # set once on the span both the stem and the suffix inherit from, so
        # a long dotted name never widens the bar and the stem does not jump.
        self.assertIn(
            'className="flex shrink-0 items-center whitespace-nowrap pt-0.5 font-bold tracking-tighter leading-none text-foreground"',
            wordmark,
        )
        self.assertNotIn("text-[60px]", wordmark)
        self.assertNotIn("text-[", wordmark)
        self.assertIn(
            'const size = { "--brand-chars": name.trim().length, fontSize: BRAND_STEM_FONT_SIZE } as React.CSSProperties;',
            wordmark,
        )
        self.assertIn("style={size}", wordmark)
        self.assertEqual(wordmark.count("fontSize"), 1)
        self.assertRegex(
            header,
            r"import \{[^}]*\bBRAND_STEM_FONT_SIZE\b[^}]*\} from \"@/components/custom/landing/header-menu\";",
        )
        self.assertIn(
            'export const BRAND_STEM_FONT_SIZE = "min(60px, calc((20vw + 140px) / (var(--brand-chars) * 0.6)))";',
            src,
        )
        self.assertNotIn("<img", wordmark)
        self.assertNotIn("BrandLogo", wordmark)
        self.assertNotIn("BrandLetterTile", wordmark)
        self.assertNotIn("brandLetterOf", wordmark)
        # Asked before the tile, from the same name the wordmark shows, and
        # the large wordmark slot yields to it.
        collapsing = header[header.index("function CollapsingBrand("):header.index("const UNDECLARED_BRAND")]
        self.assertIn(
            "const stem = brandFoldsToStem(brand, PLATFORM_NAME) ? brandStemOf(PLATFORM_NAME) : null;",
            collapsing,
        )
        self.assertIn("{stem !== null ? (", collapsing)
        self.assertIn("<BrandStemWordmark name={PLATFORM_NAME} stem={stem} collapsed={collapsed} />", collapsing)
        self.assertLess(collapsing.index("<BrandStemWordmark "), collapsing.index("<BrandLetterTile "))
        self.assertIn("{brand.wordmark && stem === null && (", collapsing)
        self.assertIn('<Branding className="text-[60px] tracking-tighter leading-none" />', collapsing)
        self.assertIn('className="flex items-center overflow-hidden transition-all duration-500 ease-in-out"', collapsing)
        self.assertEqual(header.count("<BrandStemWordmark "), 1)
        # The still brand and the 1.28.0 tile are untouched.
        still = header[header.index("function BrandBlock("):header.index("function toBrandCode(")]
        self.assertIn('{brand.wordmark && <Branding className="text-xl" />}', still)
        self.assertNotIn("BrandStemWordmark", still)
        tile = header[header.index("function BrandLetterTile("):header.rindex("/**", 0, header.index("function BrandStemWordmark("))]
        self.assertIn("const letter = brandLetterOf(name);", tile)
        self.assertNotIn("BrandStemWordmark", tile)
        self.assertNotIn("brandStemOf", tile)
        # No brand is named in code: the stem is whatever name the shell shows.
        for text in (header, src):
            code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", text)).lower()
            self.assertNotIn("supacharge", code)
            self.assertNotIn("rokct.ai", code)

    def test_header_code_follows_the_stem_wordmark(self):
        """base_sdk 1.31.0 (Ray, 2026-09-10: "look at rokct header's
        country code and then check supacharge's"): beside a mark the code
        is 36px against a 44px mark on every viewport, always the smaller;
        beside a stem wordmark, which BRAND_STEM_FONT_SIZE shrinks to fit
        the bar, a 36px code outgrew the wordmark on a phone. The code
        beside a stem is sized with the stem - its 36px, or the stem's
        size where that is smaller - and laid out as the stem is, so it
        sits on the stem's baseline. The code beside a mark or a tile is
        the 1.24.0 code, literal for literal."""
        src = read(HEADER_MENU_REGISTRY)
        # 1.36.0: the cap is the original header's superscript size, not 36px.
        self.assertIn(
            "export const BRAND_STEM_CODE_FONT_SIZE = `min(${BRAND_CODE_FONT_SIZE}, ${BRAND_STEM_FONT_SIZE})`;",
            src,
        )
        self.assertLess(src.index("export const BRAND_STEM_FONT_SIZE ="), src.index("export const BRAND_STEM_CODE_FONT_SIZE ="))
        header = read(HEADER)
        self.assertRegex(
            header,
            r"import \{[^}]*\bBRAND_STEM_CODE_FONT_SIZE\b[^}]*\bBRAND_STEM_FONT_SIZE\b[^}]*\} from \"@/components/custom/landing/header-menu\";",
        )
        collapsing = header[header.index("function CollapsingBrand("):header.index("const UNDECLARED_BRAND")]
        # Chosen by the stem rule, after it is asked.
        self.assertLess(
            collapsing.index("const stem = brandFoldsToStem(brand, PLATFORM_NAME)"),
            collapsing.index("const codeClassName ="),
        )
        self.assertIn(
            '? "ml-1 inline-block self-center pt-0.5 font-medium leading-none text-foreground transition-all duration-500 ease-in-out"',
            collapsing,
        )
        self.assertIn(
            '? ({ "--brand-chars": PLATFORM_NAME.trim().length, fontSize: BRAND_STEM_CODE_FONT_SIZE } as React.CSSProperties)',
            collapsing,
        )
        # Beside a mark or a tile: the 1.24.0 class and inline style.
        self.assertIn(
            ': "ml-1 inline-block self-start text-[36px] font-medium text-foreground transition-all duration-500 ease-in-out"',
            collapsing,
        )
        self.assertIn(': { marginTop: "-2px" };', collapsing)
        self.assertIn("className={codeClassName}", collapsing)
        # The declaration's own style (rokct.ai's branding cache) still wins.
        self.assertIn("style={{ ...codeStyle, ...(code.style as React.CSSProperties | undefined) }}", collapsing)
        self.assertEqual(collapsing.count("text-[36px]"), 1)
        self.assertEqual(collapsing.count('marginTop: "-2px"'), 1)
        # The code slot around it is unchanged.
        self.assertIn('style={{ maxWidth: showCode ? "120px" : "0px", opacity: showCode ? 1 : 0 }}', collapsing)
        # Only the code reads the new size (the import and the one use): not
        # the stem, not the tile, not the still brand.
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", header))
        self.assertEqual(code.count("BRAND_STEM_CODE_FONT_SIZE"), 2)
        wordmark = header[header.index("function BrandStemWordmark("):header.index("function BrandBlock(")]
        self.assertNotIn("BRAND_STEM_CODE_FONT_SIZE", wordmark)
        self.assertEqual(wordmark.count("fontSize"), 1)

    def test_header_code_beside_a_mark_is_untouched_and_the_stem_cap_is_the_original(self):
        """base_sdk 1.36.0 (Ray, 2026-09-10: "za in supa is big, look at one
        in rokct, original one"; and "if i merge that one it will change
        country code in rokct to wrong one"): the stem branch's cap is the
        original header's superscript size - 0.28 of the 44px mark - and
        the mark branch is byte-for-byte the 1.24.0 code, so rokct.ai
        renders exactly what it did."""
        src = read(HEADER_MENU_REGISTRY)
        self.assertIn("export const BRAND_MARK_SIZE_PX = 44;", src)
        self.assertIn("export const BRAND_CODE_SCALE = 0.28;", src)
        self.assertIn("export const BRAND_CODE_FONT_SIZE = `calc(${BRAND_MARK_SIZE_PX}px * ${BRAND_CODE_SCALE})`;", src)
        self.assertNotIn("min(36px", src)
        header = read(HEADER)
        collapsing = header[header.index("function CollapsingBrand("):header.index("const UNDECLARED_BRAND")]
        self.assertIn(
            ': "ml-1 inline-block self-start text-[36px] font-medium text-foreground transition-all duration-500 ease-in-out"',
            collapsing,
        )
        self.assertIn(': { marginTop: "-2px" };', collapsing)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", header))
        self.assertNotIn("BRAND_CODE_FONT_SIZE", code.replace("BRAND_STEM_CODE_FONT_SIZE", ""))
        self.assertNotIn("BRAND_CODE_SCALE", code)

    def test_header_menu_group_row_layout_and_trigger_word(self):
        """base_sdk 1.36.0 (Ray, 2026-09-10: "header app links first. if
        possible put mobile apps in one row since supa dont have much
        menu"): a group may be laid out as a row, and the menu may name the
        trigger's word so any group can lead."""
        src = read(HEADER_MENU_REGISTRY)
        self.assertIn('export type HeaderMenuGroupLayout = "column" | "row";', src)
        group = src[src.index("export interface HeaderMenuGroup {"):src.index("export type HeaderMenuGroupLayout")]
        self.assertIn("  layout?: HeaderMenuGroupLayout;", group)
        menu = src[src.index("export interface HeaderMenu {"):src.index("export type HeaderMenuGroupItem")]
        self.assertIn("  megaLabel?: string;", menu)
        resolved = src[src.index("export interface HeaderMenuResolvedGroup {"):src.index("const EMPTY_HEADER_MENU")]
        self.assertIn("  layout: HeaderMenuGroupLayout;", resolved)
        self.assertIn("  megaLabel: string | null;", resolved)
        self.assertIn("export function resolveHeaderMenuGroupLayout(", src)
        self.assertIn("export function megaTriggerLabel(", src)
        self.assertIn("layout: resolveHeaderMenuGroupLayout(group.layout),", src)
        self.assertIn("const megaLabel = menu.megaLabel?.trim() || null;", src)
        partials = read(HEADER_MENU_PARTIALS)
        self.assertIn('const LEAD_ROW_WIDTH = "w-[58%] shrink-0";', partials)
        self.assertIn('? "flex flex-col gap-3 md:flex-row md:items-stretch"', partials)
        self.assertIn("const label = megaTriggerLabel({ groups, megaLabel });", partials)
        header = read(HEADER)
        self.assertIn("  megaLabel?: string | null;", header)
        self.assertIn("megaLabel={megaLabel}", header)
        content = read(LANDING_CONTENT)
        self.assertIn("megaLabel={menu.megaLabel}", content)
        for hard_coded in ("yellow-", "zinc-", "gray-", "#0a0a0a", "\"Explore\"", "\"Get the app\""):
            self.assertNotIn(hard_coded, partials, hard_coded)

    def test_header_menu_action_carries_an_icon(self):
        # base_sdk 1.20.0 (Ray, 2026-09-09: rokct "lost its chrome icon"):
        # an action may name a glyph from the same closed set as an item,
        # drawn before the label in both layouts; "chrome" is lucide's own
        # mark. An action without one renders the label alone, as before.
        src = read(os.path.join(LANDING, "header-menu.ts"))
        action = src[src.index("export interface HeaderMenuAction {"):]
        action = action[:action.index("}")]
        # 1.25.0: the action's slot also takes an image (see the next test).
        self.assertIn("icon?: HeaderMenuIcon | HeaderMenuImage;", action)
        # A link and the resolved item name a glyph; the action a glyph or an image.
        self.assertEqual(src.count("icon?: HeaderMenuIcon;"), 2)
        self.assertIn('| "chrome";', src)
        partials = read(os.path.join(SDK_ROOT, "templates", "components", "custom", "header-menu.tsx"))
        self.assertIn("  chrome: Chrome,", partials)
        self.assertRegex(partials, r"import \{[^}]*\bChrome\b[^}]*\} from \"lucide-react\";")
        actions = partials[partials.index("export function HeaderMenuActions("):partials.index("export interface HeaderMenuRowProps")]
        # With an icon it is drawn before the label; without one the guard
        # leaves the label alone - one content node used by both the
        # external <a> and the internal <Link>.
        self.assertIn("const icon = actionIcon(action.icon);", actions)
        self.assertIn('const Icon = icon && "glyph" in icon ? icon.glyph : null;', actions)
        self.assertIn('{Icon && <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />}', actions)
        self.assertLess(actions.index("{Icon && <Icon"), actions.index("<span>{action.label}</span>"))
        self.assertEqual(actions.count("{content}"), 2)
        self.assertNotIn("{action.label}\n", actions)
        # No CDN or third-party asset for the mark.
        self.assertNotIn("http", actions)

    def test_header_menu_action_carries_an_image_icon(self):
        # base_sdk 1.25.0 (Ray, 2026-09-09, on the Chrome Web Store mark
        # rokct.ai's old header hot-linked from a third party's CDN: "use it
        # but bring it local"): an action's icon may be an image the shell
        # serves itself, `{ src, alt }` - the shape a hero badge's icon
        # takes - drawn as a plain <img> in the glyph's 20px slot, before
        # the label. A named glyph draws as it did; an action without an
        # icon, or with an empty src, renders the label alone.
        src = read(os.path.join(LANDING, "header-menu.ts"))
        image = src[src.index("export interface HeaderMenuImage {"):]
        image = image[:image.index("}")]
        self.assertIn("src: string;", image)
        self.assertIn("alt: string;", image)
        # The same shape the hero's badge takes.
        config = read(os.path.join(LANDING, "hero-config.ts"))
        self.assertIn('icon?: { src: string; alt: string } | "app-store" | "chrome";', config)
        # Only the action takes an image; items keep the closed glyph set.
        link = src[src.index("export interface HeaderMenuLink {"):]
        link = link[:link.index("}")]
        self.assertIn("icon?: HeaderMenuIcon;", link)
        self.assertNotIn("HeaderMenuImage", link)
        partials = read(os.path.join(SDK_ROOT, "templates", "components", "custom", "header-menu.tsx"))
        self.assertRegex(partials, r'import type \{[^}]*\bHeaderMenuImage\b[^}]*\} from "@/components/custom/landing/header-menu";')
        resolver = partials[partials.index("function actionIcon("):partials.index("const HOVER_CLOSE_DELAY_MS")]
        self.assertIn('if (typeof icon === "string") return { glyph: MENU_ICONS[icon] };', resolver)
        self.assertIn("return icon.src.trim() ? { image: icon } : null;", resolver)
        actions = partials[partials.index("export function HeaderMenuActions("):partials.index("export interface HeaderMenuRowProps")]
        self.assertIn('const image = icon && "image" in icon ? icon.image : null;', actions)
        self.assertIn("{image && (", actions)
        img = actions[actions.index("<img\n"):actions.index("/>", actions.index("<img\n"))]
        self.assertIn("src={image.src}", img)
        self.assertIn("alt={image.alt}", img)
        self.assertIn("width={20}", img)
        self.assertIn("height={20}", img)
        # 1.26.0: the slot's classes plus the dark-mode rule for a monochrome mark.
        self.assertIn('className={cn("h-5 w-5 shrink-0 object-contain", markImageClass(image.src))}', img)
        # Before the label, after the glyph slot, and never both at once.
        self.assertLess(actions.index("{Icon && <Icon"), actions.index("{image && ("))
        self.assertLess(actions.index("{image && ("), actions.index("<span>{action.label}</span>"))
        # A plain <img>, as the header draws a declared brand image; no
        # next/image, no CDN. 1.26.0: no filter of its own either - the only
        # dark-mode handling is brand-marks.ts' markImageClass on the src.
        self.assertNotIn("next/image", partials)
        self.assertNotIn("invert", partials.replace("dark:invert", ""))
        self.assertNotIn("http", actions)

    def test_site_metadata_declares_the_icon(self):
        # base_sdk 1.17.0: a home SDK may register a real icon and the
        # letter's colour; with none, and no host icon file, the shell
        # links the generated tile.
        src = read(os.path.join(LANDING, "site-metadata.ts"))
        self.assertIn("icon?: string;", src)
        self.assertIn("themeColor?: string;", src)

    def test_display_host_prefers_the_request_host(self):
        # base_sdk 1.19.0: the favicon letter and the card's host line
        # follow the REQUEST host first (a white-label / custom domain
        # gets its own), falling back to the configured site url only for
        # a non-public host - local, loopback, a preview deployment.
        lib = read(os.path.join(SDK_ROOT, "templates", "app", "lib", "site-metadata.ts"))
        self.assertIn("export function resolveDisplayHost(", lib)
        # base_sdk 1.20.0: the predicate itself (normaliseHost, isPublicHost,
        # requestHost and the two lists) lives in the kernel, pure and
        # edge-safe, so middleware shares it; the lib re-exports it so the
        # 1.19.0 surface is unchanged.
        kernel = read(KERNEL_TENANT_HOSTS)
        self.assertIn("headers.get('x-forwarded-host')", kernel)
        self.assertIn("headers.get('host')", kernel)
        self.assertIn('from "@/app/services/base/tenant-hosts";', lib)
        for name in ("NON_PUBLIC_HOSTS", "NON_PUBLIC_HOST_SUFFIXES", "isPublicHost",
                     "normaliseHost", "requestHost", "type HeaderReader"):
            self.assertIn(f"  {name},", lib, f"site-metadata.ts no longer re-exports {name}")
        self.assertNotIn("export function isPublicHost(", lib)
        self.assertNotIn("export function normaliseHost(", lib)
        # The request host is checked first; the configured site only after.
        self.assertLess(lib.index("if (isPublicHost(fromRequest)) return fromRequest;"),
                        lib.index("return siteHost(copy) ||"))
        for non_public in ("localhost", "127.0.0.1", "[::1]", "0.0.0.0"):
            self.assertIn(f"'{non_public}'", kernel, f"{non_public} is not excluded")
        for suffix in (".vercel.app", ".local", ".internal"):
            self.assertIn(f"'{suffix}'", kernel, f"{suffix} is not excluded")
        # Both consumers go through the one helper, so the tile's letter and
        # the card's host line never disagree.
        route = read(os.path.join(SDK_ROOT, BRAND_ICON_INSTALL[0]))
        self.assertIn("resolveDisplayHost(copy, request.headers)", route)
        self.assertNotIn("resolveSiteUrl", route)
        card = read(os.path.join(SDK_ROOT, "templates", "app", "opengraph-image.tsx"))
        self.assertIn("resolveDisplayHost(copy, h)", card)
        self.assertNotIn("function displayHost(", card)

    def test_metadata_shell_falls_back_to_the_brand_icon(self):
        lib = read(os.path.join(SDK_ROOT, "templates", "app", "lib", "site-metadata.ts"))
        self.assertIn('export const GENERATED_BRAND_ICON = "/brand-icon";', lib)
        self.assertIn("copy.icon", lib)
        self.assertIn("existsSync", lib)
        self.assertIn('typeof window !== "undefined"', lib)
        for host_file in ("app/favicon.ico", "app/icon.png", "app/icon.svg",
                          "app/icon.ico", "app/apple-icon.png", "public/favicon.ico"):
            self.assertIn(f'"{host_file}"', lib, f"{host_file} is not a checked host icon")

    def test_site_metadata_exports_its_contract(self):
        src = read(os.path.join(LANDING, "site-metadata.ts"))
        for needle in (
            "export interface SiteMetadataCopy",
            "export interface SiteMetadataEntry",
            "export const SITE_METADATA: SiteMetadataEntry[]",
            "export async function loadSiteMetadata(): Promise<SiteMetadataCopy>",
            'import { PLATFORM_NAME } from "@/app/config/platform"',
        ):
            self.assertIn(needle, src)

    # -- 1.23.0: no third-party default ---------------------------------------

    # Hosts a base default may name: the licence, the social origins the
    # admin settings page links, and the hosts the documentation comments
    # use as examples of a tenant or a site. Since 1.40.0 the network's own
    # sites are NOT among them: base carries no site of the network (the
    # list moved to the home SDK that owns it), so no product origin is
    # allowed in a base default either.
    FIRST_PARTY_HOSTS = {
        "www.gnu.org",
        "twitter.com", "linkedin.com", "instagram.com", "facebook.com",
        "tenant-a.rokct.ai", "example.app", "tenant.localhost",
    }

    def test_no_base_default_references_a_third_party_cdn(self):
        """Ray, 2026-09-09: "everything served from another company cdn
        tells you is placeholder". No template or kernel default may name a
        host outside the allowlist above - in particular no cdn.* host."""
        url_re = re.compile(r"https?://([A-Za-z0-9.-]+)")
        offenders = []
        for root in (os.path.join(SDK_ROOT, "templates"), os.path.join(SDK_ROOT, "src")):
            for dirpath, _, files in os.walk(root):
                for fname in files:
                    if not fname.endswith((".ts", ".tsx", ".css", ".mts", ".json")):
                        continue
                    path = os.path.join(dirpath, fname)
                    for host in url_re.findall(read(path)):
                        if host.lower() not in self.FIRST_PARTY_HOSTS:
                            offenders.append(f"{os.path.relpath(path, SDK_ROOT)}: {host}")
        self.assertEqual(offenders, [], "third-party hosts in base defaults:\n" + "\n".join(offenders))
        for host in ("cdn.getmerlin.in", "getmerlin"):
            self.assertNotIn(host, " ".join(offenders))

    def test_hero_defaults_carry_no_placeholder(self):
        config = read(os.path.join(LANDING, "hero-config.ts"))
        self.assertIn('backgroundImage: "",', config)
        self.assertIn("trustLine: [],", config)
        # The comments may recount what left; the code may not carry it.
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", config))
        self.assertNotIn("20M+", code)
        self.assertNotIn("cdn.", code)
        self.assertIn('icon: "chrome",', config)
        self.assertIn('icon?: { src: string; alt: string } | "app-store" | "chrome";', config)
        # The Google Play badge names no icon at all.
        start = config.index("const GOOGLE_PLAY_BADGE")
        end = config.index("};", start)
        self.assertNotIn("icon:", config[start:end])
        # The hero draws only a badge with an icon, and knows the chrome glyph
        # (1.32.0: the drawing is the client view's, hero-view.tsx).
        hero = read(HERO_VIEW)
        self.assertIn("export function hasBadgeIcon(", hero)
        self.assertIn("hero.badges.filter(hasBadgeIcon)", hero)
        self.assertIn("{badges.length > 0 && (", hero)
        self.assertIn("{badges.map((badge) => (", hero)
        self.assertNotIn("{hero.badges.map(", hero)
        self.assertIn('import { Chrome } from "lucide-react";', hero)
        self.assertIn('if (icon === "chrome") {', hero)

    # -- 1.23.0: the network strip ------------------------------------------

    def test_network_strip_is_installed(self):
        targets = {i["to"] for i in load_manifest()["installs"]}
        for path in (
            "components/custom/landing/network-sites.ts",
            "components/custom/landing/network-strip.ts",
            "components/custom/network-strip.tsx",
        ):
            self.assertIn(path, targets, f"{path} is not installed")

    def test_network_strip_registry_contract(self):
        src = read(NETWORK_STRIP_REGISTRY)
        self.assertIn("// @rokct-sdk-network-strip-start", src)
        self.assertIn("// @rokct-sdk-network-strip-end", src)
        for needle in (
            "export interface NetworkStripConfig",
            "export type NetworkStripLandingPlacement = \"afterHero\" | \"beforeFooter\" | \"section\" | \"none\";",
            'export const LANDING_ROUTE = "/landing";',
            "export function isLandingRoute(pathname: string | null | undefined): boolean",
            "export const NETWORK_STRIP: NetworkStripEntry[]",
            "export function resolveNetworkStrip(",
            "export function networkStripRendersAt(",
            "export async function loadNetworkStrip(): Promise<NetworkStripConfig | null>",
            'export const DEFAULT_NETWORK_STRIP_HEADING = "Trusted by";',
        ):
            self.assertIn(needle, src)
        # Footer on and landing off with nothing registered.
        self.assertRegex(src, re.compile(r'landing:\s*"none",\s*footer:\s*true', re.S))

    def test_network_sites_list_is_empty(self):
        """1.40.0 (Ray, 2026-09-11: a shell with no declaration shows no
        strip): base carries no site of the network. Site names are brand
        strings and logos are hostnames, so the list moved to the home SDK
        that owns it (`sites` on its registered NetworkStripConfig) or to the
        shell's own data/network.json; NETWORK_SITES stays as the empty
        default the rules fall back to."""
        src = read(NETWORK_SITES)
        self.assertIn("export const NETWORK_SITES: readonly NetworkSite[] = [];", src)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", src))
        for word in ("rokct.ai", "supacharge", "juvo", "url: null", "shown: false", "https://"):
            self.assertNotIn(word, code, f"network-sites.ts carries {word}")
        self.assertIn("Since 1.40.0 base carries NO sites", src)
        # The shape and the rules are unchanged: the same host normalisation
        # as resolveDisplayHost (the kernel's), self-exclusion, no parameters.
        self.assertIn("export interface NetworkSite {", src)
        self.assertIn('import { normaliseHost } from "@/app/services/base/tenant-hosts";', src)
        self.assertIn("export function resolveNetworkSites(", src)
        self.assertIn("export function networkSiteHost(", src)
        self.assertIn("export function hasTrackingParameters(url: string): boolean", src)
        self.assertIn("if (!site.url || hasTrackingParameters(site.url)) return false;", src)
        self.assertIn("if (self && networkSiteHost(site.url) === self) return false;", src)

    def test_network_sites_come_from_the_home_sdk_or_data(self):
        """1.40.0: NetworkStripConfig.sites is where a home SDK declares
        the network; resolveNetworkStrip takes them over its `sites`
        argument; a shell that registers none may commit data/network.json,
        read through the app/actions/base/network-sites.ts action and laid
        under the config by withOwnNetworkSites - registered sites win, else
        the shell's own data, else none, and with none the strip draws on no
        surface (networkStripRendersAt is unchanged)."""
        registry = read(NETWORK_STRIP_REGISTRY)
        self.assertIn("  sites?: NetworkSite[];", registry)
        self.assertIn("export interface OwnNetworkSites {", registry)
        self.assertIn("export function withOwnNetworkSites(", registry)
        self.assertIn("if (config?.sites !== undefined) return config;", registry)
        self.assertIn("sites: readonly NetworkSite[] = NETWORK_SITES,", registry)
        self.assertIn("sites: resolveNetworkSites(config?.sites ?? sites, {", registry)
        self.assertIn("if (strip.sites.length === 0) return false;", registry)
        # The action: server-side, the bundled data/ file or nothing, never a
        # site of its own.
        action_path = os.path.join(SDK_ROOT, "templates", "app", "actions", "base", "network-sites.ts")
        self.assertTrue(os.path.exists(action_path))
        self.assertIn("app/actions/base/network-sites.ts", {i["to"] for i in load_manifest()["installs"]})
        action = read(action_path)
        self.assertTrue(action.lstrip().startswith("/*"))
        self.assertIn('"use server";', action)
        self.assertIn("export async function getNetworkSites(): Promise<SiteNetwork>", action)
        self.assertIn('import { hasSiteData, readSiteData } from "@/lib/site-data/read-site-data";', action)
        self.assertIn('if (!hasSiteData("network")) return { sites: [] };', action)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", action))
        self.assertNotIn("https://", code)
        for brand in ("rokct.ai", "supacharge", "juvo"):
            self.assertNotIn(brand, action.lower())
        # The component: the registered config with the page, the shell's
        # own data after mount (a server function cannot be called while a
        # client component renders on the server), never both lists.
        component = read(NETWORK_STRIP)
        self.assertIn('import { getNetworkSites } from "@/app/actions/base/network-sites";', component)
        self.assertIn("export async function loadNetworkStripInputs(): Promise<NetworkStripInputs>", component)
        self.assertIn("export async function loadOwnNetworkSites(): Promise<OwnNetworkSites | null>", component)
        self.assertIn("export async function loadResolvedNetworkStrip(): Promise<ResolvedNetworkStrip>", component)
        self.assertIn("const own = config?.sites === undefined ? await loadOwnNetworkSites() : null;", component)
        self.assertIn("return resolveNetworkStrip(withOwnNetworkSites(config, own), selfHost);", component)
        self.assertIn("function useOwnNetworkSites(wanted: boolean): OwnNetworkSites | null {", component)
        self.assertIn("const own = useOwnNetworkSites(config?.sites === undefined);", component)
        self.assertIn("() => resolveNetworkStrip(withOwnNetworkSites(config, own), selfHost),", component)
        # The data kind, its file and its validator.
        kinds = read(os.path.join(SITE_DATA_DIR, "kinds.ts"))
        self.assertIn("export interface SiteNetworkSite {", kinds)
        self.assertIn("export interface SiteNetwork {", kinds)
        self.assertIn('  network: "data/network.json",', kinds)
        validate = read(os.path.join(SITE_DATA_DIR, "validate.mjs"))
        self.assertIn('network: "network.json"', validate)
        self.assertIn("export function validateNetwork(value) {", validate)
        self.assertIn("export function isHttpsOrigin(v) {", validate)
        self.assertIn('return url.protocol === "https:" && url.pathname === "/"', validate)
        self.assertIn("  network: validateNetwork,", validate)
        doc = read(SITE_DATA_DOC)
        self.assertIn("| `network`   | `data/network.json`", doc)
        self.assertIn("`SiteNetwork`", doc)
        self.assertIn("getNetworkSites()", doc)
        self.assertTrue(os.path.exists(os.path.join(SITE_DATA_FIXTURE, "data", "network.json")))
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("## 1.40.0", changelog)
        self.assertIn("`NetworkStripConfig.sites?: NetworkSite[]`", changelog.split("## 1.39.0", 1)[0])
        self.assertNotRegex(changelog, re.compile(r"^#[^#\s]", re.M), "no CHANGELOG line starts with # and text")

    def test_network_strip_component_never_tracks(self):
        src = read(NETWORK_STRIP)
        self.assertIn('"use client";', src)
        self.assertIn('rel="noopener"', src)
        self.assertIn("href={site.url}", src)
        body = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", src))
        for tracker in ("utm_", "?ref", "&ref", "onClick", "sendBeacon", "gtag", "dataLayer", "fbq", "analytics"):
            self.assertNotIn(tracker, body, f"the strip must not carry {tracker}")
        # The shell's own host comes from the configured site, through the
        # list's normalisation, never from app/lib/site-metadata.ts (node:fs).
        self.assertIn("process.env.NEXT_PUBLIC_SITE_URL", src)
        self.assertIn("loadSiteMetadata()", src)
        self.assertNotIn("@/app/lib/site-metadata", src)
        self.assertIn('from "next/dynamic"', src)
        # 1.27.0: the route is read here, once, and handed to the pure rule.
        self.assertIn('import { usePathname } from "next/navigation";', src)
        self.assertIn("const pathname = usePathname();", src)
        self.assertIn("networkStripRendersAt(strip, surface, isLandingRoute(pathname))", src)

    def test_network_strip_renders_once_per_page(self):
        """1.27.0 (Ray, 2026-09-09: rokct.ai showed two "Trusted by" rows -
        the landing placement and the layout footer on the same page). The
        pure rule takes the page: the footer surface yields on the landing
        route while a landing placement is set; a "section" placement is a
        home SDK's own section drawing the strip. Executed by
        test_network_strip_behaviour_under_node; the shape is held here."""
        src = read(NETWORK_STRIP_REGISTRY)
        self.assertIn("  onLandingPage = false,\n): boolean {", src)
        self.assertIn('return !(onLandingPage && strip.placement.landing !== "none");', src)
        self.assertIn('if (surface === "none") return false;', src)
        # The default with nothing registered is unchanged: footer on, landing off.
        self.assertRegex(src, re.compile(r'landing:\s*"none",\s*footer:\s*true', re.S))
        # The footer row and the landing host need no route logic of their own.
        self.assertNotIn("usePathname", read(FOOTER_CHROME))
        self.assertNotIn("usePathname", read(LANDING_CONTENT))
        self.assertIn('{networkStrip && <NetworkStrip surface="footer" />}', read(FOOTER_CHROME))

    def test_network_strip_surfaces_are_wired(self):
        # The footer hook: base has no footer component, the copyright row
        # is what every shell footer ends with, so the strip lands above it.
        footer = read(FOOTER_CHROME)
        self.assertIn('import { NetworkStrip } from "@/components/custom/network-strip";', footer)
        self.assertIn('{networkStrip && <NetworkStrip surface="footer" />}', footer)
        self.assertIn("networkStrip = true,", footer)
        # The two landing surfaces, inside the block hidden during search.
        landing = read(LANDING_CONTENT)
        self.assertIn('<NetworkStrip surface="afterHero" />', landing)
        self.assertIn('<NetworkStrip surface="beforeFooter" />', landing)
        hidden = landing.index('display: searchActive ? "none" : undefined')
        self.assertLess(hidden, landing.index('<NetworkStrip surface="afterHero" />'))
        self.assertLess(landing.index('<NetworkStrip surface="beforeFooter" />'),
                        landing.index("<div id={LANDING_CONFIG.nav.footer.id} />"))

    def test_network_strip_behaviour_under_node(self):
        """The list, the host rule and the placement rule executed: the
        list's shape, self-exclusion by host, never a tracking parameter,
        and a "none" landing placement hiding both landing surfaces."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute network-strip.ts")
        with tempfile.TemporaryDirectory() as tmp:
            for fname in os.listdir(KERNEL):
                if fname.endswith(".ts"):
                    staged = RELATIVE_IMPORT_RE.sub(r"\1\2.ts\3", read(os.path.join(KERNEL, fname)))
                    with open(os.path.join(tmp, fname), "w", encoding="utf-8") as f:
                        f.write(staged)
            sites = read(NETWORK_SITES).replace(
                'from "@/app/services/base/tenant-hosts"', 'from "./tenant-hosts.ts"'
            )
            self.assertNotIn('from "@/', sites, "network-sites.ts imports something the stage does not cover")
            with open(os.path.join(tmp, "network-sites.ts"), "w", encoding="utf-8") as f:
                f.write(sites)
            registry = read(NETWORK_STRIP_REGISTRY).replace(
                'from "@/components/custom/landing/network-sites"', 'from "./network-sites.ts"'
            )
            self.assertNotIn('from "@/', registry, "network-strip.ts imports something the stage does not cover")
            with open(os.path.join(tmp, "network-strip.ts"), "w", encoding="utf-8") as f:
                f.write(registry)
            shutil.copy(NETWORK_STRIP_TESTS, os.path.join(tmp, "network-strip.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "network-strip.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 24)

    # -- 1.26.0: the platform brand marks ------------------------------------

    def test_brand_marks_are_installed(self):
        """Ray, 2026-09-09: "move to base, home sdk can choose to use them or
        not". The five marks are base's, installed as a directory so every
        host serves /brand/marks/<name>.svg; each is the byte-exact file it
        was fetched as, a viewBox'd SVG with no script, no href and no host
        but the SVG namespace, and the two monochrome ones are currentColor."""
        installs = load_manifest()["installs"]
        pairs = {(i["from"], i["to"]) for i in installs}
        self.assertIn(BRAND_MARKS_INSTALL, pairs)
        self.assertIn(BRAND_MARKS_REGISTRY_INSTALL, pairs)
        # ONLY the marks/ subdirectory: never a home SDK's public/brand.
        self.assertNotIn("public/brand", {i["to"] for i in installs})
        self.assertTrue(os.path.isdir(BRAND_MARKS_DIR))
        self.assertEqual(sorted(os.listdir(BRAND_MARKS_DIR)), sorted(BRAND_MARKS))
        for name, (size, mono) in BRAND_MARKS.items():
            path = os.path.join(BRAND_MARKS_DIR, name)
            self.assertEqual(os.path.getsize(path), size, name)
            svg = read(path)
            self.assertTrue(svg.lstrip().startswith("<svg"), name)
            self.assertIn("viewBox=", svg, name)
            self.assertNotIn("<script", svg.lower(), name)
            self.assertNotIn("href", svg.lower(), name)
            self.assertNotIn("<foreignObject", svg, name)
            hosts = set(re.findall(r"https?://([A-Za-z0-9.-]+)", svg))
            self.assertEqual(hosts, {"www.w3.org"}, f"{name}: {hosts}")
            self.assertEqual("currentColor" in svg, mono, name)
        # Google Play is the gilbarbara tracing in Google's four colours.
        play = read(os.path.join(BRAND_MARKS_DIR, "google-play.svg"))
        self.assertEqual(
            set(c.upper() for c in re.findall(r"#[0-9A-Fa-f]{6}", play)),
            {"#EA4335", "#FBBC04", "#4285F4", "#34A853"},
        )
        self.assertIn('fill="#CF0A2C"', read(os.path.join(BRAND_MARKS_DIR, "app-gallery.svg")))

    def test_brand_marks_registry_contract(self):
        """The typed registry a home SDK may use or ignore, and the ONE
        dark-mode rule: `dark:invert` on exactly the image whose src is a
        mono mark's path, applied by hero.tsx (a badge's image icon) and
        header-menu.tsx (an action's image icon) through markImageClass.
        Base's defaults draw none of the marks."""
        src = read(BRAND_MARKS_REGISTRY)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", src))
        self.assertNotIn("import ", code, "brand-marks.ts must stay import-free (staged verbatim)")
        for name in (
            "export interface BrandMark {",
            "export type BrandMarkId =",
            "export const BRAND_MARKS: Readonly<Record<BrandMarkId, BrandMark>> = {",
            'export const BRAND_MARKS_DIR = "/brand/marks/";',
            "export const MONO_MARK_SRCS: readonly string[]",
            'export const MONO_MARK_CLASS = "dark:invert";',
            "export function markPath(src: string): string {",
            "export function isMonoMark(src: string | null | undefined): boolean {",
            "export function markImageClass(src: string | null | undefined): string | undefined {",
        ):
            self.assertIn(name, src, name)
        shape = src[src.index("export interface BrandMark {"):]
        shape = shape[:shape.index("\n}")]
        for field in ("readonly src: string;", "readonly alt: string;", "readonly mono: boolean;"):
            self.assertIn(field, shape)
        for mark_id, name, alt, mono in (
            ("chromeWebStore", "chrome-web-store", "Chrome Web Store", "false"),
            ("googlePlay", "google-play", "Google Play", "false"),
            ("appGallery", "app-gallery", "AppGallery", "false"),
            ("appStore", "app-store", "App Store", "true"),
            ("windows", "windows", "Windows", "true"),
        ):
            entry = src[src.index(f"  {mark_id}: {{"):]
            entry = entry[:entry.index("},")]
            self.assertIn(f"src: `${{BRAND_MARKS_DIR}}{name}.svg`,", entry, mark_id)
            self.assertIn(f'alt: "{alt}",', entry, mark_id)
            self.assertIn(f"mono: {mono},", entry, mark_id)
            self.assertTrue(os.path.exists(os.path.join(BRAND_MARKS_DIR, name + ".svg")), name)
        # The rule is derived from the flags, not a second list.
        self.assertIn(".filter((mark) => mark.mono)", src)
        # Both consumers draw through it; neither carries a filter of its own
        # (1.32.0: the hero's drawing is the client view's, hero-view.tsx).
        hero = read(HERO_VIEW)
        self.assertIn('import { markImageClass } from "@/components/custom/landing/brand-marks";', hero)
        badge = hero[hero.index("function BadgeIcon("):hero.index("export function HeroView(")]
        self.assertIn("className={markImageClass(icon.src)}", badge)
        self.assertNotIn("invert", hero.replace("dark:invert", ""))
        partials = read(HEADER_MENU_PARTIALS)
        self.assertIn('import { markImageClass } from "@/components/custom/landing/brand-marks";', partials)
        self.assertIn('cn("h-5 w-5 shrink-0 object-contain", markImageClass(image.src))', partials)
        # No template or stylesheet of base's inverts by selector: the class
        # on the element is the whole mechanism (a home SDK adds none either).
        for root in (os.path.join(SDK_ROOT, "templates"),):
            for dirpath, _, files in os.walk(root):
                for fname in files:
                    if fname.endswith(".css"):
                        self.assertNotIn("invert", read(os.path.join(dirpath, fname)), fname)
        # Base's defaults draw none of the marks: the glyphs stay.
        config = read(os.path.join(LANDING, "hero-config.ts"))
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", config))
        self.assertNotIn("/brand/marks/", code)
        self.assertNotIn("brand-marks", code)
        self.assertIn('icon: "chrome",', config)
        self.assertIn('icon: "app-store",', config)
        registry = read(HEADER_MENU_REGISTRY)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", registry))
        self.assertNotIn("/brand/marks/", code)
        self.assertNotIn("brand-marks", code)

    def test_brand_marks_behaviour_under_node(self):
        """The registry and the rule executed: the five entries, the two mono
        srcs, isMonoMark true for exactly those paths (query/hash/space
        tolerated, basename alone and absolute URLs never), markImageClass
        `dark:invert` or undefined."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute brand-marks.ts")
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(BRAND_MARKS_REGISTRY, os.path.join(tmp, "brand-marks.ts"))
            shutil.copy(BRAND_MARKS_TESTS, os.path.join(tmp, "brand-marks.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "brand-marks.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 14)

    # -- 1.32.0: the landing renders server-side ----------------------------

    def test_landing_ssr_files_are_installed(self):
        manifest = load_manifest()
        by_from = {e["from"]: e["to"] for e in manifest["installs"]}
        for src, dst in LANDING_SSR_INSTALLS.items():
            self.assertEqual(by_from.get(src), dst, f"{src} must install to {dst}")
            self.assertTrue(os.path.exists(os.path.join(SDK_ROOT, src)), src)
        self.assertIn("Since 1.32.0", manifest["_comment"]["about"])
        self.assertIn("rootClass", manifest["_comment"]["about"])

    def test_landing_page_loads_nothing_in_an_effect(self):
        """The page does the registry work on the server; the wrapper and the
        view load no section, no menu and no hero copy after mount. Until
        1.31.0 all three were client effects, so the first HTML carried an
        empty hero and no header links."""
        def code(path):
            return LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(path)))

        page = code(LANDING_PAGE)
        self.assertNotIn('"use client"', page)
        self.assertNotIn("useEffect", page)
        self.assertNotIn("useState", page)
        self.assertIn("resolveLandingPage(", page)
        self.assertIn('from "@/components/custom/landing/landing-page"', page)
        self.assertIn("<Hero", page)
        self.assertIn("rootClass={page.rootClass}", page)
        self.assertIn("menu={page.menu}", page)

        wrapper = code(LANDING_CONTENT)
        self.assertIn('"use client"', wrapper)
        self.assertNotIn("useEffect", wrapper)
        for loader in ("PAGE_SECTIONS", "loadHeaderMenu", "loadHeroCopy", "resolveHeaderMenu", "entry.load("):
            self.assertNotIn(loader, wrapper, f"landing-content.tsx must not {loader} on the client")
        self.assertIn("useState(false)", wrapper)
        self.assertIn("HeroResultsContext.Provider", wrapper)
        self.assertIn("menuItems={menu.items}", wrapper)
        self.assertIn("groups={menu.groups}", wrapper)
        self.assertIn("actions={menu.actions}", wrapper)

        hero = code(HERO)
        self.assertNotIn('"use client"', hero)
        self.assertNotIn("useEffect", hero)
        self.assertNotIn("useState", hero)
        self.assertIn("export async function Hero(", hero)
        self.assertIn("await resolveHeroConfig()", hero)
        self.assertIn("resolveHeroWordmark(hero.brand, PLATFORM_NAME)", hero)
        # The one function-typed field never crosses the boundary as a prop.
        self.assertIn("fallbackHref: _fallbackHref, ...copy", hero)

        resolver = code(LANDING_PAGE_RESOLVER)
        # Not a client module (the directive is what counts; the contract
        # string the loader's warning carries names "use client" in prose).
        self.assertFalse(resolver.lstrip().startswith(('"use client"', "'use client'")))
        self.assertNotIn("useEffect", resolver)
        for name in ("loadPageSections", "arrangeLandingPage", "resolveLandingPage",
                     "resolveHeroConfig", "resolveHeroWordmark"):
            self.assertIn(f"export async function {name}(", resolver) if name.startswith(("load", "resolveL", "resolveHeroC")) \
                else self.assertIn(f"export function {name}(", resolver)
        self.assertIn('console.error(`[landing] section "${entry.id}" failed to load:`, e)', resolver)
        self.assertNotIn("@rokct-sdk-", read(LANDING_PAGE_RESOLVER), "landing-page.ts is not a registry")

    def test_hero_view_renders_copy_from_props(self):
        """The client view draws the copy it is handed: no copy state, no
        pending "no words" frame, the copy registry read only inside the
        form's next/dynamic loader (for fallbackHref), and the entrance
        animation off on the h1 so the server's text shows before
        hydration."""
        raw = read(HERO_VIEW)
        view = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", raw))
        self.assertIn('"use client"', view)
        self.assertIn("export function HeroView({", view)
        self.assertIn("hero: HeroViewCopy;", view)
        self.assertIn('export type HeroViewCopy = Omit<HeroConfig, "fallbackHref">;', view)
        for gone in ("PENDING_HERO", "setCopy", "useState<HeroConfig", "copy ?? "):
            self.assertNotIn(gone, view)
        self.assertIn("[...hero.headlineWords, ...formWords]", view)
        self.assertIn("<span>{hero.headlineSuffix}</span>", view)
        self.assertIn("hero.trustLine.map(", view)
        # loadHeroCopy appears once, inside the form's dynamic loader and
        # before the component - never in an effect.
        self.assertEqual(view.count("loadHeroCopy()"), 1)
        self.assertLess(view.index("dynamic<HeroFormProps>("), view.index("loadHeroCopy()"))
        self.assertLess(view.index("loadHeroCopy()"), view.index("export function HeroView("))
        for effect in re.finditer(r"useEffect\(\(\) => \{(.*?)\}, \[", view, re.S):
            self.assertNotIn("load", effect.group(1), "an effect in hero-view.tsx loads something")
        # The h1 and the blocks around it carry the copy visibly from the first byte.
        h1 = view.index("<motion.h1")
        self.assertEqual(view[h1:].split("className", 1)[0].count("initial={false}"), 1)
        self.assertGreaterEqual(view.count("initial={false}"), 3)
        self.assertEqual(view.count('<AnimatePresence mode="wait" initial={false}>'), 2)
        # The rotating word starts at index 0 on both sides; the branding
        # cache is read after mount only.
        self.assertIn("useState(0)", view)
        self.assertIn('mounted && typeof window !== "undefined"', view)
        # The stem wordmark: visible stem, full name for assistive tech.
        self.assertIn("aria-label={wordmark.name}", view)
        self.assertIn("title={wordmark.name}", view)
        self.assertIn("{wordmark.text}", view)
        self.assertIn("HeroResultsContext", view)

    def test_hero_stem_wordmark_has_room_for_its_descenders(self):
        """1.36.0 (Ray, 2026-09-10, on supacharge: "supa name in hero cut
        off on g and e"): the stem span sits at leading-none inside the
        slot that hides its overflow, and a 1em line box is shorter than
        a face's glyphs, so the descenders (and an italic face's last
        glyph) were clipped. The span carries symmetric em padding of
        its own - on the span, not its line height, because a home SDK
        restyles the span's face, size and line-height from outside -
        and the slot still clips (that is how it closes)."""
        raw = read(HERO_VIEW)
        view = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", raw))
        self.assertIn('export const HERO_STEM_PADDING_CLASS = "py-[0.15em] px-[0.05em]";', view)
        slot = view[view.index("function HeroWordmarkSlot("):view.index("export interface HeroViewProps")]
        self.assertIn("leading-none text-black dark:text-white ${HERO_STEM_PADDING_CLASS}`}", slot)
        self.assertIn("{wordmark.text}", slot)
        # The padding is in em so it scales with whatever size the span is
        # given, and symmetric so the glyphs stay put in the fixed-height row.
        match = re.search(r'HERO_STEM_PADDING_CLASS = "py-\[(\d*\.?\d+)em\] px-\[(\d*\.?\d+)em\]"', view)
        self.assertIsNotNone(match)
        self.assertGreaterEqual(float(match.group(1)), 0.12, "less than a sans descender's overflow at leading-none")
        self.assertGreater(float(match.group(2)), 0)
        self.assertNotIn("pb-[", slot)
        self.assertNotIn("pt-[", slot)
        # The slot still clips: the collapse closes it over hidden overflow.
        row = view[view.index('<div className="flex flex-row items-center justify-center h-[72px]">'):view.index("<HeroWordmarkSlot wordmark={wordmark} />")]
        self.assertIn('className="overflow-hidden transition-all duration-500 ease-in-out flex items-center"', row)
        self.assertIn('width: isExpanded ? "0px" : "250px",', row)

    def test_folded_stem_is_capitalised(self):
        """1.39.0 (Ray, 2026-09-11 04:23Z: the stem without .school is
        capitalised - "supacharge" shows as "Supacharge"): ONE function,
        brandStemLabel in header-menu.ts, upper-cases the stem's first
        character; the header's stem span and the hero's stem wordmark
        show it, while the title / aria-label / suffix / metadata keep
        the full name as declared. No render site capitalises on its own,
        the fold rule (brandStemOf, the 1.29.0 cap, the code beside the
        stem) is untouched, and no brand string is named."""
        src = read(HEADER_MENU_REGISTRY)
        self.assertIn("export function brandStemLabel(name: string | null | undefined): string | null {", src)
        label = src[src.index("export function brandStemLabel("):src.index("export function brandFoldsToStem(")]
        self.assertIn("const stem = brandStemOf(name);", label)
        self.assertIn("if (stem === null) return null;", label)
        self.assertIn("return stem.charAt(0).toUpperCase() + stem.slice(1);", label)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", src))
        letter = code[code.index("export function brandLetterOf("):code.index("export function brandFoldsToLetter(")]
        self.assertEqual(letter.count("toUpperCase"), 1, "the 1.28.0 letter tile's own upper-casing")
        self.assertEqual(code.count("toUpperCase"), 2, "the stem's capitalisation lives in brandStemLabel alone")
        # The header: the span shows the label, the suffix is cut at the
        # stem, the wordmark's title is the full name.
        header = read(HEADER)
        wordmark = header[header.index("function BrandStemWordmark("):header.index("function BrandBlock(")]
        self.assertIn("const suffix = name.trim().slice(stem.length);", wordmark)
        self.assertIn("const label = brandStemLabel(name) ?? stem;", wordmark)
        self.assertIn("<span>{label}</span>", wordmark)
        self.assertNotIn("<span>{stem}</span>", wordmark)
        self.assertIn("title={name.trim()}", wordmark)
        self.assertNotIn("toUpperCase", LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", header)))
        self.assertRegex(
            header,
            r"import \{[^}]*\bbrandStemLabel\b[^}]*\} from \"@/components/custom/landing/header-menu\";",
        )
        # The hero: the resolver answers the label, the view still titles
        # and labels the element with the full name.
        resolver = read(LANDING_PAGE_RESOLVER)
        self.assertIn("brandStemLabel(name) ?? name", resolver)
        self.assertNotIn("brandStemOf", resolver.replace("[brandStemOf]", ""))
        self.assertNotIn("toUpperCase", LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", resolver)))
        view = read(HERO_VIEW)
        slot = view[view.index("function HeroWordmarkSlot("):view.index("export interface HeroViewProps")]
        self.assertIn("aria-label={wordmark.name}", slot)
        self.assertIn("title={wordmark.name}", slot)
        self.assertIn("{wordmark.text}", slot)
        self.assertNotIn("toUpperCase", slot)
        # The fold cap and the code beside the stem are what 1.36.0 left.
        self.assertIn("export const BRAND_CODE_SCALE = 0.28;", src)
        self.assertIn("calc(${BRAND_MARK_SIZE_PX}px * ${BRAND_CODE_SCALE})", src)
        for text in (src, header, resolver):
            plain = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", text)).lower()
            self.assertNotIn("supacharge", plain)
            self.assertNotIn("rokct.ai", plain)

    def test_hero_config_declares_the_brand_and_sections_the_root_class(self):
        config = read(os.path.join(LANDING, "hero-config.ts"))
        # 1.41.0: "stem-tld" joins the union (the suffix in primary).
        self.assertIn('brand?: "name" | "stem" | "stem-tld";', config)
        self.assertIn('brand: "name",', config)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", config))
        for host in ("supacharge", "rokct.ai", ".school", ".app"):
            self.assertNotIn(host, code.lower(), f"hero-config.ts names {host}")
        sections = read(os.path.join(LANDING, "page-sections.ts"))
        self.assertIn("rootClass?: string;", sections)
        resolver = read(LANDING_PAGE_RESOLVER)
        self.assertIn("brandStemLabel(name) ?? name", resolver)
        self.assertIn("s.meta.rootClass?.trim()", resolver)
        wrapper = read(LANDING_CONTENT)
        self.assertIn("rootClass?: string;", wrapper)

    def test_landing_page_behaviour_under_node(self):
        """landing-page.ts executed beside the real registries: a failing
        section skipped, meta.renders deciding page and nav alike, a stable
        order, the header menu against the live nav, rootClass joined, the
        hero copy overlaid and the brand rule with an acme.school fixture."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute landing-page.ts")
        rewrites = {
            'from "@/components/custom/landing/landing-config"': 'from "./landing-config.ts"',
            'from "@/components/custom/landing/site-metadata"': 'from "./landing-site-metadata.ts"',
            'from "@/components/custom/landing/header-menu"': 'from "./header-menu.ts"',
            'from "@/components/custom/landing/hero-config"': 'from "./hero-config.ts"',
            'from "@/components/custom/landing/hero-copy"': 'from "./hero-copy.ts"',
            'from "@/components/custom/landing/page-sections"': 'from "./page-sections.ts"',
            'from "@/app/actions/base/landing"': 'from "./landing-actions.ts"',
            'from "@/app/config/features"': 'from "./features.ts"',
            'from "@/app/config/platform"': 'from "./platform.ts"',
            'from "@/lib/site-data/kinds"': 'from "./site-data-kinds.ts"',
        }
        real = {
            "landing-page.ts": LANDING_PAGE_RESOLVER,
            "header-menu.ts": HEADER_MENU_REGISTRY,
            "hero-config.ts": os.path.join(LANDING, "hero-config.ts"),
            "hero-copy.ts": os.path.join(LANDING, "hero-copy.ts"),
            "page-sections.ts": os.path.join(LANDING, "page-sections.ts"),
        }
        stubs = {
            "landing-config.ts": (
                "export type LandingNavBadge = 'new' | 'soon';\n"
                "export interface LandingNavItem { id: string; label: string; badge?: LandingNavBadge }\n"
                "export const LANDING_CONFIG = { loginUrl: '/login', signupUrl: '/register',\n"
                "  nav: { hero: { id: 'hero', label: 'Hero' }, footer: { id: 'footer', label: 'Footer' } } };\n"
            ),
            "landing-site-metadata.ts": (
                "export async function loadSiteMetadata() {\n"
                '  return { title: "Shell", siteName: "Shell", description: "", tagline: "" };\n'
                "}\n"
            ),
            "landing-actions.ts": "export interface LandingPlan { name: string }\n",
            "site-data-kinds.ts": 'export type SiteDataMode = "local" | "backend" | "hybrid";\n',
            "features.ts": (
                "export const PLATFORM_FEATURES = [\n"
                "  { active: true, href: '/' }, { active: true, href: '/extension' },\n"
                "  { active: false, href: '' }, { active: false, href: '' },\n"
                "];\n"
            ),
            "platform.ts": "export const PLATFORM_NAME = 'acme.school';\n",
        }
        with tempfile.TemporaryDirectory() as tmp:
            for fname, path in real.items():
                staged = read(path)
                for src, dst in rewrites.items():
                    staged = staged.replace(src, dst)
                self.assertNotIn('from "@/', staged, f"{fname} imports something the stage does not cover")
                with open(os.path.join(tmp, fname), "w", encoding="utf-8") as f:
                    f.write(staged)
            for fname, body in stubs.items():
                with open(os.path.join(tmp, fname), "w", encoding="utf-8") as f:
                    f.write(body)
            shutil.copy(LANDING_PAGE_TESTS, os.path.join(tmp, "landing-page.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "landing-page.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 21)

    def test_installed_section_entry_modules_are_server_safe(self):
        """The registry is imported on the server since 1.32.0, so a section's
        ENTRY module must not start with "use client": on the server every
        export of such a module is a client reference proxy, `meta` reads
        empty, and the loader skips the section with a warning. Scans every
        entry base registers between the page-sections markers and every
        installed template that exports a `meta`; base ships the host only,
        so it registers no section of its own, and the scan is what holds
        that any it ever installs keeps the contract (the interactive part in
        a sibling <name>.client.tsx the entry renders)."""
        manifest = load_manifest()
        installed = {
            e["to"]: os.path.join(SDK_ROOT, e["from"])
            for e in manifest["installs"]
            if os.path.isfile(os.path.join(SDK_ROOT, e["from"]))
        }
        sections = read(os.path.join(LANDING, "page-sections.ts"))
        start = sections.index("// @rokct-sdk-page-sections-start")
        end = sections.index("// @rokct-sdk-page-sections-end")
        entries = re.findall(r'import\("@/([^"]+)"\)', sections[start:end])
        self.assertEqual(entries, [], "base_sdk holds the host only; sections belong to the home SDK")
        candidates = {}
        for target in entries:
            found = [t for t in installed if t in (target + ".tsx", target + ".ts")]
            self.assertTrue(found, f"registered section {target} is not installed by base")
            candidates[found[0]] = installed[found[0]]
        for target, src in installed.items():
            if src.endswith((".ts", ".tsx")) and re.search(r"^export const meta\b", read(src), re.M):
                candidates[target] = src
        for target, src in sorted(candidates.items()):
            code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(src))).lstrip()
            self.assertFalse(
                code.startswith(('"use client"', "'use client'")),
                f"{target} exports meta and starts with \"use client\": the server cannot read its meta "
                "(it would render with default settings); move the client part to a sibling "
                "<name>.client.tsx the entry renders",
            )
            self.assertIn("export default", code, f"{target} exports meta but no default component")
        # No installed client component is ever a section entry: the ones
        # that start with "use client" export no meta.
        for target, src in installed.items():
            if not src.endswith((".ts", ".tsx")):
                continue
            code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(src))).lstrip()
            if code.startswith(('"use client"', "'use client'")):
                self.assertNotIn("PageSectionMeta", code, f"{target} is a client module typed as a section")

    def test_landing_loader_renders_a_client_reference_meta_with_defaults(self):
        """The loader checks `meta` before reading it: a client reference
        (React's tag, or its $$typeof/$$id own keys), a missing meta or any
        non-plain-object still renders, with the fallback settings (order
        100, the entry id, no nav entry, no rootClass) and one console.warn
        naming the section and the contract - never skipped, so a shell on a
        home SDK that has not split its entries keeps every section. The
        contract is stated at the registry, in the manifest about and in the
        CHANGELOG."""
        resolver = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(LANDING_PAGE_RESOLVER)))
        self.assertIn("export const SECTION_ENTRY_CONTRACT", resolver)
        self.assertIn('Symbol.for("react.client.reference")', resolver)
        self.assertIn('["$$typeof", "$$id"]', resolver)
        self.assertIn("Reflect.ownKeys(", resolver)
        self.assertIn("export function isClientReference(", resolver)
        self.assertIn("export function describeMetaProblem(", resolver)
        self.assertIn("Object.getPrototypeOf(meta)", resolver)
        self.assertIn("const problem = describeMetaProblem(mod.meta);", resolver)
        self.assertIn("export function fallbackSectionMeta(): PageSectionMeta {", resolver)
        self.assertIn("return { order: DEFAULT_PAGE_SECTION_ORDER, nav: [] };", resolver)
        self.assertIn('`[landing] section "${entry.id}" renders with default settings `', resolver)
        self.assertIn("`no rootClass): ${problem}. ${SECTION_ENTRY_CONTRACT}`", resolver)
        self.assertIn("meta = fallbackSectionMeta();", resolver)
        # A meta problem never skips: between reading the problem and
        # building the section there is no early return. The one skip in
        # the loader (1.40.0) is a module with no default export to render,
        # decided BEFORE meta is looked at.
        meta_path = resolver[resolver.index("const problem = describeMetaProblem(mod.meta);"):resolver.index("const nav = meta.nav ??")]
        self.assertNotIn("return null", meta_path)
        self.assertNotIn("skipped", meta_path)
        self.assertIn('if (typeof mod.default !== "function") {', resolver)
        self.assertIn('"its module has no default export; section skipped. "', resolver)
        self.assertLess(resolver.index('typeof mod.default !== "function"'), resolver.index("describeMetaProblem(mod.meta)"))
        self.assertLess(resolver.index("describeMetaProblem(mod.meta)"), resolver.index("const nav = meta.nav ??"))
        for text in ('"use client"', "sibling <name>.client.tsx", "meta.renders(ctx) stays pure"):
            self.assertIn(text, resolver)
        registry = read(os.path.join(LANDING, "page-sections.ts"))
        self.assertIn("`<name>.client.tsx`", registry)
        about = load_manifest()["_comment"]["about"]
        self.assertIn("<name>.client.tsx", about)
        self.assertIn('"use client"', about)
        self.assertIn("unsplit sections still render with default settings", about)
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        head = changelog.split("## 1.29.0", 1)[0]
        self.assertIn("`<name>.client.tsx`", head)
        self.assertIn("describeMetaProblem", head)
        self.assertIn("unsplit sections still render with default settings", head)

    def test_brand_marks_type_check_under_tsc(self):
        """The registry under tsc, strict and isolatedModules as the shells'
        tsconfig is, and a BrandMark assignable to the { src, alt } a hero
        badge's and a header action's icon take. Skips without a tsc."""
        tsc = os.environ.get("ROKCT_TSC") or shutil.which("tsc")
        if not tsc or not os.path.exists(tsc):
            raise unittest.SkipTest("no tsc reachable (set ROKCT_TSC to a tsc binary)")
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(BRAND_MARKS_REGISTRY, os.path.join(tmp, "brand-marks.ts"))
            with open(os.path.join(tmp, "use.ts"), "w", encoding="utf-8") as f:
                f.write(
                    'import { BRAND_MARKS, markImageClass, type BrandMark } from "./brand-marks";\n'
                    "const icon: { src: string; alt: string } = BRAND_MARKS.appStore;\n"
                    "const mark: BrandMark = BRAND_MARKS.windows;\n"
                    "const cls: string | undefined = markImageClass(icon.src);\n"
                    "export const used = [icon, mark, cls, markImageClass(undefined)];\n"
                )
            with open(os.path.join(tmp, "tsconfig.json"), "w", encoding="utf-8") as f:
                json.dump(TSC_STAGE_CONFIG, f)
            run = subprocess.run(
                [tsc, "-p", tmp], capture_output=True, text=True, timeout=300, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)


    # -- 1.37.0: the footer links seam and the legal documents ---------------

    def test_legal_links_and_action_are_installed(self):
        """Ray, 2026-09-10: "supa has no terms pages or about page" and, on
        where they belong, "legal pages are not in corporate sdk?" / "you
        should look at the dart side if they are not there yet". Base
        installs the pure links rule and the guest read; the pages are
        corporate_sdk's and are NOT installed here."""
        pairs = {(i["from"], i["to"]) for i in load_manifest()["installs"]}
        self.assertIn(LEGAL_LINKS_INSTALL, pairs)
        self.assertIn(LEGAL_ACTION_INSTALL, pairs)
        targets = {i["to"] for i in load_manifest()["installs"]}
        self.assertFalse(
            any(t.startswith("app/legal") for t in targets),
            "the /legal pages belong to corporate_sdk, never to base",
        )
        about = load_manifest()["_comment"]["about"]
        for text in ("FooterChromeConfig.links?: FooterLinkGroup[]", "listPublicTerms()",
                     "legalFooterLinks(terms, label?)", "corporate_sdk", "base_sdk >= 1.37.0"):
            self.assertIn(text, about)
        head = read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.32.1", 1)[0]
        self.assertIn("## 1.37.0", head)
        for text in ("`FooterChromeConfig.links?: FooterLinkGroup[]`", "`listPublicTerms()`",
                     "`legalFooterLinks(terms, label?)`", "`corporate_sdk`"):
            self.assertIn(text, head)
        # SDK CHANGELOG lines never start with `#` followed by text (MD018 on
        # the host re-pin): only headings, which are `## x.y.z`.
        for line in head.splitlines():
            if line.startswith("#") and line != "# Changelog":
                self.assertRegex(line, r"^## \d+\.\d+\.\d+$", line)

    def test_footer_links_seam_shape(self):
        config = read(FOOTER_CHROME_CONFIG)
        for needle in (
            "export interface FooterLink {",
            "export interface FooterLinkGroup {",
            "  items: FooterLink[];",
            "  links?: FooterLinkGroup[];",
        ):
            self.assertIn(needle, config)
        # `links` is optional on the config the row already takes.
        self.assertLess(config.index("export interface FooterChromeConfig {"), config.index("  links?: FooterLinkGroup[];"))
        footer = read(FOOTER_CHROME)
        self.assertIn('import Link from "next/link";', footer)
        self.assertIn("const groups = (config.links ?? []).filter((g) => g.items.length > 0);", footer)
        self.assertIn("{groups.length > 0 && (", footer)
        self.assertIn('aria-label="Footer links"', footer)
        self.assertIn('rel="noopener noreferrer"', footer)
        self.assertIn("data-footer-group={group.id}", footer)
        # The row sits between the strip and the copyright line.
        self.assertLess(footer.index('{networkStrip && <NetworkStrip surface="footer" />}'),
                        footer.index("{groups.length > 0 && ("))
        self.assertLess(footer.index("{groups.length > 0 && ("), footer.index("© Copyright {year}"))
        # Still generic: no product, brand, host or copy.
        body = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", footer + config))
        for word in ("rokct.ai", "supacharge", "Privacy", "Terms of", "https://", "demo", "sample", "lorem"):
            self.assertNotIn(word, body, word)

    def test_legal_action_is_a_guest_read_that_soft_fails(self):
        src = read(LEGAL_ACTION)
        self.assertRegex(src, re.compile(r'^"use server";$', re.M))
        self.assertIn('import { platformCall } from "@/app/services/base/platform-gateway";', src)
        self.assertIn("export async function listPublicTerms(): Promise<PublicTerm[]> {", src)
        self.assertIn('"frappe.client.get_list",', src)
        self.assertIn("doctype: LEGAL_DOCTYPE,", src)
        self.assertIn('fields: ["name", "title", "disabled"],', src)
        self.assertIn("filters: { disabled: 0 },", src)
        self.assertIn("{ requireAuth: false },", src)
        self.assertIn("const published = normalisePublicTerms(rows);", src)
        self.assertIn("return [];", src)
        # A "use server" module exports async functions only; the words and
        # the rule live in the pure module.
        body = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", src))
        self.assertNotIn("export const", body)
        links = read(LEGAL_LINKS)
        self.assertNotIn('"use client"', links)
        self.assertNotIn('"use server"', links)
        for needle in (
            'export const LEGAL_DOCTYPE = "Terms and Conditions";',
            'export const LEGAL_ROUTE = "/legal";',
            "export interface PublicTerm {",
            "export function legalDocHref(name: string): string {",
            "export function normalisePublicTerms(rows: unknown): PublicTerm[] {",
            "export function legalFooterLinks(",
            "): FooterLinkGroup[] {",
        ):
            self.assertIn(needle, links)
        for path in (LEGAL_ACTION, LEGAL_LINKS):
            text = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(path))).lower()
            for word in ("demo", "sample", "example", "lorem", "https://"):
                self.assertNotIn(word, text, f"{os.path.basename(path)} carries {word}")

    def test_legal_links_behaviour_under_node(self):
        """The rule executed: null rows are [], disabled and malformed rows
        drop, the href is /legal/<name> encoded, and nothing published is
        NO group (so a footer that spreads it draws nothing new)."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute legal-links.ts")
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(FOOTER_CHROME_CONFIG, os.path.join(tmp, "footer-chrome-config.ts"))
            links = read(LEGAL_LINKS).replace(
                'from "@/components/custom/landing/footer-chrome-config"', 'from "./footer-chrome-config.ts"'
            )
            self.assertNotIn('from "@/', links, "legal-links.ts imports something the stage does not cover")
            with open(os.path.join(tmp, "legal-links.ts"), "w", encoding="utf-8") as f:
                f.write(links)
            shutil.copy(LEGAL_LINKS_TESTS, os.path.join(tmp, "legal-links.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "legal-links.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 8)


    # -- 1.37.0: the footer status probes the tenant only by default --------

    def test_status_probes_default_to_the_tenant_only(self):
        """Ray, 2026-09-09: every shell reads its footer status from its own
        tenant backend, never from control. The default list is the tenant
        alone; control stays in the catalogue for an explicit opt-in; the
        variable names are unchanged."""
        config = read(FOOTER_CHROME_CONFIG)
        self.assertIn('export const DEFAULT_PLATFORM_STATUS_SOURCES: readonly PlatformStatusSite[] = [\n  "tenant",\n];', config)
        self.assertIn("if (wanted.length === 0) return probesFor(DEFAULT_PLATFORM_STATUS_SOURCES);", config)
        self.assertNotIn("if (!raw) return [...PLATFORM_STATUS_PROBES];", config)
        self.assertNotIn("return [...PLATFORM_STATUS_PROBES];", config)
        self.assertIn('{ site: "control", cmd: "control:get_versions" },', config)
        self.assertIn("control is OPT-IN", config)
        status = read(STATUS_ACTION)
        self.assertIn("resolvePlatformStatusProbes(process.env.ROKCT_STATUS_SOURCE)", status)
        self.assertIn("the tenant site ONLY by default", status)
        for name in ("ROKCT_STATUS_SOURCE", "ROKCT_CONTROL_BASE_URL", "NEXT_PUBLIC_ROKCT_CONTROL_BASE_URL",
                     "ROKCT_BASE_URL", "NEXT_PUBLIC_ROKCT_BASE_URL"):
            self.assertIn(name, config + status, f"{name} renamed or dropped")
        head = read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.32.1", 1)[0]
        self.assertIn("`DEFAULT_PLATFORM_STATUS_SOURCES`", head)
        self.assertIn("2026-09-09", head)

    def test_status_probes_behaviour_under_node(self):
        """The rule executed: unset is the tenant only with no control probe;
        an explicit opt-in (control, or tenant,control) still includes it."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute footer-chrome-config.ts")
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(FOOTER_CHROME_CONFIG, os.path.join(tmp, "footer-chrome-config.ts"))
            shutil.copy(STATUS_PROBES_TESTS, os.path.join(tmp, "status-probes.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "status-probes.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 13)

    def test_status_action_treats_an_empty_answer_as_none(self):
        """1.40.0: a 2xx whose body is null, not an object, or {} is a proxy
        or a placeholder in front of a missing backend, not an answer: the
        loop continues to the next probe and falls through to offline. The
        rule is footer-chrome-config.ts's pure isProbeAnswer, so a client
        may share it; the action applies it after `attempted = true` and
        before it reads the answer."""
        config = read(FOOTER_CHROME_CONFIG)
        self.assertIn("export function isProbeAnswer(answer: unknown): answer is Record<string, unknown> {", config)
        self.assertIn("const keys = Object.keys(answer);", config)
        self.assertIn('if (keys.length === 1 && keys[0] === "message") {', config)
        status = read(STATUS_ACTION)
        self.assertIn("  isProbeAnswer,\n  readPlatformVersion,\n  resolvePlatformStatusProbes,", status)
        self.assertIn("      attempted = true;\n", status)
        self.assertLess(status.index("attempted = true;"), status.index("if (!isProbeAnswer(answer)) continue;"))
        self.assertLess(status.index("if (!isProbeAnswer(answer)) continue;"),
                        status.index("const { maintenance, version } = readProbeAnswer(answer);"))
        self.assertIn("function readProbeAnswer(answer: Record<string, unknown>): {", status)
        self.assertNotIn("an answer at all is the signal", status)
        self.assertIn("an answer WITH SOMETHING IN IT is the signal", status)
        self.assertIn("a 2xx with an empty body counts as tried and not answered (1.40.0)", status)

    def test_header_stem_wordmark_shares_the_hero_wordmark_font(self):
        """1.40.0 (Ray, 2026-09-11: on supacharge.school the wordmark is
        right in the hero and the footer but wrong in the HEADER, font-wise):
        the header's stem wordmark and the hero's carry the SAME font
        utilities - weight, tracking, leading, case - and neither declares
        a family, so both inherit the shell's face; both carry the
        `data-brand-wordmark="stem"` hook a home SDK styles with one rule.
        The code span keeps its own weight at its 12.32px cap."""
        header = read(HEADER)
        view = read(HERO_VIEW)
        wordmark = header[header.index("function BrandStemWordmark("):header.index("function BrandBlock(")]
        slot = view[view.index("function HeroWordmarkSlot("):view.index("export interface HeroViewProps")]
        font_re = re.compile(r"\b(?:font-[a-z0-9\[\]-]+|tracking-[a-z0-9\[\]\.-]+|leading-[a-z0-9\[\]\.-]+|uppercase|lowercase|capitalize|normal-case|italic|not-italic)\b")
        header_cls = re.search(r'data-brand-wordmark="stem"\s*className="([^"]+)"', wordmark)
        hero_cls = re.search(r'data-brand-wordmark="stem"\s*className=\{`([^`]+)`\}', slot)
        self.assertIsNotNone(header_cls, "the header stem wordmark carries the hook and a class list")
        self.assertIsNotNone(hero_cls, "the hero stem wordmark carries the hook and a class list")
        header_font = sorted(font_re.findall(header_cls.group(1)))
        hero_font = sorted(font_re.findall(hero_cls.group(1)))
        self.assertEqual(header_font, hero_font)
        self.assertEqual(header_font, ["font-bold", "leading-none", "tracking-tighter"])
        for cls in (header_cls.group(1), hero_cls.group(1)):
            self.assertNotIn("font-sans", cls)
            self.assertNotIn("font-mono", cls)
            self.assertNotIn("uppercase", cls)
        for text in (header, view):
            code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", text))
            self.assertEqual(code.count('data-brand-wordmark="stem"'), 1)
        # The stem's label is the hero's: the same capitalised stem.
        self.assertIn("const label = brandStemLabel(name) ?? stem;", wordmark)
        self.assertIn("text: brandStemLabel(name) ?? name", read(LANDING_PAGE_RESOLVER))
        # The code span (the country code / the domain suffix) is its own
        # thing: font-medium at the 1.36.0 cap, untouched.
        self.assertIn("fontSize: BRAND_STEM_CODE_FONT_SIZE }", header)
        menu = read(os.path.join(LANDING, "header-menu.ts"))
        self.assertIn("export const BRAND_CODE_FONT_SIZE = `calc(${BRAND_MARK_SIZE_PX}px * ${BRAND_CODE_SCALE})`;", menu)
        self.assertRegex(menu, re.compile(r"^export const BRAND_MARK_SIZE_PX = 44;$", re.M))
        self.assertRegex(menu, re.compile(r"^export const BRAND_CODE_SCALE = 0\.28;$", re.M))
        self.assertIn("export const BRAND_STEM_CODE_FONT_SIZE = `min(${BRAND_CODE_FONT_SIZE}, ${BRAND_STEM_FONT_SIZE})`;", menu)
        self.assertIn('"ml-1 inline-block self-center pt-0.5 font-medium leading-none text-foreground transition-all duration-500 ease-in-out"', header)
        self.assertNotIn("font-medium", header_cls.group(1))

    def test_admin_system_info_asks_a_registered_version_cmd(self):
        """1.40.0: the admin system-info actions asked `api.get_version`, a
        cmd registered nowhere (base/frappe/manifest.json's 130-odd tenant
        cmds, the platform's hooks), so the version was always null. Both
        now ask `api.system.api_status` - the ONE registered tenant cmd that
        carries `version` - through the same paasCall, read it with the pure
        readPlatformVersion (a string, else null) and keep their return
        shape. No base template or kernel file names the phantom cmd."""
        config = read(FOOTER_CHROME_CONFIG)
        self.assertIn('export const PLATFORM_VERSION_CMD = "api.system.api_status";', config)
        self.assertIn("export function readPlatformVersion(answer: unknown): string | null {", config)
        self.assertIn('return typeof inner.version === "string" ? inner.version : null;', config)
        frappe_manifest = read(os.path.join(SDK_ROOT, "..", "frappe", "manifest.json"))
        self.assertIn('"{app_name}.api.system.api_status"', frappe_manifest)
        self.assertNotIn("get_version", frappe_manifest)
        for name in ("settings.ts", "system.ts"):
            action = read(os.path.join(SDK_ROOT, "templates", "app", "actions", "base", "admin", name))
            self.assertIn("      paasCall(PLATFORM_VERSION_CMD),", action, name)
            self.assertIn('paasCall("api.admin_system.get_system_info"),', action, name)
            self.assertIn('versionRes.status === "fulfilled" ? readPlatformVersion(versionRes.value) : null;', action, name)
            self.assertIn("      version: version,", action, name)
            code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", action))
            self.assertNotIn("api.get_version", code, name)
        status = read(STATUS_ACTION)
        self.assertIn("version: readPlatformVersion(answer)", status)
        for root in (os.path.join(SDK_ROOT, "templates"), os.path.join(SDK_ROOT, "src")):
            for dirpath, _, files in os.walk(root):
                for fname in files:
                    if not fname.endswith((".ts", ".tsx")):
                        continue
                    path = os.path.join(dirpath, fname)
                    code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(path)))
                    self.assertNotIn('"api.get_version"', code, f"{os.path.relpath(path, SDK_ROOT)} asks the phantom cmd")

    def test_admin_actions_call_the_gateway_not_the_sdk_client(self):
        """1.40.0: `admin/settings.ts` (21 sites) and `admin/content.ts` (4)
        still called `frappe.call({ method, args })` on the client from
        `getPaaSClient()`. frappe-js-sdk's `call()` takes NO object
        argument, so those calls sent nothing and the admin surfaces
        (payment gateways, permission and Flutter settings, terms, privacy
        policies, FAQs) were silently empty. Every site is now
        `paasCall(cmd, args)` with the cmd string verbatim - `frappe.client.*`
        goes through the gateway as-is - and the same args, the shape the
        already-migrated sites in the same files use. No action file under
        templates/app/actions calls `.call({` with an object, names
        `frappe.call(`, casts to `(x as any).call(`, or imports
        `getPaaSClient`; no site turned into a dotted `/api/method/` URL."""
        object_call = re.compile(r"\.call\(\s*\{")
        frappe_call = re.compile(r"\bfrappe\.call\(")
        any_call = re.compile(r"as any\)\.call\(")
        actions = os.path.join(SDK_ROOT, "templates", "app", "actions")
        seen = 0
        for dirpath, _, files in os.walk(actions):
            for fname in files:
                if not fname.endswith((".ts", ".tsx")):
                    continue
                path = os.path.join(dirpath, fname)
                rel = os.path.relpath(path, SDK_ROOT)
                code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(path)))
                seen += 1
                self.assertNotRegex(code, object_call, f"{rel} calls .call({{...}}) with an object argument")
                self.assertNotRegex(code, frappe_call, f"{rel} calls frappe.call(")
                self.assertNotRegex(code, any_call, f"{rel} casts to any to reach .call(")
                self.assertNotIn("getPaaSClient", code, f"{rel} still reaches the sdk client")
                self.assertNotIn("/api/method/", code, f"{rel} hard-codes a dotted method URL")
        self.assertGreaterEqual(seen, 7, "the action files were walked")
        expected = {
            "settings.ts": {
                "frappe.client.get": 6,
                "frappe.client.get_list": 3,
                "frappe.client.set_value": 6,
                "frappe.client.insert": 3,
                "frappe.client.delete": 2,
                "frappe.client.save": 1,
            },
            "content.ts": {
                "frappe.client.get_list": 1,
                "frappe.client.insert": 1,
                "frappe.client.set_value": 1,
                "frappe.client.delete": 1,
            },
        }
        for name, cmds in expected.items():
            action = read(os.path.join(actions, "base", "admin", name))
            self.assertIn('import { paasCall } from "@/app/services/base/platform-gateway";', action, name)
            self.assertNotIn('from "@/app/lib/client"', action, name)
            for cmd, count in cmds.items():
                self.assertEqual(
                    action.count(f'paasCall("{cmd}", {{'), count,
                    f"{name} asks {cmd} through paasCall at {count} sites",
                )

    def test_status_action_behaviour_under_node(self):
        """The action executed (tests/status.test.mts): null, a scalar, an
        array and {} read as offline; {status:"ok"} as operational; the
        envelope's maintenance and version as before; an empty tenant
        answer falls through to an opted-in control probe; no origin is
        unconfigured and a failed probe offline, as before; and the hidden
        indicator (`unconfigured`) is reached from ROKCT_STATUS_SOURCE=off
        or none alone - never from a failed or an empty probe."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute status.ts")
        stub_gateway = (
            "export type PlatformGatewayFailure = 'no_base_url' | 'http_error' | 'network_error';\n"
            "export class PlatformGatewayError extends Error {\n"
            "  readonly cmd: string; readonly reason: PlatformGatewayFailure; readonly status?: number;\n"
            "  constructor(cmd: string, reason: PlatformGatewayFailure, status?: number) {\n"
            "    super(`Platform gateway call failed: ${cmd}`); this.name = 'PlatformGatewayError';\n"
            "    this.cmd = cmd; this.reason = reason; this.status = status;\n"
            "  }\n"
            "}\n"
            "/** What the next platformCall answers, in order; a function is called and may throw. */\n"
            "export const answers: unknown[] = [];\n"
            "export const calls: { cmd: string; site: 'tenant' | 'control' }[] = [];\n"
            "export async function platformCall<T = unknown>(cmd: string, _payload: unknown, options: { baseUrl?: string }): Promise<T> {\n"
            "  calls.push({ cmd, site: options.baseUrl ? 'control' : 'tenant' });\n"
            "  if (answers.length === 0) throw new Error('no stub answer left');\n"
            "  const next = answers.shift();\n"
            "  return (typeof next === 'function' ? next() : next) as T;\n"
            "}\n"
        )
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(FOOTER_CHROME_CONFIG, os.path.join(tmp, "footer-chrome-config.ts"))
            with open(os.path.join(tmp, "platform-gateway.ts"), "w", encoding="utf-8") as f:
                f.write(stub_gateway)
            staged = read(STATUS_ACTION).replace(
                'from "@/app/services/base/platform-gateway"', 'from "./platform-gateway.ts"'
            ).replace(
                'from "@/components/custom/landing/footer-chrome-config"', 'from "./footer-chrome-config.ts"'
            )
            self.assertNotIn('from "@/', staged, "status.ts imports something the stage does not cover")
            with open(os.path.join(tmp, "status.ts"), "w", encoding="utf-8") as f:
                f.write(staged)
            shutil.copy(STATUS_ACTION_TESTS, os.path.join(tmp, "status.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "status.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 14)

    # -- 1.41.0: the suffix in primary, the download buttons, the offer ---

    def test_brand_suffix_is_in_the_primary_colour(self):
        """1.41.0 (Ray, 2026-09-11 07:34:03Z: "also site name the .school
        get primary color in nextjs"): the header's suffix span - the dot
        and what follows the stem - carries `text-primary` (the theme
        token; no brand colour is named) and its own
        `data-brand-wordmark="tld"` hook; the stem span, the code span and
        the wordmark's own class list are untouched. The hero has the
        matching mode: `brand: "stem-tld"` resolves `suffix` beside the
        stem and the view draws it after the stem in the same span, in
        primary, with the same hook; `"stem"` draws what it drew."""
        header = read(HEADER)
        wordmark = header[header.index("function BrandStemWordmark("):header.index("function BrandBlock(")]
        self.assertIn(
            '<span data-brand-wordmark="tld" className="min-w-0 overflow-hidden pr-[0.12em] -mr-[0.12em] text-primary">\n'
            "          {suffix}\n"
            "        </span>",
            wordmark,
        )
        self.assertIn("<span>{label}</span>", wordmark)
        self.assertIn(
            'className="flex shrink-0 items-center whitespace-nowrap pt-0.5 font-bold tracking-tighter leading-none text-foreground"',
            wordmark,
        )
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", header))
        self.assertEqual(code.count('data-brand-wordmark="tld"'), 1)
        self.assertEqual(code.count('data-brand-wordmark="stem"'), 1)
        self.assertEqual(code.count("text-primary"), 2, "the 1.28.0 letter tile and the suffix, nothing else")
        # The code span beside the stem is not the suffix: still foreground.
        self.assertIn("fontSize: BRAND_STEM_CODE_FONT_SIZE }", header)

    def test_brand_suffix_has_room_for_its_italic_overhang(self):
        """1.42.0 (Ray, 2026-09-11 13:57Z: the final "l" of the header's
        suffix was "a bit cut"): the suffix span clips its own overflow so
        the slot can close over it, and its box is the text's advance
        width - so an italic face's last glyph, which leans past its
        advance, was sheared off at the right edge once a home SDK
        italicised the wordmark through the stem hook. The span pads its
        right by `0.12em` (over the ~0.09em a 900 italic lowercase "l"
        overhangs) and hands the same width back with `-mr-[0.12em]`, so
        the grid track, the stem's width and the code beside it measure
        what they did, open and folded. Clipping stays: the fold needs
        it. The hero's suffix never clipped and carries neither."""
        header = read(HEADER)
        wordmark = header[header.index("function BrandStemWordmark("):header.index("function BrandBlock(")]
        self.assertIn(
            '<span data-brand-wordmark="tld" className="min-w-0 overflow-hidden pr-[0.12em] -mr-[0.12em] text-primary">',
            wordmark,
        )
        self.assertNotIn('className="min-w-0 overflow-hidden text-primary"', wordmark)
        # The padding and the negative margin are one number, in em, so
        # the room scales with the wordmark's responsive size.
        pad = re.search(r"pr-\[([0-9.]+)em\]", wordmark)
        neg = re.search(r"-mr-\[([0-9.]+)em\]", wordmark)
        self.assertIsNotNone(pad)
        self.assertIsNotNone(neg)
        self.assertEqual(pad.group(1), neg.group(1))
        self.assertGreaterEqual(float(pad.group(1)), 0.09)
        # No new size, face or colour: the stem's list and the code's cap are untouched.
        self.assertIn(
            'className="flex shrink-0 items-center whitespace-nowrap pt-0.5 font-bold tracking-tighter leading-none text-foreground"',
            wordmark,
        )
        self.assertEqual(header.count("overflow-hidden pr-[0.12em]"), 1)
        view = read(HERO_VIEW)
        self.assertIn('<span data-brand-wordmark="tld" className="text-primary">', view)
        self.assertNotIn("pr-[0.12em]", view)
        # The hero: the config names the mode, the resolver answers the
        # suffix, the view draws it.
        config = read(os.path.join(LANDING, "hero-config.ts"))
        self.assertIn('brand?: "name" | "stem" | "stem-tld";', config)
        resolver = read(LANDING_PAGE_RESOLVER)
        self.assertIn("  suffix?: string;", resolver)
        self.assertIn('if (brand !== "stem" && brand !== "stem-tld") return null;', resolver)
        self.assertIn('if (brand === "stem-tld") {', resolver)
        self.assertIn("if (label !== null) return { text: label, name, suffix: name.trim().slice(label.length) };", resolver)
        self.assertIn("return { text: brandStemLabel(name) ?? name, name };", resolver)
        view = read(HERO_VIEW)
        slot = view[view.index("function HeroWordmarkSlot("):view.index("export interface HeroViewProps")]
        self.assertIn("{wordmark.text}", slot)
        self.assertIn(
            "{wordmark.suffix && (\n"
            '        <span data-brand-wordmark="tld" className="text-primary">\n'
            "          {wordmark.suffix}\n"
            "        </span>\n"
            "      )}",
            slot,
        )
        self.assertIn("wordmark.text.length + (wordmark.suffix?.length ?? 0)", slot)
        view_code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", view))
        self.assertEqual(view_code.count('data-brand-wordmark="tld"'), 1)
        self.assertEqual(view_code.count('data-brand-wordmark="stem"'), 1)
        for text in (header, resolver, view, config):
            plain = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", text)).lower()
            self.assertNotIn(".school", plain)
            self.assertNotIn("supacharge", plain)
        doc = read(DOWNLOADS_DOC)
        self.assertIn('data-brand-wordmark="tld"', doc)
        self.assertIn('brand: "stem-tld"', doc)
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("## 1.41.0", changelog)
        # The rulings are quoted verbatim, wrapped at the column: compare
        # with the line breaks folded to one space.
        head = re.sub(r"\s+", " ", changelog.split("## 1.40.0", 1)[0])
        for ruling in (
            "2026-09-11 07:34:03Z: \"also site name the .school get primary color in nextjs\"",
            "2026-09-11 07:34:37Z: \"footer has  download links let them be platform icons buttons\"",
            "2026-09-11 07:37:17Z: \"this nextjs has install, it does show on mobile though i havent seen "
            "it in desktop i think it installs as pwa but i think it should check the platform and "
            "offer app of that platform\"",
        ):
            self.assertIn(re.sub(r"\s+", " ", ruling), head, ruling)
        self.assertNotRegex(changelog, re.compile(r"^#[^#\s]", re.M), "no CHANGELOG line starts with # and text")

    def test_footer_downloads_seam_shape(self):
        """1.41.0 (Ray, 2026-09-11 07:34:37Z: "footer has  download links
        let them be platform icons buttons"): `FooterChromeConfig.downloads`
        is a list of DownloadEntry - a closed platform set, a label, an
        href, an optional mark by BRAND_MARKS key - and the row draws one
        ICON BUTTON per entry in a `Downloads` nav beside the link groups:
        an <a> with the label as aria-label and title, the mark through
        next/image with markImageClass when named, else a neutral glyph
        from platform-glyphs.tsx. Nothing in base declares an entry."""
        config = read(FOOTER_CHROME_CONFIG)
        for needle in (
            'import type { BrandMarkId } from "@/components/custom/landing/brand-marks";',
            "export type DownloadPlatform =",
            '  | "ios"\n  | "android"\n  | "huawei"\n  | "macos"\n  | "windows"\n  | "linux"\n  | "web";',
            "export interface DownloadEntry {",
            "  platform: DownloadPlatform;",
            "  mark?: BrandMarkId;",
            "  downloads?: DownloadEntry[];",
            '  downloads: "Downloads",',
        ):
            self.assertIn(needle, config)
        self.assertLess(config.index("export interface FooterChromeConfig {"), config.index("  downloads?: DownloadEntry[];"))
        rules = read(DOWNLOAD_PLATFORM)
        for needle in (
            "export const DOWNLOAD_PLATFORMS: readonly DownloadPlatform[] = [",
            "export function isDownloadPlatform(value: unknown): value is DownloadPlatform {",
            "export function isDownloadHref(href: unknown): href is string {",
            "export function isDownloadEntry(value: unknown): value is DownloadEntry {",
            "export function normaliseDownloads(value: unknown): DownloadEntry[] {",
            "export function downloadTitle(entry: DownloadEntry): string {",
        ):
            self.assertIn(needle, rules)
        footer = read(FOOTER_CHROME)
        for needle in (
            'import { InstallOffer } from "@/components/custom/install-offer";',
            "const downloads = normaliseDownloads(config.downloads);",
            "{(groups.length > 0 || downloads.length > 0) && (",
            "{downloads.length > 0 && (",
            "aria-label={labels.downloads}",
            "data-footer-downloads={downloads.length}",
            '{installOffer && <InstallOffer downloads={downloads} className="mr-2" />}',
            "{downloads.map((entry) => (",
            'target={entry.external ? "_blank" : undefined}',
            'rel={entry.external ? "noreferrer" : undefined}',
            "aria-label={entry.label}",
            "title={downloadTitle(entry)}",
            "data-download-platform={entry.platform}",
            "className={DOWNLOAD_BUTTON_CLASS}",
            "<DownloadMark entry={entry} />",
            "installOffer = true,",
        ):
            self.assertIn(needle, footer)
        # The offer is FIRST in the nav, the buttons after it; the nav sits
        # beside the link groups, both above the copyright line.
        self.assertLess(footer.index("<InstallOffer downloads={downloads}"), footer.index("{downloads.map((entry) => ("))
        self.assertLess(footer.index('aria-label="Footer links"'), footer.index("aria-label={labels.downloads}"))
        self.assertLess(footer.index("aria-label={labels.downloads}"), footer.index("© Copyright {year}"))
        glyphs = read(PLATFORM_GLYPHS)
        for needle in (
            'import Image from "next/image";',
            "export const DOWNLOAD_BUTTON_CLASS =\n"
            '  "h-10 w-10 rounded-full border border-border bg-transparent hover:bg-muted flex items-center justify-center";',
            'export type PlatformGlyphShape = "phone" | "laptop" | "terminal" | "globe";',
            "export const PLATFORM_GLYPH_SHAPES: Readonly<Record<DownloadPlatform, PlatformGlyphShape>> = {",
            "export function PlatformGlyph({",
            "export function DownloadMark({",
            "const mark = entry.mark ? BRAND_MARKS[entry.mark] : undefined;",
            "const mono = markImageClass(mark.src);",
            'stroke: "currentColor",',
            "unoptimized",
        ):
            self.assertIn(needle, glyphs)
        # Every platform has a glyph, and the glyphs are neutral shapes -
        # never a store's or a vendor's mark drawn by hand.
        shapes = glyphs[glyphs.index("PLATFORM_GLYPH_SHAPES"):glyphs.index("export const DOWNLOAD_BUTTON_CLASS")]
        for platform in ("ios", "android", "huawei", "macos", "windows", "linux", "web"):
            self.assertRegex(shapes, re.compile(rf'^  {platform}: "(?:phone|laptop|terminal|globe)",$', re.M))
        # Still generic, and no brand mark is drawn by hand: the only paths
        # the glyph file draws are the four shapes' own.
        body = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", footer + config + rules + glyphs))
        for word in ("rokct.ai", "supacharge", "https://", "play.google", "apps.apple", "appgallery.huawei", "demo", "sample", "lorem", "APK"):
            self.assertNotIn(word, body, word)
        # Installed, as a set.
        by_from = {e["from"]: e["to"] for e in load_manifest()["installs"]}
        for src, dst in DOWNLOADS_INSTALLS.items():
            self.assertEqual(by_from.get(src), dst, src)
            self.assertTrue(os.path.exists(os.path.join(SDK_ROOT, src)), src)
        doc = read(DOWNLOADS_DOC)
        self.assertIn("`downloads?: DownloadEntry[]`", doc)
        self.assertIn('aria-label="Downloads"', doc)

    def test_install_offer_is_a_client_component_that_checks_the_platform(self):
        """1.41.0 (Ray, 2026-09-11 07:37:17Z: "this nextjs has install, it
        does show on mobile though i havent seen it in desktop i think it
        installs as pwa but i think it should check the platform and
        offer app of that platform"): components/custom/install-offer.tsx
        is a client component that reads the platform after mount
        (install-offer.ts detectPlatform), hides on an installed page
        (matchMedia standalone), links the download declared for the
        platform as "Get the <label>", and falls back to the browser's
        beforeinstallprompt as "Install"; the row mounts it first in the
        Downloads nav and exports nothing new for the header: a home SDK
        imports the component itself."""
        offer = read(INSTALL_OFFER)
        self.assertTrue(offer.lstrip().startswith("/*"), "licence header first")
        self.assertIn('"use client";', offer)
        self.assertLess(offer.index('"use client";'), offer.index("import React"))
        for needle in (
            "export function InstallOffer({",
            "export interface InstallOfferProps {",
            "  downloads: DownloadEntry[];",
            "  labels?: Partial<InstallOfferLabels>;",
            "  platform?: DownloadPlatform | null;",
            "window.matchMedia(STANDALONE_MEDIA_QUERY).matches",
            'window.addEventListener("beforeinstallprompt", onPrompt);',
            'window.removeEventListener("beforeinstallprompt", onPrompt);',
            "event.preventDefault();",
            "setPlatform(forced === undefined ? detectPlatform() : forced);",
            "const entry = platform ? pickDownload(downloads, platform) : null;",
            "if (platform === undefined || standalone) return null;",
            "const text = installOfferText(entry, words);",
            "pending.prompt().catch(() => {",
            "<span>{words.install}</span>",
            "data-install-offer={entry.platform}",
            'data-install-offer="prompt"',
            "<DownloadMark entry={entry} />",
            "export default InstallOffer;",
        ):
            self.assertIn(needle, offer)
        # Everything is read in effects: the server and the first client
        # render agree on nothing drawn.
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", offer))
        self.assertEqual(code.count("React.useEffect("), 2)
        self.assertNotIn("typeof window", code.split("React.useEffect(")[0], "no window read at render")
        rules = read(INSTALL_OFFER_RULES)
        for needle in (
            "export function detectPlatformFrom(hints: PlatformHints): DownloadPlatform | null {",
            "export function detectPlatform(): DownloadPlatform | null {",
            "nav.userAgentData?.platform ?? null,",
            "export const DOWNLOAD_FALLBACKS: Readonly<Record<DownloadPlatform, readonly DownloadPlatform[]>> = {",
            '  android: ["android", "huawei"],',
            '  huawei: ["huawei", "android"],',
            "export function pickDownload(",
            'export const STANDALONE_MEDIA_QUERY = "(display-mode: standalone)";',
            '  get: "Get the",',
            '  install: "Install",',
        ):
            self.assertIn(needle, rules)
        # The pure half reads no DOM at module load and names no product.
        rules_code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", rules + offer)).lower()
        for word in ("rokct.ai", "supacharge", "https://", "apk", "document.", "localstorage"):
            self.assertNotIn(word, rules_code, word)
        self.assertNotIn("APK", offer + rules, "the word is never rendered")
        doc = read(DOWNLOADS_DOC)
        self.assertIn("@/components/custom/install-offer", doc)
        self.assertIn("beforeinstallprompt", doc)

    def test_download_and_install_rules_under_node(self):
        """The rules executed (tests/download-platform.test.mts and
        tests/install-offer.test.mts): the platform set, the https-or-route
        href rule, the entry shape and the row's normalisation; the
        platform from client hints then the user-agent string, the
        fallbacks between android and huawei, the pick and the words."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute the download rules")
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(FOOTER_CHROME_CONFIG, os.path.join(tmp, "footer-chrome-config.ts"))
            for src, name in ((DOWNLOAD_PLATFORM, "download-platform.ts"), (INSTALL_OFFER_RULES, "install-offer.ts")):
                staged = read(src).replace(
                    'from "@/components/custom/landing/footer-chrome-config"', 'from "./footer-chrome-config.ts"'
                )
                self.assertNotIn('from "@/', staged, f"{name} imports something the stage does not cover")
                with open(os.path.join(tmp, name), "w", encoding="utf-8") as f:
                    f.write(staged)
            shutil.copy(DOWNLOAD_PLATFORM_TESTS, os.path.join(tmp, "download-platform.test.mts"))
            shutil.copy(INSTALL_OFFER_TESTS, os.path.join(tmp, "install-offer.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "download-platform.test.mts"),
                 os.path.join(tmp, "install-offer.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 22)

    # -- 1.42.0: the floating "Back to top" button ----------------------------

    def test_back_to_top_is_a_client_component_mounted_in_the_landing_shell(self):
        """1.42.0 (Ray, 2026-09-11 12:32Z: "whats missing is floating push
        to home, that button you press and it get you to top i just forgot
        what it says"): components/custom/back-to-top.tsx is a client
        component, hidden at the top and shown past the threshold (one
        viewport height by default), fixed bottom right under the header's
        layers, named "Back to top", out of the tab order while hidden,
        smooth or instant under reduced motion, with a passive listener
        folded into one animation frame; the landing shell mounts it once
        after <main>, the manifest installs the two files and the version
        is bumped, the CHANGELOG quotes the ruling and the doc describes it."""
        manifest = load_manifest()
        self.assertGreaterEqual(tuple(int(p) for p in manifest["version"].split(".")), (1, 42, 0))
        installs = {e["from"]: e["to"] for e in manifest["installs"]}
        for src, dst in BACK_TO_TOP_INSTALLS.items():
            self.assertEqual(installs.get(src), dst, src)
            self.assertTrue(os.path.isfile(os.path.join(SDK_ROOT, src)), src)
        button = read(BACK_TO_TOP)
        self.assertTrue(button.lstrip().startswith("/*"), "licence header first")
        self.assertIn('"use client";', button)
        self.assertLess(button.index('"use client";'), button.index("import React"))
        self.assertIn('import { ArrowUp } from "lucide-react";', button)
        for needle in (
            "export function BackToTop({",
            "export interface BackToTopProps {",
            "  threshold?: number;",
            "  label?: string;",
            "  className?: string;",
            "label = BACK_TO_TOP_LABEL,",
            "const [visible, setVisible] = React.useState(false);",
            "setVisible(isPastThreshold(window.scrollY, resolveThreshold(threshold, window.innerHeight)));",
            "frame = window.requestAnimationFrame(check);",
            'window.addEventListener("scroll", onScroll, { passive: true });',
            'window.addEventListener("resize", onScroll, { passive: true });',
            'window.removeEventListener("scroll", onScroll);',
            "if (frame !== 0) window.cancelAnimationFrame(frame);",
            "window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;",
            "window.scrollTo({ top: 0, behavior: scrollBehaviour(reducedMotion) });",
            "event.currentTarget.blur();",
            '      type="button"',
            "      aria-label={label}",
            "      title={label}",
            "      aria-hidden={!visible}",
            "      tabIndex={visible ? 0 : -1}",
            '      data-back-to-top={visible ? "shown" : "hidden"}',
            '${visible ? "opacity-100" : "pointer-events-none opacity-0"}',
            '<ArrowUp className="h-5 w-5" aria-hidden="true" />',
            "export default BackToTop;",
        ):
            self.assertIn(needle, button, needle)
        # Fixed bottom right, under the header (z-50) and its mobile panel
        # (z-40), in theme tokens only.
        for token in (
            "fixed bottom-4 right-4 z-30", "md:bottom-6 md:right-6", "rounded-full",
            "border border-border bg-background text-primary", "hover:bg-muted",
            "focus-visible:ring-2 focus-visible:ring-ring", "motion-safe:transition-opacity",
        ):
            self.assertIn(token, button, token)
        header = read(HEADER)
        self.assertIn('className="sticky top-0 z-50 w-full"', header)
        self.assertIn("fixed inset-x-0 bottom-0 top-16 z-40", header)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", button))
        self.assertEqual(code.count("React.useEffect("), 1)
        self.assertNotIn("window", code.split("React.useEffect(")[0], "no window read at render")
        self.assertNotRegex(code, re.compile(r"#[0-9a-fA-F]{3,8}\b"), "no colour is named")
        rules = read(BACK_TO_TOP_RULES)
        for needle in (
            'export const BACK_TO_TOP_LABEL = "Back to top";',
            'export const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";',
            "export function resolveThreshold(threshold: number | undefined, viewportHeight: number): number {",
            "export function isPastThreshold(scrollY: number, threshold: number): boolean {",
            "return Number.isFinite(scrollY) && scrollY > threshold;",
            "export function scrollBehaviour(reducedMotion: boolean): ScrollBehavior {",
            'return reducedMotion ? "auto" : "smooth";',
        ):
            self.assertIn(needle, rules, needle)
        plain = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", rules + button)).lower()
        for word in ("rokct.ai", "supacharge", ".school", "https://", "document.", "localstorage", "window"):
            if word == "window":
                self.assertNotIn(word, LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", rules)).lower())
            else:
                self.assertNotIn(word, plain, word)
        # Mounted once by the landing shell, after <main>, inside the root.
        content = read(LANDING_CONTENT)
        self.assertIn('import { BackToTop } from "@/components/custom/back-to-top";', content)
        content_code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", content))
        self.assertEqual(content_code.count("<BackToTop />"), 1)
        self.assertLess(content.index("</main>"), content.index("<BackToTop />"))
        self.assertLess(content.index("<BackToTop />"), content.index("</HeroResultsContext.Provider>"))
        # The page that renders the shell is base's and untouched: a home
        # SDK reaches it through /landing, so both hosts have the button.
        page = read(os.path.join(SDK_ROOT, "templates", "app", "landing", "page.tsx"))
        self.assertIn("<LandingContent", page)
        doc = read(DOWNLOADS_DOC)
        self.assertIn("@/components/custom/back-to-top", doc)
        self.assertIn("prefers-reduced-motion", doc)
        self.assertIn("`tests/back-to-top.test.mts`", doc)
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("## 1.42.0", changelog)
        head = re.sub(r"\s+", " ", changelog.split("## 1.41.0", 1)[0])
        self.assertIn(
            "2026-09-11 12:32Z: \"whats missing is floating push to home, that button you press "
            "and it get you to top i just forgot what it says\"",
            head,
        )

    def test_back_to_top_rules_under_node(self):
        """The rules executed (tests/back-to-top.test.mts): the words, the
        threshold (configured, else one viewport height, else 0), strictly
        past it, and smooth or the instant jump."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute the back-to-top rules")
        with tempfile.TemporaryDirectory() as tmp:
            staged = read(BACK_TO_TOP_RULES)
            self.assertNotIn('from "@/', staged, "the rules import nothing the stage does not cover")
            with open(os.path.join(tmp, "back-to-top.ts"), "w", encoding="utf-8") as f:
                f.write(staged)
            shutil.copy(BACK_TO_TOP_TESTS, os.path.join(tmp, "back-to-top.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "back-to-top.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 11)

    def test_back_to_top_type_checks_under_tsc(self):
        """The component and its rules under tsc, strict and
        isolatedModules with `jsx: preserve`, against a stub of the react
        hooks and event it uses and of lucide-react's ArrowUp, with the
        `@/` import pointed at the stage. Skips when no tsc is reachable."""
        tsc = os.environ.get("ROKCT_TSC") or shutil.which("tsc")
        if not tsc or not os.path.exists(tsc):
            raise unittest.SkipTest("no tsc reachable (set ROKCT_TSC to a tsc binary)")
        stubs = """
declare namespace JSX {
  interface Element {}
  interface ElementChildrenAttribute { children: {} }
  interface IntrinsicElements { [name: string]: unknown }
}
declare module "react" {
  export interface MouseEvent<T = Element> { currentTarget: T }
  export function useState<S>(initial: S | (() => S)): [S, (next: S | ((prev: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  const React: { useState: typeof useState; useEffect: typeof useEffect };
  export default React;
}
declare module "lucide-react" {
  export function ArrowUp(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }): JSX.Element;
}
"""
        with tempfile.TemporaryDirectory() as tmp:
            button = read(BACK_TO_TOP).replace(
                'from "@/components/custom/landing/back-to-top"', 'from "./back-to-top"'
            )
            self.assertNotIn('from "@/', button, "the component imports something the stage does not cover")
            with open(os.path.join(tmp, "back-to-top.tsx"), "w", encoding="utf-8") as f:
                f.write(button)
            shutil.copy(BACK_TO_TOP_RULES, os.path.join(tmp, "back-to-top.ts"))
            with open(os.path.join(tmp, "stubs.d.ts"), "w", encoding="utf-8") as f:
                f.write(stubs)
            config = dict(TSC_THEME_STAGE_CONFIG, include=["*.tsx", "*.ts", "*.d.ts"])
            with open(os.path.join(tmp, "tsconfig.json"), "w", encoding="utf-8") as f:
                json.dump(config, f)
            run = subprocess.run(
                [tsc, "-p", tmp], capture_output=True, text=True, timeout=300, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)


    # -- 1.45.0: the public terms list falls back to bundled data/legal ------

    def test_legal_list_falls_back_to_bundled_site_data(self):
        """1.45.0: a backend's guest read answers nothing on a shell that
        has published no document, while the shell may carry its own
        `data/legal/<slug>.md` (the 1.35.0 kind). listPublicTerms() asks the
        backend first and returns its rows whenever it publishes any; on
        nothing (null, an empty list, a failed call) it answers the bundled
        pages through the generated module - `hasSiteData("legal")` first,
        so backend mode and a missing folder are unchanged - each as the
        same {name: slug, title, disabled: false} a gateway row becomes, in
        slug order, and never throws for a guest. The manifest is bumped
        and notes it; the CHANGELOG and docs/site-data.md describe it."""
        manifest = load_manifest()
        self.assertGreaterEqual(tuple(int(p) for p in manifest["version"].split(".")), (1, 45, 0))
        src = read(LEGAL_ACTION)
        for needle in (
            'import { hasSiteData, readSiteData } from "@/lib/site-data/read-site-data";',
            "function bundledPublicTerms(): PublicTerm[] {",
            'if (!hasSiteData("legal")) return [];',
            'const docs = readSiteData("legal") ?? {};',
            "return normalisePublicTerms(",
            "Object.keys(docs)",
            ".sort()",
            ".map((slug) => ({ name: slug, title: docs[slug].title, disabled: 0 })),",
            "const published = normalisePublicTerms(rows);",
            "if (published.length > 0) return published;",
            "return bundledPublicTerms();",
        ):
            self.assertIn(needle, src, needle)
        code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", src))
        # The backend is asked before the bundle, its rows win, and both
        # branches of the soft-fail (nothing, a throw) reach the bundle.
        self.assertLess(code.index('"frappe.client.get_list",'), code.index("if (published.length > 0) return published;"))
        self.assertEqual(code.count("return bundledPublicTerms();"), 2)
        self.assertLess(code.index("if (published.length > 0) return published;"), code.index("return bundledPublicTerms();"))
        self.assertLess(code.index("} catch (e) {\n    console.error(\"[legal] terms list failed:\", e);"),
                        code.rindex("return bundledPublicTerms();"))
        # Never the disk at request time: the reader is the generated module's.
        for word in ("node:fs", "readFileSync", "process.cwd", "https://"):
            self.assertNotIn(word, code, word)
        # Only the one async export; the helper stays private to the module.
        self.assertNotIn("export function bundledPublicTerms", src)
        installs = {e["from"]: e["to"] for e in manifest["installs"]}
        self.assertEqual(installs.get(LEGAL_ACTION_INSTALL[0]), LEGAL_ACTION_INSTALL[1])
        self.assertEqual(installs.get("templates/lib/site-data/read-site-data.ts"), "lib/site-data/read-site-data.ts")
        about = manifest["_comment"]["about"]
        for text in ("Since 1.45.0 listPublicTerms() falls back to the shell's own data/legal/<slug>.md pages",
                     'hasSiteData("legal")', "{name: slug, title, disabled: false}",
                     "the backend wins whenever it publishes a row", "tests/legal-fallback.test.mts"):
            self.assertIn(text, about, text)
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("## 1.45.0", changelog)
        head = re.sub(r"\s+", " ", changelog.split("## 1.45.0", 1)[1].split("\n## ", 1)[0])
        for text in ("`listPublicTerms()`", "`hasSiteData(\"legal\")`", "`{name: slug, title, disabled: false}`",
                     "`lib/site-data/generated.ts`", "never the disk at request time",
                     "The two lists are never merged", "`prebuild`", "`tests/legal-fallback.test.mts`"):
            self.assertIn(text, head, text)
        for line in changelog.split("## 1.42.0", 1)[0].splitlines():
            if line.startswith("#") and line != "# Changelog":
                self.assertRegex(line, r"^## \d+\.\d+\.\d+$", line)
        doc = read(SITE_DATA_DOC)
        for text in ("`legal` is also what the public terms list falls back to (since 1.45.0)",
                     "`listPublicTerms()` (`app/actions/base/legal.ts`)", "`hasSiteData(\"legal\")`",
                     "`{ name: slug, title, disabled: false }`", "The two lists are never merged",
                     "`prebuild` generate step", "`local` or `hybrid`"):
            self.assertIn(text, doc, text)
        for path in (LEGAL_ACTION, LEGAL_FALLBACK_TESTS):
            text = read(path).lower()
            for word in ("rokct.ai", "supacharge", "south river", "demo", "sample", "lorem"):
                self.assertNotIn(word, text, f"{os.path.basename(path)} carries {word}")

    def test_legal_fallback_behaviour_under_node(self):
        """tests/legal-fallback.test.mts, run in place: the real action
        staged beside the real legal-links.ts, kinds.ts and read-site-data.ts,
        a stub gateway and a generated.ts the real generator writes from
        tests/fixtures/site-data/acme - null, [] and a throw answer the two
        fixture pages in the public shape, rows are returned unchanged, and
        the neutral module or a data/ with no legal folder answers []."""
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute the legal fallback")
        self.assertTrue(os.path.isdir(SITE_DATA_FIXTURE))
        run = subprocess.run(
            [node, "--experimental-strip-types", "--no-warnings", "--test", LEGAL_FALLBACK_TESTS],
            capture_output=True, text=True, timeout=180, cwd=HERE,
        )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 10)

    def test_legal_action_type_checks_under_tsc(self):
        """The action under tsc, strict and isolatedModules, beside the real
        legal-links.ts, footer-chrome-config.ts, kinds.ts, read-site-data.ts
        and the neutral generated.ts, with a typed stub of the gateway and
        the `@/` imports pointed at the stage. Skips when no tsc is reachable."""
        tsc = os.environ.get("ROKCT_TSC") or shutil.which("tsc")
        if not tsc or not os.path.exists(tsc):
            raise unittest.SkipTest("no tsc reachable (set ROKCT_TSC to a tsc binary)")
        stubs = """
declare const process: { env: Record<string, string | undefined> };
declare module "server-only" {}
declare module "@/components/custom/landing/brand-marks" {
  export type BrandMarkId = string;
}
"""
        gateway = (
            "export interface PlatformCallOptions { requireAuth?: boolean; throwOnError?: boolean }\n"
            "export async function platformCall<T = unknown>(\n"
            "  cmd: string, payload?: Record<string, unknown> | string, options: PlatformCallOptions = {},\n"
            "): Promise<T | null> { void cmd; void payload; void options; return null; }\n"
        )
        rewrites = {
            'from "@/app/services/base/platform-gateway"': 'from "./platform-gateway"',
            'from "@/components/custom/landing/legal-links"': 'from "./legal-links"',
            'from "@/lib/site-data/read-site-data"': 'from "./read-site-data"',
            'from "@/components/custom/landing/footer-chrome-config"': 'from "./footer-chrome-config"',
        }
        real = {
            "legal.ts": LEGAL_ACTION,
            "legal-links.ts": LEGAL_LINKS,
            "footer-chrome-config.ts": FOOTER_CHROME_CONFIG,
            "kinds.ts": os.path.join(SITE_DATA_DIR, "kinds.ts"),
            "read-site-data.ts": os.path.join(SITE_DATA_DIR, "read-site-data.ts"),
            "generated.ts": os.path.join(SITE_DATA_DIR, "generated.ts"),
        }
        with tempfile.TemporaryDirectory() as tmp:
            for fname, path in real.items():
                staged = read(path)
                for src, dst in rewrites.items():
                    staged = staged.replace(src, dst)
                code = LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", staged))
                self.assertNotIn('from "@/components/custom/landing/legal', code, f"{fname} imports something the stage does not cover")
                with open(os.path.join(tmp, fname), "w", encoding="utf-8") as f:
                    f.write(staged)
            with open(os.path.join(tmp, "platform-gateway.ts"), "w", encoding="utf-8") as f:
                f.write(gateway)
            with open(os.path.join(tmp, "stubs.d.ts"), "w", encoding="utf-8") as f:
                f.write(stubs)
            config = dict(TSC_STAGE_CONFIG, include=["*.ts", "*.d.ts"])
            with open(os.path.join(tmp, "tsconfig.json"), "w", encoding="utf-8") as f:
                json.dump(config, f)
            run = subprocess.run(
                [tsc, "-p", tmp], capture_output=True, text=True, timeout=300, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)

if __name__ == "__main__":
    unittest.main()
