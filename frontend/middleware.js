import { NextResponse } from "next/server";

const allowedExactPaths = new Set(["/", "/coming-soon"]);

const isInternalPath = (pathname) =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/api") ||
  pathname.startsWith("/static") ||
  pathname.startsWith("/public") ||
  pathname.startsWith("/favicon.ico") ||
  pathname.startsWith("/fonts") ||
  pathname.startsWith("/images") ||
  pathname.startsWith("/manifest") ||
  pathname.startsWith("/robots.txt") ||
  pathname.startsWith("/sitemap") ||
  pathname.startsWith("/_vercel");

const isAssetRequest = (pathname) => /\.[^/]+$/.test(pathname);

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (
    allowedExactPaths.has(normalizedPath) ||
    isInternalPath(pathname) ||
    isAssetRequest(pathname)
  ) {
    return NextResponse.next();
  }

  const comingSoonURL = new URL("/coming-soon", request.url);
  return NextResponse.redirect(comingSoonURL);
}

export const config = {
  matcher: "/:path*",
};
