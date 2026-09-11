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

"""Static contract tests for crm/nextjs's gateway calls.

Run from the repository root:

    python3 -m unittest discover -s crm/nextjs/tests -v

frappe-js-sdk's `call()` takes NO arguments: `client.call({ method, args })`
sends nothing and resolves to a FrappeCall helper, so a surface written that
way is silently empty (crm_sdk 1.0.1). Every server action reaches the
backend through `gatewayCall(client, cmd, payload)` from
`@/app/lib/gateway-rpc` (installed by base_sdk), with the cmd as a positional
string literal, `frappe.client.*` cmds verbatim and never a dotted
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

GATEWAY_RPC = "app/lib/gateway-rpc.ts"
GATEWAY_IMPORT = 'import { gatewayCall } from "@/app/lib/gateway-rpc";'

# The dead shapes, multi-line aware: `.call(` followed by an object literal
# (any whitespace between), the browser-side `frappe.call(`, and the
# `(client as any).call(` cast that hid the missing overload from tsc.
OBJECT_CALL_RE = re.compile(r"\.call\(\s*\{")
FRAPPE_CALL_RE = re.compile(r"\bfrappe\.call\(")
ANY_CAST_CALL_RE = re.compile(r"as any\)\s*\.call\(")
METHOD_URL_RE = re.compile(r"/api/method/")

# gatewayCall(client, "<cmd>", ...) - the cmd is the second, positional,
# string-literal argument. Anything else is a hit for test_gateway_calls_
# name_their_cmd_positionally.
GATEWAY_CALL_RE = re.compile(r"\bgatewayCall\(")
GATEWAY_CALL_SHAPE_RE = re.compile(r"\bgatewayCall\(\s*client\s*,\s*\"[^\"\n]+\"\s*,")


def template_sources():
    for root, _dirs, files in os.walk(TEMPLATES):
        for name in sorted(files):
            if name.endswith((".ts", ".tsx")):
                path = os.path.join(root, name)
                with open(path, encoding="utf-8") as fh:
                    yield os.path.relpath(path, SDK_ROOT), fh.read()


def line_of(text, index):
    return text.count("\n", 0, index) + 1


class GatewayCallTests(unittest.TestCase):
    def setUp(self):
        self.sources = list(template_sources())
        self.assertTrue(self.sources, "no template sources found")

    def _hits(self, pattern):
        return [
            "%s:%d" % (rel, line_of(text, m.start()))
            for rel, text in self.sources
            for m in pattern.finditer(text)
        ]

    def test_no_object_argument_call_remains(self):
        self.assertEqual(self._hits(OBJECT_CALL_RE), [])

    def test_no_frappe_call_remains(self):
        self.assertEqual(self._hits(FRAPPE_CALL_RE), [])

    def test_no_any_cast_call_remains(self):
        self.assertEqual(self._hits(ANY_CAST_CALL_RE), [])

    def test_no_dotted_api_method_url(self):
        self.assertEqual(self._hits(METHOD_URL_RE), [])

    def test_gateway_calls_name_their_cmd_positionally(self):
        for rel, text in self.sources:
            uses = [m.start() for m in GATEWAY_CALL_RE.finditer(text)]
            if not uses:
                continue
            with self.subTest(file=rel):
                self.assertIn(
                    GATEWAY_IMPORT, text, "%s uses gatewayCall without importing it" % rel
                )
                shaped = [m.start() for m in GATEWAY_CALL_SHAPE_RE.finditer(text)]
                self.assertEqual(
                    [line_of(text, i) for i in uses],
                    [line_of(text, i) for i in shaped],
                    "%s: every gatewayCall must be gatewayCall(client, \"<cmd>\", ...)" % rel,
                )

    def test_gateway_calls_present(self):
        # The sweep is not a no-op: the converted actions still call out.
        self.assertGreaterEqual(len(self._hits(GATEWAY_CALL_RE)), 9)


class ManifestTests(unittest.TestCase):
    def setUp(self):
        with open(MANIFEST, encoding="utf-8") as fh:
            self.manifest = json.load(fh)

    def test_version(self):
        self.assertEqual(self.manifest["version"], "1.0.1")

    def test_requires_gateway_rpc(self):
        self.assertIn(GATEWAY_RPC, self.manifest["requires"])


if __name__ == "__main__":
    unittest.main()
