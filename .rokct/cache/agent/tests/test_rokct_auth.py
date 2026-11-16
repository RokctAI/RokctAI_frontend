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
                self.assertRegex(part.strip(), r"^(\.dark )?\.ra-root \.ra", part)

    def test_copy_is_read_from_the_landing(self):
        src = COPY.read_text()
        self.assertIn("RK_HERO.lede", src)
        self.assertIn("RK_HERO.meta", src)
        self.assertIn("RK_HERO.tail", src)
        for word in ("guarantee", "%", "fastest", "best"):
            self.assertNotIn(word, src)

    def test_phone_hides_the_panel_never_below_the_card(self):
        css = CSS.read_text()
        m = re.search(r"@media \(max-width:767px\)\{(.*?)\n\}", css, flags=re.S)
        self.assertIsNotNone(m)
        self.assertIn(".ra-root .ra-side{display:none}", m.group(1))
        self.assertNotIn("max-width:900px", css)

    def test_login_heading_is_the_wordmark(self):
        src = COPY.read_text()
        self.assertIn("title: `Welcome to ${NAME}`", src)
        self.assertIn("PLATFORM_NAME.toUpperCase()", src)
        shell = SHELL.read_text()
        self.assertIn("ROKCT_AUTH_COPY.loginCard.title", shell)
        self.assertIn(".ra-own-head>div>div>div:has(>h1){display:none}", CSS.read_text())

    def test_auth_links_are_brand_not_indigo(self):
        css = CSS.read_text()
        self.assertNotIn(".text-primary{color:var(--rk-accent)}", css)
        self.assertIn("var(--rk-brand) 62%", css)
        self.assertIn(".dark .ra-root .ra-card a.text-primary,.dark .ra-root .ra-card .text-primary{color:var(--rk-brand)", css)
        self.assertIn(".ra-root .ra-card a:hover,.ra-root .ra-card a:focus-visible{", css)
        self.assertIn(".ra-root .ra-card a:focus-visible{outline:", css)


if __name__ == "__main__":
    unittest.main()
