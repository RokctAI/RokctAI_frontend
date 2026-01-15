
export async function callPublicApi(method: string, params: Record<string, any> = {}, options: RequestInit & { timeout?: number } = {}) {
    const baseUrl = process.env.ROKCT_BASE_URL;
    if (!baseUrl) return null;

    const { timeout = 10000, ...fetchOptions } = options;

    try {
        const query = new URLSearchParams(params).toString();
        const url = `${baseUrl}/api/method/${method}${query ? `?${query}` : ""}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const defaultOptions: RequestInit = {
            next: { revalidate: 60 },
            signal: controller.signal
        };

        const finalOptions = {
            ...defaultOptions,
            ...fetchOptions,
            headers: { ...defaultOptions.headers, ...fetchOptions.headers },
            signal: controller.signal // Ensure signal is set
        };

        try {
            const res = await fetch(url, finalOptions);
            clearTimeout(timeoutId);

            if (!res.ok) return null;

            const data = await res.json();
            return data.message || data;
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }
    } catch (e) {
        console.error(`API Call Failed: ${method}`, e);
        return null;
    }
}
