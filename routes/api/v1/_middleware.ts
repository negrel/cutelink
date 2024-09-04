import { FreshContext, Handler } from "$fresh/server.ts";
import { BASIC_AUTH_LIST } from "@/utils/config.ts";
import { Result } from "@/utils/result.ts";

export const handler: Handler[] = [];

function decodeBase64(b64: string): Result<string, Error> {
  try {
    return { ok: atob(b64) };
  } catch (err) {
    return { err };
  }
}

const unauthorizedResp = new Response(null, {
  status: 401,
  headers: {
    "WWW-Authenticate": 'Basic realm="api"',
  },
});

function basicAuth(req: Request, ctx: FreshContext) {
  const auth = req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return unauthorizedResp.clone();
  }

  const { ok: credentials, err } = decodeBase64(auth.slice("Basic ".length));
  if (err) return unauthorizedResp.clone();

  if (!BASIC_AUTH_LIST?.includes(credentials)) {
    return unauthorizedResp.clone();
  }

  return ctx.next();
}

if (BASIC_AUTH_LIST) handler.push(basicAuth);
