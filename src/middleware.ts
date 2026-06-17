import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("session_token")?.value;
    const role = request.cookies.get("user_role")?.value;

    if (!token || role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next(); */
}

export const config = {
  matcher: ["/login", "/register", "/admin/:path*"],
};
