import { signInWithGithub, signOut } from './auth/actions'
import { createClient } from '@/utils/supabase/server'
import { Github, LogOut, CheckCircle, GraduationCap, Trophy, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error, error_description } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Auto-repair/sync: If confirmed but profile is missing or not verified
    const isWaterlooEmail = user.email?.endsWith('@uwaterloo.ca')
    if (isWaterlooEmail && (!data || !data.is_verified)) {
      if (data) {
        await supabase
          .from('profiles')
          .update({ is_verified: true, email: user.email })
          .eq('id', user.id)
      } else {
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.email?.split('@')[0],
            full_name: user.user_metadata?.full_name,
            avatar_url: user.user_metadata?.avatar_url,
            email: user.email,
            is_verified: true
          })
      }
      // Re-fetch profile after repair
      const { data: refreshedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = refreshedProfile
    } else {
      profile = data
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <main className="max-w-md w-full">
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4 text-primary">
            <GraduationCap className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Waterloo GitRank
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect your GitHub and verify your status.
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-destructive">
                  {error === 'access_denied' ? 'Verification Link Expired' :
                    error === 'verification_failed' ? 'Verification Failed' : 'Authentication Error'}
                </p>
                <p className="text-sm text-destructive/80 leading-relaxed">
                  {typeof error_description === 'string' ? error_description :
                    (error === 'access_denied'
                      ? 'The link has already been used or has expired. Please request a new verification link.'
                      : 'An error occurred during authentication. Please try again.')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!user ? (
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>
                Join the ranking of University of Waterloo developers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={signInWithGithub}>
                <Button type="submit" className="w-full gap-2 py-6 text-lg" variant="default">
                  <Github className="w-5 h-5" />
                  Join Leaderboard
                </Button>
              </form>

              <Button asChild variant="outline" className="w-full py-6 text-lg">
                <Link href="/leaderboard">
                  View Leaderboard
                </Link>
              </Button>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-center w-full text-muted-foreground">
                Public routes are read-only. Sign in to join the ranks.
              </p>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border border-border"
                />
              )}
              <div className="flex-1">
                <CardTitle className="text-lg">{user.user_metadata?.full_name || user.email}</CardTitle>
                <CardDescription>Logged in via GitHub</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-md">
                <CheckCircle className={`w-5 h-5 ${profile?.is_verified ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">
                  {profile?.is_verified ? 'Verified Waterloo Student' : 'Not Verified'}
                </span>
              </div>

              <Button asChild className="w-full gap-2">
                <Link href="/leaderboard">
                  <Trophy className="w-4 h-4" />
                  Go to Leaderboard
                </Link>
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <form action={signOut} className="w-full">
                <Button type="submit" variant="outline" className="w-full gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </form>
            </CardFooter>
          </Card>
        )}
      </main>

      <footer className="mt-auto py-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Waterloo GitRank
      </footer>
    </div>
  )
}
