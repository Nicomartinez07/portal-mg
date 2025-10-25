// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 1. El tipo de payload (debe coincidir con tu función login)
interface UserPayload {
  id: string;
  username: string;
  email: string;
  companyId: number;
  role: string; // Ej: "IMPORTER, ADMIN"
}

// 2. Función para obtener y codificar el secret para 'jose'
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }
  return new TextEncoder().encode(secret);
};

const roleAccessList: Record<string, string[]> = {

  '/unauthorized': ['IMPORTER', 'WORKSHOP', 'DEALER'],

  // Rutas Específicas
  '/ordenes/borradores': ['WORKSHOP'],
  
  // Rutas Principales
  '/garantias': ['IMPORTER', 'DEALER'],
  '/ordenes': ['IMPORTER', 'WORKSHOP'],
  '/general': ['IMPORTER'],
  '/empresas': ['IMPORTER'],
  '/certificados': ['IMPORTER'],
  
  // Rutas Comunes (Todos los roles logueados pueden verlas)
  '/': ['IMPORTER', 'WORKSHOP', 'DEALER'], // Inicio
  '/repuestos': ['IMPORTER', 'WORKSHOP', 'DEALER'],
  '/archivos': ['IMPORTER', 'WORKSHOP', 'DEALER'], // Para /archivos/tarifario.xlsx
};

// 4. --- EL MIDDLEWARE PRINCIPAL ---
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 5. Define tus rutas públicas (no requieren login)
  const publicRoutes = [
    '/login',
    '/register', // Si tienes
  ];

  // 6. Obtener el token de la cookie
  const token = request.cookies.get('token')?.value;
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // --- CASO 1: No hay token ---
  if (!token) {
    if (isPublicRoute) {
      // Si es ruta pública y no hay token, déjalo pasar
      return NextResponse.next();
    }
    // Si es ruta privada y no hay token, redirige a login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectBack', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- CASO 2: Hay token, verificarlo ---
  let payload: UserPayload;
  try {
    const { payload: verifiedPayload } = await jwtVerify<UserPayload>( // <--- AÑADE <UserPayload> AQUÍ
      token,
      await getJwtSecret()
    );
    payload = verifiedPayload; // <--- ¡YA NO SE NECESITA 'as UserPayload'!
  } catch (error) {

    // Token inválido o expirado
    console.warn('[Middleware] Error de verificación de JWT:', error);
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // Limpiamos la cookie inválida para evitar bucles
    response.cookies.set('token', '', { maxAge: -1 });
    return response;
  }

  // --- CASO 3: Token válido, revisar autorización por ROL ---

  // 3a. Si está logueado e intenta ir a una ruta pública (como /login)
  if (isPublicRoute) {
    const homeUrl = new URL('/', request.url); // Redirige a "Inicio"
    return NextResponse.redirect(homeUrl);
  }

  // 3b. Obtener roles del usuario
  const userRoles = (payload.role || '').split(',').map(r => r.trim());

  // 3c. ¡El ADMIN siempre pasa!
  if (userRoles.includes('ADMIN')) {
    return NextResponse.next();
  }

  // 3d. Lógica de autorización
  
  // Encontrar la regla de ACL que coincida con la ruta actual
  const matchingRouteKey = Object.keys(roleAccessList)
                                .find(routePrefix => pathname.startsWith(routePrefix));

  if (!matchingRouteKey) {
    // Si la ruta no está en la lista (ej. /perfil que no definimos)
    // Por seguridad, lo redirigimos a Inicio.
    // Opcionalmente, puedes dejarlo pasar si quieres que rutas no definidas sean públicas.
    // Yo prefiero "denegar por defecto".
    console.warn(`[Middleware] Ruta ${pathname} no tiene regla de acceso. Redirigiendo.`);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Tenemos una regla (ej. '/garantias')
  const allowedRoles = roleAccessList[matchingRouteKey]; // ej: ['IMPORTER', 'DEALER']

  // Comprobamos si el usuario tiene AL MENOS UN rol de los permitidos
  const hasPermission = userRoles.some(userRole => allowedRoles.includes(userRole));

  if (hasPermission) {
    return NextResponse.next();
  }

  // 3e. No tiene permiso
  console.warn(`[Middleware] Usuario ${payload.username} sin permiso para ${pathname}.`);
  const unauthorizedUrl = new URL('/unauthorized', request.url); // Redirige a "No Autorizado"
  return NextResponse.redirect(unauthorizedUrl);
}

// 5. El Matcher (cuándo se ejecuta el middleware)
export const config = {
  matcher: [
    /*
     * Ejecutar el middleware en todas las rutas, EXCEPTO:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico (el ícono de la pestaña)
     * - /api/ (tus rutas de API, si no quieres protegerlas aquí)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};