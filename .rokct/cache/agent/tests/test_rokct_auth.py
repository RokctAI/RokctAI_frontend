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

"""agent_sdk 1.26.0: the rokct.ai auth pages. agent_sdk installs its own
components/custom/site-shell.tsx (auth_sdk >= 1.12.0's SiteShell seam) with
the SiteShell / SiteShellLogo contract, client-safe, wearing the landing's
root class, with scoped CSS and copy read from the landing."""

import json
import re
import unittest
from pathlib import Path

SDK = Path(__file__).resolve().parents[1]
T = SDK / "templates/components/custom"
SHELL = T / "site-shell.tsx"
COPY = T / "agent-auth/rokct-auth-copy.ts"
CSS = T / "agent-auth/rokct-auth.css"


class RokctAuthTest(unittest.TestCase):
    def test_manifest_installs_the_shell_at_top_level(self):
        m = json.loads((SDK / "manifest.json").read_text())
        pairs = {(i["from"], i["to"]) for i in m["installs"]}
        self.assertIn(("templates/components/custom/site-shell.tsx", "components/custom/site-shell.tsx"), pairs)
        self.assertIn(("templates/components/custom/agent-auth", "components/custom/agent-auth"), pairs)

    def test_contract(self):
        src = SHELL.read_text()
        self.assertIn('"use client";', src)
        self.assertIn("export interface SiteShellProps", src)
        self.assertIn("export function SiteShell(", src)
        self.assertIn("export function SiteShellLogo(", src)
        self.assertIn("RK_ROOT_CLASS", src)
        self.assertNotRegex(src, r"server-only|next/headers|custom/footer")

    def test_css_scoped(self):
        body = re.sub(r"/\*.*?\*/", "", CSS.read_text(), flags=re.S)
        for sel in re.findall(r"([^{}]+)\{", body):
            if sel.strip().startswith("@media"):
                continue
            for part in sel.split(","):
                self.assertRegex(part.strip(), r"^\.ra-root \.ra", part)

    def test_copy_is_read_from_the_landing(self):
        src = COPY.read_text()
        self.assertIn("RK_HERO.lede", src)
        self.assertIn("RK_HERO.meta", src)
        self.assertIn("RK_HERO.tail", src)
        for word in ("guarantee", "%", "fastest", "best"):
            self.assertNotIn(word, src)


if __name__ == "__main__":
    unittest.main()
