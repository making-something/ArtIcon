import { NextResponse } from "next/server";

const allowedExactPaths = new Set(["/", "/registration", "/dashboard", "/admin", "/admin/portfolios"]);

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

	const authToken = request.cookies.get("authToken")?.value;
	
	// Check for admin token in localStorage (handled client-side)
	// For server-side, we'll allow admin routes and let client handle auth
	const isAdminRoute = pathname.startsWith("/admin");

	// Auth Logic
	if (authToken) {
		// If logged in, redirect public pages to dashboard
		if (normalizedPath === "/" || normalizedPath === "/registration") {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	} else {
		// If not logged in, redirect protected pages to registration
		// Exception: admin routes are allowed (client-side handles auth)
		if (normalizedPath === "/dashboard" && !isAdminRoute) {
			return NextResponse.redirect(new URL("/registration", request.url));
		}
	}

	if (
		allowedExactPaths.has(normalizedPath) ||
		isInternalPath(pathname) ||
		isAssetRequest(pathname) ||
		isAdminRoute
	) {
		return NextResponse.next();
	}

	const comingSoonURL = new URL("/registration", request.url);
	return NextResponse.redirect(comingSoonURL);
}

export const config = {
	matcher: "/:path*",
};
