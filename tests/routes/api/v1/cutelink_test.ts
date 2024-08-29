import { start } from "$fresh/server.ts";
import manifest from "@/fresh.gen.ts";
import config from "@/fresh.config.ts";

Deno.test("generate short link with length of 0", async () => {
  await start(manifest, config);
  console.log("foo");
});
