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

"""Static contract tests for app/actions/ai/smart_status.ts (1.0.3).

    python3 -m unittest discover -s productivity/nextjs/tests -v
"""

import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, os.pardir, "templates", "app", "actions", "ai", "smart_status.ts")


class SmartStatusTests(unittest.TestCase):
    def setUp(self):
        with open(SRC, encoding="utf-8") as fh:
            self.text = fh.read()

    def _spec(self, doctype):
        m = re.search(r'"?%s"?:\s*\{\s*fields:\s*\[([^\]]*)\],\s*party:\s*"([^"]*)"' % re.escape(doctype), self.text)
        self.assertIsNotNone(m, doctype)
        return re.findall(r'"([^"]+)"', m.group(1)), m.group(2)

    def test_project_and_task_request_real_fields(self):
        for doctype in ("Project", "Task"):
            fields, party = self._spec(doctype)
            self.assertNotIn("customer_name", fields + [party])
            self.assertNotIn("grand_total", fields)

    def test_purchase_order_uses_supplier(self):
        fields, party = self._spec("Purchase Order")
        self.assertEqual(party, "supplier_name")
        self.assertIn('type === "Purchase Order"', self.text)

    def test_invoice_maps_to_sales_invoice(self):
        self.assertRegex(self.text, r'Invoice:\s*"Sales Invoice"')

    def test_no_hardcoded_fields_in_get_list(self):
        self.assertNotIn('fields: ["name", "customer_name", "status"]', self.text)

    def test_lookup_inside_try(self):
        body = self.text[self.text.index("export async function updateSmartStatus"):]
        self.assertLess(body.index("try {"), body.index("fuzzySearch("))
