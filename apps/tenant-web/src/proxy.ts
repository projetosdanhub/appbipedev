import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isSecure = process.env.NODE_ENV === "production";
  const tokenName = `${isSecure ? "__Secure-" : ""}bipesend.tenant.session-token`;
  // Routing hint only; the server guard validates the actual session.
  const sessionToken = request.cookies.get(tokenName)?.value;

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password") ||
    request.nextUrl.pathname.startsWith("/reset-password");

  // Se não tem token e tenta acessar página protegida (qualquer uma exceto as de auth e api)
  if (
    !sessionToken &&
    !isAuthPage &&
    !["/privacy", "/terms", "/robots.txt", "/design-system"].includes(
      request.nextUrl.pathname,
    )
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto:
     * - api (Rotas de API / Webhooks)
     * - _next (Arquivos do Next, static, image, data, etc)
     * - favicon.ico (ícone)
     * - Extensões de imagem comuns
     */
    "/((?!api|_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
