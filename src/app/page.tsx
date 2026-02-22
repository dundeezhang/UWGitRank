import { signOut, signInToView, signInToJoin } from './auth/actions'
import { createClient } from '@/utils/supabase/server'
import { ArrowRight, Github, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isVerified = false

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('is_verified')
      .eq('id', user.id)
      .single()

    const isWaterlooEmail = user.email?.endsWith('@uwaterloo.ca')
    if (isWaterlooEmail && data && !data.is_verified) {
      await supabase
        .from('profiles')
        .update({ is_verified: true, email: user.email })
        .eq('id', user.id)
      isVerified = true
    } else {
      isVerified = data?.is_verified ?? false
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-zinc-900 selection:bg-yellow-100 flex flex-col items-center justify-center p-6">

      {/* Top Left Branding */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
          <Github className="w-5 h-5 text-[#EAB308]" />
        </div>
        <span className="text-base font-semibold tracking-tight">GitRank</span>
      </Link>

      <main className="w-full max-w-2xl flex flex-col items-center space-y-10 text-center">

        {/* Hero */}
        <div className="space-y-5">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-none text-zinc-900">
            Waterloo<br />GitHub Rankings.
          </h1>
          <p className="text-zinc-500 text-lg">
            See where Waterloo students rank by open-source impact.
          </p>
        </div>

        {/* Actions */}
        {user ? (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button asChild size="lg" className="h-14 px-10 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 shadow-[0_0_0_3px_#EAB308] transition-all active:scale-95 text-base font-semibold">
                <Link href="/leaderboard">
                  <Trophy className="mr-2 w-5 h-5 text-[#EAB308]" />
                  View Rankings
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              {!isVerified && (
                <Button asChild size="lg" className="h-14 px-10 rounded-lg bg-[#EAB308] text-black hover:bg-[#D9A307] transition-all active:scale-95 text-base font-semibold">
                  <Link href="/verify">
                    <Users className="mr-2 w-5 h-5" />
                    Join the Rankings
                  </Link>
                </Button>
              )}
            </div>
            <form action={signOut}>
              <button className="text-xs text-zinc-400 hover:text-zinc-900 underline underline-offset-4 transition-colors">
                Sign out of {user.user_metadata.user_name}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* View Rankings — GitHub auth, no email verification required */}
            <form action={signInToView}>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 shadow-[0_0_0_3px_#EAB308] transition-all active:scale-95 text-base font-semibold flex items-center gap-2"
              >
                <Trophy className="w-5 h-5 text-[#EAB308]" />
                View Rankings
                <ArrowRight className="w-5 h-5 opacity-70" />
              </Button>
            </form>

            {/* Join — GitHub auth, then email verification */}
            <form action={signInToJoin}>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 rounded-lg bg-[#EAB308] text-black hover:bg-[#D9A307] transition-all active:scale-95 text-base font-semibold flex items-center gap-2"
              >
                <Github className="w-5 h-5" />
                Join the Rankings
              </Button>
            </form>
          </div>
        )}

        {/* Hint */}
        <p className="text-xs text-zinc-400">
          View requires GitHub · Join requires{' '}
          <span className="font-mono">@uwaterloo.ca</span> verification
        </p>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-[11px] font-mono text-zinc-400 uppercase tracking-widest font-medium">
        © UW GitRank 2026
      </footer>
    </div>
  )
}
