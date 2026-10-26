// Run: ./node_modules/.bin/tsx --test src/proxy.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { proxy, config } from "./proxy";

// NextResponse.next({ request: { headers } }) exposes overridden request headers this way.
const forwardedLocale = (path: string) =>
  proxy(new NextRequest(`http://localhost${path}`)).headers.get(
    "x-middleware-request-x-locale"
  );

test("proxy marks /en pages as English", () => {
  assert.equal(forwardedLocale("/en"), "en");
  assert.equal(forwardedLocale("/en/about"), "en");
});

test("proxy only runs on /en routes", () => {
  assert.deepEqual(config.matcher, ["/en", "/en/:path*"]);
  assert.equal(forwardedLocale("/about"), "id");
});
