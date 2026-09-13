import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas (não precisam de sessão)
const PUBLIC_PATHS = ['/', '/login', '/cadastro', '/ajuda', '/ajuda2', '/api/rpc', '/api/push']

// Rotas somente para Líder
const LIDER_PATHS = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir assets e rotas públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js' ||
    pathname === '/sw-custom.js' ||
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return NextResponse.next()
  }

  // Verificar cookie de sessão
  const sessao = request.cookies.get('acamp_sessao')
  if (!sessao?.value) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Verificar acesso a rotas de admin (validação completa ocorre no servidor via Apps Script)
  // O middleware apenas redireciona se não houver sessão
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
