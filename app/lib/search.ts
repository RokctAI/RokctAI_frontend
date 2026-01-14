
import { getClient } from "@/app/lib/client";

export type SearchResult<T = string> =
    | { success: true, value: T }
    | { success: false, error: string, isAmbiguous?: boolean, suggestions?: string[] };

/**
 * Tries to find a document by exact name. If not found, tries a fuzzy search.
 * @param doctype The Frappe Doctype to search (e.g., "Supplier", "Customer")
 * @param query The name/query string provided by the user
 * @param filters Optional additional filters
 * @returns { success: true, value: name } OR { success: false, error: "Did you mean..." }
 */
export async function findFuzzyMatch(
    doctype: string,
    query: string,
    filters: Record<string, any> = {}
): Promise<SearchResult> {
    const client = await getClient();

    // 1. Try Exact Match
    try {
        const exact = await client.call({
            method: "frappe.client.get_value",
            args: {
                doctype,
                filters: { name: query, ...filters },
                fieldname: "name"
            }
        }) as any;

        if (exact?.message?.name) {
            return { success: true, value: exact.message.name };
        }

        // 2. Try Fuzzy Match (Contains)
        // We use "like" %query%
        const fuzzy = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype,
                filters: { name: ["like", `%${query}%`], ...filters },
                fields: ["name"],
                limit_page_length: 3
            }
        }) as any;

        if (fuzzy?.message && fuzzy.message.length > 0) {
            const bestGuess = fuzzy.message[0].name;
            return {
                success: false,
                error: `${doctype} '${query}' not found. Did you mean '${bestGuess}'?`,
                isAmbiguous: true,
                suggestions: fuzzy.message.map((m: any) => m.name)
            };
        }

        return { success: false, error: `${doctype} '${query}' not found.` };

    } catch (e: any) {
        console.error(`Fuzzy search failed for ${doctype}`, e);
        return { success: false, error: e.message || "Search failed" };
    }
}
