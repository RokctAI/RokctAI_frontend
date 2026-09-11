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

"""Static contract tests for gateways/nextjs's gateway calls.

Run from the repository root:

    python3 -m unittest discover -s gateways/nextjs/tests -v

frappe-js-sdk's `call()` takes NO arguments: `client.call({ method, args })`
drops the object, sends nothing and resolves to a `FrappeCall` handle, so a
surface built on it is silently empty (gateways_sdk 1.1.1). Every
template call must go through the gateway helpers instead (`gatewayCall`,
`platformCall` / `paasCall`, `BaseService.call`), with the `frappe.client.*`
cmd passed verbatim and never as a dotted `/api/method/<name>` URL. Stdlib
only.
"""

import json
import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
MANIFEST = os.path.join(SDK_ROOT, "manifest.json")
CHANGELOG = os.path.join(SDK_ROOT, "CHANGELOG.md")
TEMPLATES = os.path.join(SDK_ROOT, "templates")

# The dead shapes, matched across line breaks: an object literal handed to
# `.call(`, the bare `frappe.call(` and the `(x as any).call(` cast.
DEAD_CALL_RES = (
    re.compile(r"\.call\(\s*\{"),
    re.compile(r"\bfrappe\.call\("),
    re.compile(r"as any\)\.call\("),
)
# A dotted whitelisted-method URL built by hand.
METHOD_URL_RE = re.compile(r"/api/(?:v1/)?method/[A-Za-z0-9_]+\.[A-Za-z0-9_.]+")

# The sites this release converted, each with the helper it must use now
# and the import that had to go with the dead call.
CONVERTED = {
    "templates/app/actions/gateways/admin/finance.ts": (
        'paasCall("frappe.client.get_list"',
        "getPaaSClient",
    )
}


def template_sources():
    for base, _dirs, files in os.walk(TEMPLATES):
        for name in sorted(files):
            if name.endswith((".ts", ".tsx")):
                path = os.path.join(base, name)
                with open(path, encoding="utf-8") as fh:
                    yield os.path.relpath(path, SDK_ROOT), fh.read()


def line_of(source, index):
    return source.count("\n", 0, index) + 1


class DeadCallSweep(unittest.TestCase):
    def test_templates_exist(self):
        self.assertTrue(os.path.isdir(TEMPLATES), TEMPLATES)
        self.assertTrue(any(True for _ in template_sources()))

    def test_no_object_argument_call_remains(self):
        hits = []
        for rel, source in template_sources():
            for pattern in DEAD_CALL_RES:
                for match in pattern.finditer(source):
                    hits.append(
                        f"{rel}:{line_of(source, match.start())}: {match.group(0)!r}"
                    )
        self.assertEqual(
            hits,
            [],
            "frappe-js-sdk call() takes no arguments; route through the gateway:\n"
            + "\n".join(hits),
        )

    def test_no_dotted_method_url(self):
        hits = []
        for rel, source in template_sources():
            for match in METHOD_URL_RE.finditer(source):
                hits.append(f"{rel}:{line_of(source, match.start())}: {match.group(0)}")
        self.assertEqual(
            hits,
            [],
            "cmds go through the gateway verbatim, never as a /api/method URL:\n"
            + "\n".join(hits),
        )

    def test_converted_sites_use_the_gateway(self):
        for rel, (helper, gone) in CONVERTED.items():
            path = os.path.join(SDK_ROOT, rel)
            self.assertTrue(os.path.isfile(path), path)
            with open(path, encoding="utf-8") as fh:
                source = fh.read()
            self.assertIn(helper, source, f"{rel} must call through {helper}")
            self.assertNotIn(gone, source, f"{rel} no longer needs {gone}")


class ReleaseContract(unittest.TestCase):
    def test_manifest_version_matches_changelog(self):
        with open(MANIFEST, encoding="utf-8") as fh:
            manifest = json.load(fh)
        self.assertEqual(manifest["name"], "gateways_sdk")
        with open(CHANGELOG, encoding="utf-8") as fh:
            top = next(line for line in fh if line.startswith("## "))
        self.assertEqual(top.strip(), f"## {manifest['version']}")
        self.assertEqual(manifest["version"], "1.1.1")


if __name__ == "__main__":
    unittest.main()
