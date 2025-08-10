import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Note: Backend cookies are set on hackops.onrender.com and are not visible on Vercel.
  // We gate using a lightweight front-end cookie set after successful login.
  const hasAuth = req.cookies.get("fe-auth")?.value === '1';
  const url = req.nextUrl.clone();

  // Protect dashboard and its subroutes
  if (url.pathname.startsWith("/dashboard")) {
    if (!hasAuth) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
