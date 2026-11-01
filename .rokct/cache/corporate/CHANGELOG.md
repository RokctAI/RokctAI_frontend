# Changelog

## 1.5.0

* **The South River render Ray approved, drawn from data** (Ray,
  2026-11-01: "south river site doesnt have what we discussed yet").
  The renderer draws the fields base_sdk 1.59.0 adds; every one is
  optional, so a site that sets none looks as before (apart from the
  bottle, below). Floor: base_sdk >= 1.59.0.
  * **The bottle** (`site-art.tsx`, every site): the water stops in the
    neck under empty clear plastic; drops form on the cold bottle and run
    down leaving a wet trail. A label's `mark` is a monogram in a ring
    above the name. A bottle given `labels` rolls through them: the label
    on show runs off round the left edge while the next wraps on from the
    right (each holds 2.8 s and rolls in 1.1 s; the two faces always tile
    the label). With reduced motion the first label stays on and the drops
    stay caught part-way down.
  * **Pricing** (`site-sections.tsx`): a tier's `fine` line (`strong` in
    bold), its `art` drawn the card's full height beside the words, and its
    `slider`: new `site-pricing-slider.client.tsx`, a range from `min` to
    `max` with the count line and a running total ("10 cases · 240
    bottles", "10 × R150 · R6.25 a bottle", "R1,500"). New `site-price.ts`
    fills `{n}`, `{units}`, `{price}`, `{each}` and `{total}` and writes
    money the way the price is written.
  * **Header and footer**: `data/site.json` `header.wordmark: false`
    passes `brand.wordmark: false`, so the header logo image stands alone;
    `footer.logo` draws the site's own logo in place of the type wordmark,
    masked so it takes `--cs-brand-text` in either theme.
  * The `components/custom/site` directory install already carries the two
    new files; the manifest's installs do not change.
* test: `TestSouthRiverRender` in `tests/test_manifest.py`.

## 1.4.2

* **Site fonts are bundled; the build no longer fetches Google Fonts.**
  `components/custom/site/site-fonts.ts` loads the seven faces a
  local-data site may choose through `next/font/local` from
  `components/custom/site/fonts/` instead of `next/font/google`.
  southriver-web's Vercel production build of main 46cf377 failed on the
  Google Fonts fetch, the failure supacharge-web and polaris-web hit
  (polaris_sdk 1.8.1): Google can answer with
  `fonts.gstatic.com/l/font?kit=...` URLs that Turbopack's
  `next/font/google` loader cannot resolve, and a failed font fetch fails
  the build.
  * Montserrat (400 to 900), Fraunces (100 to 900), Figtree (400 to 700)
    and Space Grotesk (300 to 700), upright and, where the site may ask for
    it, italic, and Inter (100 to 900) and DM Sans (100 to 1000) are the
    google/fonts sources (the versions Google serves) cut to the latin and
    latin-ext characters, with the wght axis limited to the weights the
    old calls asked for and the other axes pinned where Google pins them
    (opsz 14; Fraunces SOFT 0). Cyrillic, greek and vietnamese text, which
    Google's extra faces covered, now draws in the fallback.
  * Playfair Display ships whole (the variable TTFs as woff2): "Playfair
    Display" is a Reserved Font Name, so the files are not subset.
  * `OFL.txt` (SIL Open Font License 1.1) sits beside the fonts. The
    `components/custom/site` directory install already carries them; the
    manifest's installs do not change.
  * The `--cs-font-*` variables, `display: swap`, the metric-matched
    fallbacks (Times New Roman for Fraunces and Playfair Display, Arial for
    the rest) and `siteFontClasses()` are unchanged, so a site looks the
    same. No base_sdk floor moves.

## 1.4.1

* A local-data site's footer ends with base_sdk 1.54.0's site credit,
  `© <year> <site name> · Built with ♥ by ROKCT` (Ray, 2026-10-31: "all
  site will be copyright sitename then built with love (as heart) by
  ROKCT"), the name being `data/site.json` `name` - "© 2026 South River ·
  Built with ♥ by ROKCT" - instead of "© Copyright <year> - <holder>" with
  `footer.legal` or `LEGAL_COMPANY_NAME`. `site-footer-section.tsx` passes
  `siteName` and no `copyrightHolder`, and no longer imports
  `LEGAL_COMPANY_NAME`; `footer.legal` is no longer drawn. The company and
  legal frames (`CompanyFrame`, `LegalFrame`) are unchanged: they pass
  base's default config, whose row now names the host's `PLATFORM_NAME`.
  Floor: base_sdk >= 1.54.0 (`FooterChromeConfig.siteName`).

## 1.4.0

* corporate_sdk is the home SDK of every local-data site (Ray, 2026-10-31:
  "corporate can be home sdk"; one shared site renderer, every client from
  data, no SDK per client). A new manifest `"home"` block (same keys as an
  `app_type` block) applies only in a shell whose `composer.json` flags
  `corporate_sdk` `"home_sdk": true` (The-Rokct-Protocol's Next.js installer);
  everywhere else this SDK still installs the company pages only.
* The block installs `app/page.tsx` (a redirect to base_sdk's `/landing`) and
  `components/custom/site/`, and fills base_sdk's landing registries from the
  shell's `data/` folder (base_sdk >= 1.53.0 kinds): hero copy and hero form
  (the `data/sections.json` hero, handed to the client form as
  `HeroConfig.formData`), header menu (`data/site.json` header and one anchor
  per section with a nav label), site metadata, a null plans query, and page
  sections - the theme (order -2, frame: `site.css`, the `data/theme.json`
  palette, fonts and display voice, then the site's own `data/site.css`),
  twelve numbered slots drawing the sections after the hero in order (intro,
  steps, pricing, gallery, facts, WhatsApp order form, contact; each with
  layout variants and a tone), and the footer (order 95, frame).
* `home.site_data.requires` (`theme`, `site`, `sections`): a local build
  without those files fails at generate time, naming the file.
* Art: a drawn PET bottle wearing a data label (a name, or the site's own
  label art file from `public/`), a type wordmark, a stamp, a wave, step
  glyphs; a section may instead show the site's own image file.
* `docs/local-sites.md`: how to add a client, the identity a site gets from
  data (fonts, palette, layouts, art, its own CSS) and the backend seam for
  many sites on one deployment. `docs/examples/demo-bakery/` is a second,
  made-up record drawn by the same code.

## 1.3.0

* `/team`'s title carries the number of cards on the page as a badge
  (Ray, 2026-10-03: "Team [45]", the number in a rectangle). NEW
  `components/custom/company/team-count.tsx` (`TeamCount`, a client
  component, and `sumTeamCounts`) sums the `data/team.json` members the
  page draws and every `data-team-count` a home-SDK section on the page
  declares on its wrapper (Supacharge: lms_sdk 1.36.9's team section).
  Nothing is hard-coded and no home SDK is imported; a section that
  declares nothing adds nothing, and a 0 sum hides the badge. The badge
  is neutral (`data-team-count-badge`, `border-current`); the home SDK's
  theme may style it.

## 1.2.0

* The pages sit in the shell's site frame. Ray, 2026-09-11 20:44Z, of
  `/about`: "we have no way to get here and its so disconnected to the
  rest of the site". Every page here - `/about`, `/team`, `/legal` and
  `/legal/<id>` - now awaits base_sdk 1.47.0's `resolveSiteFrame({ plans:
  [], session, dataMode })` (`components/custom/landing/site-frame.ts`)
  beside what it already loaded, and:
  * sits in base's `SiteFrame` (`components/custom/site-frame.tsx`: the
    home SDK's header with its registered menu - every anchor leading
    back to the landing - its theme and its footer, the sections the home
    SDK marked `frame: true`) when `SiteFrameLayout.registered` is true;
  * keeps its own `CompanyFrame` / `LegalFrame` otherwise, so a shell
    composed without a home landing renders exactly as 1.1.0 did.
  The legal pages read the session (`getPlatformSession`) and the data
  mode (`siteDataMode`) for the frame, as the company pages already did.
  This SDK imports no home SDK: the home SDK opts in by marking its theme
  and footer sections in the registry it already fills, and nothing here
  names one.
* `components/custom/legal/load-legal-doc.ts`: `loadLegalDoc(slug)`
  mirrors base_sdk 1.45.0's `listPublicTerms()` rule per slug. The folder
  is still the document outright when `siteLegalDocs()` says so (1.1.0);
  otherwise the backend is asked and wins with an ENABLED document, and
  when it answers nothing for the slug - no such document, a disabled
  one, a refused guest read, a failed call - NEW `bundledLegalDoc(slug)`
  answers the bundled `data/legal/<slug>.md` page in any data mode that
  bundles the folder (`hasSiteData("legal")`; a failed read is logged and
  `null`). So the slugs base 1.45.0's index lists on a hybrid shell whose
  backend publishes nothing no longer 404 on their own page; a shell with
  no folder answers what it did. `loadLegalIndex` is unchanged.
* Floors: base_sdk >= 1.47.0 (`components/custom/landing/site-frame.ts`,
  `components/custom/site-frame.tsx`), >= 1.45.0
  (`app/actions/base/legal.ts`, the index that lists the bundled slugs the
  document page now answers); the 1.38.0, 1.35.0 and 1.37.0 floors as
  before. Still never the home SDK; no dependencies or integrations.
* Install notes: nothing to write. A shell whose home SDK has not yet
  marked its frame sections keeps the 1.1.0 frames until it does; the
  content stays the shell's `data/` folder (`about.md`, `team.json`,
  `legal/`), and this SDK carries no copy for it.
* Tests: `tests/test_manifest.py` - the two 1.47.0 prerequisites and the
  1.45.0 floor, every page awaiting `resolveSiteFrame` beside its loads,
  sitting in `SiteFrame` when registered and in its own frame otherwise,
  the fallback frames still installed and unchanged, the loader's rule
  and that no page reads the reader or the actions itself; NEW
  `tests/load-legal-doc.test.mts` (node) executes `loadLegalDoc` and
  `loadLegalIndex` against a stub backend, gateway and reader: the folder
  outright on a local shell and on a hybrid shell with no backend, the
  backend's enabled document winning, a null, disabled or failing answer
  falling back to the bundled slug in hybrid and backend-with-folder
  modes, an unknown slug and a shell with no folder still `null`.

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
