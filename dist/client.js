const DEFAULT_BASE_URL = "https://api.decixa.ai";
const VERSION = "0.1.0";
export class HttpClient {
    baseUrl;
    apiKey;
    constructor(config = {}) {
        this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
        this.apiKey = config.apiKey ?? "";
    }
    headers() {
        const h = {
            "Content-Type": "application/json",
            "User-Agent": `decixa-sdk/${VERSION}`,
        };
        if (this.apiKey)
            h["Authorization"] = `Bearer ${this.apiKey}`;
        // DECIXA_INTERNAL=true が設定されていたら internal ヘッダを付与
        // ローカル開発・テスト時に .env.local で設定する想定
        if (typeof process !== "undefined" && process.env?.DECIXA_INTERNAL === "true") {
            h["x-decixa-source"] = "internal";
        }
        return h;
    }
    async post(path, body) {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Decixa API error ${res.status}: ${text}`);
        }
        return res.json();
    }
    async get(path, params) {
        const url = new URL(`${this.baseUrl}${path}`);
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                if (v !== undefined && v !== null && v !== "") {
                    url.searchParams.set(k, String(v));
                }
            }
        }
        const res = await fetch(url.toString(), {
            method: "GET",
            headers: this.headers(),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Decixa API error ${res.status}: ${text}`);
        }
        return res.json();
    }
}
//# sourceMappingURL=client.js.map