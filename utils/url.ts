import { Result } from "@/utils/result.ts";

export class HttpUrl extends URL {
  private constructor(url: string) {
    super(url);
    if (this.protocol !== "http:" && this.protocol !== "https:") {
      throw new Error("not an http url");
    }
  }

  static parseString(url: string): Result<HttpUrl, Error> {
    try {
      const ok = new HttpUrl(url);
      return { ok };
    } catch (err) {
      return { err };
    }
  }
}
