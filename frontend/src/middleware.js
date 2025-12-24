// import { NextResponse } from "next/server";

// const isInternalPath = (pathname) =>
// 	pathname.startsWith("/_next") ||
// 	pathname.startsWith("/api") ||
// 	pathname.startsWith("/static") ||
// 	pathname.startsWith("/public") ||
// 	pathname.startsWith("/favicon.ico") ||
// 	pathname.startsWith("/fonts") ||
// 	pathname.startsWith("/images") ||
// 	pathname.startsWith("/manifest") ||
// 	pathname.startsWith("/robots.txt") ||
// 	pathname.startsWith("/sitemap") ||
// 	pathname.startsWith("/_vercel");

// const isAssetRequest = (pathname) => /\.[^/]+$/.test(pathname);

// export function middleware(request) {
// 	const { pathname } = request.nextUrl;
// 	const normalizedPath = pathname.replace(/\/+$/, "") || "/";

	if (normalizedPath === "/winner" || isInternalPath(pathname) || isAssetRequest(pathname)) {
		return NextResponse.next();
	}

// 	return NextResponse.redirect(new URL("/winner", request.url));
// }

// export const config = {
// 	matcher: "/:path*",
// };
