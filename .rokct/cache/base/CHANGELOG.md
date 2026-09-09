# Changelog

## 1.26.0

* Base ships the platform brand marks itself. Ray, 2026-09-09, on the
  store logos agent_sdk 1.15.0 (Chrome Web Store, Google Play) and lms_sdk
  1.16.0 (Google Play, AppGallery, App Store, Windows) each installed under
  their own `public/brand/marks/`: "move to base, home sdk can choose to
  use them or not". So:
  * `templates/public/brand/marks/` - `chrome-web-store.svg` (4353 B, the
    agent_sdk drawing), `google-play.svg` (1181 B, lms_sdk's gilbarbara
    tracing; the same four Google colours as agent's), `app-gallery.svg`
    (1342 B, Huawei red), `app-store.svg` (687 B, Apple, `currentColor`),
    `windows.svg` (218 B, four equal panes, `currentColor`) - installed as
    a directory to `public/brand/marks/`, so every host that pins base
    serves `/brand/marks/<name>.svg`. Only the `marks/` subdirectory is
    base's; a home SDK's own `public/brand` mapping (lms's wordmarks) is
    untouched. Each file: a `viewBox`, no `<script>`, no `href`, no host
    but the SVG namespace (`test_brand_marks_are_installed`).
  * `components/custom/landing/brand-marks.ts`, a typed registry a home
    SDK may use or ignore: `BrandMark { src, alt, mono }`, `BRAND_MARKS`
    keyed `chromeWebStore | googlePlay | appGallery | appStore | windows`,
    and the dark-mode rule - `isMonoMark(src)` / `markImageClass(src)`.
    Opting in is handing a mark to a hero badge's `icon` (hero-copy.ts)
    or a header action's `icon` (header-menu.ts), typed
    (`icon: BRAND_MARKS.chromeWebStore`) or as the bare path; nothing in
    base draws one by default.
  * Dark mode, once, in base: the two monochrome marks are `currentColor`
    inside an `<img>`, an isolated document, so they resolve black in both
    themes. `hero.tsx` (a badge's image icon) and `header-menu.tsx` (an
    action's image icon) now add `dark:invert` to exactly the image whose
    src path is `/brand/marks/app-store.svg` or `/brand/marks/windows.svg`
    (`markImageClass`: trimmed, `?query`/`#hash` ignored, absolute URLs
    never match). Coloured marks and every other image are never filtered.
    A home SDK must NOT add its own invert for these paths: lms_sdk
    1.16.0's `lms-theme.css` rule for the same two files is retired in
    lms_sdk 1.17.0.
  * Defaults unchanged: `HERO_CONFIG`'s badges keep the built-in "chrome"
    and "app-store" glyphs, the Google Play badge still names no icon, the
    header's actions name no image - a shell that declares nothing renders
    1.25.0's DOM.
  * Tests: `test_brand_marks_are_installed`,
    `test_brand_marks_registry_contract`,
    `test_brand_marks_behaviour_under_node` (`brand-marks.test.mts`) and
    `test_brand_marks_type_check_under_tsc`; the 1.25.0 image-icon test
    follows the class merge.

## 1.25.0

* A header action may carry an IMAGE icon the shell serves itself. Ray,
  2026-09-09, on the Chrome Web Store mark rokct.ai's old host header
  hot-linked from a third party's CDN for its "Add ROK Extension" button
  (and which the 1.24.0 restore left out for that reason): "i dont think
  merlin owns [the icon] so use it but bring it local". Base never names a
  third-party host, so the home SDK installs the file under `public/` and
  names its path:
  * `HeaderMenuImage` (`components/custom/landing/header-menu.ts`):
    `{ src, alt }`, the shape a hero badge's `icon` already takes in
    `hero-config.ts`. `HeaderMenuAction.icon` is now
    `HeaderMenuIcon | HeaderMenuImage`; a link's and a resolved item's
    icon stay the closed glyph set.
  * `components/custom/header-menu.tsx`: `actionIcon()` answers the named
    glyph, the image when it has a src, or nothing; `HeaderMenuActions`
    draws the image as a plain `<img>` (the way `header.tsx` draws a
    declared brand image) at the glyph slot's 20px, `object-contain`,
    before the label, in both the bar and the stacked mobile layout. No
    `next/image`, no dark-mode filter: the mark is a multi-colour drawing
    and the old header drew it as it was in both themes. A named glyph
    renders as it did in 1.20.0; an action without an icon, or with an
    empty src, renders the label alone - a shell that declares no image
    renders identical DOM to 1.24.0.
  * Tests: `test_header_menu_action_carries_an_image_icon`, the 1.20.0
    glyph test updated for the widened type, and two node cases in
    `header-brand.test.mts` (`resolveHeaderMenu` carries an image icon
    verbatim, beside a glyph and beside none).
  * Downstream: agent_sdk 1.15.0 installs `/brand/marks/chrome-web-store.svg`
    and sets it on rokct.ai's extension action; it needs this floor.

## 1.24.0

* The header's mega menu no longer closes before the pointer reaches it.
  Ray, on supacharge.app, 2026-09-09: "it is impossible to choose links if
  mega menu is open, it leaves no moment to move mouse". Two faults in
  `components/custom/header-menu.tsx`'s `DesktopMegaMenu`, both fixed at
  the source, so every composed shell gets the same menu:
  * A DEAD STRIP between trigger and panel. The bar (`header.tsx`, `h-16`)
    centres the desktop nav, which had no height of its own, so the menu's
    hover wrapper - the element carrying `onMouseEnter`/`onMouseLeave` -
    was as tall as the bar's text (bottom edge at 42px) while the panel
    hangs from the bar's bottom edge (top at 64px). Moving straight down
    from the word to the panel crossed 22px of bar that belonged to
    neither, and the leave closed the panel on the spot. `HeaderMenuNav`
    is now `h-full`, so the wrapper spans the bar and meets the panel edge
    to edge (the measured gap is 0px); inside the legacy `HeaderMenuRow`
    the parent has no set height and the class is inert. No visual change:
    the trigger sits where it did, the panel draws where it did.
  * NO HOVER INTENT. A leave closed at once. It now starts a
    `HOVER_CLOSE_DELAY_MS` (200ms) timer that re-entering the wrapper or
    the panel, focusing the trigger or clicking it cancels, so brushing an
    edge or overshooting a corner is not a close. Escape, a click outside,
    focus leaving the menu and a click on one of its links still close at
    once; the timer is cleared on unmount. Touch and the burger panel's
    stacked list are untouched.
  * Also fixed while here: Escape pressed on one of the panel's links
    returned focus to the trigger and re-opened the panel, because the
    trigger's `onFocus` (which opens) fired after the close. The handler
    now focuses first and closes second.
  * Tests: `test_header_menu_hover_intent` ties the wrapper's leave to the
    delayed close and its enter to the cancel, the nav to `h-full`, and the
    Escape handler to the focus-then-close order.
* The header's brand may BADGE and COLLAPSE again. Ray, 2026-09-09, on
  rokct.ai after its re-pin to base_sdk 1.21.0: "header lost functions the
  old rokct header had"; the standing ruling is that rokct.ai keeps
  everything its old host header (rokctai_frontend's hand-written
  `components/custom/header.tsx`, 668 lines, before its PR #143) had. Set
  against that file, the shared header had dropped three things around
  the brand and one button style; all four are back, each behind the home
  SDK's declaration so a shell that declares nothing (Supacharge) renders
  byte-for-byte what it did:
  * `HeaderBrand.badge` (`components/custom/landing/header-menu.ts`):
    the host's `brand-logo.tsx` is drawn with `showBadge` - rokct.ai's
    BETA strip, which its old header always passed (`showBadge={true}`).
    Every shell's brand-logo.tsx accepts the prop (the `requires` contract;
    Supacharge's and delivery's accept it and draw nothing).
  * `HeaderBrand.collapse` (`true`, or a `HeaderBrandCollapse`): the old
    header's brand motion - the mark at 44px, the wordmark at
    `text-[60px] tracking-tighter` in a 250px slot that closes 1500ms
    after mount (`delayMs`), a chevron after the mark once it has, and the
    visitor's COUNTRY CODE sliding in beside the mark at the same moment
    (`code`, a client-side resolver the home SDK supplies, answering the
    text or `{ text, style }`; rokct.ai reads its branding cache exactly
    as the old header's `getBrandingSync()` did). The desktop nav fades
    with the wordmark and comes back while the pointer is over the header
    or the page is scrolled past 10px - the old `navVisible` rule verbatim.
    `resolveHeaderBrand` carries `badge` and `collapse` (defaults filled
    by the new `resolveHeaderBrandCollapse`) on `ResolvedHeaderBrand`;
    `header.tsx` renders a collapsing brand through `CollapsingBrand`, runs
    the timer and the scroll/hover listeners only when one is declared
    (`useBrandCollapse`), and wraps the nav in the fading element only
    then. Colours are theme tokens (`text-foreground`,
    `text-muted-foreground`), not the old header's zinc/gray.
  * `HeaderMenuAction.variant` gains `"secondary"`: the filled muted
    button (`bg-secondary text-secondary-foreground`) the old header drew
    its "Chat with ROK" nav button as (`bg-zinc-700`), beside `primary`
    and the outlined `ghost`. `header-menu.tsx`'s `HeaderMenuActions`
    paints it in both layouts.
  * Not restored, on purpose, and listed here so nobody hunts for them:
    the old bar's `max-w-screen-2xl px-6 md:px-12` container (shared
    chrome; 32px wider at 1280 than the `max-w-6xl` bar every shell has),
    the old mobile panel's `text-2xl` link size (the shared panel lists
    more and uses `text-lg`), the old panel's 200ms fade-and-slide (the
    shared panel toggles `hidden` so `aria-controls` always resolves), the
    old mobile CTA's hard-coded `#4f46e5` (theme tokens only) and the
    Chrome Web Store icon hot-linked from a third party's CDN (the lucide
    `chrome` glyph since 1.20.0).
  * Tests: `test_header_brand_badge_and_collapse` ties the registry's
    fields, the header's `CollapsingBrand` / `useBrandCollapse` and the
    still-brand literals to the source, and `header-brand.test.mts`
    executes `resolveHeaderBrandCollapse` and the carried defaults.

## 1.23.0

