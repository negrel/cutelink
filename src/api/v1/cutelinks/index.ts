import { Redis } from '@upstash/redis/cloudflare'
import { emojis } from '../../../../lib/charset'
import genlink from '../../../../lib/genlink'

export default {
  async GET (_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const user = 'user1'

    const urls = await env.KV_USER_URLS.list({ prefix: [user, 'cute'].join('.') })

    return new Response(JSON.stringify({
      cutelinks: urls.keys
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  async POST (_request: Request, env: Env, _ctx: ExecutionContext, url: URL): Promise<Response> {
    const redis = Redis.fromEnv(env)

    // Get link seed.
    const user = 'user1'
    const count = await redis.incr('cutelinks-count')

    // Generate link.
    const cutelink = generateCutelink(4, count)

    // Store cutelink.
    await env.KV_LONG_URLS.put(cutelink, url.toString(), {
      metadata: {
        creation_date: new Date()
      }
    })
    await env.KV_USER_URLS.put([user, 'cute', cutelink].join('.'), url.toString())

    // Send response.
    return new Response(JSON.stringify({
      cutelink
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

const generateCutelink = (length: number, seed: number): string => genlink(length, seed, emojis)
