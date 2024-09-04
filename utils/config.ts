export const BASIC_AUTH_LIST = Deno.env.get("CUTELINK_BASIC_AUTH_LIST")
  ?.split(",");

export const HOMEPAGE_HREF_404 = Deno.env.get("CUTELINK_HOMEPAGE_HREF_404") ??
  "https://github.com/negrel/cutelink";