* The NETWORK STRIP: the other sites of the Rokct network, each a link,
  under a "Trusted by" heading, on every composed shell minus itself.
  Ray, 2026-09-09: rokct.ai must not list his other products as choices
  (each has moved to its own shell), but a founder landing on rokct.ai's
  free opportunities pages must still learn about them - a clickable logo
  strip, and the heading is his wording ("these products already trust
  rokct as they run on it"). He also asked whether rokct's existing
  `logos` section is enough. It is not: agent_sdk's `logos.tsx` is a
  marquee of Walmart, Cisco, Netflix, Pinterest, Zoom, Sony, Ebay and
  Uber images hotlinked from a third party's CDN (a chat template's
  leftover), none of them a link, on the landing page only. That section
  is left in place (an unused surface is flagged, never removed).
  * `components/custom/landing/network-sites.ts` is the ONE list:
    rokct.ai (https://rokct.ai), Supacharge (https://supacharge.app,
    `wordmark: true` until Ray designs an icon) and juvo
    (https://juvo.app), plus `hosting` and `telephony` with `url: null`
    and `shown: false` until Ray picks their domains (Ray, 2026-09-09:
    "hosting will get a name when i decide on domain"). An entry is
    `{ key, name, url, logo?, logoDark?, wordmark?, shown? }`; the logos
    are read from each site's own `/images/logo_dark.svg` (the black
    glyph, for the light page) and `/images/logo.svg` (the white glyph,
    for the dark page; the shells name the two after the TILE their
    brand-logo.tsx draws them on, not the page), so a mark changes in
    one place, on its own site. `resolveNetworkSites
    (sites, { selfHost, order, hidden })` is the pure rule: every shown
    entry with a URL, minus the shell whose host matches `selfHost`
    (`networkSiteHost()` normalises a URL's host exactly as
    `resolveDisplayHost` does, through the kernel's `normaliseHost`:
    port dropped, `www.` dropped, lower-cased), minus the hidden keys, the
    named order first and the rest in list order. `hasTrackingParameters()`
    names the line no link may cross: no entry carries, and no rule adds,
    a query string or a fragment.
  * `components/custom/landing/network-strip.ts` is an eighth one-marker
    registry, `// @rokct-sdk-network-strip-start`, single-answer and
    home-SDK-owned like `header-menu.ts`: a home SDK registers a module
    whose default export is a `NetworkStripConfig` - `heading`, `order`,
    `hidden` (site keys), `placement: { landing?: "afterHero" |
    "beforeFooter" | "none"; footer?: boolean }` - with one line,
    `{ id: "<sdk>-network-strip", load: () => import("@/components/custom/
    landing/<file>") }`. `resolveNetworkStrip(config, selfHost)` lays it
    over the defaults - heading "Trusted by", list order, nothing hidden,
    `footer: true`, `landing: "none"` - and `networkStripRendersAt(strip,
    surface)` is the one test of where the strip draws: the footer while
    `footer` is on, a landing surface only when `landing` names it, never
    with no site left. Nothing registered is the default, so lms_sdk, the
    hosting and the delivery home SDKs need no change to get the strip in
    their footer row minus themselves.
  * `components/custom/network-strip.tsx` draws it: `<NetworkStrip
    surface="afterHero" | "beforeFooter" | "footer" />`, the heading as
    an eyebrow and one link per site - the logo when the site has one
    (its dark twin under `dark:`, the name as text if the image will not
    load) else the name as text - each `href` the site's own origin with
    `rel="noopener"`, no query string, no click handler, no ad network.
    Generic chrome in the footer row's mould: neutral alphas only, no
    product name, no brand hue. The shell it draws on is left out by host
    - `NEXT_PUBLIC_SITE_URL` first, else the `url` registered in
    `site-metadata.ts` - the CONFIGURED site, not the request host, since
    a white-label domain in front of the same deployment is still the
    same product. The config and the host are resolved once per module
    and rendered through `next/dynamic`, as the header renders its brand,
    so the strip is server-rendered with the page and never pops in.
  * WHERE it hooks in. Base has no footer component to hook: the shells
    own their footers (rokctai_frontend's host `footer.tsx`, lms_sdk's
    `lms-footer-section.tsx`) and base ships only the copyright row they
    end with (`footer-chrome.tsx`, 1.12.0). So that row is the footer
    hook: `FooterChromeRow` draws `<NetworkStrip surface="footer" />`
    above itself, inside one fragment, and gains `networkStrip?: boolean`
    (default true) for a footer that places the strip itself. The
    landing page's two surfaces are `landing-content.tsx`'s: right under
    the hero and right before the footer anchor, both inside the block
    that hides while the hero shows search results.
  * rokct.ai: agent_sdk 1.13.0 registers `placement: { landing:
    "afterHero", footer: true }`, so the strip sits under the hero on
    /landing and in every footer that renders the row. rokctai_frontend's
    host `footer.tsx` does not yet render `FooterChromeRow` (it keeps its
    own copy of the copyright row) and must adopt it - or render
    `<NetworkStrip surface="footer" />` itself - for the strip to reach
    the pages outside /landing; that is a host edit, flagged here.
    supacharge.app: lms_sdk registers nothing and the footer section's
    row shows rokct.ai and juvo, never Supacharge.
  * Base's own third-party defaults come out with it. Ray, 2026-09-09:
    "everything served from another company cdn tells you is placeholder".
    `components/custom/landing/hero-config.ts` named four assets from a
    chat template's CDN (`cdn.getmerlin.in`): the gradient behind the
    hero (a 502 today, and at 30% opacity in dark mode - the default now),
    the Chrome Web Store and Google Play badge icons, and the claim
    "Trusted by 20M+ users" beside them. `backgroundImage` is `""` (the
    hero already hides the block on an empty string), `trustLine` is `[]`
    (the network strip is what stands under the hero now), the Chrome
    badge's icon is the new built-in `"chrome"` glyph (lucide's own mark,
    the one the header's extension button draws since 1.20.0) and the
    Google Play badge has no icon. `HeroBadge.icon` is optional and
    `hero.tsx` draws only a badge that has one (`hasBadgeIcon`: a built-in
    glyph, or an image with a `src`), because below `md` a badge shows its
    icon alone and would otherwise be an empty pill - so the Google Play
    badge waits for a home SDK's hero copy to give it an icon rather than
    base inventing one. Every home-SDK override path is unchanged: a
    registered `HeroCopy` may still set a background, a trust line and
    image icons of its own.
  * `tests/test_manifest.py` asserts that no default under `templates/`
    or `src/` references a third-party host (an allowlist of the
    network's own sites, the licence URL, the social origins the admin
    settings page links and the documentation examples), the four hero
    defaults, and the badge rule.
  * `tests/test_manifest.py` also asserts the installs, the registry's
    marker and contract, the two landing surfaces and the footer hook,
    that the component names no tracking parameter, and stages the list,
    the registry and the kernel under node (22.6+, type-stripping) to
    execute `tests/network-strip.test.mts`: the list's shape (unique keys, https
    origins with no query string, `url: null` only with `shown: false`),
    self-exclusion by host (`https://www.rokct.ai:443/` leaves rokct out;
    supacharge's host leaves Supacharge out; no host leaves every site
    in), the order and hidden rules, that a link is never given a
    tracking parameter, and that `landing: "none"` hides both landing
    surfaces while `footer: false` hides the footer.

## 1.22.0

* The shells default to DARK. Ray, 2026-09-09: "default to dark mode".
  base_sdk never shipped the theme seam: each shell carried its own
  pass-through `components/custom/theme-provider.tsx` over next-themes and
  its root layout chose the default alone - supacharge-web's `app/layout.tsx`
  with `defaultTheme="dark"`, rokctai_frontend's with `defaultTheme="system"`
  and `enableSystem`, so rokct.ai opened in whatever the visitor's OS said.
  The rule now lives in base, once, for every shell the composer lands it on.
  * `components/custom/theme-provider.tsx` is a new `installs` entry (the
    composer overwrites the shell copies, as it did the header in 1.14.0): a
    client wrapper over next-themes' `ThemeProvider` whose defaults are
    `defaultTheme="dark"` and `attribute="class"` (the signal Tailwind's
    `darkMode: ["class"]` reads), exported alongside as `DEFAULT_THEME` and
    `THEME_ATTRIBUTE`. A first visit with no stored preference paints dark
    whatever the OS says; a preference the visitor already expressed through
    the header's toggle (next-themes' `theme` key in localStorage) is
    honoured exactly as before, and the toggle keeps flipping light and dark.
    Every other next-themes prop (`enableSystem`, `disableTransitionOnChange`,
    `storageKey`) is the host's to pass; with `enableSystem` on, "system"
    stays a value a toggle may select, it is only no longer what an
    unexpressed preference resolves to. The props type is imported from the
    "next-themes" package root (0.4.x ships no `dist/types` entry point).
  * `next-themes` `^0.4.6` joins the manifest's `dependencies` - both shells
    already pin it.
  * The `requires` note for `app/layout.tsx` states the contract: mount
    `<ThemeProvider>` from `@/components/custom/theme-provider`, pass no
    `defaultTheme` (or `"dark"`), keep `suppressHydrationWarning` on `<html>`.
    A layout passing `"light"` or `"system"` overrides the platform rule and
    is a host regression to fix in the shell. Follow-up: rokctai_frontend's
    `app/layout.tsx` lines 69-74 pass `defaultTheme="system"` today.
  * Tests: `test_theme_provider_is_installed_and_defaults_to_dark` ties the
    install to the template and asserts the dark default, the class
    attribute, the next-themes dependency and the layout contract;
    `test_theme_provider_type_checks_under_tsc` type-checks the staged
    template against next-themes' prop shape when a tsc is reachable.

## 1.21.0

