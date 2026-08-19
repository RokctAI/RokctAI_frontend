# API Reference: search

Source file: `app/lib/search.ts`

## Whitelisted API Endpoints

### `function findFuzzyMatch(doctype: string, query: string, filters: Record<string, any> = {},)`
*No documentation provided (generation failed).*

### `function exact(await client.call({ method: "frappe.client.get_value", args: { doctype, filters: { name: query, ...filters }, fieldname: "name", }, })) as any; if (exact?.message?.name) { return { success: true, value: exact.message.name }; } const fuzzy = (await client.call({ method: "frappe.client.get_list", args: { doctype, filters: { name: ["like",`%${query}%`], ...filters }, fields: ["name"], limit_page_length: 3, }, })) as any; if (fuzzy?.message && fuzzy.message.length > 0) { const bestGuess = fuzzy.message[0].name; return { success: false, error: `${doctype} '${query}' not found. Did you mean '${bestGuess}'?`, isAmbiguous: true, suggestions: fuzzy.message.map((m: any)`
*No documentation provided (generation failed).*
