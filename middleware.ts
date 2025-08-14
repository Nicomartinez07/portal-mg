import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  //Le pide a las cookies si hay token 
  const token = req.cookies.get("token")?.value;

  // Si intenta entrar al login y ya está logueado → redirige al home
  if (req.nextUrl.pathname.startsWith("/login") && token) {
    try {
      
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.redirect(new URL("/garantias", req.url));
    } catch {
      // Si el token es inválido, sigue al login
    }
  }

  // Rutas que queremos proteger
  if (req.nextUrl.pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login/:path*", "/", "/garantias"] // páginas donde actúa el middleware
};

//
