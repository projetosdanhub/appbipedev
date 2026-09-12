import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  
  const isAuthPage = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/register') || 
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password');

  // Se não tem token e tenta acessar página protegida (qualquer uma exceto as de auth e api)
  if (!sessionToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se já tem token e tenta acessar login/registro, joga pro dashboard (raiz)
  if (sessionToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto:
     * - api (Rotas de API / Webhooks)
     * - _next/static (Arquivos estáticos do Next)
     * - _next/image (Otimização de imagens do Next)
     * - favicon.ico (ícone)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
