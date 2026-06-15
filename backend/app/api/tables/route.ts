import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Table } from "@/models/Table";
import { requireAuth } from "@/lib/middleware";
import { nanoid } from "nanoid";

/**
 * GET /api/tables
 * List public tables (optionally filter by maxPlayers or stakes).
 * Query params: maxPlayers=2|4, stakes=Casual Play|Competitive|High Roller, status=waiting|in-progress
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { visibility: "public" };

    const maxPlayers = searchParams.get("maxPlayers");
    if (maxPlayers) filter.maxPlayers = Number(maxPlayers);

    const stakes = searchParams.get("stakes");
    if (stakes) filter.stakes = stakes;

    const status = searchParams.get("status");
    if (status) filter.status = status;

    const tables = await Table.find(filter).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({ tables });
  } catch (err) {
    console.error("[GET /api/tables]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * POST /api/tables
 * Create a new table. Requires authentication.
 * Body: { maxPlayers?: 2|4, stakes?: StakeLevel, visibility?: "public"|"private" }
 */
export const POST = requireAuth(async (req, _ctx, session) => {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));

    const maxPlayers = [2, 4].includes(Number(body.maxPlayers)) ? Number(body.maxPlayers) : 2;
    const stakes = ["Casual Play", "Competitive", "High Roller"].includes(body.stakes)
      ? body.stakes
      : "Casual Play";
    const visibility = body.visibility === "private" ? "private" : "public";

    const tableData: Record<string, unknown> = {
      maxPlayers,
      stakes,
      visibility,
      players: [{ userId: session.userId, username: session.username }],
    };

    // Private tables get a short invite code
    if (visibility === "private") {
      tableData.inviteCode = nanoid(8);
    }

    const table = await Table.create(tableData);

    const response: Record<string, unknown> = {
      message: "Table created.",
      // roomId equals the table _id — used by the frontend to open the socket room
      roomId: table._id.toString(),
      table: {
        id: table._id,
        tableNumber: table.tableNumber,
        maxPlayers: table.maxPlayers,
        players: table.players,
        status: table.status,
        visibility: table.visibility,
        stakes: table.stakes,
      },
    };

    // Include the invite code only when creating a private table
    if (visibility === "private") {
      response.inviteCode = tableData.inviteCode;
    }

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tables]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
});
