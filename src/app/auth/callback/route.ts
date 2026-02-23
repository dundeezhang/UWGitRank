import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Login path: only allow users with completed signup fields and verified profile.
            if (next.startsWith('/leaderboard')) {
                const { data: userData } = await supabase.auth.getUser()
                const user = userData.user

                let isRegistered = false
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_verified,first_name,last_name,program')
                        .eq('id', user.id)
                        .maybeSingle()

                    const hasSignupFields = Boolean(
                        profile?.first_name?.trim() &&
                        profile?.last_name?.trim() &&
                        profile?.program?.trim()
                    )
                    const isVerified = Boolean(profile?.is_verified)
                    isRegistered = hasSignupFields && isVerified
                }

                if (!isRegistered) {
                    const redirectUrl = new URL(`${origin}/`)
                    redirectUrl.searchParams.set('auth_error', 'signup_required')
                    return NextResponse.redirect(redirectUrl.toString())
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // Health check or proxy
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that origin is the right address for local development
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
