# The shell's `data/` folder

Since base_sdk 1.35.0 a Next.js shell may commit a host-owned `data/`
folder next to its `composer.json`, and every composed SDK reads it
through one server-only reader. It is for what has no SDK home: the
shell's colours, its people, its places, its products, its prose. Ray,
2026-09-10: "what we cant give sdk we can give data/".

The brand name is never in `data/`. It stays where it is declared - the
home SDK's site-metadata copy and the host's `PLATFORM_NAME` - and no kind
below carries it.

## The mode is declared, not guessed

The shell announces how the folder is read with one top-level key in its
own `composer.json`:

```json
{
  "name": "acme_web_composer",
  "data": "local",
  "sdks": [ ... ]
}
```

| mode      | what a reader gets                                                                 | who                          |
| --------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| `backend` | `undefined` for every kind; no file is read, whatever `data/` holds. The default.   | rokct.ai, Supacharge         |
| `hybrid`  | the file when it is present, else `undefined` - the caller falls back to its backend | a shell keeping some content local |
| `local`   | the file, or a build error / thrown Error naming the missing file                   | South River (no backend)     |

Absent means `backend`: a shell that never heard of the folder builds as
it did before. The mode is explicit rather than "the folder exists" so a
half-static shell can never silently call a backend it does not have, and
so base has one signal for switching off backend-only surface.

## Kinds

| kind        | file                    | shape                                                                                                                           |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `theme`     | `data/theme.json`       | `{ primary, secondary?, accent? }`, hex strings (`#rgb` or `#rrggbb`)                                                             |
| `team`      | `data/team.json`        | `{ members: [{ name, role, photo?, links?: [{ label, href }] }] }`                                                                |
| `stockists` | `data/stockists.json`   | `{ items: [{ name, address, town, lat?, lng?, mapsUrl? }] }` (`lat` and `lng` together or not at all)                             |
| `products`  | `data/products.json`    | `{ items: [{ name, description?, sizes?: string[], image?, status?: "active" \| "coming" }] }`                                     |
| `about`     | `data/about.md`         | the markdown, verbatim, as a string                                                                                              |
| `legal`     | `data/legal/<slug>.md`  | a map of slug to `{ title, markdown }`; the title from a `title:` front-matter line, else the first `# ` heading (removed from the body) |

