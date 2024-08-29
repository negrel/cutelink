import { start } from "$fresh/server.ts";
import manifest from "@/fresh.gen.ts";
import config from "@/fresh.config.ts";
import { assertEquals, assertMatch } from "$std/assert/mod.ts";

type Server = {
  addr: Deno.NetAddr;
  abort: () => void;
  cutelinkEndpoint(_: { url?: string; length?: number }): URL;
};

function startServer(): Promise<Server> {
  const ac = new AbortController();

  return new Promise((resolve, reject) => {
    const srv: Partial<Server> = {
      abort: () => ac.abort(),
      cutelinkEndpoint({ url, length }: { url?: string; length?: number }) {
        const result = new URL(
          `http://localhost:${this.addr!.port}/api/v1/cutelink`,
        );
        if (url) result.searchParams.set("url", url);
        if (length !== undefined) {
          result.searchParams.set("length", length.toString());
        }

        return result;
      },
    };

    start(manifest, {
      ...config,
      server: {
        ...config.server,
        port: 0,
        signal: ac.signal,
        onListen: (addr) => resolve({ ...srv, addr } as Server),
        onError: (err) => {
          reject(err);
          throw err;
        },
      },
    });
  });
}

type CutelinkResult = {
  url: string;
  shortUrl: string;
};

async function checkShortenedUrl(res: CutelinkResult) {
  const resp = await fetch(res.shortUrl, {
    redirect: "manual",
  });

  await resp.body?.cancel();

  const redirect = resp.headers.get("Location");
  assertEquals(redirect, res.url);
}

Deno.test("generate short link without url and length parameter", async () => {
  const srv = await startServer();

  const resp = await fetch(
    srv.cutelinkEndpoint({}),
  );

  assertEquals(resp.status, 400);
  assertEquals(
    await resp.text(),
    "url query parameter is missing",
  );

  srv.abort();
});

Deno.test("generate short link with length of 0", async () => {
  const srv = await startServer();

  const resp = await fetch(
    srv.cutelinkEndpoint({ url: "http://example.com/", length: 0 }),
  );

  assertEquals(resp.status, 400);
  assertEquals(
    await resp.text(),
    "length query parameter must be comprised between 1 and 7 inclusive",
  );

  srv.abort();
});

Deno.test("generate short link with length of 8 (over maximum of 7)", async () => {
  const srv = await startServer();

  const resp = await fetch(
    srv.cutelinkEndpoint({ url: "http://example.com/", length: 8 }),
  );

  assertEquals(resp.status, 400);
  assertEquals(
    await resp.text(),
    "length query parameter must be comprised between 1 and 7 inclusive",
  );

  srv.abort();
});

Deno.test("generate short link with a non http URL", async () => {
  const srv = await startServer();

  const resp = await fetch(
    srv.cutelinkEndpoint({ url: "ftp://example.com/", length: 4 }),
  );

  assertEquals(resp.status, 400);
  assertEquals(
    await resp.text(),
    "invalid url query parameter: Error: not an http url",
  );

  srv.abort();
});

Deno.test("generate short link with an http URL and length of 3", async () => {
  const srv = await startServer();

  const resp = await fetch(
    srv.cutelinkEndpoint({ url: "http://example.com/", length: 3 }),
  );

  assertEquals(resp.status, 200);

  const result: { url: string; shortUrl: string } = await resp.json();
  assertEquals(result.url, "http://example.com/");
  assertMatch(
    result.shortUrl,
    new RegExp(`^http://localhost:${srv.addr.port}/[0-9a-zA-Z]{3}$`),
  );
  await checkShortenedUrl(result);

  // Try a second time to check that endpoint returns same short url.
  {
    const resp = await fetch(
      srv.cutelinkEndpoint({ url: "http://example.com/", length: 3 }),
    );

    const result2 = await resp.json();
    assertEquals(result2, result);
  }

  srv.abort();
});

Deno.test("generate short link with an https URL and length of 4", async () => {
  const srv = await startServer();

  const resp = await fetch(
    srv.cutelinkEndpoint({ url: "https://example.com/", length: 4 }),
  );

  assertEquals(resp.status, 200);

  const result: { url: string; shortUrl: string } = await resp.json();
  assertEquals(result.url, "https://example.com/");
  assertMatch(
    result.shortUrl,
    new RegExp(`^http://localhost:${srv.addr.port}/[0-9a-zA-Z]{4}$`),
  );
  await checkShortenedUrl(result);

  // Try a second time to check that endpoint returns same short url.
  {
    const resp = await fetch(
      srv.cutelinkEndpoint({ url: "https://example.com/", length: 4 }),
    );

    const result2 = await resp.json();
    assertEquals(result2, result);
  }

  srv.abort();
});

Deno.test("generate short link of same url with different length", async () => {
  const srv = await startServer();

  const resp = await fetch(
    srv.cutelinkEndpoint({ url: "https://example.com/", length: 4 }),
  );

  assertEquals(resp.status, 200);

  const result: { url: string; shortUrl: string } = await resp.json();
  assertEquals(result.url, "https://example.com/");
  assertMatch(
    result.shortUrl,
    new RegExp(`^http://localhost:${srv.addr.port}/[0-9a-zA-Z]{4}$`),
  );
  await checkShortenedUrl(result);

  // Try a second time with another length
  {
    const resp = await fetch(
      srv.cutelinkEndpoint({ url: "https://example.com/", length: 3 }),
    );

    const result: { url: string; shortUrl: string } = await resp.json();
    assertEquals(result.url, "https://example.com/");
    assertMatch(
      result.shortUrl,
      new RegExp(`^http://localhost:${srv.addr.port}/[0-9a-zA-Z]{3}$`),
    );
    await checkShortenedUrl(result);
  }

  srv.abort();
});

Deno.test("generate short link of same url without specifying length", async () => {
  const srv = await startServer();

  const resp = await fetch(
    srv.cutelinkEndpoint({ url: "https://example.com/" }),
  );

  assertEquals(resp.status, 200);

  const result: { url: string; shortUrl: string } = await resp.json();
  assertEquals(result.url, "https://example.com/");
  assertMatch(
    result.shortUrl,
    new RegExp(`^http://localhost:${srv.addr.port}/[0-9a-zA-Z]{7}$`),
  );
  await checkShortenedUrl(result);

  srv.abort();
});
