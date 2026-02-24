import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { syncSingleUser } from '@/lib/sync-user'

const SIGNUP_PENDING_COOKIE = 'signup_pending'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_verified,first_name,last_name,program')
                    .eq('id', user.id)
                    .maybeSingle()

                const isVerified = Boolean(profile?.is_verified)

                // If user already verified and trying to sign up again, redirect with error
                if (isVerified) {
                    const cookieStore = await cookies()
                    const pendingRaw = cookieStore.get(SIGNUP_PENDING_COOKIE)?.value
                    if (pendingRaw) {
                        cookieStore.delete(SIGNUP_PENDING_COOKIE)
                        const redirectUrl = new URL(`${origin}/`)
                        redirectUrl.searchParams.set('auth_error', 'already_verified')
                        return NextResponse.redirect(redirectUrl.toString())
                    }
                }

                // Auto-verify new signups: if the cookie has a waterloo email, finalize now
                if (!isVerified) {
                    const cookieStore = await cookies()
                    const pendingRaw = cookieStore.get(SIGNUP_PENDING_COOKIE)?.value
                    if (pendingRaw) {
                        cookieStore.delete(SIGNUP_PENDING_COOKIE)
                        try {
                            const details = JSON.parse(pendingRaw) as {
                                firstName?: string
                                lastName?: string
                                program?: string
                                waterlooEmail?: string
                                linkedinUrl?: string | null
                            }
                            const email = details.waterlooEmail
                            if (email?.endsWith('@uwaterloo.ca')) {
                                const githubUsername = (user.user_metadata?.user_name || user.user_metadata?.preferred_username) as string | undefined
                                const preferredUsername = githubUsername || email.split('@')[0]

                                const profileData = {
                                    username: preferredUsername,
                                    githubUsername: githubUsername ?? undefined,
                                    fullName: user.user_metadata?.full_name as string | undefined,
                                    firstName: details.firstName ?? undefined,
                                    lastName: details.lastName ?? undefined,
                                    avatarUrl: user.user_metadata?.avatar_url as string | undefined,
                                    email,
                                    isVerified: true,
                                    program: details.program ?? undefined,
                                    linkedinUrl: details.linkedinUrl ?? undefined,
                                }

                                try {
                                    await prisma.profile.upsert({
                                        where: { id: user.id },
                                        create: { id: user.id, ...profileData },
                                        update: {
                                            isVerified: true,
                                            email,
                                            githubUsername: githubUsername ?? undefined,
                                            firstName: details.firstName ?? undefined,
                                            lastName: details.lastName ?? undefined,
                                            program: details.program ?? undefined,
                                            linkedinUrl: details.linkedinUrl ?? undefined,
                                        },
                                    })
                                } catch (err: unknown) {
                                    const prismaErr = err as { code?: string }
                                    if (prismaErr?.code === 'P2002') {
                                        const fallback = `user_${user.id.slice(0, 8)}`
                                        await prisma.profile.upsert({
                                            where: { id: user.id },
                                            create: { id: user.id, ...profileData, username: fallback },
                                            update: {
                                                isVerified: true,
                                                email,
                                                firstName: details.firstName ?? undefined,
                                                lastName: details.lastName ?? undefined,
                                                program: details.program ?? undefined,
                                                linkedinUrl: details.linkedinUrl ?? undefined,
                                            },
                                        })
                                    } else {
                                        throw err
                                    }
                                }

                                if (githubUsername) {
                                    try {
                                        await syncSingleUser(user.id, githubUsername)
                                    } catch (syncErr) {
                                        console.error('[callback] Sync failed (will catch up on next cron):', syncErr)
                                    }
                                }

                                return buildRedirect(request, origin, '/leaderboard?verified=1')
                            }
                        } catch (parseErr) {
                            console.error('[callback] Failed to parse signup cookie:', parseErr)
                        }
                    }
                }
            }

            return buildRedirect(request, origin, next)
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

function buildRedirect(request: Request, origin: string, path: string) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${path}`)
    } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${path}`)
    }
    return NextResponse.redirect(`${origin}${path}`)
}
