import { HttpUrl } from "@/utils/url.ts";
import { genslug } from "@/utils/genslug.ts";
import { alphanum } from "@/utils/charset.ts";
import { kv } from "@/utils/kv.ts";

export type ShortenedUrlResult = {
  url: HttpUrl;
  shortUrl: HttpUrl;
};

const linkcount = {
  async add(hostname: string, n: bigint): Promise<bigint> {
    while (true) {
      const entry = await kv.get<bigint>([hostname, "linkcount"]);
      const linkcount = entry.value ?? 0n;

      const result = await kv.atomic()
        .check(entry)
        .sum([hostname, "linkcount"], n)
        .commit();

      if (result.ok) return linkcount;
    }
  },
};

export const shortener = {
  async shorten(
    url: HttpUrl,
    length: number,
    srvUrl: URL,
  ): Promise<ShortenedUrlResult> {
    const key = [srvUrl.hostname, "link", length];

    // Check if short url already exists.
    const entry = await kv.get<string>([...key, "long2short", url.href]);
    if (entry.value) {
      const { ok, err } = HttpUrl.parseString(srvUrl.origin + entry.value);
      if (err) throw err; // This should never happend.

      return { url, shortUrl: ok };
    }

    // Create short url otherwise.
    const linkId = await linkcount.add(srvUrl.hostname, 1n);
    const slug = genslug(length, linkId, alphanum);
    const shortUrl = new URL("/" + slug, srvUrl.origin);

    // Store it.
    await kv.set(
      [...key, "long2short", url.href],
      shortUrl.pathname,
    );
    await kv.set(
      [...key, "short2long", shortUrl.pathname],
      url.href,
    );

    return {
      url,
      shortUrl: shortUrl,
    };
  },
  async unshorten(srvUrl: URL): Promise<string | null> {
    const entry = await kv.get<string>([
      srvUrl.hostname,
      "link",
      srvUrl.pathname.length - 1, // - 1 for leading /
      "short2long",
      srvUrl.pathname,
    ]);

    return entry.value;
  },
};
