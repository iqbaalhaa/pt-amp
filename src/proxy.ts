import { NextResponse, type NextRequest } from "next/server";
import { getLocaleFromPath, LOCALE_HEADER } from "@/lib/i18n";

// Pass the page locale to the root layout so /en/* renders <html lang="en">.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, getLocaleFromPath(request.nextUrl.pathname));
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/en", "/en/:path*"],
};
