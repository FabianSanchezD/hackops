import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  const url = req.nextUrl.clone();

  // Protect dashboard and its subroutes
  if (url.pathname.startsWith("/dashboard")) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
