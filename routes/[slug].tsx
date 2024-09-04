import { FreshContext } from "$fresh/server.ts";
import { shortener } from "@/utils/shortener.ts";

const cache = await caches.open("slug");

export const handler = async function (
  req: Request,
  ctx: FreshContext,
) {
  let resp = await cache.match(req);
  if (resp) return resp;

  const url = await shortener.unshorten(ctx.url);
  if (!url) return ctx.renderNotFound();

  resp = Response.redirect(url, 302);
  cache.put(req, resp);

  return resp;
};
