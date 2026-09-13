import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/auth/callback', '/privacy']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isPublic = PUBLIC_PATHS.some(p => path.startsWith(p))

  if (!user && !isPublic) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
    const login = new URL('/login', request.url)
    login.searchParams.set('next', path)
    const redirect = NextResponse.redirect(login)
    response.cookies.getAll().forEach(c => redirect.cookies.set(c))
    return redirect
  }

  if (user && path === '/login') {
    const redirect = NextResponse.redirect(new URL('/today', request.url))
    response.cookies.getAll().forEach(c => redirect.cookies.set(c))
    return redirect
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.well-known).*)'],
}
