import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const token = req.cookies.get("token")?.value;

  console.log("Proxy check:", { pathname, publicRoute, hasToken: !!token });

  if (token && publicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && !publicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/", "/login", "/register"],
};
