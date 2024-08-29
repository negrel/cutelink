import { FreshContext, Handlers } from "$fresh/server.ts";
import { HttpUrl } from "@/utils/url.ts";
import { shortener } from "@/utils/shortener.ts";

export const handler: Handlers = {
  async GET(_req: Request, ctx: FreshContext) {
    const urlParam = ctx.url.searchParams.get("url");
    if (!urlParam) {
      return new Response("url query parameter is missing", {
        status: 400,
      });
    }

    const { ok: httpUrl, err } = HttpUrl.parseString(urlParam);
    if (err) {
      return new Response(`invalid url query parameter: ${err}`, {
        status: 400,
      });
    }

    const length = Number.parseInt(ctx.url.searchParams.get("length") ?? "7");
    if (Number.isNaN(length)) {
      return new Response("length query parameter is not a number", {
        status: 400,
      });
    }
    if (length < 1 || length > 7) {
      return new Response(
        "length query parameter must be comprised between 1 and 7 inclusive",
        {
          status: 400,
        },
      );
    }

    const result = await shortener.shorten(httpUrl, length, ctx.url);

    return new Response(JSON.stringify(result));
  },
};
