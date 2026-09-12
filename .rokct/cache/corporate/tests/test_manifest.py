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

"""Contract tests for corporate/nextjs's manifest and its legal pages.

Run from the repository root:

    python3 -m unittest discover -s corporate/nextjs/tests -v

Ray, 2026-09-10: "supa has no terms pages or about page"; "legal pages are
not in corporate sdk?"; "you should look at the dart side if they are not
there yet". The Dart corporate_sdk owns the policy / terms pages and every
auth composition includes it; this half mirrors that. The things that must
never silently drift: every install source exists, the floors on base_sdk
are declared, every entry module a page imports is server-safe (no "use
client" - base's server loader contract), the document page 404s a missing
or disabled document and reads through the ONE seam 1.1.0 extends, and
nothing rendered carries placeholder words. Stdlib only, the shape
base_sdk's own tests/test_manifest.py takes.
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
CHANGELOG = os.path.join(SDK_ROOT, "CHANGELOG.md")
INSTALL_PY = os.path.join(SDK_ROOT, "install.py")
TEMPLATES = os.path.join(SDK_ROOT, "templates")
LEGAL_DIR = os.path.join(TEMPLATES, "app", "legal")
INDEX_PAGE = os.path.join(LEGAL_DIR, "page.tsx")
DOC_PAGE = os.path.join(LEGAL_DIR, "[id]", "page.tsx")
ACTION = os.path.join(TEMPLATES, "app", "actions", "corporate", "legal.ts")
LEGAL_COMPONENTS = os.path.join(TEMPLATES, "components", "custom", "legal")
DOC_VIEW = os.path.join(LEGAL_COMPONENTS, "legal-doc.tsx")
FRAME = os.path.join(LEGAL_COMPONENTS, "legal-frame.tsx")
LOADER = os.path.join(LEGAL_COMPONENTS, "load-legal-doc.ts")
# 1.1.0: the about and team pages and their parts.
ABOUT_PAGE = os.path.join(TEMPLATES, "app", "about", "page.tsx")
TEAM_PAGE = os.path.join(TEMPLATES, "app", "team", "page.tsx")
COMPANY_COMPONENTS = os.path.join(TEMPLATES, "components", "custom", "company")
COMPANY_PAGES = os.path.join(COMPANY_COMPONENTS, "company-pages.ts")
COMPANY_FRAME = os.path.join(COMPANY_COMPONENTS, "company-frame.tsx")
COMPANY_SECTIONS = os.path.join(COMPANY_COMPONENTS, "company-sections.tsx")
MARKDOWN_PARSER = os.path.join(COMPANY_COMPONENTS, "markdown-parser.ts")
MARKDOWN_VIEW = os.path.join(COMPANY_COMPONENTS, "markdown.tsx")
TEAM_GRID = os.path.join(COMPANY_COMPONENTS, "team-grid.tsx")
MARKDOWN_TESTS = os.path.join(HERE, "markdown.test.mts")

BASE_FLOOR = "1.37.0"
# 1.1.0: the page slot and the site-data reader, each read at its floor.
BASE_138_REQUIRES = (
    "components/custom/landing/landing-page.ts",
    "components/custom/landing/page-sections.ts",
)
BASE_135_REQUIRES = (
    "lib/site-data/read-site-data.ts",
    "lib/site-data/kinds.ts",
)
# The base_sdk 1.37.0 files this SDK reads: each must be a declared
# prerequisite with its floor in the manifest comment.
BASE_134_REQUIRES = (
    "app/actions/base/legal.ts",
    "components/custom/landing/legal-links.ts",
    "components/custom/landing/footer-chrome-config.ts",
    "components/custom/footer-chrome.tsx",
)

BLOCK_COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)
LINE_COMMENT_RE = re.compile(r"^\s*//.*$", re.M)
LICENSE_HEAD = "Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD"


def load_manifest():
    with open(MANIFEST, encoding="utf-8") as f:
        return json.load(f)


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def code_of(path):
    """The source with its comments removed - what the compiler sees."""
    return LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(path)))


def template_files():
    for root, _, names in os.walk(TEMPLATES):
        for name in names:
            yield os.path.join(root, name)


class TestCorporateNextjs(unittest.TestCase):
    def setUp(self):
        self.manifest = load_manifest()

    # -- identity and installs ------------------------------------------------

    def test_identity_and_version(self):
        self.assertEqual(self.manifest["name"], "corporate_sdk")
        self.assertRegex(self.manifest["version"], r"^\d+\.\d+\.\d+$")
        self.assertEqual(self.manifest["version"], "1.1.0")
        self.assertIn("sdk_name = 'corporate_sdk'", read(INSTALL_PY))
        self.assertTrue(read(INSTALL_PY).startswith("# " + LICENSE_HEAD))
        # Same shape as the sibling halves: one flat installs list, no
        # app_type persona blocks, and never the home SDK.
        for key in ("installs", "dependencies", "devDependencies", "integrations", "requires", "_comment"):
            self.assertIn(key, self.manifest)
        self.assertNotIn("app_type", self.manifest)
        self.assertNotIn("home_sdk", self.manifest)
        self.assertEqual(self.manifest["integrations"], [])
        self.assertEqual(self.manifest["dependencies"], {})

    def test_every_install_source_exists(self):
        for entry in self.manifest["installs"]:
            src = os.path.join(SDK_ROOT, entry["from"])
            self.assertTrue(os.path.exists(src), f"missing install source {entry['from']}")

    def test_install_targets_are_unique(self):
        targets = [e["to"] for e in self.manifest["installs"]]
        self.assertEqual(len(targets), len(set(targets)))

    def test_the_legal_pages_and_their_parts_are_installed(self):
        pairs = {(e["from"], e["to"]) for e in self.manifest["installs"]}
        for pair in (
            ("templates/app/legal", "app/legal"),
            ("templates/app/actions/corporate/legal.ts", "app/actions/corporate/legal.ts"),
            ("templates/components/custom/legal/legal-doc.tsx", "components/custom/legal/legal-doc.tsx"),
            ("templates/components/custom/legal/legal-frame.tsx", "components/custom/legal/legal-frame.tsx"),
            ("templates/components/custom/legal/load-legal-doc.ts", "components/custom/legal/load-legal-doc.ts"),
        ):
            self.assertIn(pair, pairs)
        self.assertTrue(os.path.isfile(INDEX_PAGE))
        self.assertTrue(os.path.isfile(DOC_PAGE))

    def test_the_company_pages_and_their_parts_are_installed(self):
        pairs = {(e["from"], e["to"]) for e in self.manifest["installs"]}
        for pair in (
            ("templates/app/about", "app/about"),
            ("templates/app/team", "app/team"),
            ("templates/components/custom/company/company-pages.ts", "components/custom/company/company-pages.ts"),
            ("templates/components/custom/company/company-frame.tsx", "components/custom/company/company-frame.tsx"),
            ("templates/components/custom/company/company-sections.tsx", "components/custom/company/company-sections.tsx"),
            ("templates/components/custom/company/markdown-parser.ts", "components/custom/company/markdown-parser.ts"),
            ("templates/components/custom/company/markdown.tsx", "components/custom/company/markdown.tsx"),
            ("templates/components/custom/company/team-grid.tsx", "components/custom/company/team-grid.tsx"),
        ):
            self.assertIn(pair, pairs)
        for path in (ABOUT_PAGE, TEAM_PAGE, COMPANY_PAGES, COMPANY_FRAME, COMPANY_SECTIONS,
                     MARKDOWN_PARSER, MARKDOWN_VIEW, TEAM_GRID):
            self.assertTrue(os.path.isfile(path), path)
        # No markdown library: the composed shells carry none, and this
        # SDK declares no dependency.
        self.assertEqual(self.manifest["dependencies"], {})
        self.assertNotIn("site_data", self.manifest, "every kind is optional; an absent file is the empty state")

    def test_requires_are_not_installed(self):
        targets = {e["to"] for e in self.manifest["installs"]}
        for req in self.manifest["requires"]:
            self.assertNotIn(req, targets, f"{req} is both required and installed")

    # -- floors ---------------------------------------------------------------

    def test_base_floor_is_declared_on_every_base_134_file(self):
        comment = self.manifest["_comment"]
        requires = set(self.manifest["requires"])
        for path in BASE_134_REQUIRES:
            self.assertIn(path, requires, f"{path} is read but not a declared prerequisite")
            self.assertIn(path, comment, f"{path} has no floor comment")
            self.assertIn(f"base_sdk >= {BASE_FLOOR}", comment[path], path)
        self.assertIn(f"base_sdk >= {BASE_FLOOR}", comment["about"])
        self.assertIn("home_sdk false", comment["about"])
        # 1.1.0: the page slot (1.38.0) and the reader (1.35.0).
        for path in BASE_138_REQUIRES:
            self.assertIn(path, requires, path)
            self.assertIn("base_sdk >= 1.38.0", comment[path], path)
        for path in BASE_135_REQUIRES:
            self.assertIn(path, requires, path)
            self.assertIn("base_sdk >= 1.35.0", comment[path], path)
        self.assertIn("base_sdk >= 1.38.0", comment["about"])
        self.assertIn("base_sdk >= 1.35.0", comment["about"])
        # Every other prerequisite names who installs it too.
        for req in requires:
            self.assertIn(req, comment, f"{req} has no owner comment")
            self.assertRegex(comment[req], r"^(installed by \w+ >= \d+\.\d+\.\d+|host shell)")

    def test_every_import_of_a_base_or_host_file_is_a_declared_prerequisite(self):
        installed = {e["to"] for e in self.manifest["installs"]}
        installed_dirs = {t for t in installed if not t.endswith((".ts", ".tsx"))}
        declared = set(self.manifest["requires"])
        for path in template_files():
            for target in re.findall(r'from "@/([^"]+)"', read(path)):
                candidates = {target, target + ".ts", target + ".tsx"}
                if candidates & installed or any(target.startswith(d + "/") for d in installed_dirs):
                    continue
                self.assertTrue(
                    candidates & declared,
                    f"{os.path.relpath(path, SDK_ROOT)} imports @/{target}, which is neither installed nor required",
                )

    # -- the server-safe contract ---------------------------------------------

    def test_entry_modules_are_directive_free(self):
        """Base's server loader contract: a page and everything it renders
        on the server carries no "use client"; the only directive here is
        the action's "use server"."""
        directive = re.compile(r"""^\s*["']use (client|server)["'];?\s*$""", re.M)
        entries = (INDEX_PAGE, DOC_PAGE, DOC_VIEW, FRAME, LOADER,
                   ABOUT_PAGE, TEAM_PAGE, COMPANY_PAGES, COMPANY_FRAME, COMPANY_SECTIONS,
                   MARKDOWN_PARSER, MARKDOWN_VIEW, TEAM_GRID)
        for path in entries:
            self.assertIsNone(directive.search(code_of(path)), os.path.relpath(path, SDK_ROOT))
        self.assertRegex(read(ACTION), re.compile(r'^"use server";$', re.M))
        self.assertNotRegex(code_of(ACTION), re.compile(r"""^\s*["']use client["']""", re.M))
        for path in entries:
            body = code_of(path)
            for hook in ("useState", "useEffect", "useRef", "usePathname", "window.", "localStorage", "document."):
                self.assertNotIn(hook, body, f"{os.path.relpath(path, SDK_ROOT)} uses {hook}")
        # Nothing this SDK renders sets HTML from a string.
        for path in template_files():
            self.assertNotIn("dangerouslySetInnerHTML", read(path), os.path.relpath(path, SDK_ROOT))
            self.assertNotIn("innerHTML", read(path), os.path.relpath(path, SDK_ROOT))

    def test_document_page_reads_through_the_seam_and_404s(self):
        src = read(DOC_PAGE)
        self.assertIn('import { notFound } from "next/navigation";', src)
        self.assertIn("export async function generateMetadata(", src)
        self.assertIn("export default async function LegalDocPage(", src)
        self.assertIn("params: Promise<{ id: string }>;", src)
        self.assertIn("loadLegalDoc(decodeURIComponent(id))", src)
        self.assertIn("if (!doc) notFound();", src)
        self.assertIn("buildPageMetadata({ title: doc.title })", src)
        self.assertIn("<LegalDocView doc={doc} />", src)
        # The page never reaches the gateway or the action itself: the ONE
        # seam 1.1.0 extends with the data/ fallback is the loader.
        body = code_of(src and DOC_PAGE)
        self.assertNotIn("platformCall", body)
        self.assertNotIn("getPublicTerm", body)
        self.assertNotIn("listPublicTerms", body)
        loader = read(LOADER)
        self.assertIn("export async function loadLegalDoc(slug: string): Promise<LegalDoc | null> {", loader)
        self.assertIn("export async function loadLegalIndex(): Promise<PublicTerm[]> {", loader)
        self.assertIn("if (!doc || doc.disabled) return null;", loader)
        self.assertIn("1.1.0", loader)

    def test_index_page_lists_through_the_seam(self):
        src = read(INDEX_PAGE)
        self.assertIn("const terms = await loadLegalIndex();", src)
        self.assertIn("href={legalDocHref(term.name)}", src)
        self.assertIn("{term.title}", src)
        self.assertIn("terms.length === 0", src)
        self.assertIn("buildPageMetadata({ title: DEFAULT_LEGAL_GROUP_LABEL })", src)
        body = code_of(INDEX_PAGE)
        self.assertNotIn("platformCall", body)
        self.assertNotIn("listPublicTerms", body)

    def test_action_is_a_guest_read_that_soft_fails(self):
        src = read(ACTION)
        self.assertIn('"frappe.client.get",', src)
        self.assertIn("{ doctype: LEGAL_DOCTYPE, name: id },", src)
        self.assertIn("{ requireAuth: false },", src)
        self.assertIn("return normaliseLegalDoc(row);", src)
        self.assertIn("return null;", src)
        self.assertIn('import { LEGAL_DOCTYPE } from "@/components/custom/landing/legal-links";', src)
        body = code_of(ACTION)
        self.assertNotIn("export const", body)
        self.assertNotIn("Terms and Conditions", body, "the doctype name is base's LEGAL_DOCTYPE, said once")

    def test_renderer_keeps_whitespace_and_is_generic(self):
        src = read(DOC_VIEW)
        self.assertIn("whitespace-pre-wrap", src)
        self.assertIn("max-w-3xl", src)
        self.assertIn("export function normaliseLegalDoc(row: unknown): LegalDoc | null {", src)
        self.assertIn("export function LegalDocView(", src)
        self.assertIn("<h1", src)
        self.assertNotIn("dangerouslySetInnerHTML", src)
        frame = read(FRAME)
        self.assertIn('import { PLATFORM_NAME } from "@/app/config/platform";', frame)
        self.assertIn("legalFooterLinks(terms)", frame)
        self.assertIn("<FooterChromeRow config={config} />", frame)
        self.assertIn("href={LEGAL_ROUTE}", frame)

    def test_nothing_rendered_carries_placeholder_words_or_a_host(self):
        for path in template_files():
            body = code_of(path).lower()
            rel = os.path.relpath(path, SDK_ROOT)
            for word in ("demo", "sample", "example", "lorem", "https://", "http://", "rokct.ai", "supacharge"):
                self.assertNotIn(word, body, f"{rel} carries {word}")
            self.assertIn(LICENSE_HEAD, read(path), f"{rel} has no licence header")

    # -- 1.1.0: the about and team pages ---------------------------------------

    def test_about_page_reads_the_folder_and_the_slot(self):
        src = read(ABOUT_PAGE)
        self.assertIn('import { hasSiteData, readSiteData, siteDataMode } from "@/lib/site-data/read-site-data";', src)
        self.assertIn('import { pageSectionsFor } from "@/components/custom/landing/landing-page";', src)
        self.assertIn('const about = hasSiteData("about") ? (readSiteData("about") ?? "").trim() : "";', src)
        self.assertIn('pageSectionsFor("about", { plans: [], session, dataMode }),', src)
        self.assertIn("<Markdown source={about} />", src)
        self.assertIn("<CompanySections sections={sections} session={session} dataMode={dataMode} />", src)
        self.assertIn("const empty = about.length === 0 && sections.length === 0;", src)
        self.assertIn("{COMPANY_EMPTY_STATE.about}", src)
        self.assertIn("buildPageMetadata({ title: COMPANY_PAGES.about.label })", src)
        self.assertIn('<CompanyFrame page="about" terms={terms}>', src)
        self.assertIn('export const dynamic = "force-dynamic";', src)
        body = code_of(ABOUT_PAGE)
        for word in ("platformCall", "getPublicTerm", "notFound"):
            self.assertNotIn(word, body)

    def test_team_page_reads_the_folder_and_the_slot(self):
        src = read(TEAM_PAGE)
        self.assertIn('import { hasSiteData, readSiteData, siteDataMode } from "@/lib/site-data/read-site-data";', src)
        self.assertIn('const members = hasSiteData("team") ? (readSiteData("team")?.members ?? []) : [];', src)
        self.assertIn('pageSectionsFor("team", { plans: [], session, dataMode }),', src)
        self.assertIn("<TeamGrid members={members} />", src)
        self.assertIn("<CompanySections sections={sections} session={session} dataMode={dataMode} />", src)
        self.assertIn("const empty = members.length === 0 && sections.length === 0;", src)
        self.assertIn("{COMPANY_EMPTY_STATE.team}", src)
        self.assertIn("buildPageMetadata({ title: COMPANY_PAGES.team.label })", src)
        self.assertIn('<CompanyFrame page="team" terms={terms}>', src)
        grid = read(TEAM_GRID)
        self.assertIn('import type { SiteTeamMember } from "@/lib/site-data/kinds";', grid)
        for field in ("member.photo", "member.name", "member.role", "member.links"):
            self.assertIn(field, grid)
        self.assertIn("initialsOf(member.name)", grid)
        self.assertIn('rel="noopener noreferrer"', grid)

    def test_sections_render_with_the_landing_contract(self):
        src = read(COMPANY_SECTIONS)
        self.assertIn('import type { LoadedSection } from "@/components/custom/landing/landing-page";', src)
        self.assertIn('import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";', src)
        for prop in ("id={domId}", "signupUrl={LANDING_CONFIG.signupUrl}", "loginUrl={LANDING_CONFIG.loginUrl}",
                     "session={session}", "plans={[]}", "nav={[]}", "dataMode={dataMode}"):
            self.assertIn(prop, src, prop)
        self.assertIn("if (sections.length === 0) return null;", src)

    def test_company_words_are_the_only_words_and_the_empty_states_are_neutral(self):
        src = code_of(COMPANY_PAGES)
        self.assertIn('about: { route: "/about", label: "About" },', src)
        self.assertIn('team: { route: "/team", label: "Team" },', src)
        self.assertIn('about: "There is nothing on this page yet.",', src)
        self.assertIn('team: "No team members have been listed yet.",', src)
        frame = read(COMPANY_FRAME)
        self.assertIn('import { PLATFORM_NAME } from "@/app/config/platform";', frame)
        self.assertIn("legalFooterLinks(terms)", frame)
        self.assertIn("<FooterChromeRow config={config} />", frame)
        self.assertIn('aria-current={key === page ? "page" : undefined}', frame)
        self.assertIn("{terms.length > 0 && (", frame)

    def test_markdown_is_rendered_as_elements(self):
        view = read(MARKDOWN_VIEW)
        self.assertIn('from "@/components/custom/company/markdown-parser"', view)
        self.assertIn("parseMarkdown(source)", view)
        for tag in ("<p ", "<ol ", "<ul ", "<blockquote ", "<pre ", "<hr ", "<strong ", "<em ", "<code "):
            self.assertIn(tag, view, tag)
        self.assertIn('rel="noopener noreferrer"', view)
        parser = read(MARKDOWN_PARSER)
        self.assertIn("export function parseMarkdown(source: string): MarkdownBlock[] {", parser)
        self.assertIn("export function parseInline(text: string): MarkdownInline[] {", parser)
        self.assertIn("export function isSafeHref(href: string): boolean {", parser)
        self.assertNotIn('from "@/', parser, "the parser is pure and stages bare")

    def test_markdown_parser_behaviour_under_node(self):
        node = shutil.which("node")
        self.assertIsNotNone(node, "node (22.6+) is needed to execute markdown-parser.ts")
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(MARKDOWN_PARSER, os.path.join(tmp, "markdown-parser.ts"))
            shutil.copy(MARKDOWN_TESTS, os.path.join(tmp, "markdown.test.mts"))
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", "--test",
                 os.path.join(tmp, "markdown.test.mts")],
                capture_output=True, text=True, timeout=120, cwd=tmp,
            )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertRegex(run.stdout, re.compile(r"^# fail 0$", re.M), run.stdout)
        passed = re.search(r"^# pass (\d+)$", run.stdout, re.M)
        self.assertIsNotNone(passed, run.stdout)
        self.assertGreaterEqual(int(passed.group(1)), 8)

    def test_legal_loader_falls_back_to_the_folder(self):
        loader = read(LOADER)
        self.assertIn('import { resolveTenantBaseUrl } from "@/app/services/base/platform-gateway";', loader)
        self.assertIn('import { hasSiteData, readSiteData, siteDataMode } from "@/lib/site-data/read-site-data";', loader)
        self.assertIn("export async function siteLegalDocs(): Promise<SiteLegal | null> {", loader)
        self.assertIn('if (!hasSiteData("legal")) return null;', loader)
        self.assertIn('if (siteDataMode() !== "local") {', loader)
        self.assertIn("backend = await resolveTenantBaseUrl();", loader)
        self.assertIn("if (backend) return null;", loader)
        self.assertIn('return readSiteData("legal") ?? null;', loader)
        self.assertIn("export function legalDocFromSiteData(slug: string, docs: SiteLegal): LegalDoc | null {", loader)
        self.assertIn("return { name: slug, title: page.title, body: page.markdown, disabled: false };", loader)
        # Both seams ask the folder first, and the pages still read only the seams.
        self.assertIn("const local = await siteLegalDocs();\n  if (local) return legalDocFromSiteData(slug, local);", loader)
        self.assertIn("const local = await siteLegalDocs();\n  if (local) {", loader)
        self.assertIn(".sort()", loader)
        for path in (INDEX_PAGE, DOC_PAGE):
            body = code_of(path)
            self.assertNotIn("site-data", body)
            self.assertNotIn("siteLegalDocs", body)

    # -- changelog ------------------------------------------------------------

    def test_changelog_leads_with_the_manifest_version(self):
        changelog = read(CHANGELOG)
        heads = re.findall(r"^## (\d+\.\d+\.\d+)$", changelog, re.M)
        self.assertTrue(heads, "CHANGELOG.md has no version heading")
        self.assertEqual(heads[0], self.manifest["version"])
        for line in changelog.splitlines():
            if line.startswith("#") and line != "# Changelog":
                self.assertRegex(line, r"^## \d+\.\d+\.\d+$", line)


if __name__ == "__main__":
    unittest.main()
