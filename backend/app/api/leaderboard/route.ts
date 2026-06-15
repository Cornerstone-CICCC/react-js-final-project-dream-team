import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

/**
 * GET /api/leaderboard
 * Returns top players sorted by wins (ties broken by totalScore, then gamesPlayed).
 *
 * Query params:
 *   limit  — number of results to return (default 20, max 100)
 *   sortBy — "wins" | "score" (default "wins")
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10);
    const limit = Math.min(Math.max(rawLimit, 1), 100);
    const sortBy = searchParams.get("sortBy") === "score" ? "score" : "wins";

    type SortSpec = Record<string, 1 | -1>;
    const sortField: SortSpec =
      sortBy === "score"
        ? { "stats.totalScore": -1, "stats.gamesWon": -1, "stats.gamesPlayed": -1 }
        : { "stats.gamesWon": -1, "stats.totalScore": -1, "stats.gamesPlayed": -1 };

    const users = await User.find(
      { "stats.gamesPlayed": { $gt: 0 } },
      { username: 1, stats: 1 }
    )
      .sort(sortField)
      .limit(limit)
      .lean();

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      userId: u._id,
      username: u.username,
      gamesPlayed: u.stats.gamesPlayed,
      gamesWon: u.stats.gamesWon,
      totalScore: u.stats.totalScore,
      winRate:
        u.stats.gamesPlayed > 0
          ? Math.round((u.stats.gamesWon / u.stats.gamesPlayed) * 100)
          : 0,
    }));

    return NextResponse.json({ leaderboard, sortBy, limit });
  } catch (err) {
    console.error("[GET /api/leaderboard]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
