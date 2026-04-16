import type { DecixaConfig } from "./types.js";

const DEFAULT_BASE_URL = "https://api.decixa.ai";
const VERSION = "0.1.0";

export class HttpClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: DecixaConfig = {}) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.apiKey = config.apiKey ?? "";
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": `decixa-sdk/${VERSION}`,
    };
    if (this.apiKey) h["Authorization"] = `Bearer ${this.apiKey}`;
    return h;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Decixa API error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
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
    return res.json() as Promise<T>;
  }
}
