import { Head } from "$fresh/runtime.ts";
import { HOMEPAGE_HREF_404 } from "@/utils/config.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>Error</title>
      </Head>
      <div class="px-4 py-8 mx-auto bg-yellow-200">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <img
            class="my-6"
            src="/favicon/android-chrome-512x512.png"
            width="128"
            height="128"
            alt="Smiling face with smiling eyes"
          />
          <h1 class="text-4xl font-bold text-center">
            This link or QR Code has been deactivated
          </h1>

          <p class="my-4">
            Use{" "}
            <a href={HOMEPAGE_HREF_404} className="underline font-bold">
              Cutelink
            </a>{" "}
            to create short links.
          </p>
          <a href="/" class="underline">Go back home</a>
        </div>
      </div>
    </>
  );
}
