import { createClient } from '@/utils/supabase/server'
import { Trophy, Github, Star, GitCommit, Link as LinkIcon, BadgeCheck, ShieldX, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: { username: string } }) {
    const { username } = await params
    const supabase = await createClient()

    // Mock data
    const profile = {
        username: username,
        full_name: username.charAt(0).toUpperCase() + username.slice(1),
        bio: 'Software Engineering @ University of Waterloo',
        stars: 1200,
        commits: 450,
        followers: 85,
        is_verified: true,
        avatar_url: `https://github.com/${username}.png`
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/leaderboard" className="font-bold text-xl tracking-tight flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-primary" />
                        <span>GitRank</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-card shadow-xl"
                    />

                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="space-y-1">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h1 className="text-4xl font-bold">{profile.full_name}</h1>
                                {profile.is_verified ? (
                                    <BadgeCheck className="w-8 h-8 text-primary shadow-sm" />
                                ) : (
                                    <ShieldX className="w-8 h-8 text-muted-foreground opacity-50" />
                                )}
                            </div>
                            <p className="text-xl text-muted-foreground">@{profile.username}</p>
                        </div>

                        <p className="text-lg max-w-2xl leading-relaxed">{profile.bio}</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <Button asChild variant="outline" size="sm">
                                <a href={`https://github.com/${profile.username}`} target="_blank" rel="noreferrer" className="gap-2">
                                    <Github className="w-4 h-4" />
                                    GitHub Profile
                                    <LinkIcon className="w-3 h-3 opacity-50" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Total Stars
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold">{profile.stars.toLocaleString()}</span>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <GitCommit className="w-4 h-4" />
                                Contributions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold">{profile.commits.toLocaleString()}</span>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Followers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold">{profile.followers.toLocaleString()}</span>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
