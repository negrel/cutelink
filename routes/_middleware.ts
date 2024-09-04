import bunyan from "bunyan";
import { FreshContext } from "$fresh/server.ts";

const logger = bunyan.createLogger({ name: "access_log" });

export const handler = [
  async function accessLog(req: Request, ctx: FreshContext) {
    const start = performance.now();

    const ua = req.headers.get("User-Agent");

    const resp = await ctx.next();

    const durationMs = performance.now() - start;
    logger.info({
      "duration_ms": durationMs,
      "user_agent": ua,
      "route": ctx.route,
      "path": ctx.url.pathname + "?" + ctx.url.searchParams.toString(),
      "status": resp.status,
      "source_ip": ctx.remoteAddr.hostname,
    }, "request handled");

    return resp;
  },
];
