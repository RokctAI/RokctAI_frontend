# Downloads, the install offer, the suffix in primary and Back to top

Three generic seams base_sdk 1.41.0 adds to the shell's chrome, and the
two rules 1.46.0 adds to the install offer (the browser's install prompt
as a real action; the offered platform's icon hidden). Base declares NO
entry, NO site name and NO colour for any of them: a home SDK hands the
data in, and a shell whose home SDK declares nothing renders exactly
what it rendered before.

## The site name's suffix in the primary colour

Ray, 2026-09-11 07:34:03Z: "also site name the .school get primary color
in nextjs".

The header's stem wordmark (`components/custom/header.tsx`,
`BrandStemWordmark`) shows a dotted platform name as its capitalised stem
followed by the rest of the name - the dot and the suffix. Since 1.41.0
that suffix span carries `text-primary`, the theme token every shell
already defines, and its own hook:

```tsx
<span data-brand-wordmark="tld" className="min-w-0 overflow-hidden text-primary">
  {suffix}
</span>
```

The stem span before it keeps `text-foreground`; the country-code span
beside the stem and the wordmark's own class list are untouched; the
slide the suffix makes when the header collapses is unchanged. A home SDK
that wants the suffix in another colour, weight or face styles
`[data-brand-wordmark="tld"]` with one rule, the way it styles
`[data-brand-wordmark="stem"]`.

The hero has the matching mode. `HeroConfig.brand` accepts `"stem-tld"`
beside `"name"` and `"stem"`:

| `brand`      | The hero's wordmark slot                                            |
| ------------ | ------------------------------------------------------------------- |
| `"name"`     | The host's own `Branding` component (the default).                  |
| `"stem"`     | The capitalised stem as text; the full name on aria-label and title. |
| `"stem-tld"` | The same stem, then the suffix in `text-primary` with the `tld` hook. |

A home SDK's hero copy declares `brand: "stem-tld"` the way it declares
`brand: "stem"` today; nothing else changes on its side.

`resolveHeroWordmark(brand, name)` (`landing/landing-page.ts`) answers
`{ text, name, suffix }` for `"stem-tld"` - the suffix is the trimmed
name after the stem, in its own case - and `{ text, name }` for `"stem"`
or for a name with no dot; `HeroWordmarkSlot` (`hero-view.tsx`) draws the
suffix after the stem inside the same span, so it shares the face and
the size, which is now computed over the stem and the suffix together.

## Footer downloads: one icon button per platform

Ray, 2026-09-11 07:34:37Z: "footer has  download links let them be
platform icons buttons".

`FooterChromeConfig` (`landing/footer-chrome-config.ts`) gains
`downloads?: DownloadEntry[]`:

```ts
export type DownloadPlatform =
  | "ios" | "android" | "huawei" | "macos" | "windows" | "linux" | "web";

export interface DownloadEntry {
  id: string;
  platform: DownloadPlatform;
  label: string;        // "Android app": the button's aria-label
  href: string;         // https URL, or a route of the shell's own
  external?: boolean;   // target _blank, rel noreferrer
  title?: string;       // the button's title when not the label
  mark?: BrandMarkId;   // googlePlay | appGallery | appStore | windows | chromeWebStore
}
```

