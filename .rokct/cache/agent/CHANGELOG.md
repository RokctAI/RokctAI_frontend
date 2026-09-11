# Changelog

## 1.18.2

Requires base_sdk >= 1.32.0 and auth_sdk >= 1.7.0 as before. No install,
integration or floor changes.

* The plan row no longer draws a scrollbar under itself. Ray asked for the
  card rows to be one horizontally swipeable row on a phone so the page is
  not a long vertical scroll; on the pricing section a scrollbar was still
  drawn under the row he asked to be swiped.
  * `components/custom/pricing.client.tsx` asked for the bar to be hidden
    with a `no-scrollbar` class, and that class is defined nowhere - not in
    this SDK, which ships no CSS at all, and not in the shell. It compiled
    to no rule, so the only declarations that reached a browser were the
    row's own inline `scrollbarWidth` and `msOverflowStyle`: Firefox and
    legacy Edge were covered and webkit was not, which left base_sdk's
    yellow thumb (`app/styles/rokct-scroll.css`) under the row in Chrome
    and Safari - every phone Ray looks at it on.
  * The row now states the rule itself, in the className, in the three
    forms the three engines read: `[scrollbar-width:none]` (Firefox),
    `[-ms-overflow-style:none]` (legacy Edge/IE) and
    `[&::-webkit-scrollbar]:hidden` (Chromium/WebKit). The inline style is
    gone, because it said a subset of the same thing in a second place.
  * Tailwind utilities rather than a stylesheet, and not a shared module,
    for the reason `landing/agent-card-row.ts` already gives: this SDK
    ships no CSS, every section in it is Tailwind, and a rule used by one
    component does not need a first-and-only stylesheet plus an import seam
    to carry it. `AGENT_CARD_ROW` hides its own bar with exactly these
    three utilities behind `max-sm:`; the plan row is a scroller at every
    width, so its three carry no breakpoint prefix.
  * Hiding the bar does not hide the scroll: `overflow-x-auto`, the snap
    axis and the 85% cards are untouched, so the row still swipes, still
    flings and still scrolls a focused card into view by keyboard - each
    card holds its own plan link, which is the keyboard path through the
    row. Compiled with the shell's own Tailwind 3.4.19, the class string
    emits `scrollbar-width: none`, `-ms-overflow-style: none` and
    `::-webkit-scrollbar { display: none }` and no `overflow` declaration
    changes; the same compile of the version before this one emits no
    webkit rule at all and no rule whatsoever for `no-scrollbar`.
  * The scrollbar was the row's only visual cue that it scrolls. The row
    keeps the affordance the rest of the page uses - the next card's own
    edge, which its 85% width leaves showing - and this entry adds no dots,
    arrows or gradient, because the class was missing and that is what is
    being fixed here.
  * Manifest: version 1.18.2.
* Tests: `test_the_plan_scroller_hides_its_scrollbar` pins the three
  utilities, the absence of the inert class and of the inline style that
  repeated it, and that the row still declares `overflow-x-auto`.

## 1.18.1

Requires base_sdk >= 1.32.0 and auth_sdk >= 1.7.0 as before. The names
the marquee draws are base's list: base_sdk 1.32.1 carries the Supacharge
entry's declared brand string, and a re-pin of both is what puts the right
name on rokct.ai.

