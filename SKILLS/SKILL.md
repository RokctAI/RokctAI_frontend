## How to Replicate External UI/UX Precisely (The Merlin Strategy)

When instructed to copy or match sections from an external website (like getmerlin.in) exactly, follow this proven strategy to ensure high fidelity in layout, typography, sizing, and structure.

### 1. Retrieve the Raw DOM

Do not guess the structure based on visual appearance alone. Instead, retrieve the actual HTML and CSS structure from the source.

- Use `curl`, `wget`, or a Playwright script to fetch the page content.
- If the site uses Cloudflare or bot protection, use the Wayback Machine (`archive.org`) via a Playwright script to bypass it and get the raw DOM. Example: `http://web.archive.org/web/YYYYMMDDHHMMSS/https://www.example.com/`
- Use tools like `jsdom` in a simple Node script to parse the HTML, query specific elements (e.g., finding text like "For those who build"), and extract their outer HTML.

### 2. Analyze the Tailwind/CSS Classes

Once you have the raw HTML snippet for a section, carefully observe the classes used.

- Look for specific layout instructions: `flex-col`, `gap-8`, `md:flex-row`, `items-center`, `justify-between`.
- Note exact sizing and spacing: `max-w-7xl`, `px-4`, `py-24`, `w-[326px]`, `h-[366px]`.
- Observe typography: `text-[32px]`, `md:text-[56px]`, `leading-[1.2]`, `font-semibold`.
- Look for interaction hints: `group`, `group-hover:scale-105`, `transition-transform`, `duration-300`.

### 3. Translate to React/Next.js

Translate the raw HTML snippet into a functional React component using the repository's established stack (Tailwind, Framer Motion, shadcn/ui).

- Replace `class=` with `className=`.
- Convert standard `<img>` tags to `next/image` components (`<Image />`). If the source images return 403 Forbidden due to CDN restrictions, use high-quality Unsplash placeholders that match the aspect ratio and add `unoptimized` to the `<Image>` tag. Be sure to update `next.config.mjs` with `images.unsplash.com`.
- Implement animations using `framer-motion`. Often, simple scroll-into-view animations (`initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}`) provide the desired polish.

### 4. Iterate and Verify

- Layouts rarely translate perfectly on the first try due to global style differences.
- Pay close attention to constraints. If a row of cards should not wrap, ensure you use `flex-nowrap`, `overflow-x-auto`, and define explicit widths (e.g., `w-[280px] shrink-0`).
- Always verify the output by checking the component's code against the visual requirements.

### Included Scripts

To assist with this process, the following scripts have been added to the `SKILLS` directory:

1. `parse_wayback_all.js`: Fetches the raw HTML from a given Wayback Machine URL (or defaults to the Merlin capture).
   - Usage: `node SKILLS/parse_wayback_all.js [URL]`
2. `parse_dom_section.js`: Reads the fetched HTML and extracts the outer HTML of the section containing specific text. Requires `jsdom` (`npm i jsdom`).
   - Usage: `node SKILLS/parse_dom_section.js "Text to find"`
