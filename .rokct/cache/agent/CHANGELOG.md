# Changelog

## 1.14.0

Requires base_sdk >= 1.24.0 (HeaderBrand.badge, HeaderBrand.collapse and
the "secondary" HeaderMenuAction.variant) and auth_sdk >= 1.7.0 as
before. An older HeaderBrand rejects the extra properties at build time,
so this version must not be composed over base_sdk <= 1.23.0.

* The header's brand is the old header's brand again. Ray, 2026-09-09, on
  rokct.ai after PR #147 (base_sdk 1.21.0, agent_sdk 1.12.0): "header lost
  functions the old rokct header had"; the standing ruling is that
  rokct.ai keeps EVERYTHING its old host header (rokctai_frontend's
  hand-written `components/custom/header.tsx` before its PR #143) had.
  Set against that file, the shared header rendered the menu, the panel,
  the badges, the Chrome CTA, the burger and the auth state, but had
  dropped what the old header did with its BRAND. `agent-header-menu.ts`
  now declares it, through base_sdk 1.24.0's `HeaderMenu.brand`:
  * `badge: true` - the mark with its BETA strip (the old header's
    `<BrandLogo width={44} height={44} showBadge={true} />`).
  * `collapse: { delayMs: 1500, code: brandingCode }` - the wordmark at
    60px that slid away 1.5s after load, leaving the mark, the visitor's
    COUNTRY CODE and a chevron; the desktop nav fading with it and coming
    back on hover or scroll. `brandingCode()` reads the code and its
    inline style from `getBrandingSync()` (app/config/platform.ts, already
    a `requires` file), the same cache the old header read, on the client
    after mount; an empty cache collapses to the mark alone, as before.
  * `chat-rokct` is `variant: "secondary"`: the old nav drew "Chat with
    ROK" as a filled muted button (`bg-zinc-700`), not an outline; base
    paints it in the shell's secondary tokens.
* Not restored, on purpose: the old header's bar width
  (`max-w-screen-2xl`), its mobile panel's `text-2xl` links, its panel's
  fade-and-slide, the mobile CTA's `#4f46e5` and the Chrome Web Store
  icon hot-linked from a third party's CDN - shared chrome, hard-coded
  colours, or a third-party asset; see base_sdk 1.24.0's CHANGELOG. The
  extension CTA still opens rokct's own Chrome Web Store listing, the
  target the old header had; no other store link was added.
* `tests/test_manifest.py`: `test_header_menu_declares_the_old_brand`
  ties the declaration (badge, collapse with its delay and resolver,
  the secondary variant, the resolver's source) to the module, and the
  floors test names base_sdk 1.24.0.

## 1.13.0

Requires base_sdk >= 1.23.0 (the network-strip registry) and auth_sdk >=
1.7.0 as before. Against a base between 1.20.0 and 1.22.0 the shell still
composes - the registry line is skipped with a warning and the module
sits unused - but rokct.ai is not complete without the strip.

* Telephony plans leave rokct.ai (they sell on the telephony shell),
  2026-09-09. The one server-side filter in
  `components/custom/landing/agent-plans-query.ts` is now
  `[["plan_category", "not in", ["Hosting", "paas", "Telephony"]]]`,
  spelled as the backend fixtures spell the category, and
  `pricing.hiddenCategories` in `agent-landing-config.ts` names
  `"telephony"` beside `"lms"`, `"hosting"` and `"paas"` (the frontend
  compares case-insensitively). The `telephony` entry in
  `pricing.categoryStyles` stays: an unused surface is flagged, never
  removed. rokct.ai now lists only its own plan categories; every product
  category is registered in base's plans-query registry by that product's
  home SDK, never by editing the backend.
* The Merlin logo wall is off: `AGENT_LANDING_CONFIG.logos` is `null`
  (Ray, 2026-09-09: "everything served from another company cdn tells
  you is placeholder"). `components/custom/logos.tsx` stays in the tree
  and registered, and renders nothing on `null` - an unused surface is
  flagged, never removed; the network strip takes the slot under the
  hero.
* rokct.ai says where base_sdk 1.23.0's NETWORK STRIP goes. Ray,
  2026-09-09: rokct.ai must not list his other products as choices (each
  has moved to its own shell), but a founder landing on rokct.ai's free
  opportunities pages must still learn about them - a clickable logo
  strip, headed "Trusted by" in his words ("these products already trust
  rokct as they run on it"). He also asked: "rokct already has a section
  called logos, but is it enough?" It is not. `components/custom/logos.tsx`
  is a marquee of Walmart, Cisco, Netflix, Pinterest, Zoom, Sony, Ebay and
  Uber images hotlinked from a third party's CDN (`cdn.getmerlin.in`, a
  chat template's leftover, `AGENT_LANDING_CONFIG.logos`), headed "Trusted
  by professionals at", none of them a link, on /landing only (order 20,
  after the chat section). It stays as it is: an unused surface is
  flagged, never removed.
  * `components/custom/landing/agent-network-strip.ts` (new)
    default-exports this shell's `NetworkStripConfig` for
    `// @rokct-sdk-network-strip-start`
    (`components/custom/landing/network-strip.ts`, base_sdk 1.23.0):
    `placement: { landing: "afterHero", footer: true }` and nothing else -
    base's heading (Ray's wording), the list's order, nothing hidden.
    rokct.ai itself is left out by base, which matches the shell's host
    (`NEXT_PUBLIC_SITE_URL`, else the `url` agent-site-metadata.ts
    registers, `https://rokct.ai`) against its one list
    (`network-sites.ts`: rokct.ai, Supacharge, juvo; hosting and telephony
    hidden until Ray picks their domains). The shape is written out here
    rather than imported, as agent-site-metadata.ts does, so an older
    base still compiles.
  * WHERE. `afterHero` puts the strip right under the hero on /landing -
    the slot a trusted-by row takes, above this SDK's logos marquee.
    `footer: true` puts it above base's `FooterChromeRow`, which is how
    the pages outside /landing get it. Two host facts, flagged rather than
    fixed here: rokctai_frontend's `components/custom/footer.tsx` (the
    footer `app/layout.tsx` renders on EVERY page) still keeps its own
    copy of the copyright row and does not render `FooterChromeRow`, so
    it must adopt the row (or render `<NetworkStrip surface="footer" />`
    itself) before the strip reaches those pages; and the hero's
    opportunity results link to `/opportunities/<type>/<slug>`, a route
    neither this SDK nor the shell installs today.
  * No ad network, no click tracking: the module names no URL at all; a
    link is the site's origin from base's list and nothing more.
  * `tests/test_manifest.py` asserts the install, the integration line
    and its base marker, the placement, that the module names no URL and
    no tracking word, and stages it under node
    (`tests/network-strip.test.mts`) to execute the default export.

## 1.12.0

Requires base_sdk >= 1.20.0 (`HeaderMenuAction.icon`) and auth_sdk >= 1.7.0
(the register registries).

* rokct.ai's register is injected through auth_sdk's register registry.
  Ray, 2026-09-09: "register is not fitting for all, what rokct need is not
  what all needs, any home sdk need to inject what it needs, just like dart
  auth sdk has". auth_sdk 1.7.0 owns the register FLOW - first name, last
  name, email, password, the sign-in - and moved everything rokct-specific
  OUT of its `actions.ts` and `auth-form.tsx`: control provisioning under
  the platform administrator's keys
  (`control:provision_service_subscription` /
  `control:provision_new_tenant`, the `adminCredentials` read), the plan
  select and the `?plan=` prefill, the industry catalogue
  (`getIndustries()`), the country and currency lookup
  (`get_pricing_metadata`), the voucher, the service-plan domain and the
  plan-dependent auto-login rule. Until this SDK put them back, a rokct.ai
  shell on auth 1.7.0 had a generic account form and no provisioning.
  * `components/custom/auth/agent-register-config.ts` (new) default-exports
    the `RegisterConfig` for `// @rokct-sdk-register-start`
    (`components/custom/auth/register-registry.ts`): `enabled: true`, the
    copy `register/page.tsx` carried ("Create Account", "Join thousands of
    companies using {PLATFORM_NAME}", "Get Started", "Already have an
    account?", "Sign in"), and the fields `auth-form.tsx` carried, in its
    order, labelled through the shell's `t` under the same `auth.*` keys:
    `plan` (a select over `getSubscriptionPlans()`, labelled
    `auth.plan_suffix`, `fromQuery: "plan"` for base's
    `LANDING_CONFIG.planSignupUrl` link, "Free" when the URL names none),
    `industry` (a select over `getIndustries()`, required, the form's nine
    fallback names when the read answers nothing), `company_name`
    (required), `country` (required), `voucher_code` and `domain`. No
    post-account steps: rokct.ai's flow had none.
  * `app/(auth)/agent-register-provision.ts` (new) default-exports the
    `RegisterProvisioner` for `// @rokct-sdk-register-provision-start`
    (`app/(auth)/register-provision.ts`): the removed `register()` control
    flow in the same order with the same answers - country and currency
    from `get_pricing_metadata` ("South Africa" when the field is empty,
    "USD" when the site names no currency), "System not initialized.
    Administrator must login first." without an administrator, with a
    company name `control:provision_service_subscription` (Service plan:
    user, domain, one line) or `control:provision_new_tenant` (tenant
    plan) against `ROKCT_BASE_URL` with the administrator's keys as an
    `Authorization` header and the 60s provisioning timeout, "Service
    Provisioning failed" / "Tenant Provisioning failed" on a non-2xx
    answer, "Provisioning exception occurred." on anything else - and the
    auto-login rule as the outcome's `signIn`: a Service plan signs in as
    a normal PaaS login, a tenant AI plan as an onboarding login
    (`extra: { is_onboarding: "true" }`), a tenant non-AI plan not at all
    (`signIn: false`; the site is still being set up). auth adds `is_paas`
    and does the signing in. The provisioner names no `siteName` on
    `signIn`, as the old `loginParams` named none.
  * `app/(auth)/agent-register-helpers.ts` (new): the pieces of that flow
    as they were, moved rather than rewritten - `PROVISIONING_TIMEOUT_MS`,
    `resolveRegisterLocale()` (the raw per-method `get_pricing_metadata`
    fetch; the control site registers no gateway cmd for it),
    `provisionServiceSubscription()` and `provisionNewTenant()` (the two
    `platformCall`s with their payloads), `lookupPlan()` (the
    `getSubscriptionPlans()` read the old auto-login step did), and the
    two rules `isServicePlan()` / `isAiPlan()`.
    `app/(auth)/agent-register-actions.ts` (new, "use server") is
    `getIndustries()` exactly as `actions.ts` exported it - the Industry
    Type catalogue under the administrator's keys - because the config's
    option loader calls it from the client.
  * Two things the registry cannot say, so they moved to the server. The
    domain field used to appear only once a Service (hosting) plan was
    selected and the form sent a hidden `is_service_plan` flag with it; a
    `RegisterField` has no visibility rule, so `domain` is asked as an
    optional field and the provisioner decides service-or-tenant from the
    plan catalogue with the rule the form used (`plan_type` "Service", or
    a name involving hosting; a flag a form still sends is honoured). The
    voucher sat behind a "Use voucher" toggle; it is an optional field.
    The country's default used to be the visitor's branding country
    (`getGuestBranding().countryName`); a `RegisterField` has no async
    default, so the field starts empty and the provisioner's "South
    Africa" fallback applies.
  * The provisioner touches no database. The local user row that maps a
    registered email to its site (auth's `tenantLink.linkRegistration`)
    is auth's write, not this SDK's: the provisioner hands the provisioned
    site back as the outcome's `siteName` for auth to record. No
    credential value is written anywhere; the administrator comes from
    `loadTenantLink().adminCredentials()` (the GlobalSettings row on a
    multi-tenant shell, `ROKCT_ADMIN_API_KEY` / `ROKCT_ADMIN_API_SECRET`
    on a single-tenant one).
  * `manifest.json`: four new installs, two new integrations
    (`agent-register-config`, `agent-register-provision`), new `requires`
    (`app/(auth)/tenant-link.ts`, `app/(auth)/register-provision.ts`,
    `components/custom/auth/register-registry.ts`,
    `lib/actions/getSubscriptionPlans.ts`) with their auth_sdk floors in
    `_comment`. Against auth_sdk <= 1.6.0 the two registry files are
    absent, the installer prints 'Integration target not found' and skips
    the lines, and the shell keeps auth 1.6.0's inline register page.
* The Chrome glyph is back on the header's "Add ROK Extension" button
  (Ray, 2026-09-09: "rokct got its header back but it think it lost its
  chrome icon"; the 1.11.0 known gap). base_sdk 1.20.0 added
  `HeaderMenuAction.icon` and the `chrome` glyph (lucide's own mark, no
  hot-linked image), so `agent-header-menu.ts` sets `icon: "chrome"` on
  the `add-extension` action. Nothing else about the menu changes.
* `tests/` (new): `test_manifest.py` in auth/nextjs's style - the manifest
  and its two register integrations, the floors, the new files' words -
  and two node suites it runs against staged copies with the host modules
  stubbed: `register-config.test.mts` (the config registers enabled with
  rokct's fields and copy; the header menu's `add-extension` carries
  `icon: "chrome"`) and `register-provision.test.mts` (the provisioner is
  the default export; no administrator stops it; a Service plan
  provisions a subscription and signs in; a tenant AI plan provisions a
  tenant and signs in for onboarding; a tenant non-AI plan does not sign
  in; a non-2xx answer is the provisioning failure; the site comes back as
  `siteName`).

## 1.11.0

* rokct.ai lists neither Hosting nor paas plans: Hosting plans belong to the
  hosting shell, paas plans to the delivery-platform storefront. Ray,
  2026-09-09, once the delivery-platform storefront was ruled the seller of
  the delivery platform and its paas plans: "means paas plans leave rokct
  too". Same mechanism as 1.10.0 - each shell filters the shared
  `Subscription Plan` catalog by `plan_category` from its home SDK, the
  backend never learns about shells and no plan id or name is written down.
  * `components/custom/landing/agent-plans-query.ts`: the one filter laid
    over base's generic `LANDING_CONFIG.plansQuery` payload is now
    `[["plan_category", "not in", ["Hosting", "paas"]]]` (a `not in` list
    instead of `!=` one value). The category strings are spelled as the
    backend fixtures spell them - `Hosting`, `paas` - because the server
    compares them verbatim.
  * `agent-landing-config.ts`: `pricing.hiddenCategories` is
    `["lms", "hosting", "paas"]`. The frontend's `hiddenCategories` compare
    case-insensitively (pricing.tsx lower-cases both the config ids and the
    plan's category), so the client-side belt catches a paas row whatever
    its case, as it does a hosting row.
  * The rule, for the next shell: a product shell shows only its own plan
    categories, registered in base's plans-query registry by that shell's
    home SDK, never by editing the backend.
  * The base_sdk floor is unchanged at 1.18.0.
* Known gap, not fixed here (Ray, 2026-09-09: "rokct got its header back
  but it think it lost its chrome icon"). In rokctai_frontend's hand-written
  header the Chrome Web Store mark sat on the "Add ROK Extension" ACTION
  button (a 16px hot-linked third-party CDN image, never an asset in the
  repo); the Browser Extension card in the panel drew FiBox, which is the
  `box` icon 1.9.0 ported. base_sdk 1.18.0's `HeaderMenuAction` has no
  `icon` slot and its closed `HeaderMenuIcon` set has no Chrome glyph, so
  `agent-header-menu.ts` cannot carry it without a base change; a
  hot-linked trademark image is not brought back. Follow-up: base adds
  `icon` to actions and a `chrome` glyph, then this SDK sets it on
  `add-extension`.

## 1.10.0

* rokct.ai no longer shows the platform's hosting plans. Ray, 2026-09-09:
  the hosting shell is "just a seperate frontend for rokctapp, but it points
  to control site. just hosting focused and filter subscriptions to show
  only hosting related" - and "this means rokctai_frontend will also filter
  out hosting related subscriptions". One control backend serves several
  storefront shells, so each shell filters the shared `Subscription Plan`
  catalog by `plan_category` from its home SDK; the backend never learns
  about shells and no plan id or name is written down anywhere.
  * New `components/custom/landing/agent-plans-query.ts` default-exports a
    `LandingPlansQuery` for base_sdk's plans-query registry
    (`components/custom/landing/plans-query.ts`, base_sdk >= 1.9.0): base's
    generic `LANDING_CONFIG.plansQuery` - same doctype, fields and order -
    with one filter laid over its payload,
    `[["plan_category", "!=", "Hosting"]]`. The manifest registers it with
    one line at `// @rokct-sdk-plans-query-start`, so the filter runs on the
    server and the hosting rows are never fetched. A host whose
    `landing-config.ts` sets `plansQuery` to `null` still prefetches no
    plans: the module exports `null` in that case.
  * `agent-landing-config.ts`: `pricing.hiddenCategories` is
    `["lms", "hosting"]` (pricing.tsx lower-cases both sides before it
    compares), the client-side belt to that server-side brace, so a plan
    row that reaches the section by any other path is dropped too.
  * `pricing.categoryStyles.hosting` stays where it is: an unused surface
    is flagged, never removed, and the hosting shell's home SDK registers
    the opposite query (Hosting only) against the same catalog.
  * The base_sdk floor is unchanged at 1.18.0; the plans-query registry
    has been in base since 1.9.0 and `plans-query.ts` is now listed in
    `requires` beside the other registries this SDK writes into.

## 1.9.0

* The registered header menu fills base_sdk 1.18.0's mega-panel fields, so
  rokct.ai gets its mega menu back. Ray, 2026-09-09: "no mega menu anymore"
  on rokct.ai is a regression; rokct keeps everything its old header had.
  base_sdk 1.14.0 to 1.16.0 opened a dropdown PER group, so the five columns
  1.8.0 registered became five narrow menus on the bar; 1.18.0 opens them
  as ONE panel under the first group's label and draws an item with a
  `description` or an `icon` as a card.
  * `components/custom/landing/agent-header-menu.ts`: Product stays the
    first group, so "Product" is the one desktop trigger as it was in the
    hand-written header. Its three platform entries carry what the old
    panel's left-hand cards showed: Browser Extension `icon: "box"` with
    `header.chrome_support` ("Supports Chrome"), Web App `icon: "globe"`
    with `header.browser_support` ("Open in browser"), Mobile Apps `icon:
    "smartphone"` with `header.mobile_support` ("iOS and Android") - the
    FiBox / FiGlobe / FiSmartphone tiles and their blurbs, read through
    `word(key, fallback)` like every other label. AI Chat, Productivity,
    Tools and Summary are unchanged and render as the four headed columns
    beside the cards, exactly the old right-hand grid.
  * The base_sdk floor is 1.18.0: `description` and `icon` are extra
    properties on a `HeaderMenuLink` literal, which TypeScript rejects
    against an older `HeaderMenu`, so 1.9.0 must not be composed over
    base_sdk <= 1.17.0. The manifest `_comment` entries for
    `components/custom/landing/header-menu.ts` and
    `components/custom/header-menu.tsx` say so.

## 1.8.0

* rokct.ai's header menu is registered into base_sdk's shared header. Ray,
  2026-09-09: rokct.ai and supacharge.app must use ONE header, the same
  component, with the menu inside it. base_sdk 1.14.0 ships that header and
  its `header-menu.ts` registry (anchors, links, `groups`, `actions`); what
  it cannot know is rokct.ai's WORDS, which lived only in
  rokctai_frontend's hand-written `components/custom/header.tsx` and the
  `PLATFORM_FEATURES` registry in `app/config/features.ts` it drew its mega
  menu from. New `components/custom/landing/agent-header-menu.ts`
  default-exports those words as a `HeaderMenu`, entry for entry, and the
  manifest registers it with one line at `// @rokct-sdk-header-menu-start`.
  * `pricing` is an ANCHOR, not a link: `copied-pricing.tsx` registers
    `{ id: "pricing", label: "Pricing" }` in its `meta.nav`, so base lifts
    the label from the live nav and drops the entry on a render where the
    section is not on the page, which a hand-written `#pricing` could not.
    Affiliate (`/affiliate`) and Teams (`/teams`) are routes the page has no
    section for, so they are fixed `links`.
  * The Product dropdown's five columns are `groups`: Product (Browser
    Extension, external to the Chrome Web Store; Web App `/dashboard`;
    Mobile Apps, SOON), AI Chat (Chat with ROK `/chat`), Productivity (AI
    ERP SOON, Tender Assist NEW, Telephony), Tools (Fraud Detector, Loan
    Management, Tenders NEW, Funding NEW) and Summary (YouTube Summarizer,
    Article Summarizer). Unreleased features keep their `#` hrefs; base
    renders a SOON entry non-navigable, so none of those is followed.
    `features.ts` marks Mobile Apps `label: "none"`; it is SOON here on
    Ray's instruction for this menu.
  * `actions`: Chat with ROK (`/chat`, ghost) and Add ROK Extension (Chrome
    Web Store, primary, external) - the two buttons at the right-hand end of
    the old header.
  * Labels come from the shell's own dictionary through `t`
    (`app/lib/i18n`, already a `requires` file; rokctai_frontend's en.json
    carries every `features.*` and `header.*` key used), read once at module
    load since `t` is a synchronous lookup over static JSON and the
    header-menu contract wants already-translated strings. A `word(key,
    fallback)` helper keeps the English beside each key so a shell whose
    dictionary lacks a key shows the word rather than the key.
* `components/custom/floating-nav.tsx` draws its new/soon pill with base's
  ONE `components/custom/menu-label.tsx` (`MenuLabel`: bg-primary with black
  text, Ray: "use primary color and text in black") instead of its own
  `bg-primary text-primary-foreground` span, so the nav and the header the
  menu now lives in cannot show two different pills.
* `components/custom/landing/agent-hero-form.tsx`: the send button's active
  state paints `bg-primary text-black hover:bg-primary/90` instead of the
  hard-coded `bg-yellow-400 … hover:bg-yellow-500`, so rokct.ai's brand
  colour lives in the shell's `--primary` token like everything base renders
  since 1.14.0 (the hero's rotating word, the menu label). It was the only
  brand yellow left in this SDK's templates: the remaining `yellow-*`
  classes (`components/tasks/deal-task.tsx` priority border,
  `components/notes/note-card.tsx` sticky-note palette,
  `components/flights/boarding-pass.tsx` ticket, `components/custom/
  weather.tsx` sun, `components/overviews/project-overview.tsx` on-hold
  status) are semantic colours, not the brand, and are unchanged.
* New `components/custom/landing/agent-site-metadata.ts`: rokct.ai's site
  metadata - siteName, url, `<title>`, tagline, description, keywords,
  `en_ZA`, and `/images/logo.svg` as the logo base draws into its generated
  Open Graph / Twitter preview image - default-exported for base_sdk
  1.15.0's site-metadata registry and registered with one integrations line
  at `// @rokct-sdk-site-metadata-start` in
  `components/custom/landing/site-metadata.ts`.
  * That registry is OPTIONAL in this release's base floor. Against
    base_sdk 1.14.0 the target file does not exist and
    `sdk_installer_base.py update_integrations()` prints "Integration
    target not found" and skips the line, so the module installs and sits
    unused; for the same reason it declares the shape it fills
    (`AgentSiteMetadata`, the `SiteMetadataCopy` fields) instead of
    importing base's type, because an `import type` of a file that is not
    on disk is a compile error and a shell on 1.14.0 must still build.
* `templates/app/(chat)/opengraph-image.png` and `twitter-image.png` are
  removed. They were the Vercel "Gemini Chatbot Starter Template" cards
  1.6.0 took over from the shell with the rest of the `(chat)` tree; with
  nothing at those App Router conventions, base's generated preview image
  (drawn from the metadata above once base 1.15.0 is composed) wins. The
  `(chat)` directory install is unchanged - it walks whatever is there, so
  there was no per-file install line to remove.
* base_sdk floor: >= 1.14.0. `requires` lists
  `components/custom/landing/header-menu.ts`,
  `components/custom/header-menu.tsx`, `components/custom/menu-label.tsx`
  and `components/custom/landing/site-metadata.ts` (the last one optional,
  as above), and the manifest's per-file notes say which base version
  carries each.

## 1.7.0

* Cuts rokct.ai's landing page height on a phone by laying its feature cards
  out as ONE swipeable row instead of a column of ten. Ray, 2026-09-09, after
  the same change landed on supacharge.app: "why rokctai didnt benefit from
  the change?"
* It did not benefit because the sections are NOT SHARED. base_sdk holds only
  the landing HOST - the page, the orchestrator, the `page-sections.ts`
  registry and the hero - and every content section belongs to the home SDK
  (`base/nextjs/templates/components/custom/landing/page-sections.ts` says so
  in as many words). Supacharge's cards are lms_sdk's components and
  rokct.ai's are this SDK's, so lms_sdk 1.8.0 could not reach them however it
  was written. This is that change made here, in this SDK's own files.
* `components/custom/landing/agent-card-row.ts` is the mechanism: one
  exported class string, `AGENT_CARD_ROW`, that a card grid adds to the grid
  it already has - not a special case written into each section. Every
  utility in it is behind Tailwind's `max-sm:`, so the whole row compiles
  into a single `@media not all and (min-width: 640px)` block and there is no
  declaration outside it that could reach a larger screen.
  * A class string rather than lms_sdk's `.sc-row` stylesheet rule, because
    that SDK already ships `landing/lms-theme.css` for Supacharge's tokens
    and this one ships no CSS at all. Every section here is Tailwind; the row
    is Tailwind too, rather than becoming this SDK's first and only
    stylesheet plus an import seam to carry it.
  * Sized and snapped like the plan scroller `pricing.tsx` already runs a
    section away - `snap-x snap-mandatory` over a card at 85% of the row with
    centre snap - so rokct.ai has ONE scroller pattern rather than a second
    one that looks almost like the first.
  * Two deliberate departures from `pricing.tsx`. The scrollbar is actually
    hidden here: `pricing.tsx` asks for that with a `no-scrollbar` class that
    is defined nowhere in this SDK or the shell, so only its inline
    `scrollbarWidth` reaches Firefox while webkit still draws base_sdk's
    yellow thumb (`app/styles/rokct-scroll.css`) under the row;
    `[&::-webkit-scrollbar]:hidden` is the rule that class is missing. And
    there is no `scroll-snap-stop: always` - lms_sdk's row pins every swipe
    to one card, `pricing.tsx` does not, and with ten feature cards a fling
    that can cross several beats nine separate swipes.
* `all-features-section.tsx` is the ONLY section that takes it, because it
  was the only stacked card grid on the page. Ten cards, each a 120px image
  over a title, is about 2 200px of column - roughly a third of the whole
  landing page and by far the tallest thing on it; as a row it is one card
  high. Its grid drops the `grid-cols-1` it no longer needs and pins
  `sm:grid-cols-1` in its place, because its first column break is `md:` and
  that `grid-cols-1` was also holding the 640-767px band.
* Left alone, and why: `chat-section`, `social-section` and `workflow-section`
  are already embla carousels one card wide on a phone; `pricing` is already
  a horizontal snap scroller; `logos` and `testimonials-section` are already
  marquees; `copied-pricing` is a fixed-height card fan you click through,
  not a stack; `faq-section` is a collapsed accordion, already short, and a
  row of expanding panels would fight itself; `floating-nav` is chrome and
  `agent-opportunities` is a list of result rows, not cards. Converting any
  of them would have made the page worse, not shorter.
* Desktop and tablet are untouched, and mechanically so: compiled with the
  shell's own Tailwind 3.4.19, every declaration on the grid is identical
  before and after at 640, 700, 767, 768, 900, 1024, 1100, 1280, 1440 and
  1920px. No base_sdk change and no new seam - the floor is unchanged at
  `>= 1.10.0`.

## 1.6.0

* rokctapp's floating nav renders base_sdk 1.10.0's optional nav badge.
  `LandingNavItem` grew `badge?: "new" | "soon"`; `floating-nav.tsx` now
  draws it as a pill in the hover tooltip beside the label, in the shape
  rokct.ai's header menu has always used (9px, bold, uppercase, tight
  tracking, full radius) and the shell's own `primary` token rather than
  the header's hard-coded `bg-yellow-400` - the same nav in lms_sdk is
  Supacharge orange, and neither should be nailed to the other's accent.
  The badge word joins the button's `aria-label`, since the pill only
  appears on hover.
* No section of this SDK sets a badge, so rokctapp's landing page is
  unchanged: every entry is still `{ id, label }` and renders exactly as
  before. This is the renderer, so that a rokctapp section CAN say it.
* Requires base_sdk >= 1.10.0 for the field to exist.

## 1.5.0

* Holds the hero's chat box and registers it into base_sdk 1.7.0's hero form
  slot. Ray, 2026-09-08: "no hero work same way as landing, they need to be
  injected like generic profile, chat box is for chat related stuff, i think
  if agent sdk is home it inject that chat" - the generic hero now carries
  no input of its own, only a slot, and the home SDK that owns chat puts the
  chat box there. rokctapp's composed hero renders the same DOM as before:
  the box moved, byte for byte, it did not change.
  * `components/custom/landing/agent-hero-form.tsx`: the search-style input,
    its typewriter placeholders (the hero copy's plus every registered
    section's), the submit (the registered sections if any, else the hero
    copy's `fallbackHref`) and the results the sections registered in
    `components/custom/landing/hero-sections.ts` render under the input -
    exactly the markup base_sdk's `hero.tsx` had up to 1.6.0. That registry
    is now loaded and rendered by this box rather than by the hero; the
    hero-sections integration for `agent-opportunities` is unchanged. What
    the hero still needs - that the visitor is using the box, that results
    are showing, the headline words the sections add - goes back through
    the `HeroFormProps` callbacks (`onFocusChange`, `onActiveChange`,
    `onHeadlineWordsChange`).
  * Registered with one `integrations` line at
    `// @rokct-sdk-hero-form-start` in
    `components/custom/landing/hero-form.ts`,
    `{ id: "agent-chat", load: () => import("@/components/custom/landing/agent-hero-form") }`,
    the same one-marker contract as the hero-sections, hero-copy, nav and
    compose-flag entries; `hero-form.ts` joins `requires`.
  * Order-safe against base_sdk: the form types its props structurally
    instead of importing `hero-form.ts`, so a shell composed with this
    version and a base_sdk older than 1.7.0 still type-checks - the
    installer skips the integration with a "target not found" line, the
    file is installed but unused, and the hero keeps its own box. So this
    lands before core's base_sdk 1.7.0, and nothing changes on rokct.ai in
    between.

## 1.4.0

* Holds rokctapp's landing page sections and registers them into base_sdk
  1.5.0's generic landing host. Ray, 2026-09-03: "each home sdk holds its
  own landing page", "similar to profile in dart" - base_sdk keeps the page,
  the orchestrator, the section registry and the hero; the home SDK keeps
  the content. base_sdk's `components/custom/landing-content.tsx` names no
  section; it loads whatever is registered in
  `components/custom/landing/page-sections.ts`, so this half contributes
  one `integrations` line per section after
  `// @rokct-sdk-page-sections-start`,
  `{ id: "<file>", load: () => import("@/components/custom/<file>") }`, the
  same one-marker contract as the hero-sections, nav and compose-flag
  entries, in page order (the installer anchors each line after the
  previous one). That registry, base_sdk's `landing-config.ts` and
  `app/actions/base/landing.ts` join `requires`; base_sdk composes first.
  * Section templates on the shell's own paths (the composer overwrites the
    shell copies; the markup is the shell's), each with a default export
    and a `meta` export carrying its `order` and floating-nav entries:
    `floating-nav.tsx` (order -1: renders before the hero as a fixed
    overlay and receives the whole nav from the page), `logos.tsx` (20, no
    nav stop), `social-section.tsx` (30, `social`),
    `all-features-section.tsx` (40, `features`), `workflow-section.tsx`
    (50, `workflow`), `pricing.tsx` (60, anchor `pricing-original`; takes
    the page's prefetched `plans` and keeps the category tab state itself),
    `copied-pricing.tsx` (70, `pricing`), `faq-section.tsx` (80, `faq`) and
    `testimonials-section.tsx` (90, `testimonials`) - the shell's landing
    order, with the chat section at 10.
  * `components/custom/landing/agent-landing-config.ts` holds every word,
    image, link and price on those sections (`AGENT_LANDING_CONFIG`: one
    block per section - `logos`, `social`, `features`, `workflow`,
    `pricing`, `compare`, `faq`, `testimonials`); a `null` block hides its
    section, so a host trims the page by editing one file and the
    installer's hash check keeps that edit on later composes. Copy is
    verbatim shell text (one mojibake decode in the FAQ). The plans query
    stays in base_sdk's `landing-config.ts` as `plansQuery`; `pricing.tsx`
    still asks for currency localisation through `pricing.localize`
    (default: the host's `lib/actions/getPricingMetadata.ts`).
  * `components/custom/chat-section.tsx` gains a default export (what the
    registry's dynamic import renders; the named `ChatSection` export
    stays) and a `meta` export with `order: 10` and its floating-nav
    entries (`chat`, `projects`, `crafts`, `research`) - the labels and the
    empty sub-anchors the shell's landing-content.tsx hardcoded now travel
    with the section. Its markup is unchanged.

## 1.3.0

* The agent-specific part of the RokctAI_frontend landing hero and the
  landing chat section move here (Ray, 2026-09-03: "the hero go to base
  and agent, the chat thing to agent"); base_sdk 1.4.0 ships the generic
  hero they plug into.
  * `components/custom/landing/agent-opportunities.tsx` is the hero
    section: the intent pass and the tenders/grants/equity results panel
    that used to sit inside the shell's `components/custom/hero.tsx`,
    behaviour unchanged, with the type filter moved fro