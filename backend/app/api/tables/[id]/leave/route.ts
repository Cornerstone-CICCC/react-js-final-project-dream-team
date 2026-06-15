import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Table } from "@/models/Table";
import { requireAuth } from "@/lib/middleware";

type Context = { params: Promise<{ id: string }> | Record<string, string> };

/**
 * POST /api/tables/[id]/leave
 * Remove the authenticated player from a waiting table.
 * - If the leaving player is the creator (first in the list) and others
 *   are seated, the next player becomes the new host.
 * - If the table becomes empty, it is deleted.
 */
export const POST = requireAuth(async (_req, context: Context, session) => {
  try {
    await connectDB();
    const { id } = await context.params;
    const table = await Table.findById(id);

    if (!table) {
      return NextResponse.json({ error: "Table not found." }, { status: 404 });
    }
    if (table.status !== "waiting") {
      return NextResponse.json(
        { error: "Cannot leave a table that is already in progress." },
        { status: 409 }
      );
    }

    const playerIndex = table.players.findIndex(
      (p: { userId: string }) => p.userId === session.userId
    );
    if (playerIndex === -1) {
      return NextResponse.json({ error: "You are not at this table." }, { status: 400 });
    }

    table.players.splice(playerIndex, 1);

    if (table.players.length === 0) {
      await table.deleteOne();
      return NextResponse.json({ message: "Left and table deleted (no players remaining)." });
    }

    await table.save();
    return NextResponse.json({
      message: "Left table.",
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
    console.error("[POST /api/tables/[id]/leave]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
});
