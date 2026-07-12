import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("admin_token")?.value;

  // Protect admin pages (but not the login page itself)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Protect API write operations (POST/PATCH/DELETE) on wallpapers
  if (pathname.startsWith("/api/wallpapers") && !pathname.endsWith("/download")) {
    const method = req.method;
    if (method === "POST" || method === "PATCH" || method === "DELETE") {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/wallpapers/:path*"],
};
