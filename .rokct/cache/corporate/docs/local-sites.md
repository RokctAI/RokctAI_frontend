# Local-data sites: one renderer, every client from data

corporate_sdk is the **home SDK of every local-data site** (corporate 1.4.0,
base 1.53.0). A client website is not an SDK and not a code package: it is
a shell whose `composer.json` names corporate_sdk as home with
`"data": "local"`, plus a `data/` folder and its own art in `public/`. The
same components draw every client; only the data differs.

South River (RokctAI/southriver-web) is record #1. `docs/examples/demo-bakery/`
is a second, made-up record that proves the same code draws a different site:
other fonts, palette, layouts and art.

## How a page is drawn

When corporate_sdk is the home SDK, its manifest's `home` block applies
(the installer ignores the block in every other shell, so rokctapp and the
other hosts are untouched):

- `app/page.tsx` sends `/` to `/landing`;
- `components/custom/site/` is installed: the renderer;
- the landing registries get the site's lines: hero copy and hero form,
  header menu, site metadata, an empty plans query, a theme section,
  twelve numbered section slots and a footer;
- `site_data.requires` is `theme`, `site` and `sections`, so a local build
  stops with the missing file's name when one is absent.

Each slot draws the section at its index in `data/sections.json`; a slot past
the end renders nothing. The hero is always the first section and is drawn
by base's hero host through the hero copy and form lines.

## Adding a client

1. Make the shell from the Next.js factory template (a new shell repo needs
   Ray's approval). In `composer.json`, list corporate_sdk with
   `"home_sdk": true` and set `"data": "local"`. Do **not** add a registry
   template under the protocol's `core/utils/nextjs/composer/`: with no
   template for the app_type, `scripts/compose.sh` and the composer use the
   shell's own committed `composer.json` and log one `[i]` line saying so.
2. Write `data/`. Start from `docs/examples/demo-bakery/data/` (the smallest
   complete record) or from southriver-web's `data/`:

   | File | What it holds |
   | --- | --- |
   | `theme.json` | `primary`, `palette` / `paletteDark` (named tokens: paper, card, ink, brand, highlight, heroTop and the rest), `fonts` (display and text face from the allowed set, display weight, italic, capitals) |
   | `site.json` | name, wordmark, motto, place, since, WhatsApp number, header logo (with `wordmark: false` the image alone) and action, metadata, footer logo, line and links (the footer ends `© <year> <name> · Built with ♥ by ROKCT`; `footer.legal` is no longer drawn) |
   | `sections.json` | the page top to bottom: hero, intro, steps, pricing, gallery, facts, order, contact; each with a layout `variant` and a `tone` |
   | `pricing.json` | price tiers, needed when a pricing section is on the page; since 1.5.0 a tier may carry a `fine` line, `art` drawn in the card and a quantity `slider` with a running total (`perCase` sets the units in a case) |
   | `order.json` | the WhatsApp order form, needed when an order section is on the page |
   | `site.css` | optional: the site's own CSS, drawn after the renderer's (plain CSS, no tags, no `@import`) |

   base_sdk's `docs/site-data.md` lists every field. The build validates each
   file down to the field and fails naming it.
3. Put the art in `public/` and point at it from `sections.json`
   (`{ "kind": "image", "src": "/art/loaf.svg", "alt": "..." }`). A bottle can
   be drawn from a label's colours and words (with an optional `mark`
   monogram), or carry its own label art; give it `labels` and it rolls
   through them (1.5.0).
   Prefer art that needs no web font (outline any text in an SVG), since an
   SVG drawn as an image cannot load the page's fonts.
4. Set the deployment's `NEXT_PUBLIC_SITE_NAME` (the header wordmark) and run
   `bash scripts/compose.sh`, then `npm run build`.

## Identity through data

Every site gets its own look without code:

- **Type**: display faces Montserrat, Fraunces, Space Grotesk, Playfair
  Display; text faces Figtree, Inter, DM Sans. The display voice (weight,
  italic, capitals) is data too. Adding a face is a corporate_sdk change
  (`site-fonts.ts`, `next/font` needs static declarations) plus the allowed
  list in base's `validate-site.mjs`.
- **Colour**: the palette tokens become `--cs-*` CSS variables on the page
  root, with a dark set under `html.dark`; base's shadcn triplets are derived
  from them so the shared UI matches.
- **Layout**: hero `poster` or `split`; intro `stamp` or `plain`; steps
  `band` or `cards`; gallery `shelf` or `grid`; facts and contact `band` or
  `plain`; and a `tone` per section (paper, alt, ink, brand).
- **Art**: anything in the shell's `public/`.
- **The last mile**: `data/site.css`, for what the data cannot say.

## Many sites, one deployment (the backend seam)

Today each client is a local-data shell and a deployment of its own. The
renderer reads only through `site-source.ts`, which reads base's
`lib/site-data/generated.ts` with `resolveSiteData`. That is the seam:

- in `local` mode the files come from `data/` at build time;
- in `hybrid` mode a missing file falls back to the backend;
- in `backend` mode every kind comes from the backend.

To serve many clients from one deployment, a backend answers the same kinds
(`theme`, `site`, `sections`, `pricing`, `order`, `css`) per site, and a
host-to-site lookup picks the site from the request's host. That lookup goes
in base's backend/hybrid reader, not in corporate_sdk: the components keep
reading `siteKind(...)` and never learn where the data came from. The kinds'
validators (`validate-site.mjs`) are plain ESM so a backend can run the same
checks before it stores a site.
