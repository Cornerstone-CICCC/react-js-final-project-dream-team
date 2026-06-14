import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Table } from "@/models/Table";
import { User } from "@/models/User";

/**
 * GET /api/stats
 * Returns live lobby stats shown on the Match Looker screen:
 *   - livePlayers: users currently seated at a table (in-progress)
 *   - activeTables: tables that are currently in-progress
 *
 * This endpoint is intentionally public (no auth required) so the
 * landing / lobby page can display them before login.
 */
export async function GET() {
  try {
    await connectDB();

    const [activeTables, totalUsers] = await Promise.all([
      Table.countDocuments({ status: "in-progress" }),
      User.countDocuments(),
    ]);

    // Count players currently seated at in-progress tables
    const inProgressTables = await Table.find({ status: "in-progress" }, { players: 1 });
    const livePlayers = inProgressTables.reduce(
      (sum: number, t: { players: unknown[] }) => sum + t.players.length,
      0
    );

    return NextResponse.json({ livePlayers, activeTables, totalUsers });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
