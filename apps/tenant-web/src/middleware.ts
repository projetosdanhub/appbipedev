import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isSecure = process.env.NODE_ENV === 'production';
  const tokenName = isSecure ? '__Secure-authjs.session-token' : 'authjs.session-token';
  // Try both just in case, but prioritize the environment-specific one
  const sessionToken = request.cookies.get(tokenName)?.value || request.cookies.get('authjs.session-token')?.value || request.cookies.get('__Secure-authjs.session-token')?.value;
  
  const isAuthPage = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/register') || 
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password');

  // Se não tem token e tenta acessar página protegida (qualquer uma exceto as de auth e api)
  if (!sessionToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/register', request.url));
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
     * - _next (Arquivos do Next, static, image, data, etc)
     * - favicon.ico (ícone)
     * - Extensões de imagem comuns
     */
    '/((?!api|_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
