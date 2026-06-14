import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Table } from "@/models/Table";
import { requireAuth } from "@/lib/middleware";

type Context = { params: Promise<{ id: string }> | Record<string, string> };

/**
 * POST /api/tables/[id]/join
 * Join a public or private table. Requires authentication.
 * Body for private tables: { inviteCode: string }
 */
export const POST = requireAuth(async (req: NextRequest, context: Context, session) => {
  try {
    await connectDB();
    const { id } = await context.params;
    const table = await Table.findById(id).select("+inviteCode");

    if (!table) {
      return NextResponse.json({ error: "Table not found." }, { status: 404 });
    }
    if (table.status !== "waiting") {
      return NextResponse.json({ error: "This table is already in progress." }, { status: 409 });
    }
    if (table.players.length >= table.maxPlayers) {
      return NextResponse.json({ error: "This table is full." }, { status: 409 });
    }

    // Check player isn't already seated
    const alreadyJoined = table.players.some((p: { userId: string }) => p.userId === session.userId);
    if (alreadyJoined) {
      return NextResponse.json({ error: "You are already at this table." }, { status: 409 });
    }

    // Private table — validate invite code
    if (table.visibility === "private") {
      const { inviteCode } = await req.json().catch(() => ({}));
      if (!inviteCode || inviteCode !== table.inviteCode) {
        return NextResponse.json({ error: "Invalid invite code." }, { status: 403 });
      }
    }

    table.players.push({ userId: session.userId, username: session.username });
    await table.save();

    return NextResponse.json({
      message: "Joined table.",
      table: {
        id: table._id,
        tableNumber: table.tableNumber,
        maxPlayers: table.maxPlayers,
        players: table.players,
        status: table.status,
        stakes: table.stakes,
      },
    });
  } catch (err) {
    console.error("[POST /api/tables/[id]/join]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
});
