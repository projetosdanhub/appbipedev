import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    "https://bipesend.com.br",
    "https://www.bipesend.com.br",
    "https://app.bipesend.com.br",
    "https://admin.bipesend.com.br",
  ];
  const isAllowedOrigin =
    allowedOrigins.includes(origin) ||
    origin.endsWith(".localhost") ||
    origin.includes("localhost") ||
    origin.endsWith(".ngrok-free.dev") ||
    origin.endsWith(".ngrok.app");
  const corsOrigin = isAllowedOrigin ? origin : "https://bipesend.com.br";

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers":
      "X-Requested-With, Content-Type, Authorization, rsc, next-router-prefetch, next-router-state-tree, next-url",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Routing hint only; the server guard validates the actual session.
  const secureTokenName = `__Secure-bipesend.tenant.session-token`;
  const insecureTokenName = `bipesend.tenant.session-token`;
  const sessionToken =
    request.cookies.get(secureTokenName)?.value ||
    request.cookies.get(insecureTokenName)?.value;

  const rawHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.host ||
    "";
  const host = rawHost.toLowerCase().split(":")[0];
  const pathname = request.nextUrl.pathname;

  const isAppDomain = host.startsWith("app.") || host.startsWith("app-");

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/onboarding");

  const isPublicPage = [
    "/landing",
    "/privacy",
    "/terms",
    "/data-deletion",
    "/politica-de-privacidade",
    "/termos",
    "/exclusao-de-dados",
    "/robots.txt",
    "/sitemap.xml",
    "/design-system",
  ].includes(pathname);

  // 1. REGRAS PARA O DOMÍNIO DO APP (app.bipesend.com.br / app.localhost)
  if (isAppDomain) {
    // Se acessa a raiz (/) e NÃO está logado -> vai direto para a tela de CADASTRO
    if (!sessionToken && pathname === "/") {
      const res = NextResponse.redirect(new URL("/register", request.url));
      Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    // Se acessa /landing no domínio do app -> redireciona para cadastro (ou home se logado)
    if (pathname === "/landing") {
      const res = NextResponse.redirect(
        new URL(sessionToken ? "/" : "/register", request.url)
      );
      Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    // Se tenta acessar qualquer tela protegida sem token -> vai para login
    if (!sessionToken && !isAuthPage && !isPublicPage) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    const res = NextResponse.next();
    if (origin) {
      Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
    }
    return res;
  }

  // 2. REGRAS PARA O DOMÍNIO PRINCIPAL DE MARKETING (bipesend.com.br / www.bipesend.com.br / localhost:3443)
  // Ao acessar bipesend.com.br (/) -> renderiza a Landing Page principal sem mudar a URL
  if (pathname === "/") {
    const landingUrl = new URL("/landing", "http://127.0.0.1:3001");
    landingUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(landingUrl);
  }

  // Se tentar acessar /login ou /register pelo domínio principal -> encaminha para o app
  if (pathname === "/login" || pathname === "/register") {
    // Se for prefetch em background do Next.js RSC (_rsc) ou fetch AJAX, retorna 204 com CORS sem redirecionar
    const isFetchRequest =
      request.url.includes("_rsc") ||
      request.nextUrl.search.includes("_rsc") ||
      request.nextUrl.searchParams.has("_rsc") ||
      request.headers.get("rsc") === "1" ||
      request.headers.get("next-router-prefetch") === "1" ||
      request.headers.get("accept")?.includes("text/x-component") ||
      Boolean(origin);

    if (isFetchRequest) {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const appHost = host.includes("localhost")
      ? `app.localhost${rawHost.includes(":") ? `:${rawHost.split(":")[1]}` : ""}`
      : "app.bipesend.com.br";
    const appProtocol = request.nextUrl.protocol || "https:";
    const appUrl = new URL(pathname, `${appProtocol}//${appHost}`);
    appUrl.search = request.nextUrl.search;
    const response = NextResponse.redirect(appUrl, 307);
    Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }

  const res = NextResponse.next();
  if (origin) {
    Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
  }
  return res;
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