* The logos marquee has its sizing and its feel back, and draws the
  network's names verbatim. Ray, 2026-09-10: "logos in rokct are wrong.
  wrong names and also it lost sizings and feel old one had". Live
  rokct.ai (agent_sdk 1.17.0 over base_sdk 1.29.0) showed the row as
  "Supacharge" and "juvo" in 18px text, resolved after hydration. Three
  causes, two of them here:
  * WRONG NAMES: base's `NETWORK_SITES` named the Supacharge site
    "Supacharge" - a re-cased, shortened form of the brand string the
    product declares ("supacharge.school", lowercase, Ray's 2026-09-10
    ruling) - and the site is a `wordmark` entry, so the marquee drew that
    form AS the brand. Fixed in base_sdk 1.32.1; this SDK never rewrites
    a name (no case transform, no truncation - tested), so the fix reaches
    the marquee on re-pin.
  * LOST SIZING: the old marquee drew every logo as a picture filling the
    item box (96x32 on a phone, 160x48 from `md`, `object-contain`), so
    each mark stood the box's full height. 1.17.0 kept the box for marks
    but drew a wordmark site as `text-lg` (18px) text inside it, a third
    of the height of the marks beside it. `components/custom/
    logos.client.tsx` now draws a wordmark AS a mark: `text-2xl` in the
    32px box and `md:text-4xl` in the 48px box (the letter height the old
    wordmark logos had), as wide as the name is, the old box's width as
    its minimum (`min-w-[6rem] md:min-w-[10rem] px-2`). A mark keeps the
    old box exactly (`h-8 w-24 md:h-12 md:w-40`, `object-contain`). The
    section, eyebrow, track, gaps (`gap-8 md:gap-16`), grayscale at 70%
    with full colour on hover, the 20s three-lane run and the paused-on-
    hover rule are untouched.
  * LOST FEEL: 1.17.0 read the strip in a client effect after hydration,
    so the served page had no row and it popped in after; the old section
    rendered with the page. `components/custom/logos.tsx`, the entry
    (a server component since 1.18.0), now resolves the strip on the
    server - `loadNetworkStrip()` and `resolveNetworkStrip()` from base's
    pure registry, the shell's own host as base's `loadSelfHost` resolves
    it (`NEXT_PUBLIC_SITE_URL`, else the registered site-metadata `url`,
    restated because base's `loadResolvedNetworkStrip` lives in its
    `"use client"` file) - asks `networkStripRendersAt(strip, "section")`
    once, and renders the marquee with the result as a prop. The row is in
    the first HTML, with alt texts, without JavaScript. The client half
    keeps the broken-image fallback and adds base's mount check for an
    image the browser failed before React attached `onError`.
  * Manifest: version 1.18.1. No install, integration or floor changes.
* The 1.18.0 entry above is rewrapped so no line starts with `#`
  followed by text: markdownlint MD018 read the wrapped "core #215:" as a
  heading and failed the host re-pin on `.rokct/cache/agent/CHANGELOG.md`.
  Wording unchanged.
* Tests: `test_logos_section_draws_the_network_sites` pins the entry's
  server-side resolution (the registry calls, the host rule, the
  `"section"` surface, the prop), the mark box, the wordmark box and type
  size, the name drawn verbatim with no case transform or truncation, and
  no effect-loaded strip; `test_section_entries_are_server_safe` accepts
  an async default export.

## 1.18.0

Requires base_sdk >= 1.32.0 (the landing rendered on the server,
core #215: `app/landing/page.tsx` reads each registered section's `meta`
through `components/custom/landing/landing-page.ts`) and auth_sdk >= 1.7.0
as before.

* Every landing section's ENTRY module is server-safe. Under base_sdk
  1.32.0 the page imports each `PAGE_SECTIONS` entry on the server to read
  `meta.order`, `meta.nav`, `meta.renders` and `meta.rootClass`. A module
  that starts with `"use client"` hands the server only client-reference
  proxies, so all four read undefined: the section's DOM id fell back to
  the module name, the floating nav said "Scroll to <module>", the
  header's `pricing` anchor (resolved against copied-pricing's `meta.nav`
  id) did not resolve and so was dropped, and no `renders()` rule could
  apply. The rule now, for every section this SDK registers:
  * The entry (`components/custom/<name>.tsx`, the file the
    page-sections integrations line imports) carries no `"use client"`,
    exports `meta` as plain data and a default component that renders on
    the server.
  * Hooks, state, effects, browser APIs and framer motion live in the
    sibling `components/custom/<name>.client.tsx`, which starts with
    `"use client"` and is rendered by the entry's default export with the
    props it needs (`id`; the prefetched `plans` for pricing; the whole
    `nav` for the floating nav) - all data, never a function, across the
    boundary. The entry re-exports the sibling's named component, so an
    import of `{ Pricing }`, `{ FaqSection }` and the rest from the entry
    path still resolves.
  * Split that way: `floating-nav` (IntersectionObserver, scroll-to, the
    framer tick), `chat-section` (carousel, framer cards), `logos` (the
    effect that awaits `loadResolvedNetworkStrip()` - exported by base's
    `"use client"` `network-strip.tsx`, so it stays a client call - and
    the broken-image fallback), `social-section` and `workflow-section`
    (carousels), `pricing` (billing toggle, currency selector, the
    localisation effect, the category scroll and the tab state, now the
    named client export `PricingSection`), `copied-pricing` (active-card
    state, the framer deck) and `faq-section` (open-item state, the
    framer accordion). Eight `.client.tsx` files, installed beside their
    entries.
  * Not split: `all-features-section` and `testimonials-section` have no
    hook, no effect, no browser API and no framer element - `next/image`
    renders on the server - so the whole section is the entry and there
    is no sibling.
  * Markup and behaviour are unchanged: the same elements, classes, ids
    and nav labels, the same interactions after hydration. `meta.renders`
    stays pure (no section declares one; none may read `window` or
    `localStorage`).
  * Checked and left alone: `agent-hero-form.tsx` and
    `agent-opportunities.tsx` keep `"use client"` - base loads the hero
    form through `next/dynamic` inside its client `hero-view.tsx`, and the
    form loads the hero sections itself, so the server never reads a
    `meta` from either; `agent-hero-copy.ts` and `agent-header-menu.ts`
    (the two registry modules the server does read) never carried the
    directive. This SDK registers no theme.
  * Manifest: version 1.18.0; the eight `.client.tsx` siblings installed;
    base floor 1.32.0 on the `page-sections.ts` and `hero-config.ts`
    notes.
