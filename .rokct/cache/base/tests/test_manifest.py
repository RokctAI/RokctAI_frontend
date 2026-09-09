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
SITE_METADATA_LIB = os.path.join(SDK_ROOT, "templates", "app", "lib", "site-metadata.ts")
SITE_METADATA_ICONS_TESTS = os.path.join(HERE, "site-metadata-icons.test.mts")
HEADER_MENU_REGISTRY = os.path.join(LANDING, "header-menu.ts")
HEADER = os.path.join(SDK_ROOT, "templates", "components", "custom", "header.tsx")
HEADER_BRAND_TESTS = os.path.join(HERE, "header-brand.test.mts")

# base_sdk 1.23.0: the network strip - the other sites of the Rokct network
# under "Trusted by", on every shell minus itself.
NETWORK_SITES = os.path.join(LANDING, "network-sites.ts")
NETWORK_STRIP_REGISTRY = os.path.join(LANDING, "network-strip.ts")
NETWORK_STRIP = os.path.join(SDK_ROOT, "templates", "components", "custom", "network-strip.tsx")
FOOTER_CHROME = os.path.join(SDK_ROOT, "templates", "components", "custom", "footer-chrome.tsx")
LANDING_CONTENT = os.path.join(SDK_ROOT, "templates", "components", "custom", "landing-content.tsx")
NETWORK_STRIP_TESTS = os.path.join(HERE, "network-strip.test.mts")

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
        for env in ("ROKCT_TENANT_HOST_TTL_MS", "ROKCT_TENANT_HOST_NEGATIVE_TTL_MS",
                    "ROKCT_TENANT_HOST_TIMEOUT_MS", "ROKCT_TENANT_HOST_LOOKUP",
                    "NEXT_PUBLIC_SITE_URL"):
            self.assertIn(f"'{env}'", src, f"{env} is not read")
        self.assertIn("export async function resolveTenantSiteForRequest(", src)
        self.assertIn("export async function resolveTenantSiteByHost(", src)
        self.assertIn("export function registerControlTenantHostResolver(): boolean", src)
        self.assertIn("if (!isPublicHost(name)) return null;", src)
        # Edge-safe: only the pure kernel modules, no session, no next/headers.
        imports = re.findall(r"^(?:import .*|\}) from '([^']+)';$", src, re.M)
        self.assertEqual(sorted(set(imports)), ["./gateway-constants", "./telemetry", "./tenant-hosts"])
        self.assertNotIn("next/headers", src)
        self.assertNotIn("./session", src)
        self.assertNotIn("Authorization", src)
        # The gateway registers it at load, so resolveTenantBaseUrl's
        # per-host step keeps working with no host wiring.
        gateway = read(os.path.join(KERNEL, "platform-gateway.ts"))
        self.assertIn("import { registerControlTenantHostResolver } from './tenant-host-control';", gateway)
        self.assertIn("\nregisterControlTenantHostResolver();\n", gateway)
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
        self.assertGreaterEqual(int(passed.group(1)), 16)

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
        both shells already import from their root layout, the template is
        a client wrapper over next-themes whose `defaultTheme` falls back to
        "dark" and whose `attribute` falls back to "class" (Tailwind's
        darkMode signal), next-themes is a declared dependency, and the
        host layout note states the contract."""
        installs = {e["from"]: e["to"] for e in self.manifest["installs"]}
        self.assertEqual(
            installs.get("templates/components/custom/theme-provider.tsx"),
            THEME_PROVIDER_TARGET,
        )
        self.assertNotIn(THEME_PROVIDER_TARGET, self.manifest["requires"])
        self.assertIn("next-themes", self.manifest["dependencies"])

        src = read(THEME_PROVIDER_TEMPLATE)
        self.assertRegex(src, re.compile(r'^"use client";$', re.M), "the provider must be a client component")
        self.assertRegex(src, re.compile(r'^export const DEFAULT_THEME = "dark";$', re.M))
        self.assertRegex(src, re.compile(r'^export const THEME_ATTRIBUTE = "class";$', re.M))
        self.assertRegex(src, r"\bdefaultTheme = DEFAULT_THEME\b", "defaultTheme must fall back to DEFAULT_THEME")
        self.assertRegex(src, r"\battribute = THEME_ATTRIBUTE\b", "attribute must fall back to THEME_ATTRIBUTE")
        self.assertNotRegex(src, r'defaultTheme = "(light|system)"')
        self.assertNotRegex(src, r'defaultTheme="(light|system)"')
        self.assertIn('from "next-themes";', src)
        self.assertNotIn("next-themes/dist/types", src, "0.4.x exports the props type from the package root")
        self.assertIn("export default ThemeProvider;", src)

        note = self.manifest["_comment"].get("app/layout.tsx", "")
        self.assertIn("theme-provider", note)
        self.assertIn("dark", note)

    def test_theme_provider_type_checks_under_tsc(self):
        """The staged template under tsc, strict and isolatedModules with
        `jsx: preserve`, against next-themes 0.4.x's prop shape: the
        destructured defaults must fit `ThemeProviderProps` (an `attribute`
        that is not an Attribute, or a props type imported from a path the
        package does not export, fails here the way a shell build would).
        Skips when no tsc is reachable."""
        tsc = os.environ.get("ROKCT_TSC") or shutil.which("tsc")
        if not tsc or not os.path.exists(tsc):
            raise unittest.SkipTest("no tsc reachable (set ROKCT_TSC to a tsc binary)")
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(THEME_PROVIDER_TEMPLATE, os.path.join(tmp, "theme-provider.tsx"))
            with open(os.path.join(tmp, "stubs.d.ts"), "w", encoding="utf-8") as f:
                f.write(TSC_THEME_STAGE_STUBS)
            with open(os.path.join(tmp, "tsconfig.json"), "w", encoding="utf-8") as f:
                json.dump(TSC_THEME_STAGE_CONFIG, f)
            run = subprocess.run(
                [tsc, "-p", tmp], capture_output=True, text=True, timeout=300, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)


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
            )
            self.assertNotIn('from "@/', staged, "header-menu.ts imports something the stage does not cover")
            with open(os.path.join(tmp, "header-menu.ts"), "w", encoding="utf-8") as f:
                f.write(staged)
            with open(os.path.join(tmp, "landing-config.ts"), "w", encoding="utf-8") as f:
                f.write("export type LandingNavBadge = 'new' | 'soon';\n"
                        "export interface LandingNavItem { id: string; label: string; badge?: LandingNavBadge }\n")
            with open(os.path.join(tmp, "landing-site-metadata.ts"), "w", encoding="utf-8") as f:
                f.write(
                    "let icon: string | undefined;\n"
                    "export function setRegisteredIcon(value: string | undefined) { icon = value; }\n"
                    "export async function loadSiteMetadata() {\n"
                    '  return { title: "Shell", siteName: "Shell", description: "", tagline: "", icon };\n'
                    "}\n"
                )
            shutil.copy(HEADER_BRAND_TESTS, os.path.join(tmp, "header-brand.test.mts"))
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
        self.assertIn("{groups.length > 0 && <DesktopMegaMenu groups={groups} />}", partials)
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
        self.assertIn('className="h-5 w-5 shrink-0 object-contain"', img)
        # Before the label, after the glyph slot, and never both at once.
        self.assertLess(actions.index("{Icon && <Icon"), actions.index("{image && ("))
        self.assertLess(actions.index("{image && ("), actions.index("<span>{action.label}</span>"))
        # A plain <img>, as the header draws a declared brand image; no
        # next/image, no CDN, no dark-mode filter (the mark is multi-colour).
        self.assertNotIn("next/image", partials)
        self.assertNotIn("invert", partials)
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

    # Hosts a base default may name: the network's own sites, the licence,
    # the social origins the admin settings page links, and the hosts the
    # documentation comments use as examples of a tenant or a site.
    FIRST_PARTY_HOSTS = {
        "rokct.ai", "supacharge.app", "juvo.app", "www.gnu.org",
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
        # The hero draws only a badge with an icon, and knows the chrome glyph.
        hero = read(os.path.join(SDK_ROOT, "templates", "components", "custom", "hero.tsx"))
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
            "export type NetworkStripLandingPlacement = \"afterHero\" | \"beforeFooter\" | \"none\";",
            "export const NETWORK_STRIP: NetworkStripEntry[]",
            "export function resolveNetworkStrip(",
            "export function networkStripRendersAt(",
            "export async function loadNetworkStrip(): Promise<NetworkStripConfig | null>",
            'export const DEFAULT_NETWORK_STRIP_HEADING = "Trusted by";',
        ):
            self.assertIn(needle, src)
        # Footer on and landing off with nothing registered.
        self.assertRegex(src, re.compile(r'landing:\s*"none",\s*footer:\s*true', re.S))

    def test_network_sites_list_shape(self):
        src = read(NETWORK_SITES)
        self.assertIn("export const NETWORK_SITES: readonly NetworkSite[]", src)
        for origin in ("https://rokct.ai", "https://supacharge.app", "https://juvo.app"):
            self.assertIn(f'url: "{origin}"', src)
        for pending in ("hosting", "telephony"):
            self.assertRegex(src, re.compile(rf'key: "{pending}".*?url: null.*?shown: false', re.S), pending)
        # The same host normalisation as resolveDisplayHost: the kernel's.
        self.assertIn('import { normaliseHost } from "@/app/services/base/tenant-hosts";', src)
        self.assertIn("export function resolveNetworkSites(", src)
        self.assertIn("export function networkSiteHost(", src)

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
        self.assertGreaterEqual(int(passed.group(1)), 18)


if __name__ == "__main__":
    unittest.main()
