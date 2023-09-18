import cutelinks from './api/v1/cutelinks'

export default {
  async fetch (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    switch (url.pathname) {
      case '/api/v1/cutelinks':
        switch (request.method) {
          case 'GET':
            return await cutelinks.GET(request, env, ctx)
          case 'POST':
            return await cutelinks.POST(request, env, ctx, url)
          default:
            // passthrough
        }
        break
    }

    return await redirect(request, env, ctx, url)
  }
}

async function redirect (_request: Request, env: Env, _ctx: ExecutionContext, url: URL): Promise<Response> {
  // Retrieve path without leading slash.
  const cutelink = url.pathname.slice(1)

  const options = { cacheTtl: 86400, cacheTTL: 86400 /* 24h */ }
  const long = await env.KV_LONG_URLS.get(cutelink, options)
  if (long !== null) {
    return Response.redirect(long)
  }

  return Response.redirect('/')
}
