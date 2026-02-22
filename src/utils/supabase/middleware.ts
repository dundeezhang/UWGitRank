import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url' || supabaseAnonKey === 'your-anon-key') {
        console.warn('Supabase environment variables are missing or using placeholders. Auth middleware will be bypassed. Please update .env.local with your project details.')
        return supabaseResponse
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // getUser(). A simple mistake could make it very hard to debug
    // issues with users being logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl
    const isAuthCallback = pathname.startsWith('/auth/callback')
    const isAuthConfirm = pathname.startsWith('/auth/confirm')
    const isLandingPage = pathname === '/'
    const isVerifyPage = pathname.startsWith('/verify')
    const isVerifySuccess = pathname === '/verify/success'
    const isLeaderboard = pathname === '/leaderboard'
    const isProfile = pathname.startsWith('/profile')

    // Public routes that don't need any auth check
    if (isLeaderboard || isProfile || isAuthCallback || isAuthConfirm) {
        return supabaseResponse
    }

    // If not logged in and trying to access protected routes (not landing page)
    if (!user && !isLandingPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // If logged in, check verification status
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_verified')
            .eq('id', user.id)
            .single()

        const isVerified = profile?.is_verified

        // Cleanup: If verified, redirect AWAY from /verify paths (except /verify/success)
        if (isVerified && isVerifyPage && !isVerifySuccess) {
            const url = request.nextUrl.clone()
            url.pathname = '/leaderboard'
            return NextResponse.redirect(url)
        }

        // If not verified and trying to access protected routes (not landing page or verify pages)
        if (!isVerified && !isVerifyPage && !isLandingPage) {
            const url = request.nextUrl.clone()
            url.pathname = '/verify'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