`FooterChromeRow` (`components/custom/footer-chrome.tsx`) draws the
entries as `<nav aria-label="Downloads">` beside the link groups, above
the copyright line, through `DownloadButtons`
(`components/custom/download-buttons.tsx`, since 1.46.0 - see "The
offered platform's icon is hidden" below): one `<a>` per entry, 40px round, the theme's border,
transparent and tinted on hover
(`h-10 w-10 rounded-full border border-border bg-transparent hover:bg-muted flex items-center justify-center`),
the label as `aria-label` and `title`, the platform on
`data-download-platform`. Inside it: the mark the entry names, from
`BRAND_MARKS` through `next/image` with `markImageClass` (so the two
monochrome marks invert on the dark shell, as everywhere else), or - with
no mark named - a neutral glyph from `landing/platform-glyphs.tsx`: a
phone (ios, android, huawei), a laptop (macos, windows), a terminal
(linux) or a globe (web), stroked in `currentColor`. No third-party mark
is ever drawn by hand.

`landing/download-platform.ts` holds the pure rules: `DOWNLOAD_PLATFORMS`,
`isDownloadPlatform`, `isDownloadHref` (`https:` with a host, or a path
with one leading slash), `isDownloadEntry`, `normaliseDownloads` (the
drawable entries in declared order, the first of two with the same `id`)
and `downloadTitle`. Nothing declared, or nothing drawable, draws no nav.

`FooterChromeLabels.downloads` ("Downloads") is the nav's accessible
name; override it with the other words.

## The install offer: the app for the visitor's platform

Ray, 2026-09-11 07:37:17Z: "this nextjs has install, it does show on
mobile though i havent seen it in desktop i think it installs as pwa but
i think it should check the platform and offer app of that platform".

`components/custom/install-offer.tsx` (`"use client"`) exports
`InstallOffer({ downloads, labels?, platform?, className? })`:

1. It renders NOTHING on the server and on the first client render.
2. After mount it reads `matchMedia("(display-mode: standalone)")` - an
   installed page gets no offer - and the visitor's platform
   (`landing/install-offer.ts` `detectPlatform()`:
   `navigator.userAgentData.platform` first, then the user-agent string:
   iPhone/iPad to `ios`, HarmonyOS/HUAWEI to `huawei`, Android to
   `android`, Windows to `windows`, Mac to `macos`, Linux/X11 to
   `linux`; nothing recognised is `null`).
3. `pickDownload(downloads, platform)` takes the first entry for the
   platform, with `android` falling back to `huawei` and `huawei` to
   `android` (`DOWNLOAD_FALLBACKS`); the desktops and iOS take only their
   own; `web` and `null` take none.
4. With an entry it draws one icon button and "Get the <label>" (the
   entry's label; `labels.get` overrides the prefix) linking there.
5. Beside it - whether or not an entry matched - it draws "Install"
   (`labels.install`) once the browser has fired `beforeinstallprompt`;
   a click runs that prompt (below).
6. With neither it draws nothing.

### The install prompt is a real action (1.46.0)

Ray, 2026-09-11 20:35:38Z: "nextjs no longer offering me to install app
like it used to with pwa"; 20:46:43Z: "the install offer used to show
its not showing, that bottom offer is not really an offer its attention,
no clicking icon on browser and it try to install or it popup and
install".

The 1.41.0 offer listened for `beforeinstallprompt` only when no entry
matched the platform, and only from a second effect after the platform
read: a shell with a matching entry never offered the install, and
elsewhere an early event was missed while a late one was swallowed by
`preventDefault()` with nothing drawn for it. Since 1.46.0:

1. The FIRST effect on mount - before any platform read - listens for
   `beforeinstallprompt` and `appinstalled`, once. The event is stashed
   and stays stashed until the visitor acts; `appinstalled` drops it.
2. `preventDefault()` runs only when the Install control will render. A
   page running installed (`display-mode: standalone`) leaves the
   browser's own banner alone.
3. The Install control renders only once an event is stashed. A click
   calls `event.prompt()`, awaits `event.userChoice`, then clears the
   stash; a second click while the prompt shows is ignored, and a later
   event (the browser may fire one again after a dismissal) is stashed
   again.
4. The native link and the Install action render side by side when both
   apply.

`BeforeInstallPromptEvent` is exported for a host that types the event
itself. Base registers no service worker: the browser fires the event
only for a page it finds installable, which needs the host's own
`app/manifest.ts` to carry `icons`.

### The offered platform's icon is hidden (1.46.0)

Ray, 2026-09-11 20:33:16Z, of the icon buttons: "they become double when
you tell user to download for that platform, i think should hide the
normal one when showing the other".

The offer publishes the id of the entry it is showing to
`OFFERED_DOWNLOAD` (`landing/install-offer.ts`;
`createOfferedDownloadStore()` is a plain `get`/`set`/`subscribe` store,
`null` until set, notifying on a change only) after mount, and clears
it on unmount. `DownloadButtons({ downloads, hideOffered? })`
(`components/custom/download-buttons.tsx`, `"use client"`) reads it
through `React.useSyncExternalStore` with `null` as the server snapshot
and draws `visibleDownloads(downloads, offeredId)` - every entry but
that id, in declared order; `null` or an id no entry carries keeps them
all. So the server HTML and the first client render carry EVERY icon -
no window read at render - and the duplicate goes after mount; with no
offer mounted, no platform recognised or an installed page nothing is
hidden. `hideOffered={false}` keeps every button; `useOfferedDownload()`
is exported for a home SDK's own row.

`platform` forces the platform for a preview or a test. `FooterChromeRow`
mounts the offer FIRST in the Downloads nav (`installOffer` prop, default
`true`); a home SDK that wants it in a header slot imports it from
`@/components/custom/install-offer` with the same `downloads` and passes
`installOffer={false}` to the row. Base changes no header by default.

## Declaring the entries

A home SDK spreads the entries into the config its footer hands the row:

```ts
import { FooterChromeRow } from "@/components/custom/footer-chrome";
import { FOOTER_CHROME_CONFIG } from "@/components/custom/landing/footer-chrome-config";

<FooterChromeRow
  config={{
    ...FOOTER_CHROME_CONFIG,
    downloads: [
      { id: "android", platform: "android", label: "Android app", href: "/get/android", mark: "googlePlay" },
      { id: "web", platform: "web", label: "Web app", href: "/app" },
    ],
  }}
/>
```

Every word, link and mark there is the home SDK's; the hrefs above are
routes so this page names no host.

## The floating "Back to top" button

Ray, 2026-09-11 12:32Z: "whats missing is floating push to home, that
button you press and it get you to top i just forgot what it says".

`components/custom/back-to-top.tsx` (`"use client"`) exports
`BackToTop({ threshold?, label?, className? })`, and
`components/custom/landing-content.tsx` mounts it once, after `<main>`,
so every composed landing - a base-only host and a home SDK's, whose `/`
sends an anonymous visitor to `/landing` - has it with no host edit:

1. Hidden at the top of the page; shown once the visitor has scrolled
   past `threshold` pixels - one viewport height by default, read on
   every check (`landing/back-to-top.ts` `resolveThreshold`,
   `isPastThreshold`: strictly past, so the top is always hidden).
2. Fixed at the bottom right (`bottom-4 right-4`, `md:bottom-6
   md:right-6`, the safe-area inset as margin) at `z-30`: under the
   sticky header (`z-50`) and its mobile panel (`z-40`), so an open menu
   covers it, and clear of the left edge and the vertical middle a home
   SDK's floating nav uses. The install offer above is inline in the
   footer's Downloads nav, never fixed, so the two never meet.
3. A click scrolls to the top - `"smooth"`, or `"instant"` (since
   1.56.0; `"auto"` before, which follows a page's CSS `scroll-behavior`
   and so glided on a site that sets it smooth) when
   `(prefers-reduced-motion: reduce)` matches
   (`scrollBehaviour`) - and blurs the button, which hides again.
4. The scroll and resize listeners are passive and folded into one
   `requestAnimationFrame` per frame; every window read is in the effect
   or the click, so the server and the first client render agree.
5. Always in the tree and fading (`motion-safe:transition-opacity`);
   while hidden it carries `tabIndex={-1}`, `aria-hidden` and
   `pointer-events-none`. Shown, it is a keyboard-focusable `<button>`
   with `aria-label` and `title` "Back to top" (`BACK_TO_TOP_LABEL`;
   `label` overrides).

### Every page, every shell (1.56.0)

Ray, 2026-10-31: "every app shell need the button to go up". Until
1.56.0 only the landing shell and the site frame mounted the button, so
an admin page, a dashboard or a home SDK's own page (the ROKCT studio
home, a course page, the loans area) had none. Now:

- **Mounted on every route.** base's theme seam,
  `components/custom/theme-provider.tsx`, which every shell's root layout
  already wraps its page in, mounts `<BackToTop scope="root" />` after the
  page. No host edit, and no home SDK duplicates the component.
- **One button per page.** `scope` is `"frame"` by default: the button
  inside a site's own look (the landing shell, the site frame, a home
  SDK's own page root). While any framed button is mounted, the root one
  draws nothing (`yieldsToFrame`). A home SDK whose page is not drawn by
  the landing shell or the site frame (hosting_sdk's studio home) mounts
  `<BackToTop />` inside its own root, so the button wears that page's
  variables.
- **The site's own look.** Every colour is a CSS variable over a shadcn
  token: `--back-to-top-bg` (else `--background`), `--back-to-top-fg`
  (else `--primary`), `--back-to-top-border` (else `--border`),
  `--back-to-top-hover-bg` / `--back-to-top-hover-fg` (else `--primary` /
  `--primary-foreground`), `--back-to-top-ring` (else `--ring`). A site
  that sets its tokens on its own root (a local-data site's `.cs-site`,
  polaris' `.px-landing`) dresses its framed button with no code. A page
  whose look lives in other variables (the studio's `--acc`, `--ink`)
  names them on these. No colour is named in the component.
- **Clear of the device and of other floating things.** `right` and
  `bottom` add `env(safe-area-inset-right)` / `env(safe-area-inset-bottom)`
  to the gap (`--back-to-top-gap`: 1rem, 1.5rem from `md`). Any element
  fixed in the same bottom-right corner (a chat or WhatsApp bubble, a
  cookie button) carries `data-rokct-floating` and the button rises
  `FLOATING_GAP` (12px) above the highest one (`floatingLift`, measured
  with the scroll check). A site can also lift it with
  `--back-to-top-offset`. No SDK landing has such an element today.
- **Shape.** 44px round `<button>`, `aria-label` "Back to top", a
  2px focus ring in `--back-to-top-ring`. The arrow is Remixicon's
  `ri-arrow-up-line`, drawn as inline SVG. The button fades and slides up
  2px as it appears (`motion-safe:` only). Import it from
  `@/components/custom/back-to-top`; `className` adds to the button and
  `threshold` sets the distance.

### Per site: the look, the place and the switch (1.56.0)

Ray, 2026-10-31: the button is customisable per site (colour, position,
icon, on/off), and it must NOT look the same on every site. base ships
only the mechanism - the component, a `BackToTopConfig` and a neutral
fallback - and every site gets its own default from the layer that owns
its look. Three layers, each optional, a later one winning every field
it sets (`resolveBackToTop`):

1. **base's neutral fallback** (`DEFAULT_BACK_TO_TOP`): on, bottom right,
   `ri-arrow-up-line` in a circle, every colour from the site's tokens.
2. **The home SDK's style.** A home SDK installs a module whose default
   export is a `BackToTopConfig` and registers it with one line at
   `// @rokct-sdk-back-to-top-style-start` in
   `components/custom/landing/back-to-top-style.ts` (the same contract as
   `site-metadata.ts`):

   ```json
   {
     "target": "components/custom/landing/back-to-top-style.ts",
     "placeholder": "// @rokct-sdk-back-to-top-style-start",
     "replacement": "  { id: \"lms-back-to-top\", load: () => import(\"@/components/custom/landing/lms-back-to-top\") },"
   }
   ```

   That is how each product gets its own look on every route, backend
   shells included, with no shell edit. A style names the site's own
   tokens (`"var(--radius)"`, `"var(--font-display)"`,
   `"hsl(var(--primary))"`) rather than copying their values, so it
   follows the theme in light and dark. Give every `var()` a fallback
   (the root button sits outside the page's own scope on other routes),
   and do not lean on a name the shell's globals already define in
   another syntax: shadcn's `--card`, `--border`, `--background` and
   `--primary` are bare HSL triplets (`0 0% 100%`), so `var(--card)` is
   not a colour outside a scope that redefines it - write
   `hsl(var(--card))` or use a name of your own.
3. **The shell's data/ folder.** A shell in `local` or `hybrid` data mode
   sets `backToTop` in `data/theme.json` (validated at build time by
   `lib/site-data/validate-site.mjs`; a bad field fails the build naming
   it). Backend shells have no data/ and keep their home SDK's style.

`components/custom/site-back-to-top.ts` resolves the three once per
request on the server (never throwing: a broken layer leaves the neutral
button), and the theme seam - now an async server component - hands the
result to every button on the page through `<BackToTopProvider>`. The
root button and any framed one read the same config, so the one-button
rule holds and `enabled: false` removes both.

| Field | Values | Default |
| --- | --- | --- |
| `enabled` | `true` / `false` | `true` |
| `position` | `bottom-right`, `bottom-left`, `bottom-center` | `bottom-right` |
| `icon` | `arrow-up`, `arrow-up-circle`, `chevron-up`, `rocket` (Remixicon, inline SVG) | `arrow-up` |
| `shape` | `circle`, `rounded-square`, `pill-with-label`, `text-arrow` | `circle` |
| `label` | the pill's words; the text-arrow's shaft | `"Top"`; the site's name |
| `background`, `foreground`, `hoverBackground`, `hoverForeground`, `border`, `ring` | any CSS colour | `--background`, `--primary`, `--primary`, `--primary-foreground`, `--border`, `--ring` |
| `halo` | the text-arrow's glow behind its words | `--background` at 85% |
| `offset` | px of extra lift | 0 |
| `showAfter` | px scrolled before it shows | one screen; half the scrollable distance on a short page |
| `radius`, `size` | CSS lengths | per shape (`rounded-square`: the site's `--radius`); 2.75rem |
| `fontFamily`, `fontWeight`, `textTransform`, `letterSpacing`, `fontSize` | the label's type | inherited face, 600, none, normal, 0.8125rem |
| `borderWidth`, `borderStyle`, `shadow` | the outline and depth | 1px, solid, a soft shadow |
| `duration`, `easing` | motion of the fade and hover (`motion-safe:` only) | 200ms, `cubic-bezier(0.4,0,0.2,1)` |

Each CSS-valued field is written onto the button as its
`--back-to-top-*` variable, so a site's own stylesheet can still set the
same variable on an ancestor when no layer names it.

- **Shapes.** `circle` and `rounded-square` show the icon alone in a
  44px button; `pill-with-label` shows the icon and the label;
  `text-arrow` is an upward arrow whose long shaft is the site's words,
  set vertically (reading bottom to top) under a
  `ri-arrow-up-s-fill` head, with nothing behind them - no fill, no
  border, no shadow - in the primary colour with a soft halo of the
  page's background so it stays legible over light and dark sections.
  Every shape keeps a 44px hit area, the focus ring, the safe-area
  insets and `aria-label` "Back to top"; the visible words are
  `aria-hidden`.
- **Contrast.** After paint the button measures its glyph against its
  fill (`contrastTone`, through a canvas so any colour syntax reads) and,
  below 3:1, switches to the primary as the fill with
  primary-foreground as the glyph, else to black or white ink
  (`data-back-to-top-tone`: `as-is`, `solid`, `ink`). It measures again
  when the theme flips. A yellow primary on a white circle (1.6:1, the
  hosting sign-in page) becomes a yellow button with a dark arrow.
- **Short pages.** With no `showAfter`, the button shows after one
  screen, or after half the scrollable distance when that is shorter,
  so a sign-in page that scrolls a little still gets it.
- **Floating elements** are cleared in the button's own place: the left
  corner for `bottom-left`, the bottom middle for `bottom-center`.

### How to customise

A shell with a data/ folder (`"data": "local"` or `"hybrid"` in its
`composer.json`) adds a `backToTop` block to `data/theme.json`; every
field is optional and anything left out keeps the home SDK's style:

```json
{
  "primary": "#7a4b2a",
  "backToTop": {
    "position": "bottom-left",
    "icon": "rocket",
    "shape": "pill-with-label",
    "label": "Top",
    "background": "#1f2937",
    "foreground": "#fde68a",
    "hoverBackground": "#111827",
    "border": "transparent",
    "offset": 8,
    "showAfter": 600,
    "fontFamily": "var(--font-display)",
    "textTransform": "uppercase",
    "letterSpacing": "0.08em",
    "duration": "160ms"
  }
}
```

To switch the button off on a site:

```json
{ "primary": "#7a4b2a", "backToTop": { "enabled": false } }
```

A product with no data/ folder sets its style in its home SDK's
registered module (`components/custom/landing/<sdk>-back-to-top.ts`):

```ts
import type { BackToTopConfig } from "@/components/custom/landing/back-to-top";

const style: BackToTopConfig = {
  shape: "text-arrow",
  foreground: "hsl(var(--primary))",
  fontFamily: "var(--font-display)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
};
export default style;
```

One button still: framed copies (the landing shell, the site frame, a
home SDK's page root) and the root copy all take this config from the
theme seam; a framed copy can lay extra fields over it for itself with
`<BackToTop config={{ ... }} />`, which is rarely needed.

## Tests

`tests/download-platform.test.mts`, `tests/install-offer.test.mts`
(since 1.46.0 also `visibleDownloads` and the store) and
`tests/back-to-top.test.mts` (node) execute the rules; `tests/test_manifest.py` holds the header's
suffix span, the hero mode, the seam's shape, the row's nav and button,
the component's contract, the 1.46.0 early attach, guarded
`preventDefault`, `prompt()` then `userChoice`, the publish and the
row's server snapshot, and the installs.
