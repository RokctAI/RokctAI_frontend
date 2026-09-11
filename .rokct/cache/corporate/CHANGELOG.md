# Changelog

## 1.1.0

* The about and team pages, and the `data/` fallback. Ray, 2026-09-10:
  corporate_sdk owns `/about` and `/team` as renderers; their content
  comes from the shell's `data/` folder (base_sdk 1.35.0's site-data
  reader) or is empty, and Supacharge's about page reuses lms's founder
  card through base_sdk 1.38.0's page slot on the section registry.
  * `app/about/page.tsx`: `data/about.md` (`readSiteData("about")`)
    rendered by `components/custom/company/markdown-parser.ts` (the parser: ATX
    headings, paragraphs, lists, quotes, fenced code, rules; strong,
    emphasis, code and links whose target is http(s), mailto, tel or a
    site path - anything else is text, raw HTML included) and
    `markdown.tsx` (the blocks as React elements, never HTML set from a
    string; no markdown dependency exists in the composed shells and
    none is added), then the home SDK's cards for the page through
    `pageSectionsFor("about")` (`components/custom/company/
    company-sections.tsx`, rendering each with the PageSectionProps a
    landing section gets: the DOM id, base's `LANDING_CONFIG` sign-in /
    sign-up routes, the session through the kernel seam, no plans, no
    nav, the data mode).
  * `app/team/page.tsx`: `data/team.json` (`readSiteData("team")` -
    name, role, optional photo, optional links) as the card grid
    `components/custom/company/team-grid.tsx` (a plain `<img>` or
    initials), then `pageSectionsFor("team")`.
  * Both sit in `components/custom/company/company-frame.tsx` (the
    host's `PLATFORM_NAME` linking home, the About / Team links, the
    Legal link when documents are published, base's `FooterChromeRow`
    with the Legal group) and take their titles from
    `company-pages.ts` (`COMPANY_PAGES`: the words About and Team, the
    only words this SDK owns here) through `buildPageMetadata`. With
    neither data nor a registered section each draws one neutral line
    (`COMPANY_EMPTY_STATE`) and still answers 200.
  * `components/custom/legal/load-legal-doc.ts`: `loadLegalDoc` and
    `loadLegalIndex` read `data/legal/<slug>.md` (`siteLegalDocs()`,
    `legalDocFromSiteData()`) when `hasSiteData("legal")` and the shell
    is `local` or no tenant base URL resolves (`resolveTenantBaseUrl`);
    a hybrid shell with a backend keeps reading the backend, and the
    pages are untouched. The index lists the folder's pages in slug
    order; a document's title is the file's.
* Floors: base_sdk >= 1.38.0 (`components/custom/landing/landing-page.ts`
  `pageSectionsFor`, `components/custom/landing/page-sections.ts`
  `PageSectionMeta.page`), >= 1.35.0 (`lib/site-data/read-site-data.ts`,
  `lib/site-data/kinds.ts`), >= 1.37.0 (the legal seam, as 1.0.0). No
  `site_data` requires are declared: every kind is optional. Still never
  the home SDK; no dependencies or integrations of its own.
* Tests: `tests/test_manifest.py` - the new installs and floors, every
  entry directive-free and hook-free, no `dangerouslySetInnerHTML`
  anywhere, the pages reading through the reader and the slot, the legal
  fallback's rule, the empty states, and nothing rendered carrying a
  placeholder word or a host; NEW `tests/markdown.test.mts` (node)
  executes the parser: every block and inline form, an unsafe link
  scheme rendered as text, raw HTML kept as text, CRLF folded.

## 1.0.0

* The Next.js half of `corporate_sdk`, the legal pages. Ray, 2026-09-10:
  "supa has no terms pages or about page"; asked where they belong,
  "legal pages are not in corporate sdk?" and "you should look at the
  dart side if they are not there yet". On the Dart side
  `corporate/corporate/dart` (corporate_sdk 1.2.0) owns TermPage /
  PolicyPage at `/term` and `/policy` and every composition with
  auth_sdk includes it; this half mirrors that ownership for the web
  shells and reads the same "Terms and Conditions" documents.
  * `app/legal/page.tsx`: the index of the shell's published documents,
    one link each; nothing published lists nothing and still answers 200.
  * `app/legal/[id]/page.tsx`: one document, server-rendered; a missing
    or disabled document is a 404 (`notFound()`); `generateMetadata`
    takes the document's title through base_sdk's `buildPageMetadata`.
  * `components/custom/legal/legal-doc.tsx`: `LegalDoc`,
    `normaliseLegalDoc`, `LegalDocView` - the title and the body as text
    with whitespace kept, at prose width, the way rokct.ai's hand-rolled
    `app/legal/[id]/page.tsx` renders it.
  * `components/custom/legal/legal-frame.tsx`: the host's `PLATFORM_NAME`
    linking home, the content, and base_sdk's `FooterChromeRow` carrying
    the Legal link group built from the same documents.
  * `app/actions/corporate/legal.ts`: `getPublicTerm(name)`, the guest
    gateway read (`frappe.client.get`, mirroring rokct.ai's
    `TermsService.getSystemTerm`); `null` with no backend.
  * `components/custom/legal/load-legal-doc.ts`: `loadLegalDoc(slug)` and
    `loadLegalIndex()`, the ONE seam the pages read through. Ray,
    2026-09-10 22:14Z: corporate_sdk owns the company pages (legal, about,
    team) as renderers with content from the shell's `data/` folder on
    local / hybrid shells; 1.1.0 adds the about / team pages and the
    `data/` fallback inside these two functions once base 1.35.0 lands,
    without touching the pages.
* Floors: base_sdk >= 1.37.0 (`app/actions/base/legal.ts`,
  `components/custom/landing/legal-links.ts`, `FooterChromeConfig.links`).
  Never the home SDK. No dependencies or integrations of its own.
* Tests: `tests/test_manifest.py` - installs exist and are unique, requires
  are not installed, floors are declared, every entry module is
  directive-free, the document page 404s, the index lists through the
  seam, and nothing rendered carries placeholder words.
