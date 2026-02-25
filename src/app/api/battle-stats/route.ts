import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username')
    const timelineOnly = request.nextUrl.searchParams.get('timelineOnly') === 'true'
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    if (!username) {
      return NextResponse.json({ error: 'username required' }, { status: 400 })
    }

    // Get user by username
    const user = await prisma.profile.findUnique({
      where: { username },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.id

    // If timeline only, fetch minimal data for all matches
    if (timelineOnly) {
      const allMatches = await prisma.eloMatch.findMany({
        where: {
          OR: [{ winnerId: userId }, { loserId: userId }],
        },
        select: {
          id: true,
          winnerId: true,
          loserId: true,
          winnerEloAfter: true,
          loserEloAfter: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        userId,
        matches: allMatches,
      })
    }

    // Fetch all matches for stats calculation
    const allMatches = await prisma.eloMatch.findMany({
      where: {
        OR: [{ winnerId: userId }, { loserId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate stats
    let totalBattles = 0
    let wins = 0
    let losses = 0
    let totalEloGained = 0
    let totalEloLost = 0
    let maxEloGain = 0
    let maxEloLoss = 0

    for (const match of allMatches) {
      totalBattles++

      if (match.winnerId === userId) {
        wins++
        const eloDelta = match.winnerEloAfter - match.winnerEloBefore
        totalEloGained += eloDelta
        maxEloGain = Math.max(maxEloGain, eloDelta)
      } else {
        losses++
        const eloDelta = match.loserEloAfter - match.loserEloBefore
        totalEloLost += Math.abs(eloDelta)
        maxEloLoss = Math.max(maxEloLoss, Math.abs(eloDelta))
      }
    }

    // Fetch paginated matches with full details for battle log
    const paginatedMatches = await prisma.eloMatch.findMany({
      where: {
        OR: [{ winnerId: userId }, { loserId: userId }],
      },
      include: {
        winner: { select: { username: true, avatarUrl: true } },
        loser: { select: { username: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    })

    return NextResponse.json({
      totalBattles,
      wins,
      losses,
      totalEloGained,
      totalEloLost,
      maxEloGain,
      maxEloLoss,
      matches: paginatedMatches,
      totalMatchCount: allMatches.length,
      hasMore: offset + limit < allMatches.length,
    })
  } catch (error) {
    console.error('[battle-stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch battle stats' },
      { status: 500 }
    )
  }
}
