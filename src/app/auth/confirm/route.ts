import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/verify/success'

    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = next
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            // redirect user to specified redirect location or root
            return NextResponse.redirect(redirectTo)
        } else {
            console.error('Verification error:', error)
            // Redirect to home with the specific error from Supabase
            const errorUrl = new URL('/', request.url)
            errorUrl.searchParams.set('error', 'verification_failed')
            errorUrl.searchParams.set('error_description', error.message)
            return NextResponse.redirect(errorUrl)
        }
    }

    // return the user to an error page with some instructions
    return NextResponse.redirect(new URL('/?error=Invalid verification link', request.url))
}
