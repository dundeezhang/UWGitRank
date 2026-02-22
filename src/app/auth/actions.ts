'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGithub() {
    const supabase = await createClient()
    const headerList = await headers()
    const origin = headerList.get('origin')

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error(error)
        return redirect('/?error=Could not authenticate user')
    }

    return redirect(data.url)
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/')
}

export async function verifyStudentEmail(prevState: any, formData: FormData) {
    const email = formData.get('email') as string

    if (!email || !email.endsWith('@uwaterloo.ca')) {
        return { error: 'Please enter a valid @uwaterloo.ca email address' }
    }

    const headerList = await headers()
    const origin = headerList.get('origin')

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser(
        { email },
        { emailRedirectTo: `${origin}/auth/confirm?next=/verify/success` }
    )

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Verification email sent! Please check your inbox (and spam folder) to confirm.' }
}
