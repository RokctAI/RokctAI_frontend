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

"""Static contract tests for merchants/nextjs: every platform call goes out
through the base kernel's gateway, never through the frappe-js-sdk client.

Run from the repository root:

    python3 -m unittest discover -s merchants/nextjs/tests -v

frappe-js-sdk's `call()` takes NO arguments, so a template that wrote
`await frappe.call({ method, args })` on `getPaaSClient()` sent nothing
and resolved to a `FrappeCall` object - the surface was silently empty
(merchants_sdk 1.1.1). The one thing that must never come back is that shape:
the templates reach the platform with `paasCall(cmd, args)` /
`platformCall(cmd, payload, options)` from
`@/app/services/base/platform-gateway` (installed by base_sdk), the cmd
verbatim (`frappe.client.*` included) and never a dotted
`/api/method/<name>` URL. Stdlib only.
"""

import json
import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
MANIFEST = os.path.join(SDK_ROOT, "manifest.json")
TEMPLATES = os.path.join(SDK_ROOT, "templates")

GATEWAY = "@/app/services/base/platform-gateway"
SDK_CLIENT = "@/app/lib/client"

# `.call({ ... })` - an object argument to a `call` member, the
# frappe-js-sdk shape (multi-line aware: the brace may sit on the next line).
OBJECT_ARG_CALL = re.compile(r"\.call\(\s*\{", re.S)
# `frappe.call(` in any form, and the cast that hides it from the compiler.
SDK_CLIENT_CALL = re.compile(r"\bfrappe\.call\(")
ANY_CAST_CALL = re.compile(r"as any\)\s*\.call\(")
# A dotted Frappe method name hard-wired into a REST URL.
DOTTED_METHOD_URL = re.compile(r"/api/method/[A-Za-z0-9_]+\.[A-Za-z0-9_.]+")

# The sites merchants_sdk 1.1.1 converted: host path -> the verbatim cmd each
# now hands to paasCall.
CONVERTED = {
    "app/actions/merchants/invites.ts": "frappe.client.set_value",
    "app/actions/merchants/shop.ts": "frappe.client.get_list",
    "app/actions/merchants/staff.ts": "frappe.client.get_list",
}


def template_sources():
    """Every .ts/.tsx template, as (relative path, text)."""
    found = []
    for root, _dirs, files in os.walk(TEMPLATES):
        for name in sorted(files):
            if not name.endswith((".ts", ".tsx")):
                continue
            path = os.path.join(root, name)
            with open(path, encoding="utf-8") as handle:
                found.append((os.path.relpath(path, TEMPLATES), handle.read()))
    return found


def offenders(pattern):
    """(relative path, line) for every match of pattern in the templates."""
    hits = []
    for rel, text in template_sources():
        for match in pattern.finditer(text):
            hits.append((rel, text.count("\n", 0, match.start()) + 1))
    return hits


class GatewayCallTests(unittest.TestCase):
    def test_templates_are_present(self):
        sources = template_sources()
        self.assertTrue(sources, f"no .ts/.tsx templates under {TEMPLATES}")
        rels = {rel for rel, _text in sources}
        for host_path in CONVERTED:
            self.assertIn(host_path, rels)

    def test_no_object_argument_call(self):
        self.assertEqual(offenders(OBJECT_ARG_CALL), [])

    def test_no_sdk_client_call(self):
        self.assertEqual(offenders(SDK_CLIENT_CALL), [])
        self.assertEqual(offenders(ANY_CAST_CALL), [])

    def test_no_dotted_method_url(self):
        self.assertEqual(offenders(DOTTED_METHOD_URL), [])

    def test_no_template_imports_the_sdk_client(self):
        importers = [rel for rel, text in template_sources() if SDK_CLIENT in text]
        self.assertEqual(importers, [])

    def test_converted_sites_call_the_gateway_verbatim(self):
        sources = dict(template_sources())
        for host_path, cmd in CONVERTED.items():
            text = sources[host_path]
            with self.subTest(site=host_path):
                self.assertIn(f'from "{GATEWAY}"', text)
                self.assertIn(f'paasCall("{cmd}", {{', text)
                self.assertNotIn("getPaaSClient", text)

    def test_manifest_requires_the_gateway_not_the_sdk_client(self):
        with open(MANIFEST, encoding="utf-8") as handle:
            manifest = json.load(handle)
        requires = manifest["requires"]
        self.assertIn("app/services/base/platform-gateway.ts", requires)
        self.assertNotIn("app/lib/client.ts", requires)
        self.assertRegex(manifest["version"], r"^\d+\.\d+\.\d+$")


if __name__ == "__main__":
    unittest.main()
