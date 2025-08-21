import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Importamos jwtVerify de jose

export function middleware(req: NextRequest) {
  // Le pide a las cookies si hay token
  const token = req.cookies.get("token")?.value;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  // Si intenta entrar al login y ya está logueado → redirige al home
  if (req.nextUrl.pathname.startsWith("/login") && token) {
    try {
      // Usamos jwtVerify de jose
      jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/", req.url));
    } catch (err: any) {
      console.error("Error al verificar token:", err.message);
      // Si es inválido o expirado, sigue al login
    }
  }

  // Rutas que queremos proteger
  if (req.nextUrl.pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      // Usamos jwtVerify de jose
      jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// Configuración del middleware
export const config = {
  matcher: ["/login/:path*", "/", "/ordenes"], // páginas donde actúa el middleware
};