* The home SDK declares what the header's brand slot draws. Ray,
  2026-09-09: "i saw supacharge got a s logo in header, let home sdk
  declare if it needs logo there or not. supacharge text is the logo
  right now until i design an icon". The "S" is supacharge-web's own
  `components/custom/brand-logo.tsx` (a `requires` file), an asset-free
  placeholder that draws the platform's first letter on a dark square,
  which the header has rendered beside the wordmark since 1.14.0 shipped
  it (`<BrandLogo width={32} height={32} />`); base had no way for a home
  SDK to say the slot should be empty, and no way to put a real icon there
  without a host edit.
  * `components/custom/landing/header-menu.ts`: `HeaderMenu` gains
    `brand?: HeaderBrand` - `{ logo?: "auto" | "none" | <path>;
    wordmark?: boolean }` - in the registry a home SDK already answers,
    under the same first-entry rule. `"none"` draws no image (the
    wordmark, the host's `branding.tsx`, IS the logo); a path
    (`/images/logo.svg`, or an absolute URL) draws that image at 32px; and
    `"auto"` (the default, and what a menu that declares nothing gets)
    draws a REAL icon only: the copy's registered `icon` from
    `site-metadata.ts` when there is one, else the host shell's own
    `brand-logo.tsx` - the mark every shell drew before this field
    existed. The generated `/brand-icon` letter tile (1.17.0) is for the
    browser tab and the share card only and is NEVER drawn in the header,
    not even when a declaration or a registered `icon` names it (it falls
    through to the "auto" rule). `wordmark: false` drops the wordmark for
    a shell whose image already spells its name. `resolveHeaderBrand(brand,
    copy)` is the pure rule, `headerBrandNeedsCopy()` says when the copy
    is consulted (only "auto"), `isGeneratedBrandIcon()` names the refused
    tile and `loadHeaderBrand()` loads the menu, then the copy only when
    needed, and never throws.
  * `components/custom/header.tsx` renders the brand link through
    `next/dynamic` the way `hero.tsx` renders the form: the declaration is
    resolved once per module and server-rendered with the bar, so the
    first paint already carries the declared mark and the "S" never
    flashes before it goes. With nothing registered in either registry
    there is no loader and the slot is the host's mark and wordmark as
    before. The header never imports `app/lib/site-metadata.ts` (it
    reaches for `node:fs`); the tile path is restated in the registry.
    Every prop of `Header` is unchanged.
  * rokct.ai: agent_sdk's menu declares no `brand` and its copy registers
    no `icon`, so the header draws rokctai_frontend's own `brand-logo.tsx`
    (`/images/logo.svg` with its dark variant) exactly as before - no
    agent_sdk change is needed to keep the logo. supacharge.app: lms_sdk
    1.13.0 declares `brand: { logo: "none" }` and the header is the
    wordmark alone.
  * `tests/test_manifest.py` asserts the declaration and the header's
    use of it, and stages `header-menu.ts` under node (22.6+,
    type-stripping) to execute `tests/header-brand.test.mts`: "none" draws
    no image, a path draws that src, "auto" with no real icon draws the
    host's mark with no src and never `/brand-icon`, "auto" with a
    registered `copy.icon` draws that src, the tile is refused however it
    is named, and a menu that fails to load is skipped.
* Fixed: `app/lib/site-metadata.ts` imports the `HeaderReader` type it
  uses (shell builds without `ignoreBuildErrors` failed on 1.20.0).
  1.20.0 moved the host predicate into the kernel and imported
  `isPublicHost`, `normaliseHost` and `requestHost` from
  `@/app/services/base/tenant-hosts`, but `resolveDisplayHost`'s
  signature still names `HeaderReader`, and the
  `export { ... type HeaderReader }` re-export at the bottom of the file
  does not put that name in scope: `next build` on a composed shell
  stopped at `site-metadata.ts(157,12): TS2304: Cannot find name
  'HeaderReader'` (found by the hosting shell build). The import now
  carries `type HeaderReader`.
  * `tests/test_manifest.py` guards the class of miss two ways: a
    stdlib check that every name the file re-exports from the kernel
    and also uses in its own code is imported, and a real `tsc` pass
    (strict, isolatedModules - the shells' tsconfig) over a staged copy
    of the file with the kernel's `tenant-hosts.ts`, the landing
    registry and `next`/`node:*` stubs beside it, run whenever a
    compiler is reachable (`ROKCT_TSC=<path to tsc>`, else `tsc` on
    PATH) and skipped otherwise.

## 1.20.0

* The host switch: the kernel answers WHICH TENANT a request host belongs
  to, so one deployment can open a tenant's portal on that tenant's own
  domain and keep the storefront on every other host. A tenant that points
  a `custom_domain` (on its Company Subscription at the control site) at
  the shell expects that host to be its login, not the platform's landing
  page; the control site owns that mapping, and since control #164 exposes
  it as the guest method
  `control.control.api.subscription.resolve_site_by_host(host)` ->
  `{"site_name": "<site>"}` or `null` (live subscriptions only; invalid,
  local and preview hosts answer `null` without a lookup).
  * `app/services/base/tenant-host-control.ts` (new): `resolveTenantSiteByHost(host)`
    asks that method with a plain guest `POST` to
    `ROKCT_BASE_URL/api/v1/method/<dotted name>` - no credentials ever, and
    not through the gateway door, which on a control site routes only
    registered `control:` keys and has none for this lookup - and answers
    the site name or `null`. Answers are cached in memory, positive for
    `TENANT_HOST_POSITIVE_TTL_MS` (5 min) and negative for
    `TENANT_HOST_NEGATIVE_TTL_MS` (60 s), overridable through
    `ROKCT_TENANT_HOST_TTL_MS` / `ROKCT_TENANT_HOST_NEGATIVE_TTL_MS`;
    one lookup is bounded by `ROKCT_TENANT_HOST_TIMEOUT_MS` (3 s) and
    concurrent lookups of one host share one request. It NEVER throws: a
    network error, a timeout, a non-2xx status or a malformed answer is
    `null` - unknown host = storefront - logged once per process. It never
    asks for a host that is not a public one (1.19.0's `isPublicHost`:
    localhost, loopback, `.vercel.app`, `.local`, `.internal`), for the
    configured `NEXT_PUBLIC_SITE_URL` host or for the control host, and a
    host in the `ROKCT_TENANT_HOSTS` map answers from the map so a local
    run can point `localhost:3000` at a tenant. An answer that is not a
    host name, or that is the control site itself, is `null`: no host ever
    opens a portal against the control plane. `ROKCT_TENANT_HOST_LOOKUP=off`
    switches the lookup off.
  * `resolveTenantSiteForRequest(headers)` is the middleware entry:
    `x-forwarded-host` (first value) else `host`, port and a leading
    `www.` stripped, lower-cased - 1.19.0's `requestHost` - then the
    lookup above. The module imports only the pure kernel helpers and
    uses the global `fetch`, so it runs in the edge runtime as well as on
    the server. auth_sdk 1.7.0's middleware forwards its answer as the
    `x-rokct-tenant-site` request header (`TENANT_SITE_HEADER`).
  * `platform-gateway.ts` calls `registerControlTenantHostResolver()` at
    load, which plugs the same lookup into `setTenantHostResolver`
    (idempotent; a no-op without `ROKCT_BASE_URL` or with the lookup off;
    a host's own `setTenantHostResolver` call still replaces it), so
    `resolveTenantBaseUrl`'s per-host step now resolves a custom domain to
    its backend with no host wiring. Note that with a control site
    configured `hasTenantHostLookup()` is therefore true, so a call with
    no explicit `baseUrl` and no session site reads the request host.
  * The host predicate moved INTO the kernel so middleware can share it
    without pulling the metadata shell (and its `node:fs` probe) into the
    edge bundle: `tenant-hosts.ts` now carries `NON_PUBLIC_HOSTS`,
    `NON_PUBLIC_HOST_SUFFIXES`, `HeaderReader`, `normaliseHost()`,
    `isPublicHost()` and `requestHost()`; `app/lib/site-metadata.ts`
    imports and re-exports them, so its 1.19.0 surface and
    `resolveDisplayHost` are unchanged. `gateway-constants.ts` gains
    `PLATFORM_METHOD_PATH` (`/api/v1/method`), from which
    `PLATFORM_GATEWAY_PATH` is now derived.
  * `tests/tenant-host-control.test.mts` (new, node's own test runner,
    run by `tests/test_manifest.py`): the non-public, own-host, map and
    switched-off short-circuits make no call; a public host is asked once
    as a guest and cached; a negative answer is cached and asked again
    after its TTL, a positive one after its; concurrent lookups share a
    request; a network error, a non-2xx and a malformed answer are `null`,
    logged once; header precedence; and the registered resolver makes
    `lookupTenantHost` answer the tenant's origin.
* A PAGE's Metadata carries no `icons`; the layout is the favicon's single
  owner. Ray, 2026-09-09: "rokct got a letter favicon and lost its own
  image". `app/landing/page.tsx` is `force-dynamic` and its
  `generateMetadata` calls `buildPageMetadata()`, which resolved icons like
  the layout does; at request time in a serverless function
  `hostIconExists()` is false (see below) and with no registered
  `copy.icon` the page emitted the generated `/brand-icon` set. Next
  replaces `icons` per segment wholesale and suppresses the file-convention
  `app/icon.*` when any segment sets it, so the page's generated set
  overrode the root layout's explicit `icons` override - rokct.ai's own
  logo. `buildSiteMetadata()` now resolves icons ONLY for the layout scope:
  `buildPageMetadata()` emits no `icons` key and a page inherits the
  layout's answer (override, host file, `copy.icon`, generated - the same
  order as before); an explicit `icons` override is still returned
  untouched, without the disk check. supacharge-web is unaffected (no
  override, no icon file: the letter both before and after).
  * Known limitation, not fixed here: `hostIconExists()` is a runtime
    check of the process's working directory, and inside a Vercel function
    (cwd `/var/task`, `app/icon.*` not traced into the bundle) it is false
    even when the icon file is committed. A shell that relies on a
    file-convention icon WITHOUT a layout `icons` override may therefore
    still get the letter tile in production. Two candidate fixes, to be
    decided: a compose-time constant the installer writes (the composer
    knows at build time whether the host ships an icon file), or
    `outputFileTracingIncludes` in the shell's `next.config` so the icon
    files are traced and the disk check sees them.
  * `tests/site-metadata-icons.test.mts` (new; run by `test_manifest.py`
    against a staged copy with the registry stubbed): `buildPageMetadata()`
    has no `icons` key, `buildSiteMetadata()` (layout) has one, and
    `buildSiteMetadata({ icons })` returns the override untouched.
* The header's action buttons may carry a glyph. Ray, 2026-09-09: rokct
  "got its header back but it think it lost its chrome icon" - the old
  rokct header drew the Chrome mark on its "Add ROK Extension" button, and
  1.18.0's `HeaderMenuAction` was label only. `HeaderMenuAction` gains
  `icon?: HeaderMenuIcon`, `HeaderMenuActions` draws it before the label in
  both layouts (bar and stacked, `h-5 w-5`, the size the panel's cards draw
  theirs at), and `HeaderMenuIcon` gains `"chrome"`, mapped to
  lucide-react's own `Chrome` glyph - no third-party asset. An action
  without an icon renders exactly as before. agent_sdk sets
  `icon: "chrome"` on its extension action in a later release.

## 1.19.1

* Favicon letter colour found in any `:root` block. `app/brand-icon/route.tsx`
  (1.17.0) read the host's `--primary` from the FIRST `:root {` of
  `app/globals.css` and stopped at its first `}`. rokctai_frontend's
  stylesheet opens with a `:root` of `--foreground-rgb` and friends and
  keeps `--primary: 48 96% 53%` in a second `:root` under `@layer base`,
  so its tile drew a white R; supacharge-web, whose first `:root` already
  carries `--primary`, was orange. Ray, 2026-09-09: the letter takes the
  primary colour.
  * `rootBlocksOf(css)` (new) lists every `:root` block in source order,
    nested ones under `@layer` / `@media` included, each with its selector
    head and its BALANCED `{...}` body (comments stripped first so a brace
    in one cannot unbalance the scan). `rootPrimaryOf(css)` walks them and
    answers the first block that declares `--primary`, skipping a block
    whose selector also names `.dark` (`:root.dark`, `.dark :root`); a
    plain `.dark { ... }` block is never a match. The value parsing
    (shadcn `H S% L%`, hex, `rgb()`, `hsl()`, `oklch()`) and the fallback
    order - the registered `themeColor`, else `--primary`, else white -
    are unchanged, so a shell that resolved before resolves the same.
  * `tests/test_manifest.py` lifts the pure helpers out of the route and
    executes them under node (22.6+, type-stripping) against the two
    shells' layouts, a `.dark` `:root` override, a comment holding a
    brace and a file with `--primary-foreground` only.

## 1.19.0

* The host the shell SHOWS follows the REQUEST first. The generated
  favicon's letter (1.17.0) and the host line on the generated
  link-preview card (1.15.0) were both derived from the configured site
  url, so a white-label or custom domain in front of the same deployment
  showed the platform's letter and host rather than its own. Now both
  come from one helper, `resolveDisplayHost(copy, headers)` in
  `app/lib/site-metadata.ts`, and the request wins when it is a public
  host.
  * The rule: the request host - `x-forwarded-host` (its first value
    when a proxy chain appended) else `host`, the port dropped, a
    leading `www.` removed, lower-cased - UNLESS it is a non-public
    host, in which case the configured site's host (`NEXT_PUBLIC_SITE_URL`,
    else the copy's `url`), then the site name (or title). Non-public
    means: empty; exactly `localhost`, `127.0.0.1`, `[::1]`, `::1` or
    `0.0.0.0`; or ending in `.vercel.app`, `.local` or `.internal`
    (`NON_PUBLIC_HOSTS`, `NON_PUBLIC_HOST_SUFFIXES`). So a custom
    domain gets its own letter and host line, and a preview deployment
    or a local run keeps the configured site's. Also exported:
    `normaliseHost()`, `isPublicHost()`, `requestHost()`, `siteHost()`,
    and the `HeaderReader` type (anything with `get`, so a request's
    `Headers` and next/headers' `headers()` both fit).
  * `app/brand-icon/route.tsx`: the letter is
    `resolveDisplayHost(copy, request.headers)`'s first letter or digit,
    else the site name's, else `R` - the same remaining fallbacks as
    1.17.0. Colour, size, ring and caching are unchanged; the route's own
    `hostOf` and `requestOrigin` helpers are gone with the old order.
  * `app/opengraph-image.tsx` (and so `app/twitter-image.tsx`): the
    card's host line is `resolveDisplayHost(copy, headers)` with the same
    `headers()` the route already read for the request origin, so nothing
    that was static becomes dynamic. Assets are still fetched from the
    request origin first and from the configured site url only when
    there is no request. `www.` is now stripped from the printed host.
  * `tests/test_manifest.py` checks the helper exists, reads
    `x-forwarded-host` then `host`, checks the request before the
    configured site, lists every excluded host and suffix, and that
    both routes call it.

## 1.18.0

* The header's `groups` open as ONE panel again - the mega menu. Ray,
  2026-09-09: "no mega menu anymore" on rokct.ai is a regression; rokct
  keeps everything its old header had, and Supacharge inherits the same
  header. 1.14.0 to 1.16.0 rendered each group as its own dropdown, so the
  five columns agent_sdk 1.8.0 registered from rokctai_frontend's
  `PLATFORM_FEATURES` became five `12rem` single-column menus on the bar.
  * `components/custom/header-menu.tsx`: `HeaderMenuNav` renders the groups
    as a single `DesktopMegaMenu` - one trigger, the FIRST group's label
    (with its badge), that discloses a panel `absolute inset-x-0 top-full`
    under the bar (the bar's backdrop-filter is its containing block, so it
    spans the bar's width and needs no knowledge of its height): inside, a
    `mx-auto max-w-6xl px-4 py-8` row with the first group's items as a
    300px lead column without a repeated heading, and every other group as a
    headed column (`h4`, 15px semibold) in a `repeat(auto-fit, minmax(9rem,
    1fr))` grid beside it - the geometry of rokctai_frontend's hand-written
    panel (`w-[300px]` cards left, four columns right). Same open/close
    contract as the 1.14.0 dropdown: hover, focus and click open; Escape
    (focus back on the button), an outside click, focus leaving it and a
    click on any of its links close. Theme tokens only: `bg-background`,
    `border-border`, `shadow-2xl`, `text-foreground`,
    `text-muted-foreground`, `hover:bg-foreground/5`, and `MenuLabel` for
    the new/soon pills. The trigger leads the row, ahead of the flat links,
    as the old bar's Product did (Product | Pricing | Affiliate | Teams);
    with no groups the row is the flat links alone, as before. The
    per-group `DesktopGroup` is gone.
  * `components/custom/landing/header-menu.ts`: `HeaderMenuLink` gains
    `description?: string` (one line under the label) and `icon?:
    HeaderMenuIcon`; `HeaderMenuIcon` is the closed set `"box" | "globe" |
    "smartphone" | "message-square" | "zap" | "wrench" | "file-text"`,
    resolved from lucide-react by name in header-menu.tsx (`MENU_ICONS`) so
    the header bundles seven glyphs rather than the library. Both fields
    are carried onto `HeaderMenuItem` by `resolveHeaderMenuItems` and
    `resolveHeaderMenu` (an anchor has neither), and an item with either
    renders as a card in the panel - icon box, label with badge, blurb,
    an arrow on hover - the way rokct.ai's Browser Extension / Web App /
    Mobile Apps tiles did; an item with neither is a 13.5px link. A "soon"
    card is non-navigable like a "soon" link.
  * Unchanged, so nothing composed today moves: the mobile panel
    (`HeaderMenuList`, each group a headed section of stacked links), the
    flat links, the actions, and the header's own markup. A menu with NO
    groups renders byte-for-byte as in 1.16.0 (Supacharge's header until
    lms_sdk registers groups). agent_sdk 1.9.0 fills the descriptions and
    icons for rokct.ai.
  * Not carried over from the old rokctai_frontend header: the Chrome Web
    Store glyph inside the "Add ROK Extension" button (an external CDN
    image; `HeaderMenuAction` has no icon field), the 200ms fade/slide of
    the panel (it toggles with the `hidden` attribute like the 1.14.0
    dropdown), and the 1.5s logo collapse with the nav fading until hover
    or scroll, which 1.14.0 already dropped.

## 1.17.0

* A FALLBACK favicon for a shell that has none. Ray, 2026-09-09: "on
  builds that dont have favicon like supacharge you can make it to take
  first letter of domain", and "that letter should take color of primary
  color". Additive, and a true fallback: nothing here replaces an icon a
  host already has.
  * `app/brand-icon/route.tsx` (new, installed) answers
    `GET /brand-icon?s=<px>` with a PNG app tile drawn by `next/og`: `s`
    square, 16..512, default 64; the card's `#0b0b0b` ground with the
    same top-right highlight, corners rounded 22%; the letter centred at
    about 62% of the square's height in the sans face next/og bundles
    (regular is the only weight it ships, so `fontWeight: 700` is
    honoured only where a bolder face is available). The letter is the
    first character of the site host - `NEXT_PUBLIC_SITE_URL`, else the
    copy's `url`, else the origin of the request - with a leading `www.`
    stripped and uppercased; when the host gives no letter or digit the
    site name's first character is used, and failing that `R`. The
    letter is drawn in the shell's PRIMARY colour, never a hard-coded
    brand: the registered `themeColor`, else the first `--primary:`
    declaration inside the `:root` block of the host's `app/globals.css`
    (read from disk once per process; the shadcn `H S% L%` triple, hex,
    `rgb()`/`rgba()`, `hsl()`/`hsla()` and `oklch()` are understood and
    normalised to hex for satori), else `#ffffff`. A primary with a
    relative luminance under 0.18 keeps the letter and adds a ring of
    the same primary at 40% alpha (2px at 64, scaling with the tile) so
    it still reads on the dark ground. `Cache-Control: public,
    max-age=86400`. `runtime = "nodejs"`, like the og routes.
  * `buildSiteMetadata()` in `app/lib/site-metadata.ts` now builds
    `icons`, in this order: an `icons` override wins outright and the
    disk is not looked at; a host that ships an icon file Next serves by
    file convention - `app/favicon.ico`, `app/icon.png|svg|ico`,
    `app/apple-icon.png`, `public/favicon.ico`, checked with
    `fs.existsSync` under `process.cwd()` at call time, server-side only
    (`typeof window === "undefined"`, dynamic `node:fs` import, any
    failure counts as absent) - gets NO `icons` key, so that file stays
    the icon; a registered `copy.icon` is linked next (as the Apple touch
    icon too when it is a raster); and with none of those the links are
    `/brand-icon?s=64` (64x64) and `/brand-icon?s=192` (192x192) as
    `icon` and `/brand-icon?s=180` as `apple`. Exported helpers:
    `GENERATED_BRAND_ICON`, `HOST_ICON_FILES`, `hostIconExists()`,
    `generatedIcons()`, `registeredIcons(icon)`, `resolveIcons(copy)`.
  * `SiteMetadataCopy` in `components/custom/landing/site-metadata.ts`
    gains `icon?: string` - a public path or absolute URL to a `.png`,
    `.svg` or `.ico` - so a home SDK can ship a real icon later and
    register it with the same one line as the rest of its copy, replacing
    the generated tile without touching the host; and `themeColor?:
    string` - any CSS colour - for a letter colour other than the
    theme's `--primary`.
  * `tests/test_manifest.py` checks the route is in `installs` and
    references `themeColor` and `--primary`, that the registry declares
    `icon` and `themeColor`, and that `app/lib/site-metadata.ts`
    references `/brand-icon` and reads `copy.icon`.

## 1.16.0

* The generated link-preview card can show a STILL of the app. Ray,
  2026-09-09: the 1200x630 preview should show a still from the app's
  guided tour rather than only the wordmark. Additive: a shell whose
  registered copy names no still draws the single-column card of 1.15.0
  from exactly the same markup.
  * `SiteMetadataCopy` in `components/custom/landing/site-metadata.ts`
    gains `still?: string` - a public path or absolute URL to a PORTRAIT
    `.png`, `.jpg`, `.jpeg` or `.webp` (a 1080x1920 tour screenshot is the
    expected shape) - and `stillAnchor?: "top" | "bottom"`, default
    `"bottom"`. Same extension rule as `ogImage`, same merge and load
    rules as every other field.
  * `app/opengraph-image.tsx` draws the two-column card when a still is
    registered: `#0b0b0b` ground with the top-right radial highlight as
    before; the left 45% (540px) a column with the registered logo at 64px
    - or the site name when there is no logo - the tagline at 38px in 72%
    white, and the host small at the bottom-left at 24px in 45% white; the
    right 55% the still drawn 372px wide at its own aspect inside a phone
    frame (`#1a1c1f`, 44px corners, 10px bezel, 34px inner corners, a
    `0 30px 80px rgba(0,0,0,0.6)` shadow) centred in the column and
    clipped by it. With `stillAnchor: "bottom"` the frame's top sits 72px
    under the card's top edge and the phone bleeds off the bottom, so the
    screen's header is what shows; with `"top"` the phone hangs from the
    top edge - top bezel cut, its bottom 72px above the card's bottom edge
    - for a screen that is a bottom sheet. The still is fetched by the same
    origin-first rule as the logo and inlined as a data URI; its size is
    read from its own header, which now covers JPEG (SOF) and WebP
    (VP8/VP8L/VP8X) alongside PNG (IHDR) and SVG. Best-effort as before: a
    still that will not load, or whose header gives no size, leaves the
    single-column card; a ready-made `ogImage` still wins outright.
  * `tests/test_manifest.py` checks that the registry declares `still` and
    `stillAnchor` and that the route reads `copy.still`.

## 1.15.0

* Ships the LINK-PREVIEW shell: what a pasted link to a rokct shell unfurls
  into - the `<title>`, the meta description, the Open Graph and Twitter
  cards and a 1200x630 preview image. Ray, 2026-09-09: each home SDK
  provides its link-preview details, the shell lives in base_sdk. The
  audit that prompted it: `app/layout.tsx` is host-owned and in no SDK's
  `installs` or `requires`, which is exactly how the two live shells drifted
  - one unfurls with copy hand-written into its layout and `app/site.ts`
  that describes a product it is not, the other with a starter template's
  leftovers (`metadataBase` pointing at the template author's domain, the
  template's description, and a template card as its only preview image).
  Neither had a real 1200x630 image of its own.
  * `components/custom/landing/site-metadata.ts` is a seventh one-marker
    registry, `// @rokct-sdk-site-metadata-start`, alongside
    `hero-sections.ts`, `hero-copy.ts`, `hero-form.ts`, `plans-query.ts`,
    `page-sections.ts` and `header-menu.ts`. A home SDK registers one line,
    `{ id: "<sdk>-site-metadata", load: () => import("@/components/custom/landing/<file>") },`
    whose module default-exports a `SiteMetadataCopy` or any subset of
    one: `title`, `description`, `tagline`, and optional `siteName`, `url`,
    `keywords`, `ogImage`, `logo`, `locale`. `loadSiteMetadata()` merges the
    entries in registry order (later wins per field, an `undefined` field
    keeps the earlier value) over `{ title: PLATFORM_NAME, siteName:
    PLATFORM_NAME, description: "", tagline: "" }`, and a module that fails
    to load is logged and skipped, exactly as `loadHeroCopy()` does.
  * `ogImage` and `logo` are two fields on purpose. `ogImage` is a
    READY-MADE preview and counts only when it ends in `.png`, `.jpg`,
    `.jpeg` or `.webp`; an SVG mark is not a preview image because the
    crawlers that unfurl a link do not draw it. `logo` is that mark, and it
    is what the generated image draws - so a home SDK with only a logo
    still gets a proper card, and one with a designed 1200x630 asset gets
    its own.
  * `app/lib/site-metadata.ts` is the shell: `buildSiteMetadata(overrides?)`
    loads the copy and returns the Next `Metadata` - `metadataBase` from
    `NEXT_PUBLIC_SITE_URL` or the copy's `url` (absent, Next falls back to
    `VERCEL_PROJECT_PRODUCTION_URL`), `title: { default, template: "%s — <siteName>" }`,
    `description`, `applicationName`, `keywords`, `alternates.canonical`,
    an Open Graph `website` block (`siteName`, `locale` defaulting to
    `en_ZA`, the preview at 1200x630) and a `summary_large_image` Twitter
    card. `overrides` are shallow-merged last, so the host keeps `icons`
    and anything else that is its own.
  * `app/opengraph-image.tsx` is the generated preview, drawn with the
    `ImageResponse` that ships in `next/og` from the same copy: the
    registered `logo` fetched from the site origin and inlined as a data
    URI (SVG allowed), the site name large, the tagline under it, the host
    small at the foot, on a dark neutral ground, in the bundled sans face -
    no font fetch, no filesystem read. `app/twitter-image.tsx` is the same
    picture. Next gives a file at this path priority over any config-based
    image, so the route also HONOURS a ready-made `ogImage`: when one is a
    real raster it fetches it and answers with those bytes instead of
    drawing. Every fetch is best-effort - a logo that will not load leaves
    a text-only card, never an error.
  * `app/landing/page.tsx` exports `generateMetadata()` from
    `buildPageMetadata()` - the same Metadata with the title absolute, so a
    layout that already applies the `%s — <siteName>` template does not
    suffix it twice - and the page anonymous visitors are redirected to
    unfurls right on its own, before the host layout is touched. Nothing
    else on the page changes.
  * Two host steps, because `app/layout.tsx` is the host's and no SDK may
    ship it (it is now a `requires` entry, with the reason in the manifest):
    the layout replaces its literal `metadata` with the one-liner
    `export const generateMetadata = () => buildSiteMetadata({ icons: {...} })`
    (from `@/app/lib/site-metadata`, host-only keys as overrides); and
    Supacharge neutralises `SITE_DESCRIPTION` in `app/site.ts` (and the
    layout copy that reads it) so the words its home SDK registers are the
    only words the shell speaks. With NOTHING registered a shell is named
    after `PLATFORM_NAME` and unfurls with a card that says so and no
    description - honest rather than wrong - so a shell composed before its
    home SDK registers is no worse off than it was.

## 1.14.0

* SHIPS the header. Ray, 2026-09-09, on the two live shells: rokct.ai and
  supacharge.app must use ONE header - the same component - with the menu
  INSIDE it, links inline on desktop, and on a phone nothing in the bar but
  a burger. `components/custom/header.tsx` is therefore an `installs` entry
  now (`templates/components/custom/header.tsx`), no longer a `requires`
  file the host shell had to write itself, and the composer lands it on
  every shell. Its public API is the one both shells' own headers had -
  `loginUrl`, `signupUrl`, `session`, and the `openLoginPopup` /
  `openSignupPopup` handlers auth_sdk's login and register pages pass - so
  the pages that already render `<Header>` compile unchanged; the menu
  props (`menuItems`, `groups`, `actions`, `nav`) are new and all optional.
  * A caller that passes none of `menuItems`/`groups`/`actions` gets the
    registered menu loaded by the header itself (`loadHeaderMenu()`,
    resolved with `resolveHeaderMenu(menu, nav ?? [])`), because rokct.ai
    mounts the header on /login, /register, /careers and /status without
    the landing host: the fixed links, the groups and the actions render on
    every such page, and an anchor only where a `nav` with its section was
    given. The landing host passes the menu it resolved against its live
    nav; props win when present.
  * An entry with `badge: "soon"` is not out yet, so it is not a link: it
    renders as a span with `aria-disabled` and the not-allowed cursor,
    label and `MenuLabel` intact, in the inline nav, the dropdowns and the
    mobile panel alike (rokct.ai's own header treats a coming-soon feature
    the same way). An action with `external: true` opens in a new tab with
    `rel="noreferrer"`.
  * From the `lg` breakpoint up the bar is logo, then
    `nav[aria-label="Sections"]` with the flat links and the dropdown
    groups (open on hover, focus and click; Escape and an outside click
    close them), then the actions, the theme toggle and the auth links
    (Dashboard when signed in, else Log in and the Sign up pill).
  * Below `lg` the bar is logo and a burger (`aria-expanded`,
    `aria-controls`), nothing else: every link, each group as a headed
    list, the actions, the theme toggle and the auth buttons sit in a
    full-screen panel under the bar. The panel closes on a tap on any of
    its links, on Escape, on a route change and on the burger; the page
    behind it does not scroll while it is open. A header with no menu
    still shows the burger, because the auth links are behind it.
  * The chrome is rokctai_frontend's (64px bar, blurred translucent
    ground, bottom hairline) painted in the shell's theme tokens -
    `bg-background/80`, `border-border`, `text-foreground`, `bg-primary` -
    so rokct.ai renders it in its palette and Supacharge in its own. The
    host still owns the brand mark, the wordmark and the theme control:
    `brand-logo.tsx`, `branding.tsx` and `theme-toggle.tsx` stay
    `requires` files (the last is newly listed; both shells carry it at
    that path with the same `className` prop).
  * It is `sticky`, not `fixed`, so no page under it needs a top padding
    and the hero's own `pt-16` is unchanged from 1.13.0.
* `HeaderMenu` (`components/custom/landing/header-menu.ts`) may now name
  `groups` and `actions` beside `anchors` and `links`, which are exactly as
  they were - lms_sdk's registration keeps working untouched.
  * A `HeaderMenuGroup` is `{ id, label, badge?, items }`, a label that
    opens a dropdown; each item is a fixed `HeaderMenuLink` or
    `{ anchor: "<section id>" }`, resolved against the live nav by the
    same drop-missing rule as a top-level anchor. A group whose every item
    was dropped is dropped with them, so a label never opens an empty list.
  * A `HeaderMenuAction` is `{ id, label, href, variant?: "primary" |
    "ghost", external? }`, a call-to-action button at the right-hand end
    of the bar (rokct.ai's Chrome-extension button is the model).
  * `resolveHeaderMenu(menu, nav)` answers `{ items, groups, actions }`;
    `resolveHeaderMenuItems` is still exported and unchanged. The marker
    line is the same text. `HeaderMenuLink` carries an optional `id`, the
    React key when present (the href stands in when absent).
* ONE menu label. Every badge beside a menu word - the NEW on Supacharge's
  Partners, a SOON - is `components/custom/menu-label.tsx` (`MenuLabel`,
  `{ badge, className? }`): a `bg-primary` pill with `text-black` (Ray:
  "use primary color and text in black" - not `text-primary-foreground`,
  which a shell may set to white), the word uppercased by CSS from the
  declared `"new"`/`"soon"` vocabulary. The header uses it in all three
  places (inline nav, dropdown groups, mobile panel) and it is the label
  for any footer link row a home SDK builds from the same nav entries. The
  only badge base_sdk painted before this was `header-menu.tsx`'s neutral
  black/white `HeaderMenuBadge`; it is gone.
* `components/custom/header-menu.tsx` is the header's menu partials now:
  `HeaderMenuNav` (the inline desktop list), `HeaderMenuList` (the stacked
  mobile list) and `HeaderMenuActions`. `HeaderMenuRow`, the 1.13.0 bar
  that sat UNDER the host's header, is kept as a thin wrapper around
  `HeaderMenuNav` so an existing import still compiles, but the landing
  host NO LONGER RENDERS IT: `components/custom/landing-content.tsx`
  passes the resolved menu straight into `<Header>` and the sticky wrapper
  with the row under the header is gone - one element tree whether or not
  a menu is registered.
* Carries the platform marquee, additive only (Ray, 2026-09-09: Supacharge
  is to inherit rokct.ai's auto-scrolling testimonials).
  * `app/styles/rokct-marquee.css`: the `.rokct-marquee` keyframes (60s
    linear infinite, `translateX(0)` to `translateX(-33.333%)`, the
    duration in `--rokct-marquee-duration`), paused under `.group:hover`,
    and off under `prefers-reduced-motion: reduce` with the
    `.rokct-marquee-track` left scrollable by hand. Until now that motion
    existed only as `animate-marquee` in rokctai_frontend's own
    `tailwind.config.ts`; no SDK ships a Tailwind config, so no other shell
    could run it. Installed and importable exactly like `rokct-scroll.css`.
  * `components/custom/landing/testimonials-marquee.tsx`:
    `TestimonialsMarquee({ items, className?, fadeClassName?,
    cardClassName? })`, agent_sdk's testimonials row element for element
    (tripled list, `.group` wrapper, two edge fades, `w-max` track, 350px
    cards with title, four-line quote, 40px portrait or initial, author and
    role) with its class strings as the defaults, so with no overrides it
    is DOM-identical to rokct.ai's row apart from `animate-marquee`
    becoming `rokct-marquee`. It imports the stylesheet itself, so a
    section that renders it needs no host edit. No consumer in base; a home
    SDK's own testimonials section renders it.

* Hero: a rotating headline phrase that wraps to two lines on a phone no
  longer pushes the suffix down onto the primary button. The phrase sits in
  a fixed `h-[1.2em]` box (`components/custom/hero.tsx`) that `items-center`
  let overflow both ways, so the second line landed on the suffix; the box
  is `items-end md:items-center` now, so below `md` the wrap grows upward
  into the gap under the brand block and the suffix stays put. Desktop is
  unchanged.
* Hero: the rotating headline word is `text-primary`, not `text-yellow-400`
  (Ray: the brand colour lives in the primary token, never hard-coded), so
  each shell's word is its own primary. rokct.ai's `--primary` must be its
  yellow for the word to stay yellow there; `rokct-scroll.css` is already
  variable-driven and is untouched.

## 1.13.0

* Adds a HEADER MENU seam, and with it the half of Ray's report that nothing
  had answered. Looking at the live site he said "menus in header and footer
  are not injected". The FOOTER half a home SDK could always answer by
  itself, because its own footer section owns that markup - lms_sdk's
  `lms-footer-section.tsx` has rendered its link row since it shipped. The
  HEADER half it could not: `components/custom/header.tsx` is a `requires`
  file, the host shell's own, so no SDK may ship it and a home SDK had
  nowhere to put a header link. The landing host is the one thing that
  renders that header, so the seam belongs here.
  * `components/custom/landing/header-menu.ts` is a sixth one-marker
    registry, `// @rokct-sdk-header-menu-start`, alongside
    `hero-sections.ts`, `hero-copy.ts`, `hero-form.ts`, `plans-query.ts` and
    `page-sections.ts`. A home SDK registers one line,
    `{ id: "<sdk>-header-menu", load: () => import("@/components/custom/landing/<file>") }`,
    and `loadHeaderMenu()` answers the FIRST entry that loads - one page, one
    header menu, exactly as `hero-form.ts` picks one form.
  * A `HeaderMenu` names `anchors` - SECTION IDS, not hrefs - and optional
    fixed `links`. `resolveHeaderMenuItems()` resolves the anchors against
    the nav the host has ALREADY computed for this render, the list that has
    been through every section's `meta.renders` predicate. So the label and
    the badge come from the `meta.nav` entry the home SDK already owns and
    are never restated in a second place, and an anchor whose section did not
    render is DROPPED rather than linked to nothing. That last part is the
    point: a hand-written list of hrefs would have reintroduced exactly the
    dead-tick problem `PageSectionMeta.renders` was added in 1.11.0 to stop.
  * `components/custom/header-menu.tsx` is the row, `HeaderMenuRow`, generic
    chrome in the `footer-chrome.tsx` mould: neutral black/white alphas and
    `currentColor` only, so it takes the ground and the ink of whatever
    header it sits under in both themes, and the badge is stated in the
    declared `"new"`/`"soon"` vocabulary without claiming a palette - the
    same split the nav badge got, where base_sdk declared the words and each
    nav rendered them in its own tokens. An empty list renders nothing, so a
    host can mount it without deciding anything.
  * With a menu, `components/custom/landing-content.tsx` pins the host header
    and the row together inside one sticky wrapper, so the row needs no
    knowledge of the host header's height and the host header's own
    `sticky top-0` is harmless inside an already-pinned parent.
  * With NOTHING registered `loadHeaderMenu()` answers `null`, the row
    renders nothing and the host emits the bare `<Header>` element tree it
    always did. rokctai_frontend, whose header carries its own mega menu out
    of `app/config/features.ts`, is untouched - no SDK supplies its menu and
    none of its files change.

## 1.12.0

* Adds the COPYRIGHT ROW every rokct shell ends its page with as shared
  chrome, so each shell renders it instead of keeping a copy. rokct.ai has
  carried this row for a while - the copyright line on the left, a status
  pill and the version string on the right - but only as host-owned code in
  rokctai_frontend's `components/custom/footer.tsx`, which no other shell can
  reach. Ray asked for Supacharge to carry the same row; a second copy in
  lms_sdk would have made it a third copy of generic chrome, so it moves
  here, the way the scrollbar treatment did.
  * `components/custom/footer-chrome.tsx` is the row: `FooterChromeRow`,
    laid out exactly as rokct.ai's is (`© Copyright <year> - <holder>`, then
    the pill, then `Version <v>` from `md` up). It is shell-agnostic by
    construction - no product name, no company, no brand hue. The only
    colours the markup names are neutral `black/5`/`white/5` alphas, which
    sit on whatever ground the footer already has in either theme.
  * `components/custom/landing/footer-chrome-config.ts` holds the wire and
    the words. `FooterChromeConfig` carries the copyright holder, the
    copyright year, the version and label overrides; the generic default
    reads `NEXT_PUBLIC_COPYRIGHT_HOLDER` and `NEXT_PUBLIC_APP_VERSION`, so a
    shell that sets those gets the row with no code. An absent holder hides
    the copyright line and an absent version hides the version string rather
    than either being invented.
  * `app/actions/base/status.ts` probes the status: `getPlatformStatus()`,
    one guest `platformCall` per probe through the single gateway, no
    credentials. It is a server action and the cmds are fixed here rather
    than passed in from the browser, because a client that could name the
    cmd would turn the action into a guest proxy for the whole gateway.
  * THE TENANT ANSWERS FIRST, control is the fallback. base_sdk's own tenant
    endpoint `api.system.api_status` is `allow_guest=True` (core
    `base/frappe/src/tenant/api/system/system.py`) and answers
    `{status: "ok" | "maintenance", version, user}`, so a tenant can speak
    for itself AND report its own maintenance window - the state a visitor to
    that tenant actually cares about. `control:get_versions` (also
    `allow_guest=True`, and what rokct.ai's footer reads today) answers when
    the tenant cannot be reached or the deployment has no tenant of its own.
    `ROKCT_STATUS_SOURCE` reorders or narrows that (`tenant`, `control`,
    `control,tenant`, `off`), so which site answers is a deployment setting,
    not a release.
  * Four states, not two. `operational` and `offline` are rokct.ai's pair;
    `maintenance` is added because the backend genuinely reports it rather
    than being invented; and `unconfigured` - nothing to ask, because no
    backend origin is set - hides the indicator instead of painting a red dot
    a shell has no evidence for. A probe that could not run is skipped
    without counting as a failure, so only a site that was asked and did not
    answer makes the row say offline.
  * The dot's three colours are the one thing treated as semantic rather
    than themed: green/amber/red reads without a legend, and an orange dot on
    an orange page says nothing. They are values, not literals in the markup
    (`FOOTER_CHROME_STATUS_COLORS`), so a shell whose palette carries
    semantic tokens hands those in instead - Supacharge passes
    `var(--sc-success)` / `var(--sc-star)` / `var(--sc-danger)`.
  * `ROKCT_CONTROL_BASE_URL` names the control plane for the control probe,
    falling back to `ROKCT_BASE_URL`. A dedicated name because
    `ROKCT_BASE_URL` means different things per shell: on rokctai_frontend it
    IS the control site, on a single-tenant shell it is that tenant.
  * Nothing existing changes. The landing host does not render the row yet
    and rokctai_frontend's host `footer.tsx` is untouched, so this release is
    additive for every current consumer; migrating rokct.ai onto the shared
    row is a follow-up that needs Ray's word before any host code is
    removed.

## 1.11.0

* A registered section can now say whether it BELONGS on the page, and the
  floating nav follows that answer. `PageSectionMeta` grows an optional
  `renders?: (ctx: PageSectionContext) => boolean`, where
  `PageSectionContext` is `{plans, session}` - the same page facts the
  section is handed in `PageSectionProps`, so the test that keeps a section
  off the page is the very test the page asks before listing it as a stop.
  * `components/custom/landing-content.tsx` asks it ONCE, in a `present`
    memo over the loaded sections, and everything downstream - the overlay
    list, the flow list and `navItems` - reads off that one list. That is
    the point: a section and its nav tick come from a single answer and
    cannot drift apart.
  * It exists because a section that hides itself had no honest way to be a
    nav stop. `meta.nav` is static and read at load, before the section
    renders, so a section whose visibility depends on fetched data had to
    choose between a permanent tick that sometimes scrolls nowhere and no
    tick at all. lms_sdk's pricing section chose the latter and carried
    `nav: []` with a comment explaining why; it can now carry a real
    Pricing entry that appears exactly when there are plans to show.
  * Absent predicate means the section always belongs, so this is additive:
    every section registered before 1.11.0 renders in the same place and
    contributes the same nav entries. rokctapp's landing is byte-identical.

## 1.10.0

* Gives a floating-nav entry somewhere to say it is NEW or coming SOON.
  rokct.ai has carried those little pills in its header menu for a long
  time; a landing page composed from the SDKs had no way to express one,
  because `LandingNavItem` was `{ id, label }` and that is the only thing a
  section can contribute to the nav.
  * `components/custom/landing/landing-config.ts` adds one OPTIONAL field,
    `badge?: "new" | "soon"` (the union is exported as `LandingNavBadge`).
    Purely additive: every `{ id, label }` entry a section already registers
    in `meta.nav` compiles and renders exactly as before.
  * No new registry and no new marker. The badge rides on the nav entry the
    section already owns, which follows the standing rule that base_sdk's
    floating nav derives its list from what the home SDK registered - there
    is no second list to keep in step, and a section that stops being new
    edits only its own `meta.nav`.
  * base_sdk defines the vocabulary, not the pixels. It ships no badge
    markup: the floating nav itself belongs to the home SDK (agent_sdk's
    `floating-nav.tsx`, lms_sdk's `lms-floating-nav.tsx`), and those two
    already diverge on purpose - rokctapp's ticks and tooltip are zinc,
    Supacharge's are `--sc-*` tokens. A shared badge would have to pick one
    palette for both, and rokct's accent is yellow where Supacharge's is
    orange, so each renderer paints the badge in its own theme token.

## 1.9.0

* Gives the landing host's PLANS QUERY the seam its sections, its hero copy
  and its hero form already have. The host prefetches one plan list and
  hands it to every registered section; which plans those are was fixed in
  `components/custom/landing/landing-config.ts` as the platform's
  `Subscription Plan` catalog - the plans on which someone RUNS a rokct app
  (the tenant fixtures price them USD 20 monthly / USD 200 yearly). That is
  exactly right for rokctai_frontend, whose visitors buy an LMS to run, and
  exactly wrong for a product whose landing page sells to its own end users:
  Supacharge's visitors are learners, and the plans they buy are that
  tenant's own catalog. A thin shell cannot fix that by editing the
  installed `landing-config.ts`, because the next compose regenerates it.
  * `components/custom/landing/plans-query.ts` is a fifth one-marker
    registry on the same contract as `page-sections.ts`, `hero-sections.ts`,
    `hero-copy.ts` and `hero-form.ts`: a home SDK contributes its query by
    injecting ONE line at `// @rokct-sdk-plans-query-start` through its
    manifest `integrations`,
    `{ id: "<sdk>-plans", load: () => import("@/components/custom/landing/<file>") }`,
    naming a module it installs whose default export is a
    `LandingPlansQuery` (`{cmd, payload}`) or `null`. A separate file for
    the same reason the others are: `update_integrations()` anchors
    successive entries per target file, so one file carries one marker and
    an entry is a single self-contained line with a dynamic import.
  * `loadLandingPlansQuery()` answers the FIRST entry that loads - one
    page, one plan list, exactly as `hero-form.ts` picks one form. An entry
    that throws is logged and skipped in favour of the next; a registered
    module whose default is `null` is a deliberate "prefetch no plans" and
    is honoured. With NOTHING registered the loop does not run and the
    answer is `LANDING_CONFIG.plansQuery` verbatim.
  * `app/actions/base/landing.ts` reads the query through that loader
    instead of `LANDING_CONFIG.plansQuery` directly. Nothing else about the
    fetch changes: still one guest `platformCall` through the single
    gateway, still `plan_category` mirrored onto `category`, still an empty
    list on any failure.
  * Engineering only for rokctapp: composed with nothing registered at the
    marker, `getLandingPlans()` sends the identical `frappe.client.get_list`
    of `Subscription Plan`, so rokctai_frontend's pricing shows the same
    tenant catalog it shows today. `landing-config.ts` keeps that query as
    the documented generic default.

## 1.8.0

* Carries the platform scrollbar. Ray, 2026-09-08: "rokctai_frontend has
  a unique scroll with yellow color i think each sdk should use it, so it
  can move to base sdk". `app/styles/rokct-scroll.css` is rokctai_frontend's
  "Custom Scrollbar" block (`app/globals.css` lines 165-189 on its main: a
  6px webkit scrollbar, transparent track, `#facc15` thumb, `#eab308` on
  hover, the same in `.dark`) with the values as CSS variables on `:root` -
  `--rokct-scroll-width`, `--rokct-scroll-track`, `--rokct-scroll-thumb`,
  `--rokct-scroll-thumb-hover` - the yellow as the default, so a home SDK
  rethemes the scroll by redefining them in a stylesheet of its own.
  `app/landing/page.tsx` imports the file, so a composed shell has the
  scroll on `/landing` with no host edit; a host that wants it on every
  route adds `@import "./styles/rokct-scroll.css";` to its
  `app/globals.css`. rokctai_frontend keeps its own identical rules in
  `globals.css` and renders the same.

## 1.7.0

* Takes the input out of the hero and gives the hero a form slot. Ray,
  2026-09-08: "no hero work same way as landing, they need to be injected
  like generic profile, chat box is for chat related stuff, i think if
  agent sdk is home it inject that chat". The search-style input, its
  typewriter placeholders, the submit and the results the hero-sections
  registry rendered under the input were rokctapp's chat box living in the
  generic hero; they belong to the home SDK that owns chat, so they moved
  to agent_sdk 1.5.0 (`components/custom/landing/agent-hero-form.tsx`),
  and the hero renders whatever the home SDK registers in their place.
  Engineering only: rokctapp composed with agent_sdk 1.5.0 renders the same
  DOM as before; a shell with nothing registered renders the headline,
  trust line and badges with no box.
  * `components/custom/landing/hero-form.ts` is a fourth one-marker registry
    on the same contract as `hero-sections.ts`, `hero-copy.ts` and
    `page-sections.ts`: a home SDK contributes its form by injecting ONE
    line at `// @rokct-sdk-hero-form-start` through its manifest
    `integrations`,
    `{ id: "<sdk>-<form>", load: () => import("@/components/custom/landing/<file>") }`,
    naming a client component module it installs whose default export
    takes `HeroFormProps`: `hero` (the resolved `HeroConfig`), `signupUrl`,
    and the optional `onFocusChange`, `onActiveChange` and
    `onHeadlineWordsChange` callbacks through which a form keeps the hero
    collapsing its wordmark while the box is in use, tells the page while
    results are showing and adds its sections' headline words to the
    rotation. `loadHeroForm()` resolves the FIRST registered entry (one
    hero, one form); an entry that fails to load is logged and skipped in
    favour of the next, and none leaves the slot empty.
  * `hero.tsx` renders that entry through a `next/dynamic` loader, so the
    form is server-rendered with the rest of the hero and the loader adds
    no wrapper node; with the registry empty there is no loader and the
    slot renders nothing, server and client alike, so the markup is
    deterministic either way. The brand, the rotating headline
    (`headlineWords` plus whatever the form reports), `headlineSuffix`,
    the background, the trust line and the badges are unchanged.
  * `hero-sections.ts` stays: feature SDKs keep registering sections into
    it (agent_sdk's `agent-opportunities`), but the registered form, not
    the hero, loads and renders them now. `hero-config.ts` keeps
    `placeholders`, `logoPlaceholderToken` and `fallbackHref` for the form
    to read.
  * Lands after agent_sdk 1.5.0: its integration against a base without
    `hero-form.ts` is a "target not found" line the installer skips, and
    its form file type-checks without the registry, so rokct.ai shows the
    unchanged 1.6.0 hero in between; the other order would show the hero
    with no box until agent_sdk followed.
## 1.6.0

* Gives the hero's copy a seam, so a shell's home SDK can supply the hero's
  words instead of every shell showing rokctapp's ("Everything is a chat
  away", "Trusted by 20M+ users", the store badges). A thin shell cannot
  edit `hero-config.ts` durably - installed files are regenerated on every
  compose - and the hero section registry only APPENDS headline words and
  placeholders (agent_sdk's `agent-opportunities` `meta`), it never replaces
  the default copy. Engineering only: the default stays rokctapp's copy,
  byte for byte, and a shell that registers nothing renders exactly as
  before.
  * `components/custom/landing/hero-copy.ts` is a third one-marker registry
    on the same contract as `hero-sections.ts` and `page-sections.ts`: a
    home SDK contributes its copy by injecting ONE line at
    `// @rokct-sdk-hero-copy-start` through its manifest `integrations`,
    `{ id: "<sdk>-hero", load: () => import("@/components/custom/landing/<file>") }`,
    naming a module it installs whose default export is a `HeroCopy` -
    `Partial<HeroConfig>`: `headlineWords`, `headlineSuffix`,
    `wordIntervalMs`, `placeholders`, `logoPlaceholderToken`,
    `backgroundImage`, `trustLine`, `badges`, `fallbackHref`, any subset.
    `loadHeroCopy()` loads the registered modules on the client and merges
    them in registry order (an absent field keeps the default, a later
    entry wins a repeated one; a module that fails to load is logged and
    skipped). A separate file for the reason the other two are: the
    installer anchors successive entries for a target file after the
    previous one whichever marker they named, so one file carries one
    marker.
  * `hero.tsx` starts on `HERO_CONFIG` when the registry is empty (the
    same first render as before, server and client) and otherwise on no
    copy at all - no headline, placeholders, background, trust line or
    badges - until the registered copy resolves, so a visitor to a shell
    whose home SDK supplies the copy never sees another product's words
    first. Every `HERO_CONFIG.` read in the component now goes through the
    resolved copy; the markup is unchanged.
  * `hero-config.ts` keeps rokctapp's words and is now documented as the
    default a home SDK overlays, not the file a thin shell edits.
  * Declares what the sidebar chrome already needed: `next-auth`
    (`5.0.0-beta.30`, the version rokctapp and supacharge pin) joins
    `dependencies`, and `components/custom/session-provider.tsx` joins
    `requires` - `app-sidebar.tsx` and `nav/team-switcher.tsx` read
    `useSession()` from `next-auth/react`, which only works under the
    provider that file mounts, so a shell composing base_sdk without
    auth_sdk (which installs it since auth_sdk 1.4.0, Users#93) must ship
    a pass-through or `/manager` 500s at runtime. `requires` is a warn-only
    check, so the composer's checklist now names the gap; rokctapp already
    has the file and the dependency, supacharge-web gets both in its #11.

## 1.5.0

* Carries the rest of the landing HOST as generic templates, on top of
  1.4.0's hero - and only the host. Ray, 2026-09-03: "each home sdk holds
  its own landing page", "similar to profile in dart": base_sdk holds the
  page, the orchestrator, the section registry and the generic hero; the
  content sections of a product's landing page live in that product's home
  SDK (agent_sdk 1.4.0 for rokctapp) and register themselves here. The
  host files land on the shell's own paths, so the composer overwrites the
  shell copies and they become SDK-owned copies to sweep:
  `app/landing/page.tsx` and `components/custom/landing-content.tsx`.
  * `components/custom/landing/page-sections.ts` is a second one-marker
    registry: a home SDK contributes a section by injecting ONE line at
    `// @rokct-sdk-page-sections-start` through its manifest
    `integrations`, `{ id: "<file>", load: () => import("@/components/custom/<file>") }`,
    exactly like the hero registry (a separate file because
    `update_integrations()` anchors entries per target file, so one file
    carries one marker). The module contract is `{ default, meta? }`:
    `meta.order` places the section (ascending, 100 when absent, registry
    order breaking ties; the hero is 0 and stays first; a negative order
    renders before the hero, outside the block the page hides while the
    hero shows search results - for a fixed overlay such as a floating
    nav), `meta.nav` adds its floating-nav entries (the first id is the
    section's DOM id; the page renders empty anchors for the rest; `[]`
    for no entry) and `meta.anchor` names the DOM id of a section with no
    nav entry. Each section receives `PageSectionProps`: id, signupUrl,
    loginUrl, session, the prefetched `plans` and the whole `nav` in page
    order.
  * `components/custom/landing-content.tsx` loads the registered modules
    on the client, sorts them by order and renders them around the hero;
    it names no section, so a shell with nothing registered renders the
    hero alone.
  * `components/custom/landing/landing-config.ts` holds the generic values
    only: the login/sign-up URLs, `planSignupUrl`, the nav's hero and
    footer ends and `plansQuery` (default: the Subscription Plan list). No
    product copy.
  * `app/landing/page.tsx` reads the session through the kernel seam
    (`getPlatformSession`, never `app/(auth)` directly) and prefetches the
    plans through the new `app/actions/base/landing.ts` (`getLandingPlans`,
    a guest `platformCall` of `LANDING_CONFIG.plansQuery`, `plan_category`
    mirrored onto `category`), handing them to every section. The shell's
    page imported `@/lib/actions/getSubscriptionPlans`, which does not
    exist in the shell, so its prefetch never compiled.
  * NOT carried here: the shell's floating-nav, logos, social, features,
    workflow, pricing, comparison, faq and testimonials sections and their
    copy - they are rokctapp's and move to agent_sdk 1.4.0, which registers
    them (with the chat section) in page order. The eight sections the
    shell kept but never rendered (`banner`, `category-selector`, `cta`,
    `devices-section`, `extension-section`, `features`, `security-section`,
    `teams-section`) are not carried either: nothing imports them.
  * `requires` adds the host's `components/custom/header.tsx` (the landing
    host renders the shell header, which the shell's status and careers
    pages also use).

## 1.4.0

* Carries the landing hero as a GENERIC template (Ray, 2026-09-03: "hero
  goes to base sdk as generic"): `components/custom/hero.tsx` renders the
  brand, a rotating headline, a search-style input and the store badges,
  and nothing of any product feature. It lands on the same path as the
  RokctAI_frontend shell's own copy, which the composer overwrites.
  * `components/custom/landing/hero-config.ts` holds every word on it
    (headline words and suffix, input placeholders, trust line, badges,
    background) plus `fallbackHref`, where a submit goes when no section
    is registered (default: the signup URL, so the input is a plain call
    to action). Badges read the host's `app/config/features.ts` toggles as
    the shell copy did; the hero component itself no longer does.
  * `components/custom/landing/hero-sections.ts` is the section registry:
    a feature SDK contributes what happens to a submitted query by
    injecting ONE line at `// @rokct-sdk-hero-sections-start` through its
    manifest `integrations` - the same contract as the nav marker in
    `app/handson/sidebar-client.tsx` and the flag marker in
    `app/config/compose.ts`. An entry is
    `{ id, load: () => import("@/components/custom/landing/<file>") }`;
    the hero loads registered modules on the client and renders each
    default export under the input with `HeroSectionProps` (the query, a
    submit counter, `onActiveChange` / `onBusyChange` / `onClear`). A
    module's optional `meta` export adds headline words and placeholders,
    so a feature's copy stays in the feature's file. The dynamic import is
    what keeps a contribution to one line: `update_integrations()` anchors
    successive entries for a target file after the previous entry
    regardless of which marker they named, so a file can carry one marker
    and an entry cannot bring its own import statement. agent_sdk's
    opportunities search is the first section (agent_sdk 1.3.0).
  * Icons come from `lucide-react` (already a dependency) rather than the
    shell copy's `react-icons`; `framer-motion` is added to
    `dependencies`. `requires` adds the host's `app/config/features.ts`,
    `components/custom/brand-logo.tsx` and `components/custom/branding.tsx`.

## 1.3.0

* `src/services/platform-gateway.ts` now carries the tenant/session
  wrapper the paas-era shell kept in `app/lib/paas-gateway.ts`, mirroring
  the Dart kernel where `PlatformGateway` sits on `HttpService`
  (baseUrl) + `TokenInterceptor` (the token auth_sdk writes) and feature
  SDKs call it directly (Ray, 2026-09-03):
  * `resolveTenantBaseUrl()` picks the backend PER CALL, never at build
    time, so one Next.js instance serves any number of tenants: an
    explicit `baseUrl` option, else the signed-in user's tenant site
    (`session.user.siteName`), else the request host mapped to a tenant
    site (`ROKCT_TENANT_HOSTS` JSON map or a resolver registered with
    `setTenantHostResolver`, the hook for a control-site lookup later),
    else `ROKCT_BASE_URL` / `NEXT_PUBLIC_ROKCT_BASE_URL` /
    `NEXT_PUBLIC_FRAPPE_URL` (the paas-gateway name, kept as an alias).
    The request headers are only read when a host lookup is configured.
  * `platformCall()` sends the session's API credentials as
    `Authorization: token key:secret` unless the caller passes its own
    header or `requireAuth: false` (the Dart client's flag). Unlike the
    Dart app, which has one baseUrl, a call here may be steered at
    another site (an explicit `baseUrl` for the control plane), so the
    credentials only go to the session's own site (`siteName`, or any
    target when the session names none) — never to a different origin.
    It accepts `session` / `request` inputs for callers that hold them,
    and gains `throwOnError` (default `false`, so the existing
    `null`-on-failure contract is unchanged) which throws a
    `PlatformGatewayError` carrying `cmd`, `reason` and the HTTP
    `status`.
  * The "no session / no request scope" catch-alls let Next.js's own
    render signals through (`isNextRenderSignal`: dynamic-usage bailouts,
    prerender interrupts, `redirect()` / `notFound()`), so a static
    render that reaches the session is still handled by the framework
    rather than silently treated as signed out.
  * `paasCall()` is exported from the gateway as the compatibility name
    with the shell helper's exact semantics (`Unauthorized` without a
    session, `PaaS gateway call failed: <cmd>` on failure), so call sites
    switch with a one-line import change. The base admin actions
    (`app/actions/base/admin/{content,settings,system}.ts`) now import it
    from `@/app/services/base/platform-gateway`.
* New kernel modules under `src/services` (installed by the existing
  directory entry): `session.ts` (server-only; reads the session through
  the host shell's `app/lib/session.ts` seam, which auth_sdk overwrites
  with its NextAuth-backed copy, never through `app/(auth)`),
  `tenant-hosts.ts` (site-name normalisation, `sameSite`, the env map,
  the resolver hook) and `gateway-constants.ts` (`PLATFORM_GATEWAY_METHOD` /
  `PLATFORM_GATEWAY_PATH`, split out so the client-safe telemetry lane no
  longer imports the now server-only gateway; the gateway re-exports
  them). `index.ts` re-exports the new surface.
* `requires` drops `app/lib/paas-gateway.ts` and adds the
  `app/lib/session.ts` seam. telemetry_sdk and comms_sdk still import the
  shell helper; their switch is a separate change per SDK.

## 1.2.0

* Consolidates the paas-era Next.js shell chrome and admin settings/CMS
  surfaces that lived under the `RokctAI_frontend` shell into this kernel
  half as 32 flat templates in one top-level `installs` list, alongside
  the unchanged `src/services` kernel install.
  * Shell chrome: `components/custom/app-sidebar.tsx`,
    `components/custom/beta-toggle.tsx`, `components/custom/nav/nav-user.tsx`,
    `components/custom/nav/team-switcher.tsx`,
    `components/ui/date-range-picker.tsx`, `hooks/use-mobile.tsx`.
  * Admin surfaces: the admin home (`app/admin/page.tsx`),
    `components/custom/nav/admin-nav.tsx`, the content pages (`blogs`,
    `faqs`), the settings pages (`app`, `currencies`, `faqs`, `flutter`,
    `general`, `landing`, `pages`, `privacy`, `social`, `system`, `terms`),
    the system pages (`backup`, `info`, `languages`, `translations`,
    `update`) and the `content` / `settings` / `system` server actions at
    `app/actions/base/admin/`.
  * Manager surfaces: the manager shell `app/manager/layout.tsx` and
    home `app/manager/page.tsx`.
  * Customer surface: `components/custom/nav/client-nav.tsx`.
* Host paths drop the `paas` segment: `app/paas/admin/X` installs to
  `app/admin/X`, `app/paas/dashboard/X` to `app/manager/X`, and
  `app/actions/paas/admin/X` to `app/actions/base/admin/X`. Components and
  hooks keep their paths. Import specifiers and route strings were rewritten
  mechanically to match; file contents are otherwise unchanged.
* Templates are flat and installed through one top-level `installs` list;
  there are no `app_type` persona blocks. Admin and manager see similar
  pages and the page code hides what the other role should not see
  (Ray, 2026-09-03).
* `requires` lists the host-shell prerequisites the templates import but
  this SDK does not ship (`components/ui/*`, `app/lib/*`, `lib/utils`, the
  handson global-settings action, `app/config/platform`), the cross-SDK
  paths (`app/actions/telemetry/{admin/,}dashboard.ts` from telemetry_sdk,
  `app/actions/merchants/shop.ts` and `components/custom/nav/merchant-nav.tsx`
  from commerce/merchants) and `components/custom/nav/delivery-nav.tsx`,
  which has no SDK home yet; `_comment` names the owner of each.
* The three kernel files under `src/services` and their install entry are
  untouched.
