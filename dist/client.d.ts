import type { DecixaConfig } from "./types.js";
export declare class HttpClient {
    private baseUrl;
    private apiKey;
    constructor(config?: DecixaConfig);
    private headers;
    post<T>(path: string, body: unknown): Promise<T>;
    get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T>;
}
//# sourceMappingURL=client.d.ts.map