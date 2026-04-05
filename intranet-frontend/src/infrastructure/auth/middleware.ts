import { apiRateLimiter, authRateLimiter } from '@/infrastructure/security/rateLimiter';
import { securityHeaders } from '@/infrastructure/security/securityHeaders';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Aplicar headers de segurança
    const response = securityHeaders(req);

    // Aplicar rate limiting baseado na rota
    if (req.nextUrl.pathname.startsWith('/api/auth')) {
      const rateLimitResponse = authRateLimiter(req);
      if (rateLimitResponse.status === 429) {
        return rateLimitResponse;
      }
    } else if (req.nextUrl.pathname.startsWith('/api/')) {
      const rateLimitResponse = apiRateLimiter(req);
      if (rateLimitResponse.status === 429) {
        return rateLimitResponse;
      }
    }

    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');

    // Se não está autenticado e não está na página de login, redireciona para login
    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Se está autenticado e está na página de login, redireciona para home
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/home', req.url));
    }

    // Verificar permissões baseadas em role
    const userRole = token?.role;
    const path = req.nextUrl.pathname;

    // Rotas que requerem role admin
    const adminRoutes = ['/settings', '/admin'];
    if (adminRoutes.some((route) => path.startsWith(route)) && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/home', req.url));
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