`photo` and `image` are public paths (`/team/jane.jpg`, served from the
shell's `public/`) or absolute URLs. A slug is lowercase letters, digits
and single dashes. Anything else in `data/` that ends in `.json` or `.md`
(a typo such as `teams.json`) fails the build; `README.md` is allowed.

The types are `lib/site-data/kinds.ts` (`SiteTheme`, `SiteTeam`,
`SiteStockists`, `SiteProducts`, `SiteAbout`, `SiteLegal`, and
`SiteDataKinds` keyed by kind). The checks are `lib/site-data/validate.mjs`:
hand-written, dependency-free, one sentence per problem naming the field.

## Bundled at build time

Nothing reads the disk at request time: a Vercel function has no `data/`
to read. Instead the shell runs, from its root, after the compose and
before `next build`:

```sh
node lib/site-data/generate.mjs
```

The script reads `composer.json`'s `"data"`, reads and validates every
known file under `data/`, and writes `lib/site-data/generated.ts` - the
typed module the reader imports, so the files travel inside the bundle.
The one durable place to call it is the shell's own `package.json`, which
no compose rewrites:

```json
"scripts": {
  "prebuild": "node lib/site-data/generate.mjs",
  "predev": "node lib/site-data/generate.mjs",
  "build": "next build",
  "dev": "next dev --turbo"
}
```

npm runs `prebuild` before `build` on its own, so Vercel's
`bash scripts/compose.sh && npm run build` composes, generates, then
builds. base installs the neutral `generated.ts` (backend mode, no files)
with every compose, so a shell that never runs the script is unchanged;
the composed-output block the shell's `compose.sh` writes into
`.gitignore` keeps `generated.ts` out of git either way. A compose after a
build reports the rewritten file as "modified by a developer" and skips it
- expected: the next build's `prebuild` rewrites it again.

The script fails the build (exit status 1) with a message naming the file
and the field when:

- `"data"` is not one of the three modes;
- a file is not valid JSON, or does not fit its kind
  (`data/team.json: members[1].role must be a non-empty string`);
- `data/` holds an unknown `.json` or `.md` file, or a non-`.md` file
  under `data/legal/`;
- the mode is `local` and an installed SDK's manifest declares a kind it
  requires that has no file (see below).

An SDK whose renderer needs a kind declares it in its manifest:

```json
"site_data": { "requires": ["about", "legal"] }
```

The generator reads every `.rokct/cache/<sdk>/manifest.json` (and
`sdk/<name>/manifest.json`) and, for a `local` shell, refuses to build
when a required kind has no file. A `hybrid` shell is not checked: its
renderer falls back to the backend.

## Reading it

From any composed SDK's server code - a server component, a server action,
a route handler:

```ts
import { readSiteData, hasSiteData, siteDataMode } from "@/lib/site-data/read-site-data";
import type { SiteTeam, SiteLegal } from "@/lib/site-data/kinds";

const team = readSiteData("team"); // SiteTeam | undefined
if (hasSiteData("legal")) {
  const legal = readSiteData("legal")!; // SiteLegal
}
```

- `readSiteData(kind)` answers the kind's file, typed by kind:
  `backend` gives `undefined` for everything; `hybrid` the file when it
  was bundled, else `undefined`; `local` the file, or throws an Error
  naming the missing file (the generator already failed the build for
  every kind an SDK declared; this is the safety net for a kind nobody
  declared).
- `hasSiteData(kind)` says whether `readSiteData` would answer a value,
  never throwing - the one `if` a hybrid renderer needs to choose between
  `data/` and its backend.
- `siteDataMode()` is the declared mode.
- `siteDataBundle()` is the whole bundle, for a caller that needs several
  kinds.

`@/lib/site-data/read-site-data` is server-only (the bundle carries every
file's content). `@/lib/site-data/kinds` has no such guard: a client
component may import the types. The pure rule, `resolveSiteData(bundle,
kind)`, also lives in `kinds.ts` and is what the node tests execute.

Consumers: corporate_sdk 1.1.0 (its legal, about and team renderers) is
the first; a home SDK's landing sections are the next.

## Theme

With a `data/theme.json` the shell's colours reach every route with no
layout edit. `components/custom/site-theme.tsx` (a server component)
renders one `<style id="site-data-theme">` with a `:root` block built by
`lib/site-data/site-theme.ts`:

```css
:root { --primary: 357.3 76.6% 54.7%; --primary-foreground: 0 0% 100%; --site-primary: #e4333b; --ring: 357.3 76.6% 54.7%; }
```

`--primary`, `--secondary` and `--accent` are written as the HSL triplets
the shells' shadcn tokens expect (`hsl(var(--primary))`), each with a
`-foreground` picked for contrast (white on a dark colour, near-black on a
light one); `--ring` follows primary as the host's `globals.css` sets it;
the raw hex is there as `--site-primary` / `--site-secondary` /
`--site-accent` for a section that wants the colour itself. Only the
colours the file names are written.

It is rendered by `components/custom/theme-provider.tsx`, the seam every
host layout already wraps its page in. Since 1.35.0 that file is a
directive-free server entry over `theme-provider.client.tsx` (next-themes,
the 1.22.0 dark default and class attribute, unchanged) - the same split as
a landing section's entry and its `<name>.client.tsx`. Render it from a
server layout, as both shells do; never from a client component.

Order, first to last:

1. the host's `app/globals.css` (`:root` and `.dark` token blocks, a
   `<link>` in `<head>`);
2. the `data/theme.json` block, in `<body>` - same specificity, later, so
   it wins over both blocks in both colour schemes;
3. a home SDK's own theme, when it sets the same variables later in the
   document or on a more specific selector (lms_sdk's
   `.sc-landing { ... }`) - it still wins over the file.

No theme file, or backend mode: nothing is rendered, and the markup of
every shell composed today is unchanged.

## What `local` switches off

A `local` shell has no backend, so base hides the backend-only surface it
owns:

- the landing prefetches no plans (every section already handles the
  empty list);
- `arrangeLandingPage` drops the declared header actions (a home SDK's
  `HeaderMenu.actions`) whose href is the sign-in or sign-up route
  (`LANDING_CONFIG.loginUrl` / `signupUrl`);
- `PageSectionContext` and `PageSectionProps` carry `dataMode`, so a home
  SDK's `meta.renders(ctx)` keeps pricing or a sign-in strip off the page
  with `ctx.dataMode !== "local"`;
- the footer status pill already hides itself when no base URL is
  configured (state `unconfigured`).

Not yet switched: the header's own "Log in" / "Sign up" pair, which
`components/custom/header.tsx` draws for a visitor with no session from
the `loginUrl` / `signupUrl` props `landing-content.tsx` passes. Both
files belong to the base 1.36.0 header branch; when it merges, the
header skips the pair when `siteDataMode()` is `local` (the TODO sits on
`dropBackendOnlyActions` in `landing-page.ts`). A local shell's home SDK
can also hide it today by rendering its own header row.

## Fixtures

`tests/fixtures/site-data/acme/` is a complete `data/` folder for
`acme.school`, the fixture domain; the node tests run the generator
against it and against the bad cases beside it. Nothing in it is a real
person, place or product.