* Tests: `test_section_entries_are_server_safe` (every installed
  page-sections entry module has no `"use client"` directive, exports
  `meta` and a default; every entry whose sibling exists imports it and
  the sibling starts with `"use client"`, carries no `meta` and is
  installed to the path beside its entry; no entry's `meta` names
  `window`, `document` or `localStorage`; the eight split names and the
  two unsplit ones are the ones listed here),
  `test_logos_section_draws_the_network_sites` reads the marquee from
  `logos.client.tsx` and the `meta` from `logos.tsx`, and
  `test_floors_are_stated` names 1.32.0.

## 1.17.0

Requires base_sdk >= 1.27.0 (the `"section"` landing placement of the
network strip and its once-per-page rule) and auth_sdk >= 1.7.0 as before.
Against base_sdk 1.23.0-1.26.0 the registry's placement type rejects
`"section"` and `networkStripRendersAt` has no `"section"` surface, so this
version must not be composed over an older base.

* The logos section is rokct.ai's "Trusted by" row. Ray, 2026-09-09: "we
  now have two trusted by instead of using the logos section rokct had",
  and "logos should not lose function and its look". rokct.ai's landing
  page showed base's strip under the hero (`landing: "afterHero"`) AND in
  the host footer, which the shell's layout draws on `/landing` too
  (`footer: true`). So:
  * `components/custom/logos.tsx` keeps its marquee - the same section,
    the same eyebrow, the same track (grayscale at 70%, full colour on
    hover, the run paused while hovered, three lanes shifted by a third
    every 20s through the host's `marquee` keyframes), the same item box -
    and its items are base's resolved network sites
    (`loadResolvedNetworkStrip` from `components/custom/network-strip.tsx`:
    the shell itself left out by host, base's order, minus what
    `agent-network-strip.ts` hides) under base's heading, "Trusted by". A
    site with a logo draws it (its dark twin in dark mode; its name if the
    image will not load), a wordmark site draws its name. Every box is a
    link to the site's own origin, `target="_blank" rel="noopener"`, and
    nothing else: no query string, no click handler, no measurement.
  * `components/custom/landing/agent-logos.ts`, the pure track rule: a
    lane repeats the list until it is at least eight items long
    (`LOGOS_LANE_MIN`), the track is that lane three times
    (`LOGOS_TRACK_LANES`), so a two-site list still fills a wide viewport
    and the -33.33% shift loops seamlessly. Executed under node.
  * `agent-network-strip.ts` registers `placement: { landing: "section",
    footer: true }`. base's `afterHero` and `beforeFooter` surfaces draw
    nothing on `/landing`, base's once-per-page rule keeps the footer
    strip off that route, and every other page - the opportunities pages,
    careers, legal, status - still gets the footer strip through
    rokctai_frontend's `footer.tsx` (`<NetworkStrip surface="footer" />`
    since host #148). One "Trusted by" per page.
  * `AGENT_LANDING_CONFIG.logos` and the `LogosConfig` type are gone. The
    block was `null` since 1.13.0; the list it used to hold - Walmart,
    Cisco, Netflix, Pinterest, Zoom, Sony, Ebay, Uber, hotlinked from a
    chat template's CDN - was never Ray's, and the section has no copy of
    its own now: the items are base's list, the heading base's default.
  * `mask-image-linear-gradient` on the track wrapper is kept as it was.
    No stylesheet in the host or in base defines it - the fade has been a
    no-op class since the section was written - so the look is unchanged;
    flagged here, not fixed.
  * Manifest: version 1.17.0; `agent-logos.ts` installed; requires
    `components/custom/network-strip.tsx` and
    `components/custom/landing/network-sites.ts` beside the registry;
    base floor 1.27.0.
* Tests: `test_logos_section_draws_the_network_sites` (the section reads
  base's resolved strip, asks for the `"section"` surface, links each
  site's origin with `target="_blank" rel="noopener"`, carries no
  third-party host, no tracking word and no click handler, keeps the
  marquee classes and the 20s run, and the config has no `logos` block),
  `test_network_strip_says_where_and_nothing_more` names `"section"`,
  `test_floors_are_stated` names 1.27.0, `network-strip.test.mts` asserts
  the placement and `logos-track.test.mts` executes the lane and track
  rule.

## 1.16.0

Requires base_sdk >= 1.26.0 (the platform marks under public/brand/marks/,
which base now installs on every host) and auth_sdk >= 1.7.0 as before.
Against base_sdk <= 1.25.0 the paths this SDK names resolve to no file and
the three hero badges and the header's extension button draw a broken
image, so this version must not be composed over an older base.

* The store marks are base_sdk's, not this SDK's. base_sdk 1.26.0 installs
  `public/brand/marks/chrome-web-store.svg`, `google-play.svg`,
  `app-gallery.svg`, `app-store.svg` and `windows.svg` on every host - the
  one set of official platform marks, shared by every home SDK - and a home
  SDK opts into a file by naming its path as the image src. So:
  * `templates/public/brand/marks/chrome-web-store.svg` and
    `google-play.svg` (1.15.0) are gone, with the `templates/public/brand`
    -> `public/brand` mapping they installed through: this SDK installs
    nothing under `public/` any more. base's chrome-web-store.svg is this
    SDK's 1.15.0 drawing; base's google-play.svg is lms_sdk 1.16.0's file
    (the same four Google colours, the triangle centred in a square frame)
    in place of this SDK's 994-byte one, so rokct.ai's Play badge draws
    the one file every shell draws.
  * `agent-hero-copy.ts` and `agent-header-menu.ts` keep the same path
    literals (`/brand/marks/chrome-web-store.svg`,
    `/brand/marks/google-play.svg`): nothing visible changes on the Chrome
    Web Store badge, the Google Play badge or the "Add ROK Extension"
    button.
  * The App Store badge draws the official file too. Ray, 2026-09-09:
    rokct.ai gets the same official App Store file supacharge.app has.
    `agent-hero-copy.ts` adds `APP_STORE_MARK` (`{ src:
    "/brand/marks/app-store.svg", alt: "App Store" }`) and names it under
    `"app-store"` in `LOCAL_MARKS`, in place of base's built-in Apple
    glyph, so all three of rokct.ai's badges now draw their platforms'
    official marks ("we use what these platforms use for familiarity").
  * No CSS. base applies the dark-mode treatment for the two monochrome
    files, app-store.svg and windows.svg, itself, keyed on the src
    basename, and never filters a coloured mark; a home SDK must not ship
    its own rule for them, and this SDK never did.
  * Manifest: the public/brand install entry is gone; base floor 1.26.0.
* Not touched: `agent-landing-config.ts`'s section images, which still
  hot-link from a third party's CDN - known placeholders under Ray's
  15:02Z ruling, out of this release.
* Tests (`tests/test_manifest.py`, 24 python):
  `test_chrome_mark_is_installed_locally` and
  `test_google_play_mark_is_installed_locally` become
  `test_marks_are_base_sdks_not_this_sdks` (no `templates/public` in this
  SDK, no install entry for it),
  `test_hero_copy_is_registered_where_base_looks` asserts the App Store
  entry and that every mark the hero and the header name is a
  `/brand/marks/` path, `test_header_and_hero_surfaces_name_no_third_party_host`
  keeps its no-`cdn.` rule over the header menu and the hero copy, the
  floor assertions add 1.26.0; node suite `hero-copy.test.mts` asserts the
  three badges and the header CTA draw base's files.

## 1.15.0

Requires base_sdk >= 1.25.0 (an image icon, `{ src, alt }`, on
HeaderMenuAction.icon) and auth_sdk >= 1.7.0 as before. An older
HeaderMenuAction.icon takes only the named glyphs and rejects the object at
build time, so this version must not be composed over base_sdk <= 1.24.0.

* The Chrome Web Store mark is back on rokct.ai, served by the shell
  itself. The old host header drew it on "Add ROK Extension" as a 16px
  `next/image` hot-linked from a third party's CDN
  (cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg, alt
  "Chrome"), and the 1.14.0 restore left it out for that reason, drawing
  lucide's "chrome" glyph instead (1.12.0). Ray, 2026-09-09: "i dont think
  merlin owns [that icon] so use it but bring it local". So:
  * `templates/public/brand/marks/chrome-web-store.svg` - the same drawing
    (29x26 viewBox, 13 paths, a radial gradient, a mask and a clip, every
    reference a fragment of the file itself; no script, no foreign
    object, no font, no external href), installed to `public/brand/marks/`
    through the `templates/public/brand` -> `public/brand` mapping lms_sdk
    installs its Android and Windows marks through. No CDN.
  * `agent-header-menu.ts`: add-extension's icon is
    `{ src: "/brand/marks/chrome-web-store.svg", alt: "Chrome Web Store" }`
    through base_sdk 1.25.0's image icon on an action, drawn as a plain
    `<img>` in the 20px glyph slot before the label, in the bar and in the
    burger panel. The named glyph is gone from this file.
  * `agent-hero-copy.ts` (new; the hero's "Available in the / Chrome Web
    Store" badge was drawing the same lucide glyph): this SDK's first hero
    copy, registered with one line at base's `// @rokct-sdk-hero-copy-start`
    marker. It lays ONE field over `HERO_CONFIG`: base's own badges, in
    base's order and gating, with the Chrome Web Store badge's `icon` as
    that same file (`withLocalMarks`, keyed by base's badge ids). The App
    Store badge keeps its Apple glyph and no word is restated. No
    dark-mode inversion: the marks are multi-colour drawings, drawn as
    they are in both themes, unlike lms_sdk's single-colour tracings.
  * `templates/public/brand/marks/google-play.svg` - the Google Play badge
    too. Ray, 2026-09-09, on supacharge's marks: "we already have nice
    icons in buttons in hero of rokct but supacharge is getting bad ones.
    we use what these platforms use for familiarity". base 1.23.0 had
    stripped that badge's CDN icon and left it without one, so rokct's
    "GET IT ON / Google Play" badge was not drawn at all. The file is the
    coloured Play triangle in Google's own brand colours (#4285F4,
    #34A853, #FBBC04, #EA4335; 25x26 viewBox, 4 paths, 994 bytes, nothing
    unsafe, no host) - the drawing rokct's hero showed before the strip -
    and the hero copy sets it as that badge's icon, so all three of
    rokct's badges now draw their platforms' own marks.
  * Manifest: `hero-config.ts` and `hero-copy.ts` join `requires`; base
    floor 1.25.0.
* Not touched: base's own Chrome badge default (lucide's glyph, for every
  other shell) and `agent-landing-config.ts`'s section images, which still
  hot-link from that CDN - known placeholders under Ray's 15:02Z ruling,
  out of this release.
* Tests (`tests/test_manifest.py`, 25 python):
  `test_header_action_carries_the_local_chrome_mark`,
  `test_chrome_mark_is_installed_locally` and
  `test_google_play_mark_is_installed_locally` (each file parses, carries
  nothing unsafe and references no host; the Play mark in Google's four
  colours),
  `test_hero_copy_is_registered_where_base_looks`,
  `test_header_and_hero_surfaces_name_no_third_party_host` (no
  `cdn.getmerlin.in`, no host but the store, in the header menu, the hero
  copy and the marks directory), the floor assertions; node suite
  `hero-copy.test.mts` (the badge
  mapping, the untouched list, the header and hero naming one file) with
  `stubs/components/custom/landing/hero-config.ts`, and the header-menu
  case in `register-config.test.mts` updated.

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