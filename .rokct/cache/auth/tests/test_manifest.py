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

"""Contract tests for auth/nextjs's manifest, its registries and the
tenant-host switch (auth_sdk 1.7.0), in base/nextjs's style.

Run from the repository root:

    python3 -m unittest discover -s auth/nextjs/tests -v

Stdlib only. The behaviour tests are node's own (tests/*.test.mts), run
here against staged copies of the pure modules under
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

MARKER_RE = re.compile(r"^\s*// @rokct-sdk-([a-z0-9-]+?)-(start|end)\s*$", re.M)

# The one-marker registries this SDK carries: file -> marker name.
REGISTRIES = {
    os.path.join(AUTH_GROUP, "tenant-link.ts"): "tenant-link",
    os.path.join(TEMPLATES, "components", "custom", "auth", "register-registry.ts"): "register",
    os.path.join(AUTH_GROUP, "register-provision.ts"): "register-provision",
}

# The pure modules the node suites run against, staged into one directory.
STAGED = {
    "tenant-host.ts": os.path.join(AUTH_GROUP, "tenant-host.ts"),
    "register-registry.ts": os.path.join(TEMPLATES, "components", "custom", "auth", "register-registry.ts"),
    "register-provision.ts": os.path.join(AUTH_GROUP, "register-provision.ts"),
    "register-link.ts": os.path.join(AUTH_GROUP, "register-link.ts"),
    "tenant-link.ts": os.path.join(AUTH_GROUP, "tenant-link.ts"),
}
NODE_SUITES = ["tenant-host.test.mts", "register-registry.test.mts", "register-link.test.mts"]

# Words no fixture, copy or comment of this SDK's new files may carry.
FORBIDDEN_WORDS = re.compile(r"\b(lorem|sample|demo)\b", re.I)
NEW_FILES = [
    os.path.join(AUTH_GROUP, "tenant-host.ts"),
    os.path.join(AUTH_GROUP, "register-provision.ts"),
    os.path.join(AUTH_GROUP, "register-provision-default.ts"),
    os.path.join(AUTH_GROUP, "register-link.ts"),
    os.path.join(AUTH_GROUP, "register", "page.tsx"),
    os.path.join(AUTH_GROUP, "register", "register-view.tsx"),
    os.path.join(AUTH_GROUP, "login", "page.tsx"),
    os.path.join(TEMPLATES, "components", "custom", "auth", "register-registry.ts"),
    os.path.join(TEMPLATES, "components", "custom", "auth-form.tsx"),
    os.path.join(TEMPLATES, "middleware.ts"),
    os.path.join(SDK_ROOT, "README.md"),
]


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
        self.assertEqual(self.manifest["name"], "auth_sdk")
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

    def test_register_registry_is_installed(self):
        by_from = {e["from"]: e["to"] for e in self.manifest["installs"]}
        self.assertEqual(
            by_from.get("templates/components/custom/auth/register-registry.ts"),
            "components/custom/auth/register-registry.ts",
        )
        # The provisioner registry and the switch travel with the route group.
        self.assertEqual(by_from.get("templates/app/(auth)"), "app/(auth)")
        for fname in ("register-provision.ts", "register-provision-default.ts", "tenant-host.ts"):
            self.assertTrue(os.path.exists(os.path.join(AUTH_GROUP, fname)), fname)

    def test_base_kernel_modules_are_declared_prerequisites(self):
        for req in (
            "app/services/base/platform-gateway.ts",
            "app/services/base/tenant-hosts.ts",
            "app/services/base/tenant-host-control.ts",
        ):
            self.assertIn(req, self.manifest["requires"])
        self.assertIn("base_sdk >= 1.20.0", self.manifest["_comment"])

    def test_changelog_leads_with_the_manifest_version(self):
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        heads = re.findall(r"^## (\d+\.\d+\.\d+)$", changelog, re.M)
        self.assertTrue(heads, "CHANGELOG.md has no version heading")
        self.assertEqual(heads[0], self.manifest["version"])

    def test_readme_documents_both_register_markers(self):
        readme = read(os.path.join(SDK_ROOT, "README.md"))
        self.assertIn("// @rokct-sdk-register-start", readme)
        self.assertIn("// @rokct-sdk-register-provision-start", readme)
        self.assertIn("x-rokct-tenant-site", readme)
        self.assertIn("api.user.register_user", readme)

    def test_new_files_carry_no_placeholder_words(self):
        for path in NEW_FILES:
            with self.subTest(file=os.path.relpath(path, SDK_ROOT)):
                self.assertIsNone(FORBIDDEN_WORDS.search(read(path)))


class TestRegistryMarkers(unittest.TestCase):
    def test_each_registry_has_exactly_one_marker_pair(self):
        for path, name in REGISTRIES.items():
            with self.subTest(registry=os.path.relpath(path, SDK_ROOT)):
                found = MARKER_RE.findall(read(path))
                self.assertEqual(found, [(name, "start"), (name, "end")])

    def test_markers_sit_inside_the_array_literals(self):
        for path, name in REGISTRIES.items():
            src = read(path)
            start = src.index(f"// @rokct-sdk-{name}-start")
            end = src.index(f"// @rokct-sdk-{name}-end")
            opened = src.rindex("] = [", 0, start)
            closed = src.index("];", end)
            self.assertLess(opened, start)
            self.assertLess(start, end)
            self.assertLess(end, closed)

    def test_register_config_registry_is_client_safe(self):
        # Data and thunks only: a client component imports it.
        src = read(os.path.join(TEMPLATES, "components", "custom", "auth", "register-registry.ts"))
        imports = re.findall(r"^import (type )?.* from \"([^\"]+)\";$", src, re.M)
        self.assertEqual(imports, [("type ", "react")])
        self.assertIn("export const DEFAULT_REGISTER_CONFIG", src)
        for name in ("enabled?: boolean;", "copy?: RegisterCopy;", "fields?: RegisterField[];", "steps?: RegisterStep[];"):
            self.assertIn(name, src)
        self.assertIn("fromQuery?: string;", src)
        self.assertIn("loadOptions?: () => Promise<RegisterFieldOption[]>;", src)
        self.assertIn("skippable?: boolean;", src)

    def test_register_provisioner_contract(self):
        src = read(os.path.join(AUTH_GROUP, "register-provision.ts"))
        self.assertIn("provision(submission: RegisterSubmission): Promise<RegisterOutcome>;", src)
        self.assertIn('import("./register-provision-default")', src)
        default = read(os.path.join(AUTH_GROUP, "register-provision-default.ts"))
        self.assertIn('export const REGISTER_USER_CMD = "api.user.register_user";', default)
        self.assertIn("requireAuth: false", default)
        # Never the control site.
        self.assertIn("sameSite(baseUrl, control)", default)
        self.assertNotIn("control:", default)


class TestRegisterMovedOut(unittest.TestCase):
    """What auth_sdk 1.7.0 no longer carries inline."""

    def test_actions_carry_no_product_provisioning(self):
        src = read(os.path.join(AUTH_GROUP, "actions.ts"))
        for gone in (
            "control:provision_service_subscription",
            "control:provision_new_tenant",
            "get_pricing_metadata",
            "getSubscriptionPlans",
            "export async function getIndustries",
            "adminCredentials",
            "voucher_code",
            "is_service_plan",
        ):
            self.assertNotIn(gone, src, f"actions.ts still carries {gone}")
        self.assertIn("loadRegisterProvisioner()", src)
        self.assertIn("(await headers()).get(TENANT_SITE_HEADER)", src)

    def test_auth_form_carries_the_account_fields_only(self):
        src = read(os.path.join(TEMPLATES, "components", "custom", "auth-form.tsx"))
        for gone in ('name="plan"', 'name="industry"', 'name="company_name"', 'name="country"',
                     'name="voucher_code"', 'name="domain"', "is_service_plan", "VOUCHER_OFFSET_Y"):
            self.assertNotIn(gone, src, f"auth-form.tsx still carries {gone}")
        for kept in ('name="first_name"', 'name="last_name"', 'name="email"', 'name="password"'):
            self.assertIn(kept, src)
        self.assertIn("extraFields.map((field) => (", src)

    def test_register_page_redirects_when_not_offered(self):
        page = read(os.path.join(AUTH_GROUP, "register", "page.tsx"))
        self.assertIn("const config = await loadRegisterConfig();", page)
        self.assertIn("if (!config.enabled) redirect(TENANT_LOGIN_PATH);", page)
        self.assertIn('from "@/app/(auth)/tenant-host"', page)
        view = read(os.path.join(AUTH_GROUP, "register", "register-view.tsx"))
        self.assertIn("function StepRunner(", view)
        self.assertIn("{copy.cta}", view)


class TestRegisterLocalLinkKept(unittest.TestCase):
    """What auth_sdk 1.7.0 still carries: the local user row (Ray,
    2026-09-08 - the local store is the multi-tenancy feature; slimming it
    is a per-shell switch, never a deletion)."""

    def test_register_links_the_account_locally_after_any_provisioner(self):
        src = read(os.path.join(AUTH_GROUP, "actions.ts"))
        self.assertIn('import { linkRegisteredAccount } from "./register-link";', src)
        self.assertIn('import { loadTenantLink } from "./tenant-link";', src)
        # Invoked in auth's own flow: after the provisioner's success is
        # known, before the auto-login, with the shell's tenant link.
        write = src.index("await linkRegisteredAccount(")
        self.assertLess(src.index('if (outcome.status !== "success")'), write)
        self.assertLess(write, src.index('await signIn("credentials", {', write))
        self.assertIn("loadTenantLink,\n    );", src[write:])
        # The provisioner contract and the default provisioner know nothing
        # of a local store.
        for fname in ("register-provision.ts", "register-provision-default.ts"):
            for gone in ("tenant-link", "linkRegistration", "@/db"):
                self.assertNotIn(gone, read(os.path.join(AUTH_GROUP, fname)), f"{fname} carries {gone}")
        # The default link still creates the row that a login only updates.
        db = read(os.path.join(AUTH_GROUP, "tenant-link-database.ts"))
        self.assertIn("db.insert(user).values({", db)
        self.assertIn("siteName: registration.siteName,", db)
        self.assertIn('database: () => import("./tenant-link-database"),', read(os.path.join(AUTH_GROUP, "tenant-link.ts")))


class TestTenantHostSwitch(unittest.TestCase):
    def test_middleware_contract(self):
        src = read(os.path.join(TEMPLATES, "middleware.ts"))
        self.assertIn("resolveTenantSiteForRequest(request.headers)", src)
        self.assertIn("headers.set(TENANT_SITE_HEADER, site);", src)
        # Nothing resolved: today's behaviour, verbatim.
        self.assertLess(src.index("if (!site) {"), src.index("return withAuth(request, event);"))
        # The gate runs first on a tenant host; only its pass-through is reshaped.
        self.assertIn("if (!gated || !isPassThrough(gated)) return gated;", src)
        self.assertIn("NextResponse.rewrite(url, { request: { headers } })", src)
        self.assertIn("NextResponse.redirect(new URL(decision.to, request.nextUrl))", src)
        self.assertIn("NextResponse.next({ request: { headers } })", src)
        self.assertIn("gated.headers.getSetCookie()", src)
        # The matcher is unchanged from 1.6.0 (and / is in it).
        matcher = src[src.index("matcher: ["):]
        for path in ('"/"', '"/:id"', '"/api/:path*"', '"/login"', '"/register"', '"/handson/:path*"'):
            self.assertIn(path, matcher)

    def test_login_route_switches_on_the_site(self):
        page = read(os.path.join(AUTH_GROUP, "login", "page.tsx"))
        self.assertIn("(await headers()).get(TENANT_SITE_HEADER)", page)
        self.assertIn("params.site_name", page)
        self.assertLess(page.index("if (tenantSite) return <PaaSLogin tenantSite={tenantSite} />;"),
                        page.index("return <LoginView />;"))
        view = read(os.path.join(AUTH_GROUP, "login", "login-view.tsx"))
        self.assertIn('"use client";', view)
        self.assertIn("export function LoginView() {", view)
        paas = read(os.path.join(TEMPLATES, "components", "custom", "paas-login.tsx"))
        self.assertIn('searchParams.get("site_name") || tenantSite || null', paas)
        self.assertIn('formData.append("site_name", siteName);', paas)
        # The portal login signs in against the named site and nowhere else.
        auth = read(os.path.join(AUTH_GROUP, "auth.ts"))
        self.assertIn("`https://${siteName}`", auth)

    def test_switch_behaviour_under_node(self):
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute the switch")
        with tempfile.TemporaryDirectory() as tmp:
            for name, path in STAGED.items():
                shutil.copy(path, os.path.join(tmp, name))
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
