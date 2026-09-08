# Changelog

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
