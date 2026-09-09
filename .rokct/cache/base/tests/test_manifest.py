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


if __name__ == "__main__":
    unittest.main()
