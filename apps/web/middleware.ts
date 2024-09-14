import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TokenCookie } from "./lib/cookies";

const AUTH_PATHS = ["/login", "/register"] as const;

export async function middleware(request: NextRequest) {
  const isTokenPresent = !!TokenCookie.get();

  const isAuthPath = AUTH_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const url = request.nextUrl.clone();

  if (isTokenPresent && isAuthPath) {
    url.pathname = "/projects";
    return NextResponse.redirect(url);
  }

  if (!isTokenPresent && !isAuthPath) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
