import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/case", "/achievements"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar si la ruta requiere autenticación
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Obtener token del header o localStorage (en cliente no es posible, usar cookie)
    const authToken = request.cookies.get("authToken")?.value;

    if (!authToken) {
      // Redirigir a login si no hay token
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirigir a login si intenta acceder a / (raíz)
  if (pathname === "/") {
    const authToken = request.cookies.get("authToken")?.value;
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
