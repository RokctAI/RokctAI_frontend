# Downloads, the install offer, the suffix in primary and Back to top

Three generic seams base_sdk 1.41.0 adds to the shell's chrome. Base
declares NO entry, NO site name and NO colour for any of them: a home SDK
hands the data in, and a shell whose home SDK declares nothing renders
exactly what it rendered before.

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
the copyright line: one `<a>` per entry, 40px round, the theme's border,
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
5. With none it listens for the browser's `beforeinstallprompt`, keeps
   the event, and draws "Install" (`labels.install`), which shows that
   prompt.
6. With neither it draws nothing.

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
3. A click scrolls to the top - `"smooth"`, or `"auto"` (the instant
   jump) when `(prefers-reduced-motion: reduce)` matches
   (`scrollBehaviour`) - and blurs the button, which hides again.
4. The scroll and resize listeners are passive and folded into one
   `requestAnimationFrame` per frame; every window read is in the effect
   or the click, so the server and the first client render agree.
5. Always in the tree and fading (`motion-safe:transition-opacity`);
   while hidden it carries `tabIndex={-1}`, `aria-hidden` and
   `pointer-events-none`. Shown, it is a keyboard-focusable `<button>`
   with `aria-label` and `title` "Back to top" (`BACK_TO_TOP_LABEL`;
   `label` overrides).

Lucide's `ArrowUp` is the icon; the classes are theme tokens only
(`bg-background`, `border-border`, `text-primary`, `hover:bg-muted`,
`ring-ring`). A host that wants the button on every page mounts
`<BackToTop />` from `@/components/custom/back-to-top` in its own root
layout; `className` adds to the button, `threshold` sets the distance.

## Tests

`tests/download-platform.test.mts`, `tests/install-offer.test.mts` and
`tests/back-to-top.test.mts` (node) execute the rules; `tests/test_manifest.py` holds the header's
suffix span, the hero mode, the seam's shape, the row's nav and button,
the component's contract and the installs.
