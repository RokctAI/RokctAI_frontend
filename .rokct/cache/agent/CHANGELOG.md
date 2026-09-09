# Changelog

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
    behaviour unchanged, with the type filter moved from the input bar
    into the panel header (the input now belongs to the hero). Its `meta`
    export adds the "Funding is / Grants are / Tenders are" headline words.
  * A new `integrations` entry registers it: one line after
    `// @rokct-sdk-hero-sections-start` in base_sdk's
    `components/custom/landing/hero-sections.ts`
    (`{ id: "agent-opportunities", load: () => import("@/components/custom/landing/agent-opportunities") }`),
    the same marker contract as the nav and compose-flag entries. That
    registry file is listed under `requires`; base_sdk composes first.
  * `app/lib/intent-engine.ts` (`analyzeIntent`, imported only by the
    opportunities search) and `components/custom/chat-section.tsx` (the
    "NEW · Chat" landing section that links to `/chat`, which this SDK
    already owns) install as flat entries, byte-identical to the shell
    copies the composer now overwrites. The shell's
    `app/(chat)/opengraph-image.png` and `twitter-image.png` join the
    existing `templates/app/(chat)` tree, which the directory install
    already walks, so the whole `(chat)` group is SDK-owned.
  * `app/actions/ai/opportunities.ts` (`searchPublicOpportunities`, a
    `"use server"` action landed by the existing `templates/app/actions/ai`
    directory install) fronts `OpportunityPublicService.search` for the
    section: the service calls base_sdk's platform gateway, server-only
    since base_sdk 1.3.0, so a client component cannot import it - the
    shell's own client-side hero did, and `next build` of the composed
    rokctapp shell failed on that chain (`server-only` and postgres
    `fs`/`net` reached from a Client Component). The section imports only
    the `Opportunity` type from the service.
  * `requires` adds `components/ui/carousel.tsx` and
    `app/config/platform.ts` for the chat section.

## 1.2.0

* `app/actions/ai/onboarding.ts` commits the onboarding plan to the tenant
  site through `platformCall` from `@/app/services/base/platform-gateway`
  (base_sdk >= 1.3.0) instead of a hand-rolled `fetch` of the gateway URL.
  The cmd (`api.plan_builder.commit_onboarding_answers`) and payload are
  unchanged; the site and API credentials still come from the user row (the
  session is not consulted: explicit `baseUrl`, explicit `Authorization`
  header when the row carries keys, `requireAuth: false`, `session: null`).
  `throwOnError` maps a non-2xx answer to the same "Failed to commit
  onboarding profile" result the raw fetch fell back to, and a connection
  failure to the same `String(error)` result as before. No install,
  integration or requirement changes; `requires` already named
  `app/services/base/platform-gateway.ts`.

## 1.1.0

* Adds `app/services/public/opportunities.ts` (`OpportunityPublicService`,
  `Opportunity`) as a flat template in the one top-level `installs` list.
  The landing hero in the RokctAI_frontend shell
  (`components/custom/hero.tsx`) imports it for its opportunity search; the
  shell's own copy was removed as an SDK-owned file in RokctAI_frontend#130
  and the restore in RokctAI_frontend#135 is superseded by this entry (Ray's
  ruling: the file belongs to agent_sdk). Code is unchanged apart from the
  header note naming this SDK as the provider.
* `platformCall` resolves through base_sdk's
  `app/services/base/platform-gateway.ts`, already listed under `requires`.
* No `app_type` persona block: the file installs for every host that
  composes agent_sdk, the same as the rest of this half.
