import { FreshContext, Handlers } from "$fresh/server.ts";
import { HttpUrl } from "@/utils/url.ts";
import { shortener } from "@/utils/shortener.ts";

const validCharset = {
  "alphanum": true,
  "emojis": true,
};

export const handler: Handlers = {
  async GET(_req: Request, ctx: FreshContext) {
    const urlParam = ctx.url.searchParams.get("url");
    if (!urlParam) {
      return new Response(`"url" query parameter is missing`, {
        status: 400,
      });
    }

    const { ok: httpUrl, err } = HttpUrl.parseString(urlParam);
    if (err) {
      return new Response(`invalid "url" query parameter: ${err}`, {
        status: 400,
      });
    }

    const charset = ctx.url.searchParams.get("charset") ?? "alphanum";
    if (!(charset in validCharset)) {
      return new Response(
        `invalid "charset" query parameter: charset must either be "alphanum" or "emojis"`,
        { status: 400 },
      );
    }

    const defaultLength = charset == "emojis" ? 3 : 7;
    const length = Number.parseInt(ctx.url.searchParams.get("length") ?? "") ||
      defaultLength;
    if (Number.isNaN(length)) {
      return new Response(`"length" query parameter is not a number`, {
        status: 400,
      });
    }
    if (length < 1 || length > 7) {
      return new Response(
        `"length" query parameter must be comprised between 1 and 7 inclusive`,
        {
          status: 400,
        },
      );
    }

    const result = await shortener.shorten(httpUrl, ctx.url, {
      length,
      charset: charset as keyof (typeof validCharset),
    });

    return new Response(JSON.stringify(result));
  },
};
