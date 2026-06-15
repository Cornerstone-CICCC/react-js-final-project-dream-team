import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Table } from "@/models/Table";
import { requireAuth } from "@/lib/middleware";
import type { StakeLevel } from "@/models/Table";

/**
 * POST /api/tables/quick-match
 * Finds the best available waiting table for the authenticated user.
 * If no suitable table exists, creates one automatically.
 *
 * Body (all optional):
 *   maxPlayers — 2 | 4            (default: 2)
 *   stakes     — StakeLevel string (default: "Casual Play")
 */
export const POST = requireAuth(async (req: NextRequest, _ctx, session) => {
  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const maxPlayers = [2, 4].includes(Number(body.maxPlayers))
      ? Number(body.maxPlayers)
      : 2;
    const stakes: StakeLevel = ["Casual Play", "Competitive", "High Roller"].includes(
      body.stakes
    )
      ? (body.stakes as StakeLevel)
      : "Casual Play";

    // Find a public waiting table that:
    //   1. Matches the requested player count and stakes
    //   2. Has at least one open seat
    //   3. The user isn't already seated at
    const tables = await Table.find({
      visibility: "public",
      status: "waiting",
      maxPlayers,
      stakes,
    })
      .sort({ createdAt: 1 }) // join oldest first so games fill up faster
      .limit(20)
      .lean();

    const available = tables.find(
      (t) =>
        t.players.length < t.maxPlayers &&
        !t.players.some((p: { userId: string }) => p.userId === session.userId)
    );

    if (available) {
      // Join the existing table
      const table = await Table.findByIdAndUpdate(
        available._id,
        { $push: { players: { userId: session.userId, username: session.username } } },
        { new: true }
      );

      return NextResponse.json({
        message: "Matched to an existing table.",
        roomId: table!._id.toString(),
        table: {
          id: table!._id,
          tableNumber: table!.tableNumber,
          maxPlayers: table!.maxPlayers,
          players: table!.players,
          status: table!.status,
          stakes: table!.stakes,
        },
      });
    }

    // No suitable table found — create one and become the host
    const newTable = await Table.create({
      maxPlayers,
      stakes,
      visibility: "public",
      players: [{ userId: session.userId, username: session.username }],
    });

    return NextResponse.json(
      {
        message: "No table found — created a new one for you.",
        roomId: newTable._id.toString(),
        table: {
          id: newTable._id,
          tableNumber: newTable.tableNumber,
          maxPlayers: newTable.maxPlayers,
          players: newTable.players,
          status: newTable.status,
          stakes: newTable.stakes,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/tables/quick-match]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
});
