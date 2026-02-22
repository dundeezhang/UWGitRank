import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { GraduationCap, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VerifyForm } from './verify-form'
import { signOut } from '@/app/auth/actions'

export default async function VerifyStudentPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single()

    if (profile?.is_verified) {
        return redirect('/leaderboard')
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <main className="max-w-md w-full">
                <div className="text-center mb-8 space-y-2">
                    <div className="flex justify-center mb-4 text-primary">
                        <GraduationCap className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Student Verification
                    </h1>
                    <p className="text-muted-foreground">
                        Verify your status to join the Waterloo GitHub ranking.
                    </p>
                </div>

                <Card className="border-border shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Step 2: University Email</CardTitle>
                        <CardDescription>
                            We need to confirm you are a Waterloo student. Enter your official email below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VerifyForm />
                    </CardContent>
                </Card>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Signed in as <strong>{user.user_metadata?.full_name || user.email}</strong></span>
                    </div>
                    <form action={signOut}>
                        <Button type="submit" variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <LogOut className="w-4 h-4" />
                            Use different account
                        </Button>
                    </form>
                </div>
            </main>

            <footer className="mt-auto py-8 text-sm text-muted-foreground text-center">
                Questions? Visit the <a href="#" className="underline underline-offset-2 hover:text-primary">Help Center</a>
            </footer>
        </div>
    )
}
